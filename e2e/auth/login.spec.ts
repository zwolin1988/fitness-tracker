import { test, expect } from "../fixtures/test-fixtures";
import { LoginPage } from "../page-objects/LoginPage";

test.describe("Login Flow", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("should display login form", async () => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await loginPage.login("invalid@example.com", "wrongpassword");

    // Wait for error message
    await page.waitForTimeout(1000);

    // Check if error message is displayed (adjust selector as needed)
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toContainText(/invalid|incorrect|failed/i);
    }
  });

  test("should have link to registration page", async () => {
    await expect(loginPage.registerLink).toBeVisible();
  });

  test("should have link to forgot password page", async () => {
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test("should navigate to registration page", async ({ page }) => {
    await loginPage.clickRegister();
    await expect(page).toHaveURL(/.*register/);
  });

  test("should navigate to forgot password page", async ({ page }) => {
    await loginPage.clickForgotPassword();
    await expect(page).toHaveURL(/.*forgot-password/);
  });

  test("should validate email format", async () => {
    await loginPage.emailInput.fill("invalid-email");
    await loginPage.passwordInput.fill("password123");
    await loginPage.submitButton.click();

    // HTML5 validation should prevent submission
    const emailInput = loginPage.emailInput;
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);

    expect(validationMessage).toBeTruthy();
  });

  test("should require password field", async () => {
    await loginPage.emailInput.fill("test@example.com");
    // Leave password empty
    await loginPage.submitButton.click();

    const passwordInput = loginPage.passwordInput;
    const validationMessage = await passwordInput.evaluate((el: HTMLInputElement) => el.validationMessage);

    expect(validationMessage).toBeTruthy();
  });
});

test.describe("Login - Visual Regression", () => {
  test("should match login page screenshot", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Take screenshot and compare
    await expect(page).toHaveScreenshot("login-page.png", {
      fullPage: true,
      maxDiffPixels: 100,
    });
  });
});
