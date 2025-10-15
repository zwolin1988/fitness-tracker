# API Endpoint Implementation Plan: GET /categories

## 1. Przegląd punktu końcowego
`GET /categories` zwraca paginowaną listę kategorii ćwiczeń dostępnych dla wszystkich użytkowników. Nie wymaga uprawnień administratora.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/categories`
- Parametry URL:
  - Wymagane: brak
  - Opcjonalne:
    - `page` (number) – numer strony, domyślnie 1
    - `limit` (number) – liczba elementów na stronę, domyślnie 20, max 100
- Body request: brak

## 3. Wykorzystywane typy
- DTO:
  - `CategoryDTO` – pola: `id`, `name`, `description?`, `image_url?`, `created_at`
- Command models: brak (operacja odczytu)

## 4. Szczegóły odpowiedzi
- 200 OK
  ```json
  {
    "items": CategoryDTO[],
    "page": number,
    "totalPages": number
  }
  ```
- 400 Bad Request – nieprawidłowe parametry `page` lub `limit`
- 500 Internal Server Error – błąd po stronie serwera

## 5. Przepływ danych
1. Astro API route: `src/pages/api/categories.astro` lub `.ts`
2. Middleware (src/middleware/index.ts) sprawdza sesję opcjonalnie, ale publiczny dostęp nie wymaga JWT.
3. Handler odczytuje `page` i `limit` z query params, parser Zod lub manualnie.
4. Wywołanie serwisu: `CategoryService.listCategories(page, limit)`
5. W `CategoryService` (src/lib/services/category.ts):
   - Używa `SupabaseClient` z `context.locals.supabase`.
   - Wykonuje kwerendę do tabeli `categories` z RLS (SELECT).
   - Liczy totalRows (count) oraz pobiera `limit` rekordów z offsetem `(page - 1) * limit`.
   - Mapuje pola `image_url` (`image_url` w DB) oraz `created_at`.
6. Serwis zwraca obiekt `{ items, page, totalPages }`.
7. Handler zwraca odpowiedź JSON.

## 6. Względy bezpieczeństwa
- RLS policy na `categories` pozwala SELECT każdemu.
- Brak operacji modyfikacji, nie wymaga uwierzytelniania.
- Sanityzacja i walidacja `page` i `limit` (Zod schema).
- Unikanie ujawniania innych kolumn niż zdefiniowane w `CategoryDTO`.

## 7. Obsługa błędów
| Kod  | Warunek                                             |
|------|------------------------------------------------------|
| 400  | `page` lub `limit` poza zakresem (np. <1, >100)      |
| 500  | Błąd komunikacji z bazą lub nieoczekiwany wyjątek    |

W razie błędu logować szczegóły w konsoli serwera.

## 8. Rozważania dotyczące wydajności
- Indeks na `categories(created_at)` przyśpieszy sortowanie.
- Paginacja z offset może być niewydajna przy dużych offsetach – rozważyć cursors.
- Ograniczyć `limit` do rozsądnych wartości (max 100).

## 9. Kroki implementacji
1. Utworzenie Zod schema dla parametrów query: `page`, `limit` (src/lib/schemas/category.ts).
2. Stworzenie pliku `src/lib/services/category.ts` z metodą `listCategories`.
3. Dodanie Astro API route: `src/pages/api/categories.ts`:
   - Import schematu i serwisu.
   - Walidacja query.
   - Wywołanie serwisu i zwrócenie JSON.
4. Konfiguracja RLS w Supabase (jeśli nieaktywna): SELECT policy dla `categories`.
5. Dodanie testów integracyjnych API (Jest + msw lub Playwright API).
6. Dokumentacja endpointu w README lub Swagger/OpenAPI.
