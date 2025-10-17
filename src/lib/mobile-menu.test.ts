/**
 * Unit tests for mobile menu utilities
 * Tests cover toggle, open, close, and event handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  toggleMobileMenu,
  closeMobileMenu,
  openMobileMenu,
  isMobileMenuOpen,
  setupMobileMenu,
} from "./mobile-menu";

describe("Mobile Menu Utilities", () => {
  let mockMenuElement: HTMLElement;
  let mockMenuButton: HTMLElement;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <button id="menu-button">Menu</button>
      <div id="mobile-menu" class="hidden">
        <a href="/dashboard" data-mobile-link>Dashboard</a>
        <a href="/plans" data-mobile-link>Plans</a>
      </div>
    `;

    mockMenuElement = document.getElementById("mobile-menu")!;
    mockMenuButton = document.getElementById("menu-button")!;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  describe("toggleMobileMenu", () => {
    it("should toggle menu from hidden to visible", () => {
      expect(mockMenuElement.classList.contains("hidden")).toBe(true);

      toggleMobileMenu(mockMenuElement);

      expect(mockMenuElement.classList.contains("hidden")).toBe(false);
      expect(mockMenuButton.getAttribute("aria-expanded")).toBe("true");
    });

    it("should toggle menu from visible to hidden", () => {
      mockMenuElement.classList.remove("hidden");

      toggleMobileMenu(mockMenuElement);

      expect(mockMenuElement.classList.contains("hidden")).toBe(true);
      expect(mockMenuButton.getAttribute("aria-expanded")).toBe("false");
    });

    it("should handle null menu element gracefully", () => {
      expect(() => toggleMobileMenu(null)).not.toThrow();
    });

    it("should update aria-expanded on menu button", () => {
      toggleMobileMenu(mockMenuElement);
      expect(mockMenuButton.getAttribute("aria-expanded")).toBe("true");

      toggleMobileMenu(mockMenuElement);
      expect(mockMenuButton.getAttribute("aria-expanded")).toBe("false");
    });

    it("should work when menu button does not exist", () => {
      document.getElementById("menu-button")?.remove();

      expect(() => toggleMobileMenu(mockMenuElement)).not.toThrow();
      expect(mockMenuElement.classList.contains("hidden")).toBe(false);
    });
  });

  describe("closeMobileMenu", () => {
    it("should close open menu", () => {
      mockMenuElement.classList.remove("hidden");

      closeMobileMenu(mockMenuElement);

      expect(mockMenuElement.classList.contains("hidden")).toBe(true);
      expect(mockMenuButton.getAttribute("aria-expanded")).toBe("false");
    });

    it("should keep closed menu closed", () => {
      expect(mockMenuElement.classList.contains("hidden")).toBe(true);

      closeMobileMenu(mockMenuElement);

      expect(mockMenuElement.classList.contains("hidden")).toBe(true);
    });

    it("should handle null menu element gracefully", () => {
      expect(() => closeMobileMenu(null)).not.toThrow();
    });

    it("should set aria-expanded to false", () => {
      mockMenuElement.classList.remove("hidden");
      mockMenuButton.setAttribute("aria-expanded", "true");

      closeMobileMenu(mockMenuElement);

      expect(mockMenuButton.getAttribute("aria-expanded")).toBe("false");
    });
  });

  describe("openMobileMenu", () => {
    it("should open closed menu", () => {
      openMobileMenu(mockMenuElement);

      expect(mockMenuElement.classList.contains("hidden")).toBe(false);
      expect(mockMenuButton.getAttribute("aria-expanded")).toBe("true");
    });

    it("should keep open menu open", () => {
      mockMenuElement.classList.remove("hidden");

      openMobileMenu(mockMenuElement);

      expect(mockMenuElement.classList.contains("hidden")).toBe(false);
    });

    it("should handle null menu element gracefully", () => {
      expect(() => openMobileMenu(null)).not.toThrow();
    });

    it("should set aria-expanded to true", () => {
      openMobileMenu(mockMenuElement);

      expect(mockMenuButton.getAttribute("aria-expanded")).toBe("true");
    });
  });

  describe("isMobileMenuOpen", () => {
    it("should return false for closed menu", () => {
      expect(isMobileMenuOpen(mockMenuElement)).toBe(false);
    });

    it("should return true for open menu", () => {
      mockMenuElement.classList.remove("hidden");

      expect(isMobileMenuOpen(mockMenuElement)).toBe(true);
    });

    it("should return false for null element", () => {
      expect(isMobileMenuOpen(null)).toBe(false);
    });

    it("should correctly detect multiple hidden class toggles", () => {
      expect(isMobileMenuOpen(mockMenuElement)).toBe(false);

      mockMenuElement.classList.remove("hidden");
      expect(isMobileMenuOpen(mockMenuElement)).toBe(true);

      mockMenuElement.classList.add("hidden");
      expect(isMobileMenuOpen(mockMenuElement)).toBe(false);
    });
  });

  describe("setupMobileMenu", () => {
    it("should setup initial aria attributes", () => {
      setupMobileMenu();

      expect(mockMenuButton.getAttribute("aria-expanded")).toBe("false");
      expect(mockMenuButton.getAttribute("aria-controls")).toBe("mobile-menu");
    });

    it("should toggle menu on button click", () => {
      setupMobileMenu();

      expect(mockMenuElement.classList.contains("hidden")).toBe(true);

      mockMenuButton.click();
      expect(mockMenuElement.classList.contains("hidden")).toBe(false);

      mockMenuButton.click();
      expect(mockMenuElement.classList.contains("hidden")).toBe(true);
    });

    it("should close menu when clicking menu link", () => {
      setupMobileMenu();

      // Open menu
      mockMenuButton.click();
      expect(mockMenuElement.classList.contains("hidden")).toBe(false);

      // Click link
      const link = mockMenuElement.querySelector("a")!;
      link.click();

      expect(mockMenuElement.classList.contains("hidden")).toBe(true);
    });

    it("should close menu on Escape key", () => {
      setupMobileMenu();

      // Open menu
      mockMenuButton.click();
      expect(mockMenuElement.classList.contains("hidden")).toBe(false);

      // Press Escape
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);

      expect(mockMenuElement.classList.contains("hidden")).toBe(true);
    });

    it("should return focus to button on Escape", () => {
      setupMobileMenu();
      const focusSpy = vi.spyOn(mockMenuButton, "focus");

      // Open menu
      mockMenuButton.click();

      // Press Escape
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);

      expect(focusSpy).toHaveBeenCalled();
    });

    it("should not close menu on non-Escape keys", () => {
      setupMobileMenu();

      // Open menu
      mockMenuButton.click();
      expect(mockMenuElement.classList.contains("hidden")).toBe(false);

      // Press other key
      const event = new KeyboardEvent("keydown", { key: "Enter" });
      document.dispatchEvent(event);

      expect(mockMenuElement.classList.contains("hidden")).toBe(false);
    });

    it("should close menu when clicking outside", () => {
      setupMobileMenu();

      // Open menu
      mockMenuButton.click();
      expect(mockMenuElement.classList.contains("hidden")).toBe(false);

      // Click outside
      const outsideElement = document.createElement("div");
      document.body.appendChild(outsideElement);

      const event = new MouseEvent("click", { bubbles: true });
      outsideElement.dispatchEvent(event);

      expect(mockMenuElement.classList.contains("hidden")).toBe(true);
    });

    it("should not close menu when clicking inside menu", () => {
      setupMobileMenu();

      // Open menu
      mockMenuButton.click();
      expect(mockMenuElement.classList.contains("hidden")).toBe(false);

      // Click inside menu (but not on link)
      const event = new MouseEvent("click", { bubbles: true });
      mockMenuElement.dispatchEvent(event);

      expect(mockMenuElement.classList.contains("hidden")).toBe(false);
    });

    it("should not close menu when clicking the button", () => {
      setupMobileMenu();

      // Open menu
      mockMenuButton.click();
      expect(mockMenuElement.classList.contains("hidden")).toBe(false);

      // Click button again (should toggle, not trigger outside click)
      const event = new MouseEvent("click", { bubbles: true });
      mockMenuButton.dispatchEvent(event);

      // Menu should be closed by toggle, not outside click
      expect(mockMenuElement.classList.contains("hidden")).toBe(true);
    });

    it("should handle missing menu button gracefully", () => {
      document.getElementById("menu-button")?.remove();

      expect(() => setupMobileMenu()).not.toThrow();
    });

    it("should handle missing menu element gracefully", () => {
      document.getElementById("mobile-menu")?.remove();

      expect(() => setupMobileMenu()).not.toThrow();
    });

    it("should close menu for all menu links", () => {
      setupMobileMenu();

      // Open menu
      mockMenuButton.click();

      // Click each link and verify menu closes
      const links = mockMenuElement.querySelectorAll("a");
      links.forEach((link, index) => {
        if (index > 0) {
          // Reopen for subsequent links
          mockMenuButton.click();
        }

        link.click();
        expect(mockMenuElement.classList.contains("hidden")).toBe(true);
      });
    });
  });

  describe("setupMobileMenu - Integration", () => {
    it("should handle full user interaction flow", () => {
      setupMobileMenu();

      // Initially closed
      expect(isMobileMenuOpen(mockMenuElement)).toBe(false);

      // User opens menu
      mockMenuButton.click();
      expect(isMobileMenuOpen(mockMenuElement)).toBe(true);
      expect(mockMenuButton.getAttribute("aria-expanded")).toBe("true");

      // User clicks a link
      const link = mockMenuElement.querySelector("a")!;
      link.click();
      expect(isMobileMenuOpen(mockMenuElement)).toBe(false);
      expect(mockMenuButton.getAttribute("aria-expanded")).toBe("false");

      // User opens menu again
      mockMenuButton.click();
      expect(isMobileMenuOpen(mockMenuElement)).toBe(true);

      // User presses Escape
      const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(escapeEvent);
      expect(isMobileMenuOpen(mockMenuElement)).toBe(false);
    });

    it("should maintain accessibility throughout interactions", () => {
      setupMobileMenu();

      // Check aria-controls is set
      expect(mockMenuButton.getAttribute("aria-controls")).toBe("mobile-menu");

      // Open menu
      mockMenuButton.click();
      expect(mockMenuButton.getAttribute("aria-expanded")).toBe("true");

      // Close menu
      mockMenuButton.click();
      expect(mockMenuButton.getAttribute("aria-expanded")).toBe("false");

      // Close via Escape maintains aria-expanded
      mockMenuButton.click();
      const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(escapeEvent);
      expect(mockMenuButton.getAttribute("aria-expanded")).toBe("false");
    });
  });
});
