# API Endpoint Implementation Plan: Profile

## 1. Przegląd punktu końcowego
Zasób **Profile** umożliwia pobranie i aktualizację danych profilu zalogowanego użytkownika: imienia, wagi i wzrostu. Wykorzystuje RLS i JWT do zabezpieczenia. Dwa endpointy:
- **GET /profile** – odczyt istniejącego profilu.
- **PUT /profile** – aktualizacja danych profilu.

## 2. Szczegóły żądania

### GET /profile
- Metoda HTTP: GET
- URL: `/profile`
- Nagłówki:
  - `Authorization: Bearer <token>`
- Parametry URL: brak
- Body: brak

### PUT /profile
- Metoda HTTP: PUT
- URL: `/profile`
- Nagłówki:
  - `Authorization: Bearer <token>`
- Body JSON:
  ```json
  {
    "name": string,
    "weight": number,
    "height": number
  }
  ```
- Walidacja:
  - `name`: wymagane, niepuste
  - `weight`: number > 0
  - `height`: number > 0

## 3. Wykorzystywane typy
- DTO:
  - `ProfileDTO` (id, name, weight, height, updated_at)
- Command:
  - `UpdateProfileCommand` (name, weight, height)

## 4. Szczegóły odpowiedzi

### GET /profile
- 200 OK
  ```json
  ProfileDTO
  ```
- 401 Unauthorized – brak/nieprawidłowy token
- 404 Not Found – brak profilu w bazie
- 500 Internal Server Error

### PUT /profile
- 200 OK
  ```json
  ProfileDTO
  ```
- 400 Bad Request – błąd walidacji danych wejściowych
- 401 Unauthorized – brak/nieprawidłowy token
- 404 Not Found – brak profilu (nieoczekiwana sytuacja)
- 500 Internal Server Error

## 5. Przepływ danych
1. **Middleware** (`src/middleware/index.ts`): weryfikuje token JWT, inicjalizuje `context.locals.supabase` z sesją.
2. **Handler** (`src/pages/api/profile.ts`):
   - Parsuje metodę (GET/PUT).
   - W GET wywołuje `ProfileService.getProfile(userId)`.
   - W PUT waliduje body (Zod) i wywołuje `ProfileService.updateProfile(userId, command)`.
3. **Service Layer** (`src/lib/services/profile.ts`):
   - `getProfile(userId)` – SELECT z tabeli `profiles` przez `SupabaseClient`.
   - `updateProfile(userId, cmd)` – UPDATE pól i zwraca zaktualizowany wiersz.
4. **DB Client**: użycie `SupabaseClient` typu z `src/db/supabase.client.ts` przez context.locals.
5. **Mapping**: mapowanie wiersza DB na `ProfileDTO`.

## 6. Względy bezpieczeństwa
- JWT Bearer w nagłówku, sprawdzane w middleware.
- RLS: `profiles` mają politykę `auth.uid() = user_id`.
- Unikanie ujawniania `role` i innych pól.
- Walidacja Zod chroni przed nieprawidłowymi typami.
- Użycie query buildera Supabase zapobiega SQL injection.

## 7. Obsługa błędów
- **400**: Zweryfikowane przez Zod (niewłaściwy payload).
- **401**: Brak/nieprawidłowy token (middleware).
- **404**: Brak profilu (GET lub niespodziewane w PUT).
- **500**: Nieobsłużone wyjątki – log w konsoli.

## 8. Rozważania dotyczące wydajności
- Operacje pojedynczego wiersza na kluczu głównym są szybkie.
- Indeks na `profiles(user_id)` już istnieje z klucza PK.
- Przyrostowa aktualizacja tylko zmienionych pól.
- Opcjonalny cache po stronie CDN dla GET.

## 9. Kroki implementacji
1. Zdefiniować Zod schematy w `src/lib/schemas/profile.ts`.
2. Utworzyć `src/lib/services/profile.ts` z metodami `getProfile` i `updateProfile`.
3. Dodać API route: `src/pages/api/profile.ts` obsługujące GET i PUT.
4. Konfiguracja middleware: upewnić się, że `context.locals.supabase` zawiera `user`.
5. Ustawić RLS w Supabase (enable policy dla `profiles`).
6. Dodać jednostkowe testy serwisu i integracyjne dla endpointów (Jest + msw).
7. Zaktualizować dokumentację OpenAPI/README.
8. Code review i deploy na staging.