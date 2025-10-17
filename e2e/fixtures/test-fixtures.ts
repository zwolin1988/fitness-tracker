import { test as base, type Page } from "@playwright/test";

/**
 * Extended test fixtures for custom setup/teardown
 * Add custom fixtures here as needed for your tests
 */

interface TestFixtures {
  authenticatedPage: Page;
}

export const test = base.extend<TestFixtures>({
  /**
   * Example: Authenticated page fixture
   * Automatically logs in before tests that use this fixture
   */
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto("/auth/login");

    // Perform login (replace with actual selectors)
    // await page.fill('[name="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    // await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD || 'testpassword123');
    // await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    // await page.waitForURL('/dashboard');

    await use(page);

    // Cleanup: logout after test
    // await page.click('[data-testid="logout-button"]');
  },
});

export { expect } from "@playwright/test";
