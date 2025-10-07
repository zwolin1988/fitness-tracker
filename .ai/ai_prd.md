# Dokument wymagań produktu (PRD) - Fitness Tracker

## 1. Przegląd produktu  
Fitness Tracker to prosta i intuicyjna aplikacja webowa, która pozwala użytkownikom:
- zarządzać bazą ćwiczeń podzieloną na kategorie: plecy, barki, biceps, triceps, klatka, uda i pośladki, łydki, core, brzuch, cardio  
- tworzyć i śledzić sesje treningowe oparte na wybranych ćwiczeniach — przy zapisie treningu użytkownik wybiera ćwiczenie, określa liczbę serii i ciężar  
- przeglądać historię treningów oraz generować statystyki postępów (objętość, siła)  
- korzystać z gotowych planów treningowych i wykonywać trening na bazie wybranego planu  

## 2. Problem użytkownika  
Obecne rozwiązania do śledzenia aktywności fizycznej często:
- nie umożliwiają kategoryzacji i personalizacji własnej bazy ćwiczeń  
- nie rejestrują szczegółowych parametrów treningu (serie + ciężar)  
- nie zachowują historycznego stanu ćwiczenia w treningu po jego edycji  
- oferują ograniczone możliwości planowania sesji treningowych  

Brak tych funkcji utrudnia użytkownikom planowanie i rzetelną analizę długoterminowych postępów.

## 3. Wymagania funkcjonalne  
1. Operacje CRUD:  
   - Create:  
     - Ćwiczenie: nazwa, kategoria (dokładnie jedna z listy), obrazek (SVG/PNG), krótki opis, link do YouTube, lista mięśni głównych i pomocniczych (tabela mięśni), poziom trudności, typ sprzętu  
     - Trening: data, lista pozycji treningowych (ćwiczenie + serie + ciężar)  
     - Plan treningowy: nazwa, opis, zestaw kolejnych ćwiczeń z parametrami (serie + domyślny ciężar)  
   - Read:  
     - Wyświetlanie listy i szczegółów ćwiczeń, planów, treningów  
     - Statystyki: wykresy objętości i siły w zadanym okresie  
   - Update:  
     - Edycja rekordów ćwiczeń, treningów i planów  
   - Delete:  
     - Usuwanie rekordów (ćwiczeń tylko przez admina, pozostałych przez właściciela)  
2. Dynamiczna baza ćwiczeń:  
   - Kategorie: plecy, barki, biceps, triceps, klatka, uda i pośladki, łydki, core, brzuch, cardio  
   - Ćwiczenie przypisane do dokładnie jednej kategorii  
3. Multimedialne zasoby:  
   - Format obrazków: SVG i PNG, upload (drag & drop lub wybór z media library)  
   - Linki do wideo: wyłącznie z YouTube  
   - Hostowanie w Supabase Storage, generowanie miniaturek i wersji responsywnych  
   - Polityka retencji do ustalenia  
4. Snapshot w historii treningu:  
   - Pozycja treningowa przechowuje kopię nazwy, opisu, obrazu i list mięśni z momentu utworzenia  
5. Autoryzacja i role:  
   - Rejestracja/logowanie: Supabase Auth  
   - Role: Admin (CRUD ćwiczeń), użytkownik (CRUD treningów i planów)  
   - RLS: dane widoczne tylko dla właściciela konta  
6. Wyszukiwanie i filtrowanie:  
   - Filtracja po kategorii ćwiczenia, wyszukiwanie po nazwie  
7. UX formularza dodawania ćwiczenia:  
   - Etapowe kroki: wybór kategorii, upload obrazu, wprowadzenie szczegółów, przypisanie mięśni  
   - Walidacja wymaganych pól i zakresów liczbowych  
8. Granice integracji:  
   - Brak integracji z urządzeniami wearable i funkcji społecznościowych w MVP  
   - Brak automatycznego uaktualniania planów po dodaniu nowego ćwiczenia  

## 4. Granice produktu  
- MVP:  
  - pełny CRUD ćwiczeń (admin), treningów i planów (użytkownik)  
  - snapshot treningu, hostowanie mediów, podstawowe statystyki  
- Po MVP (roadmap):  
  - społecznościowe udostępnianie, auto-suggest  
  - retencja i wersjonowanie mediów, moderacja nowych ćwiczeń  

## 5. Historyjki użytkowników  
### US-001  
Tytuł: Rejestracja i logowanie  
Opis: Jako nowy użytkownik chcę zarejestrować się i zalogować do aplikacji, aby korzystać z funkcji personalizowanych.  
Kryteria akceptacji:  
- Formularz rejestracji: email, hasło, potwierdzenie hasła  
- Walidacja formatu email i siły hasła  
- Użytkownik otrzymuje potwierdzenie rejestracji  
- Logowanie email + hasło; nieudane próby komunikują błąd  

### US-002  
Tytuł: CRUD ćwiczeń (admin)  
Opis: Jako administrator chcę tworzyć, edytować i usuwać ćwiczenia, aby utrzymać aktualność bazy.  
Kryteria akceptacji:  
- Formularz dodawania: nazwa, kategoria, obrazek, opis, link YouTube, mięśnie główne/pomocnicze, poziom trudności, typ sprzętu  
- Edycja i usuwanie w widoku listy; usunięcie wymaga potwierdzenia  

### US-003  
Tytuł: Tworzenie treningu manualnego  
Opis: Jako użytkownik chcę tworzyć treningi, wybierając ćwiczenia i podając serie oraz ciężar.  
Kryteria akceptacji:  
- Możliwość dodania dowolnej liczby pozycji treningowych  
- Dla każdej pozycji można wpisać serie i ciężar (>0)  
- Data domyślnie bieżąca, edytowalna  
- Po zapisaniu treningu pokazuje się podsumowanie i trening trafia do historii  

### US-004  
Tytuł: Tworzenie treningu na bazie planu  
Opis: Jako użytkownik chcę wybrać gotowy plan i uruchomić trening, aby wykonać serię ćwiczeń zgodnie z planem.  
Kryteria akceptacji:  
- Wybór planu z listy planów  
- Automatyczne załadowanie pozycji z domyślnymi ciężarami  
- Użytkownik oznacza każdą pozycję jako wykonaną  
- Po zakończeniu treningu generowane jest podsumowanie i zapis do historii  

### US-005  
Tytuł: Edycja treningu  
Opis: Jako użytkownik chcę edytować zapisany trening, aby dostosować go do zmian w planie.  
Kryteria akceptacji:  
- Możliwość modyfikacji ćwiczeń, liczby serii i ciężarów  
- Zmiany zapisywane po kliknięciu Zapisz i widoczne w historii  

### US-006  
Tytuł: Usuwanie treningu  
Opis: Jako użytkownik chcę usuwać niepotrzebne treningi, aby utrzymywać porządek w historii.  
Kryteria akceptacji:  
- Opcja Usuń przy każdym treningu; wymaga potwierdzenia  
- Po potwierdzeniu trening jest trwale usunięty  

### US-007  
Tytuł: Przegląd historii treningów i statystyk  
Opis: Jako użytkownik chcę przeglądać historię treningów i analizować statystyki, aby śledzić postępy.  
Kryteria akceptacji:  
- Lista treningów z datą i kluczowymi danymi  
- Wykresy objętości i siły za wybrany okres  
- Filtr po kategorii ćwiczenia i przedziale dat  

## 6. Metryki sukcesu  
- liczba zarejestrowanych i aktywnych użytkowników  
- średnia liczba treningów utworzonych miesięcznie  
- procent treningów z kompletnymi danymi (serie + ciężar)  
- liczba dodanych/edytowanych ćwiczeń w bazie  
- wskaźnik ukończenia treningu na bazie planu (odsetek zakończonych sesji)  
- ocena satysfakcji użytkowników z ankiet po MVP  