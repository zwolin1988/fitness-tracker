// src/hooks/useExerciseSetConfigurator.ts
// Custom hook for exercise set configuration logic
// Extracted for testability and reusability

import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { ExerciseDTO } from "@/types";

import type { ExerciseSetConfig, ExerciseWithSets, SetFormData } from "@/components/training-plan/types";

/**
 * Validates set data to ensure it meets requirements
 */
export function validateSetData(sets: SetFormData[]): boolean {
  if (!sets || sets.length === 0) {
    return false;
  }

  return sets.every(
    (set) =>
      typeof set.repetitions === "number" &&
      set.repetitions > 0 &&
      set.repetitions <= 999 &&
      typeof set.weight === "number" &&
      set.weight >= 0 &&
      set.weight <= 999.99 &&
      typeof set.set_order === "number" &&
      set.set_order >= 0
  );
}

/**
 * Creates default set data
 */
export function createDefaultSet(order = 0): SetFormData {
  return {
    repetitions: 1,
    weight: 2.5,
    set_order: order,
  };
}

/**
 * Initializes exercises with sets from initial data or defaults
 */
export function initializeExercisesWithSets(
  exercises: ExerciseDTO[],
  initialSets?: Map<string, SetFormData[]>
): ExerciseWithSets[] {
  return exercises.map((exercise, index) => {
    const existingSets = initialSets?.get(exercise.id);

    // Validate existing sets or use default
    const sets =
      existingSets && existingSets.length > 0 && validateSetData(existingSets) ? existingSets : [createDefaultSet(0)];

    return {
      exercise,
      sets,
      order: index,
    };
  });
}

/**
 * Hook for managing exercise set configuration state and operations
 */
export function useExerciseSetConfigurator(
  exercises: ExerciseDTO[],
  initialSets?: Map<string, SetFormData[]>,
  onExerciseRemoved?: (exerciseId: string) => void
) {
  // Initialize exercises with sets
  const [exercisesWithSets, setExercisesWithSets] = useState<ExerciseWithSets[]>(() =>
    initializeExercisesWithSets(exercises, initialSets)
  );

  // Track expanded exercise (only one can be expanded at a time)
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(() =>
    exercisesWithSets.length > 0 ? exercisesWithSets[0].exercise.id : null
  );

  /**
   * Handle drag end event - reorder exercises
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setExercisesWithSets((items) => {
        const oldIndex = items.findIndex((item) => item.exercise.id === active.id);
        const newIndex = items.findIndex((item) => item.exercise.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          return items;
        }

        const reordered = arrayMove(items, oldIndex, newIndex);

        // Update order field
        return reordered.map((item, index) => ({
          ...item,
          order: index,
        }));
      });
    }
  }, []);

  /**
   * Toggle expanded state for an exercise
   */
  const handleToggle = useCallback((exerciseId: string) => {
    setExpandedExerciseId((prev) => (prev === exerciseId ? null : exerciseId));
  }, []);

  /**
   * Update sets configuration for an exercise
   */
  const handleSetsChange = useCallback((exerciseId: string, sets: SetFormData[]) => {
    setExercisesWithSets((prev) => prev.map((item) => (item.exercise.id === exerciseId ? { ...item, sets } : item)));
  }, []);

  /**
   * Remove exercise from configuration
   * Handles expanded state and order recalculation
   */
  const handleRemoveExercise = useCallback(
    (exerciseId: string) => {
      setExercisesWithSets((prev) => {
        const filtered = prev.filter((item) => item.exercise.id !== exerciseId);

        // Auto-expand first remaining if removed was expanded
        if (expandedExerciseId === exerciseId) {
          if (filtered.length > 0) {
            setExpandedExerciseId(filtered[0].exercise.id);
          } else {
            setExpandedExerciseId(null);
          }
        }

        // Update order after removal
        return filtered.map((item, index) => ({
          ...item,
          order: index,
        }));
      });

      // Notify parent component
      onExerciseRemoved?.(exerciseId);
    },
    [expandedExerciseId, onExerciseRemoved]
  );

  /**
   * Convert exercises with sets to config format for parent
   */
  const config = useMemo(
    () =>
      exercisesWithSets.map((item) => ({
        exerciseId: item.exercise.id,
        sets: item.sets,
      })),
    [exercisesWithSets]
  );

  /**
   * Check if configuration is valid (all exercises have valid sets)
   */
  const isValid = useMemo(
    () => exercisesWithSets.length > 0 && exercisesWithSets.every((item) => validateSetData(item.sets)),
    [exercisesWithSets]
  );

  return {
    exercisesWithSets,
    expandedExerciseId,
    config,
    isValid,
    handleDragEnd,
    handleToggle,
    handleSetsChange,
    handleRemoveExercise,
  };
}

/**
 * Hook for syncing configuration with parent component
 * Extracted to prevent infinite loops with memoized callbacks
 */
export function useConfigSync(config: ExerciseSetConfig[], onSetsConfigured: (config: ExerciseSetConfig[]) => void) {
  useEffect(() => {
    onSetsConfigured(config);
  }, [config, onSetsConfigured]);
}
