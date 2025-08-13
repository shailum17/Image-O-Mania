// Performance-optimized script with lazy loading and caching
(function() {
  'use strict';
  
  // Performance tracking
  const perf = {
    start: performance.now(),
    log: function(event) {
      console.log(`${event}: ${(performance.now() - this.start).toFixed(2)}ms`);
    }
  };
  
  // Cache for loaded resources
  const cache = new Map();
  
  // Optimized fetch with caching
  async function cachedFetch(url) {
    if (cache.has(url)) {
      return cache.get(url);
    }
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        cache.set(url, text);
        return text;
      }
    } catch (error) {
      console.warn(`Failed to fetch ${url}:`, error);
    }
    return null;
  }
  
  // Optimized partial loader
  async function loadPartial(candidates, targetElement) {
    for (const path of candidates) {
      const html = await cachedFetch(path);
      if (html) {
        targetElement.innerHTML = html;
        return html;
      }
    }
    throw new Error(`No partial could be loaded: ${candidates.join(', ')}`);
  }
  
  // Intersection Observer for lazy loading
  const lazyImageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        lazyImageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });
  
  // Performance optimization utilities
  const utils = {
    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    throttle: function(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  };
  
  // DOM ready optimization
  function domReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(fn, 1);
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }
  
  // Main initialization
  domReady(async function() {
    perf.log('DOM Ready');
    
    // Load header and footer with error handling
    const headerEl = document.getElementById('header');
    const footerEl = document.getElementById('footer');
    
    try {
      if (headerEl) {
        await loadPartial(['pages/header.html', '../pages/header.html'], headerEl);
        setupNavigation(headerEl);
        perf.log('Header Loaded');
      }
      
      if (footerEl) {
        await loadPartial(['pages/footer.html', '../pages/footer.html'], footerEl);
        perf.log('Footer Loaded');
      }
    } catch (error) {
      console.warn('Failed to load partials:', error);
    }
    
    // Setup lazy loading for images
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      lazyImageObserver.observe(img);
    });
    
    // Initialize AOS with reduced motion support
    if (window.AOS && !window.matchMedia('(prefers-reduced-motion)').matches) {
      AOS.init({
        duration: 600,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50
      });
    }
    
    perf.log('Initial Setup Complete');
  });
  
  // Navigation setup
  function setupNavigation(headerRoot) {
    const inPages = window.location.pathname.includes('/pages/');
    const logo = headerRoot.querySelector('.logo');
    
    if (logo) {
      logo.setAttribute('href', inPages ? '../index.html' : 'index.html');
    }
    
    // Fix navigation links
    headerRoot.querySelectorAll('nav a[href]').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (!inPages) {
        link.setAttribute('href', href.replace(/^\.\.\//, ''));
      }
    });
    
    // Mobile navigation
    const navToggle = headerRoot.querySelector('.nav-toggle');
    const nav = headerRoot.querySelector('.nav');
    
    if (navToggle && nav) {
      navToggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', nav.classList.contains('open'));
      });
      
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!headerRoot.contains(e.target)) {
          nav.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }
  
  // Service Worker registration for caching
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
  
  // Export for use by other scripts
  window.ImageOmania = {
    utils,
    cachedFetch,
    perf
  };
  
})();
