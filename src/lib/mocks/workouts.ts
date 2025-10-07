import type { Workout, WorkoutExercise } from "@/models";

/**
 * Mock data dla sesji treningowych użytkownika
 */

export const mockWorkouts: Workout[] = [
  {
    id: "workout-1",
    userId: "user-1",
    name: "Poranny trening nóg",
    description: "Intensywny trening nóg",
    startedAt: "2025-10-01T06:30:00Z",
    completedAt: "2025-10-01T07:45:00Z",
    durationMinutes: 75,
    caloriesBurned: 450,
    notes: "Świetna forma dzisiaj!",
    createdAt: "2025-10-01T06:30:00Z",
    updatedAt: "2025-10-01T07:45:00Z",
  },
  {
    id: "workout-2",
    userId: "user-1",
    name: "Trening górnych partii",
    description: "Klatka, plecy, ramiona",
    startedAt: "2025-09-30T17:00:00Z",
    completedAt: "2025-09-30T18:15:00Z",
    durationMinutes: 75,
    caloriesBurned: 380,
    createdAt: "2025-09-30T17:00:00Z",
    updatedAt: "2025-09-30T18:15:00Z",
  },
  {
    id: "workout-3",
    userId: "user-1",
    name: "Cardio - bieg",
    description: "Bieg interwałowy",
    startedAt: "2025-09-29T06:00:00Z",
    completedAt: "2025-09-29T06:45:00Z",
    durationMinutes: 45,
    caloriesBurned: 420,
    createdAt: "2025-09-29T06:00:00Z",
    updatedAt: "2025-09-29T06:45:00Z",
  },
  {
    id: "workout-4",
    userId: "user-1",
    name: "Trening w trakcie",
    description: "Aktualnie trenuję plecy",
    startedAt: "2025-10-02T18:00:00Z",
    completedAt: undefined, // Trening w trakcie
    durationMinutes: undefined,
    createdAt: "2025-10-02T18:00:00Z",
    updatedAt: "2025-10-02T18:00:00Z",
  },
];

/**
 * Mock data dla ćwiczeń wykonanych w treningach
 */
export const mockWorkoutExercises: WorkoutExercise[] = [
  // Ćwiczenia dla workout-1 (Poranny trening nóg)
  {
    id: "we-1",
    workoutId: "workout-1",
    exerciseTemplateId: "template-7",
    exerciseName: "Przysiad ze sztangą",
    order: 1,
    sets: 5,
    reps: 8,
    weightKg: 100,
    restSeconds: 180,
    notes: "Pełna głębokość",
    completedAt: "2025-10-01T06:50:00Z",
  },
  {
    id: "we-2",
    workoutId: "workout-1",
    exerciseTemplateId: "template-6",
    exerciseName: "Martwy ciąg",
    order: 2,
    sets: 4,
    reps: 6,
    weightKg: 120,
    restSeconds: 180,
    completedAt: "2025-10-01T07:10:00Z",
  },
  {
    id: "we-3",
    workoutId: "workout-1",
    exerciseTemplateId: "template-8",
    exerciseName: "Wykroki z hantlami",
    order: 3,
    sets: 3,
    reps: 12,
    weightKg: 15,
    restSeconds: 90,
    notes: "Na każdą nogę",
    completedAt: "2025-10-01T07:30:00Z",
  },
  {
    id: "we-4",
    workoutId: "workout-1",
    exerciseTemplateId: "template-9",
    exerciseName: "Wypychanie nóg",
    order: 4,
    sets: 3,
    reps: 15,
    weightKg: 150,
    restSeconds: 90,
    completedAt: "2025-10-01T07:45:00Z",
  },

  // Ćwiczenia dla workout-2 (Trening górnych partii)
  {
    id: "we-5",
    workoutId: "workout-2",
    exerciseTemplateId: "template-1",
    exerciseName: "Wyciskanie sztangi leżąc",
    order: 1,
    sets: 4,
    reps: 10,
    weightKg: 80,
    restSeconds: 120,
    notes: "Ostatnia seria do odmowy",
    completedAt: "2025-09-30T17:20:00Z",
  },
  {
    id: "we-6",
    workoutId: "workout-2",
    exerciseTemplateId: "template-4",
    exerciseName: "Wiosłowanie sztangą",
    order: 2,
    sets: 4,
    reps: 12,
    weightKg: 60,
    restSeconds: 120,
    completedAt: "2025-09-30T17:40:00Z",
  },
  {
    id: "we-7",
    workoutId: "workout-2",
    exerciseTemplateId: "template-10",
    exerciseName: "Wyciskanie hantli nad głowę",
    order: 3,
    sets: 3,
    reps: 12,
    weightKg: 20,
    restSeconds: 90,
    completedAt: "2025-09-30T18:00:00Z",
  },
  {
    id: "we-8",
    workoutId: "workout-2",
    exerciseTemplateId: "template-5",
    exerciseName: "Podciąganie",
    order: 4,
    sets: 3,
    reps: 8,
    restSeconds: 120,
    notes: "Z dodatkowym obciążeniem 10kg",
    completedAt: "2025-09-30T18:15:00Z",
  },

  // Ćwiczenia dla workout-3 (Cardio - bieg)
  {
    id: "we-9",
    workoutId: "workout-3",
    exerciseTemplateId: "template-13",
    exerciseName: "Bieg",
    order: 1,
    distanceKm: 8,
    durationSeconds: 2700,
    notes: "6x400m w szybkim tempie",
    completedAt: "2025-09-29T06:45:00Z",
  },

  // Ćwiczenia dla workout-4 (Trening w trakcie)
  {
    id: "we-10",
    workoutId: "workout-4",
    exerciseTemplateId: "template-5",
    exerciseName: "Podciąganie",
    order: 1,
    sets: 4,
    reps: 10,
    restSeconds: 120,
    completedAt: "2025-10-02T18:15:00Z",
  },
  {
    id: "we-11",
    workoutId: "workout-4",
    exerciseTemplateId: "template-4",
    exerciseName: "Wiosłowanie sztangą",
    order: 2,
    sets: 4,
    reps: 12,
    weightKg: 65,
    restSeconds: 120,
    completedAt: undefined, // Aktualnie wykonywane
  },
];

/**
 * Pomocnicze funkcje do pracy z treningami
 */

export function getWorkoutById(id: string): Workout | undefined {
  return mockWorkouts.find((workout) => workout.id === id);
}

export function getWorkoutsByUserId(userId: string): Workout[] {
  return mockWorkouts.filter((workout) => workout.userId === userId);
}

export function getWorkoutExercisesByWorkoutId(workoutId: string): WorkoutExercise[] {
  return mockWorkoutExercises.filter((exercise) => exercise.workoutId === workoutId);
}

export function getRecentWorkouts(userId: string, limit = 5): Workout[] {
  return mockWorkouts
    .filter((workout) => workout.userId === userId)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, limit);
}

export function getActiveWorkout(userId: string): Workout | undefined {
  return mockWorkouts.find((workout) => workout.userId === userId && !workout.completedAt);
}

export function getCompletedWorkouts(userId: string): Workout[] {
  return mockWorkouts.filter((workout) => workout.userId === userId && workout.completedAt);
}
