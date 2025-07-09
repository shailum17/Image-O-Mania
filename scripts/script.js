const accessKey = "QYyaNJslBNbzH-DLmgvnhN-PdG6OSI0XpM8YV_fI560";

document.addEventListener("DOMContentLoaded", () => {
  // ✅ Load header dynamically
  const headerElement = document.getElementById("header");
  if (headerElement) {
    fetch("../pages/header.html")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((html) => {
        headerElement.innerHTML = html;
      })
      .catch((err) => {
        console.error("Failed to load header:", err);
      });
  }

  // ✅ DOM Elements
  const searchForm = document.getElementById("search-form");
  const searchBox = document.getElementById("search-box");
  const searchResult = document.getElementById("search-result");
  const searchType = document.getElementById("search-type"); // Optional dropdown

  let page = 1;
  let isLoading = false;
  let currentKeyword = "";

  // ✅ Search Images Function
  async function searchImages(keyword) {
    if (!keyword || isLoading) return;

    const type = searchType ? searchType.value : "photo";
    const isIllustration = type === "illustration";

    const url = isIllustration
      ? `https://lexica.art/api/v1/search?q=${encodeURIComponent(keyword)}`
      : `https://api.unsplash.com/search/photos?page=${page}&query=${keyword}&client_id=${accessKey}&per_page=12`;

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

      if (isIllustration && data.images) {
        data.images.forEach((result) => {
          const image = document.createElement("img");
          image.src = result.srcSmall;
          image.title = result.prompt;

          const imageLink = document.createElement("a");
          imageLink.href = result.src;
          imageLink.target = "_blank";
          imageLink.appendChild(image);

          searchResult.appendChild(imageLink);
        });
      } else if (data.results) {
        data.results.forEach((result) => {
          const image = document.createElement("img");
          image.src = result.urls.small;

          const imageLink = document.createElement("a");
          imageLink.href = result.links.html;
          imageLink.target = "_blank";
          imageLink.appendChild(image);

          searchResult.appendChild(imageLink);
        });
      }

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
    const elements = document.querySelectorAll("[data-animate]");
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
});

// ✅ Load footer dynamically from pages/footer.html
const footerElement = document.getElementById("footer");
if (footerElement) {
  fetch("../pages/footer.html")
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then((html) => {
      footerElement.innerHTML = html;
    })
    .catch((err) => {
      console.error("Failed to load footer:", err);
    });
}


const loader = document.getElementById("loader");
if (loader) loader.style.display = "flex"; // 👈 use flex for centering
if (loader) loader.style.display = "none";
