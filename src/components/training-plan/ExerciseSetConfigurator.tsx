// src/components/training-plan/ExerciseSetConfigurator.tsx
// Główny komponent konfiguracji serii dla wybranych ćwiczeń (krok 3)

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";

import { ExerciseSetConfigAccordion } from "./ExerciseSetConfigAccordion";
import type { ExerciseSetConfig, ExerciseSetConfiguratorProps, ExerciseWithSets, SetFormData } from "./types";

/**
 * Sortable wrapper dla pojedynczego ćwiczenia
 */
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
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
        dragHandleProps={listeners}
      />
    </div>
  );
}

/**
 * Główny komponent konfiguracji serii dla wybranych ćwiczeń
 */
export function ExerciseSetConfigurator({
  exercises,
  initialSets,
  onSetsConfigured,
  onExerciseRemoved,
}: ExerciseSetConfiguratorProps) {
  // Inicjalizacja stanu z exercisesWithSets
  const [exercisesWithSets, setExercisesWithSets] = useState<ExerciseWithSets[]>(() => {
    return exercises.map((exercise, index) => {
      const existingSets = initialSets?.get(exercise.id);
      // Jeśli nie ma żadnych serii, dodaj jedną serię z domyślnymi wartościami
      const sets =
        existingSets && existingSets.length > 0 ? existingSets : [{ repetitions: 1, weight: 2.5, set_order: 0 }];

      return {
        exercise,
        sets,
        order: index,
      };
    });
  });

  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(
    exercisesWithSets.length > 0 ? exercisesWithSets[0].exercise.id : null
  );

  // Sensors dla drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimalna odległość do aktywacji drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Obsługa zakończenia drag & drop
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setExercisesWithSets((items) => {
        const oldIndex = items.findIndex((item) => item.exercise.id === active.id);
        const newIndex = items.findIndex((item) => item.exercise.id === over.id);

        const reordered = arrayMove(items, oldIndex, newIndex);

        // Aktualizuj order
        return reordered.map((item, index) => ({
          ...item,
          order: index,
        }));
      });
    }
  };

  /**
   * Obsługa toggle accordion
   */
  const handleToggle = (exerciseId: string) => {
    setExpandedExerciseId((prev) => (prev === exerciseId ? null : exerciseId));
  };

  /**
   * Obsługa zmiany setów dla ćwiczenia
   */
  const handleSetsChange = (exerciseId: string, sets: SetFormData[]) => {
    setExercisesWithSets((prev) => prev.map((item) => (item.exercise.id === exerciseId ? { ...item, sets } : item)));
  };

  /**
   * Obsługa usunięcia ćwiczenia
   */
  const handleRemoveExercise = (exerciseId: string) => {
    setExercisesWithSets((prev) => {
      const filtered = prev.filter((item) => item.exercise.id !== exerciseId);
      // Zaktualizuj order po usunięciu
      return filtered.map((item, index) => ({
        ...item,
        order: index,
      }));
    });

    // Jeśli usunięte ćwiczenie było rozwinięte, rozwiń pierwsze pozostałe
    if (expandedExerciseId === exerciseId) {
      setExpandedExerciseId((prev) => {
        const remaining = exercisesWithSets.filter((item) => item.exercise.id !== exerciseId);
        return remaining.length > 0 ? remaining[0].exercise.id : null;
      });
    }

    // Wywołaj callback, aby poinformować wizarda o usunięciu (synchronizacja z krokiem 2)
    onExerciseRemoved?.(exerciseId);
  };

  /**
   * Wywołaj onSetsConfigured przy każdej zmianie
   */
  useEffect(() => {
    const config: ExerciseSetConfig[] = exercisesWithSets.map((item) => ({
      exerciseId: item.exercise.id,
      sets: item.sets,
    }));
    onSetsConfigured(config);
  }, [exercisesWithSets, onSetsConfigured]);

  return (
    <div className="space-y-3">
      {/* Lista ćwiczeń - sortable */}
      {exercisesWithSets.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">No exercises selected</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={exercisesWithSets.map((e) => e.exercise.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {exercisesWithSets.map((exerciseWithSets) => (
                <SortableExerciseItem
                  key={exerciseWithSets.exercise.id}
                  exerciseWithSets={exerciseWithSets}
                  isExpanded={expandedExerciseId === exerciseWithSets.exercise.id}
                  onToggle={() => handleToggle(exerciseWithSets.exercise.id)}
                  onSetsChange={(sets) => handleSetsChange(exerciseWithSets.exercise.id, sets)}
                  onRemoveExercise={() => handleRemoveExercise(exerciseWithSets.exercise.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
