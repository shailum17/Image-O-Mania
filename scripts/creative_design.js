document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".category-buttons button");
  const cards = document.querySelectorAll(".design-gallery .design-card");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.getAttribute("data-category");

      cards.forEach((card) => {
        const cardCat = card.getAttribute("data-category");
        const match = category === "all" || cardCat === category;
        card.style.display = match ? "inline-block" : "none";
      });
    });
  });
});




