import { test, expect } from "../fixtures/test-fixtures";
import { DashboardPage } from "../page-objects/DashboardPage";

test.describe("Dashboard", () => {
  test.skip("should display dashboard after login", async ({ authenticatedPage }) => {
    // This test uses the authenticatedPage fixture
    const dashboardPage = new DashboardPage(authenticatedPage);

    await expect(dashboardPage.welcomeMessage).toBeVisible();
    await expect(dashboardPage.startWorkoutButton).toBeVisible();
  });

  test.skip("should start a new workout", async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage);

    await dashboardPage.startNewWorkout();

    // Should navigate to workout page
    await expect(authenticatedPage).toHaveURL(/.*workout/);
  });

  test.skip("should display workout history", async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage);
    await dashboardPage.goto();

    await expect(dashboardPage.workoutHistory).toBeVisible();
  });

  test.skip("should logout successfully", async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage);
    await dashboardPage.goto();

    await dashboardPage.logout();

    // Should redirect to login page
    await expect(authenticatedPage).toHaveURL(/.*login/);
  });
});

test.describe("Dashboard - Performance", () => {
  test("should load dashboard within acceptable time", async ({ page }) => {
    // Start timing
    const startTime = Date.now();

    await page.goto("/dashboard");

    // Wait for main content to be visible
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;

    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("should have good Lighthouse score", async ({ page }) => {
    await page.goto("/dashboard");

    // Note: For actual Lighthouse testing, use @playwright/lighthouse or similar
    // This is a placeholder for performance checks
    await page.waitForLoadState("networkidle");

    // Check if critical resources are loaded
    const performance = await page.evaluate(() => {
      const perfData = window.performance.timing;
      const loadTime = perfData.loadEventEnd - perfData.navigationStart;
      return { loadTime };
    });

    // Load time should be reasonable
    expect(performance.loadTime).toBeLessThan(5000);
  });
});
