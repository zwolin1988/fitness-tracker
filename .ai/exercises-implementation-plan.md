# API Endpoint Implementation Plan: Exercises

## 1. Przegląd punktów końcowych

Zasób **Exercises** umożliwia przeglądanie, filtrowanie i zarządzanie ćwiczeniami. Zawiera endpointy publiczne (dostępne dla wszystkich użytkowników) oraz admin-only (tylko dla administratorów).

### Endpointy publiczne:
- **GET /api/exercises** – lista ćwiczeń z filtrowaniem i paginacją
- **GET /api/exercises/{id}** – szczegóły pojedynczego ćwiczenia z informacją o kategorii

### Endpointy admin:
- **POST /api/admin/exercises** – tworzenie nowego ćwiczenia (admin only)
- **PUT /api/admin/exercises/{id}** – aktualizacja ćwiczenia (admin only)
- **DELETE /api/admin/exercises/{id}** – usuwanie ćwiczenia (admin only)

## 2. Szczegóły żądań

### GET /api/exercises
- Metoda HTTP: GET
- URL: `/api/exercises`
- Nagłówki: brak wymaganych (endpoint publiczny)
- Query params:
  - `categoryId` (uuid, optional) - filtrowanie po kategorii
  - `difficulty` (string, optional) - filtrowanie po poziomie trudności
  - `page` (number, optional, default: 1, min: 1)
  - `limit` (number, optional, default: 20, min: 1, max: 100)
- Walidacja:
  - `categoryId` musi być poprawnym UUID (jeśli podany)
  - `difficulty` musi być niepustym stringiem (jeśli podany)
  - `page` >= 1
  - `limit` między 1 a 100

### GET /api/exercises/{id}
- Metoda HTTP: GET
- URL: `/api/exercises/{id}`
- Nagłówki: brak wymaganych
- Parametry URL: `id` (uuid)
- Walidacja:
  - `id` musi być poprawnym UUID

### POST /api/admin/exercises
- Metoda HTTP: POST
- URL: `/api/admin/exercises`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
- Body JSON:
  ```json
  {
    "name": string,
    "description": string (optional),
    "icon_svg": string (optional),
    "difficulty": string,
    "category_id": string (uuid)
  }
  ```
- Walidacja:
  - `name`: wymagane, min 1 znak, max 200 znaków
  - `description`: opcjonalne, max 1000 znaków
  - `icon_svg`: opcjonalne, max 10000 znaków (SVG markup)
  - `difficulty`: wymagane, niepusty string
  - `category_id`: wymagane, poprawny UUID, kategoria musi istnieć

### PUT /api/admin/exercises/{id}
- Metoda HTTP: PUT
- URL: `/api/admin/exercises/{id}`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
- Parametry URL: `id` (uuid)
- Body JSON:
  ```json
  {
    "name": string (optional),
    "description": string (optional),
    "icon_svg": string (optional),
    "difficulty": string (optional),
    "category_id": string (uuid, optional)
  }
  ```
- Walidacja:
  - Wszystkie pola opcjonalne, ale przynajmniej jedno musi być podane
  - Walidacja pól jak w POST (gdy podane)

### DELETE /api/admin/exercises/{id}
- Metoda HTTP: DELETE
- URL: `/api/admin/exercises/{id}`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagany)
- Parametry URL: `id` (uuid)
- Body: brak

## 3. Wykorzystywane typy

- DTO:
  - `ExerciseDTO` (id, name, description, icon_svg, difficulty, category_id, created_at)
- Command:
  - `CreateExerciseCommand` (name, description, icon_svg, difficulty, category_id)
  - `UpdateExerciseCommand` (name?, description?, icon_svg?, difficulty?, category_id?)

## 4. Szczegóły odpowiedzi

### GET /api/exercises
- 200 OK
  ```json
  {
    "items": [ExerciseDTO, ...],
    "page": number,
    "totalPages": number
  }
  ```
- 400 Bad Request – błędne query params
- 500 Internal Server Error

### GET /api/exercises/{id}
- 200 OK
  ```json
  {
    ...ExerciseDTO,
    "category": CategoryDTO
  }
  ```
- 400 Bad Request – nieprawidłowy UUID
- 404 Not Found – ćwiczenie nie istnieje
- 500 Internal Server Error

### POST /api/admin/exercises
- 201 Created
  ```json
  ExerciseDTO
  ```
- 400 Bad Request – błąd walidacji
- 401 Unauthorized – brak/nieprawidłowy token
- 403 Forbidden – użytkownik nie jest adminem
- 404 Not Found – kategoria nie istnieje
- 409 Conflict – ćwiczenie o tej nazwie już istnieje
- 500 Internal Server Error

### PUT /api/admin/exercises/{id}
- 200 OK
  ```json
  ExerciseDTO
  ```
- 400 Bad Request – błąd walidacji
- 401 Unauthorized – brak/nieprawidłowy token
- 403 Forbidden – użytkownik nie jest adminem
- 404 Not Found – ćwiczenie nie istnieje
- 409 Conflict – ćwiczenie o tej nazwie już istnieje
- 500 Internal Server Error

### DELETE /api/admin/exercises/{id}
- 204 No Content
- 401 Unauthorized – brak/nieprawidłowy token
- 403 Forbidden – użytkownik nie jest adminem
- 404 Not Found – ćwiczenie nie istnieje
- 409 Conflict – ćwiczenie jest używane w planach/workoutach
- 500 Internal Server Error

## 5. Przepływ danych

1. **Middleware**: weryfikuje token JWT (dla admin endpointów), inicjalizuje `context.locals.supabase`
2. **Handler**:
   - Parsuje parametry (query/path/body)
   - Dla admin endpointów: sprawdza czy użytkownik ma rolę 'admin'
   - Waliduje dane przez schemat Zod
   - Wywołuje odpowiednią metodę serwisu
3. **Service Layer**:
   - `listExercises(supabase, filters, page, limit)` - lista z filtrowaniem
   - `getExerciseById(supabase, id)` - szczegóły z kategorią
   - `createExercise(supabase, command)` - tworzenie, sprawdzenie duplikatów i istnienia kategorii
   - `updateExercise(supabase, id, command)` - aktualizacja, sprawdzenie duplikatów
   - `deleteExercise(supabase, id)` - usuwanie, sprawdzenie czy nie jest używane
4. **DB Client**: użycie `SupabaseClient` z `context.locals`
5. **Mapping**: wiersz DB → DTO

## 6. Względy bezpieczeństwa

- **Admin endpointy**: sprawdzenie `role = 'admin'` w profilu użytkownika
- **JWT**: weryfikacja przez middleware
- **Walidacja**: Zod chroni przed nieprawidłowymi typami
- **SQL Injection**: query builder Supabase
- **Foreign Keys**: sprawdzenie istnienia kategorii przed INSERT/UPDATE
- **Cascade**: sprawdzenie użycia w planach/workoutach przed DELETE

## 7. Obsługa błędów

- **400**: Zweryfikowane przez Zod (niewłaściwy payload/params)
- **401**: Brak/nieprawidłowy token (middleware)
- **403**: Użytkownik nie ma roli 'admin'
- **404**: Ćwiczenie/kategoria nie istnieje
- **409**: Duplikat nazwy lub ćwiczenie używane
- **500**: Nieobsłużone wyjątki

## 8. Rozważania dotyczące wydajności

- Indeks na `exercises(category_id)` dla szybkich filtrów
- Indeks na `exercises(difficulty)` dla filtrowania
- Paginacja limituje wyniki
- Join z kategorią tylko w GET /{id}
- Opcjonalny cache dla listy ćwiczeń

## 9. Kroki implementacji

1. Zdefiniować Zod schematy w `src/lib/schemas/exercise.ts`
2. Utworzyć `src/lib/services/exercise.ts` z metodami CRUD
3. Dodać helper `checkIsAdmin(supabase, userId)` w `src/lib/auth/admin.ts`
4. Dodać publiczne API routes:
   - `src/pages/api/exercises.ts` (GET lista)
   - `src/pages/api/exercises/[id].ts` (GET szczegóły)
5. Dodać admin API routes:
   - `src/pages/api/admin/exercises.ts` (POST)
   - `src/pages/api/admin/exercises/[id].ts` (PUT, DELETE)
6. Dodać testy jednostkowe i integracyjne
7. Zaktualizować dokumentację
8. Code review i deploy
