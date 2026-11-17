/**
 * carousel-posts.js — Self-contained, no external imports from the page.
 *
 * Loads carousel posts from Supabase storage and injects them into
 * the .designs-gallery as swipeable multi-image cards.
 *
 * Storage layout (designs bucket):
 *   carousel-posts/meta.json
 *   carousel-posts/<postId>/img-xxx.jpg
 */

const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
const BUCKET       = 'designs';
const CP_ROOT      = 'carousel-posts';
const META_PATH    = `${CP_ROOT}/meta.json`;

// ── Load Supabase client ───────────────────────────────────────────
async function getSupabase() {
  const config = window.SUPABASE_CONFIG;
  if (!config?.url || !config?.anonKey) {
    console.warn('[CarouselPosts] window.SUPABASE_CONFIG not set.');
    return null;
  }
  try {
    const { createClient } = await import(SUPABASE_CDN);
    return createClient(config.url, config.anonKey);
  } catch (err) {
    console.error('[CarouselPosts] Failed to load Supabase SDK:', err);
    return null;
  }
}

// ── Fetch meta.json + build post objects ──────────────────────────
async function fetchCarouselPosts(supabase) {
  console.log('[CarouselPosts] Downloading meta.json from bucket:', BUCKET, 'path:', META_PATH);

  const { data, error } = await supabase.storage.from(BUCKET).download(META_PATH);

  if (error) {
    console.error('[CarouselPosts] meta.json download error:', error.message, error);
    return [];
  }
  if (!data) {
    console.warn('[CarouselPosts] meta.json is empty / not found.');
    return [];
  }

  let meta;
  try {
    meta = JSON.parse(await data.text());
    console.log('[CarouselPosts] meta.json parsed, keys:', Object.keys(meta));
  } catch (err) {
    console.error('[CarouselPosts] meta.json parse error:', err);
    return [];
  }

  const posts = Object.entries(meta)
    .filter(([id, post]) => {
      const ok = post.images && post.images.length > 0;
      if (!ok) console.log('[CarouselPosts] Skipping post', id, '— no images');
      return ok;
    })
    .map(([id, post]) => {
      const images = post.images.map(filename => {
        const { data: urlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(`${CP_ROOT}/${id}/${filename}`);
        return { filename, url: urlData.publicUrl };
      });
      console.log('[CarouselPosts] Post:', post.title, '| images:', images.length, images.map(i => i.url));
      return {
        id,
        title:       post.title       || 'Untitled',
        category:    post.category    || 'illustration',
        description: post.description || '',
        createdAt:   post.createdAt   || '',
        images,
      };
    })
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

  console.log('[CarouselPosts] Total posts to render:', posts.length);
  return posts;
}

// ── Build a swipeable card DOM element ────────────────────────────
function buildCarouselCard(post) {
  const fig = document.createElement('figure');
  fig.className = 'design-card design-card--carousel';
  fig.setAttribute('data-category', post.category);
  fig.setAttribute('data-carousel-post', post.id);

  // Scroller wrapper
  const scroller = document.createElement('div');
  scroller.className = 'dc-carousel';
  scroller.setAttribute('aria-label', `${post.title} — ${post.images.length} images`);

  const track = document.createElement('div');
  track.className = 'dc-carousel__track';

  post.images.forEach((img, i) => {
    const slide = document.createElement('div');
    slide.className = 'dc-carousel__slide' + (i === 0 ? ' is-active' : '');
    slide.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');

    const imgEl = document.createElement('img');
    imgEl.className = 'design-card__img';
    imgEl.loading   = 'lazy';
    imgEl.src       = img.url;
    imgEl.alt       = `${post.title} — image ${i + 1} of ${post.images.length}`;
    slide.appendChild(imgEl);
    track.appendChild(slide);
  });

  scroller.appendChild(track);

  if (post.images.length > 1) {
    // Prev button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'dc-carousel__btn dc-carousel__btn--prev';
    prevBtn.type = 'button';
    prevBtn.setAttribute('aria-label', 'Previous image');
    prevBtn.innerHTML = '&#8249;';
    scroller.appendChild(prevBtn);

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'dc-carousel__btn dc-carousel__btn--next';
    nextBtn.type = 'button';
    nextBtn.setAttribute('aria-label', 'Next image');
    nextBtn.innerHTML = '&#8250;';
    scroller.appendChild(nextBtn);

    // Counter
    const counter = document.createElement('div');
    counter.className = 'dc-carousel__counter';
    counter.textContent = `1 / ${post.images.length}`;
    scroller.appendChild(counter);

    // Dots
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'dc-carousel__dots';
    post.images.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dc-carousel__dot' + (i === 0 ? ' is-active' : '');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Image ${i + 1}`);
      dotsWrap.appendChild(dot);
    });
    scroller.appendChild(dotsWrap);

    // State + navigation
    let current = 0;
    const slides  = track.querySelectorAll('.dc-carousel__slide');
    const dots    = dotsWrap.querySelectorAll('.dc-carousel__dot');

    function goTo(index) {
      slides[current].classList.remove('is-active');
      slides[current].setAttribute('aria-hidden', 'true');
      dots[current].classList.remove('is-active');
      current = (index + post.images.length) % post.images.length;
      slides[current].classList.add('is-active');
      slides[current].setAttribute('aria-hidden', 'false');
      dots[current].classList.add('is-active');
      counter.textContent = `${current + 1} / ${post.images.length}`;
    }

    prevBtn.addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); });
    nextBtn.addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); });
    dots.forEach((dot, i) => dot.addEventListener('click', e => { e.stopPropagation(); goTo(i); }));

    // Touch swipe
    let touchX = 0;
    scroller.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    scroller.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 35) goTo(dx < 0 ? current + 1 : current - 1);
    }, { passive: true });
  }

  fig.appendChild(scroller);

  // Caption
  const caption = document.createElement('figcaption');

  const titleEl = document.createElement('span');
  titleEl.className = 'design-card__title';
  titleEl.textContent = post.title;
  caption.appendChild(titleEl);

  if (post.description) {
    const desc = document.createElement('span');
    desc.className = 'design-card__desc';
    desc.textContent = post.description;
    caption.appendChild(desc);
  }

  const tags = document.createElement('span');
  tags.className = 'design-card__tags';
  const small = document.createElement('small');
  small.textContent = `Credit: shailendra mourya · ${post.images.length} image${post.images.length !== 1 ? 's' : ''}`;
  tags.appendChild(small);
  caption.appendChild(tags);

  fig.appendChild(caption);
  return fig;
}

// ── Main entry point ──────────────────────────────────────────────
export async function loadCarouselPosts() {
  console.log('[CarouselPosts] loadCarouselPosts() called');

  const gallery = document.querySelector('.designs-gallery');
  if (!gallery) {
    console.warn('[CarouselPosts] .designs-gallery not found in DOM');
    return;
  }

  const supabase = await getSupabase();
  if (!supabase) return;

  const posts = await fetchCarouselPosts(supabase);
  if (!posts.length) {
    console.log('[CarouselPosts] No posts to render.');
    return;
  }

  posts.forEach(post => {
    const card = buildCarouselCard(post);
    gallery.prepend(card);
    console.log('[CarouselPosts] Injected card for post:', post.title);
  });
}
