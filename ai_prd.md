# Dokument wymagań produktu (PRD) - Fitness Tracker

## 1. Przegląd produktu
Fitness Tracker to aplikacja umożliwiająca tworzenie, przeglądanie, aktualizację oraz usuwanie danych związanych z treningami, ćwiczeniami i pomiarami ciała. System oferuje dynamiczną bazę ćwiczeń, narzędzia do tworzenia planów treningowych, śledzenia postępów użytkownika poprzez aktualizację statystyk po zakończeniu treningu oraz intuicyjny interfejs CRUD zapewniający bezpieczeństwo i integralność danych.

## 2. Problem użytkownika
Użytkownicy nie mają łatwego dostępu do narzędzi umożliwiających systematyczne rejestrowanie i monitorowanie swoich treningów oraz postępów. Obecne rozwiązania mogą być nieintuicyjne, nieelastyczne i nie zapewniają spójnego zarządzania danymi, co utrudnia kontrolę nad historią treningów i analizę postępów.

## 3. Wymagania funkcjonalne
- Operacje CRUD:
  - Create: Tworzenie nowych treningów, ćwiczeń i pomiarów.
  - Read: Odczyt historii treningów, statystyk oraz planów treningowych.
  - Update: Aktualizacja istniejących danych treningowych i pomiarowych.
  - Delete: Usuwanie danych, takich jak treningi i ćwiczenia.
- Dynamiczna baza ćwiczeń umożliwiająca dodawanie, edytowanie i usuwanie ćwiczeń.
- Mechanizm tworzenia planów treningowych oraz śledzenia postępów (Progress Tracking), z aktualizacją statystyk po zakończeniu treningu.
- System walidacji danych, który definiuje wymagane pola oraz ich poprawność podczas rejestracji i wstępnej oceny użytkownika.
- Przejrzysty interfejs CRUD zapewniający potwierdzenie operacji i walidację w celu ochrony integralności danych.
- Mechanizmy integracji danych i formularze pozwalające na spójne zbieranie informacji.
- Możliwość rejestrowania pomiarów ciała do monitorowania postępów użytkownika.

## 4. Granice produktu
- MVP będzie koncentrował się na kluczowych funkcjonalnościach: Progress Tracking, Baza Ćwiczeń, Plany Treningowe oraz Pomiary Ciała przy dynamicznym zarządzaniu bazą ćwiczeń.
- Statystyki będą aktualizowane po zakończeniu treningu, a nie w czasie rzeczywistym.
- Integracje z urządzeniami zewnętrznymi (wearables) nie są priorytetem obecnej wersji produktu.
- Wstępny zakres projektu nie obejmuje ustalonego harmonogramu wdrożenia oraz szczegółowej analizy zasobów.

## 5. Historyjki użytkowników
- ID: US-001  
  Tytuł: Rejestracja i logowanie użytkownika  
  Opis: Jako nowy użytkownik chcę móc się zarejestrować i zalogować do aplikacji, aby uzyskać dostęp do funkcji monitorowania postępów.  
  Kryteria akceptacji:
  - Użytkownik może utworzyć konto poprzez wprowadzenie wymaganych pól.
  - System waliduje dane i wyświetla komunikaty o błędach w przypadku nieprawidłowych danych.
  - Poprawne logowanie umożliwia dostęp do systemu.

- ID: US-002  
  Tytuł: Tworzenie nowego treningu  
  Opis: Jako użytkownik chcę móc tworzyć nowe treningi, wybierając ćwiczenia z dynamicznej bazy, aby móc planować efektywne sesje treningowe.  
  Kryteria akceptacji:
  - Użytkownik inicjuje proces tworzenia treningu.
  - System umożliwia wybór ćwiczeń z aktualnej bazy.
  - Po zapisaniu treningu, dane zostają przechwycone i statystyki aktualizowane po zakończeniu treningu.

- ID: US-003  
  Tytuł: Edycja treningu  
  Opis: Jako użytkownik chcę móc edytować istniejący trening, aby dostosować go do zmieniających się potrzeb i celów.  
  Kryteria akceptacji:
  - Użytkownik wybiera trening do edycji.
  - System umożliwia modyfikację informacji treningowych.
  - Zmiany są zapisane i widoczne w historii treningów.

- ID: US-004  
  Tytuł: Usuwanie treningu  
  Opis: Jako użytkownik chcę mieć możliwość usunięcia niepotrzebnego treningu, aby utrzymać porządek w mojej historii treningów.  
  Kryteria akceptacji:
  - Użytkownik wybiera trening do usunięcia.
  - System wymaga potwierdzenia przed usunięciem.
  - Wybrany trening zostaje trwale usunięty z systemu.

- ID: US-005  
  Tytuł: Zarządzanie bazą ćwiczeń  
  Opis: Jako użytkownik z odpowiednimi uprawnieniami chcę móc dodawać, edytować i usuwać ćwiczenia w bazie, aby zapewnić jej aktualność i trafność.  
  Kryteria akceptacji:
  - Formularz umożliwia dodawanie nowych ćwiczeń.
  - System pozwala na edycję i usuwanie istniejących ćwiczeń.
  - Zmiany są natychmiast widoczne dla wszystkich użytkowników.

- ID: US-006  
  Tytuł: Rejestrowanie pomiarów ciała  
  Opis: Jako użytkownik chcę móc wprowadzać pomiary ciała (np. waga, obwody) w celu monitorowania moich postępów.  
  Kryteria akceptacji:
  - Formularz umożliwia wprowadzanie danych pomiarowych.
  - System waliduje poprawność wprowadzonych danych.
  - Dane pomiarowe są przechowywane i prezentowane w formie statystyk.

- ID: US-007  
  Tytuł: Przegląd historii treningów i statystyk  
  Opis: Jako użytkownik chcę móc przeglądać historię moich treningów oraz uzyskiwać podsumowane statystyki, aby analizować swoje postępy.  
  Kryteria akceptacji:
  - Historia treningów jest dostępna i uporządkowana w interfejsie.
  - Statystyki są prezentowane w przejrzystej formie po zakończeniu treningu.
  - Użytkownik ma możliwość filtrowania i sortowania historycznych danych.

- ID: US-008  
  Tytuł: Tworzenie planu treningowego  
  Opis: Jako użytkownik chcę móc tworzyć spersonalizowane plany treningowe na podstawie dostępnych ćwiczeń, aby ułatwić proces planowania sesji treningowych.  
  Kryteria akceptacji:
  - Użytkownik może utworzyć nowy plan treningowy.
  - System umożliwia personalizację wybranych planów.
  - Stworzony plan treningowy jest widoczny i edytowalny w systemie.

## 6. Metryki sukcesu
- Liczba aktywnych użytkowników korzystających z aplikacji.
- Częstotliwość tworzenia, edycji i usuwania treningów oraz pomiarów.
- Liczba utworzonych i aktywnie używanych planów treningowych.
- Procent operacji CRUD przeprowadzonych bez błędów.
- Poziom zadowolenia użytkowników mierzony za pomocą regularnych ankiet i feedbacku z testów prototypowych.