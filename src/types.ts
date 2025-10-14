// src/types.ts

// DTO and Command Models for Fitness Tracker REST API.
// These types are based on the underlying database models from database.types.ts
// and are designed to satisfy the API plan defined in api-plan.md.

/* ================================
   1. Profile DTO & Commands
   ================================ */
// ProfileDTO represents the public profile of a user.
export interface ProfileDTO {
  user_id: string; // references auth.users(id)
  name: string;
  weight: number;
  height: number;
  // role is not exposed in the public DTO
  updated_at: string;
}

// Command model for updating the user's profile.
export interface UpdateProfileCommand {
  name: string;
  weight: number; // must be > 0
  height: number; // must be > 0
}

/* ================================
   2. Category DTO & Commands
   ================================ */
// CategoryDTO represents a read-only view of a category.
export interface CategoryDTO {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  created_at: string;
}

// Command to create a new category (admin only).
export interface CreateCategoryCommand {
  name: string;
  description?: string;
  image_url?: string;
}

// Command to update an existing category (admin only).
export interface UpdateCategoryCommand {
  name?: string;
  description?: string;
  image_url?: string;
}

/* ================================
   3. Exercise DTO & Commands
   ================================ */
// ExerciseDTO represents an exercise record.
export interface ExerciseDTO {
  id: string;
  name: string;
  description?: string | null;
  icon_svg?: string | null;
  difficulty: string;
  category_id: string;
  created_at: string;
}

// Command to create a new exercise (admin only).
export interface CreateExerciseCommand {
  name: string;
  description?: string;
  icon_svg?: string;
  difficulty: string;
  category_id: string;
}

// Command to update an existing exercise (admin only).
export interface UpdateExerciseCommand {
  name?: string;
  description?: string;
  icon_svg?: string;
  difficulty?: string;
  category_id?: string;
}

/* ================================
   4. Training Plan DTO & Commands
   ================================ */
// TrainingPlanDTO represents a user-created workout plan.
export interface TrainingPlanDTO {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

// Set data when creating a plan
export interface PlanExerciseSetInput {
  repetitions: number;
  weight: number;
  set_order?: number;
}

// Exercise with optional sets when creating a plan
export interface PlanExerciseInput {
  exerciseId: string;
  sets?: PlanExerciseSetInput[];
}

// Command to create a new training plan.
// 'exercises' is an array of exercises with optional sets.
export interface CreateTrainingPlanCommand {
  name: string;
  description?: string;
  exercises: PlanExerciseInput[];
}

// Command to update an existing training plan.
export interface UpdateTrainingPlanCommand {
  name?: string;
  description?: string;
  exerciseIds?: string[];
}

/* ================================
   5. Plan Exercise Set DTO & Commands
   ================================ */
// PlanExerciseSetDTO represents a set within a training plan.
export interface PlanExerciseSetDTO {
  id: string;
  training_plan_id: string;
  exercise_id: string;
  set_order: number;
  repetitions: number; // must be > 0
  weight: number; // must be >= 0
  created_at: string;
}

// Command to create a new plan exercise set.
export interface CreatePlanExerciseSetCommand {
  training_plan_id: string;
  exercise_id: string;
  set_order: number;
  repetitions: number;
  weight: number;
}

// Command to update an existing plan exercise set.
export interface UpdatePlanExerciseSetCommand {
  repetitions?: number;
  weight?: number;
  // Optionally update the set_order if needed.
  set_order?: number;
}

/* ================================
   6. Workout DTO & Commands
   ================================ */
// WorkoutDTO represents a workout session.
export interface WorkoutDTO {
  id: string;
  user_id: string;
  training_plan_id?: string | null;
  start_time: string;
  end_time?: string | null;
  created_at: string;
}

// Command to create a new workout.
// The training plan is optional.
export interface CreateWorkoutCommand {
  training_plan_id?: string;
}

// Command to end a workout session.
export interface EndWorkoutCommand {
  workout_id: string;
  // Optionally allow setting a specific end time (otherwise system time is used).
  end_time?: string;
}

/* ================================
   7. Workout Set DTO & Commands
   ================================ */
// WorkoutSetDTO represents a single set performed during a workout.
export interface WorkoutSetDTO {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_order: number;
  repetitions: number; // must be > 0
  weight: number; // must be >= 0
  completed: boolean;
  modified_at: string;
}

// Command to create a new workout set.
export interface CreateWorkoutSetCommand {
  workout_id: string;
  exercise_id: string;
  set_order: number;
  repetitions: number;
  weight: number;
}

// Command to update an existing workout set.
export interface UpdateWorkoutSetCommand {
  repetitions?: number;
  weight?: number;
  completed?: boolean;
}
