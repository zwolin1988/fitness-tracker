# E2E Test IDs - Scenariusz: Tworzenie Nowego Planu Treningowego

## 📋 Scenariusz Testowy

### User Story:
Jako zalogowany użytkownik, chcę utworzyć nowy plan treningowy, aby móc zaplanować swoje treningi.

### Kroki testowe:
1. Kliknij "Plany treningowe" w Navigation
2. Kliknij button "Nowy plan"
3. Wypełnij Step 1: nazwa, opis, cel treningowy
4. Kliknij "Dalej"

---

## 🎯 Dodane atrybuty `data-testid`

### 0. Login Form Component

**Plik:** `src/components/auth/LoginForm.tsx`

```tsx
{/* Email input */}
<Input
  id="email"
  type="email"
  data-testid="login-email-input"
  value={email}
  onChange={handleEmailChange}
/>

{/* Password input */}
<Input
  id="password"
  type="password"
  data-testid="login-password-input"
  value={password}
  onChange={handlePasswordChange}
/>

{/* Submit button */}
<Button type="submit" data-testid="login-submit-button">
  Zaloguj się
</Button>
```

**Test selektory:**
```typescript
// Login flow
await page.goto("/auth/login");
await page.getByTestId("login-email-input").fill("user@example.com");
await page.getByTestId("login-password-input").fill("password123");
await page.getByTestId("login-submit-button").click();
await page.waitForURL("/dashboard");
```

**Auth Helper:**
```typescript
// e2e/helpers/auth.ts - używa danych z .env
import { loginAsUser } from "../helpers/auth";

// W teście:
await loginAsUser(page);  // automatycznie bierze USERNAME i PASSWORD z .env
```

---

### 1. Navigation Component

**Plik:** `src/components/Navigation.astro`

```html
<!-- Desktop Navigation -->
<a href="/plans" data-testid="nav-plans-link">
  Plany treningowe
</a>

<!-- Mobile Navigation -->
<a href="/plans" data-mobile-link data-testid="nav-plans-link-mobile">
  Plany treningowe
</a>
```

**Test selektory:**
```typescript
// Desktop
await page.click('[data-testid="nav-plans-link"]');

// Mobile (sprawdź breakpoint)
await page.click('[data-testid="nav-plans-link-mobile"]');
```

---

### 2. Plans List Component

**Plik:** `src/components/training-plan/PlansList.tsx`

```tsx
{/* Header button - gdy są plany */}
<Button data-testid="create-new-plan-button" onClick={handleNewPlan}>
  <Plus className="mr-2 h-4 w-4" />
  Nowy plan
</Button>

{/* Empty state button - gdy brak planów */}
<Button data-testid="create-first-plan-button" onClick={handleNewPlan}>
  <Plus className="mr-2 h-4 w-4" />
  Utwórz pierwszy plan
</Button>
```

**Test selektory:**
```typescript
// Gdy user ma już plany
await page.click('[data-testid="create-new-plan-button"]');

// Gdy user nie ma jeszcze planów (pierwszy plan)
await page.click('[data-testid="create-first-plan-button"]');
```

---

### 3. Plan Basics Form (Step 1)

**Plik:** `src/components/training-plan/PlanBasicsForm.tsx`

```tsx
{/* Form container */}
<form data-testid="plan-basics-form" onSubmit={handleSubmit}>

{/* Nazwa planu */}
<Input
  id="plan-name"
  data-testid="plan-name-input"
  placeholder="np. Trening siłowy górnej partii"
  value={formData.name}
/>

{/* Opis planu */}
<Textarea
  id="plan-description"
  data-testid="plan-description-textarea"
  placeholder="Krótki opis Twojego planu treningowego..."
  value={formData.description}
/>

{/* Cele treningowe (4 radio buttons) */}
<input
  type="radio"
  name="training-goal"
  value="strength"
  data-testid="plan-goal-strength"
/>
<input
  type="radio"
  name="training-goal"
  value="muscle_mass"
  data-testid="plan-goal-muscle_mass"
/>
<input
  type="radio"
  name="training-goal"
  value="endurance"
  data-testid="plan-goal-endurance"
/>
<input
  type="radio"
  name="training-goal"
  value="general_fitness"
  data-testid="plan-goal-general_fitness"
/>

{/* Footer buttons */}
<Button data-testid="plan-basics-cancel-button" onClick={onCancel}>
  Anuluj
</Button>
<Button data-testid="plan-basics-next-button" type="submit">
  Dalej
</Button>
```

**Test selektory:**
```typescript
// Wypełnienie formularza
await page.fill('[data-testid="plan-name-input"]', 'Mój plan treningowy');
await page.fill('[data-testid="plan-description-textarea"]', 'Opis mojego planu');

// Wybór celu treningowego (jeden z 4)
await page.click('[data-testid="plan-goal-strength"]');
// LUB
await page.click('[data-testid="plan-goal-muscle_mass"]');
// LUB
await page.click('[data-testid="plan-goal-endurance"]');
// LUB
await page.click('[data-testid="plan-goal-general_fitness"]');

// Kliknięcie "Dalej"
await page.click('[data-testid="plan-basics-next-button"]');

// Opcjonalnie: Anulowanie
await page.click('[data-testid="plan-basics-cancel-button"]');
```

---

## 📝 Przykładowy Test E2E (Playwright)

```typescript
// e2e/training-plans/create-plan.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Tworzenie nowego planu treningowego', () => {
  test.beforeEach(async ({ page }) => {
    // Zaloguj się (assume login helper exists)
    await loginAsUser(page, 'test@example.com', 'password123');
  });

  test('powinien utworzyć nowy plan - full flow Step 1', async ({ page }) => {
    // 1. Kliknij "Plany treningowe" w Navigation
    await page.click('[data-testid="nav-plans-link"]');
    await expect(page).toHaveURL(/\/plans$/);

    // 2. Kliknij "Nowy plan"
    // Użyj odpowiedniego przycisku w zależności czy są plany
    const hasPlans = await page.isVisible('[data-testid="create-new-plan-button"]');
    if (hasPlans) {
      await page.click('[data-testid="create-new-plan-button"]');
    } else {
      await page.click('[data-testid="create-first-plan-button"]');
    }

    // Sprawdź przekierowanie do strony tworzenia
    await expect(page).toHaveURL(/\/plans\/create/);
    await expect(page.locator('[data-testid="plan-basics-form"]')).toBeVisible();

    // 3. Wypełnij Step 1: nazwa
    await page.fill('[data-testid="plan-name-input"]', 'Trening siłowy FBW');

    // 4. Wypełnij opis (opcjonalnie)
    await page.fill(
      '[data-testid="plan-description-textarea"]',
      'Full body workout na 3 razy w tygodniu'
    );

    // 5. Wybierz cel treningowy (np. Siła)
    await page.click('[data-testid="plan-goal-strength"]');

    // Sprawdź czy przycisk "Dalej" jest enabled
    const nextButton = page.locator('[data-testid="plan-basics-next-button"]');
    await expect(nextButton).toBeEnabled();

    // 6. Kliknij "Dalej"
    await nextButton.click();

    // Sprawdź przekierowanie do Step 2
    await expect(page).toHaveURL(/\/plans\/create\?step=2/);
    // TODO: Dodaj test IDs dla Step 2 (ExerciseSelector)
  });

  test('powinien walidować wymagane pola w Step 1', async ({ page }) => {
    await page.goto('/plans/create');

    // Próba kliknięcia "Dalej" bez wypełnienia nazwy
    const nextButton = page.locator('[data-testid="plan-basics-next-button"]');

    // Sprawdź czy przycisk jest disabled gdy brak nazwy
    await expect(nextButton).toBeDisabled();

    // Wypełnij zbyt krótką nazwę (< 3 znaki)
    await page.fill('[data-testid="plan-name-input"]', 'AB');
    await page.blur('[data-testid="plan-name-input"]');

    // Sprawdź komunikat błędu
    await expect(page.locator('text=Nazwa musi mieć co najmniej 3 znaki')).toBeVisible();
    await expect(nextButton).toBeDisabled();

    // Wypełnij poprawną nazwę
    await page.fill('[data-testid="plan-name-input"]', 'Trening ABC');
    await expect(nextButton).toBeEnabled();
  });

  test('powinien anulować tworzenie planu', async ({ page }) => {
    await page.goto('/plans/create');

    // Wypełnij formularz
    await page.fill('[data-testid="plan-name-input"]', 'Test Plan');
    await page.click('[data-testid="plan-goal-endurance"]');

    // Kliknij "Anuluj"
    await page.click('[data-testid="plan-basics-cancel-button"]');

    // Sprawdź przekierowanie z powrotem do listy planów
    await expect(page).toHaveURL(/\/plans$/);
  });

  test('powinien obsługiwać mobile navigation', async ({ page }) => {
    // Ustaw viewport na mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Kliknij mobile menu button
    await page.click('[id="menu-button"]');

    // Kliknij "Plany treningowe" w mobile menu
    await page.click('[data-testid="nav-plans-link-mobile"]');

    await expect(page).toHaveURL(/\/plans$/);
  });
});
```

---

## 🔍 Mapa testów dla całego scenariusza

### ✅ Zaimplementowane (Step 1)

| Akcja | Selektor | Status |
|-------|----------|--------|
| Klik "Plany treningowe" (desktop) | `[data-testid="nav-plans-link"]` | ✅ |
| Klik "Plany treningowe" (mobile) | `[data-testid="nav-plans-link-mobile"]` | ✅ |
| Klik "Nowy plan" (z planami) | `[data-testid="create-new-plan-button"]` | ✅ |
| Klik "Utwórz pierwszy plan" (bez planów) | `[data-testid="create-first-plan-button"]` | ✅ |
| Wypełnij nazwę planu | `[data-testid="plan-name-input"]` | ✅ |
| Wypełnij opis planu | `[data-testid="plan-description-textarea"]` | ✅ |
| Wybierz cel: Siła | `[data-testid="plan-goal-strength"]` | ✅ |
| Wybierz cel: Masa mięśniowa | `[data-testid="plan-goal-muscle_mass"]` | ✅ |
| Wybierz cel: Wytrzymałość | `[data-testid="plan-goal-endurance"]` | ✅ |
| Wybierz cel: Ogólna sprawność | `[data-testid="plan-goal-general_fitness"]` | ✅ |
| Klik "Dalej" | `[data-testid="plan-basics-next-button"]` | ✅ |
| Klik "Anuluj" | `[data-testid="plan-basics-cancel-button"]` | ✅ |

### ⏳ Do zaimplementowania (Step 2 & 3)

**Step 2 - ExerciseSelector:**
- `[data-testid="exercise-search-input"]` - wyszukiwarka ćwiczeń
- `[data-testid="category-filter-dropdown"]` - filtr kategorii
- `[data-testid="difficulty-filter-dropdown"]` - filtr poziomu trudności
- `[data-testid="exercise-card-{id}"]` - karta ćwiczenia
- `[data-testid="exercise-checkbox-{id}"]` - checkbox wyboru ćwiczenia
- `[data-testid="selected-count-banner"]` - banner z liczbą wybranych
- `[data-testid="step2-back-button"]` - przycisk "Wstecz"
- `[data-testid="step2-next-button"]` - przycisk "Dalej"

**Step 3 - ExerciseSetConfigurator:**
- `[data-testid="exercise-accordion-{id}"]` - accordion ćwiczenia
- `[data-testid="set-row-{exerciseId}-{setIndex}"]` - wiersz serii
- `[data-testid="set-reps-input-{exerciseId}-{setIndex}"]` - input powtórzeń
- `[data-testid="set-weight-input-{exerciseId}-{setIndex}"]` - input ciężaru
- `[data-testid="add-set-button-{exerciseId}"]` - dodaj serię
- `[data-testid="remove-set-button-{exerciseId}-{setIndex}"]` - usuń serię
- `[data-testid="remove-exercise-button-{exerciseId}"]` - usuń ćwiczenie
- `[data-testid="step3-back-button"]` - przycisk "Wstecz"
- `[data-testid="step3-save-button"]` - przycisk "Zapisz plan"

---

## 🎓 Konwencja nazewnictwa data-testid

### Wzorce użyte w projekcie:

1. **Navigation links:**
   - Pattern: `nav-{page}-link`
   - Przykład: `nav-plans-link`, `nav-dashboard-link`
   - Mobile variant: dodaj suffix `-mobile`

2. **Buttons (akcje):**
   - Pattern: `{action}-{context}-button`
   - Przykład: `create-new-plan-button`, `plan-basics-next-button`

3. **Form inputs:**
   - Pattern: `{field-name}-input` lub `{field-name}-textarea`
   - Przykład: `plan-name-input`, `plan-description-textarea`

4. **Radio buttons / Checkboxes:**
   - Pattern: `{field-name}-{value}`
   - Przykład: `plan-goal-strength`, `plan-goal-muscle_mass`

5. **Forms:**
   - Pattern: `{form-name}-form`
   - Przykład: `plan-basics-form`

6. **Lists & Cards (z ID):**
   - Pattern: `{component}-{id}`
   - Przykład: `exercise-card-ex1`, `plan-card-123`

7. **Action buttons w kontekście:**
   - Pattern: `{action}-{item}-{id}-button`
   - Przykład: `remove-exercise-ex1-button`

---

## 📚 Best Practices

### ✅ DO:
- Używaj kebab-case dla wartości data-testid
- Używaj opisowych nazw (np. `create-new-plan-button` zamiast `btn1`)
- Dodawaj data-testid do kluczowych elementów interakcji
- Zachowaj spójność nazewnictwa w całym projekcie
- Dla elementów dynamicznych (listy) dodawaj ID: `exercise-card-{id}`

### ❌ DON'T:
- Nie używaj camelCase lub PascalCase
- Nie używaj wartości zależnych od tekstu UI (`data-testid="Nowy plan"`)
- Nie duplikuj data-testid (muszą być unikalne)
- Nie używaj data-testid dla elementów czysto prezentacyjnych
- Nie mieszaj języków (używaj angielskiego)

---

## 🏗️ Page Object Model (POM)

Zaimplementowano wzorzec Page Object Model zgodnie z wytycznymi Playwright w `./e2e/page-objects`:

### Klasy POM:

#### 1. **NavigationPage** (`e2e/page-objects/NavigationPage.ts`)

Reprezentuje komponent nawigacji głównej aplikacji.

**Główne metody:**
- `clickPlansLink()` - nawigacja desktop do planów treningowych
- `clickPlansLinkMobile()` - nawigacja mobile (automatycznie otwiera menu)
- `navigateToPlans()` - uniwersalna metoda (auto-wykrywa desktop/mobile)
- `expectPlansPage()` - weryfikacja nawigacji do strony planów
- `isMobile()` - sprawdza czy używany jest widok mobilny

**Lokatory:**
```typescript
readonly plansLinkDesktop: Locator;     // page.getByTestId("nav-plans-link")
readonly plansLinkMobile: Locator;      // page.getByTestId("nav-plans-link-mobile")
readonly mobileMenuButton: Locator;     // page.locator("#menu-button")
```

**Przykład użycia:**
```typescript
const navigationPage = new NavigationPage(page);
await navigationPage.navigateToPlans();
await navigationPage.expectPlansPage();
```

---

#### 2. **PlansListPage** (`e2e/page-objects/PlansListPage.ts`)

Reprezentuje stronę listy planów treningowych.

**Główne metody:**
- `goto()` - przejście do `/plans`
- `hasPlans()` - sprawdza czy użytkownik ma jakieś plany
- `clickCreateNewPlan()` - klik "Nowy plan" (gdy użytkownik ma plany)
- `clickCreateFirstPlan()` - klik "Utwórz pierwszy plan" (gdy brak planów)
- `clickCreatePlan()` - uniwersalna metoda (auto-wykrywa stan)
- `expectCreatePage()` - weryfikacja nawigacji do `/plans/create`
- `isCreateButtonDisabled()` - sprawdza limit 7 planów
- `getPlanCount()` - zwraca liczbę planów użytkownika

**Lokatory:**
```typescript
readonly createNewPlanButton: Locator;      // page.getByTestId("create-new-plan-button")
readonly createFirstPlanButton: Locator;    // page.getByTestId("create-first-plan-button")
readonly pageTitle: Locator;                // page.getByRole("heading", { name: "Twoje Plany Treningowe" })
```

**Przykład użycia:**
```typescript
const plansListPage = new PlansListPage(page);
await plansListPage.goto();
await plansListPage.clickCreatePlan();
await plansListPage.expectCreatePage();
```

---

#### 3. **PlanBasicsPage** (`e2e/page-objects/PlanBasicsPage.ts`)

Reprezentuje formularz Step 1 kreatora planu treningowego.

**Główne metody:**
- `goto()` - przejście do `/plans/create`
- `fillPlanName(name: string)` - wypełnienie nazwy planu
- `fillDescription(description: string)` - wypełnienie opisu
- `selectGoal(goal: PlanGoal)` - wybór celu treningowego
- `clickNext()` - przejście do Step 2
- `clickCancel()` - anulowanie tworzenia planu
- `fillAndSubmit(name, description, goal)` - wypełnienie całego formularza i submit
- `fillRequiredAndSubmit(name, goal)` - wypełnienie tylko wymaganych pól
- `isNextButtonEnabled()` / `isNextButtonDisabled()` - sprawdzenie stanu przycisku
- `getNameError()` / `getDescriptionError()` - pobranie komunikatów błędów
- `expectStep2()` - weryfikacja nawigacji do Step 2
- `expectFormLoaded()` - weryfikacja załadowania formularza
- `getPlanNameValue()` / `getDescriptionValue()` - pobranie wartości pól
- `getSelectedGoal()` - sprawdzenie wybranego celu

**Typ PlanGoal:**
```typescript
export type PlanGoal = "strength" | "muscle_mass" | "endurance" | "general_fitness";
```

**Lokatory:**
```typescript
readonly form: Locator;                       // page.getByTestId("plan-basics-form")
readonly planNameInput: Locator;              // page.getByTestId("plan-name-input")
readonly planDescriptionTextarea: Locator;    // page.getByTestId("plan-description-textarea")
readonly goalStrengthRadio: Locator;          // page.getByTestId("plan-goal-strength")
readonly goalMuscleMassRadio: Locator;        // page.getByTestId("plan-goal-muscle_mass")
readonly goalEnduranceRadio: Locator;         // page.getByTestId("plan-goal-endurance")
readonly goalGeneralFitnessRadio: Locator;    // page.getByTestId("plan-goal-general_fitness")
readonly cancelButton: Locator;               // page.getByTestId("plan-basics-cancel-button")
readonly nextButton: Locator;                 // page.getByTestId("plan-basics-next-button")
```

**Przykład użycia:**
```typescript
const planBasicsPage = new PlanBasicsPage(page);
await planBasicsPage.goto();
await planBasicsPage.fillAndSubmit("Mój plan", "Opis planu", "strength");
await planBasicsPage.expectStep2();
```

---

### Barrel Export

Wszystkie klasy POM są eksportowane przez `e2e/page-objects/index.ts`:

```typescript
export { NavigationPage } from "./NavigationPage";
export { PlansListPage } from "./PlansListPage";
export { PlanBasicsPage, type PlanGoal } from "./PlanBasicsPage";
```

**Import w testach:**
```typescript
import { NavigationPage, PlansListPage, PlanBasicsPage } from "../page-objects";
```

---

### Przykład testu z POM (AAA Pattern)

```typescript
test('powinien utworzyć nowy plan - full flow Step 1', async ({ page }) => {
  // Arrange - Initialize Page Objects
  const navigationPage = new NavigationPage(page);
  const plansListPage = new PlansListPage(page);
  const planBasicsPage = new PlanBasicsPage(page);

  // Act & Assert - Navigate to Plans page
  await navigationPage.navigateToPlans();
  await plansListPage.expectPageLoaded();

  // Act & Assert - Click "Nowy plan" button
  await plansListPage.clickCreatePlan();
  await planBasicsPage.expectFormLoaded();

  // Act - Fill form and submit
  await planBasicsPage.fillAndSubmit(
    "Trening siłowy FBW",
    "Full body workout na 3 razy w tygodniu",
    "strength"
  );

  // Assert - Should navigate to Step 2
  await planBasicsPage.expectStep2();
});
```

---

### Zalety POM:

✅ **Reużywalność** - każda klasa może być użyta w wielu testach
✅ **Utrzymywalność** - zmiany w UI wymagają aktualizacji tylko w jednym miejscu
✅ **Czytelność** - testy są bardziej deklaratywne i zrozumiałe
✅ **Type safety** - TypeScript zapewnia bezpieczeństwo typów
✅ **Zgodność z Playwright guidelines** - używa `page.getByTestId()`
✅ **AAA Pattern** - testy zgodne z wzorcem Arrange-Act-Assert

---

## 🚀 Następne kroki

1. **Dodać test IDs dla Step 2** (ExerciseSelector)
2. **Dodać test IDs dla Step 3** (ExerciseSetConfigurator)
3. **Utworzyć POM dla Step 2** (ExerciseSelectorPage)
4. **Utworzyć POM dla Step 3** (ExerciseSetConfiguratorPage)
5. **Napisać kompletne testy E2E** dla pełnego flow (Step 1-3)
6. **Dodać authentication helper** dla testów wymagających logowania
7. **Dodać visual regression tests** (opcjonalnie)

---

**Utworzono przez:** Claude Code
**Data utworzenia:** 2025-10-17
**Ostatnia aktualizacja:** 2025-10-18
**Status:** ✅ Step 1 + Auth complete + POM implemented, Steps 2-3 pending

---

## 🔐 Autentykacja w testach E2E

### ✅ Zaimplementowane!

**Auth Helper:** `e2e/helpers/auth.ts`
- Używa prawdziwego flow logowania przez `/auth/login`
- Automatycznie pobiera dane z `.env`:
  - `USERNAME=user@fitness-tracker.local`
  - `PASSWORD=User123!@#`
- Test IDs dodane do `LoginForm.tsx`

**Konfiguracja Playwright:**
```typescript
// playwright.config.ts
import dotenv from "dotenv";
dotenv.config();  // Ładuje zmienne z .env
```

**Użycie w testach:**
```typescript
import { loginAsUser } from "../helpers/auth";

test.beforeEach(async ({ page }) => {
  await loginAsUser(page);  // Automatyczne logowanie z danych z .env
});
```

**Test IDs logowania:**
- `login-email-input` - Input email
- `login-password-input` - Input hasło
- `login-submit-button` - Przycisk "Zaloguj się"
