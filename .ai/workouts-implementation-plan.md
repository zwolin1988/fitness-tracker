# API Endpoint Implementation Plan: Workouts & Workout Sets

## 1. Przegląd punktów końcowych

Zasób **Workouts** umożliwia użytkownikom prowadzenie sesji treningowych z automatycznym śledzeniem czasu rozpoczęcia i zakończenia. Każdy workout może być powiązany z planem treningowym (opcjonalnie) i zawiera wiele setów ćwiczeń wykonanych podczas sesji. System automatycznie zapisuje start_time przy tworzeniu workout i pozwala na manualne lub automatyczne zakończenie sesji.

Zasób **Workout Sets** umożliwia dodawanie i aktualizację pojedynczych setów wykonanych podczas workout (repetitions, weight, completed status). Użycie metody PATCH pozwala na częściową aktualizację setów bez konieczności przesyłania wszystkich pól.

### Endpointy Workouts:
- **POST /api/workouts** – tworzenie nowej sesji treningowej (automatyczne start_time)
- **GET /api/workouts** – lista workouts z filtrowaniem po datach i paginacją
- **GET /api/workouts/{id}** – szczegóły workout z listą setów
- **POST /api/workouts/{id}/end** – zakończenie sesji treningowej (ustawienie end_time)

### Endpointy Workout Sets:
- **POST /api/workouts/{id}/sets** – dodawanie nowego seta do workout
- **PATCH /api/workouts/{id}/sets/{setId}** – częściowa aktualizacja seta

## 2. Szczegóły żądań

### POST /api/workouts
- Metoda HTTP: POST
- URL: `/api/workouts`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
  - `Content-Type: application/json`
- Body JSON:
  ```json
  {
    "planId": string (UUID, optional)
  }
  ```
- Walidacja:
  - `planId`: opcjonalny UUID, jeśli podany musi istnieć i należeć do użytkownika
  - `start_time`: generowany automatycznie przez serwer (current timestamp)

### GET /api/workouts
- Metoda HTTP: GET
- URL: `/api/workouts`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
- Query params:
  - `from` (optional): ISO 8601 date/timestamp - początek zakresu
  - `to` (optional): ISO 8601 date/timestamp - koniec zakresu
  - `page` (optional): number >= 1, default: 1
  - `limit` (optional): number 1-100, default: 20
- Walidacja:
  - `from` i `to` muszą być poprawnym formatem ISO 8601
  - Jeśli oba podane: `from <= to`
  - `page >= 1`
  - `limit` między 1 a 100

### GET /api/workouts/{id}
- Metoda HTTP: GET
- URL: `/api/workouts/{id}`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
- Parametry URL: `id` (UUID workout)
- Body: brak

### POST /api/workouts/{id}/end
- Metoda HTTP: POST
- URL: `/api/workouts/{id}/end`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
  - `Content-Type: application/json`
- Parametry URL: `id` (UUID workout)
- Body JSON:
  ```json
  {
    "endTime": string (ISO 8601, optional)
  }
  ```
- Walidacja:
  - `endTime`: opcjonalny ISO 8601 timestamp, jeśli nie podany użyj current time
  - `endTime` musi być >= `start_time`
  - Workout nie może być już zakończony (end_time === null)

### POST /api/workouts/{id}/sets
- Metoda HTTP: POST
- URL: `/api/workouts/{id}/sets`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
  - `Content-Type: application/json`
- Parametry URL: `id` (UUID workout)
- Body JSON:
  ```json
  {
    "exerciseId": string (UUID),
    "setOrder": number,
    "repetitions": number,
    "weight": number
  }
  ```
- Walidacja:
  - `exerciseId`: wymagany UUID, musi istnieć w tabeli exercises
  - `setOrder`: wymagany number >= 0
  - `repetitions`: wymagany number > 0, max 999
  - `weight`: wymagany number >= 0, max 999.99

### PATCH /api/workouts/{id}/sets/{setId}
- Metoda HTTP: PATCH
- URL: `/api/workouts/{id}/sets/{setId}`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
  - `Content-Type: application/json`
- Parametry URL: `id` (UUID workout), `setId` (UUID)
- Body JSON:
  ```json
  {
    "repetitions": number (optional),
    "weight": number (optional),
    "completed": boolean (optional)
  }
  ```
- Walidacja:
  - Wszystkie pola opcjonalne, ale min. 1 musi być podane
  - Walidacja jak w POST (gdy pole jest podane)

## 3. Wykorzystywane typy

### DTO (Data Transfer Objects):
- **WorkoutDTO** - reprezentacja workout session
  ```typescript
  {
    id: string;
    user_id: string;
    training_plan_id?: string | null;
    start_time: string;
    end_time?: string | null;
    created_at: string;
  }
  ```

- **WorkoutSetDTO** - reprezentacja seta w workout
  ```typescript
  {
    id: string;
    workout_id: string;
    exercise_id: string;
    set_order: number;
    repetitions: number;
    weight: number;
    completed: boolean;
    modified_at: string;
  }
  ```

### Command Models:
- **CreateWorkoutCommand** - dane do tworzenia workout
  ```typescript
  {
    training_plan_id?: string;
  }
  ```

- **EndWorkoutCommand** - dane do zakończenia workout
  ```typescript
  {
    workout_id: string;
    end_time?: string;
  }
  ```

- **CreateWorkoutSetCommand** - dane do tworzenia seta
  ```typescript
  {
    workout_id: string;
    exercise_id: string;
    set_order: number;
    repetitions: number;
    weight: number;
  }
  ```

- **UpdateWorkoutSetCommand** - dane do aktualizacji seta
  ```typescript
  {
    repetitions?: number;
    weight?: number;
    completed?: boolean;
  }
  ```

### Response Types (do zdefiniowania w serwisie):
- **ListWorkoutsResponse** - lista workouts z paginacją
  ```typescript
  {
    items: WorkoutDTO[];
    page: number;
    totalPages: number;
    total: number;
  }
  ```

- **WorkoutDetailResponse** - szczegóły workout z setami
  ```typescript
  {
    ...WorkoutDTO,
    sets: WorkoutSetDTO[],
    totalSets?: number,
    totalExercises?: number
  }
  ```

- **WorkoutSummaryResponse** - podsumowanie po zakończeniu
  ```typescript
  {
    ...WorkoutDTO,
    duration: number, // w sekundach
    totalSets: number,
    totalExercises: number,
    totalReps: number
  }
  ```

## 4. Szczegóły odpowiedzi

### POST /api/workouts
- 201 Created
  ```json
  {
    "workoutId": "uuid",
    "startTime": "2025-10-12T21:30:00.000Z"
  }
  ```
- 400 Bad Request – błąd walidacji planId
- 401 Unauthorized – brak/nieprawidłowy token
- 404 Not Found – plan nie istnieje
- 500 Internal Server Error

### GET /api/workouts
- 200 OK
  ```json
  {
    "items": [WorkoutDTO, ...],
    "page": number,
    "totalPages": number,
    "total": number
  }
  ```
- 400 Bad Request – błędne query params (invalid dates, from > to)
- 401 Unauthorized – brak/nieprawidłowy token
- 500 Internal Server Error

### GET /api/workouts/{id}
- 200 OK
  ```json
  {
    ...WorkoutDTO,
    "sets": [WorkoutSetDTO, ...],
    "totalSets": number,
    "totalExercises": number
  }
  ```
- 400 Bad Request – nieprawidłowy UUID
- 401 Unauthorized – brak/nieprawidłowy token
- 403 Forbidden – workout należy do innego użytkownika
- 404 Not Found – workout nie istnieje
- 500 Internal Server Error

### POST /api/workouts/{id}/end
- 200 OK
  ```json
  {
    ...WorkoutDTO,
    "duration": number,
    "totalSets": number,
    "totalExercises": number,
    "totalReps": number
  }
  ```
- 400 Bad Request – błąd walidacji (endTime < startTime)
- 401 Unauthorized – brak/nieprawidłowy token
- 403 Forbidden – workout należy do innego użytkownika
- 404 Not Found – workout nie istnieje
- 409 Conflict – workout już zakończony
- 500 Internal Server Error

### POST /api/workouts/{id}/sets
- 201 Created
  ```json
  WorkoutSetDTO
  ```
- 400 Bad Request – błąd walidacji
- 401 Unauthorized – brak/nieprawidłowy token
- 403 Forbidden – workout należy do innego użytkownika
- 404 Not Found – workout/exercise nie istnieje
- 409 Conflict – duplikat setOrder (opcjonalnie)
- 500 Internal Server Error

### PATCH /api/workouts/{id}/sets/{setId}
- 200 OK
  ```json
  WorkoutSetDTO
  ```
- 400 Bad Request – błąd walidacji
- 401 Unauthorized – brak/nieprawidłowy token
- 403 Forbidden – set należy do cudzego workout
- 404 Not Found – workout/set nie istnieje
- 500 Internal Server Error

## 5. Przepływ danych

### Tworzenie workout (POST /api/workouts)
1. **Middleware**: weryfikuje token JWT, inicjalizuje `context.locals.supabase`
2. **Handler** (`src/pages/api/workouts.ts`):
   - Pobiera użytkownika z JWT: `supabase.auth.getUser()`
   - Waliduje body przez Zod schema (opcjonalny planId)
   - Wywołuje `WorkoutService.createWorkout(supabase, userId, command)`
3. **Service Layer** (`src/lib/services/workout.ts`):
   - Jeśli planId podany: sprawdza istnienie i ownership planu
   - INSERT do `workouts` z:
     - `user_id` = userId
     - `training_plan_id` = planId (jeśli podany)
     - `start_time` = current timestamp
     - `end_time` = null
   - Zwraca `{ workoutId, startTime }`
4. **Response**: 201 Created z workoutId i startTime

### Lista workouts (GET /api/workouts)
1. **Middleware**: weryfikuje JWT
2. **Handler**: waliduje query params (from, to, page, limit)
3. **Service Layer**:
   - SELECT z `workouts WHERE user_id = ?`
   - Filtrowanie: `start_time >= from AND start_time <= to`
   - ORDER BY start_time DESC
   - Paginacja: OFFSET (page-1)*limit LIMIT limit
   - COUNT dla totalPages
4. **Response**: 200 OK z listą i metadanymi paginacji

### Szczegóły workout (GET /api/workouts/{id})
1. **Middleware**: weryfikuje JWT
2. **Handler**: waliduje UUID, sprawdza ownership
3. **Service Layer**:
   - SELECT workout z `workouts WHERE id = ? AND user_id = ?`
   - SELECT sety z `workout_sets WHERE workout_id = ?` ORDER BY set_order
   - Kalkulacja totalSets, totalExercises (COUNT DISTINCT)
4. **Response**: 200 OK z workout + sets + stats

### Zakończenie workout (POST /api/workouts/{id}/end)
1. **Middleware**: weryfikuje JWT
2. **Handler**: waliduje UUID i body, sprawdza ownership
3. **Service Layer**:
   - SELECT workout, sprawdź czy end_time === null
   - Jeśli już zakończony: rzuć 409 Conflict
   - Walidacja: endTime >= startTime
   - UPDATE `workouts SET end_time = ?`
   - Kalkulacja stats: duration, totalSets, totalReps
4. **Response**: 200 OK z workout summary

### Dodawanie seta (POST /api/workouts/{id}/sets)
1. **Middleware**: weryfikuje JWT
2. **Handler**: waliduje workoutId i body, sprawdza ownership
3. **Service Layer**:
   - Sprawdza istnienie workout i ownership
   - Sprawdza istnienie exercise
   - INSERT do `workout_sets`
   - Ustawia `completed = false` domyślnie
4. **Response**: 201 Created z nowym setem

## 6. Względy bezpieczeństwa

### Autoryzacja i uwierzytelnianie
- **JWT Bearer token**: wszystkie endpointy wymagają tokenu w nagłówku `Authorization`
- **Middleware**: weryfikuje token przez `supabase.auth.getUser()`
- **Ownership**: każda operacja sprawdza czy `user_id` w `workouts` odpowiada zalogowanemu użytkownikowi

### Row Level Security (RLS)
- Polityka na `workouts`: `auth.uid() = user_id`
- Polityka na `workout_sets`: poprzez foreign key do workouts (dziedziczenie ownership)
- RLS działa jako dodatkowa warstwa zabezpieczeń

### Walidacja danych wejściowych
- **Zod schemas**: walidacja wszystkich danych przed przetworzeniem
- **Foreign Keys**: sprawdzenie istnienia planId i exerciseId
- **Date validation**: from <= to, endTime >= startTime
- **Range validation**: repetitions > 0, weight >= 0

### Zapobieganie nadużyciom
- **Concurrent workouts**: użytkownik może mieć wiele aktywnych workouts (bez limitu)
- **SQL Injection**: query builder Supabase zapobiega
- **Mass Assignment**: tylko dozwolone pola z Command models

### Integralność danych
- **Foreign Key Constraints**: baza wymusza integralność
- **CHECK constraints**: repetitions > 0, weight >= 0 na poziomie DB
- **Immutable start_time**: nie można zmienić po utworzeniu
- **End constraint**: end_time musi być >= start_time (walidacja aplikacji)

## 7. Obsługa błędów

### Błędy walidacji (400 Bad Request)
- Nieprawidłowy format UUID
- Brakujące wymagane pola (exerciseId, repetitions, weight)
- Wartości poza zakresem (repetitions <= 0, weight < 0)
- Nieprawidłowy format daty (from, to, endTime)
- from > to
- endTime < startTime
- Pusta PATCH (brak żadnego pola do aktualizacji)

**Przykład odpowiedzi:**
```json
{
  "error": "Validation failed",
  "details": {
    "repetitions": ["Repetitions must be greater than 0"],
    "endTime": ["End time must be after start time"]
  }
}
```

### Błędy autoryzacji (401 Unauthorized)
- Brak tokenu JWT
- Nieprawidłowy/wygasły token

**Przykład odpowiedzi:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### Błędy dostępu (403 Forbidden)
- Próba dostępu do cudzego workout
- Próba modyfikacji cudzego seta

**Przykład odpowiedzi:**
```json
{
  "error": "Forbidden",
  "message": "You don't have access to this workout",
  "code": "FORBIDDEN"
}
```

### Błędy nie znaleziono (404 Not Found)
- Workout nie istnieje
- Set nie istnieje
- Plan nie istnieje (opcjonalny planId)
- Exercise nie istnieje

**Przykład odpowiedzi:**
```json
{
  "error": "Workout not found",
  "code": "NOT_FOUND"
}
```

### Błędy konfliktu (409 Conflict)
- Próba zakończenia już zakończonego workout
- Duplikat setOrder w tym samym workout (opcjonalnie)

**Przykład odpowiedzi:**
```json
{
  "error": "Workout is already completed",
  "code": "ALREADY_COMPLETED"
}
```

### Błędy serwera (500 Internal Server Error)
- Błąd bazy danych
- Nieobsłużone wyjątki

**Przykład odpowiedzi:**
```json
{
  "error": "Internal server error"
}
```

**Logowanie błędów:**
- Wszystkie błędy 500 logowane do konsoli: `console.error()`
- Szczegóły błędu (stack trace) nie są zwracane klientowi

## 8. Rozważania dotyczące wydajności

### Indeksy bazy danych
- `workouts(user_id)` - już istnieje, przyspiesza SELECT workouts użytkownika
- `workouts(start_time)` - już istnieje, przyspiesza filtrowanie po datach
- `workout_sets(workout_id, set_order)` - już istnieje, przyspiesza SELECT setów

### Optymalizacje zapytań
- **Single query dla szczegółów**: JOIN z workout_sets zamiast N+1 queries
- **COUNT optimization**: użycie `count: "exact", head: true` w Supabase
- **Date range filtering**: indeks na start_time przyspiesza WHERE
- **Paginacja**: OFFSET/LIMIT zamiast pobierania wszystkich danych

### Caching (przyszłość)
- Cache listy workouts użytkownika (invalidacja po CREATE/UPDATE/DELETE)
- Cache szczegółów workout (invalidacja po UPDATE/END)
- TTL: 5-10 minut dla listy, 1 minuta dla szczegółów aktywnego workout

### Paginacja
- Default: 20 workouts na stronę, max 100
- Dla bardzo aktywnych użytkowników: cursor-based pagination (przyszłość)

### Limity
- Brak limitu liczby workouts na użytkownika
- Brak limitu liczby setów w workout
- Walidacja rozmiarów: max 999 reps, max 999.99 kg
- Query timeout: max 30s dla długich zapytań

### Concurrent Updates
- PATCH na workout_sets: last-write-wins
- Możliwość dodania optimistic locking (version field) w przyszłości
- modified_at automatycznie aktualizowany przy każdym UPDATE

## 9. Kroki implementacji

### Krok 1: Zdefiniować Zod schematy (`src/lib/schemas/workout.ts`)
- `CreateWorkoutSchema` - walidacja dla POST /workouts
- `ListWorkoutsQuerySchema` - walidacja query params (from, to, page, limit)
- `WorkoutIdParamSchema` - walidacja UUID w path
- `EndWorkoutSchema` - walidacja dla POST /workouts/{id}/end
- `CreateWorkoutSetSchema` - walidacja dla POST /workouts/{id}/sets
- `UpdateWorkoutSetSchema` - walidacja dla PATCH /workouts/{id}/sets/{setId}
- `WorkoutSetIdParamsSchema` - walidacja workoutId i setId w path

### Krok 2: Utworzyć serwis (`src/lib/services/workout.ts`)
Implementacja następujących metod:
- `createWorkout(supabase, userId, command)` - tworzenie z start_time
- `listWorkouts(supabase, userId, filters)` - lista z filtrowaniem dat i paginacją
- `getWorkoutById(supabase, workoutId, userId)` - szczegóły z setami
- `endWorkout(supabase, workoutId, userId, endTime?)` - zakończenie z walidacją
- `createWorkoutSet(supabase, workoutId, userId, command)` - dodawanie seta
- `updateWorkoutSet(supabase, setId, workoutId, userId, command)` - PATCH seta
- Custom error class: `WorkoutError`

### Krok 3: Utworzyć API route - lista i tworzenie (`src/pages/api/workouts.ts`)
- Handler GET: lista workouts z filtrowaniem i paginacją
- Handler POST: tworzenie workout z opcjonalnym planId
- Weryfikacja JWT przez `supabase.auth.getUser()`
- Obsługa błędów: 400, 401, 404, 500

### Krok 4: Utworzyć API route - szczegóły (`src/pages/api/workouts/[id].ts`)
- Handler GET: szczegóły workout z setami i stats
- Walidacja UUID, ownership
- Obsługa błędów: 400, 401, 403, 404, 500

### Krok 5: Utworzyć API route - zakończenie (`src/pages/api/workouts/[id]/end.ts`)
- Handler POST: zakończenie workout z walidacją i summary
- Sprawdzenie czy już zakończony (409)
- Walidacja endTime >= startTime
- Kalkulacja stats: duration, totalSets, totalReps

### Krok 6: Utworzyć API route - dodawanie seta (`src/pages/api/workouts/[id]/sets.ts`)
- Handler POST: dodawanie seta do workout
- Walidacja workoutId, exerciseId, ownership
- completed domyślnie false

### Krok 7: Utworzyć API route - aktualizacja seta (`src/pages/api/workouts/[id]/sets/[setId].ts`)
- Handler PATCH: częściowa aktualizacja seta
- Walidacja że min. 1 pole podane
- Sprawdzenie ownership przez workoutId

### Krok 8: Utworzyć helper functions (opcjonalnie)
- `checkWorkoutOwnership(supabase, workoutId, userId)` - sprawdzenie ownership
- `validateExerciseExists(supabase, exerciseId)` - sprawdzenie istnienia
- `calculateWorkoutStats(supabase, workoutId)` - stats dla summary
- `parseDateRange(from, to)` - walidacja i parsing dat

### Krok 9: Build i weryfikacja
- Uruchomić `npm run build` i sprawdzić błędy kompilacji
- Zweryfikować TypeScript types
- Sprawdzić ESLint warnings

### Krok 10: Testy jednostkowe (opcjonalnie)
- Testy serwisu: `workout.test.ts`
- Testy walidacji Zod schemas
- Mock Supabase client

### Krok 11: Testy integracyjne (opcjonalnie)
- Testy endpointów API z prawdziwą bazą danych (test DB)
- Scenariusze: tworzenie, lista, filtrowanie, zakończenie, sety
- Test ownership i security

### Krok 12: Dokumentacja i przykłady
- Utworzenie `.ai/workouts-endpoint-examples.md` z przykładami curl
- Dokumentacja flow: start workout → add sets → end workout
- Przykłady filtrowania po datach

### Krok 13: Code review i deploy
- Pull request z opisem zmian
- Code review przez zespół
- Deploy na środowisko staging
- Testy manualne
- Deploy na produkcję
