// src/components/training-plan/ExerciseSelector.tsx
// Komponent wyboru ćwiczeń z katalogu (krok 2)

import { useCallback } from "react";

import { ExerciseCatalog } from "@/components/exercise/ExerciseCatalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { ExerciseSelectorProps } from "./types";

/**
 * Komponent wyboru ćwiczeń z katalogu
 */
export function ExerciseSelector({
  availableExercises,
  categories,
  selectedExerciseIds,
  onSelectionChange,
}: ExerciseSelectorProps) {
  return (
    <ExerciseCatalog
      exercises={availableExercises}
      categories={categories}
      multiSelect={true}
      selectedIds={selectedExerciseIds}
      onSelectionChange={onSelectionChange}
    />
  );
}
