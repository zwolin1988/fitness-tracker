# API Endpoint Implementation Plan: Training Plans & Plan Sets

## 1. Przegląd punktów końcowych

Zasób **Training Plans** umożliwia użytkownikom tworzenie, przeglądanie, edycję i usuwanie planów treningowych. Każdy plan może zawierać wiele ćwiczeń (poprzez tabelę pośrednią `plan_exercises`) oraz wiele setów (w tabeli `plan_exercise_sets`). System wymusza limit maksymalnie 7 aktywnych planów na użytkownika.

Zasób **Plan Sets** umożliwia zarządzanie pojedynczymi setami w ramach planu treningowego (dodawanie, edycja, usuwanie setów z określonymi powtórzeniami i ciężarem).

### Endpointy Training Plans:
- **GET /api/plans** – lista planów treningowych zalogowanego użytkownika
- **POST /api/plans** – tworzenie nowego planu (max 7 aktywnych planów)
- **GET /api/plans/{id}** – szczegóły planu z listą setów
- **PUT /api/plans/{id}** – aktualizacja planu
- **DELETE /api/plans/{id}** – usuwanie planu

### Endpointy Plan Sets:
- **POST /api/plans/{planId}/sets** – dodawanie nowego seta do planu
- **PUT /api/plans/{planId}/sets/{setId}** – aktualizacja istniejącego seta
- **DELETE /api/plans/{planId}/sets/{setId}** – usuwanie seta z planu

## 2. Szczegóły żądań

### GET /api/plans
- Metoda HTTP: GET
- URL: `/api/plans`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
- Parametry URL: brak
- Query params: opcjonalnie `page` i `limit` dla paginacji (przyszłość)
- Body: brak

### POST /api/plans
- Metoda HTTP: POST
- URL: `/api/plans`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
  - `Content-Type: application/json`
- Body JSON:
  ```json
  {
    "name": string,
    "description": string (optional),
    "exerciseIds": string[] (array of UUIDs)
  }
  ```
- Walidacja:
  - `name`: wymagane, min 1 znak, max 100 znaków
  - `description`: opcjonalne, max 1000 znaków
  - `exerciseIds`: wymagane, array of UUIDs, każde ćwiczenie musi istnieć
  - Sprawdzenie limitu: użytkownik nie może mieć więcej niż 7 planów

### GET /api/plans/{id}
- Metoda HTTP: GET
- URL: `/api/plans/{id}`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
- Parametry URL: `id` (UUID planu)
- Body: brak

### PUT /api/plans/{id}
- Metoda HTTP: PUT
- URL: `/api/plans/{id}`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
  - `Content-Type: application/json`
- Parametry URL: `id` (UUID planu)
- Body JSON:
  ```json
  {
    "name": string (optional),
    "description": string (optional),
    "exerciseIds": string[] (optional)
  }
  ```
- Walidacja:
  - Wszystkie pola opcjonalne, ale przynajmniej jedno musi być podane
  - Walidacja jak w POST (gdy pole jest podane)

### DELETE /api/plans/{id}
- Metoda HTTP: DELETE
- URL: `/api/plans/{id}`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
- Parametry URL: `id` (UUID planu)
- Body: brak

### POST /api/plans/{planId}/sets
- Metoda HTTP: POST
- URL: `/api/plans/{planId}/sets`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
  - `Content-Type: application/json`
- Parametry URL: `planId` (UUID planu)
- Body JSON:
  ```json
  {
    "exerciseId": string (UUID),
    "repetitions": number,
    "weight": number,
    "set_order": number (optional)
  }
  ```
- Walidacja:
  - `exerciseId`: wymagane, UUID, musi istnieć
  - `repetitions`: wymagane, number > 0, max 999
  - `weight`: wymagane, number >= 0, max 999.99
  - `set_order`: opcjonalne, number >= 0 (auto-generowanie jeśli brak)

### PUT /api/plans/{planId}/sets/{setId}
- Metoda HTTP: PUT
- URL: `/api/plans/{planId}/sets/{setId}`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
  - `Content-Type: application/json`
- Parametry URL: `planId` (UUID), `setId` (UUID)
- Body JSON:
  ```json
  {
    "repetitions": number (optional),
    "weight": number (optional),
    "set_order": number (optional)
  }
  ```
- Walidacja:
  - Wszystkie pola opcjonalne, min. 1 wymagane
  - Walidacja jak w POST (gdy pole jest podane)

### DELETE /api/plans/{planId}/sets/{setId}
- Metoda HTTP: DELETE
- URL: `/api/plans/{planId}/sets/{setId}`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
- Parametry URL: `planId` (UUID), `setId` (UUID)
- Body: brak

## 3. Wykorzystywane typy

### DTO (Data Transfer Objects):
- **TrainingPlanDTO** - reprezentacja planu treningowego
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

- **PlanExerciseSetDTO** - reprezentacja seta w planie
  ```typescript
  {
    id: string;
    training_plan_id: string;
    exercise_id: string;
    set_order: number;
    repetitions: number;
    weight: number;
    created_at: string;
  }
  ```

### Command Models:
- **CreateTrainingPlanCommand** - dane do tworzenia planu
  ```typescript
  {
    name: string;
    description?: string;
    exerciseIds: string[];
  }
  ```

- **UpdateTrainingPlanCommand** - dane do aktualizacji planu
  ```typescript
  {
    name?: string;
    description?: string;
    exerciseIds?: string[];
  }
  ```

- **CreatePlanExerciseSetCommand** - dane do tworzenia seta
  ```typescript
  {
    training_plan_id: string;
    exercise_id: string;
    set_order: number;
    repetitions: number;
    weight: number;
  }
  ```

- **UpdatePlanExerciseSetCommand** - dane do aktualizacji seta
  ```typescript
  {
    repetitions?: number;
    weight?: number;
    set_order?: number;
  }
  ```

### Response Types (do zdefiniowania w serwisie):
- **TrainingPlanDetailResponse** - szczegóły planu z setami i ćwiczeniami
  ```typescript
  {
    ...TrainingPlanDTO,
    exercises: ExerciseDTO[],
    sets: PlanExerciseSetDTO[]
  }
  ```

## 4. Szczegóły odpowiedzi

### GET /api/plans
- 200 OK
  ```json
  {
    "items": [TrainingPlanDTO, ...],
    "total": number
  }
  ```
- 401 Unauthorized – brak/nieprawidłowy token
- 500 Internal Server Error

### POST /api/plans
- 201 Created
  ```json
  TrainingPlanDTO
  ```
- 400 Bad Request – błąd walidacji
- 401 Unauthorized – brak/nieprawidłowy token
- 403 Forbidden – limit 7 planów przekroczony
- 404 Not Found – jedno lub więcej ćwiczeń nie istnieje
- 500 Internal Server Error

### GET /api/plans/{id}
- 200 OK
  ```json
  {
    ...TrainingPlanDTO,
    "exercises": [ExerciseDTO, ...],
    "sets": [PlanExerciseSetDTO, ...]
  }
  ```
- 401 Unauthorized – brak/nieprawidłowy token
- 403 Forbidden – plan należy do innego użytkownika
- 404 Not Found – plan nie istnieje
- 500 Internal Server Error

### PUT /api/plans/{id}
- 200 OK
  ```json
  TrainingPlanDTO
  ```
- 400 Bad Request – błąd walidacji
- 401 Unauthorized – brak/nieprawidłowy token
- 403 Forbidden – plan należy do innego użytkownika
- 404 Not Found – plan/ćwiczenie nie istnieje
- 500 Internal Server Error

### DELETE /api/plans/{id}
- 204 No Content
- 401 Unauthorized – brak/nieprawidłowy token
- 403 Forbidden – plan należy do innego użytkownika
- 404 Not Found – plan nie istnieje
- 500 Internal Server Error

### POST /api/plans/{planId}/sets
- 201 Created
  ```json
  PlanExerciseSetDTO
  ```
- 400 Bad Request – błąd walidacji
- 401 Unauthorized – brak/nieprawidłowy token
- 403 Forbidden – plan należy do innego użytkownika
- 404 Not Found – plan/ćwiczenie nie istnieje
- 500 Internal Server Error

### PUT /api/plans/{planId}/sets/{setId}
- 200 OK
  ```json
  PlanExerciseSetDTO
  ```
- 400 Bad Request – błąd walidacji
- 401 Unauthorized – brak/nieprawidłowy token
- 403 Forbidden – set należy do cudzego planu
- 404 Not Found – plan/set nie istnieje
- 500 Internal Server Error

### DELETE /api/plans/{planId}/sets/{setId}
- 204 No Content
- 401 Unauthorized – brak/nieprawidłowy token
- 403 Forbidden – set należy do cudzego planu
- 404 Not Found – plan/set nie istnieje
- 500 Internal Server Error

## 5. Przepływ danych

### Tworzenie planu (POST /api/plans)
1. **Middleware** (`src/middleware/index.ts`): weryfikuje token JWT, inicjalizuje `context.locals.supabase`
2. **Handler** (`src/pages/api/plans.ts`):
   - Pobiera użytkownika z JWT: `supabase.auth.getUser()`
   - Waliduje body przez Zod schema
   - Wywołuje `TrainingPlanService.createTrainingPlan(supabase, userId, command)`
3. **Service Layer** (`src/lib/services/training-plan.ts`):
   - Sprawdza limit planów: `SELECT COUNT(*) FROM training_plans WHERE user_id = ?`
   - Jeśli >= 7, rzuca `TrainingPlanError` z kodem 403
   - Sprawdza istnienie wszystkich ćwiczeń z `exerciseIds`
   - W transakcji:
     - INSERT do `training_plans`
     - INSERT do `plan_exercises` dla każdego exerciseId
   - Zwraca nowo utworzony plan jako `TrainingPlanDTO`
4. **Mapping**: wiersz DB → `TrainingPlanDTO`

### Szczegóły planu (GET /api/plans/{id})
1. **Middleware**: weryfikuje JWT
2. **Handler** (`src/pages/api/plans/[id].ts`):
   - Waliduje UUID w path
   - Wywołuje `TrainingPlanService.getTrainingPlanById(supabase, planId, userId)`
3. **Service Layer**:
   - SELECT plan z `training_plans WHERE id = ? AND user_id = ?`
   - Jeśli brak, rzuca 404 lub 403
   - SELECT ćwiczenia poprzez JOIN z `plan_exercises`
   - SELECT sety z `plan_exercise_sets WHERE training_plan_id = ?`
   - Zwraca `TrainingPlanDetailResponse`

### Aktualizacja planu (PUT /api/plans/{id})
1. **Middleware**: weryfikuje JWT
2. **Handler**: waliduje path i body, wywołuje serwis
3. **Service Layer**:
   - Sprawdza istnienie i ownership planu
   - Jeśli `exerciseIds` podane:
     - Sprawdza istnienie ćwiczeń
     - W transakcji:
       - DELETE FROM `plan_exercises WHERE training_plan_id = ?`
       - INSERT nowych relacji
   - UPDATE `training_plans` (name, description)
   - Zwraca zaktualizowany plan

### Dodawanie seta (POST /api/plans/{planId}/sets)
1. **Middleware**: weryfikuje JWT
2. **Handler**: waliduje planId i body, wywołuje serwis
3. **Service Layer**:
   - Sprawdza istnienie planu i ownership
   - Sprawdza istnienie ćwiczenia
   - Jeśli `set_order` nie podany:
     - SELECT MAX(set_order) FROM `plan_exercise_sets WHERE training_plan_id = ? AND exercise_id = ?`
     - Ustaw `set_order = MAX + 1` (lub 0 jeśli brak)
   - INSERT do `plan_exercise_sets`
   - Zwraca `PlanExerciseSetDTO`

## 6. Względy bezpieczeństwa

### Autoryzacja i uwierzytelnianie
- **JWT Bearer token**: wszystkie endpointy wymagają tokenu w nagłówku `Authorization`
- **Middleware**: weryfikuje token przez `supabase.auth.getUser()`
- **Ownership**: każda operacja sprawdza czy `user_id` w `training_plans` odpowiada zalogowanemu użytkownikowi

### Row Level Security (RLS)
- Polityka na `training_plans`: `auth.uid() = user_id`
- Użytkownik automatycznie ma dostęp tylko do własnych planów
- RLS działa jako dodatkowa warstwa zabezpieczeń poza walidacją aplikacji

### Walidacja danych wejściowych
- **Zod schemas**: walidacja wszystkich danych przed przetworzeniem
- **Foreign Keys**: sprawdzenie istnienia `exerciseIds` przed INSERT
- **Typy numeryczne**: walidacja zakresów (repetitions > 0, weight >= 0)
- **UUIDs**: walidacja formatu UUID dla wszystkich ID

### Zapobieganie nadużyciom
- **Limit 7 planów**: egzekwowany na poziomie aplikacji przed INSERT
- **SQL Injection**: query builder Supabase zapobiega
- **Mass Assignment**: tylko dozwolone pola z Command models są przetwarzane

### Integralność danych
- **Transakcje**: operacje wieloetapowe (tworzenie planu + ćwiczenia) w transakcji
- **Foreign Key Constraints**: baza danych wymusza integralność referencyjną
- **CASCADE DELETE**: usunięcie planu automatycznie usuwa powiązane sety i relacje

## 7. Obsługa błędów

### Błędy walidacji (400 Bad Request)
- Nieprawidłowy format UUID
- Brakujące wymagane pola (name, exerciseIds)
- Wartości poza zakresem (repetitions <= 0, weight < 0)
- Nieprawidłowy typ danych (string zamiast number)
- Pusta tablica exerciseIds

**Przykład odpowiedzi:**
```json
{
  "error": "Validation failed",
  "details": {
    "name": ["Name is required and cannot be empty"],
    "repetitions": ["Repetitions must be greater than 0"]
  }
}
```

### Błędy autoryzacji (401 Unauthorized)
- Brak tokenu JWT
- Nieprawidłowy/wygasły token
- Token nie może być zweryfikowany

**Przykład odpowiedzi:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### Błędy dostępu (403 Forbidden)
- Limit 7 planów przekroczony
- Próba dostępu do cudzego planu
- Próba modyfikacji cudzego seta

**Przykład odpowiedzi:**
```json
{
  "error": "Forbidden",
  "message": "Maximum limit of 7 training plans reached",
  "code": "MAX_PLANS_EXCEEDED"
}
```

### Błędy nie znaleziono (404 Not Found)
- Plan nie istnieje
- Set nie istnieje
- Ćwiczenie nie istnieje (z exerciseIds)

**Przykład odpowiedzi:**
```json
{
  "error": "Training plan not found",
  "code": "NOT_FOUND"
}
```

### Błędy serwera (500 Internal Server Error)
- Błąd bazy danych
- Nieobsłużone wyjątki
- Błąd transakcji

**Przykład odpowiedzi:**
```json
{
  "error": "Internal server error"
}
```

**Logowanie błędów:**
- Wszystkie błędy 500 logowane do konsoli: `console.error()`
- Szczegóły błędu (stack trace) nie są zwracane klientowi
- W produkcji: integracja z systemem monitoringu (np. Sentry)

## 8. Rozważania dotyczące wydajności

### Indeksy bazy danych
- `training_plans(user_id)` - już istnieje, przyspiesza SELECT planów użytkownika
- `plan_exercise_sets(training_plan_id, exercise_id)` - już istnieje, przyspiesza SELECT setów
- `plan_exercises(training_plan_id)` - przyspiesza JOIN z ćwiczeniami

### Optymalizacje zapytań
- **Single query dla szczegółów**: JOIN zamiast N+1 queries
- **Batch operations**: INSERT wielu relacji plan_exercises w jednym zapytaniu
- **COUNT optimization**: użycie `count: "exact", head: true` w Supabase

### Transakcje
- Grupowanie operacji INSERT/DELETE w transakcjach
- Zmniejszenie liczby round-trips do bazy danych
- Zapewnienie atomowości operacji

### Caching (przyszłość)
- Cache listy planów użytkownika (invalidacja po CREATE/UPDATE/DELETE)
- Cache szczegółów planu (invalidacja po UPDATE)
- Użycie Redis lub Supabase Edge Cache

### Paginacja
- Dla listy planów: query params `page` i `limit`
- Default: 20 planów na stronę, max 100
- Opcjonalnie dla setów w szczegółach planu

### Limity
- Limit 7 planów zapobiega nadmiernemu wzrostowi danych
- Walidacja rozmiarów: name (100 znaków), description (1000 znaków)
- Limit exerciseIds w planie: max 50 ćwiczeń (opcjonalna walidacja)

## 9. Kroki implementacji

### Krok 1: Zdefiniować Zod schematy (`src/lib/schemas/training-plan.ts`)
- `CreateTrainingPlanSchema` - walidacja dla POST /plans
- `UpdateTrainingPlanSchema` - walidacja dla PUT /plans/{id}
- `TrainingPlanIdParamSchema` - walidacja UUID w path
- `CreatePlanSetSchema` - walidacja dla POST /plans/{planId}/sets
- `UpdatePlanSetSchema` - walidacja dla PUT /plans/{planId}/sets/{setId}
- `PlanSetIdParamsSchema` - walidacja planId i setId w path

### Krok 2: Utworzyć serwis (`src/lib/services/training-plan.ts`)
Implementacja następujących metod:
- `listTrainingPlans(supabase, userId)` - lista planów
- `getTrainingPlanById(supabase, planId, userId)` - szczegóły z setami
- `createTrainingPlan(supabase, userId, command)` - tworzenie z limitem i transakcją
- `updateTrainingPlan(supabase, planId, userId, command)` - aktualizacja z transakcją
- `deleteTrainingPlan(supabase, planId, userId)` - usuwanie (CASCADE)
- `createPlanSet(supabase, planId, userId, command)` - dodawanie seta
- `updatePlanSet(supabase, setId, planId, userId, command)` - aktualizacja seta
- `deletePlanSet(supabase, setId, planId, userId)` - usuwanie seta
- Custom error class: `TrainingPlanError`

### Krok 3: Utworzyć API route - lista i tworzenie (`src/pages/api/plans.ts`)
- Handler GET: lista planów użytkownika
- Handler POST: tworzenie planu z walidacją limitu
- Weryfikacja JWT przez `supabase.auth.getUser()`
- Obsługa błędów: 400, 401, 403, 404, 500

### Krok 4: Utworzyć API route - szczegóły, aktualizacja, usuwanie (`src/pages/api/plans/[id].ts`)
- Handler GET: szczegóły planu z setami i ćwiczeniami
- Handler PUT: aktualizacja planu
- Handler DELETE: usuwanie planu
- Walidacja UUID, ownership, obsługa błędów

### Krok 5: Utworzyć API route - dodawanie seta (`src/pages/api/plans/[planId]/sets.ts`)
- Handler POST: dodawanie seta do planu
- Auto-generowanie set_order jeśli nie podane
- Walidacja planId, exerciseId, ownership

### Krok 6: Utworzyć API route - aktualizacja i usuwanie seta (`src/pages/api/plans/[planId]/sets/[setId].ts`)
- Handler PUT: aktualizacja seta
- Handler DELETE: usuwanie seta
- Walidacja planId, setId, ownership

### Krok 7: Utworzyć helper functions (opcjonalnie)
- `checkPlanOwnership(supabase, planId, userId)` - sprawdzenie ownership
- `validateExercisesExist(supabase, exerciseIds)` - sprawdzenie istnienia ćwiczeń
- `getNextSetOrder(supabase, planId, exerciseId)` - auto-generowanie set_order

### Krok 8: Build i weryfikacja
- Uruchomić `npm run build` i sprawdzić błędy kompilacji
- Zweryfikować TypeScript types
- Sprawdzić ESLint warnings

### Krok 9: Testy jednostkowe (opcjonalnie)
- Testy serwisu: `training-plan.test.ts`
- Testy walidacji Zod schemas
- Mock Supabase client (msw lub jest-mock)

### Krok 10: Testy integracyjne (opcjonalnie)
- Testy endpointów API z prawdziwą bazą danych (test DB)
- Scenariusze: tworzenie, aktualizacja, limit 7 planów, ownership
- Coverage > 80%

### Krok 11: Dokumentacja i przykłady
- Utworzenie `.ai/plans-endpoint-examples.md` z przykładami curl
- Aktualizacja README jeśli potrzebne
- Dokumentacja dla frontendu

### Krok 12: Code review i deploy
- Pull request z opisem zmian
- Code review przez zespół
- Deploy na środowisko staging
- Testy manualne
- Deploy na produkcję
