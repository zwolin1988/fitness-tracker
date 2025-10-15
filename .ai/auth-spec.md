# Specyfikacja techniczna systemu autentykacji i autoryzacji
# Fitness Tracker - Moduł Auth

## 1. Wprowadzenie

Niniejsza specyfikacja opisuje architekturę i implementację kompleksowego systemu autentykacji i autoryzacji dla aplikacji Fitness Tracker. System realizuje wymagania funkcjonalne opisane w dokumentacji PRD (US-001, US-002, US-005 do US-011 oraz US-013), zapewniając bezpieczny dostęp do funkcjonalności aplikacji wymagających uwierzytelnienia.

### 1.1. Główne cele

- Umożliwienie rejestracji nowych użytkowników z walidacją danych
- Zapewnienie bezpiecznego logowania z wykorzystaniem JWT
- Implementacja odzyskiwania hasła poprzez email
- Ochrona chronionych zasobów aplikacji (dashboard, plany treningowe, profile)
- Integracja z istniejącym middleware Supabase
- Zachowanie spójności z architekturą Astro SSR i React

### 1.2. Zakres wymagań z PRD

System musi spełniać następujące historyjki użytkownika:
- **US-001**: Rejestracja i logowanie z walidacją, weryfikacją email, resetem hasła
- **US-002**: Edycja profilu dostępna tylko dla zalogowanych użytkowników
- **US-005 do US-011**: Wszystkie funkcjonalności treningowe wymagają uwierzytelnienia
- **US-013**: Bezpieczny dostęp z dedykowanymi stronami logowania/rejestracji, przyciskami w nawigacji, bez zewnętrznych serwisów OAuth

---

## 2. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 2.1. Struktura stron i komponentów

#### 2.1.1. Strony Astro (Server-Side Rendered)

**A. Strony publiczne (dostępne bez logowania)**

**`/src/pages/index.astro`** - Strona główna
- **Istniejący stan**: Prosta strona powitalna z linkami do /dashboard i /workouts
- **Wymagane zmiany**:
  - Sprawdzenie sesji użytkownika w kodzie server-side poprzez `Astro.locals.supabase.auth.getSession()`
  - Warunkowe wyświetlanie treści:
    - Dla niezalogowanych: CTA "Zaloguj się" i "Zarejestruj się"
    - Dla zalogowanych: przyciski "Dashboard", "Rozpocznij trening", personalizowane powitanie
  - Integracja z Layout.astro do warunkowego wyświetlania nawigacji

**`/src/pages/auth/login.astro`** - Strona logowania
- **Istniejący stan**: Szkielet strony bez funkcjonalności
- **Wymagana implementacja**:
  - Layout z `showNavigation={false}` (bez głównej nawigacji)
  - Renderowanie komponentu React `<LoginForm>` z dyrektywą `client:load`
  - Przekazanie zmiennych środowiskowych Supabase do komponentu poprzez props
  - Automatyczne przekierowanie do /dashboard jeśli sesja już istnieje (sprawdzenie server-side)
  - Link do strony rejestracji i odzyskiwania hasła

**`/src/pages/auth/register.astro`** - Strona rejestracji
- **Istniejący stan**: Szkielet strony bez funkcjonalności
- **Wymagana implementacja**:
  - Layout z `showNavigation={false}`
  - Renderowanie komponentu React `<RegisterForm>` z dyrektywą `client:load`
  - Przekazanie zmiennych środowiskowych Supabase
  - Automatyczne przekierowanie do /dashboard jeśli sesja już istnieje
  - Link do strony logowania

**`/src/pages/auth/forgot-password.astro`** - Strona odzyskiwania hasła (NOWA)
- **Do utworzenia**:
  - Layout z `showNavigation={false}`
  - Renderowanie komponentu React `<ForgotPasswordForm>` z dyrektywą `client:load`
  - Formularz z polem email
  - Informacja o wysłaniu linku resetującego
  - Link powrotny do logowania

**`/src/pages/auth/reset-password.astro`** - Strona ustawiania nowego hasła (NOWA)
- **Do utworzenia**:
  - Layout z `showNavigation={false}`
  - Renderowanie komponentu React `<ResetPasswordForm>` z dyrektywą `client:load`
  - Walidacja tokenu resetującego w URL (parametr `token`)
  - Formularz z polami: nowe hasło, potwierdzenie hasła
  - Obsługa wygaśnięcia tokenu

**`/src/pages/auth/verify-email.astro`** - Strona weryfikacji email (NOWA)
- **Do utworzenia**:
  - Layout z `showNavigation={false}`
  - Obsługa tokenu weryfikacyjnego z URL
  - Wyświetlenie statusu weryfikacji (sukces/błąd)
  - Automatyczne przekierowanie do /dashboard po 3 sekundach w przypadku sukcesu

**B. Strony chronione (wymagają logowania)**

Wszystkie poniższe strony wymagają rozszerzenia o mechanizm ochrony przed nieuwierzytelnionym dostępem:

**Lista stron do ochrony**:
- `/src/pages/dashboard.astro`
- `/src/pages/profile/index.astro`
- `/src/pages/plans/index.astro`
- `/src/pages/plans/create.astro`
- `/src/pages/plans/[id].astro`
- `/src/pages/plans/[id]/edit.astro`
- `/src/pages/workouts/index.astro`
- `/src/pages/workouts/start.astro`
- `/src/pages/workouts/active.astro`
- `/src/pages/workouts/[id].astro`

**Mechanizm ochrony (do implementacji w każdej chronionej stronie)**:
```typescript
// Przykład kodu server-side w frontmatter strony .astro
const { data: { session }, error } = await Astro.locals.supabase.auth.getSession();

if (!session || error) {
  // Przekierowanie do strony logowania z parametrem redirect
  return Astro.redirect(`/auth/login?redirect=${encodeURIComponent(Astro.url.pathname)}`);
}

// Opcjonalnie: pobranie danych profilu użytkownika
const { data: profile } = await Astro.locals.supabase
  .from('profiles')
  .select('name, role')
  .eq('user_id', session.user.id)
  .single();
```

**C. Strony administracyjne (wymagają roli admin)**

**Lista stron administracyjnych**:
- `/src/pages/admin/categories/index.astro`
- `/src/pages/admin/exercises/index.astro`

**Mechanizm ochrony administratora** (rozszerzenie mechanizmu ochrony podstawowej):
```typescript
// Sprawdzenie sesji jak w stronach chronionych
const { data: { session }, error } = await Astro.locals.supabase.auth.getSession();

if (!session || error) {
  return Astro.redirect(`/auth/login?redirect=${encodeURIComponent(Astro.url.pathname)}`);
}

// Dodatkowa weryfikacja roli admin
const { data: profile } = await Astro.locals.supabase
  .from('profiles')
  .select('role')
  .eq('user_id', session.user.id)
  .single();

if (!profile || profile.role !== 'admin') {
  // Przekierowanie do strony błędu 403 lub dashboard
  return Astro.redirect('/dashboard?error=forbidden');
}
```

#### 2.1.2. Komponenty React (Client-Side)

**A. Komponenty formularzy autentykacji**

**`/src/components/auth/LoginForm.tsx`** - Formularz logowania
- **Istniejący stan**: Podstawowa implementacja z walidacją Zod i integracją Supabase
- **Wymagane rozszerzenia**:
  - Dodanie obsługi parametru `redirect` z URL (przekierowanie po zalogowaniu)
  - Dodanie linku "Zapomniałeś hasła?" do `/auth/forgot-password`
  - Implementacja "Remember me" poprzez persistence w localStorage
  - Obsługa komunikatów błędów z parametru URL (np. `?error=session_expired`)
  - Dodanie stanu ładowania podczas weryfikacji sesji

**Kontrakt komponentu**:
```typescript
interface LoginFormProps {
  supabaseUrl: string;
  supabaseKey: string;
  redirectUrl?: string; // NOWE: URL przekierowania po zalogowaniu
  errorMessage?: string; // NOWE: Komunikat błędu z URL
}
```

**`/src/components/auth/RegisterForm.tsx`** - Formularz rejestracji (NOWY)
- **Do utworzenia**:
  - Pola: email, hasło, potwierdzenie hasła, imię, waga (kg), wzrost (cm)
  - Walidacja po stronie klienta z wykorzystaniem `RegisterSchema` z Zod
  - Wywołanie `supabase.auth.signUp()` z opcją `emailRedirectTo`
  - Po rejestracji: utworzenie profilu w tabeli `profiles` poprzez endpoint API
  - Wyświetlenie komunikatu o konieczności weryfikacji email
  - Link do strony logowania dla użytkowników posiadających konto

**Kontrakt komponentu**:
```typescript
interface RegisterFormProps {
  supabaseUrl: string;
  supabaseKey: string;
}

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  weight: number;
  height: number;
}
```

**Schemat walidacji** (rozszerzenie istniejącego `RegisterSchema`):
```typescript
export const RegisterSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email").trim(),
  password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
  confirmPassword: z.string(),
  name: z.string().min(1, "Imię jest wymagane").max(100).trim(),
  weight: z.number().positive("Waga musi być większa od 0").max(500),
  height: z.number().positive("Wzrost musi być większy od 0").max(300),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});
```

**`/src/components/auth/ForgotPasswordForm.tsx`** - Formularz odzyskiwania hasła (NOWY)
- **Do utworzenia**:
  - Pole: email
  - Wywołanie `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/auth/reset-password' })`
  - Wyświetlenie komunikatu potwierdzającego wysłanie linku
  - Obsługa błędów (email nie istnieje w systemie - z bezpieczeństwa pokazujemy ten sam komunikat)
  - Timer cooldown (60s) przed ponownym wysłaniem

**Kontrakt komponentu**:
```typescript
interface ForgotPasswordFormProps {
  supabaseUrl: string;
  supabaseKey: string;
}
```

**`/src/components/auth/ResetPasswordForm.tsx`** - Formularz resetowania hasła (NOWY)
- **Do utworzenia**:
  - Pola: nowe hasło, potwierdzenie nowego hasła
  - Walidacja tokenu z URL poprzez `supabase.auth.verifyOtp()`
  - Wywołanie `supabase.auth.updateUser({ password: newPassword })`
  - Automatyczne przekierowanie do /dashboard po pomyślnej zmianie
  - Obsługa wygaśnięcia tokenu (24h zgodnie z US-001)

**Kontrakt komponentu**:
```typescript
interface ResetPasswordFormProps {
  supabaseUrl: string;
  supabaseKey: string;
  token: string;
}
```

**B. Komponenty nawigacji i kontroli sesji**

**`/src/components/auth/LogoutButton.tsx`** - Przycisk wylogowania
- **Istniejący stan**: Podstawowa implementacja z `supabase.auth.signOut()`
- **Wymagane rozszerzenia**:
  - Dodanie konfirmacji wylogowania (opcjonalne, dla lepszego UX)
  - Czyszczenie localStorage po wylogowaniu
  - Obsługa błędów wylogowania (retry mechanism)

**`/src/components/Navigation.astro`** - Główna nawigacja aplikacji
- **Istniejący stan**: Statyczny komponent Astro z menu i avatarem
- **Wymagane zmiany**:
  - Warunkowo wyświetlanie elementów w zależności od stanu sesji:
    - Niezalogowani: przyciski "Zaloguj się" i "Zarejestruj się"
    - Zalogowani: menu użytkownika (avatar, dropdown z opcjami), przycisk wylogowania
  - Przekazanie danych sesji z server-side do części klienta
  - Integracja z komponentem React `<UserMenu>` dla interaktywnych elementów

**Podział odpowiedzialności**:
- **Navigation.astro**: sprawdzenie sesji server-side, renderowanie struktury
- **`<UserMenu>` (React)**: interaktywny dropdown z opcjami użytkownika (profil, wylogowanie)

**`/src/components/auth/UserMenu.tsx`** - Menu użytkownika (NOWY)
- **Do utworzenia**:
  - Dropdown menu z opcjami: "Profil", "Ustawienia", "Wyloguj się"
  - Wyświetlanie avatara użytkownika
  - Wyświetlanie imienia użytkownika z profilu
  - Integracja z `LogoutButton`
  - Wskaźnik roli administratora (dla adminów dodatkowo "Panel admina")

**Kontrakt komponentu**:
```typescript
interface UserMenuProps {
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  isAdmin: boolean;
  supabaseUrl: string;
  supabaseKey: string;
}
```

**C. Komponenty pomocnicze**

**`/src/components/auth/ProtectedRoute.tsx`** - HOC/wrapper do ochrony komponentów (OPCJONALNY)
- Może być użyty do ochrony komponentów React wymagających uwierzytelnienia
- Sprawdzenie sesji client-side
- Wyświetlenie loadera podczas weryfikacji
- Przekierowanie do logowania jeśli brak sesji

**`/src/components/auth/SessionProvider.tsx`** - Provider kontekstu sesji (OPCJONALNY)
- Context API dla globalnego stanu sesji w komponentach React
- Automatyczne odświeżanie tokenu JWT
- Obsługa zdarzeń sesji (logowanie, wylogowanie)

### 2.2. Walidacja formularzy i komunikaty błędów

#### 2.2.1. Schematy walidacji Zod

**Lokalizacja**: `/src/lib/schemas/auth.ts`

**A. LoginSchema** (istniejący - bez zmian)
```typescript
export const LoginSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email").trim(),
  password: z.string().min(6, "Hasło musi mieć minimum 6 znaków"),
});
```

**B. RegisterSchema** (istniejący - do rozszerzenia)
```typescript
export const RegisterSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email").trim(),
  password: z.string()
    .min(6, "Hasło musi mieć minimum 6 znaków")
    .regex(/[A-Z]/, "Hasło musi zawierać przynajmniej jedną wielką literę")
    .regex(/[0-9]/, "Hasło musi zawierać przynajmniej jedną cyfrę"),
  confirmPassword: z.string(),
  name: z.string()
    .min(1, "Imię jest wymagane")
    .max(100, "Imię nie może przekraczać 100 znaków")
    .trim(),
  weight: z.number()
    .positive("Waga musi być większa od 0")
    .max(500, "Waga nie może przekraczać 500 kg"),
  height: z.number()
    .positive("Wzrost musi być większy od 0")
    .max(300, "Wzrost nie może przekraczać 300 cm"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});
```

**C. ForgotPasswordSchema** (NOWY)
```typescript
export const ForgotPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email").trim(),
});
```

**D. ResetPasswordSchema** (NOWY)
```typescript
export const ResetPasswordSchema = z.object({
  password: z.string()
    .min(6, "Hasło musi mieć minimum 6 znaków")
    .regex(/[A-Z]/, "Hasło musi zawierać przynajmniej jedną wielką literę")
    .regex(/[0-9]/, "Hasło musi zawierać przynajmniej jedną cyfrę"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Hasła nie są identyczne",
  path: ["confirmPassword"],
});
```

#### 2.2.2. Komunikaty błędów i ich obsługa

**A. Błędy walidacji formularza** (wyświetlane inline przy polach)

**Logowanie**:
- Email: "Nieprawidłowy format adresu email"
- Hasło: "Hasło musi mieć minimum 6 znaków"

**Rejestracja**:
- Email: "Nieprawidłowy format adresu email"
- Hasło: "Hasło musi mieć minimum 6 znaków", "Hasło musi zawierać wielką literę i cyfrę"
- Potwierdzenie hasła: "Hasła nie są identyczne"
- Imię: "Imię jest wymagane", "Imię nie może przekraczać 100 znaków"
- Waga: "Waga musi być większa od 0", "Waga nie może przekraczać 500 kg"
- Wzrost: "Wzrost musi być większy od 0", "Wzrost nie może przekraczać 300 cm"

**B. Błędy autentykacji Supabase** (wyświetlane jako alert nad formularzem)

**Mapowanie błędów Supabase na komunikaty polskie**:
```typescript
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Nieprawidłowy email lub hasło",
  "Email not confirmed": "Email nie został zweryfikowany. Sprawdź swoją skrzynkę pocztową.",
  "User already registered": "Konto z tym adresem email już istnieje",
  "Password should be at least 6 characters": "Hasło musi mieć minimum 6 znaków",
  "Signups not allowed for this instance": "Rejestracja jest tymczasowo wyłączona",
  "Email rate limit exceeded": "Zbyt wiele prób. Spróbuj ponownie za kilka minut.",
  "Token has expired or is invalid": "Link wygasł lub jest nieprawidłowy. Poproś o nowy.",
};
```

**C. Błędy sieciowe i ogólne**
- Brak połączenia: "Nie można połączyć się z serwerem. Sprawdź połączenie internetowe."
- Timeout: "Przekroczono czas oczekiwania. Spróbuj ponownie."
- Nieznany błąd: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie lub skontaktuj się z pomocą techniczną."

**D. Komunikaty sukcesu** (wyświetlane jako toast lub alert)
- Logowanie: "Zalogowano pomyślnie. Przekierowywanie..."
- Rejestracja: "Konto utworzone! Sprawdź email, aby zweryfikować adres."
- Wysłanie linku do resetowania: "Link do resetowania hasła został wysłany na adres [email]"
- Zmiana hasła: "Hasło zostało zmienione. Możesz się teraz zalogować."
- Weryfikacja email: "Email zweryfikowany pomyślnie!"

**E. Lokalizacja komponentów do wyświetlania komunikatów**

Wykorzystanie biblioteki `sonner` (już zainstalowana w projekcie):
```typescript
import { toast } from 'sonner';

// Przykład użycia
toast.success("Zalogowano pomyślnie");
toast.error("Nieprawidłowy email lub hasło");
```

### 2.3. Scenariusze użytkownika (User Flows)

#### 2.3.1. Rejestracja nowego użytkownika

**Krok 1**: Użytkownik wchodzi na stronę główną `/`
- Widzi CTA "Zarejestruj się"
- Klika przycisk → przekierowanie do `/auth/register`

**Krok 2**: Wypełnienie formularza rejestracji
- Pola: email, hasło, potwierdzenie hasła, imię, waga, wzrost
- Walidacja client-side w czasie rzeczywistym (onBlur)
- Kliknięcie "Zarejestruj się"

**Krok 3**: Weryfikacja danych i utworzenie konta
- Walidacja Zod po stronie klienta
- Wywołanie `supabase.auth.signUp({ email, password, options: { emailRedirectTo: '/auth/verify-email' } })`
- Utworzenie wpisu w tabeli `auth.users` (automatyczne przez Supabase)

**Krok 4**: Utworzenie profilu użytkownika
- Wywołanie endpointu API `POST /api/auth/register` z danymi profilu
- Endpoint tworzy rekord w tabeli `profiles` z user_id, name, weight, height, role='user'

**Krok 5**: Wysłanie emaila weryfikacyjnego
- Supabase automatycznie wysyła email z linkiem weryfikacyjnym
- Użytkownik widzi komunikat: "Konto utworzone! Sprawdź email, aby zweryfikować adres."
- Przekierowanie do `/auth/login` z komunikatem

**Krok 6**: Weryfikacja emaila
- Użytkownik klika link w emailu
- Przekierowanie do `/auth/verify-email?token=...`
- Strona wywołuje `supabase.auth.verifyOtp(token)`
- Komunikat sukcesu i automatyczne przekierowanie do `/dashboard` po 3 sekundach

#### 2.3.2. Logowanie użytkownika

**Krok 1**: Wejście na stronę logowania
- Bezpośrednie wejście na `/auth/login`
- LUB: kliknięcie "Zaloguj się" na stronie głównej
- LUB: przekierowanie z chronionej strony (z parametrem `redirect`)

**Krok 2**: Wypełnienie formularza
- Pola: email, hasło
- Opcjonalnie: checkbox "Zapamiętaj mnie"
- Kliknięcie "Zaloguj się"

**Krok 3**: Uwierzytelnienie
- Walidacja Zod client-side
- Wywołanie `supabase.auth.signInWithPassword({ email, password })`
- Supabase zwraca session z JWT tokenem (access_token, refresh_token)
- Token zapisywany w cookies automatycznie przez Supabase

**Krok 4**: Pobranie danych profilu (opcjonalnie client-side)
- Wywołanie `supabase.from('profiles').select('name, role').eq('user_id', user.id).single()`

**Krok 5**: Przekierowanie
- Jeśli parametr `redirect` istnieje → przekierowanie do tej strony
- W przeciwnym razie → przekierowanie do `/dashboard`

#### 2.3.3. Odzyskiwanie hasła

**Krok 1**: Kliknięcie "Zapomniałeś hasła?" na stronie logowania
- Przekierowanie do `/auth/forgot-password`

**Krok 2**: Wypełnienie formularza z emailem
- Pole: email
- Kliknięcie "Wyślij link resetujący"

**Krok 3**: Wysłanie linku resetującego
- Wywołanie `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/auth/reset-password' })`
- Komunikat: "Link do resetowania hasła został wysłany na adres [email]"
- Timer cooldown 60s przed ponownym wysłaniem

**Krok 4**: Kliknięcie linku w emailu
- Link zawiera token ważny 24h (zgodnie z US-001)
- Przekierowanie do `/auth/reset-password?token=...`

**Krok 5**: Ustawienie nowego hasła
- Pola: nowe hasło, potwierdzenie hasła
- Walidacja Zod (minimum 6 znaków, wielka litera, cyfra)
- Wywołanie `supabase.auth.updateUser({ password: newPassword })`

**Krok 6**: Potwierdzenie i przekierowanie
- Komunikat sukcesu: "Hasło zostało zmienione"
- Automatyczne przekierowanie do `/dashboard`

#### 2.3.4. Wylogowanie

**Krok 1**: Kliknięcie przycisku "Wyloguj się" w nawigacji
- Wywołanie `supabase.auth.signOut()`
- Czyszczenie cookies i localStorage

**Krok 2**: Przekierowanie
- Przekierowanie do strony głównej `/`
- Komunikat toast: "Wylogowano pomyślnie"

#### 2.3.5. Próba dostępu do chronionej strony bez logowania

**Krok 1**: Użytkownik próbuje wejść na `/dashboard` bez sesji
- Server-side sprawdzenie sesji w frontmatter strony `.astro`
- Brak sesji → wykrycie przez `Astro.locals.supabase.auth.getSession()`

**Krok 2**: Przekierowanie do logowania
- Przekierowanie do `/auth/login?redirect=/dashboard`
- Komunikat: "Musisz się zalogować, aby uzyskać dostęp do tej strony"

**Krok 3**: Po zalogowaniu
- Automatyczne przekierowanie do `/dashboard` (z parametru `redirect`)

---

## 3. LOGIKA BACKENDOWA

### 3.1. Endpointy API

System autentykacji wykorzystuje głównie Supabase Auth SDK client-side, jednak niektóre operacje wymagają dedykowanych endpointów API server-side.

#### 3.1.1. Endpoint rejestracji profilu

**`POST /api/auth/register`**

**Cel**: Utworzenie profilu użytkownika w tabeli `profiles` po rejestracji w Supabase Auth

**Wymagania**:
- Endpoint wywoływany automatycznie po pomyślnym `supabase.auth.signUp()` z client-side
- LUB: wykorzystanie Supabase Database Webhooks (trigger po utworzeniu użytkownika w `auth.users`)

**Payload**:
```typescript
interface RegisterProfilePayload {
  userId: string; // UUID użytkownika z auth.users
  name: string;
  weight: number;
  height: number;
}
```

**Walidacja**:
- Weryfikacja JWT tokenu w nagłówku `Authorization`
- Sprawdzenie czy `userId` w payload odpowiada `auth.uid()` z tokenu
- Walidacja schematem Zod:
```typescript
const RegisterProfileSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(100).trim(),
  weight: z.number().positive().max(500),
  height: z.number().positive().max(300),
});
```

**Logika**:
1. Weryfikacja tokenu JWT poprzez `supabase.auth.getUser()`
2. Walidacja danych wejściowych
3. Sprawdzenie czy profil już nie istnieje dla danego `userId`
4. Utworzenie rekordu w tabeli `profiles`:
```sql
INSERT INTO profiles (user_id, name, weight, height, role, updated_at)
VALUES ($userId, $name, $weight, $height, 'user', NOW())
```

**Odpowiedzi**:
- **201 Created**: Profil utworzony pomyślnie
```json
{
  "userId": "uuid",
  "name": "Jan Kowalski",
  "weight": 75,
  "height": 180,
  "role": "user"
}
```
- **400 Bad Request**: Błąd walidacji danych
- **401 Unauthorized**: Brak lub nieprawidłowy token JWT
- **409 Conflict**: Profil już istnieje dla tego użytkownika
- **500 Internal Server Error**: Błąd serwera

**Alternatywne podejście: Database Trigger**
Zamiast ręcznego wywołania API, można wykorzystać trigger PostgreSQL:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, weight, height, role)
  VALUES (new.id, '', 0, 0, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```
W tym przypadku formularz rejestracji musi wywołać dodatkowy endpoint do aktualizacji profilu z rzeczywistymi danymi.

#### 3.1.2. Endpoint weryfikacji roli administratora

**`GET /api/auth/verify-admin`**

**Cel**: Sprawdzenie czy aktualnie zalogowany użytkownik ma rolę administratora

**Wymagania**:
- Wykorzystywany przez strony administracyjne do weryfikacji dostępu client-side
- Może być użyty do warunkowego renderowania elementów UI dla adminów

**Autoryzacja**:
- Wymaga tokenu JWT w nagłówku `Authorization: Bearer {token}`

**Logika**:
1. Pobranie użytkownika z JWT: `supabase.auth.getUser()`
2. Zapytanie do tabeli `profiles` o rolę:
```sql
SELECT role FROM profiles WHERE user_id = $userId
```
3. Zwrócenie informacji o roli

**Odpowiedzi**:
- **200 OK**: Weryfikacja zakończona
```json
{
  "isAdmin": true,
  "userId": "uuid",
  "role": "admin"
}
```
- **401 Unauthorized**: Brak tokenu lub nieprawidłowy token
- **404 Not Found**: Profil użytkownika nie istnieje
- **500 Internal Server Error**: Błąd serwera

**Uwaga**: Endpoint ten jest pomocniczy - właściwa ochrona stron administracyjnych odbywa się server-side w Astro oraz przez RLS policies w Supabase.

#### 3.1.3. Endpoint odświeżania tokenu (opcjonalny)

Supabase automatycznie obsługuje odświeżanie tokenów JWT, jednak w przypadku potrzeby ręcznej kontroli:

**`POST /api/auth/refresh`**

**Cel**: Ręczne odświeżenie tokenu JWT używając refresh_token

**Payload**:
```typescript
interface RefreshTokenPayload {
  refreshToken: string;
}
```

**Logika**:
- Wywołanie `supabase.auth.refreshSession({ refresh_token: refreshToken })`
- Zwrócenie nowego `access_token` i `refresh_token`

**Odpowiedzi**:
- **200 OK**: Token odświeżony
```json
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token",
  "expiresAt": 1234567890
}
```
- **401 Unauthorized**: Nieprawidłowy refresh_token

### 3.2. Serwisy i logika biznesowa

#### 3.2.1. AuthService

**Lokalizacja**: `/src/lib/services/auth.ts` (NOWY)

**Odpowiedzialność**:
- Centralizacja logiki autentykacji dla endpointów API
- Walidacja tokenów JWT
- Operacje na profilach użytkowników związane z autentykacją

**Interfejs**:
```typescript
export interface AuthService {
  /**
   * Tworzy profil użytkownika po rejestracji
   */
  createUserProfile(
    supabase: TypedSupabaseClient,
    userId: string,
    data: { name: string; weight: number; height: number }
  ): Promise<Profile>;

  /**
   * Sprawdza czy użytkownik ma rolę administratora
   */
  verifyAdminRole(
    supabase: TypedSupabaseClient
  ): Promise<{ isAdmin: boolean; userId?: string; error?: string }>;

  /**
   * Pobiera profil użytkownika na podstawie ID
   */
  getUserProfile(
    supabase: TypedSupabaseClient,
    userId: string
  ): Promise<Profile | null>;

  /**
   * Aktualizuje dane profilu użytkownika
   */
  updateUserProfile(
    supabase: TypedSupabaseClient,
    userId: string,
    data: Partial<Profile>
  ): Promise<Profile>;
}
```

**Implementacja kluczowych metod**:

```typescript
export const createUserProfile = async (
  supabase: TypedSupabaseClient,
  userId: string,
  data: { name: string; weight: number; height: number }
): Promise<Profile> => {
  // Walidacja danych
  const validatedData = RegisterProfileSchema.parse({ userId, ...data });

  // Sprawdzenie czy profil już nie istnieje
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (existingProfile) {
    throw new Error('Profile already exists');
  }

  // Utworzenie profilu
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      name: validatedData.name,
      weight: validatedData.weight,
      height: validatedData.height,
      role: 'user',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create profile: ${error.message}`);
  }

  return newProfile;
};
```

**Funkcja verifyAdminRole** już istnieje w `/src/lib/auth/admin.ts` - można ją przenieść do AuthService dla spójności.

#### 3.2.2. ProfileService (rozszerzenie istniejącego)

**Lokalizacja**: `/src/lib/services/profile.ts`

**Wymagane rozszerzenia**:
- Metoda do automatycznego tworzenia profilu po rejestracji (jeśli nie używamy triggera)
- Metoda do pobierania profilu z cache (optymalizacja)

### 3.3. Middleware i ochrona zasobów

#### 3.3.1. Middleware Supabase (istniejący)

**Lokalizacja**: `/src/middleware/index.ts`

**Istniejący stan**:
- Inicjalizacja klienta Supabase z tokenem JWT z nagłówka `Authorization`
- Przypisanie klienta do `context.locals.supabase`

**Wymagane rozszerzenia**:
Aktualny middleware jest wystarczający dla podstawowej funkcjonalności. Opcjonalne usprawnienia:

1. **Automatyczne odświeżanie sesji**:
```typescript
export const onRequest = defineMiddleware(async (context, next) => {
  const authHeader = context.request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });

  // NOWE: Sprawdzenie ważności sesji i automatyczne odświeżenie
  const { data: { session }, error } = await supabase.auth.getSession();

  if (session && error?.message === "JWT expired") {
    // Próba odświeżenia sesji
    await supabase.auth.refreshSession();
  }

  context.locals.supabase = supabase;
  return next();
});
```

2. **Logowanie błędów autentykacji**:
```typescript
// Dodanie logowania do monitorowania prób nieautoryzowanego dostępu
if (error) {
  console.warn(`[Auth] Session error: ${error.message}`, {
    path: context.url.pathname,
    timestamp: new Date().toISOString(),
  });
}
```

#### 3.3.2. Helper funkcje do ochrony stron

**Lokalizacja**: `/src/lib/auth/guards.ts` (NOWY)

**Cel**: Reużywalne funkcje do ochrony stron Astro przed nieautoryzowanym dostępem

**Implementacja**:

```typescript
import type { AstroGlobal } from 'astro';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Sprawdza czy użytkownik jest zalogowany
 * Jeśli nie - przekierowuje do strony logowania z parametrem redirect
 */
export async function requireAuth(Astro: AstroGlobal): Promise<string | null> {
  const supabase = Astro.locals.supabase as TypedSupabaseClient;
  const { data: { session }, error } = await supabase.auth.getSession();

  if (!session || error) {
    const redirectUrl = `/auth/login?redirect=${encodeURIComponent(Astro.url.pathname)}`;
    return Astro.redirect(redirectUrl);
  }

  return session.user.id;
}

/**
 * Sprawdza czy użytkownik jest zalogowany i ma rolę administratora
 * Jeśli nie - przekierowuje odpowiednio do logowania lub dashboard
 */
export async function requireAdmin(Astro: AstroGlobal): Promise<string | null> {
  const supabase = Astro.locals.supabase as TypedSupabaseClient;

  // Najpierw sprawdzenie sesji
  const { data: { session }, error } = await supabase.auth.getSession();

  if (!session || error) {
    const redirectUrl = `/auth/login?redirect=${encodeURIComponent(Astro.url.pathname)}`;
    return Astro.redirect(redirectUrl);
  }

  // Następnie sprawdzenie roli
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', session.user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return Astro.redirect('/dashboard?error=forbidden');
  }

  return session.user.id;
}

/**
 * Pobiera sesję użytkownika bez przekierowania
 * Zwraca null jeśli użytkownik nie jest zalogowany
 */
export async function getOptionalSession(Astro: AstroGlobal) {
  const supabase = Astro.locals.supabase as TypedSupabaseClient;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Pobiera profil zalogowanego użytkownika
 */
export async function getUserProfile(Astro: AstroGlobal) {
  const supabase = Astro.locals.supabase as TypedSupabaseClient;
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  return profile;
}
```

**Użycie w stronach Astro**:
```astro
---
import { requireAuth } from '@/lib/auth/guards';
import Layout from '@/layouts/Layout.astro';

// Ochrona strony - wymaga logowania
const userId = await requireAuth(Astro);
if (!userId) return; // Funkcja już przekierowała

// Pobranie profilu użytkownika
const profile = await getUserProfile(Astro);
---

<Layout title="Dashboard">
  <h1>Witaj, {profile?.name}!</h1>
</Layout>
```

### 3.4. Obsługa wyjątków i błędów

#### 3.4.1. Centralizacja obsługi błędów API

**Lokalizacja**: `/src/lib/utils/error-handler.ts` (NOWY)

**Cel**: Jednolity sposób obsługi i formatowania błędów w endpointach API

```typescript
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.details,
      }),
      {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (error instanceof ZodError) {
    return new Response(
      JSON.stringify({
        error: 'Validation error',
        details: error.errors,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Błąd Supabase
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return new Response(
      JSON.stringify({
        error: (error as { message: string }).message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Nieznany błąd
  console.error('Unhandled error:', error);
  return new Response(
    JSON.stringify({
      error: 'Internal server error',
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
```

**Użycie w endpointach**:
```typescript
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    // ... logika endpointu

    if (someCondition) {
      throw new ApiError(400, 'Invalid input', { field: 'email' });
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
};
```

#### 3.4.2. Obsługa błędów w komponentach React

**Wykorzystanie toast notifications** (biblioteka `sonner`):

```typescript
import { toast } from 'sonner';

// W komponencie formularza
const handleSubmit = async (e: React.FormEvent) => {
  try {
    // ... logika logowania/rejestracji
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    toast.error(errorMessage);
  }
};

// Helper funkcja do ekstrakcji komunikatu błędu
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return AUTH_ERROR_MESSAGES[error.message] || error.message;
  }
  return 'Wystąpił nieoczekiwany błąd';
}
```

#### 3.4.3. Strony błędów

**`/src/pages/error.astro`** (NOWA) - Strona ogólnych błędów
- Parametry URL: `?code=404&message=Not Found`
- Wyświetlanie przyjaznego komunikatu
- Link powrotny do strony głównej

**`/src/pages/403.astro`** (NOWA) - Brak uprawnień
- Wyświetlana gdy użytkownik próbuje uzyskać dostęp do zasobów administracyjnych bez roli admin
- Komunikat: "Nie masz uprawnień do wyświetlenia tej strony"
- Link do dashboard

---

## 4. SYSTEM AUTENTYKACJI Z SUPABASE

### 4.1. Konfiguracja Supabase Auth

#### 4.1.1. Zmienne środowiskowe

**Lokalizacja**: `.env`

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Auth Configuration
AUTH_REDIRECT_URL=http://localhost:3000
AUTH_EMAIL_CONFIRM_URL=http://localhost:3000/auth/verify-email
AUTH_PASSWORD_RESET_URL=http://localhost:3000/auth/reset-password
```

**Uwaga bezpieczeństwa**:
- `SUPABASE_KEY` (anon key) może być używany w kodzie client-side
- `SUPABASE_SERVICE_ROLE_KEY` TYLKO dla operacji server-side (bypass RLS)
- Nigdy nie eksponować service role key w kodzie klienta

#### 4.1.2. Ustawienia projektu Supabase

**A. Email Templates** (konfiguracja w Supabase Dashboard)

**Confirm Email Template** (weryfikacja adresu email):
```html
<h2>Potwierdź swój adres email</h2>
<p>Dziękujemy za rejestrację w Fitness Tracker!</p>
<p>Kliknij poniższy link, aby zweryfikować swój adres email:</p>
<a href="{{ .ConfirmationURL }}">Potwierdź email</a>
<p>Link jest ważny przez 24 godziny.</p>
```

**Reset Password Template**:
```html
<h2>Resetowanie hasła</h2>
<p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.</p>
<p>Kliknij poniższy link, aby ustawić nowe hasło:</p>
<a href="{{ .ConfirmationURL }}">Zresetuj hasło</a>
<p>Link jest ważny przez 24 godziny.</p>
<p>Jeśli to nie Ty wysłałeś tę prośbę, zignoruj ten email.</p>
```

**B. Auth Settings** (w Supabase Dashboard → Authentication → Settings)

- **Email Confirmation Required**: ON (wymaga weryfikacji email)
- **Enable Email Signups**: ON
- **Disable Email Signups**: OFF (można włączyć w produkcji jeśli chcemy closed beta)
- **JWT Expiry**: 3600 seconds (1 godzina - zgodnie z US-001: 24h sesja z auto-refresh)
- **Refresh Token Expiry**: 2592000 seconds (30 dni)
- **Enable Phone Signups**: OFF (nie używamy)
- **Site URL**: `http://localhost:3000` (development) / `https://yourdomain.com` (production)
- **Redirect URLs**:
  - `http://localhost:3000/auth/verify-email`
  - `http://localhost:3000/auth/reset-password`
  - `http://localhost:3000/dashboard`

**C. Email Provider** (SMTP)

Skonfigurować własny SMTP dla produkcji (domyślny Supabase ma limity):
- **SMTP Host**: smtp.gmail.com (lub inny provider)
- **SMTP Port**: 587
- **SMTP User**: noreply@yourdomain.com
- **SMTP Password**: [app password]
- **Sender Email**: noreply@yourdomain.com
- **Sender Name**: Fitness Tracker

### 4.2. Integracja z Astro SSR

#### 4.2.1. Klient Supabase dla Astro (server-side)

**Lokalizacja**: `/src/db/supabase.client.ts` (istniejący - bez zmian)

Aktualny klient jest poprawny dla użycia w middleware i endpointach API:
```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../db/database.types.ts";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

#### 4.2.2. Klient Supabase dla React (client-side)

**Lokalizacja**: `/src/lib/supabase/client.ts` (NOWY)

**Cel**: Wrapper dla `@supabase/ssr` umożliwiający automatyczne zarządzanie cookies w komponentach React

```typescript
import { createBrowserClient as createClient } from '@supabase/ssr';
import type { Database } from '@/db/database.types';

/**
 * Tworzy klienta Supabase dla środowiska przeglądarki
 * Automatycznie zarządza cookies dla sesji
 */
export function createBrowserClient(supabaseUrl: string, supabaseKey: string) {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        const cookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith(`${name}=`));
        return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
      },
      set(name: string, value: string, options: any) {
        let cookie = `${name}=${encodeURIComponent(value)}`;
        if (options?.maxAge) cookie += `; max-age=${options.maxAge}`;
        if (options?.path) cookie += `; path=${options.path}`;
        if (options?.sameSite) cookie += `; samesite=${options.sameSite}`;
        if (options?.secure) cookie += '; secure';
        document.cookie = cookie;
      },
      remove(name: string, options: any) {
        document.cookie = `${name}=; max-age=0; path=${options?.path || '/'}`;
      },
    },
  });
}
```

**Użycie w komponentach React**:
```tsx
import { createBrowserClient } from '@/lib/supabase/client';

export function LoginForm({ supabaseUrl, supabaseKey }: LoginFormProps) {
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password
    });
  };
}
```

#### 4.2.3. Flow autentykacji w architekturze Astro SSR

**Scenariusz A: Logowanie użytkownika**

1. **Client-side** (React `LoginForm`):
   - Użytkownik wypełnia formularz
   - Walidacja Zod
   - Wywołanie `supabase.auth.signInWithPassword()`
   - Supabase zwraca session (access_token, refresh_token)
   - Token zapisywany w cookies automatycznie przez `@supabase/ssr`

2. **Redirect**:
   - `window.location.href = '/dashboard'` (full page reload)
   - Reload jest konieczny, aby Astro server-side mógł odczytać nowe cookies

3. **Server-side** (Astro `/dashboard.astro`):
   - Request zawiera cookies z JWT tokenem
   - Middleware inicjalizuje klienta Supabase z tokenem z nagłówka/cookies
   - Strona wywołuje `Astro.locals.supabase.auth.getSession()` w frontmatter
   - Jeśli sesja istnieje → renderowanie strony
   - Jeśli nie → przekierowanie do logowania

**Scenariusz B: Dostęp do chronionej strony po zalogowaniu**

1. **Request przeglądarki**:
   - Użytkownik klika link `/plans/create`
   - Request automatycznie zawiera cookies z JWT

2. **Server-side** (Astro `/plans/create.astro`):
   - Middleware pobiera token z cookies/nagłówka
   - Guard `requireAuth(Astro)` weryfikuje sesję
   - Jeśli sesja ważna → renderowanie strony z danymi użytkownika
   - Jeśli nie → przekierowanie do logowania

**Scenariusz C: Automatyczne odświeżanie tokenu**

1. **Client-side** (React component):
   - Klient Supabase automatycznie sprawdza ważność tokenu
   - Jeśli token wygasł, ale refresh_token jest ważny → automatyczne wywołanie `refreshSession()`
   - Nowy token zapisywany w cookies
   - Request kontynuowany z nowym tokenem

2. **Server-side**:
   - Opcjonalnie: middleware może wykryć wygasły token i próbować odświeżyć przed przetworzeniem żądania

### 4.3. Zarządzanie sesjami i tokenami JWT

#### 4.3.1. Struktura JWT tokenu Supabase

**Access Token** (JWT) zawiera:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "aud": "authenticated",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Refresh Token**:
- Opaque token (nie JWT)
- Używany tylko do odświeżania access token
- Długa ważność (domyślnie 30 dni)

#### 4.3.2. Cykl życia sesji

**A. Utworzenie sesji** (po logowaniu/rejestracji):
1. Wywołanie `supabase.auth.signInWithPassword()` lub `signUp()`
2. Supabase zwraca obiekt session:
```typescript
{
  access_token: string;
  refresh_token: string;
  expires_in: number; // sekundy do wygaśnięcia
  expires_at: number; // timestamp wygaśnięcia
  user: User;
}
```
3. Klient Supabase automatycznie zapisuje tokeny w cookies:
   - `sb-access-token`
   - `sb-refresh-token`

**B. Odświeżanie sesji** (automatyczne):
1. Klient Supabase wykrywa wygaśnięcie access_token (sprawdza `expires_at`)
2. Automatyczne wywołanie `supabase.auth.refreshSession()` z refresh_token
3. Otrzymanie nowych tokenów
4. Aktualizacja cookies

**C. Wygaśnięcie sesji**:
1. Jeśli refresh_token również wygasł (po 30 dniach nieaktywności)
2. Wywołanie `supabase.auth.getSession()` zwraca error
3. Użytkownik musi się ponownie zalogować

**D. Wylogowanie**:
1. Wywołanie `supabase.auth.signOut()`
2. Usunięcie tokenów z cookies
3. Invalidacja sesji po stronie Supabase (token blacklisting)

#### 4.3.3. Strategia "Remember Me"

**Implementacja** (opcjonalna, do rozszerzenia `LoginForm`):

```typescript
const handleLogin = async (rememberMe: boolean) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (data.session && rememberMe) {
    // Przedłużenie ważności refresh token w cookies (60 dni zamiast 30)
    document.cookie = `sb-refresh-token=${data.session.refresh_token}; max-age=${60 * 24 * 60 * 60}; path=/; samesite=lax`;
  }
};
```

**Alternatywa**: Wykorzystanie `localStorage` zamiast cookies (mniej bezpieczne, podatne na XSS):
```typescript
if (rememberMe) {
  localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
}
```

#### 4.3.4. Obsługa równoczesnych sesji

**Strategia**: Supabase domyślnie pozwala na wiele równoczesnych sesji (różne urządzenia/przeglądarki)

**Opcjonalne ograniczenie** (jeśli wymagane):
- Trigger PostgreSQL wykrywający nową sesję dla użytkownika
- Invalidacja poprzednich tokenów poprzez Supabase Admin API
- Implementacja tabeli `user_sessions` z trackowaniem aktywnych sesji

### 4.4. Row Level Security (RLS) policies

#### 4.4.1. Polityki RLS dla tabeli `profiles`

**Istniejące polityki** (zgodnie z `/src/db/database.types.ts`):

```sql
-- Użytkownicy mają dostęp tylko do własnego profilu
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Dodatkowa polityka dla adminów** (jeśli admini mają zarządzać profilami):
```sql
CREATE POLICY "Admins can manage all profiles"
ON profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

#### 4.4.2. Polityki RLS dla pozostałych tabel

**training_plans**:
```sql
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own plans"
ON training_plans FOR ALL
USING (auth.uid() = user_id);
```

**workouts**:
```sql
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workouts"
ON workouts FOR ALL
USING (auth.uid() = user_id);
```

**categories** (publiczny odczyt, admin edycja):
```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
USING (true);

CREATE POLICY "Admins can manage categories"
ON categories FOR INSERT, UPDATE, DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

**exercises** (analogicznie do categories):
```sql
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercises"
ON exercises FOR SELECT
USING (true);

CREATE POLICY "Admins can manage exercises"
ON exercises FOR INSERT, UPDATE, DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

#### 4.4.3. Testowanie RLS policies

**Przykładowe testy** (do wykonania w Supabase SQL Editor z różnymi użytkownikami):

```sql
-- Test 1: Użytkownik może zobaczyć tylko swój profil
SET request.jwt.claim.sub = 'user-uuid-1';
SELECT * FROM profiles; -- Powinien zwrócić tylko profil user-uuid-1

-- Test 2: Użytkownik nie może edytować cudzego profilu
UPDATE profiles SET name = 'Hacker' WHERE user_id = 'user-uuid-2';
-- Powinien zwrócić 0 rows updated

-- Test 3: Admin może zobaczyć wszystkie profile
SET request.jwt.claim.sub = 'admin-uuid';
SELECT * FROM profiles; -- Powinien zwrócić wszystkie profile

-- Test 4: Użytkownik nie może tworzyć profilu dla innego użytkownika
INSERT INTO profiles (user_id, name, weight, height)
VALUES ('other-user-uuid', 'Fake', 70, 180);
-- Powinien zwrócić błąd RLS violation
```

### 4.5. Bezpieczeństwo i best practices

#### 4.5.1. Przechowywanie haseł

**Supabase Auth** automatycznie:
- Hashuje hasła używając bcrypt
- Dodaje salt do każdego hasła
- Przechowuje hashe w tabeli `auth.users` (nie dostępna bezpośrednio dla użytkowników)

**Aplikacja NIE powinna**:
- Przechowywać haseł w plain text
- Implementować własnego hashowania (Supabase robi to automatycznie)
- Ekspozycji hashy w API responses

#### 4.5.2. Ochrona przed atakami

**A. Brute Force Protection**

Supabase ma wbudowaną ochronę przed brute force:
- Rate limiting na logowanie (domyślnie 5 prób / 15 min)
- Automatyczne blokowanie IP po przekroczeniu limitów

**Dodatkowa ochrona client-side** (opcjonalna):
```typescript
// Implementacja cooldown po nieudanej próbie logowania
let failedAttempts = 0;
let cooldownUntil = 0;

const handleLogin = async () => {
  if (Date.now() < cooldownUntil) {
    toast.error(`Zbyt wiele prób. Spróbuj ponownie za ${Math.ceil((cooldownUntil - Date.now()) / 1000)}s`);
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    failedAttempts++;
    if (failedAttempts >= 3) {
      cooldownUntil = Date.now() + 60000; // 60s cooldown
      toast.error('Zbyt wiele nieudanych prób. Odczekaj 60 sekund.');
    }
  } else {
    failedAttempts = 0;
  }
};
```

**B. XSS Protection**

- Używanie `httpOnly` cookies dla tokenów (automatyczne w Supabase)
- Sanityzacja inputów przed renderowaniem
- Content Security Policy (CSP) headers

**C. CSRF Protection**

Supabase automatycznie zabezpiecza przed CSRF poprzez:
- `SameSite=Lax` cookies
- Weryfikacja origin headers

**D. SQL Injection**

- Row Level Security (RLS) policies
- Prepared statements w Supabase queries (automatyczne)
- Walidacja wszystkich inputów z Zod przed zapytaniami

#### 4.5.3. HTTPS i bezpieczna komunikacja

**Development**:
- HTTP dopuszczalny dla localhost

**Production** (WYMAGANE):
- HTTPS dla wszystkich requestów
- Konfiguracja SSL certyfikatu (Let's Encrypt)
- HSTS headers: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- Redirect HTTP → HTTPS

#### 4.5.4. Logowanie i monitorowanie

**A. Logi autentykacji**

Supabase automatycznie loguje:
- Próby logowania (sukces/błąd)
- Rejestracje
- Zmiany haseł
- Tokeny refresh

Dostęp do logów: Supabase Dashboard → Authentication → Logs

**B. Alerty bezpieczeństwa**

Konfiguracja alertów dla:
- Nietypowa liczba nieudanych prób logowania
- Logowanie z nowych lokalizacji geograficznych
- Zmiany haseł administratorów

**C. Audit trail**

Opcjonalnie: implementacja tabeli `audit_logs` dla krytycznych operacji:
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. PODSUMOWANIE I WYTYCZNE IMPLEMENTACYJNE

### 5.1. Priorytetyzacja zadań

**Faza 1: Podstawowa autentykacja** (MVP)
1. Utworzenie stron `/auth/login.astro` i `/auth/register.astro`
2. Implementacja komponentów `LoginForm.tsx` i `RegisterForm.tsx`
3. Endpoint `POST /api/auth/register` dla tworzenia profili
4. Guard funkcje `requireAuth()` i `requireAdmin()`
5. Ochrona istniejących stron chronionych (dashboard, profile, plans, workouts)
6. Aktualizacja `Navigation.astro` z warunkowymi elementami

**Faza 2: Odzyskiwanie hasła**
1. Strony `/auth/forgot-password.astro` i `/auth/reset-password.astro`
2. Komponenty `ForgotPasswordForm.tsx` i `ResetPasswordForm.tsx`
3. Konfiguracja email templates w Supabase

**Faza 3: Weryfikacja email**
1. Strona `/auth/verify-email.astro`
2. Obsługa tokenów weryfikacyjnych
3. Konfiguracja redirect URLs w Supabase

**Faza 4: Usprawnienia UX**
1. Komponent `UserMenu.tsx` z dropdown
2. Remember me functionality
3. Session expiration warnings
4. Loading states i skeleton screens

**Faza 5: Bezpieczeństwo i monitoring**
1. Rate limiting client-side
2. Audit logs
3. Security headers (CSP, HSTS)
4. Testy E2E autentykacji

### 5.2. Najważniejsze zależności między modułami

**Diagram zależności**:
```
[Strony Astro (.astro)]
    ↓ używa
[Guard Functions (requireAuth, requireAdmin)]
    ↓ wywołuje
[Middleware (Supabase client initialization)]
    ↓ dostarcza
[context.locals.supabase]
    ↓ wykorzystywane przez
[Komponenty React (.tsx)] + [Endpointy API]
    ↓ wywołują
[Supabase Auth API]
    ↓ zarządza
[JWT Tokens w Cookies] + [Database (auth.users, profiles)]
    ↓ chronione przez
[Row Level Security Policies]
```

### 5.3. Checklist integracji z istniejącym kodem

**Komponenty do aktualizacji**:
- [ ] `/src/components/Navigation.astro` - dodanie warunkowego renderowania menu
- [ ] `/src/layouts/Layout.astro` - przekazanie informacji o sesji do Navigation
- [ ] `/src/pages/index.astro` - personalizacja dla zalogowanych użytkowników
- [ ] `/src/pages/profile/index.astro` - ochrona requireAuth()
- [ ] `/src/pages/dashboard.astro` - ochrona requireAuth()
- [ ] `/src/pages/plans/**/*.astro` - ochrona requireAuth()
- [ ] `/src/pages/workouts/**/*.astro` - ochrona requireAuth()
- [ ] `/src/pages/admin/**/*.astro` - ochrona requireAdmin()

**Nowe pliki do utworzenia**:
- [ ] `/src/pages/auth/login.astro`
- [ ] `/src/pages/auth/register.astro`
- [ ] `/src/pages/auth/forgot-password.astro`
- [ ] `/src/pages/auth/reset-password.astro`
- [ ] `/src/pages/auth/verify-email.astro`
- [ ] `/src/components/auth/RegisterForm.tsx`
- [ ] `/src/components/auth/ForgotPasswordForm.tsx`
- [ ] `/src/components/auth/ResetPasswordForm.tsx`
- [ ] `/src/components/auth/UserMenu.tsx`
- [ ] `/src/lib/auth/guards.ts`
- [ ] `/src/lib/supabase/client.ts`
- [ ] `/src/lib/services/auth.ts`
- [ ] `/src/lib/utils/error-handler.ts`
- [ ] `/src/pages/api/auth/register.ts`

**Rozszerzenia istniejących plików**:
- [ ] `/src/lib/schemas/auth.ts` - dodanie nowych schematów walidacji
- [ ] `/src/middleware/index.ts` - opcjonalne usprawnienia (auto-refresh)

### 5.4. Kryteria akceptacji wdrożenia

**Funkcjonalne**:
- ✅ Użytkownik może się zarejestrować z walidacją danych (US-001)
- ✅ Email weryfikacyjny wysyłany po rejestracji (US-001)
- ✅ Użytkownik może się zalogować i wylogować (US-001)
- ✅ Link do resetowania hasła ważny 24h (US-001)
- ✅ Sesja JWT ważna z auto-refresh (US-001)
- ✅ Wszystkie chronione strony wymagają logowania (US-002, US-005-US-011, US-013)
- ✅ Przycisk logowania/wylogowania w prawym górnym rogu (US-013)
- ✅ Brak integracji z zewnętrznymi serwisami OAuth (US-013)

**Bezpieczeństwo**:
- ✅ Hasła hashowane i nie przechowywane w plain text
- ✅ RLS policies aktywne dla wszystkich tabel
- ✅ HTTPS w środowisku produkcyjnym
- ✅ Tokeny JWT w httpOnly cookies
- ✅ Walidacja wszystkich inputów z Zod

**UX**:
- ✅ Komunikaty błędów po polsku i zrozumiałe
- ✅ Loading states podczas operacji async
- ✅ Automatyczne przekierowania po zalogowaniu/wylogowaniu
- ✅ Parametr `redirect` zachowany po nieautoryzowanym dostępie
- ✅ Toast notifications dla operacji sukcesu/błędu

**Techniczne**:
- ✅ TypeScript strict mode bez błędów
- ✅ Komponenty zgodne z istniejącą architekturą (Astro SSR + React client-side)
- ✅ Wykorzystanie istniejącego middleware i klientów Supabase
- ✅ Zgodność z ESLint i Prettier
- ✅ Brak duplikacji kodu (reużywalne guard functions)

### 5.5. Metryki sukcesu

**Wydajność**:
- Czas logowania < 1s (od submit do redirect)
- Czas rejestracji < 2s
- Czas weryfikacji sesji server-side < 100ms

**Dostępność**:
- Uptime autentykacji > 99.9%
- Rate limit errors < 0.1% requestów

**Bezpieczeństwo**:
- Zero incydentów bezpieczeństwa (XSS, SQL injection, CSRF)
- 100% requestów przez HTTPS w produkcji

**Użyteczność**:
- < 5% użytkowników klikających "Zapomniałeś hasła?"
- > 95% użytkowników weryfikujących email w ciągu 24h

---

## 6. APPENDIX

### 6.1. Przykładowy kod implementacji

**A. Chroniona strona Astro**

```astro
---
// src/pages/dashboard.astro
import { requireAuth, getUserProfile } from '@/lib/auth/guards';
import Layout from '@/layouts/Layout.astro';

const userId = await requireAuth(Astro);
if (!userId) return; // Już przekierowano do logowania

const profile = await getUserProfile(Astro);
---

<Layout title="Dashboard" showNavigation>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-4">
      Witaj, {profile?.name || 'Użytkowniku'}!
    </h1>
    <!-- Reszta contentu dashboard -->
  </div>
</Layout>
```

**B. Endpoint rejestracji profilu**

```typescript
// src/pages/api/auth/register.ts
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { handleApiError, ApiError } from '@/lib/utils/error-handler';

export const prerender = false;

const RegisterProfileSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  weight: z.number().positive().max(500),
  height: z.number().positive().max(300),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Weryfikacja tokenu JWT
    const { data: { user }, error: authError } = await locals.supabase.auth.getUser();

    if (authError || !user) {
      throw new ApiError(401, 'Unauthorized');
    }

    // Parsowanie i walidacja danych
    const body = await request.json();
    const validatedData = RegisterProfileSchema.parse(body);

    // Sprawdzenie czy profil już nie istnieje
    const { data: existingProfile } = await locals.supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      throw new ApiError(409, 'Profile already exists');
    }

    // Utworzenie profilu
    const { data: newProfile, error } = await locals.supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        weight: validatedData.weight,
        height: validatedData.height,
        role: 'user',
      })
      .select()
      .single();

    if (error) {
      throw new ApiError(500, 'Failed to create profile', error);
    }

    return new Response(JSON.stringify(newProfile), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return handleApiError(error);
  }
};
```

**C. Komponent RegisterForm**

```tsx
// src/components/auth/RegisterForm.tsx
import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';

import type { Database } from '@/db/database.types';
import { RegisterSchema } from '@/lib/schemas/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegisterFormProps {
  supabaseUrl: string;
  supabaseKey: string;
}

export function RegisterForm({ supabaseUrl, supabaseKey }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    weight: '',
    height: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error dla tego pola
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Walidacja client-side
      const validatedData = RegisterSchema.parse({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        name: formData.name,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
      });

      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);

      // Rejestracja w Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (authError) {
        toast.error(authError.message);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error('Nie udało się utworzyć konta');
        setIsLoading(false);
        return;
      }

      // Utworzenie profilu
      const profileResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.session?.access_token}`,
        },
        body: JSON.stringify({
          name: validatedData.name,
          weight: validatedData.weight,
          height: validatedData.height,
        }),
      });

      if (!profileResponse.ok) {
        toast.error('Nie udało się utworzyć profilu');
        setIsLoading(false);
        return;
      }

      // Sukces
      toast.success('Konto utworzone! Sprawdź email, aby zweryfikować adres.');
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);

    } catch (error) {
      if (error instanceof z.ZodError) {
        // Mapowanie błędów Zod na pola formularza
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error('Wystąpił nieoczekiwany błąd');
      }
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Rejestracja</CardTitle>
        <CardDescription>Stwórz nowe konto i zacznij śledzić swoje treningi</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={isLoading}
              required
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              disabled={isLoading}
              required
            />
            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              disabled={isLoading}
              required
            />
            {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Imię</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              disabled={isLoading}
              required
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Waga (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                disabled={isLoading}
                required
              />
              {errors.weight && <p className="text-sm text-red-600">{errors.weight}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Wzrost (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => handleChange('height', e.target.value)}
                disabled={isLoading}
                required
              />
              {errors.height && <p className="text-sm text-red-600">{errors.height}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <a href="/auth/login" className="text-primary hover:underline">
              Masz już konto? Zaloguj się
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

### 6.2. Diagram przepływu danych

```
┌──────────────────┐
│  Użytkownik      │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Formularz Logowania (React)             │
│  - Walidacja Zod                         │
│  - supabase.auth.signInWithPassword()    │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Supabase Auth API                       │
│  - Weryfikacja hasła (bcrypt)            │
│  - Generowanie JWT (access + refresh)    │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Client (Browser)                        │
│  - Zapisanie tokenów w cookies           │
│  - Redirect do /dashboard                │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Request do /dashboard                   │
│  - Cookies z JWT tokenem                 │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Astro Middleware                        │
│  - Inicjalizacja Supabase client         │
│  - Przypisanie do context.locals         │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  dashboard.astro (Server-Side)           │
│  - requireAuth(Astro)                    │
│  - Pobieranie danych profilu             │
│  - Renderowanie HTML                     │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  Strona HTML     │
│  dla użytkownika │
└──────────────────┘
```

---

## Koniec specyfikacji
