export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, social_handle, sport, partner_type, message, url: honeypot, form_loaded_at } = body;

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 🪤 Honeypot check — bots fill in hidden fields, real humans don't see them
    if (honeypot && honeypot.trim() !== '') {
      // Silently succeed so bots think they got through
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ⏱ Timing check — bots submit instantly, real humans take at least 3 seconds
    if (form_loaded_at) {
      const elapsed = Date.now() - parseInt(form_loaded_at, 10);
      if (elapsed < 3000) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const firstName = name.split(' ')[0];
    const lastName = name.split(' ').slice(1).join(' ');
    const klaviyoKey = import.meta.env.KLAVIYO_PRIVATE_KEY || 'pk_TYfncY_9f43fa7f9f876e4fd1eb52fd60459763e8';
    const klaviyoHeaders = {
      'Authorization': `Klaviyo-API-Key ${klaviyoKey}`,
      'Content-Type': 'application/json',
      'revision': '2024-10-15',
    };

    // 1. Create/update the profile with all form data
    const profileRes = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers: klaviyoHeaders,
      body: JSON.stringify({
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
      }),
    });

    let profileId: string | null = null;
    if (profileRes.status === 201) {
      const pd = await profileRes.json();
      profileId = pd?.data?.id ?? null;
    } else if (profileRes.status === 409) {
      const pd = await profileRes.json();
      profileId = pd?.errors?.[0]?.meta?.duplicate_profile_id ?? null;
    }

    // 2. Subscribe to Brand Partner Applications list — triggers the Klaviyo flow
    // bulk-create-jobs only accepts email; profile properties already stored in step 1
    await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/', {
      method: 'POST',
      headers: klaviyoHeaders,
      body: JSON.stringify({
        data: {
          type: 'profile-subscription-bulk-create-job',
          attributes: {
            custom_source: 'Brand Partner Program',
            profiles: {
              data: [{ type: 'profile', attributes: { email } }],
            },
          },
          relationships: {
            list: { data: { type: 'list', id: 'UwYEZd' } },
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
