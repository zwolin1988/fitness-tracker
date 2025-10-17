import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load homepage successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Fitness Tracker/i);
  });

  test("should have navigation menu", async ({ page }) => {
    await page.goto("/");

    // Check if navigation is visible
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Page should still be accessible
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    // Check for h1 on the page
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto("/");

    // Tab through interactive elements
    await page.keyboard.press("Tab");

    // First focusable element should have focus
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });
});

test.describe("Dark Mode", () => {
  test("should toggle dark mode", async ({ page }) => {
    await page.goto("/");

    // Find dark mode toggle button (adjust selector as needed)
    const darkModeToggle = page.locator('[data-testid="theme-toggle"]');

    // Get initial theme
    const html = page.locator("html");
    const initialClass = await html.getAttribute("class");

    // Toggle dark mode if button exists
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();

      // Wait for theme change
      await page.waitForTimeout(300);

      // Check if class changed
      const newClass = await html.getAttribute("class");
      expect(newClass).not.toBe(initialClass);
    }
  });
});
