// src/lib/services/workout.ts
// Business logic for Workouts and Workout Sets

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/db/database.types";

// Type alias for our Supabase client
type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Custom error class for workout-related errors
 */
export class WorkoutError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public code?: string
  ) {
    super(message);
    this.name = "WorkoutError";
  }
}

// ===========================
// DTOs (Data Transfer Objects)
// ===========================

/**
 * Workout with basic information
 */
export interface WorkoutDTO {
  id: string;
  userId: string;
  trainingPlanId: string; // Required - every workout is based on a plan
  startTime: string;
  endTime: string | null;
  duration: number | null; // in seconds
  totalSets: number;
  estimatedCalories: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Workout with detailed exercise sets
 */
export interface WorkoutDetailDTO extends WorkoutDTO {
  sets: WorkoutSetDTO[];
}

/**
 * Workout set/exercise performed in a workout
 */
export interface WorkoutSetDTO {
  id: string;
  workoutId: string;
  exerciseId: string;
  exerciseName: string;
  repetitions: number;
  weight: number;
  setOrder: number;
  completed: boolean; // Whether user has completed this set
  createdAt: string;
}

// ===========================
// Command Models (Input DTOs)
// ===========================

export interface CreateWorkoutCommand {
  planId: string; // Required - ID of training plan to base workout on
}

export interface CreateWorkoutSetCommand {
  workout_id: string;
  exercise_id: string;
  repetitions: number;
  weight: number;
}

export interface UpdateWorkoutSetCommand {
  repetitions?: number;
  weight?: number;
  completed?: boolean;
}

export interface WorkoutListFilters {
  startDate?: string;
  endDate?: string;
}

// ===========================
// Helper Functions
// ===========================

/**
 * Checks if the workout belongs to the specified user
 * @throws WorkoutError if workout doesn't exist or user is not the owner
 */
async function checkWorkoutOwnership(supabase: TypedSupabaseClient, workoutId: string, userId: string): Promise<void> {
  const { data: workout, error } = await supabase.from("workouts").select("user_id").eq("id", workoutId).single();

  if (error || !workout) {
    throw new WorkoutError("Workout not found", 404, "WORKOUT_NOT_FOUND");
  }

  if (workout.user_id !== userId) {
    throw new WorkoutError("You do not have permission to access this workout", 403, "WORKOUT_ACCESS_DENIED");
  }
}

/**
 * Checks if workout is not yet completed (end_time is null)
 * @throws WorkoutError if workout is already completed
 */
async function checkWorkoutNotCompleted(supabase: TypedSupabaseClient, workoutId: string): Promise<void> {
  const { data: workout, error } = await supabase.from("workouts").select("end_time").eq("id", workoutId).single();

  if (error || !workout) {
    throw new WorkoutError("Workout not found", 404, "WORKOUT_NOT_FOUND");
  }

  if (workout.end_time !== null) {
    throw new WorkoutError("Cannot modify a completed workout", 409, "WORKOUT_ALREADY_COMPLETED");
  }
}

/**
 * Validates that a training plan exists and belongs to the user
 * @throws WorkoutError if plan doesn't exist or doesn't belong to user
 */
async function validateTrainingPlanAccess(
  supabase: TypedSupabaseClient,
  planId: string,
  userId: string
): Promise<void> {
  const { data: plan, error } = await supabase.from("training_plans").select("id, user_id").eq("id", planId).single();

  if (error || !plan) {
    throw new WorkoutError("Training plan not found", 404, "TRAINING_PLAN_NOT_FOUND");
  }

  if (plan.user_id !== userId) {
    throw new WorkoutError("You do not have access to this training plan", 403, "TRAINING_PLAN_ACCESS_DENIED");
  }
}

/**
 * Gets the next set order for a workout
 */
async function getNextSetOrder(supabase: TypedSupabaseClient, workoutId: string): Promise<number> {
  const { data, error } = await supabase
    .from("workout_sets")
    .select("set_order")
    .eq("workout_id", workoutId)
    .order("set_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error getting max set order:", error);
    return 1;
  }

  return data ? data.set_order + 1 : 1;
}

/**
 * Calculates workout summary statistics
 */
function calculateWorkoutSummary(workout: any): {
  duration: number | null;
  totalSets: number;
  estimatedCalories: number | null;
} {
  const duration = workout.end_time
    ? Math.floor((new Date(workout.end_time).getTime() - new Date(workout.start_time).getTime()) / 1000)
    : null;

  const totalSets = workout.workout_sets?.length || 0;

  // Simple calorie estimation: 5 calories per set + 0.1 calorie per second
  const estimatedCalories = duration ? Math.round(totalSets * 5 + duration * 0.1) : null;

  return { duration, totalSets, estimatedCalories };
}

/**
 * Maps database workout to DTO
 */
function mapWorkoutToDTO(workout: any): WorkoutDTO {
  const { duration, totalSets, estimatedCalories } = calculateWorkoutSummary(workout);

  return {
    id: workout.id,
    userId: workout.user_id,
    trainingPlanId: workout.training_plan_id,
    startTime: workout.start_time,
    endTime: workout.end_time,
    duration,
    totalSets,
    estimatedCalories,
    createdAt: workout.created_at,
    updatedAt: workout.updated_at,
  };
}

/**
 * Maps database workout set to DTO
 */
function mapWorkoutSetToDTO(set: any): WorkoutSetDTO {
  return {
    id: set.id,
    workoutId: set.workout_id,
    exerciseId: set.exercise_id,
    exerciseName: set.exercises?.name || "Unknown Exercise",
    repetitions: set.repetitions,
    weight: set.weight,
    setOrder: set.set_order,
    completed: set.completed ?? false,
    createdAt: set.created_at,
  };
}

// ===========================
// Workout CRUD Operations
// ===========================

/**
 * Creates a new workout session based on a training plan
 * Auto-generates start_time and copies exercises/sets from the plan
 * All sets are marked as completed=false initially
 */
export async function createWorkout(
  supabase: TypedSupabaseClient,
  userId: string,
  command: CreateWorkoutCommand
): Promise<WorkoutDetailDTO> {
  // Validate training plan exists and user has access
  await validateTrainingPlanAccess(supabase, command.planId, userId);

  // Create workout with training_plan_id and auto start_time
  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .insert({
      user_id: userId,
      training_plan_id: command.planId,
      start_time: new Date().toISOString(),
    })
    .select()
    .single();

  if (workoutError || !workout) {
    console.error("Error creating workout:", workoutError);
    throw new WorkoutError("Failed to create workout", 500, "WORKOUT_CREATE_FAILED");
  }

  // Fetch plan exercise sets (template for workout)
  const { data: planSets, error: planSetsError } = await supabase
    .from("plan_exercise_sets")
    .select("exercise_id, repetitions, weight, set_order")
    .eq("training_plan_id", command.planId)
    .order("set_order", { ascending: true });

  if (planSetsError) {
    console.error("Error fetching plan sets:", planSetsError);
    throw new WorkoutError("Failed to fetch training plan exercises", 500, "PLAN_SETS_FETCH_FAILED");
  }

  // Copy plan sets to workout_exercises
  let copiedSets: WorkoutSetDTO[] = [];

  if (planSets && planSets.length > 0) {
    // Prepare data for bulk insert
    const workoutExercisesData = planSets.map((planSet) => ({
      workout_id: workout.id,
      exercise_id: planSet.exercise_id,
      repetitions: planSet.repetitions,
      weight: planSet.weight,
      set_order: planSet.set_order,
      completed: false, // User will mark as completed during workout
    }));

    // Insert all sets
    const { data: insertedSets, error: insertError } = await supabase
      .from("workout_sets")
      .insert(workoutExercisesData)
      .select("*, exercises(name)");

    if (insertError || !insertedSets) {
      console.error("Error copying sets to workout:", insertError);
      // Rollback: delete the workout
      await supabase.from("workouts").delete().eq("id", workout.id);
      throw new WorkoutError("Failed to copy exercises to workout", 500, "WORKOUT_EXERCISES_COPY_FAILED");
    }

    copiedSets = insertedSets.map(mapWorkoutSetToDTO);
  }

  return {
    ...mapWorkoutToDTO(workout),
    sets: copiedSets,
  };
}

/**
 * Lists all workouts for a user with optional date filtering
 */
export async function listWorkouts(
  supabase: TypedSupabaseClient,
  userId: string,
  filters?: WorkoutListFilters
): Promise<WorkoutDTO[]> {
  let query = supabase
    .from("workouts")
    .select("*, workout_sets(*)")
    .eq("user_id", userId)
    .order("start_time", { ascending: false });

  // Apply date filters if provided
  if (filters?.startDate) {
    query = query.gte("start_time", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("start_time", filters.endDate);
  }

  const { data: workouts, error } = await query;

  if (error) {
    console.error("Error fetching workouts:", error);
    throw new WorkoutError("Failed to fetch workouts", 500, "WORKOUTS_FETCH_FAILED");
  }

  return (workouts || []).map(mapWorkoutToDTO);
}

/**
 * Gets detailed workout by ID including all exercise sets
 */
export async function getWorkoutById(
  supabase: TypedSupabaseClient,
  workoutId: string,
  userId: string
): Promise<WorkoutDetailDTO> {
  // Check ownership
  await checkWorkoutOwnership(supabase, workoutId, userId);

  // Fetch workout with sets
  const { data: workout, error } = await supabase
    .from("workouts")
    .select(
      `
      *,
      workout_sets(
        *,
        exercises(name)
      )
    `
    )
    .eq("id", workoutId)
    .single();

  if (error || !workout) {
    console.error("Error fetching workout:", error);
    throw new WorkoutError("Failed to fetch workout", 500, "WORKOUT_FETCH_FAILED");
  }

  // Map sets with exercise names
  const sets = (workout.workout_sets || []).sort((a: any, b: any) => a.set_order - b.set_order).map(mapWorkoutSetToDTO);

  return {
    ...mapWorkoutToDTO(workout),
    sets,
  };
}

/**
 * Ends a workout session by setting end_time
 */
export async function endWorkout(
  supabase: TypedSupabaseClient,
  workoutId: string,
  userId: string
): Promise<WorkoutDetailDTO> {
  // Check ownership
  await checkWorkoutOwnership(supabase, workoutId, userId);

  // Check workout is not already completed
  await checkWorkoutNotCompleted(supabase, workoutId);

  // Set end_time
  const { data: workout, error: updateError } = await supabase
    .from("workouts")
    .update({
      end_time: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", workoutId)
    .select(
      `
      *,
      workout_exercises(
        *,
        exercise_templates(name)
      )
    `
    )
    .single();

  if (updateError || !workout) {
    console.error("Error ending workout:", updateError);
    throw new WorkoutError("Failed to end workout", 500, "WORKOUT_END_FAILED");
  }

  const sets = (workout.workout_exercises || [])
    .sort((a: any, b: any) => a.set_order - b.set_order)
    .map(mapWorkoutSetToDTO);

  return {
    ...mapWorkoutToDTO(workout),
    sets,
  };
}

// ===========================
// Workout Set Operations
// ===========================

/**
 * Creates a new workout set/exercise
 * User can add additional sets during workout
 */
export async function createWorkoutSet(
  supabase: TypedSupabaseClient,
  workoutId: string,
  userId: string,
  command: CreateWorkoutSetCommand
): Promise<WorkoutSetDTO> {
  // Check ownership
  await checkWorkoutOwnership(supabase, workoutId, userId);

  // Check workout is not completed
  await checkWorkoutNotCompleted(supabase, workoutId);

  // Validate exercise exists
  const { data: exercise, error: exerciseError } = await supabase
    .from("exercises")
    .select("id")
    .eq("id", command.exercise_id)
    .single();

  if (exerciseError || !exercise) {
    throw new WorkoutError(`Exercise with ID ${command.exercise_id} not found`, 404, "EXERCISE_NOT_FOUND");
  }

  // Get next set order
  const setOrder = await getNextSetOrder(supabase, workoutId);

  // Create set
  const { data: set, error } = await supabase
    .from("workout_sets")
    .insert({
      workout_id: command.workout_id,
      exercise_id: command.exercise_id,
      repetitions: command.repetitions,
      weight: command.weight,
      set_order: setOrder,
      completed: false, // New sets default to not completed
    })
    .select("*, exercises(name)")
    .single();

  if (error || !set) {
    console.error("Error creating workout set:", error);
    throw new WorkoutError("Failed to create workout set", 500, "WORKOUT_SET_CREATE_FAILED");
  }

  return mapWorkoutSetToDTO(set);
}

/**
 * Updates a workout set (PATCH - partial update)
 */
export async function updateWorkoutSet(
  supabase: TypedSupabaseClient,
  setId: string,
  workoutId: string,
  userId: string,
  command: UpdateWorkoutSetCommand
): Promise<WorkoutSetDTO> {
  // Check workout ownership
  await checkWorkoutOwnership(supabase, workoutId, userId);

  // Check workout is not completed
  await checkWorkoutNotCompleted(supabase, workoutId);

  // Verify set belongs to workout
  const { data: existingSet, error: checkError } = await supabase
    .from("workout_sets")
    .select("workout_id")
    .eq("id", setId)
    .single();

  if (checkError || !existingSet) {
    throw new WorkoutError("Workout set not found", 404, "WORKOUT_SET_NOT_FOUND");
  }

  if (existingSet.workout_id !== workoutId) {
    throw new WorkoutError("Workout set does not belong to the specified workout", 400, "WORKOUT_SET_MISMATCH");
  }

  // Build update object with only provided fields
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (command.repetitions !== undefined) {
    updateData.repetitions = command.repetitions;
  }
  if (command.weight !== undefined) {
    updateData.weight = command.weight;
  }
  if (command.completed !== undefined) {
    updateData.completed = command.completed;
  }

  // Update set
  const { data: set, error } = await supabase
    .from("workout_sets")
    .update(updateData)
    .eq("id", setId)
    .select("*, exercises(name)")
    .single();

  if (error || !set) {
    console.error("Error updating workout set:", error);
    throw new WorkoutError("Failed to update workout set", 500, "WORKOUT_SET_UPDATE_FAILED");
  }

  return mapWorkoutSetToDTO(set);
}
