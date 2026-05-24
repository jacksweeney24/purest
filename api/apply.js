// Vercel serverless function — handles athlete council & affiliate applications
// Sends a direct email to Pam at hydrate@purestelectrolyte.com via Resend

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const PAM_EMAIL = 'hydrate@purestelectrolyte.com';
const FROM_EMAIL = 'Purest Electrolyte <noreply@purestelectrolyte.com>';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, social_handle, message, sport, application_type } = req.body || {};

  if (!name || !email || !application_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const appLabel = application_type === 'affiliate' ? 'Affiliate Application' : 'Athlete Council Application';
  const submitted = new Date().toLocaleString('en-US', {
    timeZone: 'America/Denver',
    dateStyle: 'full',
    timeStyle: 'short'
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
      <p style="font-size: 13px; color: #888;">Reply directly to this email to reach the applicant — just hit Reply.</p>
    </div>
  `;

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    // Still return success to the visitor (don't show backend errors)
    return res.status(200).json({ success: true, warning: 'email_not_configured' });
  }

  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [PAM_EMAIL],
        reply_to: email,
        subject: `New ${appLabel} — ${name}`,
        html: htmlBody
      })
    });

    const result = await emailRes.json();

    if (!emailRes.ok) {
      console.error('Resend error:', result);
      return res.status(500).json({ error: 'Email delivery failed' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Application submit error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
