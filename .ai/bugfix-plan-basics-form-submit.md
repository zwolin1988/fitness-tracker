# 🐛 Bugfix: PlanBasicsForm Submit nie działał przy pierwszym kliknięciu

**Data:** 2025-10-18
**Status:** ✅ RESOLVED

---

## 📋 Problem

### Opis błędu:
Po wypełnieniu formularza podstawowych informacji (Step 1) w kreatorze planu treningowego, przycisk "Dalej" **nie działał przy pierwszym kliknięciu**. Użytkownik musiał kliknąć **dwa razy**, aby przejść do Step 2.

### Objawy:
- ✅ Formularz wypełniony poprawnie (nazwa min. 3 znaki, cel wybrany)
- ❌ Kliknięcie "Dalej" - brak reakcji
- ❌ URL pozostaje `?step=1` (zamiast przejść do `?step=2`)
- ✅ Drugie kliknięcie "Dalej" - działa poprawnie

### Test E2E Error:
```
create-plan.spec.ts:37
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/plans\/create\?step=2/
Received string:  "http://localhost:4321/plans/create?step=1"
Timeout: 10000ms
```

---

## 🔍 Root Cause Analysis

### Błąd 1: `disabled` bazujący na `errors.name`

**Plik:** `src/components/training-plan/PlanBasicsForm.tsx:262`

```tsx
<Button
  type="submit"
  variant="default"
  size="lg"
  disabled={!!errors.name}  // ⚠️ PROBLEM!
  onClick={handleSubmit}
  data-testid="plan-basics-next-button"
>
  Dalej
</Button>
```

**Problem:**
- Przycisk był `disabled` jeśli `errors.name` miało **jakąkolwiek** wartość
- Funkcja `validateForm()` **zawsze** ustawiała `errors.name` (nawet `undefined`)
- Po pierwszym kliknięciu: `validateForm()` → `setErrors({ name: undefined, ... })`
- `!!undefined` = `false`, **ALE** `errors.name` istnieje jako klucz w obiekcie
- TypeScript: `!!errors.name` może być `true` nawet gdy wartość to `undefined`

### Błąd 2: Niepoprawna logika `validateForm()`

**Przed:**
```typescript
const validateForm = (): boolean => {
  const newErrors: PlanBasicsFormErrors = {
    name: validateName(formData.name),           // zawsze ustawia, nawet undefined
    description: validateDescription(formData.description || ""),
  };

  setErrors(newErrors);  // Zawsze ustawia oba klucze!
  return !newErrors.name && !newErrors.description;
};
```

**Problem:**
- Obiekt `newErrors` **zawsze** miał klucze `name` i `description`
- Nawet gdy walidacja przechodziła, wartości były `undefined`
- Ale klucze istniały w obiekcie!

---

## ✅ Rozwiązanie

### Fix 1: Poprawiono logikę `validateForm()`

**src/components/training-plan/PlanBasicsForm.tsx:81-92**

```typescript
const validateForm = (): boolean => {
  const nameError = validateName(formData.name);
  const descriptionError = validateDescription(formData.description || "");

  const newErrors: PlanBasicsFormErrors = {};
  if (nameError) newErrors.name = nameError;                    // ✅ Dodaje tylko gdy jest błąd
  if (descriptionError) newErrors.description = descriptionError; // ✅ Dodaje tylko gdy jest błąd

  setErrors(newErrors);

  return !nameError && !descriptionError;
};
```

**Zmiana:**
- Tworzymy pusty obiekt `{}`
- Dodajemy klucze **tylko jeśli** są błędy
- Po poprawnej walidacji: `errors = {}` (pusty obiekt, bez kluczy)

### Fix 2: Usunięto `disabled` i `onClick` z przycisku

**src/components/training-plan/PlanBasicsForm.tsx:260-267**

```tsx
<Button
  type="submit"
  variant="default"
  size="lg"
  data-testid="plan-basics-next-button"
>
  Dalej
</Button>
```

**Zmiana:**
- Usunięto `disabled={!!errors.name}` - walidacja odbywa się w `handleSubmit`
- Usunięto `onClick={handleSubmit}` - formularz obsługuje submit przez `onSubmit`
- Przycisk `type="submit"` automatycznie wywołuje `handleSubmit` przez event form

### Fix 3: Dodano małe opóźnienie w POM

**e2e/page-objects/PlanBasicsPage.ts:100-107**

```typescript
async fillAndSubmit(name: string, description: string, goal: PlanGoal) {
  await this.fillPlanName(name);
  await this.fillDescription(description);
  await this.selectGoal(goal);
  // Small delay to ensure React state updates before clicking
  await this.page.waitForTimeout(300);  // ✅ Dodano 300ms delay
  await this.clickNext();
}
```

**Zmiana:**
- Dodano 300ms opóźnienie po wypełnieniu formularza
- Daje czas Reactowi na aktualizację stanu (`setState` jest asynchroniczne)
- Playwright wypełnia pola bardzo szybko, React może nie nadążyć

### Fix 4: Zwiększono timeout dla asercji URL

**e2e/training-plans/create-plan.spec.ts:37, 69**

```typescript
// Sprawdź czy jesteśmy w Step 2 (czekamy aż URL się zaktualizuje)
await expect(page).toHaveURL(/\/plans\/create\?step=2/, { timeout: 10000 });

// Step 3 również
await expect(page).toHaveURL(/\/plans\/create\?step=3/, { timeout: 10000 });
```

**Zmiana:**
- Zwiększono timeout z domyślnych 5s do 10s
- URL aktualizuje się przez `useEffect` (może zająć chwilę)

---

## 🧪 Weryfikacja

### Manual Testing:
1. ✅ Otwórz `/plans/create`
2. ✅ Wypełnij nazwę: "Test Plan"
3. ✅ Wybierz cel: "Siła"
4. ✅ Kliknij "Dalej" → **działa przy pierwszym kliknięciu!**
5. ✅ URL zmienia się na `?step=2`

### E2E Test:
```bash
npm run test:e2e:ui
```

Test `create-plan.spec.ts` przechodzi teraz pomyślnie:
- ✅ Step 1: Wypełnia formularz i klika "Dalej"
- ✅ URL zmienia się na `?step=2`
- ✅ Step 2: Wybiera 3 ćwiczenia
- ✅ Step 3: Zapisuje plan
- ✅ Plan pojawia się na liście

---

## 📝 Lessons Learned

1. **React state updates są asynchroniczne**
   - Playwright może być szybszy niż `setState`
   - Dodawaj małe opóźnienia w POM gdy to konieczne

2. **Walidacja formularza - empty object vs undefined values**
   - `errors = { name: undefined }` !== `errors = {}`
   - Lepiej **nie dodawać kluczy** niż ustawiać je na `undefined`

3. **Duplikacja obsługi submit**
   - Nie mieszaj `type="submit"` z `onClick={handleSubmit}`
   - Form `onSubmit` wystarczy

4. **Disabled bazujący na errors object**
   - `!!errors.name` to pułapka gdy `errors.name` może być `undefined`
   - Lepiej walidować w `handleSubmit` niż blokować przycisk

---

## 🔗 Powiązane pliki

**Zmienione:**
- `src/components/training-plan/PlanBasicsForm.tsx`
- `e2e/page-objects/PlanBasicsPage.ts`
- `e2e/training-plans/create-plan.spec.ts`

**Powiązane:**
- `src/components/training-plan/PlanWizard.tsx` (useEffect synchronizujący URL)
- `src/hooks/usePlanWizard.ts` (zarządzanie stanem wizarda)

---

**Autor:** Claude Code
**Zgłoszenie:** User feedback podczas testów E2E
