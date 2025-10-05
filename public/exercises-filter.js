// Filtrowanie ćwiczeń po kategorii
(function () {
  function initFiltering() {
    const filterButtons = document.querySelectorAll(".filter-btn");
    const exerciseSections = document.querySelectorAll(".exercise-section");

    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const selectedCategory = this.getAttribute("data-category");

        // Aktualizacja stanu aktywnego przycisku
        filterButtons.forEach((btn) => {
          btn.classList.remove("active", "bg-primary", "text-primary-foreground");
          btn.classList.add("bg-card");
        });

        // Ustaw aktywny przycisk
        this.classList.add("active", "bg-primary", "text-primary-foreground");
        this.classList.remove("bg-card");

        // Filtrowanie sekcji
        if (selectedCategory === "all") {
          // Pokaż wszystkie sekcje
          exerciseSections.forEach((section) => {
            section.style.display = "block";
          });
        } else {
          // Pokaż tylko wybraną kategorię
          exerciseSections.forEach((section) => {
            const sectionCategory = section.getAttribute("data-category");
            if (sectionCategory === selectedCategory) {
              section.style.display = "block";
            } else {
              section.style.display = "none";
            }
          });
        }
      });
    });
  }

  // Uruchom gdy DOM będzie gotowy
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFiltering);
  } else {
    initFiltering();
  }
})();
