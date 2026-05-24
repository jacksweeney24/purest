import type { APIRoute } from 'astro';

export const prerender = false;

const PAM_EMAIL = 'hydrate@purestelectrolyte.com';
const FROM_EMAIL = 'Purest Electrolyte <noreply@purestelectrolyte.com>';

export const POST: APIRoute = async ({ request }) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  const { name, email, social_handle, message, sport, application_type } = body || {};

  if (!name || !email || !application_type) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers });
  }

  const appLabel = application_type === 'affiliate' ? 'Affiliate Application' : 'Athlete Council Application';
  const submitted = new Date().toLocaleString('en-US', {
    timeZone: 'America/Denver',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const htmlBody = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; color: #1a1a1a;">
      <h2 style="margin-top: 0; font-size: 22px;">🏅 New ${appLabel}</h2>
      <p style="color: #555; font-size: 14px;">Submitted ${submitted} (Mountain Time)</p>
      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />

      <table style="width: 100%; border-collapse: collapse; font-size: 15px; line-height: 1.8;">
        <tr>
          <td style="padding: 6px 0; font-weight: bold; width: 160px; color: #555;">Name</td>
          <td style="padding: 6px 0;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555;">Email</td>
          <td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #1a1a1a;">${email}</a></td>
        </tr>
        ${sport ? `
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555;">Sport / Activity</td>
          <td style="padding: 6px 0;">${sport}</td>
        </tr>` : ''}
        ${social_handle ? `
        <tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555;">Social Handle</td>
          <td style="padding: 6px 0;">${social_handle}</td>
        </tr>` : ''}
      </table>

      ${message ? `
      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
      <h3 style="font-size: 15px; margin-bottom: 8px;">Their message:</h3>
      <p style="font-size: 15px; line-height: 1.7; background: #f9f9f9; padding: 16px; border-radius: 6px; margin: 0;">${message.replace(/\n/g, '<br/>')}</p>
      ` : ''}

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />
      <p style="font-size: 13px; color: #888;">Reply directly to this email to reach the applicant.</p>
    </div>
  `;

  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured in Vercel environment variables.');
    // Still show success to the visitor — don't expose backend errors
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  }

  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [PAM_EMAIL],
        reply_to: email,
        subject: `New ${appLabel} — ${name}`,
        html: htmlBody,
      }),
    });

    const result = await emailRes.json();

    if (!emailRes.ok) {
      console.error('Resend API error:', result);
      return new Response(JSON.stringify({ error: 'Email delivery failed' }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (err) {
    console.error('Application submit error:', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers });
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
