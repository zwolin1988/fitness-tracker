# Architektura UI dla Fitness Tracker

## 1. Przegląd struktury UI

### 1.1. Filozofia projektowania

Fitness Tracker został zaprojektowany z myślą o **mobile-first approach** z pełnym wsparciem dla urządzeń desktop i tablet. Aplikacja kładzie szczególny nacisk na prostotę obsługi podczas aktywnego treningu oraz szybki dostęp do kluczowych funkcji.

### 1.2. Kluczowe zasady UX

- **Minimalizacja kroków**: Główne akcje (rozpoczęcie treningu) dostępne w maksymalnie 2 klikach
- **Focus mode**: Dedykowany widok aktywnego treningu bez rozpraszaczy
- **Wizualna hierarchia**: Jasny podział na akcje pierwotne i wtórne
- **Responsive feedback**: Natychmiastowa informacja zwrotna dla wszystkich akcji użytkownika
- **Progresywne ujawnianie**: Zaawansowane funkcje ukryte do momentu potrzeby

### 1.3. Tech Stack UI

- **Framework**: Astro 5.13.7 (SSR) + React 19.1.1 (komponenty interaktywne)
- **Styling**: Tailwind CSS 4.1.13 z CSS variables, dark mode domyślnie
- **Komponenty**: Shadcn/ui (styl new-york, bez RSC)
- **State Management**: React Query + Zustand (zalecane)
- **Wykresy**: Recharts (zalecane)
- **Ikony**: Lucide React (zalecane)
- **Notyfikacje**: Sonner (zalecane)

### 1.4. Breakpointy responsywne

```
Mobile:      320px - 767px   (single column, bottom nav)
Tablet:      768px - 1023px  (2 kolumny, drawer sidebar)
Desktop:     1024px+          (persistent sidebar, multi-column)
```

## 2. Lista widoków

### 2.1. Widoki uwierzytelniania

#### 2.1.1. Widok logowania
**Ścieżka**: `/auth/login`
**Dostęp**: Publiczny (tylko wylogowani)

**Główny cel**: Umożliwienie zalogowania użytkownika do aplikacji

**Kluczowe informacje**:
- Formularz logowania (email, hasło)
- Link do rejestracji
- Link do resetu hasła
- Logo i nazwa aplikacji

**Kluczowe komponenty**:
- `<AuthLayout>` - Layout bez nawigacji głównej
- `<LoginForm>` - Reaktywny formularz z walidacją Zod
  - Input email (type="email", required)
  - Input hasło (type="password", required, toggle visibility)
  - Checkbox "Zapamiętaj mnie" (optional)
  - Button "Zaloguj się" (primary, full-width mobile)
- `<Link to="/auth/register">` - "Nie masz konta? Zarejestruj się"
- `<Link to="/auth/reset-password">` - "Zapomniałeś hasła?"

**UX, dostępność i bezpieczeństwo**:
- **Walidacja**: Inline validation z komunikatami błędów
- **Loading state**: Disabled inputs + spinner w buttonie podczas logowania
- **Error handling**: Toast notification dla błędów API (401, 500)
- **Accessibility**: Labels dla wszystkich inputs, focus visible, keyboard navigation
- **Security**: Rate limiting (100 req/min), HTTPS only, secure cookie dla sesji

#### 2.1.2. Widok rejestracji
**Ścieżka**: `/auth/register`
**Dostęp**: Publiczny (tylko wylogowani)

**Główny cel**: Utworzenie nowego konta użytkownika

**Kluczowe informacje**:
- Formularz rejestracji (email, hasło, potwierdzenie hasła)
- Warunki użytkowania i polityka prywatności
- Link do logowania

**Kluczowe komponenty**:
- `<AuthLayout>`
- `<RegisterForm>`
  - Input email (walidacja formatu)
  - Input hasło (min 8 znaków, walidacja siły)
  - Input potwierdzenie hasła (musi być identyczne)
  - Checkbox akceptacja regulaminu (required)
  - Button "Zarejestruj się"
- Password strength indicator (weak/medium/strong)
- `<Link to="/auth/login">` - "Masz już konto? Zaloguj się"

**UX, dostępność i bezpieczeństwo**:
- **Walidacja**: Real-time validation hasła i email
- **Feedback**: Wizualizacja siły hasła (progress bar + kolor)
- **Success flow**: Po rejestracji → redirect `/auth/verify-email` z komunikatem
- **Error handling**: Szczegółowe komunikaty błędów walidacji (422)
- **Accessibility**: aria-describedby dla error messages, aria-live dla password strength
- **Security**: bcrypt hashing po stronie serwera (Supabase), email verification

#### 2.1.3. Widok resetu hasła
**Ścieżka**: `/auth/reset-password`
**Dostęp**: Publiczny

**Główny cel**: Zresetowanie zapomnianego hasła

**Kluczowe informacje**:
- Formularz z polem email
- Instrukcje procesu resetu
- Potwierdzenie wysłania emaila

**Kluczowe komponenty**:
- `<AuthLayout>`
- `<ResetPasswordForm>`
  - Input email
  - Button "Wyślij link resetujący"
- Success state: Komunikat "Link został wysłany na email"
- `<Link to="/auth/login">` - "Powrót do logowania"

**UX, dostępność i bezpieczeństwo**:
- **Walidacja**: Email format validation
- **Success state**: Jasny komunikat z instrukcją sprawdzenia skrzynki (również spam)
- **Rate limiting**: Max 3 próby na 15 minut dla tego samego email
- **Security**: Link ważny 24h, one-time use, token w URL

---

### 2.2. Widoki główne aplikacji

#### 2.2.1. Dashboard
**Ścieżka**: `/dashboard`
**Dostęp**: Zalogowani użytkownicy
**Layout**: `<MainLayout>` z nawigacją

**Główny cel**: Centrum dowodzenia - przegląd postępów, szybki dostęp do akcji

**Kluczowe informacje**:
- Statystyki bieżącego tygodnia (liczba treningów, total volume, czas)
- 3 ostatnie treningi (karty z quick preview)
- Wykresy analityczne (wolumen tygodniowy, maksymalne ciężary)
- Quick actions (Rozpocznij trening, Utwórz plan)

**Kluczowe komponenty**:

**Header Section**:
- `<DashboardHeader>`
  - Powitanie: "Witaj, {userName}" lub "Witaj ponownie!"
  - Data dzisiejsza
  - Primary CTA: `<Button size="lg">Rozpocznij trening</Button>` (prominent, gradient/accent)
  - Secondary CTA: `<Button variant="outline">Utwórz nowy plan</Button>`

**Stats Tiles Section** (mobile: 1-2 kolumny, tablet: 2-3, desktop: 3-4):
- `<StatCard>` (reusable)
  - Ikona (Dumbbell, Weight, Clock, TrendingUp)
  - Wartość (duża, bold)
  - Label (mniejsza, muted)
  - Trend indicator (optional: +12% vs poprzedni tydzień)
- Przykłady:
  - "7 treningów w tym tygodniu"
  - "2,450 kg całkowity wolumen"
  - "42 min średni czas treningu"
  - "100 kg maksymalny ciężar"

**Recent Workouts Section**:
- Nagłówek: "Ostatnie treningi" + `<Link to="/workouts">Zobacz wszystkie</Link>`
- `<RecentWorkoutCard>` × 3 (lub empty state)
  - Data i godzina
  - Nazwa planu treningowego
  - Ikony ćwiczeń (SVG preview, max 4 + "...")
  - Metryki: czas trwania, liczba ćwiczeń, liczba setów
  - Action: Klik → navigate `/workouts/{id}` (full summary)
- Empty state: "Nie masz jeszcze treningów. Rozpocznij pierwszy!" + CTA

**Analytics Section**:
- Nagłówek z date range selector:
  - `<Tabs>`: "7 dni" | "14 dni" | "30 dni" (default: 7)
- `<WeeklyVolumeChart>` (Recharts BarChart):
  - Oś X: dni tygodnia (Pn, Wt, Śr, Czw, Pt, Sb, Nd)
  - Oś Y: wolumen w kg
  - Bars: gradient color, hover tooltip z szczegółami
  - Empty state: "Brak danych dla wybranego okresu"
- `<MaxWeightChart>` (Recharts LineChart):
  - Oś X: sesje treningowe (numerowane lub daty)
  - Oś Y: maksymalny ciężar w kg
  - Line: smooth curve, accent color
  - Dots: interactive, hover pokazuje szczegóły sesji

**Layout responsywny**:
- Mobile: stacked (Header → Stats → Recent → Charts)
- Tablet: Stats w 2 kolumny, Charts obok siebie
- Desktop: Stats w 4 kolumny, Charts obok siebie (50/50 lub 60/40)

**UX, dostępność i bezpieczeństwo**:
- **Loading**: Skeleton screens dla wszystkich sekcji podczas ładowania
- **Error**: Alert banner na górze jeśli błąd API + retry button
- **Empty state**: Przyjazne ilustracje + CTA dla użytkowników bez treningów
- **Accessibility**: Wykresy z alt text, keyboard navigable date selector
- **Performance**: Lazy load charts (below fold), cache stats przez 5 minut (React Query)

---

#### 2.2.2. Katalog ćwiczeń
**Ścieżka**: `/exercises` (lub `/categories` zgodnie z istniejącą strukturą)
**Dostęp**: Zalogowani użytkownicy
**Layout**: `<MainLayout>`

**Główny cel**: Przeglądanie i wyszukiwanie ćwiczeń z biblioteki

**Kluczowe informacje**:
- Lista wszystkich dostępnych ćwiczeń
- Filtry (kategoria, trudność)
- Search bar
- Pagination

**Kluczowe komponenty**:

**Top Section (sticky)**:
- `<SearchBar>`:
  - Input z ikoną search
  - Placeholder: "Szukaj ćwiczeń..."
  - Debounce 300ms
  - Clear button (× icon) gdy niepuste
- `<FilterBar>`:
  - Kategoria dropdown: "Wszystkie" | "Klatka" | "Plecy" | "Nogi" | "Barki" | ...
  - Trudność chips (multi-select): "Łatwy" | "Średni" | "Trudny" | "Ekspert"
  - Active filters indicator: "Filtry (2)" z możliwością clear all

**Exercise Grid/List**:
- **Desktop**: Grid 3-4 kolumny (gap-4)
- **Mobile**: Lista 1-kolumnowa kompaktowa

**Card Design** (`<ExerciseCard>`):
- SVG icon (64×64px, centered, kategoria-specific color)
- Nazwa ćwiczenia (bold, 16px, max 2 linie z truncate)
- Category badge (small pill, background color per kategoria)
- Difficulty indicator (3-4 dots, green/yellow/orange/red)
- Hover state (desktop): scale 1.02, shadow-lg, cursor pointer

**Click action**:
- Otwiera `<ExerciseDetailModal>` (lub Drawer na mobile)
  - Header: Nazwa + Close button (X)
  - Body:
    - Ikona SVG (larger)
    - Kategoria badge
    - Poziom trudności (visual + text)
    - Opis ćwiczenia (multi-line text)
    - Instrukcje (numbered list lub bullet points)
    - Muscle groups (badges: "Klatka piersiowa", "Triceps", ...)
  - Footer Actions:
    - Button "Dodaj do planu" → Dropdown wybór planu lub "Utwórz nowy plan"
    - Button "Ulubione" (heart icon, toggle state) - optional feature

**Pagination** (bottom):
- Previous/Next buttons
- Page numbers: 1, 2, 3, ..., N
- "Wyświetlono X-Y z Z ćwiczeń"
- API params: `?page=1&limit=12`

**Admin FAB** (conditional dla role='admin'):
- Floating Action Button (fixed, right bottom)
- Icon: Plus (+) large
- Accent color (orange)
- Action: navigate `/admin/exercises/create`

**UX, dostępność i bezpieczeństwo**:
- **Loading**: Skeleton grid podczas fetch
- **Error**: Toast notification + retry option
- **Empty state**: "Nie znaleziono ćwiczeń" + sugestie (zmiana filtrów, clear search)
- **Accessibility**: Keyboard navigation przez cards (Tab), Enter otwiera modal
- **Performance**: Virtual scrolling dla bardzo długich list (optional), image lazy loading
- **RLS**: Read-only access dla wszystkich zalogowanych, CRUD tylko admin

---

#### 2.2.3. Lista planów treningowych
**Ścieżka**: `/plans`
**Dostęp**: Zalogowani użytkownicy
**Layout**: `<MainLayout>`

**Główny cel**: Przegląd i zarządzanie planami treningowymi użytkownika

**Kluczowe informacje**:
- Lista wszystkich aktywnych planów użytkownika (max 7)
- Liczba ćwiczeń w każdym planie
- Ostatnia sesja treningowa dla planu
- Quick actions (edytuj, usuń, rozpocznij trening)

**Kluczowe komponenty**:

**Header**:
- Tytuł: "Moje plany treningowe"
- Subtitle: "Aktywne plany: X/7"
- Primary CTA: `<Button>Utwórz nowy plan</Button>` (disabled jeśli 7/7 z tooltip)

**Plans Grid/List**:
- Desktop: Grid 2-3 kolumny
- Mobile: Lista 1-kolumnowa

**Card Design** (`<TrainingPlanCard>`):
- Header:
  - Nazwa planu (bold, large)
  - Badge z liczbą ćwiczeń: "8 ćwiczeń"
- Body:
  - Lista ćwiczeń (max 4 widoczne + "... i X więcej")
  - Ikony ćwiczeń (small SVG, inline)
  - Ostatnia sesja: "Ostatni trening: 2 dni temu" lub "Nigdy nie wykonano"
- Footer Actions:
  - Button "Rozpocznij" (primary, prominent) → navigate `/workouts/start?planId={id}`
  - IconButton "Edytuj" → navigate `/plans/{id}/edit`
  - IconButton "Usuń" → Confirmation dialog → DELETE (soft delete)
  - IconButton "Więcej" (⋮) → Dropdown menu: "Duplikuj", "Udostępnij" (future)

**Empty State**:
- Ilustracja (clipboard/document icon)
- Tekst: "Nie masz jeszcze planów treningowych"
- Subtext: "Stwórz pierwszy plan i zacznij trenować"
- CTA: `<Button size="lg">Stwórz pierwszy plan</Button>`

**Confirmation Dialog** (Delete):
- Title: "Usunąć plan „{planName}"?"
- Message: "Plan zostanie ukryty, ale historia treningów pozostanie. Czy na pewno chcesz kontynuować?"
- Actions: "Anuluj" | "Usuń" (destructive)

**UX, dostępność i bezpieczeńność**:
- **Loading**: Skeleton cards
- **Error**: Alert banner + retry
- **Limit indicator**: Wyraźna informacja gdy 7/7 + sugestia usunięcia nieużywanego
- **Confirmation**: Double-check przed usunięciem
- **Accessibility**: Keyboard shortcuts (Delete key na focused card)
- **RLS**: Users see only own plans (user_id filter)

---

#### 2.2.4. Tworzenie/edycja planu treningowego
**Ścieżka**: `/plans/create` (create) lub `/plans/{id}/edit` (edit)
**Dostęp**: Zalogowani użytkownicy
**Layout**: `<MainLayout>` lub `<WizardLayout>` (fullscreen na mobile)

**Główny cel**: Utworzenie nowego lub edycja istniejącego planu treningowego

**Format**: 3-krokowy wizard z progress indicator

**Kluczowe komponenty**:

**Progress Indicator** (sticky top):
- `<StepIndicator steps={3} currentStep={currentStep}>`
- Krok 1: "Podstawy" (check icon gdy ukończony)
- Krok 2: "Ćwiczenia" (active highlight)
- Krok 3: "Serie"

---

**KROK 1: Podstawowe informacje** (`/plans/create?step=1`)

**Główny cel**: Podanie nazwy i opisu planu

**Komponenty**:
- `<PlanBasicsForm>`:
  - Input "Nazwa planu" (required, max 100 znaków)
    - Placeholder: "np. FBW A - Full Body Workout"
  - Textarea "Opis" (optional, max 500 znaków)
    - Placeholder: "Opisz cel i częstotliwość treningu"
  - Select "Cel treningu" (optional):
    - Opcje: "Siła" | "Masa mięśniowa" | "Wytrzymałość" | "Ogólny fitness"
- Footer Actions:
  - `<Button variant="outline">Anuluj</Button>` → navigate `/plans`
  - `<Button>Dalej</Button>` → Validate + Save to localStorage + navigate `?step=2`

**Walidacja**:
- Nazwa: required, min 3 znaki
- Inline error messages pod polami

---

**KROK 2: Wybór ćwiczeń** (`/plans/create?step=2`)

**Główny cel**: Wybór ćwiczeń z katalogu

**Komponenty**:
- **Reuse `<ExerciseCatalog>` z multi-select**:
  - Search bar + filtry (kategoria, trudność)
  - Grid/list z checkboxami na kartach
  - Selected indicator: Checked state (✓) + highlight border
- **Selected Count Banner** (sticky top pod progress):
  - "Wybrano X ćwiczeń" + Badge
  - Button "Wyczyść wszystko" (jeśli >0)
- **Exercise Cards** z checkbox overlay (top-left corner)

**Footer Actions**:
- `<Button variant="outline">Wstecz</Button>` → `?step=1`
- `<Button disabled={selected.length === 0}>Dalej</Button>` → `?step=3`

**UX**:
- Minimum 1 ćwiczenie wymagane do przejścia dalej
- Zachowaj selected state przy wracaniu do step 2

---

**KROK 3: Konfiguracja serii** (`/plans/create?step=3`)

**Główny cel**: Dodanie serii (reps, weight) dla każdego wybranego ćwiczenia

**Komponenty**:
- **Lista wybranych ćwiczeń** (sortable - drag handle):
  - `<ExerciseSetConfigAccordion>` × N (każde ćwiczenie):
    - Header (collapsible):
      - Drag handle (⋮⋮)
      - Ikona ćwiczenia + nazwa
      - Badge: "X setów" (liczba dodanych)
      - Expand/Collapse chevron
    - Body (expanded):
      - `<SetFormList>`:
        - Każdy set: Row z polami
          - Input "Powtórzenia" (number, min 1, default 10)
          - Input "Ciężar (kg)" (number, min 0, default 0, step 2.5)
          - IconButton "Usuń set" (trash icon, destructive)
        - Button "Dodaj set" → Append nowy set
        - Button "Bulk add" → Modal z formularzem "Dodaj X setów po Y powtórzeń z Z kg"

**Bulk Add Modal**:
- Input "Liczba setów" (number, min 1, max 10)
- Input "Powtórzenia" (number, min 1)
- Input "Ciężar" (number, min 0)
- Preview: "Zostanie dodanych 3 sety: 3×10 po 50 kg"
- Actions: "Anuluj" | "Dodaj"

**Footer Actions**:
- `<Button variant="outline">Wstecz</Button>` → `?step=2`
- `<Button disabled={anySetsEmpty}>Zapisz plan</Button>` → POST `/api/plans` (bulk create)

**Success Flow**:
- Toast: "Plan „{planName}" został utworzony"
- Redirect: `/plans`
- Clear localStorage draft

**Draft Recovery**:
- Auto-save do localStorage co 30s
- Banner przy powrocie: "Znaleziono niezakończony plan. Przywrócić?"
  - Actions: "Przywróć" | "Odrzuć"

**UX, dostępność i bezpieczeństwo**:
- **Walidacja**: Każde pole validowane (min/max values)
- **Loading**: Spinner w button podczas POST
- **Error**: Toast + możliwość retry jeśli 500, validation errors inline jeśli 422
- **Drag & Drop**: Touch-friendly na mobile, keyboard accessible (Alt+↑/↓)
- **Accessibility**: Focus trap w modalu, ESC zamyka modal
- **Business Logic**: Check limit 7 planów przed POST (400 jeśli exceeded)

---

#### 2.2.5. Rozpoczęcie treningu (wybór planu)
**Ścieżka**: `/workouts/start`
**Dostęp**: Zalogowani użytkownicy
**Layout**: `<MainLayout>` lub `<FullScreenLayout>`

**Główny cel**: Wybór planu treningowego do rozpoczęcia sesji

**Kluczowe informacje**:
- Lista planów użytkownika
- Quick preview każdego planu (ćwiczenia, liczba setów)
- Historia ostatnich treningów dla planu

**Kluczowe komponenty**:

**Header**:
- Tytuł: "Rozpocznij trening"
- Subtitle: "Wybierz plan treningowy"

**Plans List**:
- Similar do `/plans` ale z fokusem na akcję "Rozpocznij"
- `<PlanSelectionCard>` × N:
  - Nazwa planu
  - Liczba ćwiczeń i setów (total)
  - Preview ćwiczeń (ikony, max 5)
  - Ostatni trening: "2 dni temu" lub "Nigdy"
  - Primary CTA: `<Button size="lg" fullWidth>Rozpocznij</Button>`

**Click Action**:
- POST `/api/workouts` z `{ planId }`
- Response: `{ workoutId, startTime }`
- Navigate: `/workouts/active?id={workoutId}`

**Empty State**:
- "Nie masz jeszcze planów treningowych"
- CTA: "Utwórz pierwszy plan"

**UX, dostępność i bezpieczeństwo**:
- **Loading**: Skeleton cards
- **Error**: Toast jeśli POST fail + retry
- **Quick action**: Direct start bez dodatkowych kroków
- **RLS**: User can only start own plans

---

#### 2.2.6. Aktywny trening
**Ścieżka**: `/workouts/active?id={workoutId}`
**Dostęp**: Zalogowani użytkownicy (tylko owner workout)
**Layout**: `<FullScreenLayout>` bez nawigacji (focus mode)

**Główny cel**: Wykonanie treningu z real-time tracking i modyfikacją parametrów

**Kluczowe informacje**:
- Timer (elapsed time)
- Obecne ćwiczenie i set
- Target parameters (z planu)
- Actual parameters (edytowalne)
- Progress (% ukończonych ćwiczeń)

**Kluczowe komponenty**:

**Header** (fixed top, compact):
- `<WorkoutHeader>`:
  - Timer: "MM:SS" (odliczanie od start_time), auto-update co 1s
  - Nazwa planu (centered, truncate)
  - Button "Zakończ" (right, warning color, small) → Confirmation dialog

**Main Section** (scrollable, centered):
- `<CurrentExerciseCard>` (large, prominent):
  - Ikona ćwiczenia (SVG, 80×80px)
  - Nazwa ćwiczenia (bold, large)
  - Set indicator: "Set 1/3" (muted, smaller)
  - Target (z planu): "10 powtórzeń × 50 kg" (muted, strike-through gdy completed)

  **Controls** (large touch targets, min 44×44px):
  - Reps control:
    - Label "Powtórzenia"
    - `<NumberInput>`:
      - Button "-" (large, round)
      - Display current value (60px font, bold)
      - Button "+" (large, round)
    - Increment: ±1
  - Weight control:
    - Label "Ciężar (kg)"
    - `<NumberInput>`:
      - Button "-" (large, round)
      - Display current value (60px font, bold)
      - Button "+" (large, round)
    - Increment: ±2.5 kg (configurable)

  - `<Button size="xl" fullWidth variant="success">
      <CheckCircle icon /> Ukończ set
    </Button>` (high contrast green, prominent)

**Click "Ukończ set" action**:
- POST `/api/workouts/{id}/sets` z `{ exerciseId, repetitions, weight, completed: true }`
- Optimistic update: Mark set as completed
- Auto-advance: Przejdź do następnego seta lub ćwiczenia
- Haptic feedback (mobile): Vibration przy ukończeniu

**Progress Section** (below main):
- `<ProgressBar value={completedExercises / totalExercises * 100} />`
- Text: "Ukończono X/Y ćwiczeń"

**Upcoming Exercises** (collapsible):
- `<Accordion title="Pozostałe ćwiczenia (N)">`:
  - Lista pozostałych ćwiczeń:
    - Ikona + nazwa
    - Liczba setów (np. "3 sety")
    - Checkmarks dla ukończonych setów (✓✓○)

**Zakończenie treningu**:
- Click "Zakończ" → `<ConfirmationDialog>`:
  - Title: "Zakończyć trening?"
  - Message: "Nieukończone serie nie zostaną zapisane."
  - Actions: "Kontynuuj trening" | "Zakończ" (destructive)
- POST `/api/workouts/{id}/end` → Response: summary
- Navigate: `/workouts/{id}` (podsumowanie)

**Mobile Optimizations**:
- Large typography (min 18px body, 60px values)
- High contrast colors (foreground:background ratio ≥7:1)
- No distractions: Ukryj bottom navigation bar
- Wake Lock API: `navigator.wakeLock.request('screen')` prevent sleep
- Landscape mode: Horizontal layout controls

**UX, dostępność i bezpieczeństwo**:
- **Real-time save**: Auto-save każdej zmiany parametrów (debounce 1s)
- **Offline resilience**: Queue changes w localStorage jeśli offline, sync on reconnect
- **Error handling**: Toast dla błędów API, nie blokuj UI
- **Timer persistence**: Save elapsed time w localStorage (recovery jeśli refresh)
- **Accessibility**: Wszystkie kontrolki keyboard accessible, focus visible, aria-labels
- **RLS**: User can only modify own workout

---

#### 2.2.7. Podsumowanie treningu
**Ścieżka**: `/workouts/{id}`
**Dostęp**: Zalogowani użytkownicy (tylko owner)
**Layout**: `<MainLayout>`

**Główny cel**: Prezentacja statystyk zakończonego treningu

**Kluczowe informacje**:
- Czas trwania
- Liczba ćwiczeń i setów
- Łączna liczba powtórzeń
- Maksymalny ciężar
- Całkowity wolumen (kg × reps)
- Lista wykonanych ćwiczeń z detalami

**Kluczowe komponenty**:

**Header**:
- Data i godzina treningu: "15 października 2025, 18:30"
- Nazwa planu (link do `/plans/{planId}`)
- Status badge: "Ukończony" (green) lub "W trakcie" (yellow)

**Stats Summary** (prominent cards):
- Grid 2×2 (mobile: 2×2, desktop: 4 kolumny):
  - `<StatCard icon={Clock} label="Czas trwania" value="42 min" />`
  - `<StatCard icon={Dumbbell} label="Ćwiczenia" value="6" />`
  - `<StatCard icon={List} label="Serie" value="18" />`
  - `<StatCard icon={Repeat} label="Powtórzenia" value="180" />`
  - `<StatCard icon={Weight} label="Max ciężar" value="100 kg" />`
  - `<StatCard icon={TrendingUp} label="Wolumen" value="2,450 kg" />`

**Exercise Details** (accordion list):
- `<ExerciseAccordion>` × N:
  - Header (collapsible):
    - Ikona + nazwa ćwiczenia
    - Badge: "3 sety"
    - Chevron
  - Body (expanded):
    - Tabela setów:
      | Set | Powtórzenia | Ciężar | Wolumen |
      |-----|-------------|--------|---------|
      | 1   | 10          | 50 kg  | 500 kg  |
      | 2   | 10          | 50 kg  | 500 kg  |
      | 3   | 8           | 55 kg  | 440 kg  |
    - Total dla ćwiczenia: "1,440 kg"

**Actions**:
- `<Button variant="outline">Powtórz trening</Button>` → `/workouts/start?planId={planId}`
- `<Button variant="outline">Edytuj plan</Button>` → `/plans/{planId}/edit`
- `<Button>Powrót do dashboardu</Button>` → `/dashboard`

**UX, dostępność i bezpieczeństwo**:
- **Loading**: Skeleton dla stats + list
- **Error**: Alert banner jeśli brak danych + retry
- **Share**: Button "Udostępnij" (future) → Social media / clipboard
- **Accessibility**: Tabele z headers, semantic HTML
- **RLS**: User sees only own workouts

---

#### 2.2.8. Historia treningów
**Ścieżka**: `/workouts`
**Dostęp**: Zalogowani użytkownicy
**Layout**: `<MainLayout>`

**Główny cel**: Przegląd wszystkich zakończonych treningów

**Kluczowe informacje**:
- Lista treningów chronologicznie (najnowsze pierwsze)
- Quick stats dla każdego
- Filtry (zakres dat, plan)

**Kluczowe komponenty**:

**Header**:
- Tytuł: "Historia treningów"
- Filters:
  - Date range picker: "Ostatnie 7 dni" | "30 dni" | "Wszystkie" | "Zakres..."
  - Plan filter: Dropdown "Wszystkie plany" | {lista planów}

**Workouts List** (chronological):
- `<WorkoutHistoryCard>` × N:
  - Date header: "Dzisiaj" | "Wczoraj" | "15 października 2025"
  - Nazwa planu (link do `/plans/{planId}`)
  - Quick stats (inline):
    - Icon + value: "42 min" | "6 ćwiczeń" | "18 setów" | "2,450 kg"
  - Click → navigate `/workouts/{id}`

**Pagination** lub **Infinite Scroll**:
- Zalecenie: Infinite scroll dla chronological list (lepsze UX dla historii)
- "Ładowanie więcej..." indicator
- API: `?page=X&limit=20`

**Empty State**:
- "Brak treningów w wybranym okresie"
- "Rozpocznij pierwszy trening" CTA

**UX, dostępność i bezpieczeństwo**:
- **Loading**: Skeleton list
- **Error**: Toast + retry
- **Performance**: Lazy load, paginate server-side
- **Accessibility**: Keyboard navigation, date picker accessible
- **RLS**: User sees only own workouts

---

#### 2.2.9. Profil użytkownika
**Ścieżka**: `/profile`
**Dostęp**: Zalogowani użytkownicy
**Layout**: `<MainLayout>`

**Główny cel**: Zarządzanie danymi profilu i ustawieniami

**Kluczowe informacje**:
- Dane osobowe (imię, email)
- Parametry fizyczne (waga, wzrost)
- Ustawienia aplikacji
- Opcje konta (zmiana hasła, wylogowanie)

**Kluczowe komponenty**:

**Profile Header**:
- Avatar (initial letters lub upload photo - future)
- Email użytkownika
- Badge z role ("Użytkownik" | "Administrator")

**Sections** (accordion lub tabs):

**1. Dane osobowe**:
- `<ProfileForm>`:
  - Input "Imię" (required, max 100 znaków)
  - Input "Email" (readonly, display only - zmiana przez Supabase Auth)
  - Button "Zapisz zmiany" → PUT `/api/profile`

**2. Parametry fizyczne**:
- `<PhysicalStatsForm>`:
  - Input "Waga (kg)" (number, min 1, max 500, step 0.1)
  - Input "Wzrost (cm)" (number, min 1, max 300)
  - Button "Zapisz" → PUT `/api/profile`
  - Info: "Dane używane do obliczeń statystyk"

**3. Ustawienia aplikacji**:
- Theme toggle: "Jasny motyw" | "Ciemny motyw" (default: ciemny)
- Language: "Polski" (future: English)
- Notifications: Toggle "Powiadomienia email" (future)

**4. Bezpieczeństwo**:
- Button "Zmień hasło" → Modal z formularzem:
  - Input "Obecne hasło" (password)
  - Input "Nowe hasło" (password, min 8 znaków)
  - Input "Potwierdź hasło" (password)
  - Actions: "Anuluj" | "Zmień hasło" → Supabase Auth API
- Button "Wyloguj się" (outline, destructive) → Sign out + redirect `/auth/login`

**UX, dostępność i bezpieczeństwo**:
- **Validation**: Inline errors, real-time validation
- **Loading**: Spinner w buttonach podczas save
- **Success**: Toast "Zmiany zapisane"
- **Error**: Toast + retry dla błędów API
- **Accessibility**: Labels, focus management, keyboard navigation
- **Security**: Rate limiting dla zmiany hasła (3 próby/15 min)

---

### 2.3. Widoki administracyjne

#### 2.3.1. Panel administracyjny - kategorie
**Ścieżka**: `/admin/categories`
**Dostęp**: Tylko admin (role='admin')
**Layout**: `<MainLayout>` z visual indicator (orange accent, badge "Admin Panel")

**Główny cel**: Zarządzanie kategoriami ćwiczeń (CRUD)

**Kluczowe informacje**:
- Lista wszystkich kategorii
- Liczba ćwiczeń w każdej kategorii
- Actions (edytuj, usuń)

**Kluczowe komponenty**:

**Header**:
- Badge "Admin Panel" (orange, prominent)
- Tytuł: "Zarządzanie kategoriami"
- Button "Dodaj kategorię" (primary) → Otwiera modal

**Categories Table** (responsive: card list na mobile, table na desktop):
- Columns:
  - Nazwa
  - Opis (truncate)
  - Obrazek (thumbnail preview)
  - Liczba ćwiczeń (readonly, count)
  - Akcje (Edit | Delete icons)

**Create/Edit Modal** (`<CategoryFormModal>`):
- Title: "Nowa kategoria" | "Edytuj kategorię"
- Form:
  - Input "Nazwa" (required, unique, max 100 znaków)
  - Textarea "Opis" (optional, max 500 znaków)
  - Image upload:
    - Drag & drop area lub browse file
    - Preview uploaded image
    - Formats: JPG, PNG, SVG (max 2MB)
    - Upload to Supabase Storage → return imageUrl
  - Actions: "Anuluj" | "Zapisz" (POST/PUT `/admin/categories`)

**Delete Confirmation**:
- Title: "Usunąć kategorię „{name}"?"
- Warning: "Kategoria ma X ćwiczeń. Nie można usunąć kategorii z ćwiczeniami."
  - Jeśli exercises > 0: Button "Usuń" disabled + info
  - Jeśli exercises = 0: Button "Usuń" enabled (destructive)
- Actions: "Anuluj" | "Usuń"

**UX, dostępność i bezpieczeństwo**:
- **Authorization check**: Middleware redirect `/dashboard` jeśli nie admin
- **Validation**: Unique name check, image format/size validation
- **Loading**: Spinner w modal button podczas save
- **Error**: Toast dla błędów (409 jeśli duplicate name)
- **Success**: Toast "Kategoria dodana/zaktualizowana"
- **Accessibility**: Modal focus trap, ESC close, keyboard navigation
- **RLS**: Admin-only access via policies

---

#### 2.3.2. Panel administracyjny - ćwiczenia
**Ścieżka**: `/admin/exercises`
**Dostęp**: Tylko admin (role='admin')
**Layout**: `<MainLayout>` z admin indicator

**Główny cel**: Zarządzanie ćwiczeniami w bibliotece (CRUD + bulk actions)

**Kluczowe informacje**:
- Lista wszystkich ćwiczeń
- Kategoria i trudność każdego
- Search i filtry
- Bulk actions

**Kluczowe komponenty**:

**Header**:
- Badge "Admin Panel"
- Tytuł: "Zarządzanie ćwiczeniami"
- Search bar + filtry (kategoria, trudność) - reuse z `/exercises`
- Button "Dodaj ćwiczenie" (primary) → Otwiera drawer

**Bulk Actions Toolbar** (conditional, visible gdy selected > 0):
- Checkbox "Zaznacz wszystkie" (w header tabeli)
- Selected count: "Wybrano X ćwiczeń"
- Actions:
  - Button "Usuń zaznaczone" (destructive) → Confirmation dialog
  - Dropdown "Zmień kategorię" → Submenu z kategoriami → Batch update

**Exercises Table/Grid**:
- Checkbox column (dla bulk select)
- Nazwa + ikona (SVG preview, small)
- Kategoria (badge)
- Trudność (dots indicator)
- Akcje: Edit | Delete icons

**Create/Edit Drawer** (`<ExerciseFormDrawer>` - slide from right):
- Title: "Nowe ćwiczenie" | "Edytuj ćwiczenie"
- Form (scrollable):
  - Input "Nazwa" (required, max 100 znaków)
  - Textarea "Opis" (required, max 1000 znaków)
  - Textarea "Instrukcje" (optional, multi-line)
    - Info: "Każda linia jako oddzielny krok"
  - Dropdown "Kategoria" (required, select z listy)
  - Select "Poziom trudności" (required):
    - "Łatwy" | "Średni" | "Trudny" | "Ekspert"
  - Multi-select "Partie mięśniowe" (optional):
    - Checkboxy: "Klatka", "Plecy", "Nogi", "Barki", "Biceps", "Triceps", ...
  - SVG icon upload:
    - Options:
      - Upload SVG file (max 100KB)
      - Paste SVG code (textarea)
      - Icon picker z pre-defined set (future)
    - Preview (64×64px)
  - Actions: "Anuluj" | "Zapisz" (POST/PUT `/admin/exercises`)

**Delete Confirmation**:
- Title: "Usunąć ćwiczenie „{name}"?"
- Warning: "Ćwiczenie jest używane w X planach treningowych. Usunięcie uniemożliwi tworzenie nowych treningów z tymi planami."
  - Jeśli in_use: Button disabled + warning
  - Jeśli not in_use: Button enabled
- Actions: "Anuluj" | "Usuń"

**Bulk Delete Confirmation**:
- Title: "Usunąć X wybranych ćwiczeń?"
- List: Pokazuje nazwy ćwiczeń do usunięcia
- Warning: Sprawdź które są używane, wymień je
- Actions: "Anuluj" | "Usuń dostępne (Y)"

**UX, dostępność i bezpieczeństwo**:
- **Authorization**: Middleware + UI guard
- **Search**: Debounce 300ms, highlight matches
- **Bulk actions**: Keyboard shortcuts (Ctrl+A select all, Delete key)
- **Validation**: All fields validated, SVG code validated (basic XML check)
- **Loading**: Skeleton table, spinner w drawer button
- **Error**: Toast dla błędów (409 conflict, 422 validation)
- **Success**: Toast "Ćwiczenie dodane/zaktualizowane/usunięte"
- **Accessibility**: Drawer focus trap, keyboard navigation, checkboxes keyboard accessible
- **RLS**: Admin-only CRUD, regular users read-only

---

## 3. Mapa podróży użytkownika

### 3.1. Onboarding - nowy użytkownik

```
START → /auth/register
  ↓ (submit form)
Email verification
  ↓ (klik link w email)
/auth/login (automatyczne zalogowanie po verify - optional)
  ↓
/dashboard (pierwszy raz - empty state)
  ↓ (klik "Utwórz nowy plan")
/plans/create?step=1
  ↓ (nazwa + opis)
?step=2
  ↓ (wybór ćwiczeń)
?step=3
  ↓ (dodanie setów)
POST /api/plans → Success
  ↓
/plans (lista z 1 planem)
  ↓ (klik "Rozpocznij")
/workouts/start
  ↓ (wybór planu)
POST /api/workouts → /workouts/active
  ↓ (wykonanie ćwiczeń)
POST /api/workouts/{id}/end
  ↓
/workouts/{id} (podsumowanie)
  ↓ (klik "Powrót do dashboardu")
/dashboard (z danymi: 1 trening, wykresy)
```

**Kluczowe touchpointy**:
1. **Rejestracja**: Szybka, email verification (może być optional dla MVP)
2. **Pierwszy plan**: Guided wizard, jasne instrukcje
3. **Pierwszy trening**: Focus mode, duże przyciski, brak rozpraszaczy
4. **Podsumowanie**: Pozytywne wzmocnienie (achievements, progress)

**Potencjalne punkty bólu**:
- **Overwhelm na pustym dashboardzie**: Rozwiązanie → Wyraźne empty state z CTA
- **Wybór ćwiczeń (za dużo opcji)**: Rozwiązanie → Filtry + search, sugestie popularnych
- **Skomplikowane dodawanie setów**: Rozwiązanie → Bulk add, sensowne defaulty

---

### 3.2. Powracający użytkownik - regularna sesja treningowa

```
START → /auth/login
  ↓ (credentials)
/dashboard
  ↓ (przegląd statystyk)
  ↓ (klik "Rozpocznij trening" - prominent button)
/workouts/start
  ↓ (wybór planu z listy - 1 klik)
POST /api/workouts → /workouts/active
  ↓ (wykonanie 6-8 ćwiczeń, 18-24 sety, 30-60 min)
  │ (real-time modyfikacje parametrów)
  │ (marking sets jako ukończone)
  ↓
POST /api/workouts/{id}/end
  ↓
/workouts/{id} (podsumowanie + statystyki)
  ↓ (opcjonalnie: przegląd dashboard)
/dashboard (zaktualizowane wykresy)
  ↓
Wylogowanie (optional) lub zamknięcie
```

**Kluczowe cele**:
- **Minimalny friction**: Od logowania do startu treningu max 3 kliki
- **Smooth tracking**: Auto-save, brak opóźnień, offline resilience
- **Natychmiastowy feedback**: Podsumowanie od razu po zakończeniu

**Optymalizacje UX**:
- Zapamiętaj ostatni używany plan → Quick action "Powtórz ostatni trening"
- Pre-populate parametry z ostatniej sesji (dla tego samego planu)
- Background auto-save → User nigdy nie traci postępu

---

### 3.3. Admin - zarządzanie zawartością

```
START → /auth/login (jako admin)
  ↓
/dashboard
  ↓ (sidebar: visible "Admin" section)
  ↓ (klik "Admin → Ćwiczenia")
/admin/exercises
  ↓ (search "bench press")
  ↓ (klik Edit na wybranym)
Drawer: <ExerciseFormDrawer>
  ↓ (modyfikacja opisu, dodanie instrukcji)
  ↓ (klik "Zapisz")
PUT /admin/exercises/{id} → Success toast
  ↓
/admin/exercises (zaktualizowana lista)
  ↓ (klik "Dodaj ćwiczenie")
Drawer: <ExerciseFormDrawer mode="create">
  ↓ (wypełnienie formularza + upload SVG)
  ↓ (klik "Zapisz")
POST /admin/exercises → Success toast
  ↓
/admin/exercises (nowe ćwiczenie w liście)
  ↓ (przejście do kategorii)
/admin/categories
  ↓ (klik "Dodaj kategorię")
Modal: <CategoryFormModal>
  ↓ (nazwa, opis, upload obrazka)
  ↓ (klik "Zapisz")
POST /admin/categories → Success toast
  ↓
/admin/categories (nowa kategoria w tabeli)
```

**Kluczowe potrzeby**:
- **Efektywność**: Bulk actions dla wielu ćwiczeń
- **Walidacja**: Prevent usuwania używanych kategorii/ćwiczeń
- **Preview**: Natychmiastowy podgląd jak będzie wyglądać dla użytkowników

---

### 3.4. Edge cases - obsługa błędów

#### 3.4.1. Utrata połączenia podczas aktywnego treningu

```
User na /workouts/active
  ↓ (internet disconnected)
Attempted POST /api/workouts/{id}/sets → FAIL
  ↓
App: Save zmianę do localStorage queue
  ↓
Toast: "Brak połączenia. Zmiany zostaną zapisane po przywróceniu internetu."
  ↓ (user kontynuuje trening offline)
  ↓ (internet reconnected)
App: Auto-retry queued requests
  ↓
Success → Toast: "Połączenie przywrócone. Zmiany zsynchronizowane."
```

#### 3.4.2. Próba utworzenia 8. planu (przekroczenie limitu)

```
User na /plans/create?step=3
  ↓ (klik "Zapisz plan")
POST /api/plans → 400 Bad Request: "Limit 7 aktywnych planów"
  ↓
Toast error: "Osiągnięto limit 7 aktywnych planów. Usuń nieużywany plan lub edytuj istniejący."
  ↓
Redirect: /plans (z highlight na limit indicator)
```

#### 3.4.3. Session timeout

```
User na /dashboard (po 24h nieaktywności)
  ↓ (próba akcji wymagającej auth)
API request → 401 Unauthorized
  ↓
Middleware: Detect 401
  ↓
Toast: "Sesja wygasła. Zaloguj się ponownie."
  ↓
Redirect: /auth/login?redirect=/dashboard
  ↓ (po zalogowaniu)
Redirect back: /dashboard
```

---

## 4. Układ i struktura nawigacji

### 4.1. Nawigacja główna

#### 4.1.1. Desktop (≥1024px) - Persistent Sidebar

**Layout**:
- Sidebar: 250px szerokości, fixed po lewej stronie, full height
- Main content: margin-left 250px, zajmuje pozostałą przestrzeń

**Struktura Sidebar** (top → bottom):

```
┌─────────────────────────┐
│  [LOGO] Fitness Tracker │
├─────────────────────────┤
│                         │
│  🏠 Dashboard           │
│  📋 Moje plany          │
│  💪 Treningi            │
│  📚 Katalog ćwiczeń     │
│  👤 Profil              │
│                         │
├─────────────────────────┤ (conditional dla admin)
│  ⚙️ Admin               │
│    ├─ Kategorie         │
│    └─ Ćwiczenia         │
├─────────────────────────┤
│                         │
│  [Avatar] Jan Kowalski  │
│  ▼                      │
│    └─ Ustawienia        │
│    └─ Wyloguj się       │
└─────────────────────────┘
```

**Komponenty**:
- `<Sidebar>`
  - `<SidebarHeader>`: Logo + Nazwa (klikalna → `/dashboard`)
  - `<SidebarNav>`:
    - `<NavItem to="/dashboard" icon={Home}>Dashboard</NavItem>`
    - `<NavItem to="/plans" icon={List}>Moje plany</NavItem>`
    - `<NavItem to="/workouts" icon={Dumbbell}>Treningi</NavItem>`
    - `<NavItem to="/exercises" icon={BookOpen}>Katalog ćwiczeń</NavItem>`
    - `<NavItem to="/profile" icon={User}>Profil</NavItem>`
  - `<SidebarAdmin>` (conditional dla role='admin'):
    - `<NavGroup title="Admin" icon={Settings} orange accent>`:
      - `<NavItem to="/admin/categories">Kategorie</NavItem>`
      - `<NavItem to="/admin/exercises">Ćwiczenia</NavItem>`
  - `<SidebarFooter>`:
    - `<UserDropdown>`:
      - Avatar (circle, initials)
      - Name + email (truncate)
      - Dropdown menu:
        - "Ustawienia" → `/profile`
        - "Wyloguj się" → Sign out

**Stany**:
- Active link: Highlight (background accent, bold text)
- Hover: Subtle background change
- Collapsed state (optional): Icon-only mode (toggle button)

---

#### 4.1.2. Mobile/Tablet (<1024px) - Bottom Navigation + Drawer

**Layout**:
- Bottom Nav: Fixed at bottom, 60px height, full width
- Main content: padding-bottom 60px (avoid overlap)
- Drawer: Slide-in from left (hamburger trigger)

**Bottom Navigation Bar**:

```
┌──────────────────────────────────────────┐
│  [🏠]    [📋]    [💪]    [☰]             │
│ Dashboard Plany Treningi Więcej          │
└──────────────────────────────────────────┘
```

**Komponenty**:
- `<BottomNav>` (4-5 items):
  - `<NavButton to="/dashboard" icon={Home}>Dashboard</NavButton>`
  - `<NavButton to="/plans" icon={List}>Plany</NavButton>`
  - `<NavButton to="/workouts" icon={Dumbbell}>Treningi</NavButton>`
  - `<NavButton onClick={openDrawer} icon={Menu}>Więcej</NavButton>`

**Drawer Menu** (triggered by "Więcej"):
- Slide-in from left, overlay (with backdrop)
- Content:
  - Header: Avatar + Name + email
  - Nav items:
    - "Katalog ćwiczeń" → `/exercises`
    - "Profil" → `/profile`
    - "Admin" → Submenu (jeśli admin)
    - "Wyloguj się" → Sign out
- Close: X button (top-right) lub klik backdrop

**Stany**:
- Active: Icon + label highlighted (accent color)
- Badge: Notifications indicator (future): "3" w kółku na ikonie

---

#### 4.1.3. Focus Mode - No Navigation

**Context**: Widok aktywnego treningu (`/workouts/active`)

**Layout**:
- Ukryj sidebar (desktop) i bottom nav (mobile)
- Full screen dla main content
- Minimal header (timer + nazwa + "Zakończ")

**Rationale**: Minimalizacja rozpraszaczy podczas treningu

---

### 4.2. Breadcrumbs (optional, dla głębokich struktur)

**Gdzie**: Widoki zagnieżdżone (np. `/plans/{id}/edit`)

**Format**:
```
Dashboard > Moje plany > FBW A - Full Body Workout > Edycja
```

**Komponenty**:
- `<Breadcrumbs>`:
  - `<BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>`
  - `<BreadcrumbItem to="/plans">Moje plany</BreadcrumbItem>`
  - `<BreadcrumbItem to="/plans/{id}" current>FBW A</BreadcrumbItem>`

**Accessibility**: aria-label="Breadcrumb navigation"

---

### 4.3. Nawigacja kontekstowa

#### 4.3.1. Tabs (w obrębie widoku)

**Gdzie**: Dashboard (przełączanie między Analytics views), Profile (sekcje)

**Format**:
```
[7 dni] [14 dni] [30 dni]
  ↑ active
```

**Komponenty**:
- `<Tabs defaultValue="7days">`
  - `<TabsList>`
    - `<TabsTrigger value="7days">7 dni</TabsTrigger>`
    - `<TabsTrigger value="14days">14 dni</TabsTrigger>`
    - `<TabsTrigger value="30days">30 dni</TabsTrigger>`
  - `<TabsContent value="7days">`
    - {Charts dla 7 dni}

---

#### 4.3.2. Stepper (wizard navigation)

**Gdzie**: `/plans/create` (3-step wizard)

**Format**:
```
[✓ 1. Podstawy] → [● 2. Ćwiczenia] → [○ 3. Serie]
                      ↑ current
```

**Komponenty**:
- `<StepIndicator steps={3} currentStep={2}>`
  - Step 1: Checkmark (completed)
  - Step 2: Filled circle (active)
  - Step 3: Empty circle (pending)
- Klik na ukończony step → navigate back (allowed)
- Klik na pending step → disabled (must complete current first)

---

### 4.4. Quick Actions (FAB - Floating Action Button)

**Gdzie**: Desktop i mobile, dla kluczowych akcji

**Przykłady**:
1. `/dashboard`: FAB "+" (Rozpocznij trening) - prominent, bottom-right
2. `/plans`: FAB "+" (Utwórz nowy plan)
3. `/admin/exercises`: FAB "+" (Dodaj ćwiczenie) - orange accent

**Komponenty**:
- `<Fab icon={Plus} onClick={action} variant="primary" />`
- Position: fixed, bottom-right (16px margin)
- Size: 56×56px (mobile), 64×64px (desktop)
- Shadow: elevation-4
- Animation: Scale on hover, ripple on click

---

## 5. Kluczowe komponenty

### 5.1. Komponenty layoutowe

#### 5.1.1. `<MainLayout>`
**Opis**: Główny layout aplikacji z nawigacją
**Użycie**: Wszystkie widoki aplikacji (poza auth i focus mode)
**Struktura**:
```tsx
<MainLayout>
  <Sidebar /> {/* Desktop only */}
  <BottomNav /> {/* Mobile/Tablet only */}
  <main className="lg:ml-64 pb-16 lg:pb-0">
    {children}
  </main>
</MainLayout>
```

#### 5.1.2. `<AuthLayout>`
**Opis**: Layout dla widoków uwierzytelniania (bez nawigacji głównej)
**Użycie**: `/auth/login`, `/auth/register`, `/auth/reset-password`
**Struktura**:
```tsx
<AuthLayout>
  <div className="min-h-screen flex items-center justify-center bg-muted">
    <Card className="w-full max-w-md">
      {children}
    </Card>
  </div>
</AuthLayout>
```

#### 5.1.3. `<FullScreenLayout>`
**Opis**: Full screen bez nawigacji (focus mode)
**Użycie**: `/workouts/active`
**Struktura**:
```tsx
<FullScreenLayout>
  <main className="min-h-screen">
    {children}
  </main>
</FullScreenLayout>
```

---

### 5.2. Komponenty nawigacyjne

#### 5.2.1. `<Sidebar>`
**Props**: None
**State**: collapsed (boolean) - optional
**Funkcje**: Renderuje persistent sidebar z navigation items
**Responsywność**: hidden na <1024px

#### 5.2.2. `<BottomNav>`
**Props**: None
**State**: activeRoute (string)
**Funkcje**: Renderuje bottom navigation bar z 4-5 głównych items
**Responsywność**: visible tylko na <1024px

#### 5.2.3. `<NavItem>`
**Props**: `{ to: string, icon: LucideIcon, children: ReactNode, active?: boolean }`
**Funkcje**: Pojedynczy item w nawigacji, highlight jeśli active
**Accessibility**: aria-current="page" gdy active

#### 5.2.4. `<Breadcrumbs>`
**Props**: `{ items: Array<{ label: string, to?: string }> }`
**Funkcje**: Renderuje breadcrumb trail
**Accessibility**: nav z aria-label="Breadcrumb"

---

### 5.3. Komponenty formularzy

#### 5.3.1. `<Input>`
**Props**: Standard HTML input props + error, label
**Funkcje**: Styled input z label, error message, focus states
**Walidacja**: Integracja z React Hook Form + Zod
**Accessibility**: label połączony z input, error z aria-describedby

#### 5.3.2. `<Button>`
**Props**: `{ variant: 'primary' | 'outline' | 'destructive', size: 'sm' | 'md' | 'lg', loading?: boolean }`
**Funkcje**: Styled button z loading state (spinner + disabled)
**Touch target**: Min 44×44px dla mobile

#### 5.3.3. `<Select>` / `<Dropdown>`
**Props**: `{ options: Array<{value, label}>, value, onChange }`
**Funkcje**: Custom styled select z keyboard navigation
**Accessibility**: aria-expanded, aria-haspopup

#### 5.3.4. `<Checkbox>` / `<Toggle>`
**Props**: `{ checked, onChange, label }`
**Funkcje**: Custom styled checkbox z label
**Accessibility**: aria-checked

---

### 5.4. Komponenty feedbacku

#### 5.4.1. `<Toast>`
**Props**: `{ variant: 'success' | 'error' | 'info', message: string, action?: { label, onClick } }`
**Funkcje**: Notification w prawym górnym rogu, auto-dismiss 5s
**Library**: Sonner (zalecane dla Shadcn/ui)
**Pozycje**: top-right (desktop), top-center (mobile)

#### 5.4.2. `<Alert>`
**Props**: `{ variant: 'info' | 'warning' | 'error', title, description, action?: ReactNode }`
**Funkcje**: In-page alert banner (persistent)
**Użycie**: Critical errors z retry button, warnings

#### 5.4.3. `<Skeleton>`
**Props**: `{ className, variant: 'text' | 'circle' | 'rect' }`
**Funkcje**: Animated loading placeholder
**Użycie**: Lists, cards, charts podczas ładowania

#### 5.4.4. `<Spinner>` / `<Loader>`
**Props**: `{ size: 'sm' | 'md' | 'lg' }`
**Funkcje**: Animated spinner (rotating icon)
**Użycie**: Inline loading (buttons, sections)

---

### 5.5. Komponenty danych

#### 5.5.1. `<Card>`
**Props**: `{ children, className, onClick?, hover? }`
**Funkcje**: Container z border, shadow, padding
**Użycie**: Workout cards, plan cards, stat cards
**Hover**: Optional scale + shadow effect

#### 5.5.2. `<StatCard>`
**Props**: `{ icon: LucideIcon, label: string, value: string | number, trend?: string }`
**Funkcje**: Displays single statistic z icon i optional trend
**Layout**: Icon (top/left), value (large, bold), label (muted)

#### 5.5.3. `<Table>`
**Props**: Standard table props
**Funkcje**: Responsive table (card layout na mobile)
**Accessibility**: thead z scope="col", tbody z proper structure

#### 5.5.4. `<Accordion>`
**Props**: `{ items: Array<{ title, content }>, defaultOpen?: number }`
**Funkcje**: Collapsible sections
**Accessibility**: aria-expanded, keyboard navigation (Enter/Space toggle)

---

### 5.6. Komponenty modalne

#### 5.6.1. `<Modal>`
**Props**: `{ open, onClose, title, children, footer? }`
**Funkcje**: Center-aligned modal z backdrop
**Accessibility**: Focus trap, ESC close, aria-modal
**Użycie**: Category form, confirmation dialogs

#### 5.6.2. `<Drawer>`
**Props**: `{ open, onClose, side: 'left' | 'right', children }`
**Funkcje**: Slide-in panel z backdrop
**Accessibility**: Focus trap, ESC close
**Użycie**: Exercise form (admin), mobile menu

#### 5.6.3. `<ConfirmationDialog>`
**Props**: `{ open, onClose, title, message, confirmLabel, onConfirm, variant: 'default' | 'destructive' }`
**Funkcje**: Simple confirmation z 2 buttons (Cancel | Confirm)
**Użycie**: Delete actions, workout zakończenie

---

### 5.7. Komponenty wizualizacji

#### 5.7.1. `<WeeklyVolumeChart>`
**Props**: `{ data: Array<{ day, volume }>, dateRange: '7d' | '14d' | '30d' }`
**Library**: Recharts (BarChart)
**Funkcje**: Bar chart z tooltip, responsive
**Empty state**: Message gdy brak danych

#### 5.7.2. `<MaxWeightChart>`
**Props**: `{ data: Array<{ session, maxWeight }>, dateRange }`
**Library**: Recharts (LineChart)
**Funkcje**: Line chart z dots, smooth curve, tooltip
**Empty state**: Message gdy brak danych

#### 5.7.3. `<ProgressBar>`
**Props**: `{ value: number (0-100), label?: string, variant?: 'default' | 'success' }`
**Funkcje**: Horizontal progress bar
**Użycie**: Workout progress, set completion

---

### 5.8. Komponenty specjalizowane

#### 5.8.1. `<ExerciseCard>`
**Props**: `{ exercise: Exercise, onClick, selectable?: boolean, selected?: boolean }`
**Funkcje**: Display exercise z icon, name, category, difficulty
**Użycie**: Exercise catalog, plan creation step 2

#### 5.8.2. `<WorkoutSetControl>`
**Props**: `{ value, onChange, label, increment, min, max }`
**Funkcje**: Number input z large +/- buttons (touch-friendly)
**Użycie**: Active workout rep/weight control

#### 5.8.3. `<StepIndicator>`
**Props**: `{ steps: number, currentStep: number, onStepClick? }`
**Funkcje**: Visual stepper dla wizard navigation
**Użycie**: Plan creation wizard

#### 5.8.4. `<EmptyState>`
**Props**: `{ icon?: ReactNode, title: string, description?: string, action?: ReactNode }`
**Funkcje**: Friendly empty state z illustration + CTA
**Użycie**: Empty lists (plans, workouts), no data states

---

## 6. Stany UI i obsługa błędów

### 6.1. Loading States

**Strategia**: Preferuj skeleton screens nad spinners dla lepszego UX

**Implementacja**:
- Lists/Grids: `<SkeletonCard>` × N (pulse animation)
- Single items: `<Skeleton variant="text" />` dla text lines
- Buttons: Inline `<Loader>` + disabled state
- Charts: `<SkeletonChart>` (gray rectangles)

**Przykład**:
```tsx
{isLoading ? (
  <SkeletonGrid count={6} />
) : (
  <ExerciseGrid exercises={data} />
)}
```

---

### 6.2. Error States

#### 6.2.1. Non-critical errors (toast)
**Kiedy**: Form validation errors, temporary failures
**Format**: Toast notification (auto-dismiss 5s)
**Akcja**: Optional retry button w toast

#### 6.2.2. Critical errors (alert banner)
**Kiedy**: Network down, server errors, auth failures
**Format**: Persistent alert banner na górze strony
**Akcja**: Retry button + refresh page option

#### 6.2.3. HTTP Error Codes mapping

| Code | Typ | Handling | Przykład |
|------|-----|----------|----------|
| 400 | Validation error | Toast z szczegółami | "Nazwa planu jest wymagana" |
| 401 | Unauthorized | Redirect `/auth/login` | Session timeout |
| 403 | Forbidden | Toast + redirect `/dashboard` | Non-admin próbuje `/admin/*` |
| 404 | Not found | Toast + redirect back | Plan nie istnieje |
| 409 | Conflict | Toast z instrukcją | "Kategoria o tej nazwie już istnieje" |
| 422 | Validation error | Inline errors w formie | Field-specific messages |
| 500 | Server error | Alert banner + retry | "Błąd serwera. Spróbuj ponownie" |

---

### 6.3. Empty States

**Komponenty**: `<EmptyState>` (reusable)

**Przypadki**:
1. **Brak planów** (`/plans`):
   - Illustration: Clipboard icon
   - Title: "Nie masz jeszcze planów treningowych"
   - CTA: "Stwórz pierwszy plan"

2. **Brak treningów** (`/workouts`):
   - Illustration: Dumbbell icon
   - Title: "Nie masz jeszcze treningów"
   - CTA: "Rozpocznij pierwszy trening"

3. **Brak wyników search** (`/exercises`):
   - Illustration: Search icon
   - Title: "Nie znaleziono ćwiczeń"
   - Description: "Spróbuj zmienić filtry lub wyszukiwane hasło"
   - Action: "Wyczyść filtry"

4. **Brak danych w wykresie** (Dashboard):
   - Illustration: Chart icon
   - Title: "Brak danych dla wybranego okresu"
   - Description: "Wykonaj pierwszy trening aby zobaczyć statystyki"

---

### 6.4. Success Feedback

**Strategia**: Subtle, non-intrusive confirmation

**Implementacja**:
1. **Toast notification** (preferowane):
   - Duration: 3s
   - Icon: CheckCircle (green)
   - Message: "Plan zapisany pomyślnie"

2. **Inline confirmation** (optional):
   - Below form field
   - Icon + text: "✓ Zmiany zapisane"
   - Auto-hide po 5s

3. **Visual animation** (micro-interaction):
   - Button: Brief scale animation on success
   - List item: Fade in new item z slide animation

---

## 7. Responsywność i accessibility

### 7.1. Responsive Breakpoints

```css
/* Mobile (default) */
@media (min-width: 320px) { /* ... */ }

/* Large Mobile */
@media (min-width: 640px) { /* sm: */ }

/* Tablet */
@media (min-width: 768px) { /* md: */ }

/* Desktop */
@media (min-width: 1024px) { /* lg: */ }

/* Large Desktop */
@media (min-width: 1280px) { /* xl: */ }

/* Extra Large */
@media (min-width: 1536px) { /* 2xl: */ }
```

### 7.2. Responsive Patterns

#### 7.2.1. Navigation
- Mobile: Bottom nav (4-5 items) + Drawer
- Tablet: Same as mobile (optional: collapsed sidebar)
- Desktop: Persistent sidebar

#### 7.2.2. Grids
- Mobile: 1 kolumna (stacked)
- Tablet: 2 kolumny
- Desktop: 3-4 kolumny

#### 7.2.3. Forms
- Mobile: Full-width inputs, stacked labels
- Tablet: 2-column layout dla related fields
- Desktop: Same as tablet

#### 7.2.4. Modals
- Mobile: Full-screen (Drawer)
- Tablet: 80% width, centered
- Desktop: Max 600px width, centered

---

### 7.3. Accessibility Guidelines

**Poziom zgodności**: WCAG A (zgodnie z session notes - podstawowe, nie pełne)

#### 7.3.1. Keyboard Navigation
- **Tab order**: Logiczny, sekwencyjny
- **Focus visible**: Wyraźny outline (ring-2 ring-accent)
- **Skip link**: "Przejdź do głównej treści" (ukryty, visible on focus)
- **Shortcuts**: Enter/Space dla buttons, ESC zamyka modals

#### 7.3.2. Screen Readers
- **Semantic HTML**: `<nav>`, `<main>`, `<article>`, `<button>`
- **Aria labels**: Icon buttons z aria-label
- **Aria live**: Notifications z aria-live="polite"
- **Aria expanded**: Collapsible sections z aria-expanded

#### 7.3.3. Color Contrast
- **Text**: Minimum 4.5:1 dla body text
- **Large text**: Minimum 3:1 dla headings
- **Interactive**: Buttons i links z wyraźnym contrast
- **Dark mode**: Zachowaj contrast ratios w dark theme

#### 7.3.4. Forms
- **Labels**: Zawsze połączone z inputs (htmlFor)
- **Error messages**: aria-describedby dla input + error
- **Required fields**: aria-required="true" + visual indicator (*)
- **Validation**: Real-time, clear messages

#### 7.3.5. Priority Views (testing focus)
1. Auth forms (login, register)
2. Active workout (keyboard shortcuts, focus management)
3. Plan creation (keyboard navigation przez wizard)

---

## 8. Bezpieczeństwo UI

### 8.1. Client-Side Authorization

#### 8.1.1. Protected Routes
**Implementacja**: HOC lub middleware check

```tsx
// Example pseudo-code
<ProtectedRoute requiredAuth>
  <Dashboard />
</ProtectedRoute>

<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

**Redirect**:
- Unauthorized → `/auth/login?redirect={currentPath}`
- Forbidden (non-admin) → `/dashboard` + toast

#### 8.1.2. Conditional Rendering

```tsx
{user.role === 'admin' && (
  <NavItem to="/admin/exercises">Admin Panel</NavItem>
)}
```

**Użycie**: Admin links w sidebar, FAB buttons, action buttons

---

### 8.2. Input Sanitization

#### 8.2.1. Form Validation
- **Client-side**: Zod schemas, real-time validation
- **Server-side**: Duplicate validation na API
- **XSS Prevention**: React automatic escaping, no dangerouslySetInnerHTML

#### 8.2.2. File Uploads
- **Type validation**: Check MIME type (SVG, JPG, PNG)
- **Size limit**: Max 2MB dla images, 100KB dla SVG
- **Sanitization**: Strip metadata, validate SVG structure

---

### 8.3. Session Management

#### 8.3.1. Token Handling
- **Storage**: httpOnly cookies (Supabase default)
- **Refresh**: Auto-refresh w background (Supabase SDK)
- **Timeout**: 24h validity, extend on activity

#### 8.3.2. Logout
- **Client**: Clear local storage, cookies
- **Server**: Invalidate session (Supabase Auth)
- **Redirect**: `/auth/login`

---

### 8.4. Rate Limiting (UI feedback)

**Przypadki**:
1. **Password reset**: Max 3 requests / 15 min
   - UI: Disable button po 3 próbach, countdown timer
2. **Login attempts**: Max 5 / 5 min
   - UI: Captcha po 3 failed attempts (future)
3. **API requests**: 100 req/min per user
   - UI: Throttle repeated clicks, debounce search

---

## 9. State Management Strategy

### 9.1. Zalecana architektura (z session notes)

**React Query (TanStack Query)** - Server state
**Zustand** - Global UI state
**Local State** - Component-specific

---

### 9.2. React Query

#### 9.2.1. Configuration

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      cacheTime: 30 * 60 * 1000, // 30 min
      retry: 3,
      refetchOnWindowFocus: true,
    },
  },
});
```

#### 9.2.2. Custom Hooks per Resource

**Queries** (GET):
- `useExercises(filters)` → GET `/api/exercises`
- `useCategories()` → GET `/api/categories`
- `useTrainingPlans()` → GET `/api/plans`
- `useTrainingPlan(id)` → GET `/api/plans/{id}`
- `useWorkouts(dateRange)` → GET `/api/workouts`
- `useWorkout(id)` → GET `/api/workouts/{id}`
- `useProfile()` → GET `/api/profile`

**Mutations** (POST/PUT/DELETE):
- `useCreatePlan()` → POST `/api/plans`
- `useUpdatePlan(id)` → PUT `/api/plans/{id}`
- `useDeletePlan(id)` → DELETE `/api/plans/{id}` (soft delete)
- `useStartWorkout()` → POST `/api/workouts`
- `useUpdateWorkoutSet(id)` → PATCH `/api/workouts/{id}/sets/{setId}`
- `useCompleteWorkout(id)` → POST `/api/workouts/{id}/end`
- `useUpdateProfile()` → PUT `/api/profile`

#### 9.2.3. Optimistic Updates

**Przykład** (workout set completion):
```tsx
const updateSetMutation = useMutation({
  mutationFn: updateWorkoutSet,
  onMutate: async (newSet) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['workout', workoutId]);

    // Snapshot previous value
    const previousWorkout = queryClient.getQueryData(['workout', workoutId]);

    // Optimistically update
    queryClient.setQueryData(['workout', workoutId], (old) => ({
      ...old,
      sets: old.sets.map(s => s.id === newSet.id ? newSet : s)
    }));

    return { previousWorkout };
  },
  onError: (err, newSet, context) => {
    // Rollback on error
    queryClient.setQueryData(['workout', workoutId], context.previousWorkout);
  },
  onSettled: () => {
    // Refetch to ensure sync
    queryClient.invalidateQueries(['workout', workoutId]);
  },
});
```

---

### 9.3. Zustand (Global UI State)

#### 9.3.1. Store Definition

```tsx
interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;

  // Active workout session
  activeWorkoutId: string | null;
  workoutStartTime: Date | null;
  startWorkout: (id: string) => void;
  endWorkout: () => void;

  // UI preferences
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  activeWorkoutId: null,
  workoutStartTime: null,
  startWorkout: (id) => set({ activeWorkoutId: id, workoutStartTime: new Date() }),
  endWorkout: () => set({ activeWorkoutId: null, workoutStartTime: null }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  theme: 'dark',
  setTheme: (theme) => set({ theme }),
}));
```

#### 9.3.2. Użycie w Komponentach

```tsx
// Odczyt
const user = useAppStore((state) => state.user);
const isAuthenticated = useAppStore((state) => state.isAuthenticated);

// Akcje
const setUser = useAppStore((state) => state.setUser);
const startWorkout = useAppStore((state) => state.startWorkout);
```

---

### 9.4. Local State (useState/useReducer)

**Przypadki użycia**:
- Form inputs (controlled components)
- Modal/drawer open/close states
- Accordion expanded/collapsed
- Temporary UI interactions (hover, focus, drag)
- Local search/filter states (przed wysłaniem do API)

**Przykład**:
```tsx
const [isOpen, setIsOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
```

---

## 10. Performance Optimizations

### 10.1. Code Splitting

- **Route-based**: Lazy load route components (Astro automatic)
- **Component-based**: Dynamic imports dla heavy components (charts)

```tsx
const WeeklyVolumeChart = lazy(() => import('@/components/charts/WeeklyVolumeChart'));

<Suspense fallback={<SkeletonChart />}>
  <WeeklyVolumeChart data={data} />
</Suspense>
```

### 10.2. Image Optimization

- **SVG icons**: Inline dla small (<5KB), load z CDN dla large
- **Images**: Lazy loading (loading="lazy"), responsive srcset
- **Compression**: Optimize przed upload (Supabase Storage)

### 10.3. Data Fetching

- **React Query caching**: Minimize redundant requests
- **Pagination**: Limit results (12-20 per page)
- **Debounce**: Search inputs (300ms), real-time updates (1s)
- **Prefetch**: Hover intent (prefetch plan details on card hover)

### 10.4. Rendering

- **React.memo**: Expensive components (charts, large lists)
- **useCallback**: Event handlers passed to children
- **useMemo**: Expensive calculations (filtered lists, sorted data)
- **Virtual scrolling**: Lists >100 items (react-window - optional)

---

## 11. Testing Strategy (UI Focus)

### 11.1. Unit Tests (Jest + React Testing Library)

**Komponenty do przetestowania**:
- Form components (Input, Button, Select)
- Validation logic (Zod schemas)
- Custom hooks (useExercises, useTrainingPlans)
- Utility functions (formatters, calculators)

**Coverage target**: ≥70% dla business logic

### 11.2. Integration Tests

**Flows do przetestowania**:
- Login flow (form submission → API mock → redirect)
- Plan creation wizard (step navigation, form persistence)
- Workout tracking (parameter updates, set completion)

### 11.3. E2E Tests (Cypress)

**Critical paths**:
1. User registration → Login → Create plan → Start workout → Complete
2. Admin login → Add exercise → Add to plan
3. Error handling (network failure during active workout)

**Coverage target**: Main user journeys

### 11.4. Accessibility Tests

**Tools**: axe DevTools, NVDA/JAWS screen readers, keyboard-only navigation

**Focus**:
- Auth forms (label associations, error announcements)
- Active workout (keyboard shortcuts, focus management)
- Admin forms (complex interactions)

---

## 12. Deployment i środowiska

### 12.1. Environments

1. **Development** (local):
   - Local Supabase instance
   - Hot reload (Astro dev server)
   - Debug tools enabled

2. **Staging**:
   - Separate Supabase project
   - GitHub Actions deploy on `develop` branch
   - QA testing environment

3. **Production**:
   - Production Supabase project
   - GitHub Actions deploy on `master` branch
   - Monitoring enabled (error tracking)

### 12.2. CI/CD Pipeline

**GitHub Actions**:
1. **Lint**: ESLint + Prettier check
2. **Test**: Run unit + integration tests
3. **Build**: Astro build (SSR)
4. **Deploy**: Docker container na DigitalOcean
5. **E2E**: Run Cypress tests post-deploy (staging only)

---

## 13. Monitoring i Analytics (Future)

### 13.1. Error Tracking

**Tool**: Sentry (recommended)

**Capture**:
- JavaScript errors
- API failures (500, 503)
- Performance issues (slow queries)

### 13.2. User Analytics

**Tool**: Plausible / Google Analytics (privacy-friendly)

**Metrics**:
- User registration rate
- Workout completion rate
- Average session duration
- Feature usage (most used exercises, popular plans)

---

## 14. Podsumowanie priorytetów MVP

### 14.1. Must-Have (MVP Core)

✅ **Auth flows**: Login, Register, Reset Password
✅ **Dashboard**: Stats + Recent workouts + Charts
✅ **Plan creation**: 3-step wizard z draft recovery
✅ **Exercise catalog**: Search + filters + pagination
✅ **Active workout**: Full-screen focus mode z timer
✅ **Workout summary**: Post-workout stats
✅ **Profile**: Basic info edit
✅ **Admin**: Categories + Exercises CRUD

### 14.2. Nice-to-Have (Post-MVP)

🔲 Favorites exercises
🔲 Plan duplication
🔲 Share workout summary (social)
🔲 Advanced analytics (PR tracking, muscle group distribution)
🔲 Workout templates (pre-made plans)
🔲 Achievements/badges
🔲 Email notifications

### 14.3. Future Enhancements

🔲 PWA (offline mode, push notifications)
🔲 AI-powered plan recommendations
🔲 Integration z wearables (Fitbit, Apple Watch)
🔲 Social features (friends, leaderboards)
🔲 Video tutorials dla exercises
🔲 Nutrition tracking integration

---

**Wersja dokumentu**: 1.0
**Data utworzenia**: 2025-10-14
**Ostatnia aktualizacja**: 2025-10-14
**Status**: Ready for Implementation
