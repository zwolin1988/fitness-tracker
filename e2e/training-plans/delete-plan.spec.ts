// e2e/training-plans/delete-plan.spec.ts
// Test E2E: Usuwanie planu treningowego
// Steps: Create plan → Navigate to details → Delete → Verify deletion

import { expect, test } from "@playwright/test";

import { loginAsUser } from "../helpers/auth";
import { NavigationPage, PlanBasicsPage, PlanDetailPage, PlansListPage } from "../page-objects";

test.describe("Usuwanie planu treningowego", () => {
  const testPlanName = `Plan do usunięcia ${Date.now()}`;

  test("Powinien usunąć plan treningowy i przekierować do listy planów", async ({ page }) => {
    // ==========================================
    // ARRANGE - Login i utworzenie planu
    // ==========================================
    await loginAsUser(page);

    const navigationPage = new NavigationPage(page);
    const plansListPage = new PlansListPage(page);
    const planBasicsPage = new PlanBasicsPage(page);
    const planDetailPage = new PlanDetailPage(page);

    // Utwórz nowy plan (uproszczona wersja create-plan.spec.ts)
    console.log("📍 Tworzenie nowego planu...");
    await navigationPage.navigateToPlans();
    await plansListPage.expectPageLoaded();
    await plansListPage.clickCreatePlan();
    await planBasicsPage.expectFormLoaded();

    // Wypełnij tylko Step 1 (podstawowe informacje)
    await planBasicsPage.fillAndSubmit(testPlanName, "Plan który będzie usunięty", "strength");

    // Dodatkowe kliknięcie w "Dalej"
    await page.waitForTimeout(500);
    await page.getByTestId("plan-basics-next-button").click();

    // Sprawdź czy jesteśmy w Step 2
    await expect(page).toHaveURL(/\/plans\/create\?step=2/, { timeout: 10000 });

    // Wybierz 2 ćwiczenia
    await page.waitForSelector('[data-testid^="exercise-card-"]', { timeout: 10000 });
    const exerciseCards = await page.locator('[data-testid^="exercise-card-"]').all();

    if (exerciseCards.length >= 2) {
      await exerciseCards[0].click();
      await exerciseCards[1].click();
    }

    // Sprawdź banner i kliknij "Dalej"
    await expect(page.getByTestId("selected-count-banner")).toContainText("2");
    await page.getByTestId("wizard-next-button").click();

    // Sprawdź czy jesteśmy w Step 3
    await expect(page).toHaveURL(/\/plans\/create\?step=3/, { timeout: 10000 });

    // Poczekaj na załadowanie i zapisz plan
    await page.waitForTimeout(1000);
    await expect(page.getByTestId("wizard-save-button")).toBeVisible();

    // Czekamy na request do API
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/plans") && response.request().method() === "POST",
      { timeout: 30000 }
    );

    await page.getByTestId("wizard-save-button").click();
    await responsePromise;

    // Poczekaj na przekierowanie do /plans
    await expect(page).toHaveURL(/\/plans$/, { timeout: 20000 });
    console.log("✅ Plan został utworzony");

    // ==========================================
    // ACT - Przejdź do szczegółów i usuń plan
    // ==========================================
    console.log("\n📍 Przechodzę do szczegółów planu...");

    // Znajdź link do planu i kliknij
    const planLink = page.getByRole("link", { name: new RegExp(testPlanName) });
    await expect(planLink).toBeVisible({ timeout: 5000 });
    await planLink.click();

    // Poczekaj na załadowanie strony szczegółów
    await expect(page).toHaveURL(/\/plans\/[a-f0-9-]+$/, { timeout: 10000 });
    await planDetailPage.expectPageLoaded();
    console.log("✅ Strona szczegółów załadowana");

    // Sprawdź czy tytuł planu się zgadza
    const planTitle = await planDetailPage.getPlanTitle();
    expect(planTitle).toBe(testPlanName);

    // Kliknij przycisk "Usuń" i potwierdź
    console.log("\n📍 Usuwam plan...");

    // Czekamy na request DELETE do API
    const deleteResponsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/plans/") && response.request().method() === "DELETE",
      { timeout: 30000 }
    );

    // Setup dialog handler PRZED kliknięciem
    page.once("dialog", async (dialog) => {
      console.log(`📋 Dialog potwierdzenia: "${dialog.message()}"`);
      expect(dialog.message()).toContain("Czy na pewno chcesz usunąć ten plan");
      await dialog.accept();
    });

    await planDetailPage.deletePlanButton.click();
    await deleteResponsePromise;
    console.log("✅ Plan został usunięty");

    // ==========================================
    // ASSERT - Sprawdź czy plan zniknął z listy
    // ==========================================
    console.log("\n📍 Sprawdzam czy plan zniknął z listy...");

    // Poczekaj na przekierowanie do /plans
    await expect(page).toHaveURL(/\/plans$/, { timeout: 20000 });
    console.log("✅ Przekierowano do listy planów");

    // Sprawdź czy plan NIE JEST już na liście
    const deletedPlanLink = page.getByRole("link", { name: new RegExp(testPlanName) });
    await expect(deletedPlanLink).not.toBeVisible({ timeout: 5000 });
    console.log(`✅ Plan "${testPlanName}" nie jest już widoczny na liście!`);

    // ==========================================
    // PODSUMOWANIE
    // ==========================================
    console.log("\n" + "=".repeat(60));
    console.log("🎉 TEST ZAKOŃCZONY POMYŚLNIE!");
    console.log("=".repeat(60));
    console.log("✅ Plan został utworzony");
    console.log("✅ Przeszedłem do szczegółów planu");
    console.log("✅ Plan został usunięty");
    console.log(`✅ Plan "${testPlanName}" zniknął z listy planów`);
    console.log("\n🎊 Flow usuwania planu działa poprawnie!");
  });
});
