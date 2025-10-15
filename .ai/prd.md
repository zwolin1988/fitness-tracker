# Dokument wymagań produktu (PRD) - Fitness Tracker

## 1. Przegląd produktu
Fitness Tracker to aplikacja webowa umożliwiająca użytkownikom tworzenie i wykonywanie spersonalizowanych planów treningowych oraz śledzenie postępów. Użytkownik rejestruje się i loguje, ustawia profil (imię, waga, wzrost), tworzy plan z listy ćwiczeń, definiuje serie (powtórzenia, ciężar), wykonuje trening zgodnie z planem, modyfikuje parametry i oznacza wykonane serie. Po zakończeniu sesji aplikacja prezentuje podsumowanie i wizualizacje postępów.

## 2. Problem użytkownika
Użytkownicy nie mają jednej, łatwej w użyciu platformy webowej, która pozwoliłaby im:
- szybko tworzyć plany treningowe i modyfikować je,
- rejestrować wykonane serie z parametrami takimi jak ciężar i liczba powtórzeń,
- widzieć w czasie rzeczywistym i okresowo statystyki swoich postępów,
- zachować dane treningowe w bezpiecznym i skalowalnym środowisku.

## 3. Wymagania funkcjonalne
1. uwierzytelnianie i autoryzacja
   - rejestracja e-mail/hasło, reset hasła, sesje JWT
2. zarządzanie profilem użytkownika
   - pola: imię, waga, wzrost; CRUD profilu
3. kategorie ćwiczeń
   - osobna encja z nazwą, opisem i obrazkiem
   - każde ćwiczenie przypisane do jednej kategorii
4. baza ćwiczeń
   - rekordy z nazwą, opisem, ikoną SVG, poziomem trudności, przypisaniem do kategorii
   - możliwość filtrowania po kategorii i poziomie trudności
5. tworzenie planu treningowego
   - podanie nazwy i opisu, wybór ćwiczeń, limit 7 aktywnych planów
6. definiowanie serii w planie
   - dla każdego ćwiczenia dodanie serii z liczbą powtórzeń i ciężarem
7. realizacja treningu
   - wybór planu, data i godzina startu/zakończenia, modyfikacja parametrów, oznaczenie wykonania serii
8. podsumowanie treningu
   - liczba ćwiczeń, liczba serii, łączna liczba powtórzeń, maksymalny ciężar, całkowita objętość (suma kg)
9. dashboard i wizualizacje
   - wykres objętości tygodniowej, wykres maksymalnego ciężaru na sesję, filtr okresu
10. obsługa błędów
    - kody HTTP: 401 (przekierowanie), 400/422 (toasty), 500 (modal z retry)
11. responsive UI i dostępność
    - Tailwind CSS breakpointy sm, md, lg, xl; zgodność WCAG minimalnie na poziomie A
12. pipeline CI/CD
    - GitHub Actions + Supabase CLI, środowiska develop/staging/master, automatyczne testy, deploy na staging i production
13. testy
    - jednostkowe (Jest + React Testing Library), e2e (Cypress), minimalne pokrycie logiki 70%

## 4. Granice produktu
- platforma webowa wyłącznie; brak natywnego mobilnego klienta w MVP
- brak integracji z zewnętrznymi urządzeniami i serwisami w MVP
- limit 7 aktywnych planów na użytkownika
- ikony SVG przechowywane w Supabase Storage według kategorii ćwiczeń
- brak trybu offline w MVP
- backup bazy: codzienne snapshoty z retencją 30 dni; migracje wersjonowane w Supabase

## 5. Historyjki użytkowników
- ID: US-001  
  Tytuł: rejestracja i logowanie  
  Opis: użytkownik tworzy konto e-mail/hasło, loguje się i resetuje zapomniane hasło  
  Kryteria akceptacji:  
  - formularz rejestracji waliduje e-mail i hasło  
  - po rejestracji użytkownik otrzymuje e-mail weryfikacyjny  
  - reset hasła generuje tymczasowy link ważny 24h  
  - sesja JWT ważna 24h, auto-refresh tokenu w background

- ID: US-002  
  Tytuł: edycja profilu  
  Opis: użytkownik wprowadza i modyfikuje dane: imię, waga, wzrost  
  Kryteria akceptacji:  
  - formularz edycji profilu zapisuje zmiany w tabeli profiles  
  - walidacja pól: waga i wzrost muszą być > 0  
  - profil odczytywany po każdym logowaniu
  - Funkcjonalność edycja profilu nie jest dostępna bez logowania się do systemu (US-001).  

- ID: US-003
  Tytuł: przegląd kategorii ćwiczeń
  Opis: użytkownik przegląda listę kategorii z obrazkami i opisami
  Kryteria akceptacji:
  - lista kategorii wyświetla nazwę, opis i obrazek
  - kliknięcie w kategorię prowadzi do przefiltrowanej listy ćwiczeń

- ID: US-004
  Tytuł: przegląd bazy ćwiczeń
  Opis: użytkownik przegląda listę ćwiczeń z opisami, ikonami i przypisanymi kategoriami
  Kryteria akceptacji:
  - lista ćwiczeń paginowana, filtrowalna po kategorii (ID) i poziomie trudności
  - każda pozycja wyświetla nazwę, opis, ikonę SVG, poziom trudności, nazwę kategorii  

- ID: US-005
  Tytuł: tworzenie planu treningowego
  Opis: użytkownik nadaje nazwę, opcjonalny opis, wybiera ćwiczenia do planu
  Kryteria akceptacji:
  - limit 7 aktywnych planów; próba utworzenia 8. planu pokazuje komunikat o limicie
  - wybór ćwiczeń z bazy zapisuje rekordy w plan_exercises
  - Funkcjonalność tworzenie planu treningowego nie jest dostępna bez logowania się do systemu (US-001).

- ID: US-006
  Tytuł: definiowanie serii w planie
  Opis: użytkownik dodaje do każdego ćwiczenia serię z liczbą powtórzeń i ciężarem
  Kryteria akceptacji:
  - walidacja powtórzeń > 0, ciężar >= 0
  - rekordy zapisane w plan_exercise_sets
  - Funkcjonalność definiowanie serii w planie nie jest dostępna bez logowania się do systemu (US-001).

- ID: US-007
  Tytuł: rozpoczęcie treningu
  Opis: użytkownik wybiera plan i klika „rozpocznij", zapisuje datę i godzinę startu
  Kryteria akceptacji:
  - nowy rekord w workouts ze znacznikiem startu
  - UI zmienia się na tryb treningu z listą ćwiczeń i serii
  - Funkcjonalność rozpoczęcie treningu nie jest dostępna bez logowania się do systemu (US-001).

- ID: US-008
  Tytuł: modyfikacja parametrów serii
  Opis: podczas treningu użytkownik zmienia liczbę powtórzeń lub ciężar każdej serii
  Kryteria akceptacji:
  - zmiana zapisywana w czasie rzeczywistym w workout_sets
  - walidacja zmian analogiczna do planu
  - Funkcjonalność modyfikacja parametrów serii nie jest dostępna bez logowania się do systemu (US-001).

- ID: US-009
  Tytuł: oznaczenie wykonanej serii
  Opis: użytkownik zaznacza każdą wykonaną serię jako ukończoną
  Kryteria akceptacji:
  - zmiana statusu w workout_sets
  - wizualne odznaczenie ukończonej serii
  - Funkcjonalność oznaczenie wykonanej serii nie jest dostępna bez logowania się do systemu (US-001).

- ID: US-010
  Tytuł: zakończenie treningu i podsumowanie
  Opis: użytkownik kończy sesję, zapisuje datę zakończenia i otrzymuje podsumowanie
  Kryteria akceptacji:
  - rekord workouts uzupełniony datą zakończenia
  - statystyki: liczba ćwiczeń, liczba serii, suma powtórzeń, maksymalny ciężar, całkowita objętość
  - Funkcjonalność zakończenie treningu i podsumowanie nie jest dostępna bez logowania się do systemu (US-001).

- ID: US-011
  Tytuł: przegląd dashboardu
  Opis: użytkownik ogląda wykres objętości tygodniowej i maksymalnego ciężaru na sesję
  Kryteria akceptacji:
  - dwa wykresy z danymi z ostatnich 7 dni
  - możliwość filtrowania zakresu (tygodniowo, miesięcznie)
  - Funkcjonalność dashboardu nie jest dostępna bez logowania się do systemu (US-001).

- ID: US-012
  Tytuł: obsługa błędów sieci i serwera
  Opis: użytkownik otrzymuje czytelne komunikaty w przypadku błędów HTTP
  Kryteria akceptacji:
  - 401 przekierowuje do logowania
  - 400/422 wyświetla toaster z detalami błędu walidacji
  - 500 wyświetla modal z opcją ponowienia żądania 

- ID: US-013 
- Tytuł: Bezpieczny dostęp i uwierzytelnianie
- Opis: Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych.
- Kryteria akceptacji:
  - Logowanie i rejestracja odbywają się na dedykowanych stronach.
  - Logowanie wymaga podania adresu email i hasła.
  - Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.

  - Użytkownik NIE MOŻE korzystać z funkcji edycja profilu bez logowania się do systemu (US-002).
  - Użytkownik NIE MOŻE korzystać z funkcji tworzenie planu treningowego bez logowania się do systemu (US-005).
  - Użytkownik NIE MOŻE korzystać z funkcji definiowanie serii w planie bez logowania się do systemu (US-006).
  - Użytkownik NIE MOŻE korzystać z funkcji rozpoczęcie treningu bez logowania się do systemu (US-007).
  - Użytkownik NIE MOŻE korzystać z funkcji modyfikacja parametrów serii bez logowania się do systemu (US-008).
  - Użytkownik NIE MOŻE korzystać z funkcji oznaczenie wykonanej serii bez logowania się do systemu (US-009).
  - Użytkownik NIE MOŻE korzystać z funkcji zakończenie treningu i podsumowanie bez logowania się do systemu (US-010).
  - Użytkownik NIE MOŻE korzystać z funkcji przegląd dashboardu bez logowania się do systemu (US-011).

  - Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu.
  - Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
  - Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
  - Odzyskiwanie hasła powinno być możliwe.

## 6. Metryki sukcesu
1. liczba zakończonych treningów tygodniowo i miesięcznie  
2. łączna waga podnoszona w tygodniu i miesiącu  
3. średni czas od logowania do rozpoczęcia pierwszej sesji < 3 minuty  
4. pokrycie testami jednostkowymi i e2e ≥ 70% logiki biznesowej  
5. wskaźnik błędów produkcyjnych (error rate) < 1%  
6. aktywny odsetek użytkowników (dzienny retention) ≥ 30%  