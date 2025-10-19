// e2e/page-objects/PlanDetailPage.ts
// Page Object Model for Training Plan Detail Page

import { expect, type Locator, type Page } from "@playwright/test";

/**
 * PlanDetailPage represents the detail view of a training plan
 * Handles viewing plan details, editing, duplicating, and deleting
 */
export class PlanDetailPage {
  readonly page: Page;
  readonly backButton: Locator;
  readonly planTitle: Locator;
  readonly planDescription: Locator;
  readonly exercisesCount: Locator;
  readonly totalSetsCount: Locator;
  readonly startWorkoutButton: Locator;
  readonly editPlanButton: Locator;
  readonly duplicatePlanButton: Locator;
  readonly deletePlanButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByRole("button", { name: /Powrót do planów/i });
    this.planTitle = page.locator("h2").first();
    this.planDescription = page.locator("p.text-muted-foreground").first();
    this.exercisesCount = page.locator("text=Ćwiczenia").locator("..").locator("p.text-3xl");
    this.totalSetsCount = page.locator("text=Wszystkie serie").locator("..").locator("p.text-3xl");
    this.startWorkoutButton = page.getByRole("button", { name: /Rozpocznij trening/i });
    this.editPlanButton = page.getByRole("button", { name: /Edytuj plan/i });
    this.duplicatePlanButton = page.getByRole("button", { name: /Duplikuj/i });
    this.deletePlanButton = page.getByRole("button", { name: /Usuń/i });
  }

  /**
   * Navigate to plan detail page
   */
  async goto(planId: string) {
    await this.page.goto(`/plans/${planId}`);
  }

  /**
   * Get plan title text
   */
  async getPlanTitle(): Promise<string> {
    return (await this.planTitle.textContent()) || "";
  }

  /**
   * Get plan description text
   */
  async getPlanDescription(): Promise<string | null> {
    return await this.planDescription.textContent();
  }

  /**
   * Get exercises count
   */
  async getExercisesCount(): Promise<number> {
    const text = await this.exercisesCount.textContent();
    return parseInt(text || "0", 10);
  }

  /**
   * Get total sets count
   */
  async getTotalSetsCount(): Promise<number> {
    const text = await this.totalSetsCount.textContent();
    return parseInt(text || "0", 10);
  }

  /**
   * Click delete button and confirm deletion in browser dialog
   * Returns promise that resolves after deletion is confirmed
   */
  async clickDeleteAndConfirm() {
    // Setup dialog handler before clicking
    this.page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Czy na pewno chcesz usunąć ten plan");
      await dialog.accept();
    });

    await this.deletePlanButton.click();
  }

  /**
   * Click delete button and cancel deletion in browser dialog
   */
  async clickDeleteAndCancel() {
    // Setup dialog handler before clicking
    this.page.once("dialog", async (dialog) => {
      await dialog.dismiss();
    });

    await this.deletePlanButton.click();
  }

  /**
   * Click back button to return to plans list
   */
  async clickBack() {
    await this.backButton.click();
  }

  /**
   * Verify page is loaded
   */
  async expectPageLoaded() {
    await this.planTitle.waitFor({ state: "visible" });
  }

  /**
   * Check if a specific exercise is in the plan
   */
  async hasExercise(exerciseName: string): Promise<boolean> {
    const exerciseRow = this.page.locator(`text=${exerciseName}`);
    return await exerciseRow.isVisible();
  }
}
