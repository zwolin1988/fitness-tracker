# Plan implementacji widoku Kategorie Ćwiczeń

## 1. Przegląd

Widok "Kategorie Ćwiczeń" stanowi punkt wejścia do przeglądu bazy ćwiczeń w aplikacji Fitness Tracker. Głównym celem jest prezentacja kategorii ćwiczeń w postaci intuicyjnego gridu z obrazkami, który umożliwia szybką nawigację do przefiltrowanych list ćwiczeń. Widok implementuje paginację i jest w pełni responsywny, dostosowując się do urządzeń mobilnych, tabletów i desktopów.

Widok jest dostępny dla wszystkich zalogowanych użytkowników jako read-only interface. Administratorzy mają dodatkowy Floating Action Button (FAB) umożliwiający szybkie przejście do panelu zarządzania kategoriami.

## 2. Routing widoku

**Ścieżka**: `/categories`

**Dostęp**: Zalogowani użytkownicy (authenticated users)

**Layout**: Wykorzystuje główny layout aplikacji `<MainLayout>` z nawigacją

**Meta informacje**:
- Tytuł strony: "Kategorie Ćwiczeń - Fitness Tracker"
- Opis: "Przeglądaj kategorie ćwiczeń i wybierz interesujący Cię obszar treningu"

## 3. Struktura komponentów

```
CategoriesView (src/pages/categories/index.astro)
├── PageHeader
│   ├── h1 (Tytuł strony)
│   └── p (Opis/instrukcje)
├── CategoriesGrid (React Component)
│   ├── LoadingState (Skeleton Grid)
│   ├── ErrorState
│   ├── EmptyState
│   └── CategoryCard[] (lista kart kategorii)
│       ├── CategoryImage
│       ├── CategoryName
│       ├── CategoryDescription
│       └── ExercisesCount Badge
├── Pagination (React Component)
│   ├── PreviousButton
│   ├── PageNumbers[]
│   └── NextButton
└── AdminFAB (conditional, React Component)
    └── PlusIcon + Tooltip
```

### Hierarchia komponentów:

1. **CategoriesView** (Astro Page)
   - Komponent główny strony, server-side rendered
   - Pobiera początkowe dane na serwerze
   - Zawiera komponenty React z dyrektywą `client:load`

2. **CategoriesGrid** (React Client Component)
   - Zarządza stanem kategorii i paginacją
   - Obsługuje fetchowanie danych z API
   - Renderuje grid z kartami kategorii
   - Wyświetla stany: loading, error, empty

3. **CategoryCard** (React Component)
   - Reprezentuje pojedynczą kategorię
   - Klikalny, nawiguje do `/categories/{id}` lub `/exercises?categoryId={id}`
   - Responsywny design (adjustuje się do grid)

4. **Pagination** (React Component)
   - Kontroluje nawigację między stronami
   - Wyświetla numery stron i przyciski prev/next
   - Komunikuje się z CategoriesGrid przez callback

5. **AdminFAB** (React Component - conditional)
   - Wyświetlany tylko dla użytkowników z rolą 'admin'
   - Floating action button w prawym dolnym rogu
   - Nawiguje do `/admin/categories`

## 4. Szczegóły komponentów

### 4.1. CategoriesView (Astro Page)

**Opis komponentu**: Główna strona widoku kategorii. Server-side rendered strona Astro, która inicjalizuje widok i przekazuje dane do komponentów React. Odpowiada za SSR inicial data i routing.

**Główne elementy**:
```astro
---
// Frontmatter: server-side logic
import Layout from '@/layouts/Layout.astro';
import CategoriesGrid from '@/components/categories/CategoriesGrid';
// Initial data fetch (optional SSR)
---

<Layout title="Kategorie Ćwiczeń" showNav>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <header class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Kategorie Ćwiczeń</h1>
      <p class="text-muted-foreground">
        Wybierz kategorię aby zobaczyć listę ćwiczeń
      </p>
    </header>

    <!-- Main Content: React Grid Component -->
    <CategoriesGrid client:load />
  </div>
</Layout>
```

**Obsługiwane interakcje**:
- Brak bezpośrednich interakcji (delegowane do child components)

**Obsługiwana walidacja**:
- Brak walidacji na tym poziomie

**Typy**:
- Brak własnych typów (używa Layout props)

**Propsy**:
- Brak propsów (strona główna)

---

### 4.2. CategoriesGrid (React Component)

**Opis komponentu**: Główny komponent React zarządzający wyświetlaniem gridu kategorii. Odpowiada za fetchowanie danych z API, zarządzanie stanem (loading, error, data), paginację oraz renderowanie kart kategorii. Implementuje skeleton loading state i error handling zgodnie z wytycznymi UX.

**Główne elementy**:
```tsx
// Conditional rendering based on state
{isLoading && <SkeletonGrid />}
{error && <ErrorState message={error} onRetry={refetch} />}
{!isLoading && !error && categories.length === 0 && <EmptyState />}
{!isLoading && !error && categories.length > 0 && (
  <>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map(category => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  </>
)}
```

**Obsługiwane interakcje**:
- Zmiana strony paginacji (page change)
- Retry po błędzie API
- Kliknięcie w kartę kategorii (przekazywane do CategoryCard)

**Obsługiwana walidacja**:
- Walidacja page number (musi być >= 1)
- Walidacja response z API (sprawdzenie struktury danych)

**Typy**:
- `CategoriesGridState` (ViewModel)
- `CategoryDTO` (z types.ts)
- `ListCategoriesResponse` (z services/category.ts)

**Propsy**:
```tsx
interface CategoriesGridProps {
  initialPage?: number; // opcjonalny initial page (default: 1)
}
```

---

### 4.3. CategoryCard (React Component)

**Opis komponentu**: Komponent reprezentujący pojedynczą kartę kategorii w gridzie. Wyświetla obrazek kategorii, nazwę, opis oraz liczbę ćwiczeń przypisanych do kategorii. Jest klikalna i nawiguje użytkownika do listy ćwiczeń w danej kategorii. Implementuje hover effects i accessible markup.

**Główne elementy**:
```tsx
<div class="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
  {/* Image Section */}
  <div class="aspect-video w-full overflow-hidden bg-muted">
    {category.image_url ? (
      <img
        src={category.image_url}
        alt={category.name}
        class="h-full w-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />
    ) : (
      <div class="flex h-full items-center justify-center text-6xl">
        📋 {/* Default icon */}
      </div>
    )}
  </div>

  {/* Content Section */}
  <div class="p-4">
    <h3 class="text-xl font-semibold mb-2 line-clamp-1">
      {category.name}
    </h3>
    <p class="text-sm text-muted-foreground line-clamp-2 mb-3">
      {category.description || 'Brak opisu'}
    </p>

    {/* Exercises Count Badge */}
    <div class="flex items-center gap-2 text-xs text-muted-foreground">
      <Dumbbell class="h-4 w-4" />
      <span>{exercisesCount || 0} ćwiczeń</span>
    </div>
  </div>
</div>
```

**Obsługiwane interakcje**:
- `onClick`: Nawigacja do `/exercises?categoryId={category.id}` lub `/categories/{category.id}`
- `onKeyDown`: Obsługa Enter/Space dla accessibility

**Obsługiwana walidacja**:
- Walidacja category.id przed nawigacją (UUID format check)

**Typy**:
- `CategoryDTO` (props)
- `CategoryCardViewModel` (extends CategoryDTO z exercisesCount)

**Propsy**:
```tsx
interface CategoryCardProps {
  category: CategoryDTO; // dane kategorii z API
  exercisesCount?: number; // opcjonalna liczba ćwiczeń (może być fetchowana osobno lub dołączona do response)
  onClick?: (categoryId: string) => void; // optional custom handler
}
```

---

### 4.4. Pagination (React Component)

**Opis komponentu**: Komponent nawigacji paginacji. Wyświetla przyciski Previous/Next oraz numerację stron. Umożliwia użytkownikowi nawigację między stronami kategorii. Implementuje smart page display (np. 1, 2, 3, ..., 10 dla wielu stron) i disabled states.

**Główne elementy**:
```tsx
<nav aria-label="Nawigacja po stronach" class="flex items-center justify-center gap-2 mt-8">
  {/* Previous Button */}
  <Button
    variant="outline"
    disabled={currentPage === 1}
    onClick={() => onPageChange(currentPage - 1)}
  >
    <ChevronLeft class="h-4 w-4 mr-1" />
    Poprzednia
  </Button>

  {/* Page Numbers */}
  <div class="flex gap-1">
    {pageNumbers.map(page => (
      page === '...' ? (
        <span class="px-3 py-2">...</span>
      ) : (
        <Button
          variant={page === currentPage ? 'default' : 'ghost'}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      )
    ))}
  </div>

  {/* Next Button */}
  <Button
    variant="outline"
    disabled={currentPage === totalPages}
    onClick={() => onPageChange(currentPage + 1)}
  >
    Następna
    <ChevronRight class="h-4 w-4 ml-1" />
  </Button>
</nav>

{/* Info Text */}
<p class="text-center text-sm text-muted-foreground mt-2">
  Strona {currentPage} z {totalPages}
</p>
```

**Obsługiwane interakcje**:
- `onPageChange(page: number)`: Callback wywoływany przy zmianie strony
- Kliknięcie Previous/Next buttons
- Kliknięcie konkretnego numeru strony

**Obsługiwana walidacja**:
- Walidacja page number (1 <= page <= totalPages)
- Disable buttons gdy na pierwszej/ostatniej stronie

**Typy**:
- `PaginationProps` (interface dla props)

**Propsy**:
```tsx
interface PaginationProps {
  currentPage: number; // aktualna strona (1-indexed)
  totalPages: number; // łączna liczba stron
  onPageChange: (page: number) => void; // callback przy zmianie strony
  maxVisiblePages?: number; // max liczba widocznych numerów stron (default: 7)
}
```

---

### 4.5. AdminFAB (React Component)

**Opis komponentu**: Floating Action Button widoczny tylko dla administratorów. Umożliwia szybki dostęp do panelu administracyjnego kategorii. Komponent jest pozycjonowany fixed w prawym dolnym rogu ekranu z odpowiednimi marginesami. Implementuje tooltip i accessible markup.

**Główne elementy**:
```tsx
{userRole === 'admin' && (
  <div class="fixed bottom-6 right-6 z-50">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            class="h-14 w-14 rounded-full shadow-lg"
            style={{ backgroundColor: 'var(--orange)' }} // admin accent color
            onClick={() => navigate('/admin/categories')}
          >
            <Plus class="h-6 w-6" />
            <span class="sr-only">Zarządzaj kategoriami</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Zarządzaj kategoriami</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
)}
```

**Obsługiwane interakcje**:
- `onClick`: Nawigacja do `/admin/categories`
- `onHover`: Pokazanie tooltipa

**Obsługiwana walidacja**:
- Conditional rendering based on userRole === 'admin'

**Typy**:
- Brak własnych typów

**Propsy**:
```tsx
interface AdminFABProps {
  userRole: string | null; // rola użytkownika (z Zustand store lub context)
}
```

---

### 4.6. SkeletonGrid (React Component)

**Opis komponentu**: Komponent skeleton loading state wyświetlany podczas ładowania danych z API. Prezentuje placeholder grid z 8-12 kartami skeleton aby użytkownik widział layout przed załadowaniem danych. Implementuje pulse animation.

**Główne elementy**:
```tsx
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {Array.from({ length: 8 }).map((_, index) => (
    <div key={index} class="animate-pulse">
      <div class="aspect-video w-full bg-muted rounded-t-lg" />
      <div class="p-4 space-y-3">
        <div class="h-6 bg-muted rounded w-3/4" />
        <div class="h-4 bg-muted rounded w-full" />
        <div class="h-4 bg-muted rounded w-2/3" />
        <div class="h-4 bg-muted rounded w-1/3" />
      </div>
    </div>
  ))}
</div>
```

**Obsługiwane interakcje**: Brak (static skeleton)

**Obsługiwana walidacja**: Brak

**Typy**: Brak

**Propsy**:
```tsx
interface SkeletonGridProps {
  count?: number; // liczba skeleton cards (default: 8)
}
```

---

### 4.7. ErrorState (React Component)

**Opis komponentu**: Komponent wyświetlany gdy wystąpi błąd podczas fetchowania danych. Prezentuje friendly error message oraz przycisk retry. Obsługuje różne typy błędów (network, server, authentication).

**Główne elementy**:
```tsx
<div class="flex flex-col items-center justify-center py-12 px-4 text-center">
  <AlertCircle class="h-16 w-16 text-destructive mb-4" />
  <h3 class="text-lg font-semibold mb-2">Wystąpił błąd</h3>
  <p class="text-muted-foreground mb-6 max-w-md">
    {message || 'Nie udało się załadować kategorii. Sprawdź połączenie internetowe i spróbuj ponownie.'}
  </p>
  <Button onClick={onRetry} variant="default">
    <RefreshCw class="h-4 w-4 mr-2" />
    Spróbuj ponownie
  </Button>
</div>
```

**Obsługiwane interakcje**:
- `onRetry`: Callback do ponownego fetchowania danych

**Obsługiwana walidacja**: Brak

**Typy**:
- `ErrorStateProps`

**Propsy**:
```tsx
interface ErrorStateProps {
  message?: string; // opcjonalny custom error message
  onRetry: () => void; // callback do retry
  errorType?: 'network' | 'server' | 'auth'; // typ błędu dla różnych komunikatów
}
```

---

### 4.8. EmptyState (React Component)

**Opis komponentu**: Komponent wyświetlany gdy API zwraca pustą listę kategorii. Prezentuje friendly message i opcjonalnie CTA dla admina do dodania pierwszej kategorii.

**Główne elementy**:
```tsx
<div class="flex flex-col items-center justify-center py-12 px-4 text-center">
  <div class="text-6xl mb-4">📋</div>
  <h3 class="text-lg font-semibold mb-2">Brak kategorii</h3>
  <p class="text-muted-foreground mb-6 max-w-md">
    Nie znaleziono żadnych kategorii ćwiczeń.
    {userRole === 'admin' && ' Dodaj pierwszą kategorię aby rozpocząć.'}
  </p>
  {userRole === 'admin' && (
    <Button onClick={() => navigate('/admin/categories')}>
      <Plus class="h-4 w-4 mr-2" />
      Dodaj kategorię
    </Button>
  )}
</div>
```

**Obsługiwane interakcje**:
- Opcjonalny przycisk dla admina nawigujący do `/admin/categories`

**Obsługiwana walidacja**: Brak

**Typy**: Brak

**Propsy**:
```tsx
interface EmptyStateProps {
  userRole?: string | null; // rola użytkownika
}
```

## 5. Typy

### 5.1. DTO Types (z types.ts)

```typescript
// CategoryDTO - główny typ kategorii z API
export interface CategoryDTO {
  id: string; // UUID
  name: string; // nazwa kategorii
  description?: string | null; // opcjonalny opis
  image_url?: string | null; // URL obrazka kategorii
  created_at: string; // timestamp utworzenia
}
```

### 5.2. API Response Types (z services/category.ts)

```typescript
// Typ odpowiedzi z API dla listy kategorii
export interface ListCategoriesResponse {
  items: CategoryDTO[]; // lista kategorii
  page: number; // aktualna strona (1-indexed)
  totalPages: number; // łączna liczba stron
}

// Typ odpowiedzi dla pojedynczej kategorii z liczbą ćwiczeń
export interface CategoryDetailResponse extends CategoryDTO {
  exercisesCount: number; // liczba ćwiczeń w kategorii
}
```

### 5.3. ViewModel Types (nowe typy dla widoku)

```typescript
// Stan komponentu CategoriesGrid
export interface CategoriesGridState {
  categories: CategoryDTO[]; // lista kategorii do wyświetlenia
  page: number; // aktualna strona
  totalPages: number; // łączna liczba stron
  isLoading: boolean; // czy trwa ładowanie
  error: string | null; // komunikat błędu (jeśli wystąpił)
}

// ViewModel dla CategoryCard z dodatkową informacją o liczbie ćwiczeń
export interface CategoryCardViewModel extends CategoryDTO {
  exercisesCount?: number; // opcjonalna liczba ćwiczeń (może być fetchowana osobno)
}

// Typ dla parametrów query string (pagination)
export interface CategoriesQueryParams {
  page?: string | number; // numer strony
  limit?: string | number; // liczba elementów na stronie (default: 20)
}

// Typ dla stanu paginacji
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

### 5.4. Hook Types

```typescript
// Return type dla custom hook useCategories
export interface UseCategoriesReturn {
  categories: CategoryDTO[];
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

// Parametry dla hook useCategories
export interface UseCategoriesParams {
  initialPage?: number;
  limit?: number;
}
```

## 6. Zarządzanie stanem

### 6.1. Local Component State (useState)

Widok wykorzystuje local state w komponencie `CategoriesGrid`:

```typescript
// Stan lokalny w CategoriesGrid
const [categories, setCategories] = useState<CategoryDTO[]>([]);
const [page, setPage] = useState<number>(1);
const [totalPages, setTotalPages] = useState<number>(0);
const [isLoading, setIsLoading] = useState<boolean>(true);
const [error, setError] = useState<Error | null>(null);
```

### 6.2. Custom Hook: useCategories

Rekomendowane jest utworzenie custom hook `useCategories` który enkapsuluje logikę fetchowania danych i zarządzania stanem:

```typescript
// src/components/hooks/useCategories.ts
export function useCategories({
  initialPage = 1,
  limit = 20
}: UseCategoriesParams = {}): UseCategoriesReturn {
  const [state, setState] = useState<CategoriesGridState>({
    categories: [],
    page: initialPage,
    totalPages: 0,
    isLoading: true,
    error: null,
  });

  // Fetch function
  const fetchCategories = useCallback(async (pageNumber: number) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(
        `/api/categories?page=${pageNumber}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data: ListCategoriesResponse = await response.json();

      setState({
        categories: data.items,
        page: data.page,
        totalPages: data.totalPages,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Unknown error'),
      }));
    }
  }, [limit]);

  // Initial fetch
  useEffect(() => {
    fetchCategories(initialPage);
  }, [fetchCategories, initialPage]);

  // Navigation functions
  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= state.totalPages) {
      fetchCategories(newPage);
    }
  }, [fetchCategories, state.totalPages]);

  const nextPage = useCallback(() => {
    goToPage(state.page + 1);
  }, [goToPage, state.page]);

  const prevPage = useCallback(() => {
    goToPage(state.page - 1);
  }, [goToPage, state.page]);

  const refetch = useCallback(() => {
    fetchCategories(state.page);
  }, [fetchCategories, state.page]);

  return {
    categories: state.categories,
    page: state.page,
    totalPages: state.totalPages,
    isLoading: state.isLoading,
    error: state.error,
    refetch,
    goToPage,
    nextPage,
    prevPage,
  };
}
```

### 6.3. Global State (Zustand - optional)

Jeśli potrzebne jest cachowanie kategorii lub dostęp z innych komponentów, można rozważyć Zustand store:

```typescript
// src/stores/categoriesStore.ts
interface CategoriesStore {
  categoriesCache: Map<number, ListCategoriesResponse>;
  setCategories: (page: number, data: ListCategoriesResponse) => void;
  getCategories: (page: number) => ListCategoriesResponse | undefined;
  clearCache: () => void;
}

export const useCategoriesStore = create<CategoriesStore>((set, get) => ({
  categoriesCache: new Map(),

  setCategories: (page, data) => {
    const cache = new Map(get().categoriesCache);
    cache.set(page, data);
    set({ categoriesCache: cache });
  },

  getCategories: (page) => {
    return get().categoriesCache.get(page);
  },

  clearCache: () => {
    set({ categoriesCache: new Map() });
  },
}));
```

### 6.4. URL State (Query Parameters)

Stan strony powinien być synchronizowany z URL query parameters:

```typescript
// Odczyt z URL
const searchParams = new URLSearchParams(window.location.search);
const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);

// Update URL przy zmianie strony
const updateUrl = (newPage: number) => {
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set('page', newPage.toString());
  window.history.pushState({}, '', newUrl.toString());
};
```

## 7. Integracja API

### 7.1. Endpoint

**URL**: `GET /api/categories`

**Query Parameters**:
- `page` (optional): Numer strony (1-indexed), default: 1
- `limit` (optional): Liczba elementów na stronie (1-100), default: 20

**Request Headers**:
```
Authorization: Bearer {JWT_TOKEN} // automatycznie przez Supabase client
Content-Type: application/json
```

### 7.2. Request Type

```typescript
interface GetCategoriesRequest {
  page?: number; // 1-indexed, min: 1
  limit?: number; // min: 1, max: 100, default: 20
}
```

### 7.3. Response Type

**Success Response (200)**:
```typescript
interface GetCategoriesSuccessResponse {
  items: CategoryDTO[]; // lista kategorii
  page: number; // aktualna strona
  totalPages: number; // łączna liczba stron
}
```

**Error Responses**:

- **400 Bad Request**: Nieprawidłowe parametry query
```typescript
{
  error: "Invalid query parameters",
  details: {
    page?: string[], // błędy walidacji dla page
    limit?: string[] // błędy walidacji dla limit
  }
}
```

- **401 Unauthorized**: Brak autoryzacji
```typescript
{
  error: "Unauthorized"
}
```

- **500 Internal Server Error**: Błąd serwera
```typescript
{
  error: "Internal server error"
}
```

### 7.4. Implementation Example

```typescript
// Fetch categories using native fetch API
async function fetchCategories(
  page: number = 1,
  limit: number = 20
): Promise<ListCategoriesResponse> {
  const url = new URL('/api/categories', window.location.origin);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('limit', limit.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // include cookies for auth
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login
      window.location.href = '/auth/login?redirect=/categories';
      throw new Error('Unauthorized');
    }

    if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Invalid request');
    }

    throw new Error('Failed to fetch categories');
  }

  const data: ListCategoriesResponse = await response.json();
  return data;
}
```

### 7.5. Error Handling

```typescript
try {
  const data = await fetchCategories(page, limit);
  setCategories(data.items);
  setTotalPages(data.totalPages);
} catch (error) {
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message === 'Unauthorized') {
      // Already redirected to login
      return;
    }

    if (error.message.includes('Invalid request')) {
      // Show validation error toast
      toast.error('Nieprawidłowe parametry strony');
    } else {
      // Show generic error
      setError(error);
    }
  }
}
```

## 8. Interakcje użytkownika

### 8.1. Przeglądanie gridu kategorii

**Akcja**: Użytkownik wchodzi na stronę `/categories`

**Przepływ**:
1. Strona Astro renderuje się z SSR
2. Komponent React `CategoriesGrid` montuje się z `client:load`
3. Hook `useCategories` automatycznie fetchuje dane z `/api/categories?page=1&limit=20`
4. Podczas ładowania wyświetlany jest `SkeletonGrid` (8 skeleton cards)
5. Po otrzymaniu danych, grid renderuje `CategoryCard` dla każdej kategorii
6. User widzi grid z kategoriami (responsywny: 1/2/3/4 kolumny zależnie od viewport)

**Expected Result**: Grid kategorii z obrazkami, nazwami i opisami

---

### 8.2. Kliknięcie w kartę kategorii

**Akcja**: Użytkownik klika na `CategoryCard`

**Przepływ**:
1. Event `onClick` na `CategoryCard` wywołuje handler
2. Handler nawiguje do `/exercises?categoryId={category.id}` (lub `/categories/{id}`)
3. Nowa strona ładuje się z przefiltrowaną listą ćwiczeń dla danej kategorii

**Expected Result**: Przekierowanie do strony z ćwiczeniami z danej kategorii

**Keyboard Interaction**:
- `Tab`: Focus na kartę
- `Enter` lub `Space`: Aktywacja karty (nawigacja)

---

### 8.3. Nawigacja między stronami (Pagination)

**Akcja**: Użytkownik klika przycisk "Następna", "Poprzednia" lub konkretny numer strony

**Przepływ**:
1. Event `onClick` w komponencie `Pagination` wywołuje `onPageChange(newPage)`
2. Callback aktualizuje state `page` w `CategoriesGrid`
3. Hook `useCategories` wykrywa zmianę i fetchuje dane dla nowej strony
4. Podczas ładowania wyświetlany jest `SkeletonGrid`
5. Po otrzymaniu danych, grid re-renderuje się z nowymi kategoriami
6. URL aktualizuje się do `/categories?page={newPage}` (history.pushState)
7. Komponent `Pagination` aktualizuje się (active page, disabled buttons)

**Expected Result**: Wyświetlenie kategorii z wybranej strony

**Edge Cases**:
- Kliknięcie "Poprzednia" na stronie 1: Button disabled (brak akcji)
- Kliknięcie "Następna" na ostatniej stronie: Button disabled (brak akcji)
- Kliknięcie aktualnej strony: Brak akcji (page już aktywna)

---

### 8.4. Retry po błędzie

**Akcja**: Użytkownik klika przycisk "Spróbuj ponownie" w `ErrorState`

**Przepływ**:
1. Event `onClick` wywołuje `onRetry` callback
2. Callback wywołuje `refetch()` z hook `useCategories`
3. Stan zmienia się na `isLoading: true`, `error: null`
4. Wyświetlany jest `SkeletonGrid`
5. Ponowny fetch danych z API
6. W przypadku sukcesu: wyświetlenie gridu
7. W przypadku błędu: ponowne wyświetlenie `ErrorState`

**Expected Result**: Ponowna próba załadowania danych

---

### 8.5. Admin FAB - nawigacja do panelu

**Akcja**: Administrator klika Floating Action Button

**Przepływ**:
1. Event `onClick` na `AdminFAB` wywołuje handler
2. Handler nawiguje do `/admin/categories`
3. Użytkownik jest przekierowany do panelu administracyjnego kategorii

**Expected Result**: Przekierowanie do admin panel

**Conditional Display**: FAB widoczny tylko gdy `userRole === 'admin'`

---

### 8.6. Hover effects

**Akcja**: Użytkownik najeżdża myszką na `CategoryCard`

**Przepływ**:
1. CSS hover state aktywuje się
2. Karta powiększa się do `scale(1.02)`
3. Shadow zwiększa się do `shadow-lg`
4. Obrazek wewnątrz karty powiększa się do `scale(1.05)`

**Expected Result**: Wizualne potwierdzenie interaktywności karty

---

### 8.7. Loading state transitions

**Stan początkowy**: `isLoading: true`
- Wyświetlany `SkeletonGrid` (8 pulsujących kart)

**Sukces**: `isLoading: false`, `error: null`, `categories.length > 0`
- Crossfade transition z skeleton do rzeczywistych kart
- Fade in animation dla każdej karty (stagger delay)

**Błąd**: `isLoading: false`, `error: Error`
- Fade in `ErrorState` component

**Empty**: `isLoading: false`, `error: null`, `categories.length === 0`
- Fade in `EmptyState` component

## 9. Warunki i walidacja

### 9.1. Walidacja parametrów query (API level)

**Komponent**: API endpoint `/api/categories`

**Warunki**:
- `page`: musi być liczbą całkowitą >= 1
- `limit`: musi być liczbą całkowitą w przedziale 1-100

**Implementacja**: Walidacja przez Zod schema `ListCategoriesQuerySchema`

**Wpływ na UI**:
- Jeśli walidacja fail: Response 400 z szczegółami błędów
- UI wyświetla `ErrorState` z komunikatem "Nieprawidłowe parametry strony"

---

### 9.2. Walidacja numeru strony (Client level)

**Komponent**: `Pagination`

**Warunki**:
- `currentPage` >= 1
- `currentPage` <= `totalPages`

**Implementacja**:
```typescript
const isValidPage = (page: number) => {
  return page >= 1 && page <= totalPages;
};

// W handler
const handlePageChange = (newPage: number) => {
  if (!isValidPage(newPage)) {
    console.error('Invalid page number:', newPage);
    return;
  }
  onPageChange(newPage);
};
```

**Wpływ na UI**:
- Previous button disabled gdy `currentPage === 1`
- Next button disabled gdy `currentPage === totalPages`
- Kliknięcie disabled button nie wywołuje akcji

---

### 9.3. Walidacja danych kategorii (Response validation)

**Komponent**: `useCategories` hook

**Warunki**:
- `items` musi być array
- Każdy element `items` musi mieć:
  - `id`: string (UUID format)
  - `name`: string (non-empty)
  - `created_at`: string (ISO date format)

**Implementacja**:
```typescript
function validateCategoryDTO(category: any): category is CategoryDTO {
  return (
    typeof category.id === 'string' &&
    category.id.length > 0 &&
    typeof category.name === 'string' &&
    category.name.length > 0 &&
    typeof category.created_at === 'string'
  );
}

// W hook po fetch
const data: ListCategoriesResponse = await response.json();

// Validate response structure
if (!Array.isArray(data.items)) {
  throw new Error('Invalid response structure');
}

// Validate each category
const validCategories = data.items.filter(validateCategoryDTO);

if (validCategories.length !== data.items.length) {
  console.warn('Some categories failed validation');
}
```

**Wpływ na UI**:
- Jeśli walidacja fail: Throw error, wyświetlenie `ErrorState`
- Jeśli niektóre kategorie invalid: Log warning, wyświetlenie tylko valid items

---

### 9.4. Walidacja uprawnień użytkownika (Admin FAB)

**Komponent**: `AdminFAB`

**Warunki**:
- `userRole === 'admin'` - FAB visible
- `userRole !== 'admin'` - FAB hidden

**Implementacja**:
```typescript
// W komponencie CategoriesGrid
const userRole = useAppStore(state => state.user?.role);

return (
  <>
    {/* ... grid content */}
    {userRole === 'admin' && <AdminFAB />}
  </>
);
```

**Wpływ na UI**:
- Conditional rendering - FAB widoczny tylko dla adminów
- Brak FAB dla regular users

---

### 9.5. Walidacja dostępu do strony (Auth check)

**Komponent**: Middleware Astro (server-side)

**Warunki**:
- Użytkownik musi być zalogowany (authenticated)
- Sesja JWT musi być valid

**Implementacja**:
```typescript
// W middleware.ts
export async function onRequest({ locals, redirect }, next) {
  const user = await locals.supabase.auth.getUser();

  if (!user.data.user) {
    return redirect('/auth/login?redirect=/categories');
  }

  return next();
}
```

**Wpływ na UI**:
- Jeśli not authenticated: Redirect do `/auth/login`
- Jeśli authenticated: Render strony

---

### 9.6. Walidacja URL query parameters (Client-side)

**Komponent**: `CategoriesGrid` initial mount

**Warunki**:
- Jeśli `?page=` w URL, musi być valid number >= 1

**Implementacja**:
```typescript
const searchParams = new URLSearchParams(window.location.search);
const pageParam = searchParams.get('page');

let initialPage = 1;
if (pageParam) {
  const parsed = parseInt(pageParam, 10);
  if (!isNaN(parsed) && parsed >= 1) {
    initialPage = parsed;
  } else {
    // Invalid page param, use default
    console.warn('Invalid page parameter, using default');
  }
}
```

**Wpływ na UI**:
- Valid page param: Start z tej strony
- Invalid param: Start od strony 1, ignore param

---

### 9.7. Walidacja image URL (CategoryCard)

**Komponent**: `CategoryCard`

**Warunki**:
- `image_url` może być null/undefined (fallback do default icon)
- Jeśli present, musi być valid URL

**Implementacja**:
```typescript
// W CategoryCard component
const [imageError, setImageError] = useState(false);

const handleImageError = () => {
  setImageError(true);
};

return (
  <div>
    {category.image_url && !imageError ? (
      <img
        src={category.image_url}
        alt={category.name}
        onError={handleImageError}
        loading="lazy"
      />
    ) : (
      <div class="default-icon">📋</div>
    )}
  </div>
);
```

**Wpływ na UI**:
- Valid image URL: Wyświetlenie obrazka
- Invalid/broken URL: Fallback do default icon
- Null/undefined: Wyświetlenie default icon

## 10. Obsługa błędów

### 10.1. Błąd sieci (Network Error)

**Scenariusz**: Brak połączenia internetowego lub server unreachable

**Detection**:
```typescript
catch (error) {
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    // Network error
  }
}
```

**Handling**:
- Display `ErrorState` component
- Message: "Brak połączenia z serwerem. Sprawdź połączenie internetowe."
- Show retry button
- Log error to console

**User Action**: Kliknięcie "Spróbuj ponownie" → re-fetch

---

### 10.2. Błąd autoryzacji (401 Unauthorized)

**Scenariusz**: Sesja wygasła lub użytkownik nie jest zalogowany

**Detection**:
```typescript
if (response.status === 401) {
  // Unauthorized
}
```

**Handling**:
- Redirect to `/auth/login?redirect=/categories`
- Store original URL in query param for post-login redirect
- Optional: Display toast "Sesja wygasła. Zaloguj się ponownie."

**User Action**: Użytkownik zostaje przekierowany do login page

---

### 10.3. Błąd walidacji (400 Bad Request)

**Scenariusz**: Nieprawidłowe parametry query (page < 1, limit > 100)

**Detection**:
```typescript
if (response.status === 400) {
  const errorData = await response.json();
  // errorData.details zawiera szczegóły walidacji
}
```

**Handling**:
- Display `ErrorState` component
- Message: "Nieprawidłowe parametry strony"
- Show retry button (z poprawnymi parametrami)
- Log validation details to console

**User Action**: Reset do page 1 i retry

**Prevention**: Client-side validation przed wysłaniem request

---

### 10.4. Błąd serwera (500 Internal Server Error)

**Scenariusz**: Błąd po stronie serwera (database error, etc.)

**Detection**:
```typescript
if (response.status === 500) {
  // Server error
}
```

**Handling**:
- Display `ErrorState` component
- Message: "Wystąpił błąd serwera. Spróbuj ponownie za chwilę."
- Show retry button
- Log error to console (and optionally to error tracking service)

**User Action**: Kliknięcie retry → re-fetch po kilku sekundach

**Retry Strategy**: Exponential backoff (optional)

---

### 10.5. Pusta odpowiedź (Empty Response)

**Scenariusz**: API zwraca `items: []` (brak kategorii w bazie)

**Detection**:
```typescript
if (data.items.length === 0) {
  // Empty response
}
```

**Handling**:
- Display `EmptyState` component
- Message: "Brak kategorii"
- For admin: Show CTA button "Dodaj kategorię"
- For user: Show friendly message

**User Action**:
- Admin: Kliknięcie CTA → redirect `/admin/categories`
- User: Just informational message

---

### 10.6. Błąd parsowania JSON (Invalid Response)

**Scenariusz**: Response nie jest valid JSON lub ma nieprawidłową strukturę

**Detection**:
```typescript
try {
  const data = await response.json();
} catch (error) {
  // JSON parse error
}
```

**Handling**:
- Display `ErrorState` component
- Message: "Otrzymano nieprawidłową odpowiedź z serwera"
- Show retry button
- Log error with response text

**User Action**: Retry fetch

---

### 10.7. Błąd ładowania obrazka (Image Load Error)

**Scenariusz**: `image_url` wskazuje na nieistniejący lub uszkodzony obrazek

**Detection**:
```typescript
<img onError={handleImageError} />
```

**Handling**:
- Fallback to default icon (📋 emoji lub SVG placeholder)
- Card nadal pozostaje functional
- Log warning to console (optional)

**User Action**: Brak akcji potrzebnej, card nadal clickable

---

### 10.8. Timeout request (Long Response Time)

**Scenariusz**: API nie odpowiada w rozsądnym czasie (>10s)

**Detection**:
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

fetch(url, { signal: controller.signal })
  .catch(err => {
    if (err.name === 'AbortError') {
      // Timeout
    }
  })
  .finally(() => clearTimeout(timeoutId));
```

**Handling**:
- Display `ErrorState` component
- Message: "Serwer nie odpowiada. Spróbuj ponownie."
- Show retry button

**User Action**: Retry fetch

---

### 10.9. Invalid page number (Out of Range)

**Scenariusz**: Użytkownik wchodzi na `/categories?page=999` gdy są tylko 5 stron

**Detection**:
```typescript
// Po otrzymaniu response
if (data.page > data.totalPages) {
  // Page out of range
}
```

**Handling**:
- Redirect to last valid page: `/categories?page={totalPages}`
- Or redirect to page 1
- Optional: Display toast "Strona nie istnieje, przekierowano do ostatniej strony"

**User Action**: Automatic redirect, no action needed

---

### 10.10. Browser back/forward navigation

**Scenariusz**: Użytkownik używa browser back button po zmianie strony

**Detection**:
```typescript
window.addEventListener('popstate', (event) => {
  // URL changed via back/forward
});
```

**Handling**:
- Read page number from URL
- Fetch data for that page
- Update component state
- No page reload, just state update

**User Action**: Expected behavior - return to previous page of results

## 11. Kroki implementacji

### Krok 1: Setup struktury plików

**Akcje**:
1. Utworzenie katalogu `src/components/categories/`
2. Utworzenie plików komponentów:
   - `CategoriesGrid.tsx` (główny komponent React)
   - `CategoryCard.tsx` (karta kategorii)
   - `Pagination.tsx` (komponent paginacji)
   - `AdminFAB.tsx` (floating action button dla admina)
   - `SkeletonGrid.tsx` (skeleton loading state)
   - `ErrorState.tsx` (error state component)
   - `EmptyState.tsx` (empty state component)
3. Utworzenie custom hook: `src/components/hooks/useCategories.ts`
4. Aktualizacja pliku `src/pages/categories/index.astro`

**Weryfikacja**: Struktura plików zgodna z planem

---

### Krok 2: Implementacja custom hook useCategories

**Akcje**:
1. Utworzenie pliku `src/components/hooks/useCategories.ts`
2. Implementacja state management (useState):
   - `categories: CategoryDTO[]`
   - `page: number`
   - `totalPages: number`
   - `isLoading: boolean`
   - `error: Error | null`
3. Implementacja funkcji `fetchCategories`:
   - Fetch z `/api/categories?page={page}&limit={limit}`
   - Error handling (try/catch)
   - State updates (loading, error, success)
4. Implementacja navigation functions:
   - `goToPage(page: number)`
   - `nextPage()`
   - `prevPage()`
   - `refetch()`
5. useEffect dla initial fetch
6. Return hook interface zgodnie z typem `UseCategoriesReturn`

**Weryfikacja**: Hook kompiluje się bez błędów TypeScript

---

### Krok 3: Implementacja SkeletonGrid component

**Akcje**:
1. Utworzenie `src/components/categories/SkeletonGrid.tsx`
2. Implementacja skeleton cards (8 cards default):
   - Aspect-ratio container dla image placeholder
   - Pulse animation (Tailwind animate-pulse)
   - Mocked content areas (title, description, badge)
3. Props: `count?: number`
4. Responsive grid classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

**Weryfikacja**: Skeleton grid wyświetla się poprawnie, animation działa

---

### Krok 4: Implementacja ErrorState component

**Akcje**:
1. Utworzenie `src/components/categories/ErrorState.tsx`
2. Import icons z Lucide React: `AlertCircle`, `RefreshCw`
3. Layout: centered flex column
4. Props: `message?: string`, `onRetry: () => void`, `errorType?: string`
5. Conditional messages based on errorType
6. Retry button z onClick handler

**Weryfikacja**: ErrorState wyświetla się poprawnie, retry button funkcjonuje

---

### Krok 5: Implementacja EmptyState component

**Akcje**:
1. Utworzenie `src/components/categories/EmptyState.tsx`
2. Layout: centered flex column z ikoną (📋 lub SVG)
3. Props: `userRole?: string`
4. Conditional rendering CTA dla admina
5. Import Button z Shadcn/ui

**Weryfikacja**: EmptyState wyświetla się poprawnie, CTA dla admina działa

---

### Krok 6: Implementacja CategoryCard component

**Akcje**:
1. Utworzenie `src/components/categories/CategoryCard.tsx`
2. Props: `category: CategoryDTO`, `exercisesCount?: number`
3. Layout struktury karty:
   - Image section (aspect-video)
   - Content section (padding, text)
   - Badge z licznikiem ćwiczeń
4. Image error handling (onError fallback)
5. Hover effects (CSS transitions)
6. onClick handler z navigate do `/exercises?categoryId={id}`
7. Keyboard accessibility (onKeyDown, tabIndex)
8. Lazy loading dla images

**Weryfikacja**: Karta wyświetla się poprawnie, interactions działają

---

### Krok 7: Implementacja Pagination component

**Akcje**:
1. Utworzenie `src/components/categories/Pagination.tsx`
2. Props: `currentPage`, `totalPages`, `onPageChange`, `maxVisiblePages?`
3. Logic dla smart page numbers display:
   - Przypadek 1: ≤7 stron → pokaż wszystkie
   - Przypadek 2: >7 stron → pokaż z elipsą (1, 2, 3, ..., 10)
4. Buttons: Previous, Next
5. Disabled states (first/last page)
6. Active page styling
7. Accessibility (aria-label, aria-current)

**Weryfikacja**: Pagination wyświetla się poprawnie, nawigacja działa

---

### Krok 8: Implementacja AdminFAB component

**Akcje**:
1. Utworzenie `src/components/categories/AdminFAB.tsx`
2. Conditional rendering based on `userRole === 'admin'`
3. Fixed positioning (bottom-6 right-6)
4. Tooltip z Shadcn/ui (Tooltip, TooltipProvider)
5. Orange accent color dla admin
6. onClick navigate do `/admin/categories`
7. Accessibility (aria-label, sr-only text)

**Weryfikacja**: FAB wyświetla się tylko dla admina, navigate działa

---

### Krok 9: Implementacja CategoriesGrid component

**Akcje**:
1. Utworzenie `src/components/categories/CategoriesGrid.tsx`
2. Użycie hook `useCategories` dla data fetching
3. Conditional rendering based on state:
   - `isLoading` → SkeletonGrid
   - `error` → ErrorState z retry handler
   - `categories.length === 0` → EmptyState
   - Success → Grid z CategoryCard
4. Grid layout: responsive columns
5. Pagination component na dole
6. AdminFAB component (conditional)
7. URL sync: update query params on page change

**Weryfikacja**: Grid działa kompletnie, wszystkie states renderują się poprawnie

---

### Krok 10: Aktualizacja strony Astro (categories/index.astro)

**Akcje**:
1. Otwarcie `src/pages/categories/index.astro`
2. Import Layout i CategoriesGrid
3. Struktura strony:
   - Layout wrapper (title, showNav)
   - Container (mx-auto, padding)
   - Header section (h1, p)
   - CategoriesGrid component z `client:load`
4. Optional: SSR initial data fetch (do przekazania jako prop)
5. Meta tags (description, og:image)

**Weryfikacja**: Strona renderuje się poprawnie, SSR działa

---

### Krok 11: Implementacja URL state synchronization

**Akcje**:
1. W komponencie CategoriesGrid:
   - useEffect do read page z URL on mount
   - Update URL via `window.history.pushState` on page change
2. Listen to `popstate` event (browser back/forward)
3. Parse URL params i validate page number
4. Fallback do page 1 jeśli invalid

**Weryfikacja**: URL aktualizuje się przy zmianach, back/forward działają

---

### Krok 12: Stylowanie i responsive design

**Akcje**:
1. Dodanie Tailwind classes zgodnie z design:
   - Grid: responsive columns (1/2/3/4)
   - Cards: spacing, shadows, hover effects
   - Typography: hierarchy, sizes, colors
2. Dark mode support: używanie CSS variables
3. Transitions: smooth animations
4. Touch targets: min 44px dla mobile
5. Testing na różnych breakpointach (320px, 768px, 1024px, 1440px)

**Weryfikacja**: UI wygląda zgodnie z mockupami, responsive działa

---

### Krok 13: Accessibility improvements

**Akcje**:
1. Dodanie semantic HTML:
   - `<nav>` dla Pagination
   - `<article>` dla CategoryCard
2. ARIA attributes:
   - `aria-label` dla buttons bez tekstu
   - `aria-current="page"` dla active page
   - `role="status"` dla loading states
3. Keyboard navigation:
   - Tab order poprawny
   - Enter/Space na cards
   - Focus visible styles
4. Screen reader support:
   - `sr-only` text dla icons
   - Descriptive alt texts

**Weryfikacja**: Testy z keyboard only, screen reader (NVDA/JAWS)

---

### Krok 14: Error handling refinement

**Akcje**:
1. Implementacja różnych error messages dla różnych statusów:
   - 401: "Sesja wygasła. Zaloguj się ponownie."
   - 400: "Nieprawidłowe parametry strony."
   - 500: "Błąd serwera. Spróbuj ponownie za chwilę."
   - Network: "Brak połączenia z serwerem."
2. Retry logic:
   - Exponential backoff dla 500 errors (optional)
   - Immediate retry dla network errors
3. Toast notifications dla non-critical errors (optional)
4. Error logging do console (development mode)

**Weryfikacja**: Wszystkie scenariusze błędów obsługiwane poprawnie

---

### Krok 15: Performance optimizations

**Akcje**:
1. Image lazy loading: `loading="lazy"` attribute
2. React.memo dla CategoryCard (jeśli potrzebne)
3. useCallback dla event handlers w CategoriesGrid
4. Debounce dla rapid page changes (optional)
5. Virtualization dla very long lists (optional, >100 items)
6. Code splitting: lazy load components if needed

**Weryfikacja**: Performance metrics (Lighthouse, React DevTools Profiler)

---

### Krok 16: Testing

**Akcje**:
1. Unit tests (Jest + React Testing Library):
   - useCategories hook: fetch, error handling, navigation
   - CategoryCard: rendering, onClick, keyboard events
   - Pagination: page calculations, disabled states
2. Integration tests:
   - CategoriesGrid: full flow (load → display → page change)
   - Error scenarios: network error, 401, 500
3. E2E tests (Cypress):
   - User flow: load page → click category → verify redirect
   - Pagination: click next → verify URL update
   - Admin: verify FAB visibility for admin role
4. Accessibility tests (axe-core)

**Weryfikacja**: Coverage ≥70%, wszystkie testy pass

---

### Krok 17: Code review i dokumentacja

**Akcje**:
1. Code review:
   - Sprawdzenie TypeScript types
   - Sprawdzenie naming conventions
   - Sprawdzenie comments i JSDoc
2. Dokumentacja:
   - README dla komponentów
   - JSDoc comments dla functions
   - Inline comments dla complex logic
3. Refactoring:
   - Extract magic numbers do constants
   - Extract repeated logic do utility functions
   - DRY principle

**Weryfikacja**: Code review approved, dokumentacja kompletna

---

### Krok 18: Deployment i monitoring

**Akcje**:
1. Merge do develop branch
2. Deploy na staging environment
3. QA testing na staging:
   - Manual testing wszystkich flows
   - Cross-browser testing (Chrome, Firefox, Safari)
   - Mobile testing (iOS, Android)
4. Monitoring setup:
   - Error tracking (Sentry)
   - Analytics (Plausible/GA)
5. Merge do master i deploy na production

**Weryfikacja**: Aplikacja działa poprawnie na production

---

## Podsumowanie

Plan implementacji widoku "Kategorie Ćwiczeń" obejmuje 18 szczegółowych kroków, od setup struktury plików po deployment i monitoring. Implementacja wykorzystuje:

- **Astro 5** dla SSR strony głównej
- **React 19** dla interaktywnych komponentów
- **TypeScript 5** dla type safety
- **Tailwind CSS 4** dla stylowania
- **Shadcn/ui** dla UI components (Button, Tooltip, etc.)
- **Custom hook** (`useCategories`) dla data fetching i state management
- **Supabase** jako backend via REST API `/api/categories`

Widok jest w pełni responsywny, accessible (WCAG A compliance baseline), i implementuje best practices dla error handling, loading states, i user experience.
