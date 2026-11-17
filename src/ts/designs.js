"use strict";
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
    const navToggle = document.getElementById('nav-toggle');
    const navMobile = document.getElementById('nav-mobile');
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
    const currentPage = document.documentElement.dataset['page'];
    if (currentPage) {
        document.querySelectorAll('[data-page-link]').forEach((link) => {
            if (link.dataset['pageLink'] === currentPage) {
                link.setAttribute('aria-current', 'page');
                link.style.color = 'var(--color-accent)';
            }
        });
    }
    // -----------------------------------------------------------
    // 5. Category filter
    // -----------------------------------------------------------
    const filterButtons = document.querySelectorAll('.category-filters .filter-btn');
    function applyFilter(selected) {
        // Re-query cards each time so dynamically injected carousel cards are included
        const allCards = document.querySelectorAll('#design-gallery .design-card');
        allCards.forEach((card) => {
            const match = selected === 'all' || card.dataset['category'] === selected;
            card.style.display = match ? '' : 'none';
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
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');
    const lbCaption = document.getElementById('lb-caption');
    const lbClose = document.getElementById('lb-close');
    const lbPrev = document.getElementById('lb-prev');
    const lbNext = document.getElementById('lb-next');
    // Only static (non-carousel) cards go into the lightbox index
    // Carousel cards are excluded — they have their own swiper
    function getStaticCards() {
        return Array.from(document.querySelectorAll('#design-gallery .design-card:not(.design-card--carousel)'));
    }
    let currentIndex = 0;
    let triggerCard = null;
    function openLightbox(index, cards) {
        if (!lightbox || !lbImg || !lbCaption)
            return;
        currentIndex = index;
        const card = cards[currentIndex];
        const img = card.querySelector('img');
        const caption = card.querySelector('figcaption');
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
    function closeLightbox() {
        if (!lightbox)
            return;
        lightbox.setAttribute('hidden', '');
        lightbox.classList.remove('is-open');
        triggerCard?.focus();
        triggerCard = null;
    }
    function navigateLightbox(direction) {
        const cards = getStaticCards().filter((c) => c.style.display !== 'none');
        const visibleIndex = cards.indexOf(getStaticCards()[currentIndex]);
        if (visibleIndex === -1)
            return;
        const next = (visibleIndex + direction + cards.length) % cards.length;
        currentIndex = getStaticCards().indexOf(cards[next]);
        openLightbox(currentIndex, getStaticCards());
    }
    // Attach lightbox to static cards — use event delegation so it works
    // even after Supabase dynamically replaces cards
    document.getElementById('design-gallery')?.addEventListener('click', (e) => {
        const card = e.target.closest('.design-card');
        if (!card)
            return;
        // Skip carousel cards — clicks inside them are handled by the swiper
        if (card.classList.contains('design-card--carousel'))
            return;
        const staticCards = getStaticCards();
        const idx = staticCards.indexOf(card);
        if (idx === -1)
            return;
        triggerCard = card;
        openLightbox(idx, staticCards);
    });
    // Close button
    lbClose?.addEventListener('click', closeLightbox);
    lbPrev?.addEventListener('click', () => navigateLightbox(-1));
    lbNext?.addEventListener('click', () => navigateLightbox(1));
    lightbox?.addEventListener('click', (e) => {
        if (e.target === lightbox)
            closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (!lightbox || lightbox.hasAttribute('hidden'))
            return;
        if (e.key === 'Escape')
            closeLightbox();
        else if (e.key === 'ArrowLeft')
            navigateLightbox(-1);
        else if (e.key === 'ArrowRight')
            navigateLightbox(1);
    });
});
