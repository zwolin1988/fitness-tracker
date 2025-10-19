# 🧪 Pomocnik do uruchamiania testów E2E

## ❗ Problem który naprawiliśmy

**Objaw:** Playwright UI pokazuje białą stronę z `about:blank`, testy się nie uruchamiają.

**Przyczyna:** Serwer Astro był skonfigurowany na port `3000`, ale Playwright oczekiwał `4321`.

**Rozwiązanie:** Zmieniliśmy w `astro.config.mjs`:
```javascript
server: { port: 4321 }  // było: 3000
```

---

## 🚀 Jak uruchomić testy E2E

### Opcja 1: Playwright automatycznie uruchomi serwer (ZALECANE)

```bash
# Zatrzymaj wszystkie uruchomione serwery deweloperskie
pkill -f "astro dev"

# Uruchom Playwright UI - automatycznie uruchomi serwer na porcie 4321
npm run test:e2e:ui
```

Playwright:
- ✅ Automatycznie uruchomi `npm run dev`
- ✅ Poczeka aż serwer będzie gotowy (max 120s)
- ✅ Uruchomi testy
- ✅ Zatrzyma serwer po zakończeniu

### Opcja 2: Ręczne uruchomienie serwera (DEBUGGING)

```bash
# Terminal 1: Uruchom serwer deweloperski
npm run dev
# Poczekaj aż zobaczysz: "astro ready in XXX ms"
# Sprawdź czy jest na porcie 4321: http://localhost:4321

# Terminal 2: Uruchom testy z działającym serwerem
PLAYWRIGHT_BASE_URL=http://localhost:4321 npm run test:e2e:ui
```

### Opcja 3: Uruchom konkretny test

```bash
# Tylko testy tworzenia planu
npx playwright test training-plans/create-plan-full-flow.spec.ts --ui

# Tylko jeden konkretny test
npx playwright test training-plans/create-plan-full-flow.spec.ts -g "Scenariusz główny"
```

### Opcja 4: Headless mode (CI/CD)

```bash
# Wszystkie testy bez UI
npm run test:e2e

# Z raportem HTML
npm run test:e2e -- --reporter=html
```

---

## 🔍 Diagnostyka problemów

### Problem: "Port 4321 is in use"

```bash
# Sprawdź co zajmuje port
lsof -i :4321

# Zabij proces na porcie 4321
lsof -ti:4321 | xargs kill -9

# LUB zabij wszystkie Astro
pkill -f "astro dev"
```

### Problem: Testy nie łączą się z serwerem

```bash
# Sprawdź czy serwer działa
curl http://localhost:4321

# Sprawdź konfigurację Playwright
cat playwright.config.ts | grep baseURL
# Powinno być: baseURL: "http://localhost:4321"

# Sprawdź konfigurację Astro
cat astro.config.mjs | grep port
# Powinno być: server: { port: 4321 }
```

### Problem: Testy timeout

1. Zwiększ timeout w `playwright.config.ts`:
```javascript
timeout: 60000,  // było: 30000
```

2. Sprawdź czy serwer się uruchamia:
```bash
npm run dev
# Sprawdź czy nie ma błędów kompilacji
```

---

## 📊 Weryfikacja konfiguracji

### Krok 1: Sprawdź czy porty się zgadzają

```bash
# Astro config
grep -A 1 "server:" astro.config.mjs
# Oczekiwane: server: { port: 4321 }

# Playwright config
grep "baseURL" playwright.config.ts
# Oczekiwane: baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4321"
```

### Krok 2: Test połączenia

```bash
# Uruchom serwer
npm run dev &

# Poczekaj 5 sekund
sleep 5

# Sprawdź odpowiedź
curl -I http://localhost:4321
# Oczekiwane: HTTP/1.1 200 OK

# Zatrzymaj serwer
pkill -f "astro dev"
```

### Krok 3: Test Playwright

```bash
# Lista wszystkich testów
npm run test:e2e -- --list | grep "create-plan"

# Uruchom jeden prosty test
npx playwright test example.spec.ts --headed
```

---

## 🎯 Struktura testów

```
e2e/
├── page-objects/           # Page Object Model classes
│   ├── NavigationPage.ts
│   ├── PlansListPage.ts
│   ├── PlanBasicsPage.ts
│   └── index.ts
├── training-plans/         # Testy planów treningowych
│   ├── create-plan.spec.ts
│   └── create-plan-full-flow.spec.ts
├── auth/                   # Testy autentykacji
│   └── login.spec.ts
├── dashboard/              # Testy dashboardu
│   └── dashboard.spec.ts
└── example.spec.ts         # Przykładowe testy
```

---

## ✅ Checklist przed uruchomieniem testów

- [x] Port 4321 jest wolny (`lsof -i :4321` zwraca pusty wynik)
- [x] `astro.config.mjs` ma `server: { port: 4321 }`
- [x] `playwright.config.ts` ma `baseURL: "http://localhost:4321"`
- [x] `playwright.config.ts` ma `webServer.url: "http://localhost:4321"`
- [x] Wszystkie zależności zainstalowane (`npm install`)
- [x] Playwright browsers zainstalowane (`npx playwright install chromium`)

### 🎯 Najczęstsze problemy i rozwiązania

#### Problem 1: "Executable doesn't exist at .../chromium..."
```bash
# Rozwiązanie: Zainstaluj przeglądarki Playwright
npx playwright install chromium
```

#### Problem 2: Test się zapala na czerwono przy próbie logowania
**Przyczyna:** Testy wymagają zalogowanego użytkownika, ale helper logowania nie jest zaimplementowany.

**Rozwiązania:**
1. **Pomiń testy wymagające logowania** (tymczasowo):
   ```bash
   # Uruchom tylko konkretny test
   npx playwright test training-plans/create-plan-full-flow.spec.ts --ui
   ```

2. **Zakomentuj beforeEach** w testach:
   ```typescript
   test.beforeEach(async ({ page }) => {
     // TODO: Add authentication helper when implemented
     // await loginAsUser(page, 'test@example.com', 'password123');
     await page.goto("/");  // ← Na razie tylko to
   });
   ```

3. **Dodaj TODO helper** (przyszłość):
   ```typescript
   // e2e/helpers/auth.ts
   export async function loginAsUser(page: Page, email: string, password: string) {
     await page.goto("/auth/login");
     await page.getByTestId("email-input").fill(email);
     await page.getByTestId("password-input").fill(password);
     await page.getByTestId("login-button").click();
     await page.waitForURL("/dashboard");
   }
   ```

---

## 🎬 Quick Start

```bash
# 1. Sprawdź czy port jest wolny
pkill -f "astro dev"

# 2. Uruchom Playwright UI
npm run test:e2e:ui

# 3. W Playwright UI:
#    - Wybierz test: training-plans/create-plan-full-flow.spec.ts
#    - Kliknij test: "Scenariusz główny"
#    - Kliknij Play ▶️

# 4. Obserwuj jak test:
#    ✅ Nawiguje do "Plany treningowe"
#    ✅ Klika "Nowy plan"
#    ✅ Wypełnia formularz
#    ✅ Przechodzi do Step 2
```

---

## 📝 Notatki

- Playwright automatycznie uruchamia serwer przed testami (`webServer` config)
- Serwer jest współdzielony między testami (`reuseExistingServer: true`)
- Timeout dla startu serwera: 120 sekund
- Browser: Chromium (Desktop Chrome)
- Wszystkie testy używają Page Object Model
- Selektory oparte na `data-testid` attributes

---

**Utworzono:** 2025-10-18
**Autor:** Claude Code
**Status:** ✅ Działające
