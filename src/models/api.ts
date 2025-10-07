import type { Workout } from "./workout";

// DTOs for API validation
export interface CreateWorkoutDTO {
  name: string;
  description?: string;
  durationMinutes: number;
  caloriesBurned?: number;
  workoutType: Workout["workoutType"];
  date: string;
}

export interface CreateExerciseDTO {
  workoutId: string;
  name: string;
  sets?: number;
  reps?: number;
  weightKg?: number;
  distanceKm?: number;
  durationSeconds?: number;
  notes?: string;
}

export interface CreateGoalDTO {
  title: string;
  description?: string;
  targetValue: number;
  unit: string;
  targetDate: string;
}
