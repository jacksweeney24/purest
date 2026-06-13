export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, social_handle, sport, partner_type, message } = body;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const firstName = name.split(' ')[0];
    const lastName = name.split(' ').slice(1).join(' ');

    // 1. Add to Klaviyo Affiliate Applications list
    const companyId = 'TYfncY';
    const klaviyoRes = await fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${companyId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'revision': '2024-10-15',
      },
      body: JSON.stringify({
        data: {
          type: 'subscription',
          attributes: {
            custom_source: 'Brand Partner Program',
            profile: {
              data: {
                type: 'profile',
                attributes: {
                  email,
                  first_name: firstName,
                  last_name: lastName,
                  properties: {
                    social_handle,
                    sport,
                    partner_type,
                    application_message: message,
                    source: 'brand-partner-application',
                  },
                },
              },
            },
          },
          relationships: {
            list: {
              data: { type: 'list', id: 'UwYEZd' },
            },
          },
        },
      }),
    });

    // 2. Notify Pam via Telegram
    const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;
    const chatId = import.meta.env.NOTIFICATION_CHAT_ID || '7600577677';

    if (botToken) {
      const notifText =
        `🎉 New Brand Partner Application!\n\n` +
        `👤 ${name}\n` +
        `📧 ${email}\n` +
        `📱 ${social_handle || 'No handle given'}\n` +
        `🏃 ${sport || 'Sport not specified'}\n` +
        `🤝 Type: ${partner_type}\n\n` +
        `💬 "${message}"`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: notifText,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Partner application error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
