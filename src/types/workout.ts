export interface Workout {
  id: string;
  userId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  caloriesBurned?: number;
  workoutType: "cardio" | "strength" | "flexibility" | "sports" | "other";
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  workoutId: string;
  name: string;
  sets?: number;
  reps?: number;
  weightKg?: number;
  distanceKm?: number;
  durationSeconds?: number;
  notes?: string;
}
