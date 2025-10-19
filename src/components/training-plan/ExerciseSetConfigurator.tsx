// src/components/training-plan/ExerciseSetConfigurator.tsx
// Główny komponent konfiguracji serii dla wybranych ćwiczeń (krok 3)

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useConfigSync, useExerciseSetConfigurator } from "@/hooks/useExerciseSetConfigurator";

import { ExerciseSetConfigAccordion } from "./ExerciseSetConfigAccordion";
import type { ExerciseSetConfiguratorProps, ExerciseWithSets, SetFormData } from "./types";

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
 * Refactored to use useExerciseSetConfigurator hook for better testability
 */
export function ExerciseSetConfigurator({
  exercises,
  initialSets,
  onSetsConfigured,
  onExerciseRemoved,
}: ExerciseSetConfiguratorProps) {
  // Use custom hook for state management and business logic
  const {
    exercisesWithSets,
    expandedExerciseId,
    config,
    handleDragEnd,
    handleToggle,
    handleSetsChange,
    handleRemoveExercise,
  } = useExerciseSetConfigurator(exercises, initialSets, onExerciseRemoved);

  // Sync configuration with parent component (prevents infinite loop)
  useConfigSync(config, onSetsConfigured);

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

  return (
    <div className="space-y-3">
      {/* Lista ćwiczeń - sortable */}
      {exercisesWithSets.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">Nie wybrano żadnych ćwiczeń</p>
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
