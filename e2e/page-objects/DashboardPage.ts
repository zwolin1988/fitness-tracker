import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model for Dashboard Page
 * Encapsulates all interactions with the dashboard page
 */
export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly startWorkoutButton: Locator;
  readonly workoutHistory: Locator;
  readonly profileMenu: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.startWorkoutButton = page.locator('[data-testid="start-workout-button"]');
    this.workoutHistory = page.locator('[data-testid="workout-history"]');
    this.profileMenu = page.locator('[data-testid="profile-menu"]');
    this.logoutButton = page.locator('[data-testid="logout-button"]');
  }

  async goto() {
    await this.page.goto("/dashboard");
  }

  async startNewWorkout() {
    await this.startWorkoutButton.click();
  }

  async logout() {
    await this.profileMenu.click();
    await this.logoutButton.click();
  }

  async getWelcomeText() {
    return this.welcomeMessage.textContent();
  }

  async getWorkoutHistoryCount() {
    return this.workoutHistory.locator('[data-testid="workout-item"]').count();
  }
}
