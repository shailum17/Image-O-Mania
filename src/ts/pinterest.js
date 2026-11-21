/**
 * pinterest.js — Post a new Pin to Pinterest after a successful upload.
 *
 * HOW TO USE:
 *  1. Set VITE_PINTEREST_TOKEN and VITE_PINTEREST_BOARD_ID in your
 *     .env.local file (never commit that file).
 *  2. Add the same variables as Environment Variables in your Vercel
 *     project settings (Settings → Environment Variables).
 *  3. The script is imported as a module in admin.html.
 *  4. Call  postToPinterest(imagePublicUrl, title, description)  after upload succeeds.
 *
 * ─── Getting your credentials ───────────────────────────────────────────────
 *  Access token : developers.pinterest.com → your app → "Generate token"
 *                 Make sure pins:write and boards:read scopes are selected.
 *  Board ID     : after generating the token, run this once in your browser console:
 *
 *    fetch('https://api.pinterest.com/v5/boards', {
 *      headers: { Authorization: 'Bearer <YOUR_TOKEN>' }
 *    }).then(r => r.json()).then(d => console.table(d.items.map(b => ({ name: b.name, id: b.id }))));
 *
 *  Copy the id of the board you want to post to.
 * ────────────────────────────────────────────────────────────────────────────
 */

// ── CONFIG — read from Vite environment variables ────────────────────────────
const PINTEREST_ACCESS_TOKEN = import.meta.env.VITE_PINTEREST_TOKEN    ?? '';
const PINTEREST_BOARD_ID     = import.meta.env.VITE_PINTEREST_BOARD_ID ?? '';
const SITE_URL               = 'https://image-o-mania.vercel.app/';
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a Pin on Pinterest.
 *
 * @param {string} imagePublicUrl  - Publicly accessible URL of the uploaded image.
 * @param {string} title           - Pin title (max 100 chars).
 * @param {string} [description]   - Optional description (max 500 chars).
 * @returns {Promise<{ok: boolean, pinId?: string, pinUrl?: string, error?: string}>}
 */
export async function postToPinterest(imagePublicUrl, title, description = '') {
  if (!PINTEREST_ACCESS_TOKEN || !PINTEREST_BOARD_ID) {
    console.warn('[Pinterest] Credentials not configured — skipping pin creation.');
    return { ok: false, error: 'credentials_not_set' };
  }

  const payload = {
    board_id: PINTEREST_BOARD_ID,
    title:    title.slice(0, 100),
    description: description.slice(0, 500),
    link: SITE_URL,
    media_source: {
      source_type: 'image_url',
      url: imagePublicUrl
    }
  };

  try {
    const response = await fetch('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINTEREST_ACCESS_TOKEN}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data?.message || data?.code || response.statusText;
      console.error('[Pinterest] API error:', data);
      return { ok: false, error: msg };
    }

    const pinUrl = `https://www.pinterest.com/pin/${data.id}/`;
    console.info('[Pinterest] Pin created:', pinUrl);
    return { ok: true, pinId: data.id, pinUrl };

  } catch (err) {
    console.error('[Pinterest] Network/fetch error:', err);
    return { ok: false, error: err.message };
  }
}
