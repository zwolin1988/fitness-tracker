# Plan implementacji widoku tworzenia/edycji planu treningowego

## 1. Przegląd

Widok tworzenia/edycji planu treningowego to wieloetapowy wizard, który umożliwia użytkownikom tworzenie spersonalizowanych planów treningowych. Proces składa się z trzech kroków:
1. Podanie podstawowych informacji o planie (nazwa, opis, cel)
2. Wybór ćwiczeń z katalogu
3. Konfiguracja serii dla wybranych ćwiczeń (powtórzenia, ciężar)

Widok wspiera zarówno tworzenie nowych planów, jak i edycję istniejących. Implementacja zapewnia draft recovery (zapisywanie do localStorage), walidację na poziomie formularzy, oraz bulk creation - możliwość jednorazowego zapisania całego planu z ćwiczeniami i seriami.

## 2. Routing widoku

**Ścieżki:**
- `/plans/create?step=1` (domyślnie) - tworzenie nowego planu, krok 1
- `/plans/create?step=2` - tworzenie nowego planu, krok 2
- `/plans/create?step=3` - tworzenie nowego planu, krok 3
- `/plans/[id]/edit?step=1` - edycja istniejącego planu, krok 1
- `/plans/[id]/edit?step=2` - edycja istniejącego planu, krok 2
- `/plans/[id]/edit?step=3` - edycja istniejącego planu, krok 3

**Dostęp:** Zalogowani użytkownicy
**Layout:** `<MainLayout>` lub `<WizardLayout>` (fullscreen na mobile)

## 3. Struktura komponentów

```
src/pages/
├── plans/
│   ├── create.astro                    # Główna strona tworzenia planu (wizard)
│   └── [id]/
│       └── edit.astro                  # Główna strona edycji planu (wizard)

src/components/
├── training-plan/
│   ├── PlanWizard.tsx                  # Główny komponent wizard (client:load)
│   ├── StepIndicator.tsx               # Wskaźnik postępu kroków
│   ├── PlanBasicsForm.tsx              # Formularz podstawowych informacji (krok 1)
│   ├── ExerciseSelector.tsx            # Selektor ćwiczeń z katalogiem (krok 2)
│   ├── ExerciseSetConfigurator.tsx     # Konfigurator serii (krok 3)
│   ├── ExerciseSetConfigAccordion.tsx  # Accordion dla pojedynczego ćwiczenia
│   ├── SetFormList.tsx                 # Lista formularzy serii dla ćwiczenia
│   ├── BulkAddSetModal.tsx             # Modal do bulk add serii
│   └── DraftRecoveryBanner.tsx         # Banner odzyskiwania draftu
└── exercise/
    └── ExerciseCatalog.tsx             # Katalog ćwiczeń z filtrowaniem (reused)

src/hooks/
├── usePlanWizard.ts                    # Hook zarządzający stanem wizarda
├── useDraftRecovery.ts                 # Hook do localStorage draft recovery
└── usePlanSubmit.ts                    # Hook do wysyłania planu na API
```

## 4. Szczegóły komponentów

### 4.1. `PlanWizard.tsx`

**Opis:** Główny komponent orchestrujący cały proces tworzenia/edycji planu. Zarządza stanem wizarda, nawigacją między krokami, oraz komunikacją z API.

**Główne elementy:**
- `<StepIndicator>` - wskaźnik postępu
- Warunkowe renderowanie kroków na podstawie `currentStep`:
  - Krok 1: `<PlanBasicsForm>`
  - Krok 2: `<ExerciseSelector>`
  - Krok 3: `<ExerciseSetConfigurator>`
- `<DraftRecoveryBanner>` - jeśli wykryto draft w localStorage
- Footer z przyciskami nawigacji ("Wstecz", "Dalej", "Zapisz plan")

**Obsługiwane interakcje:**
- `onStepChange(step: number)` - zmiana kroku w wizardzie
- `onBasicsSubmit(data: PlanBasicsFormData)` - zapisanie danych z kroku 1
- `onExercisesSelect(exerciseIds: string[])` - zapisanie wybranych ćwiczeń
- `onSetsConfigured(sets: ExerciseSetConfig[])` - zapisanie konfiguracji serii
- `onSavePlan()` - finalne zapisanie całego planu poprzez POST `/api/plans`
- `onCancel()` - anulowanie i powrót do `/plans`

**Obsługiwana walidacja:**
- Krok 1: nazwa wymagana (min 3 znaki, max 100), opis opcjonalny (max 500 znaków)
- Krok 2: minimum 1 ćwiczenie musi być wybrane
- Krok 3: każde ćwiczenie musi mieć co najmniej 1 set z poprawnymi wartościami (repetitions > 0, weight >= 0)
- Business logic: sprawdzenie limitu 7 planów przed zapisem (wywołanie GET `/api/plans` i liczenie aktywnych)

**Typy:**
- `WizardStep` (1 | 2 | 3)
- `PlanBasicsFormData` (z kroku 1)
- `ExerciseSetConfig` (z kroku 3)
- `CreateTrainingPlanCommand` (request body dla POST)
- `TrainingPlanDTO` (response z API)

**Propsy:**
```typescript
interface PlanWizardProps {
  mode: 'create' | 'edit';
  planId?: string; // wymagane dla mode='edit'
  initialData?: TrainingPlanDetailResponse; // dla edycji
}
```

### 4.2. `StepIndicator.tsx`

**Opis:** Komponent wyświetlający wskaźnik postępu wizarda z trzema krokami. Sticky top position.

**Główne elementy:**
- Div container z Flexbox układem
- Każdy krok:
  - Numer kroku w kółku
  - Nazwa kroku ("Podstawy", "Ćwiczenia", "Serie")
  - Ikona stanu: check (✓) jeśli ukończony, highlight jeśli aktywny
- Linia łącząca kroki

**Obsługiwane interakcje:**
- Brak interakcji (wyłącznie wyświetlanie)

**Obsługiwana walidacja:**
- Brak walidacji

**Typy:**
- `StepIndicatorStep` - interfejs dla pojedynczego kroku

**Propsy:**
```typescript
interface StepIndicatorProps {
  steps: number; // zawsze 3
  currentStep: number; // 1, 2, lub 3
  completedSteps: number[]; // np. [1] jeśli krok 1 ukończony
}
```

### 4.3. `PlanBasicsForm.tsx`

**Opis:** Formularz podstawowych informacji o planie (krok 1). Zawiera pola: nazwa, opis, cel treningu.

**Główne elementy:**
- `<Input>` dla nazwy planu (required)
  - Label: "Nazwa planu"
  - Placeholder: "np. FBW A - Full Body Workout"
  - Error message pod polem w przypadku błędu walidacji
- `<Textarea>` dla opisu (optional)
  - Label: "Opis"
  - Placeholder: "Opisz cel i częstotliwość treningu"
  - Counter: X/500 znaków
- `<Select>` dla celu treningu (optional)
  - Label: "Cel treningu"
  - Opcje: "Siła" | "Masa mięśniowa" | "Wytrzymałość" | "Ogólny fitness"

**Obsługiwane interakcje:**
- `onChange` dla każdego pola - aktualizacja stanu formularza
- `onSubmit` - walidacja i przekazanie danych do parent (`onBasicsSubmit`)

**Obsługiwana walidacja:**
- Nazwa: required, min 3 znaki, max 100 znaków
- Opis: max 500 znaków
- Cel treningu: brak walidacji (opcjonalne)
- Inline error messages wyświetlane pod polami po próbie submit

**Typy:**
- `PlanBasicsFormData` - stan formularza
- `PlanBasicsFormErrors` - błędy walidacji

**Propsy:**
```typescript
interface PlanBasicsFormProps {
  initialData?: PlanBasicsFormData;
  onSubmit: (data: PlanBasicsFormData) => void;
}

interface PlanBasicsFormData {
  name: string;
  description?: string;
  goal?: 'strength' | 'muscle_mass' | 'endurance' | 'general_fitness';
}

interface PlanBasicsFormErrors {
  name?: string;
  description?: string;
}
```

### 4.4. `ExerciseSelector.tsx`

**Opis:** Komponent wyboru ćwiczeń z katalogu (krok 2). Reużywa `<ExerciseCatalog>` w trybie multi-select z checkboxami.

**Główne elementy:**
- `<ExerciseCatalog multiSelect={true}>` - katalog ćwiczeń
  - Search bar
  - Filtry (kategoria, trudność)
  - Grid/lista kart ćwiczeń z checkboxami (top-left corner)
- Selected Count Banner (sticky pod StepIndicator):
  - Tekst: "Wybrano X ćwiczeń"
  - `<Badge>` z liczbą wybranych
  - `<Button variant="ghost">` "Wyczyść wszystko" (widoczny jeśli count > 0)

**Obsługiwane interakcje:**
- `onExerciseToggle(exerciseId: string)` - zaznaczenie/odznaczenie ćwiczenia
- `onClearAll()` - wyczyszczenie wszystkich wybranych ćwiczeń
- `onNext()` - przejście do kroku 3 (jeśli selected.length > 0)

**Obsługiwana walidacja:**
- Minimum 1 ćwiczenie musi być wybrane przed przejściem do kroku 3
- Przycisk "Dalej" disabled jeśli selected.length === 0

**Typy:**
- `ExerciseDTO[]` - lista dostępnych ćwiczeń
- `string[]` - tablica ID wybranych ćwiczeń

**Propsy:**
```typescript
interface ExerciseSelectorProps {
  availableExercises: ExerciseDTO[];
  selectedExerciseIds: string[];
  onSelectionChange: (exerciseIds: string[]) => void;
}
```

### 4.5. `ExerciseSetConfigurator.tsx`

**Opis:** Główny komponent konfiguracji serii dla wybranych ćwiczeń (krok 3). Zawiera listę ćwiczeń z możliwością drag & drop oraz accordiony do konfiguracji serii.

**Główne elementy:**
- Sortable lista ćwiczeń (drag & drop, touch-friendly, keyboard accessible)
- Dla każdego ćwiczenia: `<ExerciseSetConfigAccordion>` (collapsible)
- Footer z podsumowaniem (np. "Łącznie X ćwiczeń, Y serii")

**Obsługiwane interakcje:**
- `onReorder(reorderedExercises: ExerciseWithSets[])` - zmiana kolejności ćwiczeń
- `onSetsChange(exerciseId: string, sets: SetFormData[])` - zmiana serii dla ćwiczenia
- `onSavePlan()` - finalne zapisanie planu

**Obsługiwana walidacja:**
- Każde ćwiczenie musi mieć co najmniej 1 set
- Każdy set: repetitions > 0, weight >= 0
- Przycisk "Zapisz plan" disabled jeśli jakakolwiek seria jest niepełna/niepoprawna

**Typy:**
- `ExerciseWithSets` - ćwiczenie z przypisanymi seriami
- `SetFormData` - dane pojedynczej serii

**Propsy:**
```typescript
interface ExerciseSetConfiguratorProps {
  exercises: ExerciseDTO[];
  initialSets?: Map<string, SetFormData[]>; // dla edycji
  onSetsConfigured: (config: ExerciseSetConfig[]) => void;
}

interface ExerciseWithSets {
  exercise: ExerciseDTO;
  sets: SetFormData[];
}

interface SetFormData {
  repetitions: number;
  weight: number;
  set_order: number;
}

interface ExerciseSetConfig {
  exerciseId: string;
  sets: SetFormData[];
}
```

### 4.6. `ExerciseSetConfigAccordion.tsx`

**Opis:** Collapsible accordion dla pojedynczego ćwiczenia w kroku 3. Header zawiera podstawowe info, body zawiera `<SetFormList>`.

**Główne elementy:**
- Header (zawsze widoczny, clickable):
  - Drag handle (⋮⋮) - ikona do drag & drop
  - Ikona ćwiczenia + nazwa
  - Badge: "X setów" (liczba dodanych serii)
  - Expand/Collapse chevron
- Body (collapsible):
  - `<SetFormList exerciseId={...} sets={...} onSetsChange={...}>`

**Obsługiwane interakcje:**
- `onToggle()` - expand/collapse accordion
- `onDragStart()`, `onDragEnd()` - drag & drop (propagowane do parenta)

**Obsługiwana walidacja:**
- Brak walidacji na poziomie komponentu (delegowane do `<SetFormList>`)

**Typy:**
- `ExerciseDTO` - dane ćwiczenia
- `SetFormData[]` - lista serii

**Propsy:**
```typescript
interface ExerciseSetConfigAccordionProps {
  exercise: ExerciseDTO;
  sets: SetFormData[];
  isExpanded: boolean;
  onToggle: () => void;
  onSetsChange: (sets: SetFormData[]) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}
```

### 4.7. `SetFormList.tsx`

**Opis:** Lista formularzy serii dla pojedynczego ćwiczenia. Każda seria to row z polami: powtórzenia, ciężar, przycisk usuń. Dodatkowo przyciski "Dodaj set" i "Bulk add".

**Główne elementy:**
- Lista rowów, każdy row:
  - `<Input type="number">` "Powtórzenia" (min 1, default 10)
  - `<Input type="number">` "Ciężar (kg)" (min 0, default 0, step 2.5)
  - `<Button variant="ghost" size="icon">` Usuń set (trash icon)
  - Inline error messages pod polami
- `<Button variant="outline">` "Dodaj set" - dodaje nowy pusty set
- `<Button variant="secondary">` "Bulk add" - otwiera modal `<BulkAddSetModal>`

**Obsługiwane interakcje:**
- `onSetChange(index: number, field: 'repetitions' | 'weight', value: number)` - zmiana wartości w secie
- `onAddSet()` - dodanie nowego pustego seta
- `onRemoveSet(index: number)` - usunięcie seta
- `onBulkAdd(sets: SetFormData[])` - dodanie wielu setów z modalu

**Obsługiwana walidacja:**
- Powtórzenia: min 1, max 999, integer
- Ciężar: min 0, max 999.99, step 2.5
- Inline error messages przy niepoprawnych wartościach

**Typy:**
- `SetFormData[]` - lista serii

**Propsy:**
```typescript
interface SetFormListProps {
  exerciseId: string;
  sets: SetFormData[];
  onSetsChange: (sets: SetFormData[]) => void;
}
```

### 4.8. `BulkAddSetModal.tsx`

**Opis:** Modal do bulk add serii. Pozwala na jednoczesne dodanie X setów z tymi samymi parametrami (powtórzenia, ciężar).

**Główne elementy:**
- Dialog/Modal overlay
- Content:
  - `<Input type="number">` "Liczba setów" (min 1, max 10)
  - `<Input type="number">` "Powtórzenia" (min 1)
  - `<Input type="number">` "Ciężar (kg)" (min 0, step 2.5)
  - Preview text: "Zostanie dodanych X setów: X×Y po Z kg"
- Footer:
  - `<Button variant="ghost">` "Anuluj" - zamyka modal
  - `<Button>` "Dodaj" - dodaje sety i zamyka modal

**Obsługiwane interakcje:**
- `onConfirm(count: number, repetitions: number, weight: number)` - dodanie setów
- `onCancel()` - zamknięcie modalu bez dodawania
- ESC key - zamknięcie modalu
- Focus trap wewnątrz modalu

**Obsługiwana walidacja:**
- Liczba setów: min 1, max 10, integer
- Powtórzenia: min 1, integer
- Ciężar: min 0, max 999.99

**Typy:**
- `BulkAddSetFormData` - stan formularza w modalu

**Propsy:**
```typescript
interface BulkAddSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sets: SetFormData[]) => void;
}

interface BulkAddSetFormData {
  count: number;
  repetitions: number;
  weight: number;
}
```

### 4.9. `DraftRecoveryBanner.tsx`

**Opis:** Banner wyświetlany na początku wizarda, jeśli wykryto niezakończony draft w localStorage.

**Główne elementy:**
- Alert/Banner komponent
- Tekst: "Znaleziono niezakończony plan. Przywrócić?"
- Przyciski:
  - `<Button variant="secondary">` "Przywróć" - ładuje draft
  - `<Button variant="ghost">` "Odrzuć" - usuwa draft z localStorage

**Obsługiwane interakcje:**
- `onRestore()` - przywrócenie draftu i załadowanie danych do wizarda
- `onDiscard()` - usunięcie draftu z localStorage i ukrycie banneru

**Obsługiwana walidacja:**
- Brak walidacji

**Typy:**
- `PlanDraft` - struktura draftu w localStorage

**Propsy:**
```typescript
interface DraftRecoveryBannerProps {
  draft: PlanDraft;
  onRestore: (draft: PlanDraft) => void;
  onDiscard: () => void;
}

interface PlanDraft {
  step: number;
  basics?: PlanBasicsFormData;
  selectedExerciseIds?: string[];
  setsConfig?: Map<string, SetFormData[]>;
  timestamp: number;
}
```

### 4.10. `ExerciseCatalog.tsx` (reused)

**Opis:** Komponent katalogu ćwiczeń, który już istnieje w aplikacji. W tym widoku używany w trybie multi-select z checkboxami.

**Główne elementy:**
- Search bar
- Filtry: kategoria, trudność
- Grid/lista kart ćwiczeń
- W trybie multi-select: checkbox overlay na kartach (top-left)

**Obsługiwane interakcje:**
- `onSearch(query: string)` - filtrowanie po nazwie
- `onFilterChange(filters: ExerciseFilters)` - filtrowanie po kategorii/trudności
- `onExerciseSelect(exerciseId: string)` - zaznaczenie ćwiczenia (w trybie multi-select)

**Obsługiwana walidacja:**
- Brak walidacji (tylko filtrowanie)

**Typy:**
- `ExerciseDTO[]` - lista ćwiczeń
- `ExerciseFilters` - filtry

**Propsy:**
```typescript
interface ExerciseCatalogProps {
  exercises: ExerciseDTO[];
  multiSelect?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (exerciseIds: string[]) => void;
  onExerciseClick?: (exercise: ExerciseDTO) => void;
}

interface ExerciseFilters {
  categoryId?: string;
  difficulty?: string;
  searchQuery?: string;
}
```

## 5. Typy

### 5.1. Typy domenowe (już istniejące w `src/types.ts`)

```typescript
// DTO z API
export interface TrainingPlanDTO {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExerciseDTO {
  id: string;
  name: string;
  description?: string | null;
  icon_svg?: string | null;
  difficulty: string;
  category_id: string;
  created_at: string;
}

export interface PlanExerciseSetDTO {
  id: string;
  training_plan_id: string;
  exercise_id: string;
  set_order: number;
  repetitions: number;
  weight: number;
  created_at: string;
}

// Command models
export interface CreateTrainingPlanCommand {
  name: string;
  description?: string;
  exercises: PlanExerciseInput[];
}

export interface PlanExerciseInput {
  exerciseId: string;
  sets?: PlanExerciseSetInput[];
}

export interface PlanExerciseSetInput {
  repetitions: number;
  weight: number;
  set_order?: number;
}

export interface UpdateTrainingPlanCommand {
  name?: string;
  description?: string;
  exerciseIds?: string[];
}
```

### 5.2. Nowe typy ViewModel (do utworzenia w `src/components/training-plan/types.ts`)

```typescript
/**
 * Typ kroku w wizardzie
 */
export type WizardStep = 1 | 2 | 3;

/**
 * Tryb działania wizarda
 */
export type WizardMode = 'create' | 'edit';

/**
 * Stan wizarda
 */
export interface WizardState {
  mode: WizardMode;
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  basics: PlanBasicsFormData | null;
  selectedExerciseIds: string[];
  setsConfig: Map<string, SetFormData[]>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Dane formularza podstawowych informacji (krok 1)
 */
export interface PlanBasicsFormData {
  name: string;
  description?: string;
  goal?: PlanGoal;
}

/**
 * Cele treningu (opcjonalne)
 */
export type PlanGoal = 'strength' | 'muscle_mass' | 'endurance' | 'general_fitness';

/**
 * Błędy walidacji formularza podstaw
 */
export interface PlanBasicsFormErrors {
  name?: string;
  description?: string;
}

/**
 * Dane pojedynczej serii w formularzu
 */
export interface SetFormData {
  repetitions: number;
  weight: number;
  set_order: number;
}

/**
 * Konfiguracja serii dla ćwiczenia
 */
export interface ExerciseSetConfig {
  exerciseId: string;
  sets: SetFormData[];
}

/**
 * Ćwiczenie z przypisanymi seriami (widok dla kroku 3)
 */
export interface ExerciseWithSets {
  exercise: ExerciseDTO;
  sets: SetFormData[];
  order: number; // kolejność w planie
}

/**
 * Draft zapisany w localStorage
 */
export interface PlanDraft {
  step: WizardStep;
  basics?: PlanBasicsFormData;
  selectedExerciseIds?: string[];
  setsConfig?: Record<string, SetFormData[]>; // Map nie jest serializowalne
  timestamp: number;
}

/**
 * Dane formularza bulk add
 */
export interface BulkAddSetFormData {
  count: number;
  repetitions: number;
  weight: number;
}

/**
 * Błędy walidacji setu
 */
export interface SetFormErrors {
  repetitions?: string;
  weight?: string;
}

/**
 * Response z API dla szczegółów planu (GET /api/plans/{id})
 */
export interface TrainingPlanDetailResponse extends TrainingPlanDTO {
  exercises: ExerciseDTO[];
  sets: PlanExerciseSetDTO[];
}

/**
 * Filtrowanie ćwiczeń w katalogu
 */
export interface ExerciseFilters {
  categoryId?: string;
  difficulty?: string;
  searchQuery?: string;
}
```

## 6. Zarządzanie stanem

Stan wizarda zarządzany jest przez custom hook `usePlanWizard`, który:
- Przechowuje cały stan wizarda (aktualny krok, dane z formularzy, wybrane ćwiczenia, konfiguracja serii)
- Obsługuje nawigację między krokami z walidacją
- Integruje się z localStorage (auto-save draft co 30s, draft recovery)
- Komunikuje się z API (POST `/api/plans`, GET `/api/plans/{id}` dla edycji)

### 6.1. Hook `usePlanWizard`

```typescript
/**
 * Główny hook zarządzający stanem wizarda tworzenia/edycji planu
 */
export function usePlanWizard(mode: WizardMode, planId?: string) {
  const [state, setState] = useState<WizardState>({
    mode,
    currentStep: 1,
    completedSteps: [],
    basics: null,
    selectedExerciseIds: [],
    setsConfig: new Map(),
    isLoading: false,
    error: null,
  });

  // Funkcje nawigacji
  const goToStep = (step: WizardStep) => { /* ... */ };
  const nextStep = () => { /* walidacja + goToStep */ };
  const prevStep = () => { /* goToStep(currentStep - 1) */ };

  // Funkcje zapisu danych
  const saveBasics = (data: PlanBasicsFormData) => { /* ... */ };
  const saveExercises = (exerciseIds: string[]) => { /* ... */ };
  const saveSetsConfig = (config: ExerciseSetConfig[]) => { /* ... */ };

  // Finalne zapisanie planu
  const submitPlan = async () => {
    // Walidacja biznesowa (limit 7 planów)
    // Przygotowanie CreateTrainingPlanCommand
    // POST /api/plans
    // Success: toast + redirect /plans
    // Error: toast + możliwość retry
  };

  return {
    state,
    goToStep,
    nextStep,
    prevStep,
    saveBasics,
    saveExercises,
    saveSetsConfig,
    submitPlan,
  };
}
```

### 6.2. Hook `useDraftRecovery`

```typescript
/**
 * Hook do zapisywania i przywracania draftu z localStorage
 */
export function useDraftRecovery(wizardState: WizardState) {
  const DRAFT_KEY = 'training-plan-draft';
  const AUTO_SAVE_INTERVAL = 30000; // 30s

  // Auto-save do localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft(wizardState);
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [wizardState]);

  // Odczytanie draftu przy mount
  const loadDraft = (): PlanDraft | null => {
    // Odczyt z localStorage
    // Deserializacja
    return draft;
  };

  // Zapisanie draftu
  const saveDraft = (state: WizardState) => {
    const draft: PlanDraft = {
      step: state.currentStep,
      basics: state.basics || undefined,
      selectedExerciseIds: state.selectedExerciseIds,
      setsConfig: Object.fromEntries(state.setsConfig), // Map -> Object
      timestamp: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  };

  // Usunięcie draftu
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
  };

  return { loadDraft, saveDraft, clearDraft };
}
```

### 6.3. Hook `usePlanSubmit`

```typescript
/**
 * Hook do wysyłania planu na API
 */
export function usePlanSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitPlan = async (command: CreateTrainingPlanCommand): Promise<TrainingPlanDTO | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Sprawdzenie limitu 7 planów (GET /api/plans + liczenie)
      const plansResponse = await fetch('/api/plans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const plans = await plansResponse.json();

      if (plans.items.length >= 7) {
        throw new Error('Osiągnięto limit 7 aktywnych planów treningowych');
      }

      // 2. POST /api/plans z całym planem (bulk create)
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        // Obsługa błędów (400, 422, 500)
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nie udało się zapisać planu');
      }

      const plan = await response.json();
      return plan;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitPlan, isSubmitting, error };
}
```

## 7. Integracja API

### 7.1. Tworzenie nowego planu (bulk create)

**Endpoint:** `POST /api/plans`

**Request body:**
```typescript
{
  name: string;
  description?: string;
  exercises: Array<{
    exerciseId: string;
    sets?: Array<{
      repetitions: number;
      weight: number;
      set_order?: number;
    }>;
  }>;
}
```

**Request type:** `CreateTrainingPlanCommand` (z `src/types.ts`)

**Response (201):**
```typescript
{
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}
```

**Response type:** `TrainingPlanDTO`

**Walidacja API (Zod schema):**
- `name`: min 1 znak, max 100 znaków
- `description`: max 1000 znaków (opcjonalne)
- `exercises`: min 1, max 50 elementów
- `exercises[].exerciseId`: UUID
- `exercises[].sets`: max 50 setów na ćwiczenie
- `exercises[].sets[].repetitions`: integer, > 0, max 999
- `exercises[].sets[].weight`: number, >= 0, max 999.99
- `exercises[].sets[].set_order`: integer, >= 0 (opcjonalne)

**Business logic:**
- Sprawdzenie limitu 7 aktywnych planów na użytkownika (403 jeśli przekroczony)
- Walidacja istnienia wszystkich exerciseId (404 jeśli nie istnieją)

**Error responses:**
- `400 Bad Request` - niepoprawne dane wejściowe
- `403 Forbidden` - limit 7 planów przekroczony (`MAX_PLANS_EXCEEDED`)
- `404 Not Found` - jedno lub więcej ćwiczeń nie istnieje (`EXERCISE_NOT_FOUND`)
- `422 Unprocessable Entity` - błędy walidacji Zod
- `500 Internal Server Error` - błąd serwera

### 7.2. Pobieranie szczegółów planu do edycji

**Endpoint:** `GET /api/plans/{id}`

**Response (200):**
```typescript
{
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  exercises: ExerciseDTO[];
  sets: PlanExerciseSetDTO[];
}
```

**Response type:** `TrainingPlanDetailResponse` (z `src/lib/services/training-plan.ts`)

**Error responses:**
- `401 Unauthorized` - brak/niepoprawny token
- `403 Forbidden` - plan nie należy do użytkownika
- `404 Not Found` - plan nie istnieje

### 7.3. Aktualizacja planu (edycja)

**Endpoint:** `PUT /api/plans/{id}`

**Request body:**
```typescript
{
  name?: string;
  description?: string;
  exerciseIds?: string[];
}
```

**Request type:** `UpdateTrainingPlanCommand`

**Uwaga:** W trybie edycji, aktualizacja serii odbywa się poprzez osobne endpointy (`POST/PUT/DELETE /api/plans/{planId}/sets/...`), więc formularz w kroku 3 musi obsługiwać różnicowanie (dodane/zmienione/usunięte sety).

**Response (200):** `TrainingPlanDTO`

**Error responses:** jak w POST

### 7.4. Pobieranie listy ćwiczeń

**Endpoint:** `GET /api/exercises?category={categoryId}&difficulty={difficulty}`

**Response (200):**
```typescript
{
  items: ExerciseDTO[];
  total: number;
}
```

Endpoint ten jest wywoływany przez `<ExerciseCatalog>` w kroku 2.

### 7.5. Sprawdzenie limitu planów

Przed wysłaniem POST `/api/plans`, frontend wywołuje GET `/api/plans` i sprawdza `items.length`. Jeśli `>= 7`, wyświetla komunikat błędu bez wysyłania POST.

## 8. Interakcje użytkownika

### 8.1. Rozpoczęcie tworzenia planu

**Ścieżka:** Użytkownik klika "Stwórz nowy plan" na stronie `/plans`

**Flow:**
1. Przekierowanie do `/plans/create?step=1`
2. Sprawdzenie localStorage - jeśli istnieje draft, wyświetlenie `<DraftRecoveryBanner>`
3. Jeśli użytkownik kliknie "Przywróć", załadowanie danych draftu do stanu wizarda
4. Jeśli użytkownik kliknie "Odrzuć", usunięcie draftu i wyświetlenie pustego formularza

### 8.2. Krok 1: Wypełnienie podstawowych informacji

**Interakcje:**
1. Użytkownik wypełnia pole "Nazwa planu" (required)
2. Opcjonalnie wypełnia pole "Opis" (max 500 znaków, live counter)
3. Opcjonalnie wybiera "Cel treningu" z selecta
4. Kliknięcie "Anuluj" → przekierowanie do `/plans` (z potwierdzeniem jeśli są niezapisane dane)
5. Kliknięcie "Dalej" → walidacja formularza:
   - Jeśli błędy: wyświetlenie inline error messages
   - Jeśli OK: zapisanie danych do stanu + localStorage, zmiana URL na `?step=2`

### 8.3. Krok 2: Wybór ćwiczeń

**Interakcje:**
1. Użytkownik przegląda katalog ćwiczeń (`<ExerciseCatalog>`)
2. Opcjonalnie filtruje po kategorii lub trudności
3. Opcjonalnie wyszukuje po nazwie
4. Zaznacza ćwiczenia poprzez kliknięcie na kartę (checkbox w lewym górnym rogu)
5. W sticky banner widzi licznik "Wybrano X ćwiczeń"
6. Może kliknąć "Wyczyść wszystko" aby odznaczyć wszystkie
7. Kliknięcie "Wstecz" → powrót do `?step=1` (zachowanie zaznaczonych ćwiczeń)
8. Kliknięcie "Dalej" (disabled jeśli selected.length === 0):
   - Zapisanie wybranych ID do stanu + localStorage
   - Zmiana URL na `?step=3`

### 8.4. Krok 3: Konfiguracja serii

**Interakcje:**
1. Użytkownik widzi listę wybranych ćwiczeń jako accordiony
2. Może zmienić kolejność ćwiczeń poprzez drag & drop (⋮⋮ handle) lub Alt+↑/↓ (keyboard)
3. Dla każdego ćwiczenia:
   - Klika na header aby expand/collapse accordion
   - W body widzi `<SetFormList>` z możliwością:
     - Dodania pojedynczego seta ("Dodaj set")
     - Bulk add ("Bulk add") → otwiera modal:
       - Wypełnia pola: liczba setów, powtórzenia, ciężar
       - Widzi preview: "Zostanie dodanych X setów: X×Y po Z kg"
       - Kliknięcie "Dodaj" → dodanie setów do listy + zamknięcie modalu
       - Kliknięcie "Anuluj" lub ESC → zamknięcie modalu bez zmian
     - Modyfikacji parametrów setu (repetitions, weight)
     - Usunięcia setu (trash icon)
4. Inline walidacja przy każdej zmianie (repetitions > 0, weight >= 0)
5. Kliknięcie "Wstecz" → powrót do `?step=2` (zachowanie konfiguracji serii)
6. Kliknięcie "Zapisz plan" (disabled jeśli którykolwiek set jest niepoprawny):
   - Wywołanie `submitPlan()` z hooka `usePlanSubmit`
   - Loading state (spinner w button)
   - Success:
     - Toast: "Plan „{planName}" został utworzony"
     - Usunięcie draftu z localStorage
     - Przekierowanie do `/plans`
   - Error:
     - Toast z komunikatem błędu
     - Możliwość retry (ponowne kliknięcie "Zapisz plan")

### 8.5. Edycja istniejącego planu

**Ścieżka:** Użytkownik klika "Edytuj" na karcie planu w `/plans`

**Flow:**
1. Przekierowanie do `/plans/{id}/edit?step=1`
2. Wywołanie GET `/api/plans/{id}` aby pobrać dane planu
3. Załadowanie danych do stanu wizarda:
   - Krok 1: `basics` = { name, description }
   - Krok 2: `selectedExerciseIds` = exercises.map(e => e.id)
   - Krok 3: `setsConfig` = mapowanie sets do struktury Map<exerciseId, SetFormData[]>
4. Użytkownik może edytować każdy krok analogicznie jak przy tworzeniu
5. Kliknięcie "Zapisz plan" → PUT `/api/plans/{id}` + osobne POST/PUT/DELETE dla zmienionych setów

**Różnice w edycji:**
- Tytuł wizarda: "Edytuj plan" zamiast "Nowy plan"
- W kroku 3, dla każdego seta który istnieje w bazie, przechowywane jest `id` aby móc wysłać PUT/DELETE
- Nowe sety nie mają `id`, więc wysyłane są jako POST
- Usunięte sety zapisywane w osobnej liście, wysyłane jako DELETE

## 9. Warunki i walidacja

### 9.1. Walidacja formularza podstaw (krok 1)

**Pole "Nazwa planu":**
- **Warunek:** required, min 3 znaki, max 100 znaków
- **Komponent:** `<PlanBasicsForm>`
- **Komunikat błędu:**
  - Puste: "Nazwa planu jest wymagana"
  - Za krótka: "Nazwa musi mieć co najmniej 3 znaki"
  - Za długa: "Nazwa nie może przekraczać 100 znaków"
- **Stan UI:** Czerwona ramka input, komunikat pod polem

**Pole "Opis":**
- **Warunek:** max 500 znaków
- **Komponent:** `<PlanBasicsForm>`
- **Komunikat błędu:** "Opis nie może przekraczać 500 znaków"
- **Stan UI:** Counter "X/500", czerwona ramka jeśli > 500

**Przycisk "Dalej":**
- **Warunek:** nazwa poprawna
- **Stan UI:** disabled jeśli walidacja nie przechodzi

### 9.2. Walidacja wyboru ćwiczeń (krok 2)

**Minimum ćwiczeń:**
- **Warunek:** co najmniej 1 ćwiczenie musi być wybrane
- **Komponent:** `<ExerciseSelector>`
- **Stan UI:** Przycisk "Dalej" disabled jeśli selected.length === 0
- **Komunikat:** Tooltip na disabled button: "Wybierz co najmniej 1 ćwiczenie"

### 9.3. Walidacja serii (krok 3)

**Minimum setów na ćwiczenie:**
- **Warunek:** każde ćwiczenie musi mieć co najmniej 1 set
- **Komponent:** `<ExerciseSetConfigurator>`
- **Stan UI:** Badge "0 setów" w czerwonym kolorze, przycisk "Zapisz plan" disabled

**Pole "Powtórzenia":**
- **Warunek:** integer, min 1, max 999
- **Komponent:** `<SetFormList>`
- **Komunikaty błędu:**
  - Puste lub 0: "Powtórzenia muszą być większe niż 0"
  - Niepoprawny format: "Wartość musi być liczbą całkowitą"
  - > 999: "Maksymalna wartość to 999"
- **Stan UI:** Czerwona ramka input, komunikat pod polem, przycisk "Zapisz plan" disabled

**Pole "Ciężar":**
- **Warunek:** number, min 0, max 999.99
- **Komponent:** `<SetFormList>`
- **Komunikaty błędu:**
  - < 0: "Ciężar nie może być ujemny"
  - > 999.99: "Maksymalna wartość to 999.99"
  - Niepoprawny format: "Wartość musi być liczbą"
- **Stan UI:** Czerwona ramka input, komunikat pod polem, przycisk "Zapisz plan" disabled

**Przycisk "Zapisz plan":**
- **Warunek:** wszystkie sety poprawne + limit 7 planów nie przekroczony
- **Stan UI:** disabled jeśli walidacja nie przechodzi lub isSubmitting

### 9.4. Walidacja biznesowa (limit planów)

**Limit 7 aktywnych planów:**
- **Warunek:** użytkownik nie może mieć więcej niż 7 aktywnych planów
- **Weryfikacja:** Przed POST `/api/plans`, frontend wywołuje GET `/api/plans` i sprawdza `items.length`
- **Komponent:** `usePlanSubmit` hook
- **Stan UI:**
  - Jeśli limit przekroczony: Toast error "Osiągnięto limit 7 aktywnych planów treningowych. Usuń nieaktywny plan aby stworzyć nowy."
  - Przycisk "Zapisz plan" nie wysyła requesta
- **Alternatywa:** API zwraca 403 z kodem `MAX_PLANS_EXCEEDED`, frontend wyświetla toast z komunikatem z API

## 10. Obsługa błędów

### 10.1. Błędy walidacji (400, 422)

**Scenariusz:** API zwraca błąd walidacji (np. niepoprawne dane, brakujące pola)

**Obsługa:**
- Jeśli response zawiera `details` (field errors z Zod), mapowanie błędów na konkretne pola w formularzu
- Wyświetlenie inline error messages pod polami
- Toast z ogólnym komunikatem: "Sprawdź poprawność wypełnionych pól"
- Możliwość poprawy i ponownego wysłania

**Przykład response 422:**
```json
{
  "error": "Validation failed",
  "details": {
    "name": ["Training plan name is required"],
    "exercises": ["At least one exercise is required"]
  }
}
```

### 10.2. Błąd limitu planów (403)

**Scenariusz:** Użytkownik próbuje stworzyć 8. plan

**Obsługa:**
- Toast error: "Osiągnięto limit 7 aktywnych planów treningowych. Usuń nieaktywny plan aby stworzyć nowy."
- Przycisk "Zapisz plan" ponownie aktywny (możliwość retry po usunięciu planu)
- Link w toaście do `/plans` aby użytkownik mógł usunąć plan

### 10.3. Błąd ćwiczenia nie istnieje (404)

**Scenariusz:** Użytkownik wybrał ćwiczenie które zostało usunięte w międzyczasie

**Obsługa:**
- Toast error: "Jedno lub więcej wybranych ćwiczeń nie istnieje. Odśwież listę ćwiczeń."
- Automatyczne odświeżenie katalogu ćwiczeń (refetch GET `/api/exercises`)
- Usunięcie nieistniejących exerciseId ze stanu `selectedExerciseIds`
- Powrót do kroku 2 aby użytkownik mógł wybrać ponownie

### 10.4. Błąd serwera (500)

**Scenariusz:** Błąd wewnętrzny serwera, timeout, brak połączenia

**Obsługa:**
- Toast error: "Wystąpił błąd serwera. Spróbuj ponownie."
- Przycisk "Zapisz plan" ponownie aktywny (retry)
- Opcjonalnie: Modal z przyciskiem "Spróbuj ponownie" dla lepszego UX

**Alternatywa (dla lepszego UX):**
- Modal overlay z komunikatem:
  - Tytuł: "Wystąpił błąd"
  - Treść: "Nie udało się zapisać planu. Sprawdź połączenie z internetem i spróbuj ponownie."
  - Przyciski:
    - "Spróbuj ponownie" → ponowne wywołanie `submitPlan()`
    - "Anuluj" → zamknięcie modalu, pozostanie w kroku 3

### 10.5. Utrata połączenia podczas wypełniania

**Scenariusz:** Użytkownik traci połączenie podczas wypełniania wizarda

**Obsługa:**
- Auto-save do localStorage działa niezależnie od połączenia
- Przy próbie zapisu (POST `/api/plans`), catch błędu fetch (network error)
- Toast: "Brak połączenia z internetem. Dane zostały zapisane lokalnie. Spróbuj ponownie gdy połączenie zostanie przywrócone."
- Draft pozostaje w localStorage, użytkownik może wrócić później

### 10.6. Błędy autoryzacji (401)

**Scenariusz:** Token wygasł, użytkownik nie jest zalogowany

**Obsługa:**
- Przekierowanie do `/login` z query param `?redirect=/plans/create`
- Toast: "Sesja wygasła. Zaloguj się ponownie."
- Po ponownym zalogowaniu, jeśli draft istnieje, możliwość przywrócenia

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury katalogów i typów

**Zadania:**
1. Utworzyć katalog `src/components/training-plan/`
2. Utworzyć plik `src/components/training-plan/types.ts` z typami ViewModel (WizardState, PlanBasicsFormData, SetFormData, itp.)
3. Utworzyć katalog `src/hooks/` jeśli nie istnieje
4. Zweryfikować czy typy domenowe (`CreateTrainingPlanCommand`, `TrainingPlanDTO`, itp.) są dostępne w `src/types.ts`

**Rezultat:** Struktura katalogów gotowa, typy zdefiniowane

---

### Krok 2: Implementacja hooka `usePlanWizard`

**Zadania:**
1. Utworzyć plik `src/hooks/usePlanWizard.ts`
2. Zaimplementować stan wizarda (useState z WizardState)
3. Zaimplementować funkcje nawigacji: `goToStep`, `nextStep`, `prevStep`
4. Zaimplementować funkcje zapisu danych: `saveBasics`, `saveExercises`, `saveSetsConfig`
5. Dodać podstawową walidację przy zmianie kroków
6. Dodać obsługę trybu edycji (`mode: 'edit'`, ładowanie danych z API)

**Rezultat:** Hook `usePlanWizard` z pełną logiką zarządzania stanem

---

### Krok 3: Implementacja hooka `useDraftRecovery`

**Zadania:**
1. Utworzyć plik `src/hooks/useDraftRecovery.ts`
2. Zaimplementować funkcje: `saveDraft`, `loadDraft`, `clearDraft`
3. Dodać auto-save z interwałem 30s (useEffect z setInterval)
4. Obsłużyć serializację/deserializację Map do/z localStorage
5. Dodać timestamp do draftu

**Rezultat:** Hook `useDraftRecovery` z auto-save i recovery

---

### Krok 4: Implementacja hooka `usePlanSubmit`

**Zadania:**
1. Utworzyć plik `src/hooks/usePlanSubmit.ts`
2. Zaimplementować funkcję `submitPlan(command: CreateTrainingPlanCommand)`
3. Dodać sprawdzenie limitu 7 planów (GET `/api/plans`)
4. Dodać POST `/api/plans` z obsługą błędów (400, 403, 422, 500)
5. Dodać stan `isSubmitting` i `error`
6. Dodać toast notifications dla success/error

**Rezultat:** Hook `usePlanSubmit` z pełną integracją API

---

### Krok 5: Implementacja komponentu `StepIndicator`

**Zadania:**
1. Utworzyć plik `src/components/training-plan/StepIndicator.tsx`
2. Zaimplementować layout (Flexbox, 3 kroki)
3. Dodać wizualizację stanu kroku (completed ✓, active, pending)
4. Dodać sticky positioning (top)
5. Stylować zgodnie z Tailwind/Shadcn

**Rezultat:** Komponent `StepIndicator` gotowy do użycia

---

### Krok 6: Implementacja komponentu `PlanBasicsForm`

**Zadania:**
1. Utworzyć plik `src/components/training-plan/PlanBasicsForm.tsx`
2. Dodać pola: Input (nazwa), Textarea (opis), Select (cel treningu)
3. Zaimplementować walidację (Zod schema lub inline)
4. Dodać obsługę stanu formularza (useState lub react-hook-form)
5. Dodać inline error messages
6. Dodać counter znaków dla opisu (X/500)
7. Dodać prop `onSubmit` do przekazania danych do parent

**Rezultat:** Komponent `PlanBasicsForm` z pełną walidacją

---

### Krok 7: Implementacja/dostosowanie komponentu `ExerciseCatalog`

**Zadania:**
1. Sprawdzić czy `ExerciseCatalog` już istnieje w projekcie
2. Jeśli istnieje: dodać tryb multi-select (prop `multiSelect`, checkboxy na kartach)
3. Jeśli nie istnieje: utworzyć plik `src/components/exercise/ExerciseCatalog.tsx`:
   - Search bar
   - Filtry (kategoria, trudność)
   - Grid/lista kart ćwiczeń
   - Checkboxy (w trybie multi-select)
4. Dodać prop `onSelectionChange` do przekazania wybranych ID do parent

**Rezultat:** Komponent `ExerciseCatalog` z multi-select

---

### Krok 8: Implementacja komponentu `ExerciseSelector`

**Zadania:**
1. Utworzyć plik `src/components/training-plan/ExerciseSelector.tsx`
2. Zintegrować `<ExerciseCatalog multiSelect={true}>`
3. Dodać Selected Count Banner (sticky, pod StepIndicator)
4. Dodać przycisk "Wyczyść wszystko"
5. Obsłużyć stan wybranych ćwiczeń (selectedExerciseIds)
6. Dodać prop `onSelectionChange`

**Rezultat:** Komponent `ExerciseSelector` gotowy

---

### Krok 9: Implementacja komponentu `SetFormList`

**Zadania:**
1. Utworzyć plik `src/components/training-plan/SetFormList.tsx`
2. Dodać listę rowów z polami: repetitions, weight, przycisk usuń
3. Zaimplementować walidację inline (min/max values)
4. Dodać przyciski: "Dodaj set", "Bulk add"
5. Obsłużyć stan serii (useState)
6. Dodać prop `onSetsChange`

**Rezultat:** Komponent `SetFormList` z obsługą serii

---

### Krok 10: Implementacja komponentu `BulkAddSetModal`

**Zadania:**
1. Utworzyć plik `src/components/training-plan/BulkAddSetModal.tsx`
2. Użyć komponentu Dialog/Modal z Shadcn/ui
3. Dodać formularz: liczba setów, powtórzenia, ciężar
4. Dodać preview text
5. Zaimplementować walidację (count 1-10, repetitions > 0, weight >= 0)
6. Dodać focus trap i obsługę ESC key
7. Dodać propsy: `isOpen`, `onClose`, `onConfirm`

**Rezultat:** Komponent `BulkAddSetModal` gotowy

---

### Krok 11: Implementacja komponentu `ExerciseSetConfigAccordion`

**Zadania:**
1. Utworzyć plik `src/components/training-plan/ExerciseSetConfigAccordion.tsx`
2. Użyć komponentu Accordion z Shadcn/ui
3. Dodać header: drag handle (⋮⋮), ikona, nazwa, badge liczby setów, chevron
4. Dodać body: `<SetFormList>`
5. Obsłużyć stan expand/collapse
6. Dodać drag & drop handles (onDragStart, onDragEnd)

**Rezultat:** Komponent `ExerciseSetConfigAccordion` gotowy

---

### Krok 12: Implementacja komponentu `ExerciseSetConfigurator`

**Zadania:**
1. Utworzyć plik `src/components/training-plan/ExerciseSetConfigurator.tsx`
2. Dodać sortable listę ćwiczeń (użyć biblioteki jak `dnd-kit` lub `react-beautiful-dnd`)
3. Renderować `<ExerciseSetConfigAccordion>` dla każdego ćwiczenia
4. Obsłużyć reordering ćwiczeń (drag & drop)
5. Obsłużyć agregację stanu serii dla wszystkich ćwiczeń
6. Dodać walidację: każde ćwiczenie min 1 set
7. Dodać prop `onSetsConfigured`

**Rezultat:** Komponent `ExerciseSetConfigurator` z drag & drop

---

### Krok 13: Implementacja komponentu `DraftRecoveryBanner`

**Zadania:**
1. Utworzyć plik `src/components/training-plan/DraftRecoveryBanner.tsx`
2. Użyć komponentu Alert z Shadcn/ui
3. Dodać tekst i przyciski: "Przywróć", "Odrzuć"
4. Dodać propsy: `draft`, `onRestore`, `onDiscard`
5. Dodać warunkowe renderowanie (jeśli draft !== null)

**Rezultat:** Komponent `DraftRecoveryBanner` gotowy

---

### Krok 14: Implementacja komponentu `PlanWizard`

**Zadania:**
1. Utworzyć plik `src/components/training-plan/PlanWizard.tsx`
2. Zintegrować hook `usePlanWizard(mode, planId)`
3. Zintegrować hook `useDraftRecovery(wizardState)`
4. Zintegrować hook `usePlanSubmit()`
5. Dodać warunkowe renderowanie kroków na podstawie `currentStep`:
   - Krok 1: `<PlanBasicsForm>`
   - Krok 2: `<ExerciseSelector>`
   - Krok 3: `<ExerciseSetConfigurator>`
6. Dodać `<StepIndicator>` (sticky top)
7. Dodać `<DraftRecoveryBanner>` (jeśli draft istnieje)
8. Dodać footer z przyciskami nawigacji:
   - "Anuluj" (zawsze widoczny)
   - "Wstecz" (widoczny w kroku 2 i 3)
   - "Dalej" (widoczny w kroku 1 i 2)
   - "Zapisz plan" (widoczny w kroku 3)
9. Obsłużyć loading state (spinner w buttonie podczas POST)
10. Obsłużyć success flow (toast + redirect + clear draft)
11. Obsłużyć error flow (toast + możliwość retry)

**Rezultat:** Komponent `PlanWizard` w pełni funkcjonalny

---

### Krok 15: Implementacja strony `create.astro`

**Zadania:**
1. Utworzyć plik `src/pages/plans/create.astro`
2. Dodać layout `<MainLayout>` (lub `<WizardLayout>` jeśli dostępny)
3. Dodać komponent `<PlanWizard mode="create" client:load>`
4. Dodać middleware sprawdzający autentykację (redirect do `/login` jeśli niezalogowany)
5. Dodać odczyt query param `?step=X` i przekazanie do wizarda (inicjalny krok)

**Rezultat:** Strona `/plans/create` gotowa

---

### Krok 16: Implementacja strony `[id]/edit.astro`

**Zadania:**
1. Utworzyć plik `src/pages/plans/[id]/edit.astro`
2. Dodać layout `<MainLayout>` (lub `<WizardLayout>`)
3. Dodać server-side fetch: GET `/api/plans/{id}` aby pobrać dane planu
4. Przekazać dane jako prop `initialData` do `<PlanWizard mode="edit" planId={id} client:load>`
5. Dodać middleware sprawdzający autentykację i ownership (403 jeśli nie należy do usera)
6. Obsłużyć 404 jeśli plan nie istnieje

**Rezultat:** Strona `/plans/[id]/edit` gotowa

---

### Krok 17: Integracja z endpointem POST `/api/plans`

**Zadania:**
1. Zweryfikować czy endpoint `POST /api/plans` już istnieje (powinien, wg dostarczonego kodu)
2. Jeśli nie istnieje, utworzyć plik `src/pages/api/plans/index.ts` z metodą POST
3. Przetestować bulk create (plan + exercises + sets w jednym requescie)
4. Zweryfikować kody odpowiedzi (201, 400, 403, 422, 500)
5. Przetestować walidację limitu 7 planów

**Rezultat:** Endpoint `POST /api/plans` działa poprawnie

---

### Krok 18: Implementacja obsługi edycji (PUT + sets CRUD)

**Zadania:**
1. Rozszerzyć `usePlanSubmit` o funkcję `updatePlan(planId, command)`
2. Dodać logikę różnicowania serii w kroku 3:
   - Nowe sety: POST `/api/plans/{planId}/sets`
   - Zmienione sety: PUT `/api/plans/{planId}/sets/{setId}`
   - Usunięte sety: DELETE `/api/plans/{planId}/sets/{setId}`
3. Zaimplementować sekwencyjne wywołania API dla setów (lub batch jeśli API to wspiera)
4. Obsłużyć błędy dla każdego requesta osobno

**Rezultat:** Edycja planu z pełną obsługą serii

---

### Krok 19: Testy i dostępność

**Zadania:**
1. Dodać testy jednostkowe dla hooków (`usePlanWizard`, `useDraftRecovery`, `usePlanSubmit`)
2. Dodać testy integracyjne dla komponentów (React Testing Library)
3. Przetestować drag & drop na touch devices
4. Przetestować keyboard navigation (Tab, Enter, ESC, Alt+↑/↓)
5. Przetestować focus trap w modalu
6. Uruchomić audyt dostępności (axe, lighthouse)
7. Poprawić błędy dostępności (aria-labels, role, focus management)

**Rezultat:** Pełne pokrycie testami, zgodność z WCAG

---

### Krok 20: Stylowanie i responsive design

**Zadania:**
1. Zastosować style Tailwind CSS zgodne z design system
2. Przetestować responsive layout (mobile, tablet, desktop)
3. Dodać fullscreen mode na mobile dla wizarda (opcjonalnie przez `<WizardLayout>`)
4. Sprawdzić i poprawić sticky positioning (StepIndicator, Selected Count Banner)
5. Dodać animacje (transitions, fade-in/out dla kroków)

**Rezultat:** Widok w pełni responsywny i estetyczny

---

### Krok 21: Finalne testy E2E

**Zadania:**
1. Napisać testy E2E (Cypress) dla pełnego flow:
   - Tworzenie planu od początku do końca
   - Draft recovery
   - Edycja istniejącego planu
   - Obsługa błędów (limit planów, błąd serwera)
2. Przetestować na różnych przeglądarkach (Chrome, Firefox, Safari)
3. Przetestować na urządzeniach mobilnych (iOS, Android)

**Rezultat:** Widok w pełni przetestowany i gotowy do wdrożenia

---

### Krok 22: Dokumentacja i deployment

**Zadania:**
1. Dodać dokumentację komponentów (JSDoc/TSDoc)
2. Zaktualizować README z informacjami o nowym widoku
3. Utworzyć changelog/release notes
4. Wdrożyć na środowisko staging
5. Przeprowadzić user acceptance testing (UAT)
6. Wdrożyć na production

**Rezultat:** Widok wdrożony i gotowy do użytku przez użytkowników
