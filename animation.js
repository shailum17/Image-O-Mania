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
