# Przewodnik Uprawnień - Admin vs Użytkownik

**Data:** 2025-01-13
**Status:** ✅ Aktualne z API

---

## 📊 Podsumowanie Uprawnień

| Kategoria | Admin | Użytkownik | Publiczne (bez logowania) |
|-----------|-------|------------|---------------------------|
| **Profile** | Swój profil | ✅ Swój profil | ❌ |
| **Categories** | ✅ CRUD (wszystkie) | 👁️ Odczyt (wszystkie) | 👁️ Odczyt (wszystkie) |
| **Exercises** | ✅ CRUD (wszystkie) | 👁️ Odczyt (wszystkie) | 👁️ Odczyt (wszystkie) |
| **Training Plans** | Swoje plany | ✅ CRUD (tylko swoje, max 7) | ❌ |
| **Workouts** | Swoje treningi | ✅ CRUD (tylko swoje) | ❌ |

---

## 👤 NORMALNY UŻYTKOWNIK (role: 'user')

### 1. Profil (/api/profile)
✅ **Może:**
- Pobrać swój profil (`GET /api/profile`)
- Zaktualizować swój profil (`PUT /api/profile`)
  - Zmienić imię
  - Zaktualizować wagę (musi być > 0)
  - Zaktualizować wzrost (musi być > 0)

❌ **Nie może:**
- Zobaczyć profili innych użytkowników
- Zmienić swój user_id
- Zmienić swoją rolę (role)

**Przykład:**
```bash
# Pobranie profilu
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/profile

# Aktualizacja profilu
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jan Kowalski","weight":75.5,"height":180}' \
  http://localhost:3000/api/profile
```

---

### 2. Kategorie (/api/categories)
✅ **Może (tylko odczyt):**
- Przeglądać wszystkie kategorie (`GET /api/categories`)
  - Z paginacją (?page=1&limit=20)
  - Posortowane od najnowszych
- Zobaczyć szczegóły kategorii (`GET /api/categories/{id}`)
  - Liczba ćwiczeń w kategorii

❌ **Nie może:**
- Tworzyć kategorii (tylko admin)
- Edytować kategorii (tylko admin)
- Usuwać kategorii (tylko admin)

**Przykład:**
```bash
# Lista kategorii (bez autoryzacji)
curl http://localhost:3000/api/categories?page=1&limit=20

# Szczegóły kategorii
curl http://localhost:3000/api/categories/550e8400-e29b-41d4-a716-446655440000
```

---

### 3. Ćwiczenia (/api/exercises)
✅ **Może (tylko odczyt):**
- Przeglądać wszystkie ćwiczenia (`GET /api/exercises`)
  - Filtrowanie po kategorii (?categoryId=...)
  - Filtrowanie po trudności (?difficulty=beginner|intermediate|advanced)
  - Paginacja (?page=1&limit=20)
- Zobaczyć szczegóły ćwiczenia (`GET /api/exercises/{id}`)
  - Informacje o kategorii
  - Opis, trudność, ikona SVG

❌ **Nie może:**
- Tworzyć ćwiczeń (tylko admin)
- Edytować ćwiczeń (tylko admin)
- Usuwać ćwiczeń (tylko admin)

**Przykład:**
```bash
# Lista ćwiczeń z filtrowaniem
curl "http://localhost:3000/api/exercises?difficulty=beginner&page=1"

# Szczegóły ćwiczenia
curl http://localhost:3000/api/exercises/exercise-uuid-here
```

---

### 4. Plany Treningowe (/api/plans)
✅ **Może (tylko swoje plany):**
- Stworzyć nowy plan (`POST /api/plans`)
  - ⚠️ **Limit: maksymalnie 7 aktywnych planów**
  - Podać nazwę, opis, listę exerciseIds
- Zobaczyć listę swoich planów (`GET /api/plans`)
  - Tylko własne plany (filtrowane przez user_id)
  - Plany soft-deleted są ukryte
- Zobaczyć szczegóły planu (`GET /api/plans/{id}`)
  - Lista ćwiczeń w planie
  - Wszystkie sety (plan_exercise_sets)
- Zaktualizować swój plan (`PUT /api/plans/{id}`)
  - Zmienić nazwę, opis
  - Zmienić listę ćwiczeń (exerciseIds)
- Usunąć swój plan (`DELETE /api/plans/{id}`)
  - **Soft delete** - plan zostaje w bazie z deleted_at
  - Plan znika z listy
  - Workout history jest zachowana

**Zarządzanie setami w planie:**
- Dodać set do planu (`POST /api/plans/{planId}/sets`)
  - exerciseId, repetitions, weight
  - set_order jest auto-generowany
- Zaktualizować set (`PUT /api/plans/{planId}/sets/{setId}`)
  - Zmienić repetitions, weight, set_order
- Usunąć set (`DELETE /api/plans/{planId}/sets/{setId}`)

❌ **Nie może:**
- Zobaczyć planów innych użytkowników
- Edytować planów innych użytkowników
- Stworzyć więcej niż 7 planów (error 403)
- Przywrócić soft-deleted planu (brak endpointu)

**Przykład:**
```bash
# Tworzenie planu
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FBW A",
    "description": "Full Body Workout A",
    "exerciseIds": ["ex-uuid-1", "ex-uuid-2", "ex-uuid-3"]
  }' \
  http://localhost:3000/api/plans

# Lista planów (tylko swoje)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/plans

# Dodanie setu do planu
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "exerciseId": "ex-uuid-1",
    "repetitions": 10,
    "weight": 50
  }' \
  http://localhost:3000/api/plans/plan-uuid/sets
```

---

### 5. Treningi (/api/workouts)
✅ **Może (tylko swoje treningi):**
- Rozpocząć trening (`POST /api/workouts`)
  - ⚠️ **Wymagany planId** - trening musi być oparty na planie
  - System automatycznie:
    - Tworzy workout z training_plan_id
    - Kopiuje wszystkie sety z planu do workout_sets
    - Ustawia start_time na NOW()
    - Oznacza wszystkie sety jako completed: false
- Zobaczyć listę swoich treningów (`GET /api/workouts`)
  - Filtrowanie po datach (?start_date=2025-01-01&end_date=2025-01-31)
  - Tylko własne treningi
  - Obliczone statystyki (duration, calories)
- Zobaczyć szczegóły treningu (`GET /api/workouts/{id}`)
  - Lista wszystkich setów
  - Informacje o ćwiczeniach
  - Statystyki treningu
- Zakończyć trening (`POST /api/workouts/{id}/end`)
  - Ustawia end_time na NOW()
  - Oblicza duration i estimated calories
  - ⚠️ Po zakończeniu trening jest READONLY (nie można modyfikować)

**Zarządzanie setami w treningu (tylko dla aktywnych treningów):**
- Dodać set do treningu (`POST /api/workouts/{id}/sets`)
  - exerciseId, repetitions, weight
  - set_order jest auto-generowany
  - ⚠️ Tylko jeśli trening nie jest zakończony
- Zaktualizować set (`PATCH /api/workouts/{workoutId}/sets/{setId}`)
  - Zmienić repetitions, weight
  - Oznaczyć jako completed: true/false
  - ⚠️ Tylko jeśli trening nie jest zakończony

❌ **Nie może:**
- Zobaczyć treningów innych użytkowników
- Edytować treningów innych użytkowników
- Rozpocząć treningu bez planu (planId jest wymagane)
- Modyfikować zakończony trening (error 409)
- Usunąć treningu (brak endpointu DELETE)

**Przykład:**
```bash
# Rozpoczęcie treningu z planu
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId": "plan-uuid-here"}' \
  http://localhost:3000/api/workouts

# Lista treningów
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/workouts?start_date=2025-01-01T00:00:00Z"

# Aktualizacja setu (oznaczenie jako ukończone)
curl -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}' \
  http://localhost:3000/api/workouts/workout-uuid/sets/set-uuid

# Zakończenie treningu
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/workouts/workout-uuid/end
```

---

## 👑 ADMINISTRATOR (role: 'admin')

### Wszystkie uprawnienia użytkownika PLUS:

### 1. Kategorie - Pełne CRUD (/api/admin/categories)
✅ **Dodatkowe uprawnienia:**
- Tworzyć kategorie (`POST /api/admin/categories`)
  - Walidacja unikalności nazwy
  - Body: { name (wymagane), description, imageUrl }
- Edytować kategorie (`PUT /api/admin/categories/{id}`)
  - Zmienić nazwę, opis, obrazek
  - Walidacja duplikatów
- Usuwać kategorie (`DELETE /api/admin/categories/{id}`)
  - ⚠️ Blokada jeśli istnieją powiązane ćwiczenia (error 409)
  - Musi najpierw usunąć/przenieść wszystkie exercises

**Przykład:**
```bash
# Tworzenie kategorii (ADMIN ONLY)
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Trening kardio",
    "description": "Ćwiczenia wytrzymałościowe",
    "imageUrl": "https://example.com/cardio.jpg"
  }' \
  http://localhost:3000/api/admin/categories

# Aktualizacja kategorii
curl -X PUT \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Trening cardio (nowa nazwa)"}' \
  http://localhost:3000/api/admin/categories/category-uuid

# Usunięcie kategorii
curl -X DELETE \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/admin/categories/category-uuid
```

---

### 2. Ćwiczenia - Pełne CRUD (/api/admin/exercises)
✅ **Dodatkowe uprawnienia:**
- Tworzyć ćwiczenia (`POST /api/admin/exercises`)
  - Body: { name, description, iconSvg, difficulty, categoryId }
  - Walidacja istnienia categoryId
  - Difficulty: 'beginner' | 'intermediate' | 'advanced'
- Edytować ćwiczenia (`PUT /api/admin/exercises/{id}`)
  - Zmienić wszystkie pola
  - Przenieść do innej kategorii
- Usuwać ćwiczenia (`DELETE /api/admin/exercises/{id}`)
  - ⚠️ Blokada jeśli używane w planach lub workoutach (error 409)
  - Musi najpierw usunąć z wszystkich planów

**Przykład:**
```bash
# Tworzenie ćwiczenia (ADMIN ONLY)
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Przysiad ze sztangą",
    "description": "Podstawowe ćwiczenie siłowe na nogi",
    "iconSvg": "<svg>...</svg>",
    "difficulty": "intermediate",
    "categoryId": "category-uuid-here"
  }' \
  http://localhost:3000/api/admin/exercises

# Aktualizacja ćwiczenia
curl -X PUT \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"difficulty": "advanced"}' \
  http://localhost:3000/api/admin/exercises/exercise-uuid

# Usunięcie ćwiczenia
curl -X DELETE \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/admin/exercises/exercise-uuid
```

---

### 3. Plany Treningowe & Treningi
⚠️ **Admin ma takie same uprawnienia jak user:**
- Admin widzi **tylko swoje plany** (nie wszystkich użytkowników)
- Admin widzi **tylko swoje treningi**
- Admin ma **limit 7 planów** (jak wszyscy)
- Admin **NIE MOŻE** zarządzać planami/treningami innych użytkowników

**Dlaczego?**
- Plany są prywatne dla każdego użytkownika
- Nie ma business case dla admina do ingerencji w treningi użytkowników
- RLS policy: `auth.uid() = user_id` działa dla wszystkich

---

## 🔒 Weryfikacja Autoryzacji

### Jak system sprawdza uprawnienia?

#### 1. Endpointy publiczne (bez tokena)
```typescript
// GET /api/categories
// GET /api/exercises
// Każdy może czytać - nie wymaga Authorization header
```

#### 2. Endpointy użytkownika (token JWT)
```typescript
// Middleware sprawdza JWT
const { data: { user }, error } = await supabase.auth.getUser();

if (error || !user) {
  return 401 Unauthorized
}

// RLS automatycznie filtruje po user_id
```

#### 3. Endpointy admina (token JWT + role check)
```typescript
// 1. Weryfikacja JWT
const { data: { user } } = await supabase.auth.getUser();

// 2. Sprawdzenie roli w profilu
const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("user_id", user.id)
  .single();

if (profile.role !== 'admin') {
  return 403 Forbidden - admin role required
}
```

---

## 📋 Checklist: Co musi mieć aplikacja?

### Dla użytkownika:
- [ ] **Rejestracja/Login** - Supabase Auth
- [ ] **Profil** - edycja name, weight, height
- [ ] **Przeglądanie kategorii** - lista i szczegóły
- [ ] **Przeglądanie ćwiczeń** - lista z filtrami
- [ ] **Tworzenie planów** - max 7, wybór ćwiczeń, dodawanie setów
- [ ] **Rozpoczynanie treningów** - wybór planu, dodawanie setów
- [ ] **Kończenie treningów** - obliczanie statystyk
- [ ] **Historia treningów** - lista z filtrowaniem

### Dla admina:
- [ ] **Panel admina** - osobna sekcja UI
- [ ] **Zarządzanie kategoriami** - CRUD
- [ ] **Zarządzanie ćwiczeniami** - CRUD
- [ ] Wszystko co ma użytkownik (własne plany/treningi)

---

## 🎯 Typowe Scenariusze Użycia

### Scenariusz 1: Nowy użytkownik
```
1. Rejestracja (Supabase Auth)
2. Uzupełnienie profilu (PUT /api/profile)
3. Przeglądanie kategorii (GET /api/categories)
4. Przeglądanie ćwiczeń (GET /api/exercises?categoryId=...)
5. Tworzenie pierwszego planu (POST /api/plans)
6. Dodawanie setów do planu (POST /api/plans/{id}/sets)
7. Rozpoczęcie treningu (POST /api/workouts)
8. Oznaczanie setów jako ukończone (PATCH /api/workouts/.../sets/...)
9. Zakończenie treningu (POST /api/workouts/{id}/end)
```

### Scenariusz 2: Admin - zarządzanie treścią
```
1. Login jako admin
2. Przejście do panelu admina
3. Tworzenie kategorii (POST /api/admin/categories)
4. Tworzenie ćwiczeń (POST /api/admin/exercises)
5. Edycja ćwiczenia (PUT /api/admin/exercises/{id})
6. Próba usunięcia kategorii z ćwiczeniami → Error 409
7. Usunięcie ćwiczenia (DELETE /api/admin/exercises/{id})
8. Usunięcie pustej kategorii (DELETE /api/admin/categories/{id})
```

### Scenariusz 3: Trening według planu
```
1. User ma plan "FBW A" z 5 ćwiczeniami
2. Rozpoczyna trening (POST /api/workouts { planId: "fwb-a-id" })
   → System kopiuje 5 ćwiczeń + wszystkie sety z planu
   → Wszystkie sety mają completed: false
3. User wykonuje ćwiczenia:
   - Oznacza set jako ukończony (PATCH .../sets/{id} { completed: true })
   - Modyfikuje ciężar jeśli potrzebuje (PATCH { weight: 55 })
   - Dodaje extra set (POST .../sets { exerciseId, repetitions, weight })
4. Kończy trening (POST .../end)
   → System oblicza duration, calories
   → Trening staje się READ-ONLY
5. User usuwa plan "FBW A" (DELETE /api/plans/fwb-a-id)
   → Plan jest soft-deleted (deleted_at = NOW)
   → Trening nadal ma training_plan_id
   → Historia zachowana!
```

---

## ⚠️ Ważne Ograniczenia

### Użytkownik:
1. **Max 7 planów** - próba utworzenia 8. planu → Error 403
2. **Trening wymaga planu** - nie można rozpocząć treningu bez planId
3. **Zakończony trening jest READ-ONLY** - próba edycji → Error 409
4. **Soft delete planu** - usunięty plan nie może być przywrócony (brak API)

### Admin:
1. **Nie może usunąć kategorii z ćwiczeniami** → Error 409
2. **Nie może usunąć ćwiczenia używanego w planach/workoutach** → Error 409
3. **Nie ma dostępu do planów/treningów innych użytkowników**

---

## 🔄 Flow Danych

```
CATEGORIES (admin creates)
    ↓ category_id
EXERCISES (admin creates)
    ↓ exercise_id
TRAINING PLANS (user creates, max 7)
    ↓ plan_id
PLAN_EXERCISES (link: plan ↔ exercise)
    ↓
PLAN_EXERCISE_SETS (sets in plan template)
    ↓ copied when workout starts
WORKOUTS (user starts with planId)
    ↓ workout_id
WORKOUT_SETS (copied from plan + user can add/modify)
    ↓ end workout
WORKOUT HISTORY (read-only, stats calculated)
```

---

**Wygenerowano:** 2025-01-13
**Status:** ✅ Aktualne
**Następny krok:** Implementacja UI dla użytkownika i admina
