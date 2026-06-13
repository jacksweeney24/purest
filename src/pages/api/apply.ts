import type { APIRoute } from 'astro';

export const prerender = false;

const PAM_CHAT_ID = '7600577677';
const TELEGRAM_BOT_TOKEN = import.meta.env.TELEGRAM_BOT_TOKEN;
const KLAVIYO_PRIVATE_KEY = import.meta.env.KLAVIYO_PRIVATE_KEY;

// Klaviyo list IDs for applicants (will be created on first use)
const PARTNER_LIST_NAME = 'Affiliate Applications'; // Pam is renaming this in Klaviyo

async function klaviyoHeaders() {
  return {
    'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
    'revision': '2024-07-15',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

async function findOrCreateList(name: string): Promise<string | null> {
  try {
    const headers = await klaviyoHeaders();

    // Search for existing list
    const searchRes = await fetch(
      `https://a.klaviyo.com/api/lists/?filter=equals(name,"${encodeURIComponent(name)}")`,
      { headers }
    );
    const searchData = await searchRes.json();
    if (searchData.data?.length > 0) {
      return searchData.data[0].id;
    }

    // Create the list if it doesn't exist
    const createRes = await fetch('https://a.klaviyo.com/api/lists/', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: { type: 'list', attributes: { name } }
      })
    });
    const createData = await createRes.json();
    return createData.data?.id || null;
  } catch (err) {
    console.error('Klaviyo list error:', err);
    return null;
  }
}

async function createOrUpdateProfile(attrs: Record<string, any>): Promise<string | null> {
  try {
    const headers = await klaviyoHeaders();
    const res = await fetch('https://a.klaviyo.com/api/profiles/', {
      method: 'POST',
      headers,
      body: JSON.stringify({ data: { type: 'profile', attributes: attrs } })
    });

    if (res.status === 409) {
      const conflictData = await res.json();
      return conflictData.errors?.[0]?.meta?.duplicate_profile_id || null;
    }

    const data = await res.json();
    return data.data?.id || null;
  } catch (err) {
    console.error('Klaviyo profile error:', err);
    return null;
  }
}

async function subscribeToList(profileId: string, listId: string) {
  try {
    const headers = await klaviyoHeaders();
    await fetch(`https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: [{ type: 'profile', id: profileId }]
      })
    });
  } catch (err) {
    console.error('Klaviyo subscribe error:', err);
  }
}

async function trackEvent(profileId: string, eventName: string, properties: Record<string, any>) {
  try {
    const headers = await klaviyoHeaders();
    await fetch('https://a.klaviyo.com/api/events/', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          type: 'event',
          attributes: {
            profile: { data: { type: 'profile', id: profileId } },
            metric: { data: { type: 'metric', attributes: { name: eventName } } },
            properties,
            time: new Date().toISOString(),
          }
        }
      })
    });
  } catch (err) {
    console.error('Klaviyo event error:', err);
  }
}

async function sendTelegramNotification(appLabel: string, name: string, email: string, social_handle: string, sport: string, message: string) {
  if (!TELEGRAM_BOT_TOKEN) return;

  const submitted = new Date().toLocaleString('en-US', {
    timeZone: 'America/Denver',
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const text = [
    `🙌 *${appLabel}*`,
    ``,
    `👤 *${name}*`,
    `📧 ${email}`,
    social_handle ? `📱 ${social_handle}` : null,
    sport ? `🏃 ${sport}` : null,
    message ? `\n💬 _"${message}"_` : null,
    ``,
    `🕐 ${submitted} MT`,
  ].filter(Boolean).join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: PAM_CHAT_ID,
        text,
        parse_mode: 'Markdown',
      }),
    });
  } catch (err) {
    console.error('Telegram notification error:', err);
  }
}

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

  const typeLabel = application_type === 'athlete_council' ? 'Athlete Council'
    : application_type === 'both' ? 'Affiliate + Athlete Council'
    : 'Affiliate';
  const appLabel = `New Partner Application — ${typeLabel}`;
  const listName = PARTNER_LIST_NAME;
  const eventName = 'Partner Application Submitted';

  const firstName = name.split(' ')[0];
  const lastName = name.split(' ').slice(1).join(' ');

  // Run in parallel — don't block on any of these
  const tasks: Promise<any>[] = [];

  if (KLAVIYO_PRIVATE_KEY) {
    tasks.push(
      (async () => {
        const [listId, profileId] = await Promise.all([
          findOrCreateList(listName),
          createOrUpdateProfile({
            email,
            first_name: firstName,
            last_name: lastName,
            properties: {
              social_handle: social_handle || '',
              application_type,
              application_message: message || '',
              sport: sport || '',
            }
          })
        ]);

        if (profileId) {
          const followUps: Promise<any>[] = [
            trackEvent(profileId, eventName, {
              name, email,
              social_handle: social_handle || '',
              message: message || '',
              sport: sport || '',
              application_type,
            })
          ];
          if (listId) followUps.push(subscribeToList(profileId, listId));
          await Promise.all(followUps);
        }
      })()
    );
  }

  tasks.push(
    sendTelegramNotification(appLabel, name, email, social_handle || '', sport || '', message || '')
  );

  await Promise.allSettled(tasks);

  return new Response(JSON.stringify({ success: true }), { status: 200, headers });
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
