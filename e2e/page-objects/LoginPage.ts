import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for Login Page
 * Encapsulates all interactions with the login page
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.forgotPasswordLink = page.locator('a[href="/auth/forgot-password"]');
    this.registerLink = page.locator('a[href="/auth/register"]');
  }

  async goto() {
    await this.page.goto("/auth/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async clickRegister() {
    await this.registerLink.click();
  }
}
