# Plan Testów - Fitness Tracker

## 1. Wprowadzenie i cele testowania

### 1.1 Cele
Celem planu testów jest zapewnienie wysokiej jakości aplikacji Fitness Tracker poprzez:
- Weryfikację poprawności działania kluczowych funkcjonalności systemu śledzenia treningów
- Zapewnienie zgodności z wymaganiami technicznymi stosu technologicznego
- Identyfikację i eliminację defektów przed wdrożeniem produkcyjnym
- Walidację wydajności i dostępności aplikacji
- Zapewnienie bezpieczeństwa danych użytkowników

### 1.2 Zakres dokumentu
Niniejszy plan testów obejmuje strategię testowania aplikacji webowej Fitness Tracker zbudowanej w oparciu o Astro 5, React 19, TypeScript 5, Tailwind CSS 4 i Supabase (planowane).

## 2. Zakres testów

### 2.1 W zakresie testów
- Komponenty React (interaktywne UI)
- Komponenty Astro (statyczne widoki)
- Model danych treningowych (ExerciseTemplate, Workout, WorkoutExercise)
- Routing i nawigacja aplikacji
- System motywów (dark/light mode)
- Responsywność interfejsu
- Mock data helpers (przed migracją do Supabase)
- Custom hooks React
- Integracja z Supabase (gdy zaimplementowana)
- API endpoints (gdy zaimplementowane)
- Autentykacja i autoryzacja (gdy zaimplementowana)
- Integracja z Openrouter.ai (gdy zaimplementowana)

### 2.2 Poza zakresem testów
- Testowanie infrastruktury DigitalOcean (testowane na poziomie DevOps)
- Testowanie zewnętrznych serwisów (Supabase, Openrouter.ai) - zakładamy poprawność ich API
- Testowanie GitHub Actions workflows (testowane w ramach CI/CD)

## 3. Typy testów do przeprowadzenia

### 3.1 Testy jednostkowe (Unit Tests)
**Cel**: Weryfikacja poprawności działania pojedynczych funkcji, komponentów i modułów w izolacji.

**Zakres**:
- Modele domenowe (User, Goal, Workout, ExerciseTemplate, WorkoutExercise)
- Utility functions (cn() helper, mock data helpers)
- Custom React hooks
- Pure functions w serwisach

**Narzędzia**: Vitest, React Testing Library

**Pokrycie kodu**: Minimum 80% dla logiki biznesowej

### 3.2 Testy integracyjne (Integration Tests)
**Cel**: Weryfikacja współpracy między komponentami i modułami.

**Zakres**:
- Integracja komponentów React z Astro (hydratacja client:load)
- Przepływ danych między komponentami
- Integracja z Supabase (CRUD operations, autentykacja)
- API endpoints z bazą danych
- Middleware z API routes

**Narzędzia**: Vitest, Playwright, Supabase Test Helpers

### 3.3 Testy E2E (End-to-End Tests)
**Cel**: Weryfikacja pełnych scenariuszy użytkownika od początku do końca.

**Zakres**:
- Rejestracja i logowanie użytkownika
- Tworzenie i edycja planu treningowego
- Rozpoczynanie i kończenie sesji treningowej
- Przeglądanie historii treningów
- Ustawianie i śledzenie celów fitness
- Zmiana motywu (dark/light mode)

**Narzędzia**: Playwright

### 3.4 Testy komponentów (Component Tests)
**Cel**: Weryfikacja poprawności renderowania i interakcji komponentów UI.

**Zakres**:
- Wszystkie komponenty React w src/components/ui/
- Komponenty Astro z interaktywnymi elementami
- Responsywność komponentów
- Dostępność (a11y) komponentów

**Narzędzia**: Storybook, Vitest, React Testing Library, axe-core

### 3.5 Testy wydajnościowe (Performance Tests)
**Cel**: Weryfikacja czasu ładowania, responsywności i optymalizacji.

**Zakres**:
- Czas ładowania strony (First Contentful Paint, Time to Interactive)
- Wielkość bundle JavaScript
- Optymalizacja hydratacji React
- Wydajność renderowania list treningów
- Lighthouse score (minimum 90/100)

**Narzędzia**: Lighthouse, WebPageTest, Playwright Performance API

### 3.6 Testy bezpieczeństwa (Security Tests)
**Cel**: Identyfikacja luk bezpieczeństwa i podatności.

**Zakres**:
- Testy autentykacji i sesji
- Walidacja input sanitization (XSS protection)
- CSRF protection
- SQL injection (Supabase RLS policies)
- Bezpieczne przechowywanie tokenów
- Rate limiting API

**Narzędzia**: OWASP ZAP, npm audit, Snyk

### 3.7 Testy dostępności (Accessibility Tests)
**Cel**: Zapewnienie zgodności z WCAG 2.1 Level AA.

**Zakres**:
- Nawigacja klawiaturą
- Screen reader compatibility
- Kontrast kolorów (dark/light mode)
- ARIA labels i semantic HTML
- Focus management

**Narzędzia**: axe-core, Lighthouse, NVDA/VoiceOver

### 3.8 Testy regresji (Regression Tests)
**Cel**: Weryfikacja, że nowe zmiany nie zepsuły istniejącej funkcjonalności.

**Zakres**:
- Automatyczne uruchomienie testów jednostkowych i E2E po każdym commit
- Testy krytycznych ścieżek użytkownika
- Testy po aktualizacji dependencies

**Narzędzia**: GitHub Actions, Playwright, Vitest

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Moduł treningów

#### TC-W-001: Przeglądanie katalogu ćwiczeń
**Priorytet**: Wysoki
**Warunki wstępne**: Użytkownik zalogowany, mock data załadowane
**Kroki**:
1. Przejdź do strony /workouts
2. Wyświetl listę dostępnych ExerciseTemplate
3. Filtruj ćwiczenia po kategorii (strength, cardio, flexibility)
4. Filtruj po grupie mięśniowej
5. Sprawdź wyświetlanie detali ćwiczenia

**Oczekiwany rezultat**:
- Lista zawiera 20 predefiniowanych ćwiczeń
- Filtry działają poprawnie
- Detale zawierają: category, muscleGroups, equipment, difficulty, instructions

**Kryteria akceptacji**: Wszystkie ćwiczenia wyświetlają się poprawnie, filtry zwracają oczekiwane wyniki

---

#### TC-W-002: Rozpoczynanie nowej sesji treningowej
**Priorytet**: Krytyczny
**Warunki wstępne**: Użytkownik zalogowany
**Kroki**:
1. Kliknij "Rozpocznij trening"
2. Wybierz 3 ćwiczenia z katalogu
3. Potwierdź rozpoczęcie sesji
4. Sprawdź utworzenie obiektu Workout z `startedAt` timestamp
5. Sprawdź utworzenie 3 obiektów WorkoutExercise z polem `order`

**Oczekiwany rezultat**:
- Nowy obiekt Workout z ID, userID, startedAt
- completedAt jest undefined
- 3 powiązane WorkoutExercise z prawidłowym order (0, 1, 2)

**Kryteria akceptacji**: Sesja zostaje zapisana w stanie aplikacji, użytkownik widzi ekran aktywnego treningu

---

#### TC-W-003: Rejestrowanie wykonanych serii podczas treningu
**Priorytet**: Krytyczny
**Warunki wstępne**: Aktywna sesja treningowa
**Kroki**:
1. Dla pierwszego ćwiczenia wprowadź: 3 serie, 10 powtórzeń, 50kg
2. Kliknij "Zapisz serię"
3. Dodaj drugą serię: 3 serie, 8 powtórzeń, 55kg
4. Sprawdź aktualizację WorkoutExercise

**Oczekiwany rezultat**:
- WorkoutExercise.sets = 2
- WorkoutExercise.reps = [10, 8]
- WorkoutExercise.weight = [50, 55]
- Interfejs aktualizuje się w czasie rzeczywistym

**Kryteria akceptacji**: Dane zapisują się poprawnie, użytkownik widzi podsumowanie wykonanych serii

---

#### TC-W-004: Kończenie sesji treningowej
**Priorytet**: Krytyczny
**Warunki wstępne**: Aktywna sesja z zapisanymi seriami
**Kroki**:
1. Kliknij "Zakończ trening"
2. Sprawdź ustawienie `completedAt` timestamp
3. Sprawdź obliczenie `duration` (completedAt - startedAt)
4. Sprawdź obliczenie szacunkowego `caloriesBurned`
5. Zweryfikuj zapisanie do historii treningów

**Oczekiwany rezultat**:
- Workout.completedAt jest ustawione
- Workout.duration jest poprawnie obliczone
- Workout pojawia się w historii /progress
- Status sesji zmienia się na "completed"

**Kryteria akceptacji**: Trening zostaje zamknięty, dane są dostępne w historii

---

### 4.2 Moduł celów (Goals)

#### TC-G-001: Tworzenie nowego celu fitness
**Priorytet**: Wysoki
**Warunki wstępne**: Użytkownik zalogowany
**Kroki**:
1. Przejdź do /goals
2. Kliknij "Dodaj cel"
3. Wprowadź: typ (weight_loss), wartość docelową (75kg), termin (2025-12-31)
4. Zapisz cel
5. Sprawdź utworzenie obiektu Goal

**Oczekiwany rezultat**:
- Nowy Goal z ID, userID, type, targetValue, deadline, status: "active"
- Goal wyświetla się na liście celów
- Progress bar pokazuje 0%

**Kryteria akceptacji**: Cel zostaje zapisany i wyświetla się w interfejsie

---

#### TC-G-002: Śledzenie postępu celu
**Priorytet**: Wysoki
**Warunki wstępne**: Istniejący cel weight_loss (cel: 75kg, start: 85kg)
**Kroki**:
1. Zaktualizuj wagę użytkownika do 80kg
2. Odśwież stronę /goals
3. Sprawdź aktualizację progress bar
4. Sprawdź aktualizację Goal.currentValue

**Oczekiwany rezultat**:
- Goal.currentValue = 80
- Progress = (85 - 80) / (85 - 75) * 100 = 50%
- Progress bar wizualnie pokazuje 50%
- Komunikat "Przeszedłeś połowę drogi!"

**Kryteria akceptacji**: Postęp jest poprawnie obliczany i wyświetlany

---

### 4.3 Moduł autentykacji (Authentication)

#### TC-A-001: Rejestracja nowego użytkownika
**Priorytet**: Krytyczny
**Warunki wstępne**: Brak zalogowanego użytkownika, integracja z Supabase aktywna
**Kroki**:
1. Przejdź do /auth/register
2. Wprowadź: email (test@example.com), hasło (Test123!@#), imię (Jan), nazwisko (Kowalski)
3. Kliknij "Zarejestruj się"
4. Sprawdź email weryfikacyjny
5. Potwierdź email przez kliknięcie linku

**Oczekiwany rezultat**:
- Konto zostaje utworzone w Supabase
- Email weryfikacyjny zostaje wysłany
- Po weryfikacji użytkownik może się zalogować
- Obiekt User zostaje utworzony w bazie

**Kryteria akceptacji**: Użytkownik może się zalogować po weryfikacji email

---

#### TC-A-002: Logowanie użytkownika
**Priorytet**: Krytyczny
**Warunki wstępne**: Zweryfikowane konto użytkownika
**Kroki**:
1. Przejdź do /auth/login
2. Wprowadź: email, hasło
3. Kliknij "Zaloguj się"
4. Sprawdź przekierowanie do /dashboard
5. Sprawdź obecność tokenu sesji w cookies

**Oczekiwany rezultat**:
- Użytkownik zostaje zalogowany
- Token sesji jest przechowywany bezpiecznie
- Przekierowanie do /dashboard
- Navigation pokazuje zalogowany stan (avatar, menu)

**Kryteria akceptacji**: Użytkownik ma dostęp do chronionych stron

---

#### TC-A-003: Wylogowanie użytkownika
**Priorytet**: Wysoki
**Warunki wstępne**: Zalogowany użytkownik
**Kroki**:
1. Kliknij menu użytkownika w Navigation
2. Kliknij "Wyloguj się"
3. Sprawdź usunięcie tokenu sesji
4. Sprawdź przekierowanie do /auth/login

**Oczekiwany rezultat**:
- Sesja zostaje zakończona
- Token usunięty z cookies
- Przekierowanie do strony logowania
- Brak dostępu do /dashboard (redirect do login)

**Kryteria akceptacji**: Użytkownik nie ma dostępu do chronionych zasobów

---

### 4.4 Moduł interfejsu użytkownika (UI/UX)

#### TC-UI-001: Przełączanie dark/light mode
**Priorytet**: Średni
**Warunki wstępne**: Użytkownik na dowolnej stronie
**Kroki**:
1. Sprawdź domyślny dark mode (class="dark" na <html>)
2. Kliknij przycisk przełączania motywu
3. Sprawdź zmianę class na <html> (usunięcie "dark")
4. Zweryfikuj zmianę CSS variables (--background, --foreground, etc.)
5. Odśwież stronę i sprawdź persistencję wyboru

**Oczekiwany rezultat**:
- Motyw przełącza się płynnie
- CSS variables aktualizują się poprawnie
- Wybór jest zapisywany w localStorage
- Po odświeżeniu wybrany motyw jest zachowany

**Kryteria akceptacji**: Motywy działają poprawnie, bez błędów wizualnych

---

#### TC-UI-002: Responsywność layoutu
**Priorytet**: Wysoki
**Warunki wstępne**: Aplikacja uruchomiona
**Kroki**:
1. Otwórz aplikację na desktop (1920x1080)
2. Zweryfikuj layout Navigation, treść strony, footer
3. Zmień rozdzielczość na tablet (768x1024)
4. Sprawdź responsywne dostosowanie (hamburger menu?)
5. Zmień na mobile (375x667)
6. Sprawdź mobilny layout

**Oczekiwany rezultat**:
- Desktop: pełne menu, sidebar
- Tablet: dostosowany layout, czytelne elementy
- Mobile: hamburger menu, stackowane komponenty, touch-friendly buttons

**Kryteria akceptacji**: Aplikacja jest w pełni użyteczna na wszystkich urządzeniach

---

#### TC-UI-003: Nawigacja klawiaturą
**Priorytet**: Wysoki (dostępność)
**Warunki wstępne**: Użytkownik na stronie /dashboard
**Kroki**:
1. Użyj Tab do nawigacji między elementami
2. Sprawdź widoczność focus indicators
3. Użyj Enter/Space do aktywacji przycisków
4. Użyj strzałek w komponentach lista/dropdown
5. Sprawdź skip to main content link

**Oczekiwany rezultat**:
- Tab order jest logiczny
- Focus indicators są wyraźne
- Wszystkie interaktywne elementy dostępne z klawiatury
- Skip link pozwala ominąć nawigację

**Kryteria akceptacji**: Zgodność z WCAG 2.1 Level AA (keyboard accessible)

---

### 4.5 Moduł wydajności

#### TC-P-001: Czas ładowania strony głównej
**Priorytet**: Wysoki
**Warunki wstępne**: Build produkcyjny aplikacji
**Kroki**:
1. Uruchom Lighthouse na stronie /
2. Zmierz First Contentful Paint (FCP)
3. Zmierz Largest Contentful Paint (LCP)
4. Zmierz Time to Interactive (TTI)
5. Zmierz Total Blocking Time (TBT)
6. Sprawdź Lighthouse Performance Score

**Oczekiwany rezultat**:
- FCP < 1.8s
- LCP < 2.5s
- TTI < 3.8s
- TBT < 200ms
- Performance Score ≥ 90

**Kryteria akceptacji**: Wszystkie metryki w zielonych zakresach

---

#### TC-P-002: Wielkość JavaScript bundle
**Priorytet**: Średni
**Warunki wstępne**: Build produkcyjny
**Kroki**:
1. Uruchom `npm run build`
2. Sprawdź wielkość głównego bundle w dist/
3. Sprawdź wielkość bundle komponentów React
4. Zidentyfikuj największe dependencies
5. Sprawdź lazy loading dla route-level code splitting

**Oczekiwany rezultat**:
- Główny bundle < 200KB (gzipped)
- React bundle < 150KB (gzipped)
- Komponenty ładowane on-demand (client:load)
- Tree-shaking eliminuje nieużywany kod

**Kryteria akceptacji**: Bundle size nie przekracza założonych limitów

---

## 5. Środowisko testowe

### 5.1 Środowisko lokalne (Development)
- **System operacyjny**: macOS, Linux, Windows (WSL2)
- **Node.js**: 20.x LTS
- **Package manager**: npm 10.x
- **Baza danych**: Supabase Local Development (Docker)
- **Port aplikacji**: 3000
- **Hot reload**: Enabled

### 5.2 Środowisko staging
- **Hosting**: DigitalOcean Droplet
- **Container**: Docker image aplikacji
- **Baza danych**: Supabase Cloud (projekt staging)
- **Domena**: staging.fitness-tracker.app (przykładowa)
- **SSL**: Certyfikat Let's Encrypt
- **Deployment**: Automatyczny przez GitHub Actions na branch `develop`

### 5.3 Środowisko produkcyjne
- **Hosting**: DigitalOcean Droplet
- **Container**: Docker image aplikacji
- **Baza danych**: Supabase Cloud (projekt produkcyjny)
- **Domena**: fitness-tracker.app (przykładowa)
- **SSL**: Certyfikat Let's Encrypt
- **Deployment**: Automatyczny przez GitHub Actions na branch `master` (po manual approval)
- **Backup**: Codzienne backupy bazy danych

### 5.4 Środowisko CI/CD
- **Platform**: GitHub Actions
- **Runners**: Ubuntu latest
- **Cache**: npm dependencies, Playwright browsers
- **Secrets**: Supabase keys, deployment tokens

### 5.5 Przeglądarki testowe
- **Desktop**:
  - Chrome 130+ (Windows, macOS, Linux)
  - Firefox 120+ (Windows, macOS, Linux)
  - Safari 17+ (macOS)
  - Edge 130+ (Windows)
- **Mobile**:
  - iOS Safari 17+ (iPhone 12+)
  - Chrome Mobile 130+ (Android 10+)
  - Samsung Internet 23+

### 5.6 Urządzenia testowe
- **Desktop**: 1920x1080, 1366x768
- **Tablet**: iPad Air (820x1180), Samsung Tab (800x1280)
- **Mobile**: iPhone 14 (390x844), Samsung S23 (360x800)

## 6. Narzędzia do testowania

### 6.1 Framework testowy
- **Vitest 2.x**: Unit tests, integration tests
- **React Testing Library 16.x**: Component tests
- **Playwright 1.50+**: E2E tests, component tests, performance tests

### 6.2 Narzędzia pomocnicze
- **@testing-library/user-event**: Symulacja interakcji użytkownika
- **@testing-library/jest-dom**: Custom matchers dla DOM
- **msw (Mock Service Worker)**: Mockowanie API requests
- **@faker-js/faker**: Generowanie danych testowych
- **c8/vitest coverage**: Code coverage reporting

### 6.3 Narzędzia jakości
- **ESLint 9**: Linting z React Compiler plugin
- **Prettier 3.x**: Code formatting
- **TypeScript 5**: Type checking
- **Husky + lint-staged**: Pre-commit hooks

### 6.4 Narzędzia dostępności
- **axe-core**: Automated a11y testing
- **@axe-core/playwright**: Playwright integration
- **eslint-plugin-jsx-a11y**: Linting a11y issues

### 6.5 Narzędzia wydajności
- **Lighthouse CI**: Automated performance audits
- **WebPageTest**: Detailed performance analysis
- **Chrome DevTools Performance**: Profiling

### 6.6 Narzędzia bezpieczeństwa
- **npm audit**: Dependency vulnerability scanning
- **Snyk**: Advanced security scanning
- **OWASP ZAP**: Dynamic application security testing

### 6.7 Narzędzia CI/CD
- **GitHub Actions**: Workflow automation
- **Docker**: Containerization
- **act**: Local GitHub Actions testing

### 6.8 Narzędzia dokumentacji
- **Storybook 8.x**: Component documentation
- **Allure Report**: Test reporting dashboard
- **Markdown**: Test plan documentation

## 7. Harmonogram testów

### 7.1 Faza 1: Setup i infrastruktura (Tydzień 1-2)
- **Tydzień 1**:
  - Dzień 1-2: Setup Vitest, konfiguracja test environment
  - Dzień 3-4: Setup Playwright, konfiguracja browsers
  - Dzień 5: Setup coverage tools, pre-commit hooks

- **Tydzień 2**:
  - Dzień 1-2: Setup Storybook dla component documentation
  - Dzień 3-4: Konfiguracja GitHub Actions dla CI/CD
  - Dzień 5: Setup Lighthouse CI, performance baseline

### 7.2 Faza 2: Testy jednostkowe i komponentów (Tydzień 3-4)
- **Tydzień 3**:
  - Dzień 1-2: Testy modeli (User, Goal, Workout, ExerciseTemplate)
  - Dzień 3-4: Testy mock data helpers
  - Dzień 5: Testy utility functions

- **Tydzień 4**:
  - Dzień 1-3: Testy komponentów React (wszystkie komponenty UI)
  - Dzień 4-5: Testy custom hooks

**Target**: Pokrycie kodu 80%+

### 7.3 Faza 3: Testy integracyjne (Tydzień 5-6)
- **Tydzień 5**:
  - Dzień 1-2: Setup Supabase local development
  - Dzień 3-5: Testy integracji z Supabase (CRUD, auth)

- **Tydzień 6**:
  - Dzień 1-2: Testy API endpoints
  - Dzień 3-4: Testy middleware
  - Dzień 5: Testy hydratacji React w Astro

### 7.4 Faza 4: Testy E2E (Tydzień 7-8)
- **Tydzień 7**:
  - Dzień 1-2: Scenariusze modułu treningów (TC-W-001 do TC-W-004)
  - Dzień 3-4: Scenariusze modułu celów (TC-G-001 do TC-G-002)
  - Dzień 5: Scenariusze autentykacji (TC-A-001 do TC-A-003)

- **Tydzień 8**:
  - Dzień 1-2: Scenariusze UI/UX (TC-UI-001 do TC-UI-003)
  - Dzień 3-4: Testy cross-browser, multi-device
  - Dzień 5: Regression tests

### 7.5 Faza 5: Testy niefunkcjonalne (Tydzień 9-10)
- **Tydzień 9**:
  - Dzień 1-2: Testy wydajności (TC-P-001 do TC-P-002)
  - Dzień 3-4: Testy dostępności (WCAG 2.1 compliance)
  - Dzień 5: Audyt Lighthouse (wszystkie strony)

- **Tydzień 10**:
  - Dzień 1-3: Testy bezpieczeństwa (OWASP ZAP, penetration testing)
  - Dzień 4-5: Load testing, stress testing

### 7.6 Faza 6: Raportowanie i optymalizacja (Tydzień 11-12)
- **Tydzień 11**:
  - Dzień 1-3: Analiza wyników testów
  - Dzień 4-5: Priorytetyzacja i naprawa defektów krytycznych

- **Tydzień 12**:
  - Dzień 1-3: Naprawa defektów wysokiego priorytetu
  - Dzień 4: Retesty
  - Dzień 5: Finalizacja dokumentacji, sign-off

### 7.7 Harmonogram ciągły (Po deploymencie)
- **Codziennie**: Automated unit tests na każdym commit (GitHub Actions)
- **Przed każdym PR merge**: E2E smoke tests
- **Tygodniowo**: Pełny regression suite na staging
- **Przed deploymentem produkcyjnym**: Full test suite + manual exploratory testing
- **Miesięcznie**: Security audit, performance review

## 8. Kryteria akceptacji testów

### 8.1 Kryteria wyjścia z fazy testowania

#### 8.1.1 Pokrycie kodu (Code Coverage)
- **Unit tests**: ≥ 80% dla src/models/, src/lib/
- **Component tests**: ≥ 70% dla src/components/
- **Overall**: ≥ 75% line coverage

#### 8.1.2 Wskaźniki jakości
- **Pass rate**: ≥ 98% testów przechodzi
- **Flaky tests**: < 1% testów jest niestabilnych
- **Test execution time**: Pełny suite < 15 minut

#### 8.1.3 Defekty
- **Krytyczne**: 0 otwartych defektów
- **Wysokie**: ≤ 2 otwarte defekty (z akceptacją Product Owner)
- **Średnie**: ≤ 5 otwartych defektów
- **Niskie**: Bez limitu (planowane do następnej iteracji)

#### 8.1.4 Wydajność
- **Lighthouse Performance Score**: ≥ 90
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

#### 8.1.5 Dostępność
- **Lighthouse Accessibility Score**: ≥ 95
- **WCAG 2.1 Level AA**: 100% compliance
- **Keyboard navigation**: Wszystkie funkcje dostępne
- **Screen reader**: Brak błędów w NVDA/VoiceOver

#### 8.1.6 Bezpieczeństwo
- **npm audit**: 0 high/critical vulnerabilities
- **OWASP ZAP**: Brak medium+ severity issues
- **Penetration testing**: Wszystkie znalezione luki naprawione

#### 8.1.7 Cross-browser compatibility
- **Chrome, Firefox, Safari, Edge**: 100% funkcjonalności działa
- **Mobile Safari, Chrome Mobile**: Core features działają
- **Regression tests**: Przechodzą na wszystkich przeglądarkach

### 8.2 Definicja defektu

#### 8.2.1 Krytyczny (Blocker)
- Całkowity brak możliwości korzystania z aplikacji
- Utrata danych użytkownika
- Luka bezpieczeństwa umożliwiająca dostęp do danych
- Crash aplikacji na produkcji

**SLA**: Naprawa w ciągu 24h

#### 8.2.2 Wysoki (High)
- Główna funkcjonalność nie działa (np. nie można rozpocząć treningu)
- Błąd uniemożliwiający zakończenie kluczowego flow
- Wydajność poniżej 50% założonych metryk
- Brak dostępności dla screen readerów

**SLA**: Naprawa w ciągu 3 dni roboczych

#### 8.2.3 Średni (Medium)
- Funkcjonalność działa, ale z ograniczeniami
- Błędy UI/UX wpływające na komfort użytkowania
- Problemy wydajnościowe (10-50% poniżej target)
- Drobne problemy z dostępnością

**SLA**: Naprawa w ciągu 7 dni roboczych

#### 8.2.4 Niski (Low)
- Kosmetyczne błędy UI
- Literówki w tekstach
- Sugestie ulepszeń
- Problemy występujące w edge cases

**SLA**: Planowane do następnej iteracji

### 8.3 Kryteria akceptacji scenariuszy testowych

Każdy scenariusz testowy jest uznany za przechodzący, gdy:
1. Wszystkie kroki wykonują się bez błędów
2. Oczekiwany rezultat jest osiągnięty w 100%
3. Brak side effects (np. błędy w konsoli, memory leaks)
4. Czas wykonania mieści się w limicie (E2E < 30s, unit < 100ms)
5. Test jest powtarzalny (10 kolejnych przebiegów bez fail)

## 9. Role i odpowiedzialności w procesie testowania

### 9.1 QA Lead (1 osoba)
**Odpowiedzialności**:
- Nadzór nad całym procesem testowania
- Tworzenie i utrzymanie planu testów
- Raportowanie statusu testów do Project Manager
- Koordynacja zespołu testerów
- Review i akceptacja test cases
- Zarządzanie test environment
- Finalna akceptacja przed release

**Narzędzia**: Jira/GitHub Issues, Allure Report, Confluence/GitHub Wiki

**KPI**:
- Test coverage ≥ 80%
- Defect detection rate (% defektów znalezionych przed produkcją)
- Test execution efficiency (% planu wykonanego w terminie)

### 9.2 QA Engineer - Automation (1-2 osoby)
**Odpowiedzialności**:
- Tworzenie i utrzymanie testów automatycznych (unit, integration, E2E)
- Setup i konfiguracja test frameworks (Vitest, Playwright)
- Integracja testów z CI/CD pipeline
- Optymalizacja czasu wykonania testów
- Code review test code
- Dokumentacja test utilities i helpers

**Umiejętności wymagane**:
- TypeScript/JavaScript
- Vitest, React Testing Library, Playwright
- GitHub Actions
- Docker basics

**KPI**:
- Automated test coverage ≥ 75%
- Test execution time < 15 minut
- Flaky test rate < 1%

### 9.3 QA Engineer - Manual (1 osoba)
**Odpowiedzialności**:
- Wykonywanie testów manualnych (exploratory, usability)
- Tworzenie szczegółowych bug reports
- Testy akceptacyjne przed release
- Testy cross-browser i multi-device
- Testy dostępności (screen reader, keyboard navigation)
- User acceptance testing (UAT) support

**Umiejętności wymagane**:
- Znajomość metodologii testowania
- Znajomość WCAG 2.1 guidelines
- Umiejętność korzystania z narzędzi developerskich przeglądarek
- Dokumentacja test cases

**KPI**:
- Liczba znalezionych defektów (unique bugs)
- Jakość bug reports (% bugs accepted without clarification)
- UAT approval rate

### 9.4 Performance Engineer (0.5 osoby, współdzielona rola)
**Odpowiedzialności**:
- Setup Lighthouse CI i monitoring wydajności
- Analiza performance metrics (Core Web Vitals)
- Identyfikacja bottlenecks w kodzie
- Load testing i stress testing
- Optymalizacja bundle size i lazy loading
- Performance regression testing

**Umiejętności wymagane**:
- Chrome DevTools Performance profiling
- Lighthouse, WebPageTest
- Znajomość React optimization patterns
- Znajomość Astro SSR performance

**KPI**:
- Lighthouse Performance Score ≥ 90
- LCP < 2.5s, FID < 100ms, CLS < 0.1
- Bundle size within limits

### 9.5 Security Engineer (konsultant, 0.25 osoby)
**Odpowiedzialności**:
- Testy bezpieczeństwa (OWASP Top 10)
- Audyt dependencies (npm audit, Snyk)
- Penetration testing
- Review autentykacji i autoryzacji
- Security guidelines dla zespołu
- Incident response (jeśli znajdzie się luka)

**Umiejętności wymagane**:
- OWASP ZAP, Burp Suite
- Znajomość common vulnerabilities (XSS, CSRF, SQL injection)
- Supabase RLS policies
- OAuth 2.0 / JWT

**KPI**:
- Zero high/critical vulnerabilities przed release
- Security scan pass rate 100%

### 9.6 Developer (zespół deweloperski)
**Odpowiedzialności**:
- Pisanie unit tests dla nowego kodu
- Fixowanie defektów zgłoszonych przez QA
- Code review z perspektywy testability
- Udział w bug triage meetings
- Współpraca z QA przy reprodukcji błędów
- Dokumentacja funkcjonalności (Storybook)

**KPI**:
- Bug fix turnaround time (mediana czasu naprawy)
- Unit test coverage przy nowych feature (≥ 80%)
- Code review participation

### 9.7 Product Owner (1 osoba)
**Odpowiedzialności**:
- Akceptacja kryteriów testowych
- Priorytetyzacja defektów do naprawy
- Akceptacja ryzyka dla defektów medium/low przed release
- Decyzje go/no-go dla deploymentu
- Akceptacja wyników UAT

**KPI**:
- Release quality (post-release defect rate)
- UAT sign-off timeliness

### 9.8 DevOps Engineer (1 osoba)
**Odpowiedzialności**:
- Utrzymanie test environments (staging, CI)
- Konfiguracja GitHub Actions workflows
- Setup Supabase local development environment
- Deployment automation
- Monitoring i alerting (production)

**Umiejętności wymagane**:
- GitHub Actions
- Docker, DigitalOcean
- Supabase CLI
- Bash scripting

**KPI**:
- Test environment uptime ≥ 99%
- CI/CD pipeline success rate ≥ 95%
- Deployment time < 10 minut

## 10. Procedury raportowania błędów

### 10.1 Narzędzie do śledzenia błędów
**GitHub Issues** (zintegrowane z repozytorium projektu)

**Struktura labels**:
- **Severity**: `critical`, `high`, `medium`, `low`
- **Type**: `bug`, `regression`, `performance`, `security`, `accessibility`
- **Component**: `ui`, `auth`, `workout`, `goals`, `api`, `database`
- **Status**: `needs-repro`, `confirmed`, `in-progress`, `ready-for-test`, `closed`
- **Browser**: `chrome`, `firefox`, `safari`, `edge`, `mobile`

### 10.2 Szablon raportu błędu

```markdown
## Opis błędu
[Krótki, jasny opis problemu]

## Priorytet / Severity
- [ ] Krytyczny (Blocker)
- [ ] Wysoki (High)
- [ ] Średni (Medium)
- [ ] Niski (Low)

## Środowisko
- **Przeglądarka**: Chrome 130.0.6723.91 (lub inna)
- **System operacyjny**: macOS 14.5 (lub inny)
- **Rozdzielczość**: 1920x1080
- **Environment**: Production / Staging / Local
- **URL**: https://fitness-tracker.app/workouts
- **User account**: test@example.com (jeśli dotyczy)

## Kroki reprodukcji
1. Zaloguj się jako test@example.com
2. Przejdź do /workouts
3. Kliknij "Rozpocznij trening"
4. Wybierz 3 ćwiczenia
5. Kliknij "Potwierdź"

## Oczekiwany rezultat
Nowa sesja treningowa powinna zostać utworzona, użytkownik przekierowany do ekranu aktywnego treningu.

## Rzeczywisty rezultat
Pojawia się błąd "Failed to create workout session", sesja nie zostaje utworzona.

## Dodatkowe informacje
- **Zrzut ekranu**: [załącz screenshot]
- **Console errors**:
  ```
  Error: Failed to fetch
  at createWorkout (workout.service.ts:42)
  ```
- **Network tab**: Request do /api/workouts zwraca 500 Internal Server Error
- **Frequency**: Występuje za każdym razem (100% reproduction rate)
- **Regression**: NIE występowało w wersji przed commitm 3cd1325

## Powiązane issue / PR
- Related to #123
- Duplicate of #456 (jeśli dotyczy)

## Tester
@username
```

### 10.3 Workflow raportu błędu

#### Krok 1: Zgłoszenie (Reporter: QA Engineer)
1. Tester reprodukuje błąd minimum 2 razy
2. Tester zbiera wszystkie informacje (screenshot, console, network)
3. Tester tworzy issue w GitHub z szablonem powyżej
4. Tester dodaje odpowiednie labels (severity, type, component)
5. Tester przypisuje QA Lead do review

**SLA**: W ciągu 1h od znalezienia błędu (dla critical), 24h dla innych

#### Krok 2: Triage (Owner: QA Lead + Developer)
1. QA Lead weryfikuje kompletność raportu
2. QA Lead potwierdza możliwość reprodukcji
3. Jeśli brak reprodukcji: label `needs-repro`, zwrot do testera
4. Jeśli potwierdzony: label `confirmed`
5. QA Lead i Developer wspólnie ustalają severity i priorytet
6. QA Lead przypisuje issue do odpowiedniego dewelopera

**SLA**: W ciągu 4h dla critical, 24h dla high, 48h dla medium/low

#### Krok 3: Naprawa (Owner: Developer)
1. Developer zmienia status na `in-progress`
2. Developer tworzy branch `fix/issue-XXX`
3. Developer naprawia błąd i pisze unit/integration tests
4. Developer tworzy PR z referencją do issue (#XXX)
5. Developer zmienia status na `ready-for-test`

**SLA**: Zgodnie z definicją severity (8.2)

#### Krok 4: Code Review (Owner: Senior Developer)
1. Code review z perspektywy jakości kodu
2. Sprawdzenie czy dodano testy pokrywające błąd
3. Approval lub request changes

**SLA**: W ciągu 24h

#### Krok 5: Retest (Owner: QA Engineer)
1. QA deployuje PR na środowisko testowe
2. QA wykonuje kroki reprodukcji z raportu
3. QA wykonuje regression testing dla powiązanej funkcjonalności
4. Jeśli fixed: Approval w PR, label `verified`
5. Jeśli not fixed: Comment w PR, zwrot do dewelopera

**SLA**: W ciągu 24h po code review approval

#### Krok 6: Merge i zamknięcie (Owner: Developer + QA Lead)
1. Developer merguje PR do branch `develop`
2. Automated tests wykonują się na CI
3. QA Lead zamyka issue z komentarzem "Fixed in PR #XXX"
4. Issue automatycznie zamyka się przez GitHub keyword "Closes #XXX" w commit message

### 10.4 Priorytety w kolejce błędów

**Ranking priorytetów (od najwyższego)**:
1. **Critical bugs na produkcji** - natychmiastowy hotfix
2. **Critical bugs przed release** - blokuje deployment
3. **High priority bugs** - muszą być naprawione przed release
4. **Regressions** (medium/high) - coś przestało działać
5. **Medium bugs** - powinny być naprawione przed release
6. **Low bugs** - nice to have, planowane do backlog

### 10.5 Eskalacja

**Eskalacja do QA Lead**:
- Brak response od dewelopera w SLA
- Spór o severity/priorytet błędu
- Brak możliwości reprodukcji błędu przez dewelopera

**Eskalacja do Product Owner**:
- Decyzja o release z known bugs (medium/low)
- Konflikt priorytetów (feature vs bugfix)
- Akceptacja ryzyka bezpieczeństwa

**Eskalacja do CTO/Tech Lead**:
- Critical bug na produkcji wymagający hotfix
- Brak zasobów do naprawy critical bug w SLA
- Systemic issues (np. architekturalne)

### 10.6 Raportowanie statusu testów

#### Dzienny raport (Slack/Email)
**Odbiorcy**: Zespół deweloperski, QA Lead, Product Owner

**Zawartość**:
- Liczba nowych błędów: Critical (X), High (Y), Medium (Z), Low (W)
- Liczba naprawionych błędów: Critical (X), High (Y), Medium (Z), Low (W)
- Aktualny test progress: XX% test cases executed
- Blockers: [jeśli występują]
- ETA do zakończenia fazy testowania

#### Tygodniowy raport (Document)
**Odbiorcy**: Management, Product Owner, Zespół

**Zawartość**:
- Test execution summary (pie chart: Pass/Fail/Blocked)
- Defect summary by severity (bar chart)
- Test coverage metrics (line chart: target vs actual)
- Top 5 high-impact bugs
- Risk assessment dla release
- Planned activities na następny tydzień

#### Release readiness report (przed deploymentem)
**Odbiorcy**: Product Owner, CTO, Management

**Zawartość**:
- Exit criteria status (checklist z 8.1)
- Open defects summary z risk assessment
- Performance metrics (Lighthouse scores)
- Accessibility compliance status
- Security scan results
- Recommendation: GO / NO-GO z uzasadnieniem

### 10.7 Metrics i KPI tracking

**Dashboard metrics (aktualizowane codziennie)**:
- Test execution progress (%)
- Test pass rate (%)
- Defects found vs fixed (trend chart)
- Defect density (bugs per 1000 lines of code)
- Mean time to fix (MTTF) by severity
- Test automation coverage (%)
- Flaky test rate (%)

**Narzędzie**: GitHub Projects + Allure Report + custom dashboard (opcjonalnie Grafana)

---

## Podsumowanie

Niniejszy plan testów zapewnia kompleksowe podejście do zapewnienia jakości aplikacji Fitness Tracker. Kluczowe elementy planu:

1. **Wielowarstwowa strategia testowania**: Od testów jednostkowych po E2E, pokrywająca wszystkie aspekty aplikacji
2. **Fokus na krytyczne funkcjonalności**: Priorytetyzacja modułu treningów i autentykacji
3. **Uwzględnienie specyfiki stosu technologicznego**: Testy hydratacji Astro-React, React 19 patterns, Tailwind 4
4. **Automatyzacja**: Minimalizacja testów manualnych poprzez CI/CD integration
5. **Ciągłe doskonalenie**: Metrics-driven approach do optymalizacji procesu testowego

Plan jest dokumentem żywym i powinien być aktualizowany w miarę ewolucji projektu oraz zdobywania nowych doświadczeń przez zespół testowy.
