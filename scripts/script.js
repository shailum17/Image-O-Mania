const accessKey = "QYyaNJslBNbzH-DLmgvnhN-PdG6OSI0XpM8YV_fI560";

document.addEventListener("DOMContentLoaded", () => {
  // Helpers
  async function loadPartial(candidates) {
    for (const path of candidates) {
      try {
        const res = await fetch(path);
        if (res.ok) return await res.text();
      } catch (_) {
        // try next
      }
    }
    throw new Error("No partial path could be loaded: " + candidates.join(", "));
  }

  function fixHeaderLinks(headerRoot) {
    const inPages = window.location.pathname.includes("/pages/");
    const logo = headerRoot.querySelector(".logo");
    if (logo) logo.setAttribute("href", inPages ? "../index.html" : "index.html");

    const anchors = headerRoot.querySelectorAll("nav a[href]");
    anchors.forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (!inPages) {
        // On root, strip leading ../
        a.setAttribute("href", href.replace(/^\.\.\//, ""));
      }
    });
  }

  function wireMobileNav(headerRoot) {
    const toggle = headerRoot.querySelector("#nav-toggle");
    const nav = headerRoot.querySelector("#nav-links");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // ✅ Load header dynamically from correct relative path
  const headerElement = document.getElementById("header");
  if (headerElement) {
    loadPartial(["pages/header.html", "../pages/header.html"]) // try from root, then from /pages
      .then((html) => {
        headerElement.innerHTML = html;
        fixHeaderLinks(headerElement);
        wireMobileNav(headerElement);
      })
      .catch((err) => console.error("Failed to load header:", err));
  }

  // ✅ DOM Elements
  const searchForm = document.getElementById("search-form");
  const searchBox = document.getElementById("search-box");
  const searchResult = document.getElementById("search-result");
  const searchType = document.getElementById("search-type"); // Optional dropdown
  const filterOrientation = document.getElementById("filter-orientation");
  const filterColor = document.getElementById("filter-color");
  const filterOrder = document.getElementById("filter-order");
  const filterSafe = document.getElementById("filter-safe");
  const emptyState = document.getElementById("empty-state");

  let page = 1;
  let isLoading = false;
  let currentKeyword = "";

  // ✅ Search Images Function
  async function searchImages(keyword) {
    if (!keyword || isLoading) return;

    const type = searchType ? searchType.value : "photo";
    const isIllustration = type === "illustration";

    const orientation = filterOrientation?.value || "";
    const color = filterColor?.value || "";
    const orderBy = filterOrder?.value || "relevant";
    const contentFilter = filterSafe?.checked ? "high" : "low"; // Unsplash supports content_filter

    const url = isIllustration
      ? `https://lexica.art/api/v1/search?q=${encodeURIComponent(keyword)}`
      : `https://api.unsplash.com/search/photos?page=${page}&query=${encodeURIComponent(keyword)}&client_id=${accessKey}&per_page=12&order_by=${orderBy}${orientation ? `&orientation=${orientation}` : ""}${color ? `&color=${color}` : ""}&content_filter=${contentFilter}`;

    try {
      isLoading = true;
      const loader = document.getElementById("loader");
      if (loader) loader.style.display = "block";

      const response = await fetch(url);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();

      if (page === 1 && searchResult) {
        searchResult.innerHTML = "";
      }

      let appended = 0;
      if (isIllustration && data.images) {
        data.images.forEach((result) => {
          const image = document.createElement("img");
          image.src = result.srcSmall;
          image.title = result.prompt;

          const imageLink = document.createElement("a");
          imageLink.href = result.src;
          imageLink.target = "_blank";
          imageLink.rel = "noopener noreferrer";
          imageLink.appendChild(image);

          searchResult.appendChild(imageLink);
          appended++;
        });
      } else if (data.results) {
        data.results.forEach((result) => {
          const image = document.createElement("img");
          image.src = result.urls.small;

          const imageLink = document.createElement("a");
          imageLink.href = result.links.html;
          imageLink.target = "_blank";
          imageLink.rel = "noopener noreferrer";
          imageLink.appendChild(image);

          searchResult.appendChild(imageLink);
          appended++;
        });
      }

      if (emptyState) emptyState.hidden = appended !== 0;

      isLoading = false;
      if (loader) loader.style.display = "none";
    } catch (err) {
      console.error("Image fetch error:", err);
      isLoading = false;
    }
  }

  // ✅ Handle form submission
  if (searchForm && searchBox) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const keyword = searchBox.value.trim();
      if (!keyword) {
        alert("Please enter a search term.");
        return;
      }
      page = 1;
      currentKeyword = keyword;
      searchImages(currentKeyword);
    });
  }

  // Prefill from URL or collection/tag clicks
  function applyQueryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const typeParam = params.get('type');
    if (q && searchBox) {
      searchBox.value = q;
      page = 1;
      currentKeyword = q;
      if (searchType && (typeParam === 'photo' || typeParam === 'illustration')) {
        searchType.value = typeParam;
      }
      searchImages(currentKeyword);
    }
  }
  applyQueryFromUrl();

  document.addEventListener('click', (e) => {
    const pill = e.target.closest('a.pill, a.collection-card');
    if (!pill) return;

    e.preventDefault();
    const q = pill.getAttribute('data-q');
    if (!q) return;
    if (searchBox) searchBox.value = q;
    page = 1;
    currentKeyword = q;
    searchImages(currentKeyword);
  });

  // ✅ Infinite scroll
  window.addEventListener("scroll", () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
      !isLoading &&
      currentKeyword
    ) {
      page++;
      searchImages(currentKeyword);
    }
  });

  // ✅ Reveal on scroll (optional effect)
  function revealOnScroll() {
    const elements = document.querySelectorAll("[data-animate], .section-anim");
    const triggerBottom = window.innerHeight * 0.85;

    elements.forEach((el) => {
      const boxTop = el.getBoundingClientRect().top;
      if (boxTop < triggerBottom) {
        el.classList.add("visible");
      }
    });
  }

  window.addEventListener("scroll", revealOnScroll);
  window.addEventListener("load", revealOnScroll);
  // curated tag clicks in empty state
  if (emptyState) {
    emptyState.addEventListener("click", (e) => {
      const a = e.target.closest('a[data-q]');
      if (!a) return;
      e.preventDefault();
      const q = a.getAttribute('data-q') || '';
      const input = document.getElementById('search-box');
      if (input) input.value = q;
      page = 1;
      currentKeyword = q;
      searchImages(currentKeyword);
    });
  }

  // Initialize AOS and particles when on search page
  try { if (window.AOS) AOS.init({ once: true, duration: 700, easing: 'ease-out-quad' }); } catch(_) {}
  try {
    const container = document.getElementById('hero-anim-bg');
    if (container && window.tsParticles) {
      window.tsParticles.load({ id: 'hero-anim-bg', options: {
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        particles: {
          number: { value: 30 },
          color: { value: ['#00fca8', '#00d4b4', '#b2fff0'] },
          links: { enable: true, color: '#b2fff0', distance: 120, opacity: 0.3 },
          move: { enable: true, speed: 1.2 },
          opacity: { value: 0.4 },
          size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
      }});
    }
  } catch(_) {}

  // Page transitions via Swup
  try {
    if (!window._swupInitialized) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/swup@4/dist/swup.min.js';
      script.defer = true;
      script.onload = () => {
        try {
          const swup = new window.Swup({
            containers: ['main', '#footer', '#header'],
            animateHistoryBrowsing: true,
            animationSelector: '.transition-fade'
          });
          window._swupInitialized = true;
        } catch(_) {}
      };
      document.head.appendChild(script);
    }
  } catch(_) {}
  // ✅ Load footer dynamically from correct relative path
  const footerElement = document.getElementById("footer");
  if (footerElement) {
    loadPartial(["pages/footer.html", "../pages/footer.html"]) // try from root, then from /pages
      .then((html) => {
        footerElement.innerHTML = html;
      })
      .catch((err) => console.error("Failed to load footer:", err));
  }
});
