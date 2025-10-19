// e2e/training-plans/create-plan-complete-flow.spec.ts
// Kompletny test E2E: Utworzenie planu treningowego od początku do końca
// Steps: Login → Step 1 (basics) → Step 2 (exercises) → Step 3 (sets) → Save → Verify

import { expect, test } from "@playwright/test";

import { loginAsUser } from "../helpers/auth";
import { NavigationPage, PlanBasicsPage, PlansListPage } from "../page-objects";

test.describe("Kompletny flow tworzenia planu treningowego", () => {
  const testPlanName = `E2E Test Plan ${Date.now()}`; // Unique name

  test("Powinien utworzyć nowy plan treningowy - pełny flow (Steps 1-3)", async ({ page }) => {
    // ==========================================
    // ARRANGE - Login i przygotowanie
    // ==========================================
    await loginAsUser(page);

    const navigationPage = new NavigationPage(page);
    const plansListPage = new PlansListPage(page);
    const planBasicsPage = new PlanBasicsPage(page);

    // ==========================================
    // STEP 1: Podstawowe informacje
    // ==========================================
    console.log("📍 STEP 1: Wypełnianie podstawowych informacji");

    await navigationPage.navigateToPlans();
    await plansListPage.expectPageLoaded();
    await plansListPage.clickCreatePlan();
    await planBasicsPage.expectFormLoaded();

    // Wypełnij Step 1
    await planBasicsPage.fillAndSubmit(testPlanName, "E2E Test Description", "strength");

    // Kliknij jeszcze raz na przycisk "Dalej" bo formularz może nie przechodzić od razu
    // W Step 1 przycisk ma testid="plan-basics-next-button"
    console.log("🔄 Klikam przycisk Dalej jeszcze raz...");
    await page.waitForTimeout(500);
    await page.getByTestId("plan-basics-next-button").click();

    // Sprawdź czy jesteśmy w Step 2 (czekamy aż URL się zaktualizuje)
    await expect(page).toHaveURL(/\/plans\/create\?step=2/, { timeout: 10000 });
    console.log("✅ STEP 1 completed");

    // ==========================================
    // STEP 2: Wybór ćwiczeń
    // ==========================================
    console.log("\n📍 STEP 2: Wybór ćwiczeń");

    // Poczekaj na załadowanie ćwiczeń
    await page.waitForSelector('[data-testid^="exercise-card-"]', { timeout: 10000 });

    // Wybierz pierwsze 3 ćwiczenia (klikamy w karty)
    const exerciseCards = await page.locator('[data-testid^="exercise-card-"]').all();
    console.log(`📊 Znaleziono ${exerciseCards.length} ćwiczeń`);

    if (exerciseCards.length >= 3) {
      await exerciseCards[0].click();
      await exerciseCards[1].click();
      await exerciseCards[2].click();
      console.log("✅ Wybrano 3 ćwiczenia");
    } else {
      throw new Error("Za mało ćwiczeń w katalogu!");
    }

    // Sprawdź czy banner pokazuje wybrane ćwiczenia
    await expect(page.getByTestId("selected-count-banner")).toBeVisible();
    await expect(page.getByTestId("selected-count-banner")).toContainText("3");

    // Kliknij "Dalej"
    await page.getByTestId("wizard-next-button").click();

    // Sprawdź czy jesteśmy w Step 3 (czekamy aż URL się zaktualizuje)
    await expect(page).toHaveURL(/\/plans\/create\?step=3/, { timeout: 10000 });
    console.log("✅ STEP 2 completed");

    // ==========================================
    // STEP 3: Konfiguracja serii (domyślne wartości)
    // ==========================================
    console.log("\n📍 STEP 3: Konfiguracja serii");

    // Poczekaj na załadowanie konfiguratora
    await page.waitForTimeout(1000); // Daj czas na inicjalizację

    // Sprawdź czy przycisk "Zapisz plan" jest widoczny
    await expect(page.getByTestId("wizard-save-button")).toBeVisible();

    // W Step 3 domyślnie każde ćwiczenie ma 1 serię z domyślnymi wartościami
    // Możemy od razu zapisać plan
    console.log("✅ Domyślne serie zaakceptowane");

    // Kliknij "Zapisz plan" - poczekaj na request POST /api/plans
    console.log("🔄 Klikam przycisk Zapisz plan...");

    // Czekamy na request do API i nawigację
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/plans") && response.request().method() === "POST",
      { timeout: 30000 }
    );

    await page.getByTestId("wizard-save-button").click();

    console.log("⏳ Czekam na odpowiedź z serwera...");
    await responsePromise;
    console.log("📤 Request zapisu planu został wysłany i otrzymano odpowiedź");

    // ==========================================
    // VERIFY: Sprawdź czy plan pojawił się na liście
    // ==========================================
    console.log("\n📍 VERIFY: Sprawdzanie czy plan został utworzony");

    // Poczekaj na przekierowanie do /plans
    await expect(page).toHaveURL(/\/plans$/, { timeout: 20000 });
    console.log("✅ Przekierowano do listy planów");

    // Sprawdź czy plan jest na liście
    const planLink = page.getByRole("link", { name: new RegExp(testPlanName) });
    await expect(planLink).toBeVisible({ timeout: 5000 });
    console.log(`✅ Plan "${testPlanName}" jest widoczny na liście!`);

    // ==========================================
    // PODSUMOWANIE
    // ==========================================
    console.log("\n" + "=".repeat(60));
    console.log("🎉 TEST ZAKOŃCZONY POMYŚLNIE!");
    console.log("=".repeat(60));
    console.log("✅ Step 1: Wypełniono podstawowe informacje");
    console.log("✅ Step 2: Wybrano 3 ćwiczenia");
    console.log("✅ Step 3: Zaakceptowano domyślne serie");
    console.log("✅ Plan został zapisany");
    console.log(`✅ Plan "${testPlanName}" pojawił się na liście`);
    console.log("\n🎊 Pełny flow tworzenia planu działa poprawnie!");
  });
});
