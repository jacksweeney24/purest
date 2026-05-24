// Vercel serverless function — handles affiliate + athlete council applications
// Adds profile to Klaviyo list (server-side, bypasses double opt-in)
// Then tracks a custom event against Pam's profile so she gets notified

const KLAVIYO_KEY = process.env.KLAVIYO_PRIVATE_KEY;
const COMPANY_ID = 'TYfncY';
const PAM_EMAIL = 'hydrate@purestelectrolyte.com';

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

  const firstName = name.split(' ')[0];
  const lastName = name.split(' ').slice(1).join(' ');
  const listId = application_type === 'affiliate' ? 'UwYEZd' : 'Xka8K8';
  const appLabel = application_type === 'affiliate' ? 'Affiliate Application' : 'Athlete Council Application';

  try {
    // 1. Upsert profile in Klaviyo with all application details
    const profileRes = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_KEY}`,
        'revision': '2024-10-15',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email,
            first_name: firstName,
            last_name: lastName,
            properties: {
              application_type,
              social_handle: social_handle || '',
              sport: sport || '',
              application_message: message || '',
              application_date: new Date().toISOString().split('T')[0]
            }
          }
        }
      })
    });

    let profileId;
    const profileData = await profileRes.json();
    if (profileRes.status === 201) {
      profileId = profileData.data.id;
    } else if (profileRes.status === 409) {
      // Profile already exists — extract ID from conflict response
      profileId = profileData.errors?.[0]?.meta?.duplicate_profile_id;
    }

    // 2. Add profile to the correct list
    if (profileId) {
      await fetch(`https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`, {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${KLAVIYO_KEY}`,
          'revision': '2024-10-15',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          data: [{ type: 'profile', id: profileId }]
        })
      });
    }

    // 3. Send Pam a notification email via Klaviyo Events on her profile
    await fetch(`https://a.klaviyo.com/api/events/`, {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${KLAVIYO_KEY}`,
        'revision': '2024-10-15',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          type: 'event',
          attributes: {
            metric: {
              data: {
                type: 'metric',
                attributes: { name: 'New Application Received' }
              }
            },
            profile: {
              data: {
                type: 'profile',
                attributes: { email: PAM_EMAIL }
              }
            },
            properties: {
              application_type: appLabel,
              applicant_name: name,
              applicant_email: email,
              social_handle: social_handle || 'N/A',
              sport: sport || 'N/A',
              message: message || '',
              submitted: new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })
            }
          }
        }
      })
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Application submit error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
