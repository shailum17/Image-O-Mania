"use strict";
/**
 * collaboration.ts — TypeScript module for collaboration.html
 *
 * Responsibilities:
 *   - Page loader hide
 *   - Mobile nav toggle
 *   - AOS init
 *   - Active nav link highlight
 *   - Smooth scroll for in-page anchor links (#submit, #showcase)
 *
 * The collaboration form posts to Formspree via standard HTML action —
 * no JS interception needed.
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
    // 5. Smooth scroll for in-page anchor links
    // -----------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#')
                return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
