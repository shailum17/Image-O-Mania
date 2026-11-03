// Uses Supabase JS CDN - no bundler needed
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

export async function fetchDesignImages(bucket = 'designs', folder = '') {
  const config = window.SUPABASE_CONFIG;
  if (!config?.url || !config?.anonKey) return null; // fallback signal

  const supabase = createClient(config.url, config.anonKey);
  const path = folder ? folder + '/' : '';
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path, { limit: 100, sortBy: { column: 'name', order: 'asc' } });

  if (error) {
    // Surface the error visibly so it is not silently swallowed
    console.error('[Supabase] Storage list error:', error.message);
    // Attach to gallery element so my_designs.html can show a user-facing note
    const gallery = document.querySelector('.design-gallery');
    if (gallery) gallery.dataset.supabaseError = error.message;
    return null;
  }

  if (!data) return null;

  return data
    .filter(f => f.name && !f.name.startsWith('.'))
    .map(f => {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path + f.name);

      // Recover a readable title from filename: {category}-{title-slug}-{timestamp}.{ext}
      // Strip the category prefix and the numeric timestamp suffix
      const nameNoExt = f.name.replace(/\.[^.]+$/, '');
      const parts = nameNoExt.split('-');
      const isTimestamp = /^\d{10,}$/.test(parts[parts.length - 1]);
      const titleParts = parts.slice(1, isTimestamp ? -1 : undefined);
      const title = titleParts.length
        ? titleParts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : nameNoExt.replace(/[-_]/g, ' ');

      return { url: urlData.publicUrl, name: f.name, title };
    });
}

/**
 * Derive a filter category from the filename prefix.
 * Files named poster-* -> "poster", logo-* -> "logo", else "illustration".
 */
function categoryFromName(name) {
  const lower = name.toLowerCase();
  if (/^poster[-_]/.test(lower)) return 'poster';
  if (/^logo[-_]/.test(lower)) return 'logo';
  return 'illustration';
}

export function renderDesignGallery(images) {
  const gallery = document.querySelector('.design-gallery');
  if (!gallery || !images?.length) return false;
  gallery.innerHTML = '';

  images.forEach((img, i) => {
    const fig = document.createElement('figure');
    fig.className = 'design-card';
    fig.setAttribute('data-category', categoryFromName(img.name));

    // Use DOM API for src/alt - avoids XSS from filenames containing HTML chars
    const imgEl = document.createElement('img');
    imgEl.loading = 'lazy';
    imgEl.src = img.url;
    imgEl.alt = img.title || ('Design ' + (i + 1));

    const caption = document.createElement('figcaption');

    const bold = document.createElement('b');
    // Use the cleaned title (category + timestamp stripped) when available
    bold.textContent = img.title || img.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');

    const br = document.createElement('br');

    const small = document.createElement('small');
    small.textContent = 'Credit: shailendra mourya';

    caption.appendChild(bold);
    caption.appendChild(br);
    caption.appendChild(small);

    fig.appendChild(imgEl);
    fig.appendChild(caption);
    gallery.appendChild(fig);
  });

  return true;
}
