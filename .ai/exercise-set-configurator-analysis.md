# ExerciseSetConfigurator Component - Analiza i Kluczowe Wnioski

## ✅ Przeanalizowany Komponent

`src/components/training-plan/ExerciseSetConfigurator.tsx` - Komponent React do konfiguracji serii ćwiczeń z funkcją drag & drop.

**Data analizy:** 2025-10-17
**Rozmiar:** 200 linii kodu
**Kompleksowość:** Średnia-wysoka (zarządzanie stanem, drag & drop, synchronizacja z parent)

---

## 📋 Co Robi Ten Komponent?

### Odpowiedzialności główne:

1. **Drag & Drop Reordering** - Umożliwia użytkownikowi zmianę kolejności ćwiczeń w planie treningowym
2. **Accordion UI** - Wyświetla listę ćwiczeń z możliwością rozwinięcia jednego na raz
3. **Set Configuration Management** - Zarządza konfiguracją serii (powtórzenia, ciężar) dla każdego ćwiczenia
4. **Exercise Removal** - Usuwa ćwiczenia z konfiguracji i synchronizuje stan z parent component
5. **State Synchronization** - Automatycznie informuje parent component o zmianach przez callback `onSetsConfigured`

### Kontekst użycia:

- **Parent Component:** `PlanWizard.tsx` (krok 3 wizarda tworzenia planu treningowego)
- **Child Components:**
  - `SortableExerciseItem` (wewnętrzny wrapper dla drag & drop)
  - `ExerciseSetConfigAccordion` (UI dla pojedynczego ćwiczenia)
  - `SetFormList` (lista formularzy serii - powtórzenia/ciężar)

---

## 🏗️ Architektura Komponentu

### 1. Props Interface (ExerciseSetConfiguratorProps)

```typescript
interface ExerciseSetConfiguratorProps {
  exercises: ExerciseDTO[];                           // Lista ćwiczeń do konfiguracji
  initialSets?: Map<string, SetFormData[]>;           // Początkowa konfiguracja serii (dla edycji)
  onSetsConfigured: (config: ExerciseSetConfig[]) => void;  // Callback po każdej zmianie
  onExerciseRemoved?: (exerciseId: string) => void;   // Callback po usunięciu ćwiczenia
}
```

### 2. Stan Lokalny (useState)

```typescript
const [exercisesWithSets, setExercisesWithSets] = useState<ExerciseWithSets[]>(
  () => {
    return exercises.map((exercise, index) => {
      const existingSets = initialSets?.get(exercise.id);
      const sets = existingSets && existingSets.length > 0
        ? existingSets
        : [{ repetitions: 1, weight: 2.5, set_order: 0 }];  // Domyślny set

      return { exercise, sets, order: index };
    });
  }
);

const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(
  exercisesWithSets.length > 0 ? exercisesWithSets[0].exercise.id : null
);
```

**Kluczowe decyzje:**
- ✅ **Lazy initialization** w useState - funkcja inicjalizacyjna wykonuje się tylko raz
- ✅ **Domyślny set** - każde ćwiczenie ma minimum jeden set (1 powtórzenie, 2.5 kg)
- ✅ **Auto-expand** - pierwsze ćwiczenie jest automatycznie rozwinięte

### 3. Struktura Danych (ExerciseWithSets)

```typescript
interface ExerciseWithSets {
  exercise: ExerciseDTO;      // Pełne dane ćwiczenia (id, nazwa, kategoria, etc.)
  sets: SetFormData[];        // Tablica serii (repetitions, weight, set_order)
  order: number;              // Kolejność w liście (0, 1, 2, ...)
}
```

---

## 🎯 Implementacja Drag & Drop (@dnd-kit)

### Sensors Configuration

```typescript
const sensors = useSensors(
  useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,  // Minimalna odległość do aktywacji drag (zapobiega przypadkowym przesunięciom)
    },
  }),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,  // Accessibility - drag za pomocą klawiatury
  })
);
```

**Kluczowe decyzje:**
- ✅ **8px activation distance** - zapobiega przypadkowym drag podczas kliknięcia
- ✅ **KeyboardSensor** - accessibility (drag & drop za pomocą klawiatury)
- ✅ **2 sensory** - pointer (mysz/touch) + keyboard

### handleDragEnd Logic

```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (over && active.id !== over.id) {
    setExercisesWithSets((items) => {
      const oldIndex = items.findIndex((item) => item.exercise.id === active.id);
      const newIndex = items.findIndex((item) => item.exercise.id === over.id);

      const reordered = arrayMove(items, oldIndex, newIndex);  // Helper z @dnd-kit

      // Update order field
      return reordered.map((item, index) => ({
        ...item,
        order: index,  // Aktualizacja order po przesunięciu
      }));
    });
  }
};
```

**Kluczowe decyzje:**
- ✅ **arrayMove** - używa helper z @dnd-kit (optymalizowany)
- ✅ **Order recalculation** - `order` pole jest zawsze zsynchronizowane z pozycją w tablicy
- ✅ **Guard check** - sprawdza czy `over` istnieje i czy ID się różnią

### DndContext Setup

```typescript
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}  // Algorytm wykrywania kolizji
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={exercisesWithSets.map((e) => e.exercise.id)}  // Array of IDs
    strategy={verticalListSortingStrategy}  // Vertical list sorting
  >
    {exercisesWithSets.map((exerciseWithSets) => (
      <SortableExerciseItem key={exerciseWithSets.exercise.id} {...props} />
    ))}
  </SortableContext>
</DndContext>
```

**Kluczowe decyzje:**
- ✅ **closestCenter** - najprostszy i najbardziej intuicyjny algorytm kolizji
- ✅ **verticalListSortingStrategy** - optymalizowany dla vertical list
- ✅ **IDs array** - SortableContext wymaga tablicy ID, nie obiektów

---

## 🔄 Zarządzanie Stanem (Event Handlers)

### 1. handleToggle - Rozwijanie/Zwijanie Accordion

```typescript
const handleToggle = (exerciseId: string) => {
  setExpandedExerciseId((prev) => (prev === exerciseId ? null : exerciseId));
};
```

**Kluczowe decyzje:**
- ✅ **Single expanded item** - tylko jedno ćwiczenie może być rozwinięte na raz
- ✅ **Toggle behavior** - kliknięcie na rozwinięte ćwiczenie je zwija

### 2. handleSetsChange - Zmiana Konfiguracji Serii

```typescript
const handleSetsChange = (exerciseId: string, sets: SetFormData[]) => {
  setExercisesWithSets((prev) =>
    prev.map((item) =>
      item.exercise.id === exerciseId ? { ...item, sets } : item
    )
  );
};
```

**Kluczowe decyzje:**
- ✅ **Immutable update** - tworzy nową tablicę zamiast mutować
- ✅ **Map pattern** - aktualizuje tylko jeden element

### 3. handleRemoveExercise - Usuwanie Ćwiczenia

```typescript
const handleRemoveExercise = (exerciseId: string) => {
  setExercisesWithSets((prev) => {
    const filtered = prev.filter((item) => item.exercise.id !== exerciseId);

    // Update order after removal
    return filtered.map((item, index) => ({
      ...item,
      order: index,  // Ponowne przeliczenie order
    }));
  });

  // If removed exercise was expanded, expand first remaining
  if (expandedExerciseId === exerciseId) {
    setExpandedExerciseId((prev) => {
      const remaining = exercisesWithSets.filter((item) => item.exercise.id !== exerciseId);
      return remaining.length > 0 ? remaining[0].exercise.id : null;
    });
  }

  // Synchronize with parent (step 2)
  onExerciseRemoved?.(exerciseId);
};
```

**Kluczowe decyzje:**
- ✅ **Order recalculation** - `order` jest zawsze zsynchronizowane po usunięciu
- ✅ **Expand first remaining** - jeśli usunięte ćwiczenie było rozwinięte, rozwija pierwsze pozostałe
- ✅ **Parent synchronization** - informuje parent component (PlanWizard) o usunięciu

---

## ⚙️ Side Effects (useEffect)

### Auto-Sync z Parent Component

```typescript
useEffect(() => {
  const config: ExerciseSetConfig[] = exercisesWithSets.map((item) => ({
    exerciseId: item.exercise.id,
    sets: item.sets,
  }));
  onSetsConfigured(config);
}, [exercisesWithSets, onSetsConfigured]);
```

**Kluczowe decyzje:**
- ✅ **Auto-sync** - każda zmiana w `exercisesWithSets` automatycznie triggeruje `onSetsConfigured`
- ⚠️ **Dependency warning** - `onSetsConfigured` w dependencies może powodować nieskończoną pętlę jeśli nie jest memoizowane w parent

**Potencjalny problem:**
```typescript
// W PlanWizard.tsx (line 187):
const handleSetsConfigChange = (config: ExerciseSetConfig[]) => {
  saveSetsConfig(config);
};

// Ta funkcja jest tworzona na nowo przy każdym render PlanWizard
// Co powoduje re-render ExerciseSetConfigurator
```

**Rekomendacja:**
```typescript
// W PlanWizard.tsx powinno być:
const handleSetsConfigChange = useCallback((config: ExerciseSetConfig[]) => {
  saveSetsConfig(config);
}, [saveSetsConfig]);
```

---

## 🎨 SortableExerciseItem Component

### Wrapper dla Drag & Drop

```typescript
function SortableExerciseItem({
  exerciseWithSets,
  isExpanded,
  onToggle,
  onSetsChange,
  onRemoveExercise,
}: {
  exerciseWithSets: ExerciseWithSets;
  isExpanded: boolean;
  onToggle: () => void;
  onSetsChange: (sets: SetFormData[]) => void;
  onRemoveExercise: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: exerciseWithSets.exercise.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),  // CSS transform dla drag
    transition,                                    // Smooth transition
    opacity: isDragging ? 0.5 : 1,                // Visual feedback podczas drag
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ExerciseSetConfigAccordion
        exercise={exerciseWithSets.exercise}
        sets={exerciseWithSets.sets}
        isExpanded={isExpanded}
        onToggle={onToggle}
        onSetsChange={onSetsChange}
        onRemoveExercise={onRemoveExercise}
        dragHandleProps={listeners}  // Listeners przekazywane do drag handle
      />
    </div>
  );
}
```

**Kluczowe decyzje:**
- ✅ **useSortable hook** - hook z @dnd-kit dla pojedynczego sortable item
- ✅ **Visual feedback** - opacity 0.5 podczas drag
- ✅ **Drag handle pattern** - listeners są przekazywane do child component (GripVertical icon)

---

## 🔗 Integracja z Parent Component (PlanWizard)

### Flow danych:

```
PlanWizard (state.setsConfig: Map<string, SetFormData[]>)
    ↓
    | Props: initialSets, onSetsConfigured, onExerciseRemoved
    ↓
ExerciseSetConfigurator (exercisesWithSets: ExerciseWithSets[])
    ↓
    | useEffect → onSetsConfigured(config)
    ↓
PlanWizard.handleSetsConfigChange → saveSetsConfig(config)
    ↓
PlanWizard (state.setsConfig UPDATED)
```

### Synchronizacja dwukierunkowa:

1. **Parent → Child** (initialSets):
   - PlanWizard przekazuje `state.setsConfig` jako `initialSets`
   - ExerciseSetConfigurator inicjalizuje `exercisesWithSets` na podstawie `initialSets`

2. **Child → Parent** (onSetsConfigured):
   - ExerciseSetConfigurator wywołuje `onSetsConfigured` po każdej zmianie
   - PlanWizard aktualizuje `state.setsConfig` przez `saveSetsConfig`

3. **Exercise Removal Sync** (onExerciseRemoved):
   - ExerciseSetConfigurator wywołuje `onExerciseRemoved` po usunięciu ćwiczenia
   - PlanWizard aktualizuje `state.selectedExerciseIds` (krok 2)
   - **Zapobiega desynchronizacji** między krokiem 2 (ExerciseSelector) a krokiem 3 (ExerciseSetConfigurator)

---

## 📊 Podsumowanie Mocnych Stron

| Kategoria | Ocena | Uzasadnienie |
|-----------|-------|--------------|
| **Architecture** | ✅ 9/10 | Clean separation of concerns, clear component hierarchy |
| **State Management** | ✅ 8/10 | Immutable updates, proper initialization, parent sync |
| **Drag & Drop** | ✅ 9/10 | Modern @dnd-kit, accessibility (keyboard), visual feedback |
| **Error Handling** | ⚠️ 6/10 | Brak explicit error handling dla edge cases |
| **Performance** | ⚠️ 7/10 | useEffect może powodować nadmiarowe re-renders |
| **Accessibility** | ✅ 9/10 | Keyboard navigation, ARIA attributes (w child components) |
| **Maintainability** | ✅ 8/10 | Clear naming, TypeScript types, comments |
| **Testability** | ⚠️ 5/10 | Trudne do testowania (drag & drop, complex state) |

**Ogólna ocena:** 7.5/10

---

## ⚠️ Zidentyfikowane Problemy

### 1. ❌ Potencjalna Nieskończona Pętla Re-Renders

**Problem:**
```typescript
useEffect(() => {
  const config: ExerciseSetConfig[] = exercisesWithSets.map((item) => ({
    exerciseId: item.exercise.id,
    sets: item.sets,
  }));
  onSetsConfigured(config);
}, [exercisesWithSets, onSetsConfigured]);  // ⚠️ onSetsConfigured nie jest memoizowane!
```

**Root Cause:**
- `onSetsConfigured` (handleSetsConfigChange w PlanWizard) jest tworzone na nowo przy każdym render
- To powoduje trigger useEffect → wywołanie onSetsConfigured → re-render PlanWizard → nowe onSetsConfigured → ...

**Fix:**
```typescript
// W PlanWizard.tsx (line 187):
const handleSetsConfigChange = useCallback((config: ExerciseSetConfig[]) => {
  saveSetsConfig(config);
}, [saveSetsConfig]);
```

### 2. ⚠️ Brak Walidacji Danych

**Problem:**
```typescript
const [exercisesWithSets, setExercisesWithSets] = useState<ExerciseWithSets[]>(() => {
  return exercises.map((exercise, index) => {
    const existingSets = initialSets?.get(exercise.id);
    const sets = existingSets && existingSets.length > 0
      ? existingSets  // ⚠️ Nie sprawdza poprawności danych w existingSets
      : [{ repetitions: 1, weight: 2.5, set_order: 0 }];
    // ...
  });
});
```

**Możliwe problemy:**
- `existingSets` może zawierać nieprawidłowe dane (negative values, NaN, undefined)
- Brak walidacji `repetitions > 0`, `weight >= 0`, `set_order >= 0`

**Fix:**
```typescript
const isValidSet = (set: SetFormData): boolean => {
  return (
    typeof set.repetitions === 'number' && set.repetitions > 0 &&
    typeof set.weight === 'number' && set.weight >= 0 &&
    typeof set.set_order === 'number' && set.set_order >= 0
  );
};

const sets = existingSets && existingSets.length > 0 && existingSets.every(isValidSet)
  ? existingSets
  : [{ repetitions: 1, weight: 2.5, set_order: 0 }];
```

### 3. ⚠️ Race Condition w handleRemoveExercise

**Problem:**
```typescript
const handleRemoveExercise = (exerciseId: string) => {
  setExercisesWithSets((prev) => {
    const filtered = prev.filter((item) => item.exercise.id !== exerciseId);
    return filtered.map((item, index) => ({ ...item, order: index }));
  });

  // ⚠️ expandedExerciseId może używać stale closured exercisesWithSets
  if (expandedExerciseId === exerciseId) {
    setExpandedExerciseId((prev) => {
      const remaining = exercisesWithSets.filter((item) => item.exercise.id !== exerciseId);
      //                ^^^^^^^^^^^^^^^^^ Używa stale closured value, nie updated!
      return remaining.length > 0 ? remaining[0].exercise.id : null;
    });
  }

  onExerciseRemoved?.(exerciseId);
};
```

**Root Cause:**
- `exercisesWithSets` w closure jest stary (przed update)
- `setExpandedExerciseId` może próbować expand ćwiczenie które już nie istnieje

**Fix:**
```typescript
const handleRemoveExercise = (exerciseId: string) => {
  setExercisesWithSets((prev) => {
    const filtered = prev.filter((item) => item.exercise.id !== exerciseId);

    // Auto-expand first remaining if removed was expanded
    if (expandedExerciseId === exerciseId && filtered.length > 0) {
      setExpandedExerciseId(filtered[0].exercise.id);
    } else if (filtered.length === 0) {
      setExpandedExerciseId(null);
    }

    return filtered.map((item, index) => ({ ...item, order: index }));
  });

  onExerciseRemoved?.(exerciseId);
};
```

### 4. ⚠️ Empty State Handling

**Problem:**
```typescript
<div className="space-y-3">
  {exercisesWithSets.length === 0 ? (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <p className="text-neutral-600 dark:text-neutral-400">No exercises selected</p>
    </div>
  ) : (
    // ... DndContext
  )}
</div>
```

**Problemy:**
- Text "No exercises selected" jest hardcoded (powinien być w polskim, bo reszta UI jest po polsku)
- Brak call-to-action (np. "Wróć do kroku 2, aby wybrać ćwiczenia")
- Brak ikony/ilustracji

**Fix:**
```typescript
{exercisesWithSets.length === 0 ? (
  <div className="rounded-lg border border-dashed p-8 text-center">
    <p className="text-neutral-600 dark:text-neutral-400 mb-2">
      Nie wybrano żadnych ćwiczeń
    </p>
    <Button variant="outline" onClick={() => goToStep(2)}>
      Wróć do wyboru ćwiczeń
    </Button>
  </div>
) : (
  // ...
)}
```

### 5. ⚠️ Brak Error Boundaries

**Problem:**
- Jeśli `useSortable` throw error (np. nieprawidłowy ID), cała aplikacja crashuje
- Brak error boundary dla graceful degradation

**Fix:**
```typescript
// Wrap w ErrorBoundary (trzeba utworzyć):
<ErrorBoundary fallback={<div>Wystąpił błąd. Odśwież stronę.</div>}>
  <ExerciseSetConfigurator {...props} />
</ErrorBoundary>
```

---

## 🔧 Rekomendacje Ulepszeń

### 1. Memoizacja Callbacks w Parent Component

**Priority:** 🔴 HIGH

```typescript
// W PlanWizard.tsx:
const handleSetsConfigChange = useCallback((config: ExerciseSetConfig[]) => {
  saveSetsConfig(config);
}, [saveSetsConfig]);

const handleExerciseRemoved = useCallback((exerciseId: string) => {
  const updatedIds = state.selectedExerciseIds.filter((id) => id !== exerciseId);
  saveExercises(updatedIds);
}, [state.selectedExerciseIds, saveExercises]);
```

### 2. Dodać Walidację Danych

**Priority:** 🟡 MEDIUM

```typescript
// W ExerciseSetConfigurator.tsx:
const validateSetData = (sets: SetFormData[]): boolean => {
  return sets.every(set =>
    set.repetitions > 0 && set.repetitions <= 999 &&
    set.weight >= 0 && set.weight <= 999.99 &&
    set.set_order >= 0
  );
};

// Użycie w initialization:
const sets = existingSets && existingSets.length > 0 && validateSetData(existingSets)
  ? existingSets
  : [{ repetitions: 1, weight: 2.5, set_order: 0 }];
```

### 3. Optymalizacja Re-Renders

**Priority:** 🟡 MEDIUM

```typescript
// Memoizacja SortableExerciseItem:
const SortableExerciseItem = memo(function SortableExerciseItem({ ... }) {
  // ...
});

// Memoizacja config w useEffect:
const config = useMemo(() =>
  exercisesWithSets.map((item) => ({
    exerciseId: item.exercise.id,
    sets: item.sets,
  })),
  [exercisesWithSets]
);

useEffect(() => {
  onSetsConfigured(config);
}, [config, onSetsConfigured]);
```

### 4. Lepsze Empty State

**Priority:** 🟢 LOW

```typescript
{exercisesWithSets.length === 0 ? (
  <div className="rounded-lg border border-dashed p-12 text-center">
    <div className="mx-auto w-16 h-16 mb-4 text-muted-foreground">
      <svg>...</svg> {/* Icon ilustracja */}
    </div>
    <h3 className="text-lg font-semibold mb-2">Brak wybranych ćwiczeń</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Aby skonfigurować serie, najpierw wybierz ćwiczenia w kroku 2
    </p>
    <Button variant="outline" onClick={prevStep}>
      Wróć do wyboru ćwiczeń
    </Button>
  </div>
) : (
  // ...
)}
```

### 5. Dodać Loading State

**Priority:** 🟢 LOW

```typescript
const [isReordering, setIsReordering] = useState(false);

const handleDragEnd = (event: DragEndEvent) => {
  setIsReordering(true);

  // ... existing logic ...

  setTimeout(() => setIsReordering(false), 300);
};

// W UI:
<div className={cn("space-y-3", isReordering && "opacity-50 pointer-events-none")}>
  {/* ... */}
</div>
```

---

## 🧪 Testowanie - Rekomendacje

### Trudności w Testowaniu:

1. **Drag & Drop** - @dnd-kit wymaga skomplikowanego setup:
   - Mock `DndContext`, `SortableContext`, `useSortable`
   - Symulacja drag events

2. **Complex State** - `exercisesWithSets` + `expandedExerciseId`:
   - Wiele edge cases (empty, single, multiple)
   - Synchronizacja z parent callbacks

3. **Child Components** - `ExerciseSetConfigAccordion`, `SetFormList`:
   - Wymaga mockowania całego drzewa komponentów

### Rekomendacja: Wydzielić Logikę do Custom Hook

**Priority:** 🟡 MEDIUM

```typescript
// src/hooks/useExerciseSetConfigurator.ts
export function useExerciseSetConfigurator(
  exercises: ExerciseDTO[],
  initialSets?: Map<string, SetFormData[]>
) {
  const [exercisesWithSets, setExercisesWithSets] = useState<ExerciseWithSets[]>(() => {
    // ... initialization logic
  });

  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(
    exercisesWithSets.length > 0 ? exercisesWithSets[0].exercise.id : null
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    // ... drag logic
  }, []);

  const handleToggle = useCallback((exerciseId: string) => {
    // ... toggle logic
  }, []);

  const handleSetsChange = useCallback((exerciseId: string, sets: SetFormData[]) => {
    // ... sets change logic
  }, []);

  const handleRemoveExercise = useCallback((exerciseId: string) => {
    // ... remove logic
  }, []);

  const config = useMemo(() =>
    exercisesWithSets.map((item) => ({
      exerciseId: item.exercise.id,
      sets: item.sets,
    })),
    [exercisesWithSets]
  );

  return {
    exercisesWithSets,
    expandedExerciseId,
    config,
    handleDragEnd,
    handleToggle,
    handleSetsChange,
    handleRemoveExercise,
  };
}
```

**Korzyści:**
- ✅ Łatwiejsze testowanie logiki (bez UI)
- ✅ Reużywalność (można użyć w innych komponentach)
- ✅ Separation of concerns (logic vs UI)

### Przykładowe Testy dla Custom Hook:

```typescript
// src/hooks/useExerciseSetConfigurator.test.ts
import { renderHook, act } from '@testing-library/react';
import { useExerciseSetConfigurator } from './useExerciseSetConfigurator';

describe('useExerciseSetConfigurator', () => {
  const mockExercises = [
    { id: 'ex1', name: 'Przysiad' },
    { id: 'ex2', name: 'Wyciskanie' },
  ];

  it('should initialize with default sets', () => {
    const { result } = renderHook(() =>
      useExerciseSetConfigurator(mockExercises)
    );

    expect(result.current.exercisesWithSets).toHaveLength(2);
    expect(result.current.exercisesWithSets[0].sets).toEqual([
      { repetitions: 1, weight: 2.5, set_order: 0 }
    ]);
  });

  it('should expand first exercise by default', () => {
    const { result } = renderHook(() =>
      useExerciseSetConfigurator(mockExercises)
    );

    expect(result.current.expandedExerciseId).toBe('ex1');
  });

  it('should toggle expanded exercise', () => {
    const { result } = renderHook(() =>
      useExerciseSetConfigurator(mockExercises)
    );

    act(() => {
      result.current.handleToggle('ex2');
    });

    expect(result.current.expandedExerciseId).toBe('ex2');

    act(() => {
      result.current.handleToggle('ex2');
    });

    expect(result.current.expandedExerciseId).toBeNull();
  });

  it('should update sets for exercise', () => {
    const { result } = renderHook(() =>
      useExerciseSetConfigurator(mockExercises)
    );

    const newSets = [
      { repetitions: 10, weight: 50, set_order: 0 },
      { repetitions: 8, weight: 55, set_order: 1 },
    ];

    act(() => {
      result.current.handleSetsChange('ex1', newSets);
    });

    expect(result.current.exercisesWithSets[0].sets).toEqual(newSets);
  });

  it('should remove exercise and update order', () => {
    const { result } = renderHook(() =>
      useExerciseSetConfigurator(mockExercises)
    );

    act(() => {
      result.current.handleRemoveExercise('ex1');
    });

    expect(result.current.exercisesWithSets).toHaveLength(1);
    expect(result.current.exercisesWithSets[0].exercise.id).toBe('ex2');
    expect(result.current.exercisesWithSets[0].order).toBe(0);
  });

  it('should auto-expand first remaining when expanded is removed', () => {
    const { result } = renderHook(() =>
      useExerciseSetConfigurator(mockExercises)
    );

    // ex1 is expanded by default
    expect(result.current.expandedExerciseId).toBe('ex1');

    act(() => {
      result.current.handleRemoveExercise('ex1');
    });

    // Should auto-expand ex2
    expect(result.current.expandedExerciseId).toBe('ex2');
  });
});
```

---

## 📚 Kluczowe Wnioski

### 1. ✅ Mocne Strony

1. **Modern Drag & Drop** - @dnd-kit z accessibility (keyboard navigation)
2. **Clean Architecture** - separation of concerns, clear component hierarchy
3. **Immutable State** - proper React patterns (map, filter, spread)
4. **TypeScript Types** - strict typing, clear interfaces
5. **Parent Synchronization** - auto-sync z PlanWizard przez callbacks
6. **Visual Feedback** - opacity podczas drag, accordion UI

### 2. ⚠️ Obszary Wymagające Poprawy

1. **Performance** - brak memoizacji callbacks, potencjalna infinite loop
2. **Error Handling** - brak walidacji danych, brak error boundaries
3. **Testability** - trudne do testowania (drag & drop, complex state)
4. **Race Conditions** - `handleRemoveExercise` używa stale closured value
5. **Empty State** - słabe UX (hardcoded text, brak CTA)

### 3. 🎯 Priorytety Refaktoryzacji

**High Priority (🔴):**
1. Memoizacja `onSetsConfigured` callback w PlanWizard (zapobiega infinite loop)
2. Fix race condition w `handleRemoveExercise` (używa stale closured value)

**Medium Priority (🟡):**
3. Walidacja `initialSets` data (zapobiega invalid state)
4. Wydzielić logikę do custom hook `useExerciseSetConfigurator` (testability)
5. Optymalizacja re-renders (memoizacja SortableExerciseItem, useMemo config)

**Low Priority (🟢):**
6. Lepsze empty state (polish text, CTA button, icon)
7. Loading state podczas reorder (visual feedback)
8. Error boundary (graceful degradation)

### 4. 📈 Metryki

| Metryka | Wartość | Ocena |
|---------|---------|-------|
| **Complexity (Cyclomatic)** | ~15 | ⚠️ Medium-High |
| **Lines of Code** | 200 | ✅ Good |
| **Dependencies** | 3 external (@dnd-kit) | ✅ Good |
| **State Variables** | 2 (exercisesWithSets, expandedExerciseId) | ✅ Good |
| **Event Handlers** | 4 | ✅ Good |
| **Props** | 4 | ✅ Good |
| **Re-render Risk** | High | ⚠️ Needs optimization |

---

## 🚀 Następne Kroki

### Dla Developer:

1. **Natychmiast:**
   - Dodać `useCallback` dla `handleSetsConfigChange` w PlanWizard.tsx (line 187)
   - Naprawić race condition w `handleRemoveExercise` (line 195-205)

2. **W tym sprincie:**
   - Wydzielić logikę do `useExerciseSetConfigurator` custom hook
   - Napisać unit tests dla custom hook (min. 10 testów)
   - Dodać walidację `initialSets` data

3. **W przyszłości:**
   - Optymalizować re-renders (memoizacja, useMemo)
   - Poprawić empty state UI
   - Dodać error boundary

### Dla QA:

1. **Testować edge cases:**
   - Usunięcie wszystkich ćwiczeń
   - Drag & drop z jednym ćwiczeniem
   - Usunięcie roziniętego ćwiczenia
   - Invalid data w `initialSets` (negative values, NaN)

2. **Testować accessibility:**
   - Keyboard navigation (Tab, Enter, Escape)
   - Screen reader (ARIA attributes)
   - Drag & drop za pomocą klawiatury

---

**Utworzono przez:** Claude Code
**Data:** 2025-10-17
**Status:** ✅ Kompletna analiza

**Podsumowanie:** Komponent jest dobrze napisany z czystą architekturą i modern patterns (@dnd-kit, TypeScript). Główne problemy to performance (brak memoizacji callbacks) i race condition w `handleRemoveExercise`. Rekomendowane wydzielenie logiki do custom hook dla lepszej testowalności.
