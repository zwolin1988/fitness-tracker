/**
 * Mobile menu utilities for navigation toggle functionality
 */

/**
 * Toggle mobile menu visibility
 */
export function toggleMobileMenu(menuElement: HTMLElement | null): void {
  if (!menuElement) {
    return;
  }

  // Check if menu is currently hidden BEFORE toggling
  const wasHidden = menuElement.classList.contains("hidden");
  menuElement.classList.toggle("hidden");

  // Update aria-expanded based on new state (opposite of wasHidden)
  const menuButton = document.getElementById("menu-button");
  if (menuButton) {
    menuButton.setAttribute("aria-expanded", String(wasHidden));
  }
}

/**
 * Close mobile menu
 */
export function closeMobileMenu(menuElement: HTMLElement | null): void {
  if (!menuElement) {
    return;
  }

  menuElement.classList.add("hidden");

  const menuButton = document.getElementById("menu-button");
  if (menuButton) {
    menuButton.setAttribute("aria-expanded", "false");
  }
}

/**
 * Open mobile menu
 */
export function openMobileMenu(menuElement: HTMLElement | null): void {
  if (!menuElement) {
    return;
  }

  menuElement.classList.remove("hidden");

  const menuButton = document.getElementById("menu-button");
  if (menuButton) {
    menuButton.setAttribute("aria-expanded", "true");
  }
}

/**
 * Check if mobile menu is open
 */
export function isMobileMenuOpen(menuElement: HTMLElement | null): boolean {
  if (!menuElement) {
    return false;
  }

  return !menuElement.classList.contains("hidden");
}

/**
 * Setup mobile menu event listeners
 */
export function setupMobileMenu(): void {
  const menuButton = document.getElementById("menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (!menuButton || !mobileMenu) {
    return;
  }

  // Set initial aria-expanded
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-controls", "mobile-menu");

  // Toggle menu on button click
  menuButton.addEventListener("click", () => {
    toggleMobileMenu(mobileMenu);
  });

  // Close menu when clicking menu links (mobile navigation)
  const menuLinks = mobileMenu.querySelectorAll("a[data-mobile-link]");
  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu(mobileMenu);
    });
  });

  // Close menu on Escape key
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMobileMenuOpen(mobileMenu)) {
      closeMobileMenu(mobileMenu);
      menuButton.focus(); // Return focus to button
    }
  });

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    const target = event.target as Node;

    if (isMobileMenuOpen(mobileMenu) && !mobileMenu.contains(target) && !menuButton.contains(target)) {
      closeMobileMenu(mobileMenu);
    }
  });
}
