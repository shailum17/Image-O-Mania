/**
 * designs.ts — TypeScript module for designs.html
 *
 * Responsibilities:
 *   - Page loader hide
 *   - Mobile nav toggle
 *   - AOS init
 *   - Active nav link highlight
 *   - Category filter (All / Illustration / Poster)
 *   - Lightbox open / close / navigate + keyboard (Escape, ArrowLeft, ArrowRight)
 */

// AOS type is declared in src/ts/aos.d.ts (shared across all page modules)

document.addEventListener('DOMContentLoaded', () => {
  // -----------------------------------------------------------
  // 1. Page loader — hide after 600 ms
  // -----------------------------------------------------------
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hide');
    }, 600);
  }

  // -----------------------------------------------------------
  // 2. Mobile nav toggle
  // -----------------------------------------------------------
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

  // -----------------------------------------------------------
  // 3. AOS init
  // -----------------------------------------------------------
  if (typeof AOS !== 'undefined') {
    AOS.init({ once: true, duration: 700, easing: 'ease-out-quad' });
  }

  // -----------------------------------------------------------
  // 4. Active nav link highlight
  // -----------------------------------------------------------
  const currentPage = (document.documentElement as HTMLElement).dataset['page'];
  if (currentPage) {
    document.querySelectorAll<HTMLAnchorElement>('[data-page-link]').forEach((link) => {
      if (link.dataset['pageLink'] === currentPage) {
        link.setAttribute('aria-current', 'page');
        link.style.color = 'var(--color-accent)';
      }
    });
  }

  // -----------------------------------------------------------
  // 5. Category filter
  // -----------------------------------------------------------
  const filterButtons = document.querySelectorAll<HTMLButtonElement>('.category-filters .filter-btn');

  function applyFilter(selected: string): void {
    // Re-query cards each time so dynamically injected carousel cards are included
    const allCards = document.querySelectorAll<HTMLElement>('#design-gallery .design-card');
    allCards.forEach((card) => {
      const match = selected === 'all' || card.dataset['category'] === selected;
      (card as HTMLElement).style.display = match ? '' : 'none';
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyFilter(btn.dataset['category'] ?? 'all');
    });
  });

  // -----------------------------------------------------------
  // 6. Lightbox — skip carousel post cards (they handle their own navigation)
  // -----------------------------------------------------------
  const lightbox = document.getElementById('lightbox') as HTMLElement | null;
  const lbImg = document.getElementById('lb-img') as HTMLImageElement | null;
  const lbCaption = document.getElementById('lb-caption') as HTMLElement | null;
  const lbClose = document.getElementById('lb-close') as HTMLButtonElement | null;
  const lbPrev = document.getElementById('lb-prev') as HTMLButtonElement | null;
  const lbNext = document.getElementById('lb-next') as HTMLButtonElement | null;

  // Only static (non-carousel) cards go into the lightbox index
  // Carousel cards are excluded — they have their own swiper
  function getStaticCards(): HTMLElement[] {
    return Array.from(
      document.querySelectorAll<HTMLElement>('#design-gallery .design-card:not(.design-card--carousel)')
    );
  }

  let currentIndex = 0;
  let triggerCard: HTMLElement | null = null;

  function openLightbox(index: number, cards: HTMLElement[]): void {
    if (!lightbox || !lbImg || !lbCaption) return;

    currentIndex = index;
    const card = cards[currentIndex];
    const img = card.querySelector<HTMLImageElement>('img');
    const caption = card.querySelector<HTMLElement>('figcaption');

    if (img) {
      lbImg.src = img.src;
      lbImg.alt = img.alt;
    }
    if (caption) {
      lbCaption.textContent = caption.textContent ?? '';
    }

    lightbox.removeAttribute('hidden');
    lightbox.classList.add('is-open');
    lbClose?.focus();
  }

  function closeLightbox(): void {
    if (!lightbox) return;
    lightbox.setAttribute('hidden', '');
    lightbox.classList.remove('is-open');
    triggerCard?.focus();
    triggerCard = null;
  }

  function navigateLightbox(direction: 1 | -1): void {
    const cards = getStaticCards().filter((c) => (c as HTMLElement).style.display !== 'none');
    const visibleIndex = cards.indexOf(getStaticCards()[currentIndex]);
    if (visibleIndex === -1) return;
    const next = (visibleIndex + direction + cards.length) % cards.length;
    currentIndex = getStaticCards().indexOf(cards[next]);
    openLightbox(currentIndex, getStaticCards());
  }

  // Attach lightbox to static cards — use event delegation so it works
  // even after Supabase dynamically replaces cards
  document.getElementById('design-gallery')?.addEventListener('click', (e: Event) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.design-card');
    if (!card) return;
    // Skip carousel cards — clicks inside them are handled by the swiper
    if (card.classList.contains('design-card--carousel')) return;

    const staticCards = getStaticCards();
    const idx = staticCards.indexOf(card);
    if (idx === -1) return;

    triggerCard = card;
    openLightbox(idx, staticCards);
  });

  // Close button
  lbClose?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click', () => navigateLightbox(-1));
  lbNext?.addEventListener('click', () => navigateLightbox(1));

  lightbox?.addEventListener('click', (e: MouseEvent) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!lightbox || lightbox.hasAttribute('hidden')) return;
    if (e.key === 'Escape')      closeLightbox();
    else if (e.key === 'ArrowLeft')  navigateLightbox(-1);
    else if (e.key === 'ArrowRight') navigateLightbox(1);
  });
});
