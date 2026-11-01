"use strict";
/**
 * about.ts — TypeScript module for about.html
 *
 * Responsibilities:
 *   - Page loader hide
 *   - Mobile nav toggle
 *   - AOS init
 *   - Active nav link highlight
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
});
