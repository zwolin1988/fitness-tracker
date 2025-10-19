# 🧪 E2E Tests - Instrukcja Uruchomienia

## ✅ Wszystko gotowe do uruchomienia!

Przeglądarki Playwright zostały zainstalowane, konfiguracja poprawiona, testy gotowe do działania.

---

## 🚀 Quick Start (3 kroki)

### 1️⃣ Zatrzymaj wszystkie serwery deweloperskie

```bash
pkill -f "astro dev"
```

### 2️⃣ Uruchom Playwright UI

```bash
npm run test:e2e:ui
```

### 3️⃣ Uruchom test w Playwright UI

1. Poczekaj aż serwer Astro się uruchomi (automatycznie)
2. Znajdź: `training-plans/create-plan-full-flow.spec.ts`
3. Kliknij test: **"Scenariusz główny: Użytkownik tworzy nowy plan treningowy (Step 1)"**
4. Kliknij Play ▶️
5. Obserwuj jak test działa!

---

## 📁 Struktura testów E2E

```
e2e/
├── page-objects/              # Page Object Model classes
│   ├── NavigationPage.ts      # Nawigacja główna
│   ├── PlansListPage.ts       # Lista planów treningowych
│   ├── PlanBasicsPage.ts      # Formularz Step 1
│   └── index.ts               # Barrel export
│
├── helpers/                   # Pomocnicze funkcje
│   └── auth.ts                # Autentykacja (placeholder)
│
├── training-plans/            # Testy planów treningowych
│   ├── create-plan.spec.ts            # Podstawowe testy
│   └── create-plan-full-flow.spec.ts  # Kompletne testy z logowaniem
│
├── auth/                      # Testy autentykacji
│   └── login.spec.ts
│
├── dashboard/                 # Testy dashboardu
│   └── dashboard.spec.ts
│
├── example.spec.ts            # Przykładowe testy
└── README.md                  # Ten plik
```

---

## 🎯 Dostępne testy treningowe

### `create-plan-full-flow.spec.ts` - 7 testów demonstracyjnych:

1. ✅ **Scenariusz główny** - Pełny flow tworzenia planu (Step 1)
   - Nawigacja → Klik "Nowy plan" → Wypełnienie formularza → Przejście do Step 2

2. ✅ **Scenariusz alternatywny** - Anulowanie tworzenia planu
   - Testuje przycisk "Anuluj" i powrót do listy

3. ✅ **Scenariusz walidacji** - Testowanie błędów formularza
   - Za krótka nazwa, komunikaty błędów, stan przycisku

4. ✅ **Scenariusz mobile** - Nawigacja na urządzeniu mobilnym
   - iPhone 12 viewport, menu mobilne

5. ✅ **Demonstracja celów** - Test wszystkich 4 celów treningowych
   - Strength, Muscle Mass, Endurance, General Fitness

6. ✅ **Przykład fillAndSubmit** - Metoda convenience
   - Wypełnienie całego formularza w jednej linii

7. ✅ **Edge case** - Limit 7 planów
   - Sprawdzanie disabled state przy limicie

---

## 🔧 Konfiguracja

### Porty i adresy:

- **Serwer Astro:** `http://localhost:4321`
- **Playwright baseURL:** `http://localhost:4321`
- **Automatyczne uruchomienie:** ✅ Tak (webServer config)

### Browser:

- **Chromium** (Desktop Chrome) - zgodnie z guidelines Playwright

### Page Object Model:

Wszystkie testy używają wzorca POM:
- ✅ Reużywalne klasy stron
- ✅ Czytelne testy (AAA pattern)
- ✅ Łatwa konserwacja
- ✅ Type safety (TypeScript)

---

## 📊 Różne sposoby uruchamiania testów

### 1. UI Mode (interactive, zalecane do development)

```bash
npm run test:e2e:ui
```

### 2. Headed mode (zobacz przeglądarkę)

```bash
npx playwright test training-plans/create-plan-full-flow.spec.ts --headed
```

### 3. Headless mode (szybkie, do CI/CD)

```bash
npm run test:e2e
```

### 4. Konkretny test

```bash
# Jeden plik
npx playwright test training-plans/create-plan-full-flow.spec.ts

# Jeden test po nazwie
npx playwright test -g "Scenariusz główny"

# Debug mode (zatrzymuje się na błędach)
npx playwright test --debug
```

### 5. Z raportem HTML

```bash
npm run test:e2e -- --reporter=html
npx playwright show-report
```

---

## 🐛 Rozwiązywanie problemów

### Problem: "Executable doesn't exist at .../chromium..."

**Rozwiązanie:**
```bash
npx playwright install chromium
```

### Problem: "Port 4321 is in use"

**Rozwiązanie:**
```bash
# Zabij wszystkie Astro
pkill -f "astro dev"

# LUB zabij konkretny port
lsof -ti:4321 | xargs kill -9
```

### Problem: Test timeout

**Przyczyna:** Serwer Astro długo się uruchamia

**Rozwiązanie:**
1. Sprawdź czy nie ma błędów kompilacji: `npm run build`
2. Zwiększ timeout w `playwright.config.ts`:
   ```typescript
   webServer: {
     timeout: 180000,  // było: 120000
   }
   ```

### Problem: Testy failują przy logowaniu

**Rozwiązanie:** ✅ Autentykacja jest zaimplementowana!
- `e2e/helpers/auth.ts` - prawdziwy helper logowania
- Używa danych z `.env`: `USERNAME` i `PASSWORD`
- Wszystkie testy automatycznie się logują przed wykonaniem
- Dane logowania:
  ```
  USERNAME=user@fitness-tracker.local
  PASSWORD=User123!@#
  ```

**WAŻNE:** Upewnij się że masz plik `.env` z poprawnymi danymi!

---

## 📝 Selektory testowe (data-testid)

### Login Form:
- `login-email-input` - Input email
- `login-password-input` - Input hasło
- `login-submit-button` - Przycisk "Zaloguj się"

### Navigation:
- `nav-plans-link` - Link "Plany treningowe" (desktop)
- `nav-plans-link-mobile` - Link "Plany treningowe" (mobile)

### Plans List:
- `create-new-plan-button` - Przycisk "Nowy plan" (gdy są plany)
- `create-first-plan-button` - Przycisk "Utwórz pierwszy plan" (brak planów)

### Plan Basics Form (Step 1):
- `plan-basics-form` - Formularz
- `plan-name-input` - Input nazwy planu
- `plan-description-textarea` - Textarea opisu
- `plan-goal-strength` - Radio: Siła
- `plan-goal-muscle_mass` - Radio: Masa mięśniowa
- `plan-goal-endurance` - Radio: Wytrzymałość
- `plan-goal-general_fitness` - Radio: Ogólna sprawność
- `plan-basics-next-button` - Przycisk "Dalej"
- `plan-basics-cancel-button` - Przycisk "Anuluj"

---

## 🎓 Przykładowy kod testu

```typescript
import { expect, test } from "@playwright/test";
import { loginAsUser } from "../helpers/auth";
import { NavigationPage, PlansListPage, PlanBasicsPage } from "../page-objects";

test("Utwórz nowy plan", async ({ page }) => {
  // Arrange - Login automatically uses USERNAME/PASSWORD from .env
  await loginAsUser(page);
  const navigationPage = new NavigationPage(page);
  const plansListPage = new PlansListPage(page);
  const planBasicsPage = new PlanBasicsPage(page);

  // Act
  await navigationPage.navigateToPlans();
  await plansListPage.clickCreatePlan();
  await planBasicsPage.fillAndSubmit(
    "Mój plan",
    "Opis planu",
    "strength"
  );

  // Assert
  await planBasicsPage.expectStep2();
});
```

---

## 📚 Więcej informacji

- **Pełny helper guide:** `.ai/test-e2e-helper.md`
- **E2E Test IDs summary:** `.ai/e2e-test-ids-summary.md`
- **Playwright docs:** https://playwright.dev/docs/intro
- **Page Object Model:** https://playwright.dev/docs/pom

---

## ✅ Status

- [x] Playwright zainstalowany
- [x] Chromium browser pobrany
- [x] Konfiguracja poprawiona (port 4321)
- [x] Page Object Model zaimplementowany
- [x] 7 testów demonstracyjnych gotowych
- [x] **Autentykacja w pełni zaimplementowana** (używa danych z .env)
- [x] data-testid dodane do LoginForm
- [x] Dokumentacja kompletna

## 🔐 Wymagania

**Plik `.env` musi zawierać:**
```bash
USERNAME=user@fitness-tracker.local
PASSWORD=User123!@#
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=eyJhbGc...
```

Plik `.env` jest w `.gitignore` - nie zostanie dodany do repozytorium ✅

## 🎉 Wszystko gotowe!

```bash
npm run test:e2e:ui
```

**Miłego testowania! 🚀**
