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
  const filterButtons = document.querySelectorAll<HTMLButtonElement>('.filter-bar button');
  const designCards = document.querySelectorAll<HTMLElement>('#design-gallery .design-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const selected = btn.dataset['category'] ?? 'all';

      designCards.forEach((card) => {
        const match = selected === 'all' || card.dataset['category'] === selected;
        card.classList.toggle('hidden', !match);
      });
    });
  });

  // -----------------------------------------------------------
  // 6. Lightbox
  // -----------------------------------------------------------
  const lightbox = document.getElementById('lightbox') as HTMLElement | null;
  const lbImg = document.getElementById('lb-img') as HTMLImageElement | null;
  const lbCaption = document.getElementById('lb-caption') as HTMLElement | null;
  const lbClose = document.getElementById('lb-close') as HTMLButtonElement | null;
  const lbPrev = document.getElementById('lb-prev') as HTMLButtonElement | null;
  const lbNext = document.getElementById('lb-next') as HTMLButtonElement | null;

  // Collect all cards into an indexed array at init time
  const cards = Array.from(document.querySelectorAll<HTMLElement>('#design-gallery .design-card'));
  let currentIndex = 0;
  let triggerCard: HTMLElement | null = null;

  function openLightbox(index: number): void {
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
    // Only navigate through currently visible (not hidden) cards
    const visible = cards.filter((c) => !c.classList.contains('hidden'));
    const visibleIndex = visible.indexOf(cards[currentIndex]);
    if (visibleIndex === -1) return;

    const nextVisible = (visibleIndex + direction + visible.length) % visible.length;
    const nextCard = visible[nextVisible];
    currentIndex = cards.indexOf(nextCard);
    openLightbox(currentIndex);
  }

  // Open on card click
  cards.forEach((card, idx) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View design ${idx + 1} full size`);

    card.addEventListener('click', () => {
      triggerCard = card;
      openLightbox(idx);
    });

    card.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerCard = card;
        openLightbox(idx);
      }
    });
  });

  // Close button
  lbClose?.addEventListener('click', closeLightbox);

  // Prev / Next buttons
  lbPrev?.addEventListener('click', () => navigateLightbox(-1));
  lbNext?.addEventListener('click', () => navigateLightbox(1));

  // Click outside image closes lightbox
  lightbox?.addEventListener('click', (e: MouseEvent) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (!lightbox || lightbox.hasAttribute('hidden')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      navigateLightbox(-1);
    } else if (e.key === 'ArrowRight') {
      navigateLightbox(1);
    }
  });
});
