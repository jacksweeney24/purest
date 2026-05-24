import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

const PAM_EMAIL = 'hydrate@purestelectrolyte.com';

export const POST: APIRoute = async ({ request }) => {
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
        ${sport ? `<tr>
          <td style="padding: 6px 0; font-weight: bold; color: #555;">Sport / Activity</td>
          <td style="padding: 6px 0;">${sport}</td>
        </tr>` : ''}
        ${social_handle ? `<tr>
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
      <p style="font-size: 13px; color: #888;">Hit Reply to respond directly to the applicant.</p>
    </div>
  `;

  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

  if (!GMAIL_APP_PASSWORD) {
    console.error('GMAIL_APP_PASSWORD not set in Vercel environment variables.');
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: PAM_EMAIL,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Purest Athlete Council" <${PAM_EMAIL}>`,
      to: PAM_EMAIL,
      replyTo: email,
      subject: `New ${appLabel} — ${name}`,
      html: htmlBody,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (err) {
    console.error('Email send error:', err);
    return new Response(JSON.stringify({ error: 'Email delivery failed' }), { status: 500, headers });
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
