// e2e/page-objects/PlanBasicsPage.ts
// Page Object Model for Plan Basics Form (Step 1 of Plan Creation Wizard)

import type { Locator, Page } from "@playwright/test";

/**
 * Training goal types matching the form options
 */
export type PlanGoal = "strength" | "muscle_mass" | "endurance" | "general_fitness";

/**
 * PlanBasicsPage represents Step 1 of the Plan Creation Wizard
 * Handles plan name, description, and training goal selection
 */
export class PlanBasicsPage {
  readonly page: Page;
  readonly form: Locator;
  readonly planNameInput: Locator;
  readonly planDescriptionTextarea: Locator;
  readonly goalStrengthRadio: Locator;
  readonly goalMuscleMassRadio: Locator;
  readonly goalEnduranceRadio: Locator;
  readonly goalGeneralFitnessRadio: Locator;
  readonly cancelButton: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.getByTestId("plan-basics-form");
    this.planNameInput = page.getByTestId("plan-name-input");
    this.planDescriptionTextarea = page.getByTestId("plan-description-textarea");
    this.goalStrengthRadio = page.getByTestId("plan-goal-strength");
    this.goalMuscleMassRadio = page.getByTestId("plan-goal-muscle_mass");
    this.goalEnduranceRadio = page.getByTestId("plan-goal-endurance");
    this.goalGeneralFitnessRadio = page.getByTestId("plan-goal-general_fitness");
    this.cancelButton = page.getByTestId("plan-basics-cancel-button");
    this.nextButton = page.getByTestId("plan-basics-next-button");
  }

  /**
   * Navigate to Plan Creation page (Step 1)
   */
  async goto() {
    await this.page.goto("/plans/create");
  }

  /**
   * Fill plan name field
   */
  async fillPlanName(name: string) {
    await this.planNameInput.fill(name);
  }

  /**
   * Fill plan description field (optional)
   */
  async fillDescription(description: string) {
    await this.planDescriptionTextarea.fill(description);
  }

  /**
   * Select training goal by clicking the appropriate radio button
   * Note: Radio inputs have sr-only class, so we need to force click or click the label
   */
  async selectGoal(goal: PlanGoal) {
    const goalLocators: Record<PlanGoal, Locator> = {
      strength: this.goalStrengthRadio,
      muscle_mass: this.goalMuscleMassRadio,
      endurance: this.goalEnduranceRadio,
      general_fitness: this.goalGeneralFitnessRadio,
    };

    const locator = goalLocators[goal];
    if (!locator) {
      throw new Error(`Invalid goal: ${goal}`);
    }

    // Force click since radio input is hidden (sr-only class)
    await locator.click({ force: true });
  }

  /**
   * Click "Dalej" button to proceed to Step 2
   */
  async clickNext() {
    await this.nextButton.click();
  }

  /**
   * Click "Anuluj" button to cancel plan creation
   */
  async clickCancel() {
    await this.cancelButton.click();
  }

  /**
   * Fill complete form with name, description, and goal
   * Then click next button
   */
  async fillAndSubmit(name: string, description: string, goal: PlanGoal) {
    await this.fillPlanName(name);
    await this.fillDescription(description);
    await this.selectGoal(goal);
    // Small delay to ensure React state updates before clicking
    await this.page.waitForTimeout(300);
    await this.clickNext();
  }

  /**
   * Fill only required fields (name and goal) and submit
   */
  async fillRequiredAndSubmit(name: string, goal: PlanGoal) {
    await this.fillPlanName(name);
    await this.selectGoal(goal);
    await this.clickNext();
  }

  /**
   * Check if Next button is enabled
   */
  async isNextButtonEnabled(): Promise<boolean> {
    return await this.nextButton.isEnabled();
  }

  /**
   * Check if Next button is disabled
   */
  async isNextButtonDisabled(): Promise<boolean> {
    return await this.nextButton.isDisabled();
  }

  /**
   * Get error message for plan name field
   */
  async getNameError(): Promise<string | null> {
    const errorLocator = this.page.locator("#name-error");
    const isVisible = await errorLocator.isVisible();
    return isVisible ? await errorLocator.textContent() : null;
  }

  /**
   * Get error message for description field
   */
  async getDescriptionError(): Promise<string | null> {
    const errorLocator = this.page.locator("#description-error");
    const isVisible = await errorLocator.isVisible();
    return isVisible ? await errorLocator.textContent() : null;
  }

  /**
   * Verify navigation to Step 2 (Exercise Selector)
   */
  async expectStep2() {
    await this.page.waitForURL(/\/plans\/create\?step=2/);
  }

  /**
   * Verify navigation back to Plans List
   */
  async expectPlansListPage() {
    await this.page.waitForURL(/\/plans$/);
  }

  /**
   * Verify form is loaded and visible
   */
  async expectFormLoaded() {
    await this.form.waitFor({ state: "visible" });
  }

  /**
   * Blur (unfocus) the plan name input
   * Useful for testing validation on blur
   */
  async blurPlanNameInput() {
    await this.planNameInput.blur();
  }

  /**
   * Blur (unfocus) the description textarea
   */
  async blurDescriptionTextarea() {
    await this.planDescriptionTextarea.blur();
  }

  /**
   * Get current value of plan name input
   */
  async getPlanNameValue(): Promise<string> {
    return (await this.planNameInput.inputValue()) || "";
  }

  /**
   * Get current value of description textarea
   */
  async getDescriptionValue(): Promise<string> {
    return (await this.planDescriptionTextarea.inputValue()) || "";
  }

  /**
   * Check which goal is currently selected
   */
  async getSelectedGoal(): Promise<PlanGoal | null> {
    if (await this.goalStrengthRadio.isChecked()) return "strength";
    if (await this.goalMuscleMassRadio.isChecked()) return "muscle_mass";
    if (await this.goalEnduranceRadio.isChecked()) return "endurance";
    if (await this.goalGeneralFitnessRadio.isChecked()) return "general_fitness";
    return null;
  }
}
