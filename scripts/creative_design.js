document.addEventListener("DOMContentLoaded", () => {
  // Load Header
  fetch("../pages/header.html")
    .then((res) => res.text())
    .then((html) => document.getElementById("header").innerHTML = html);

  // Load Footer
  fetch("../pages/footer.html")
    .then((res) => res.text())
    .then((html) => document.getElementById("footer").innerHTML = html);

  // Load Design Images Dynamically
  const gallery = document.getElementById("gallery");
  const imageCount = 12; // You can set this dynamically

  for (let i = 1; i <= imageCount; i++) {
    const img = document.createElement("img");
    img.src = `../Assets/my_Designs/design${i}.jpg`; // change to png/svg if needed
    img.alt = `Design ${i}`;
    img.className =
      "w-full mb-4 rounded-lg shadow-lg transform transition-all duration-700 opacity-0 translate-y-10 reveal";
    gallery.appendChild(img);
  }
});





document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".category-buttons button");
  const items = document.querySelectorAll(".design-item");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.getAttribute("data-category");

      items.forEach(item => {
        if (category === "all") {
          item.style.display = "inline-block";
        } else {
          item.style.display = item.classList.contains(category) ? "inline-block" : "none";
        }
      });
    });
  });
});




