# Supabase Storage Setup Guide

This guide explains how to connect Image-O-Mania to Supabase Storage so the "My Creative Designs" gallery can fetch images dynamically from the cloud.

---

## 1. Create a Supabase account and project

1. Go to [https://supabase.com](https://supabase.com) and sign up (free tier is sufficient).
2. Click **New project**, choose a name (e.g. `image-o-mania`), pick a region close to you, and set a database password.
3. Wait for the project to finish provisioning (about a minute).

---

## 2. Create a Storage bucket named `designs`

1. In the left sidebar, click **Storage**.
2. Click **New bucket**.
3. Enter the name `designs` (must match exactly — the code uses this name).
4. Leave **Public bucket** toggled **on** (see step 3 below).
5. Click **Create bucket**.

---

## 3. Set the bucket to public

Making the bucket public lets the browser fetch image URLs without authentication tokens.

1. In **Storage**, click on the `designs` bucket.
2. Click the **Settings** (gear) icon or the **Policies** tab.
3. Ensure the bucket is marked as **Public**. If it was created as public in step 2, this is already done.

> **Note:** If you need private images, leave the bucket private and update `supabase-images.js` to use signed URLs instead of public URLs. That requires additional RLS policy configuration.

---

## 4. Upload design images to the bucket

1. Open the `designs` bucket in the Supabase Storage UI.
2. Click **Upload files** and select your design images (`.jpg`, `.svg`, `.png`, etc.).
3. You can optionally organise images inside a sub-folder (e.g. `my_designs/`). If you do, update the second argument in `fetchDesignImages('designs', 'my_designs')` in `pages/my_designs.html`.
4. Images will be listed alphabetically in the gallery, so name them consistently (e.g. `design1.jpg`, `design2.jpg`, …).

> **Category naming convention:** The gallery filter buttons (Illustration / Poster / Logo) rely on filename prefixes:
> - Files starting with `poster-` or `poster_` (e.g. `poster-summer.jpg`) → **Poster** filter
> - Files starting with `logo-` or `logo_` (e.g. `logo-brand.svg`) → **Logo** filter
> - All other files → **Illustration** filter (default)

---

## 5. Find your Project URL and anon key

1. In the Supabase dashboard, go to **Settings** (gear icon in the left sidebar) → **API**.
2. Copy the **Project URL** (looks like `https://xyzxyzxyz.supabase.co`).
3. Copy the **`anon` public** key under **Project API keys** (starts with `eyJhbGci…`).

---

## 6. Fill in `window.SUPABASE_CONFIG` in `pages/my_designs.html`

Open `pages/my_designs.html` and find this block near the bottom:

```js
window.SUPABASE_CONFIG = {
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

Replace the placeholders with your real values:

```js
window.SUPABASE_CONFIG = {
  url: 'https://xyzxyzxyz.supabase.co',   // your Project URL
  anonKey: 'eyJhbGciOiJIUzI1NiIs...'      // your anon public key
};
```

Save the file. Reload the page — the gallery will now fetch images from Supabase instead of using the static local files.

If Supabase is unreachable or the bucket is empty, the page silently falls back to the static `<figure>` cards already in the HTML.

---

## 7. Using environment variables for production Vite builds

For a production build it is better practice to keep credentials out of the HTML file. The project already has placeholder entries in `.env`:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace those placeholder values with your real credentials, then create (or update) `src/ts/supabase.ts` to export a configured client:

```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

You can then import this client in TypeScript modules that are processed by Vite, keeping credentials out of the built HTML.

---

## 8. ⚠️ Never commit real credentials to git

- The `.env` file contains only **placeholder** values and is safe to commit as-is.
- If you replace the placeholders with real keys, add `.env` to `.gitignore` before committing.
- Never put a real Supabase URL or anon key directly inside a committed HTML or JS file.
- The `anon` key is technically public-safe (it respects RLS policies), but it is still best practice to keep it out of version control.

---

## Quick checklist

- [ ] Supabase project created
- [ ] `designs` bucket created and set to **public**
- [ ] Design images uploaded to the bucket
- [ ] Project URL and anon key copied from Settings → API
- [ ] `window.SUPABASE_CONFIG` in `pages/my_designs.html` updated with real values
- [ ] Page tested in browser — gallery loads from Supabase
- [ ] Real credentials NOT committed to git
