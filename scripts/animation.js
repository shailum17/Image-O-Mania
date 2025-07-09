// For illustrations
if (isIllustration) {
  data.images.forEach((result) => {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-animate", ""); // 👈 animation marker

    const image = document.createElement("img");
    image.src = result.srcSmall;
    image.title = result.prompt;

    const imageLink = document.createElement("a");
    imageLink.href = result.src;
    imageLink.target = "_blank";
    imageLink.appendChild(image);

    wrapper.appendChild(imageLink);
    searchResult.appendChild(wrapper);
  });
}

// For photos (Unsplash)
else {
  data.results.forEach((result) => {
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-animate", ""); // 👈 animation marker

    const image = document.createElement("img");
    image.src = result.urls.small;

    const imageLink = document.createElement("a");
    imageLink.href = result.links.html;
    imageLink.target = "_blank";
    imageLink.appendChild(image);

    wrapper.appendChild(imageLink);
    searchResult.appendChild(wrapper);
  });
}



// Simple fade-in animation on scroll
function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");
  const triggerBottom = window.innerHeight * 0.9;

  reveals.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    if (top < triggerBottom) {
      el.classList.add("opacity-100", "translate-y-0");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);
