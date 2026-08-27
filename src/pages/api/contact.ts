export const prerender = false;

import type { APIRoute } from 'astro';

const DEFAULT_NOTIFICATION_CHAT_ID = '7600577677';
const DEFAULT_CONTACT_EMAIL = 'hydrate@purestelectrolyte.com';
const DEFAULT_FROM_EMAIL = 'Purest Website <website@purestelectrolyte.com>';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactMessage = {
  name: string;
  email: string;
  orderNumber: string;
  message: string;
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

async function sendEmailNotification(
  contact: ContactMessage,
  apiKey: string,
  to: string,
  from: string,
) {
  const subject = contact.orderNumber
    ? `Website contact from ${contact.name} — order ${contact.orderNumber}`
    : `Website contact from ${contact.name}`;

  const message = [
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    contact.orderNumber ? `Order: ${contact.orderNumber}` : null,
    '',
    contact.message,
  ].filter((line) => line !== null).join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: contact.email,
      subject,
      text: message,
    }),
  });

  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return true;
}

async function sendTelegramNotification(contact: ContactMessage, botToken: string, chatId: string) {
  const submitted = new Date().toLocaleString('en-US', {
    timeZone: 'America/Denver',
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const notification = [
    'New website contact message',
    '',
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    contact.orderNumber ? `Order: ${contact.orderNumber}` : null,
    '',
    contact.message,
    '',
    `Submitted: ${submitted} MT`,
  ].filter((line) => line !== null).join('\n');

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: notification }),
  });

  if (!response.ok) throw new Error(`Telegram returned ${response.status}`);
  return true;
}

async function recordKlaviyoContact(contact: ContactMessage, privateKey: string) {
  const headers = {
    'Authorization': `Klaviyo-API-Key ${privateKey}`,
    'Content-Type': 'application/json',
    'revision': '2024-10-15',
  };

  const nameParts = contact.name.split(/\s+/);
  const profileResponse = await fetch('https://a.klaviyo.com/api/profiles/', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      data: {
        type: 'profile',
        attributes: {
          email: contact.email,
          first_name: nameParts[0],
          last_name: nameParts.slice(1).join(' '),
          properties: { last_contact_source: 'website-contact-form' },
        },
      },
    }),
  });

  const profileData = await profileResponse.json().catch(() => ({}));
  const profileId = profileResponse.ok
    ? profileData?.data?.id
    : profileResponse.status === 409
      ? profileData?.errors?.[0]?.meta?.duplicate_profile_id
      : null;

  if (!profileId) throw new Error(`Klaviyo profile returned ${profileResponse.status}`);

  const eventResponse = await fetch('https://a.klaviyo.com/api/events/', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      data: {
        type: 'event',
        attributes: {
          profile: { data: { type: 'profile', id: profileId } },
          metric: {
            data: {
              type: 'metric',
              attributes: { name: 'Website Contact Form Submitted' },
            },
          },
          properties: {
            name: contact.name,
            email: contact.email,
            order_number: contact.orderNumber,
            message: contact.message,
            source: 'website-contact-form',
          },
          time: new Date().toISOString(),
        },
      },
    }),
  });

  if (!eventResponse.ok) throw new Error(`Klaviyo event returned ${eventResponse.status}`);
  return true;
}

export const POST: APIRoute = async ({ request }) => {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 20_000) {
    return jsonResponse(413, { success: false, error: 'Message is too large' });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: 'Invalid request' });
  }

  if (cleanText(body.website, 200)) {
    return jsonResponse(200, { success: true });
  }

  const loadedAt = Number(cleanText(body.form_loaded_at, 30));
  if (loadedAt && Date.now() - loadedAt >= 0 && Date.now() - loadedAt < 1_200) {
    return jsonResponse(200, { success: true });
  }

  const contact: ContactMessage = {
    name: cleanText(body.name, 120),
    email: cleanText(body.email, 254),
    orderNumber: cleanText(body.order_number, 80),
    message: cleanText(body.message, 5_000),
  };

  if (!contact.name || !EMAIL_PATTERN.test(contact.email) || !contact.message) {
    return jsonResponse(400, { success: false, error: 'Please complete all required fields' });
  }

  const botToken = import.meta.env.TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.NOTIFICATION_CHAT_ID || DEFAULT_NOTIFICATION_CHAT_ID;
  const klaviyoKey = import.meta.env.KLAVIYO_PRIVATE_KEY;
  const resendApiKey = import.meta.env.RESEND_API_KEY;
  const contactEmail = import.meta.env.CONTACT_TO_EMAIL || DEFAULT_CONTACT_EMAIL;
  const fromEmail = import.meta.env.CONTACT_FROM_EMAIL || DEFAULT_FROM_EMAIL;

  if (!resendApiKey) {
    console.error('[contact] RESEND_API_KEY is not configured.');
    return jsonResponse(503, { success: false, error: 'Contact form is temporarily unavailable' });
  }

  const deliveries: Array<{ channel: string; promise: Promise<boolean> }> = [
    {
      channel: 'email',
      promise: sendEmailNotification(contact, resendApiKey, contactEmail, fromEmail),
    },
  ];

  if (botToken) {
    deliveries.push({
      channel: 'telegram',
      promise: sendTelegramNotification(contact, botToken, chatId),
    });
  }
  if (klaviyoKey) {
    deliveries.push({
      channel: 'klaviyo',
      promise: recordKlaviyoContact(contact, klaviyoKey),
    });
  }

  const outcomes = await Promise.allSettled(deliveries.map(({ promise }) => promise));
  outcomes.forEach((outcome, index) => {
    if (outcome.status === 'rejected') {
      console.error(`[contact] ${deliveries[index].channel} delivery failed:`, String(outcome.reason));
    }
  });

  const emailOutcome = outcomes[0];
  if (emailOutcome.status !== 'fulfilled' || !emailOutcome.value) {
    return jsonResponse(502, { success: false, error: 'Message could not be delivered' });
  }

  return jsonResponse(200, { success: true });
};
