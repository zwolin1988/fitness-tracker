/**
 * Szablon ćwiczenia - katalog dostępnych ćwiczeń w aplikacji
 */
export interface ExerciseTemplate {
  id: string;
  name: string;
  description?: string;
  category: "strength" | "cardio" | "flexibility" | "sports" | "other";
  muscleGroups?: string[]; // np. ["chest", "triceps"]
  equipment?: string[]; // np. ["barbell", "bench"]
  difficulty?: "beginner" | "intermediate" | "advanced";
  instructions?: string;
  videoUrl?: string;
  imageUrl?: string;
}

/**
 * Sesja treningowa użytkownika
 */
export interface Workout {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startedAt: string; // Kiedy rozpoczęto trening
  completedAt?: string; // Kiedy zakończono trening (null jeśli w trakcie)
  durationMinutes?: number; // Obliczane automatycznie
  caloriesBurned?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Konkretne wykonanie ćwiczenia w ramach treningu użytkownika
 */
export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseTemplateId: string; // Referencja do ExerciseTemplate
  exerciseName: string; // Denormalizowane dla wydajności
  order: number; // Kolejność w treningu
  sets?: number;
  reps?: number;
  weightKg?: number;
  distanceKm?: number;
  durationSeconds?: number;
  restSeconds?: number; // Czas odpoczynku między seriami
  notes?: string;
  completedAt?: string; // Kiedy zakończono to ćwiczenie
}
