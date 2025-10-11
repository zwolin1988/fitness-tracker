# API Endpoint Implementation Plan: Categories

## 1. Przegląd punktu końcowego
Plan wdrożenia zestawu endpointów REST dla zasobu **Category**, obejmujący:
- Publiczne operacje odczytu: `GET /categories`, `GET /categories/{id}`
- Operacje administracyjne (CRUD): `POST /admin/categories`, `PUT /admin/categories/{id}`, `DELETE /admin/categories/{id}`

Celem jest umożliwienie pobrania listy i szczegółów kategorii wszystkim użytkownikom oraz zarządzania kategoriami przez administratorów.

## 2. Szczegóły żądania

### GET /categories
- Metoda HTTP: GET
- URL: `/categories`
- Query parameters:
  - `page` (number, opcjonalne; domyślnie 1; musi być ≥1)
  - `limit` (number, opcjonalne; domyślnie 20; maks. 100)
- Body: brak

### GET /categories/{id}
- Metoda HTTP: GET
- URL: `/categories/{id}`
- Path parameters:
  - `id` (UUID, wymagane)
- Body: brak

### POST /admin/categories
- Metoda HTTP: POST
- URL: `/admin/categories`
- Headers: `Authorization: Bearer <token>`
- Body JSON:
  ```json
  { "name": string, "description"?: string, "imageUrl"?: string }
  ```

### PUT /admin/categories/{id}
- Metoda HTTP: PUT
- URL: `/admin/categories/{id}`
- Headers: `Authorization: Bearer <token>`
- Path parameters:
  - `id` (UUID)
- Body JSON:
  ```json
  { "name"?: string, "description"?: string, "imageUrl"?: string }
  ```

### DELETE /admin/categories/{id}
- Metoda HTTP: DELETE
- URL: `/admin/categories/{id}`
- Headers: `Authorization: Bearer <token>`
- Path parameters:
  - `id` (UUID)
- Body: brak

## 3. Wykorzystywane typy
- DTO:
  - `CategoryDTO` (id, name, description?, image_url?, created_at)
- Command:
  - `CreateCategoryCommand`
  - `UpdateCategoryCommand`

## 4. Szczegóły odpowiedzi

### GET /categories
- 200 OK
  ```json
  { "items": CategoryDTO[], "page": number, "totalPages": number }
  ```
- 400 Bad Request – nieprawidłowe parametry pagination
- 500 Internal Server Error

### GET /categories/{id}
- 200 OK
  ```json
  { "id": string, "name": string, "description"?: string, "imageUrl"?: string, "exercisesCount": number }
  ```
- 404 Not Found – brak kategorii o podanym id
- 500 Internal Server Error

### POST /admin/categories
- 201 Created
  ```json
  CategoryDTO
  ```
- 400 Bad Request – walidacja (brak name lub duplikat)
- 401 Unauthorized – brak/nieprawidłowy token lub rola != admin
- 409 Conflict – nazwa już istnieje
- 500 Internal Server Error

### PUT /admin/categories/{id}
- 200 OK
  ```json
  CategoryDTO
  ```
- 400 Bad Request – walidacja
- 401 Unauthorized
- 404 Not Found – brak kategorii
- 500 Internal Server Error

### DELETE /admin/categories/{id}
- 204 No Content
- 401 Unauthorized
- 404 Not Found
- 409 Conflict – istnieją ćwiczenia powiązane z tą kategorią
- 500 Internal Server Error

## 5. Przepływ danych
1. **Routing & Middleware** (src/middleware/index.ts)
   - Dla admin: sprawdzenie tokena i `role='admin'` w `profiles` (z context.locals.supabase).
2. **Kontrolery** (src/pages/api/...)
   - Parsowanie parametrów (Zod), wczytanie `supabase` z `context.locals`.
   - Wywołanie odpowiedniej metody w `CategoryService`.
3. **Service Layer** (src/lib/services/category.ts)
   - `listCategories(page, limit)` – SELECT z paginacją i countTotal.
   - `getCategoryById(id)` – SELECT + zliczenie `exercises`.
   - `createCategory(command: CreateCategoryCommand)` – INSERT z unikalnym index-em.
   - `updateCategory(id, command: UpdateCategoryCommand)` – UPDATE.
   - `deleteCategory(id)` – DELETE; przed usunięciem sprawdzenie powiązań w `exercises`.
4. **Database Client**
   - `SupabaseClient` z `src/db/supabase.client.ts` używany przez service.
   - RLS policies zapewniają SELECT/INSERT/UPDATE/DELETE zgodnie z rolą.
5. **Mapping**
   - Wyniki mapowane na `CategoryDTO`.

## 6. Względy bezpieczeństwa
- Uwierzytelnianie: JWT Bearer token.
- Autoryzacja: middleware + RLS w Supabase.
- Unikanie SQL Injection: użycie clienta Supabase.
- Ograniczenie wielkości parametrów (limit ≤100).
- Walidacja Zod – blokowanie niezgodnych struktur.

## 7. Obsługa błędów
- Centralny catch w handlerze:
  - Zwracanie odpowiednich kodów (400, 401, 404, 409, 500).
  - Logowanie błędów do konsoli lub systemu monitoringu.

## 8. Wydajność
- Indeksy na `categories(name)`, `categories(created_at)`.
- Paginacja offset/limit – dla dużych zbiorów rozważyć cursor pagination.
- Batch count minimalizowany (countTotal osobne zapytanie).

## 9. Kroki implementacji
1. Stworzenie Zod schematów requestów i parametrów w `src/lib/schemas/category.ts`.
2. Implementacja `CategoryService` w `src/lib/services/category.ts`.
3. Dodanie RLS policy dla admin w Supabase (jeśli nie ma):
   - INSERT/UPDATE/DELETE dla profili z `role='admin'`.
4. Utworzenie kontrolerów:
   - `src/pages/api/categories.ts` – GET list, GET by id;
   - `src/pages/api/admin/categories.ts` – POST;
   - `src/pages/api/admin/categories/[id].ts` – PUT, DELETE.
5. Integracja middleware w plikach .ts.
6. Pisanie testów end-to-end (Jest + msw/Playwright).
7. Aktualizacja dokumentacji OpenAPI/README.
8. Code review i deploy na staging.
