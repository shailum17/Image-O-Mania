// Uses Supabase JS CDN - no bundler needed
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export async function fetchDesignImages(bucket = 'designs', folder = '') {
  const config = window.SUPABASE_CONFIG;
  if (!config?.url || !config?.anonKey) return null; // fallback signal

  const supabase = createClient(config.url, config.anonKey);
  const path = folder ? folder + '/' : '';
  const { data, error } = await supabase.storage.from(bucket).list(path, { limit: 100, sortBy: { column: 'name', order: 'asc' } });
  if (error || !data) return null;

  return data
    .filter(f => f.name && !f.name.startsWith('.'))
    .map(f => {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path + f.name);
      return { url: urlData.publicUrl, name: f.name };
    });
}

/** Derive a filter category from the filename prefix.
 *  Files whose names start with "poster-" or "poster_" map to "poster",
 *  files starting with "logo-" or "logo_" map to "logo",
 *  everything else defaults to "illustration".
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
    fig.innerHTML = `<img loading="lazy" src="${img.url}" alt="Design ${i + 1}"><figcaption><b>${img.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')}</b><br><small>Credit: shailendra mourya</small></figcaption>`;
    gallery.appendChild(fig);
  });
  return true;
}
