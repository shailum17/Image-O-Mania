/**
 * search.ts — TypeScript module for search.html
 *
 * Responsibilities:
 *   - Page loader hide
 *   - Mobile nav toggle
 *   - AOS init
 *   - Active nav link highlight
 *   - tsParticles init in #hero-particles
 *   - URL param prefill (?q= and ?type=)
 *   - Unsplash + Lexica API search
 *   - Masonry results append
 *   - Infinite scroll (throttled)
 *   - Popular pill / collection card click delegation
 */

// ──────────────────────────────────────────────────────────────
// CDN globals
// ──────────────────────────────────────────────────────────────
declare const AOS: { init: (opts: object) => void };

declare const tsParticles: {
  load: (
    id: string,
    opts: Record<string, unknown>
  ) => Promise<unknown>;
};

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
interface UnsplashPhoto {
  urls: { small: string; full: string };
  links: { html: string };
  alt_description: string | null;
  user: { name: string };
}

interface LexicaResult {
  src: string;
  srcSmall: string;
  prompt: string;
}

interface UnsplashResponse {
  results: UnsplashPhoto[];
  total: number;
}

interface LexicaResponse {
  images: LexicaResult[];
}

// ──────────────────────────────────────────────────────────────
// State
// ──────────────────────────────────────────────────────────────
let page = 1;
let isLoading = false;
let currentQuery = '';
let scrollThrottleTimer: ReturnType<typeof setTimeout> | null = null;

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
function getResultContainer(): HTMLElement {
  return document.getElementById('search-result') as HTMLElement;
}

function getEmptyState(): HTMLElement {
  return document.getElementById('empty-state') as HTMLElement;
}

function setEmptyStateVisible(visible: boolean): void {
  const el = getEmptyState();
  if (el) {
    if (visible) {
      el.removeAttribute('hidden');
    } else {
      el.setAttribute('hidden', '');
    }
  }
}

function buildResultCard(
  imageUrl: string,
  linkUrl: string,
  altText: string,
  caption: string
): HTMLElement {
  const fig = document.createElement('figure');
  fig.className = 'result-card';

  const anchor = document.createElement('a');
  anchor.href = linkUrl;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.setAttribute('aria-label', altText || caption);

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = altText; // Must never be empty — enforced below before call
  img.loading = 'lazy';

  anchor.appendChild(img);

  const figcap = document.createElement('figcaption');
  figcap.className = 'result-card__caption';

  const photographer = document.createElement('span');
  photographer.className = 'result-card__photographer';
  photographer.textContent = caption;

  figcap.appendChild(photographer);
  fig.appendChild(anchor);
  fig.appendChild(figcap);

  return fig;
}

// ──────────────────────────────────────────────────────────────
// Core search function
// ──────────────────────────────────────────────────────────────
async function searchImages(query: string): Promise<void> {
  if (!query.trim() || isLoading) return;

  isLoading = true;
  currentQuery = query.trim();

  const searchType = (document.getElementById('search-type') as HTMLSelectElement | null)
    ?.value ?? 'photos';
  const orientation = (document.getElementById('filter-orientation') as HTMLSelectElement | null)
    ?.value ?? '';
  const color = (document.getElementById('filter-color') as HTMLSelectElement | null)
    ?.value ?? '';
  const order = (document.getElementById('filter-order') as HTMLSelectElement | null)
    ?.value ?? 'relevant';

  setEmptyStateVisible(false);

  try {
    if (searchType === 'illustrations') {
      // ── Lexica AI search ──────────────────────────────────
      const lexicaUrl = `https://lexica.art/api/v1/search?q=${encodeURIComponent(currentQuery)}`;
      const res = await fetch(lexicaUrl);

      if (!res.ok) {
        throw new Error(`Lexica API error: ${res.status}`);
      }

      const data = (await res.json()) as LexicaResponse;
      const images = data.images ?? [];

      if (images.length === 0 && page === 1) {
        setEmptyStateVisible(true);
        return;
      }

      const container = getResultContainer();
      images.forEach((item) => {
        const altText = item.prompt ? item.prompt.slice(0, 120) : 'AI-generated illustration from Lexica';
        const card = buildResultCard(
          item.srcSmall || item.src,
          `https://lexica.art/?q=${encodeURIComponent(item.prompt)}`,
          altText,
          item.prompt ? item.prompt.slice(0, 80) : 'AI illustration'
        );
        container.appendChild(card);
      });

    } else {
      // ── Unsplash photo search ─────────────────────────────
      // API key is ONLY read from the environment — never hardcoded.
      const key = (import.meta.env as Record<string, string>)['VITE_UNSPLASH_KEY'];

      const params = new URLSearchParams({
        query: currentQuery,
        page: String(page),
        per_page: '20',
        order_by: order,
      });
      if (orientation) params.set('orientation', orientation);
      if (color) params.set('color', color);

      const unsplashUrl = `https://api.unsplash.com/search/photos?${params.toString()}`;
      const res = await fetch(unsplashUrl, {
        headers: { Authorization: `Client-ID ${key}` },
      });

      if (!res.ok) {
        throw new Error(`Unsplash API error: ${res.status}`);
      }

      const data = (await res.json()) as UnsplashResponse;
      const photos = data.results ?? [];

      if (photos.length === 0 && page === 1) {
        setEmptyStateVisible(true);
        return;
      }

      const container = getResultContainer();
      photos.forEach((photo) => {
        const altText = photo.alt_description
          ? photo.alt_description
          : 'Photo from Unsplash';
        const card = buildResultCard(
          photo.urls.small,
          photo.links.html,
          altText,
          `Photo by ${photo.user.name}`
        );
        container.appendChild(card);
      });
    }

  } catch (err) {
    // Show a non-empty error state rather than silently failing
    if (page === 1) {
      setEmptyStateVisible(true);
      const emptyTitle = document.querySelector('.empty-state__title');
      if (emptyTitle) {
        emptyTitle.textContent = 'Search unavailable';
      }
      const emptyDesc = document.querySelector('.empty-state__desc');
      if (emptyDesc) {
        emptyDesc.textContent =
          'Could not fetch images right now. Check your connection and try again.';
      }
    }
    console.error('Search error:', err);
  } finally {
    isLoading = false;
  }
}

// ──────────────────────────────────────────────────────────────
// Reset and fresh search
// ──────────────────────────────────────────────────────────────
function resetSearch(): void {
  page = 1;
  isLoading = false;
  const container = getResultContainer();
  if (container) container.innerHTML = '';
  setEmptyStateVisible(false);
}

// ──────────────────────────────────────────────────────────────
// Infinite scroll
// ──────────────────────────────────────────────────────────────
function handleScroll(): void {
  if (scrollThrottleTimer !== null) return;

  scrollThrottleTimer = setTimeout(() => {
    scrollThrottleTimer = null;

    if (
      !isLoading &&
      currentQuery &&
      window.scrollY + window.innerHeight >= document.body.scrollHeight - 200
    ) {
      page += 1;
      void searchImages(currentQuery);
    }
  }, 200);
}

// ──────────────────────────────────────────────────────────────
// tsParticles config
// ──────────────────────────────────────────────────────────────
function initParticles(): void {
  if (typeof tsParticles === 'undefined') return;

  void tsParticles.load('hero-particles', {
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 25 },
      color: { value: '#7FFF00' },
      opacity: { value: 0.18 },
      size: { value: { min: 1, max: 3 } },
      links: {
        enable: true,
        color: 'rgba(127,255,0,0.2)',
        distance: 140,
        opacity: 0.25,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.8,
        direction: 'none' as const,
        outModes: { default: 'bounce' as const },
      },
    },
    detectRetina: true,
  });
}

// ──────────────────────────────────────────────────────────────
// DOMContentLoaded
// ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // 1. Page loader
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hide'), 600);
  }

  // 2. Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle') as HTMLButtonElement | null;
  const navMobile = document.getElementById('nav-mobile') as HTMLElement | null;

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMobile.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navMobile.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMobile.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 3. AOS init
  if (typeof AOS !== 'undefined') {
    AOS.init({ once: true, duration: 700, easing: 'ease-out-quad' });
  }

  // 4. Active nav link
  const currentPage = (document.documentElement as HTMLElement).dataset['page'];
  if (currentPage) {
    document
      .querySelectorAll<HTMLAnchorElement>('[data-page-link]')
      .forEach((link) => {
        if (link.dataset['pageLink'] === currentPage) {
          link.setAttribute('aria-current', 'page');
          link.style.color = 'var(--color-accent)';
        }
      });
  }

  // 5. tsParticles — defer until the CDN script has loaded
  if (typeof tsParticles !== 'undefined') {
    initParticles();
  } else {
    window.addEventListener('load', initParticles);
  }

  // 6. URL params — prefill inputs and trigger search
  const params = new URLSearchParams(window.location.search);
  const qParam = params.get('q');
  const typeParam = params.get('type');

  const searchInput = document.getElementById('search-input') as HTMLInputElement | null;
  const searchTypeSelect = document.getElementById('search-type') as HTMLSelectElement | null;

  if (searchInput && qParam) {
    searchInput.value = qParam;
  }
  if (searchTypeSelect && typeParam) {
    searchTypeSelect.value = typeParam;
  }
  if (qParam) {
    void searchImages(qParam);
  }

  // 7. Search form submit
  const searchForm = document.getElementById('search-form') as HTMLFormElement | null;
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = searchInput?.value.trim() ?? '';
      if (!q) return;
      resetSearch();
      void searchImages(q);
    });
  }

  // 8. Popular pills — event delegation on the whole document
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const pill = target.closest('[data-q]') as HTMLElement | null;
    if (!pill) return;

    // Only act on pill buttons and collection cards, not the search form submit
    if (
      pill.tagName === 'BUTTON' ||
      pill.tagName === 'A' ||
      pill.classList.contains('collection-card')
    ) {
      e.preventDefault();
      const q = pill.dataset['q'] ?? '';
      if (!q) return;

      if (searchInput) searchInput.value = q;
      resetSearch();
      void searchImages(q);

      // Scroll to results
      const resultsSection = document.querySelector('.results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  // 9. Infinite scroll
  window.addEventListener('scroll', handleScroll, { passive: true });
});
