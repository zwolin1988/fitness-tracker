// e2e/page-objects/PlansListPage.ts
// Page Object Model for Plans List page

import type { Locator, Page } from "@playwright/test";

/**
 * PlansListPage represents the training plans list page
 * Shows existing plans and provides button to create new plan
 */
export class PlansListPage {
  readonly page: Page;
  readonly createNewPlanButton: Locator;
  readonly createFirstPlanButton: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createNewPlanButton = page.getByTestId("create-new-plan-button");
    this.createFirstPlanButton = page.getByTestId("create-first-plan-button");
    this.pageTitle = page.getByRole("heading", { name: "Twoje Plany Treningowe" });
  }

  /**
   * Navigate to Plans List page
   */
  async goto() {
    await this.page.goto("/plans");
  }

  /**
   * Check if user has any plans
   * Returns true if "Nowy plan" button is visible (user has plans)
   * Returns false if "Utwórz pierwszy plan" button is visible (no plans)
   */
  async hasPlans(): Promise<boolean> {
    const hasNewPlanButton = await this.createNewPlanButton.isVisible();
    return hasNewPlanButton;
  }

  /**
   * Click "Nowy plan" button (when user already has plans)
   */
  async clickCreateNewPlan() {
    await this.createNewPlanButton.click();
  }

  /**
   * Click "Utwórz pierwszy plan" button (when user has no plans)
   */
  async clickCreateFirstPlan() {
    await this.createFirstPlanButton.click();
  }

  /**
   * Click the appropriate create button based on current state
   * Automatically detects if user has plans or not
   */
  async clickCreatePlan() {
    const hasExistingPlans = await this.hasPlans();
    if (hasExistingPlans) {
      await this.clickCreateNewPlan();
    } else {
      await this.clickCreateFirstPlan();
    }
  }

  /**
   * Verify navigation to Plan Creation page
   */
  async expectCreatePage() {
    await this.page.waitForURL(/\/plans\/create/);
  }

  /**
   * Check if create button is disabled (7 plans limit reached)
   */
  async isCreateButtonDisabled(): Promise<boolean> {
    return await this.createNewPlanButton.isDisabled();
  }

  /**
   * Get the count of existing plans from the page
   * Extracts from "Aktywne plany (X/7)" text
   */
  async getPlanCount(): Promise<number | null> {
    const countText = await this.page.locator("text=/Aktywne plany \\((\\d+)\\/7\\)/").textContent();
    if (!countText) return null;

    const match = countText.match(/\((\d+)\/7\)/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Verify page is loaded
   */
  async expectPageLoaded() {
    await this.pageTitle.waitFor({ state: "visible" });
  }
}
