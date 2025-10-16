// src/lib/services/training-plan.ts
// Service layer for Training Plan operations with Supabase

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/db/database.types";
import type {
  CreatePlanExerciseSetCommand,
  CreateTrainingPlanCommand,
  ExerciseDTO,
  PlanExerciseSetDTO,
  TrainingPlanDTO,
  UpdatePlanExerciseSetCommand,
  UpdateTrainingPlanCommand,
} from "@/types";

// Type alias for our Supabase client
type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Response type for list of training plans
 */
export interface ListTrainingPlansResponse {
  items: TrainingPlanDTO[];
  total: number;
}

/**
 * Response type for training plan detail with exercises and sets
 */
export interface TrainingPlanDetailResponse extends TrainingPlanDTO {
  exercises: ExerciseDTO[];
  sets: PlanExerciseSetDTO[];
}

/**
 * Custom error class for training plan-related errors
 */
export class TrainingPlanError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = "TrainingPlanError";
  }
}

/**
 * Maximum number of training plans allowed per user
 */
const MAX_PLANS_PER_USER = 7;

/**
 * Helper: Checks if a training plan belongs to the user
 * @param supabase - Supabase client instance
 * @param planId - Training plan UUID
 * @param userId - User UUID
 * @returns true if plan belongs to user, false otherwise
 * @throws TrainingPlanError if plan not found or check fails
 */
async function checkPlanOwnership(supabase: TypedSupabaseClient, planId: string, userId: string): Promise<boolean> {
  const { data: plan, error } = await supabase.from("training_plans").select("user_id").eq("id", planId).maybeSingle();

  if (error) {
    console.error("Error checking plan ownership:", error);
    throw new TrainingPlanError("Failed to check plan ownership", 500, "CHECK_ERROR");
  }

  if (!plan) {
    throw new TrainingPlanError("Training plan not found", 404, "NOT_FOUND");
  }

  if (plan.user_id !== userId) {
    throw new TrainingPlanError("Forbidden: You don't have access to this training plan", 403, "FORBIDDEN");
  }

  return true;
}

/**
 * Helper: Validates that all exercises exist
 * @param supabase - Supabase client instance
 * @param exerciseIds - Array of exercise UUIDs
 * @throws TrainingPlanError if any exercise doesn't exist
 */
async function validateExercisesExist(supabase: TypedSupabaseClient, exerciseIds: string[]): Promise<void> {
  const { data: exercises, error } = await supabase.from("exercises").select("id").in("id", exerciseIds);

  if (error) {
    console.error("Error validating exercises:", error);
    throw new TrainingPlanError("Failed to validate exercises", 500, "VALIDATION_ERROR");
  }

  if (!exercises || exercises.length !== exerciseIds.length) {
    throw new TrainingPlanError("One or more exercises not found", 404, "EXERCISE_NOT_FOUND");
  }
}

/**
 * Helper: Gets the next set_order for a given plan and exercise
 * @param supabase - Supabase client instance
 * @param planId - Training plan UUID
 * @param exerciseId - Exercise UUID
 * @returns Next available set_order (0 if no sets exist)
 */
async function getNextSetOrder(supabase: TypedSupabaseClient, planId: string, exerciseId: string): Promise<number> {
  const { data: sets, error } = await supabase
    .from("plan_exercise_sets")
    .select("set_order")
    .eq("training_plan_id", planId)
    .eq("exercise_id", exerciseId)
    .order("set_order", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error getting next set order:", error);
    throw new TrainingPlanError("Failed to get next set order", 500, "ORDER_ERROR");
  }

  if (!sets || sets.length === 0) {
    return 0;
  }

  return sets[0].set_order + 1;
}

/**
 * Retrieves all training plans for a user
 * @param supabase - Supabase client instance
 * @param userId - User UUID
 * @returns List of training plans
 */
export async function listTrainingPlans(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<ListTrainingPlansResponse> {
  try {
    const { data: plans, error: fetchError } = await supabase
      .from("training_plans")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null) // Only show non-deleted plans
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching training plans:", fetchError);
      throw new TrainingPlanError("Failed to fetch training plans", 500, "FETCH_ERROR");
    }

    return {
      items: plans || [],
      total: plans?.length || 0,
    };
  } catch (error) {
    if (error instanceof TrainingPlanError) throw error;
    console.error("Unexpected error in listTrainingPlans:", error);
    throw new TrainingPlanError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Retrieves a single training plan by ID with exercises and sets
 * @param supabase - Supabase client instance
 * @param planId - Training plan UUID
 * @param userId - User UUID
 * @returns Training plan detail with exercises and sets
 * @throws TrainingPlanError if plan not found or access denied
 */
export async function getTrainingPlanById(
  supabase: TypedSupabaseClient,
  planId: string,
  userId: string
): Promise<TrainingPlanDetailResponse> {
  try {
    // Check ownership
    await checkPlanOwnership(supabase, planId, userId);

    // Fetch plan
    const { data: plan, error: planError } = await supabase
      .from("training_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError) {
      console.error("Error fetching training plan:", planError);
      throw new TrainingPlanError("Failed to fetch training plan", 500, "FETCH_ERROR");
    }

    // Fetch exercises associated with the plan
    const { data: planExercises, error: exercisesError } = await supabase
      .from("plan_exercises")
      .select("exercise_id, exercises(*)")
      .eq("training_plan_id", planId)
      .order("order_index", { ascending: true });

    if (exercisesError) {
      console.error("Error fetching plan exercises:", exercisesError);
      throw new TrainingPlanError("Failed to fetch plan exercises", 500, "FETCH_ERROR");
    }

    // Fetch sets for the plan
    const { data: sets, error: setsError } = await supabase
      .from("plan_exercise_sets")
      .select("*")
      .eq("training_plan_id", planId)
      .order("exercise_id", { ascending: true })
      .order("set_order", { ascending: true });

    if (setsError) {
      console.error("Error fetching plan sets:", setsError);
      throw new TrainingPlanError("Failed to fetch plan sets", 500, "FETCH_ERROR");
    }

    // Map exercises
    const exercises: ExerciseDTO[] = (planExercises || [])
      .map((pe: unknown) => pe.exercises)
      .filter((ex: unknown) => ex !== null);

    return {
      ...plan,
      exercises,
      sets: sets || [],
    };
  } catch (error) {
    if (error instanceof TrainingPlanError) throw error;
    console.error("Unexpected error in getTrainingPlanById:", error);
    throw new TrainingPlanError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Creates a new training plan with associated exercises and optional sets
 * @param supabase - Supabase client instance
 * @param userId - User UUID
 * @param command - Training plan creation data
 * @returns Newly created training plan
 * @throws TrainingPlanError if max plans limit reached or exercises don't exist
 */
export async function createTrainingPlan(
  supabase: TypedSupabaseClient,
  userId: string,
  command: CreateTrainingPlanCommand
): Promise<TrainingPlanDTO> {
  try {
    // Check max plans limit (7 plans per user)
    const { count, error: countError } = await supabase
      .from("training_plans")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      console.error("Error counting user plans:", countError);
      throw new TrainingPlanError("Failed to check plans limit", 500, "COUNT_ERROR");
    }

    if (count !== null && count >= MAX_PLANS_PER_USER) {
      throw new TrainingPlanError(
        `Maximum limit of ${MAX_PLANS_PER_USER} training plans reached`,
        403,
        "MAX_PLANS_EXCEEDED"
      );
    }

    // Extract and validate that all exercises exist
    const exerciseIds = command.exercises.map((ex) => ex.exerciseId);
    await validateExercisesExist(supabase, exerciseIds);

    // Insert training plan
    const { data: plan, error: insertError } = await supabase
      .from("training_plans")
      .insert({
        user_id: userId,
        name: command.name,
        description: command.description || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating training plan:", insertError);
      throw new TrainingPlanError("Failed to create training plan", 500, "INSERT_ERROR");
    }

    // Insert plan_exercises associations
    const planExercisesData = command.exercises.map((exercise, index) => ({
      training_plan_id: plan.id,
      exercise_id: exercise.exerciseId,
      order_index: index,
    }));

    const { error: exercisesError } = await supabase.from("plan_exercises").insert(planExercisesData);

    if (exercisesError) {
      console.error("Error inserting plan exercises:", exercisesError);
      // Rollback: delete the plan
      await supabase.from("training_plans").delete().eq("id", plan.id);
      throw new TrainingPlanError("Failed to associate exercises with plan", 500, "INSERT_ERROR");
    }

    // Insert plan_exercise_sets if sets are provided
    const allSetsData: {
      training_plan_id: string;
      exercise_id: string;
      set_order: number;
      repetitions: number;
      weight: number;
    }[] = [];

    for (const exercise of command.exercises) {
      if (exercise.sets && exercise.sets.length > 0) {
        exercise.sets.forEach((set, index) => {
          allSetsData.push({
            training_plan_id: plan.id,
            exercise_id: exercise.exerciseId,
            set_order: set.set_order ?? index, // Use provided order or index
            repetitions: set.repetitions,
            weight: set.weight,
          });
        });
      }
    }

    // Bulk insert all sets if any exist
    if (allSetsData.length > 0) {
      const { error: setsError } = await supabase.from("plan_exercise_sets").insert(allSetsData);

      if (setsError) {
        console.error("Error inserting plan exercise sets:", setsError);
        // Rollback: delete the plan and exercises
        await supabase.from("training_plans").delete().eq("id", plan.id);
        throw new TrainingPlanError("Failed to create plan sets", 500, "INSERT_ERROR");
      }
    }

    return plan;
  } catch (error) {
    if (error instanceof TrainingPlanError) throw error;
    console.error("Unexpected error in createTrainingPlan:", error);
    throw new TrainingPlanError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Updates an existing training plan
 * @param supabase - Supabase client instance
 * @param planId - Training plan UUID
 * @param userId - User UUID
 * @param command - Training plan update data
 * @returns Updated training plan
 * @throws TrainingPlanError if plan not found or access denied
 */
export async function updateTrainingPlan(
  supabase: TypedSupabaseClient,
  planId: string,
  userId: string,
  command: UpdateTrainingPlanCommand
): Promise<TrainingPlanDTO> {
  try {
    // Check ownership
    await checkPlanOwnership(supabase, planId, userId);

    // Handle exercises with sets (full replace)
    if (command.exercises) {
      const exerciseIds = command.exercises.map((ex) => ex.exerciseId);
      await validateExercisesExist(supabase, exerciseIds);

      // Delete existing sets and associations
      await supabase.from("plan_exercise_sets").delete().eq("training_plan_id", planId);
      await supabase.from("plan_exercises").delete().eq("training_plan_id", planId);

      // Insert new associations
      const planExercisesData = command.exercises.map((exercise, index) => ({
        training_plan_id: planId,
        exercise_id: exercise.exerciseId,
        order_index: index,
      }));

      const { error: exercisesError } = await supabase.from("plan_exercises").insert(planExercisesData);

      if (exercisesError) {
        console.error("Error inserting plan exercises:", exercisesError);
        throw new TrainingPlanError("Failed to update plan exercises", 500, "INSERT_ERROR");
      }

      // Insert new sets
      const allSetsData: {
        training_plan_id: string;
        exercise_id: string;
        set_order: number;
        repetitions: number;
        weight: number;
      }[] = [];

      for (const exercise of command.exercises) {
        if (exercise.sets && exercise.sets.length > 0) {
          exercise.sets.forEach((set, index) => {
            allSetsData.push({
              training_plan_id: planId,
              exercise_id: exercise.exerciseId,
              set_order: set.set_order ?? index,
              repetitions: set.repetitions,
              weight: set.weight,
            });
          });
        }
      }

      if (allSetsData.length > 0) {
        const { error: setsError } = await supabase.from("plan_exercise_sets").insert(allSetsData);

        if (setsError) {
          console.error("Error inserting plan exercise sets:", setsError);
          throw new TrainingPlanError("Failed to update plan sets", 500, "INSERT_ERROR");
        }
      }
    }
    // Handle simple exerciseIds update (backward compatibility)
    else if (command.exerciseIds) {
      await validateExercisesExist(supabase, command.exerciseIds);

      // Delete existing associations (but keep sets)
      const { error: deleteError } = await supabase.from("plan_exercises").delete().eq("training_plan_id", planId);

      if (deleteError) {
        console.error("Error deleting plan exercises:", deleteError);
        throw new TrainingPlanError("Failed to update plan exercises", 500, "DELETE_ERROR");
      }

      // Insert new associations
      const planExercisesData = command.exerciseIds.map((exerciseId, index) => ({
        training_plan_id: planId,
        exercise_id: exerciseId,
        order_index: index,
      }));

      const { error: insertError } = await supabase.from("plan_exercises").insert(planExercisesData);

      if (insertError) {
        console.error("Error inserting plan exercises:", insertError);
        throw new TrainingPlanError("Failed to update plan exercises", 500, "INSERT_ERROR");
      }
    }

    // Build update object for basic fields
    const updateData: Partial<Database["public"]["Tables"]["training_plans"]["Update"]> = {
      updated_at: new Date().toISOString(),
    };
    if (command.name !== undefined) updateData.name = command.name;
    if (command.description !== undefined) updateData.description = command.description || null;

    // Update training plan basic info
    const { data: plan, error: updateError } = await supabase
      .from("training_plans")
      .update(updateData)
      .eq("id", planId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating training plan:", updateError);
      throw new TrainingPlanError("Failed to update training plan", 500, "UPDATE_ERROR");
    }

    return plan;
  } catch (error) {
    if (error instanceof TrainingPlanError) throw error;
    console.error("Unexpected error in updateTrainingPlan:", error);
    throw new TrainingPlanError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Soft deletes a training plan (sets deleted_at timestamp)
 * Workouts that reference this plan remain intact
 * @param supabase - Supabase client instance
 * @param planId - Training plan UUID
 * @param userId - User UUID
 * @throws TrainingPlanError if plan not found or access denied
 */
export async function deleteTrainingPlan(supabase: TypedSupabaseClient, planId: string, userId: string): Promise<void> {
  try {
    // Check ownership
    await checkPlanOwnership(supabase, planId, userId);

    // Soft delete: set deleted_at timestamp
    const { error: deleteError } = await supabase
      .from("training_plans")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", planId);

    if (deleteError) {
      console.error("Error soft deleting training plan:", deleteError);
      throw new TrainingPlanError("Failed to delete training plan", 500, "DELETE_ERROR");
    }
  } catch (error) {
    if (error instanceof TrainingPlanError) throw error;
    console.error("Unexpected error in deleteTrainingPlan:", error);
    throw new TrainingPlanError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Creates a new set for a training plan
 * @param supabase - Supabase client instance
 * @param planId - Training plan UUID
 * @param userId - User UUID
 * @param command - Plan set creation data
 * @returns Newly created plan set
 * @throws TrainingPlanError if plan or exercise not found
 */
export async function createPlanSet(
  supabase: TypedSupabaseClient,
  planId: string,
  userId: string,
  command: CreatePlanExerciseSetCommand
): Promise<PlanExerciseSetDTO> {
  try {
    // Check plan ownership
    await checkPlanOwnership(supabase, planId, userId);

    // Validate exercise exists
    await validateExercisesExist(supabase, [command.exercise_id]);

    // Auto-generate set_order if not provided
    const setOrder = command.set_order ?? (await getNextSetOrder(supabase, planId, command.exercise_id));

    // Insert set
    const { data: set, error: insertError } = await supabase
      .from("plan_exercise_sets")
      .insert({
        training_plan_id: planId,
        exercise_id: command.exercise_id,
        set_order: setOrder,
        repetitions: command.repetitions,
        weight: command.weight,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating plan set:", insertError);
      throw new TrainingPlanError("Failed to create plan set", 500, "INSERT_ERROR");
    }

    return set;
  } catch (error) {
    if (error instanceof TrainingPlanError) throw error;
    console.error("Unexpected error in createPlanSet:", error);
    throw new TrainingPlanError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Updates an existing plan set
 * @param supabase - Supabase client instance
 * @param setId - Plan set UUID
 * @param planId - Training plan UUID (for ownership check)
 * @param userId - User UUID
 * @param command - Plan set update data
 * @returns Updated plan set
 * @throws TrainingPlanError if set not found or access denied
 */
export async function updatePlanSet(
  supabase: TypedSupabaseClient,
  setId: string,
  planId: string,
  userId: string,
  command: UpdatePlanExerciseSetCommand
): Promise<PlanExerciseSetDTO> {
  try {
    // Check plan ownership
    await checkPlanOwnership(supabase, planId, userId);

    // Check set exists and belongs to plan
    const { data: existingSet, error: checkError } = await supabase
      .from("plan_exercise_sets")
      .select("training_plan_id")
      .eq("id", setId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking set existence:", checkError);
      throw new TrainingPlanError("Failed to check set existence", 500, "CHECK_ERROR");
    }

    if (!existingSet) {
      throw new TrainingPlanError("Plan set not found", 404, "NOT_FOUND");
    }

    if (existingSet.training_plan_id !== planId) {
      throw new TrainingPlanError("Set does not belong to this training plan", 403, "FORBIDDEN");
    }

    // Build update object
    const updateData: Partial<Database["public"]["Tables"]["plan_exercise_sets"]["Update"]> = {};
    if (command.repetitions !== undefined) updateData.repetitions = command.repetitions;
    if (command.weight !== undefined) updateData.weight = command.weight;
    if (command.set_order !== undefined) updateData.set_order = command.set_order;

    // Update set
    const { data: set, error: updateError } = await supabase
      .from("plan_exercise_sets")
      .update(updateData)
      .eq("id", setId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating plan set:", updateError);
      throw new TrainingPlanError("Failed to update plan set", 500, "UPDATE_ERROR");
    }

    return set;
  } catch (error) {
    if (error instanceof TrainingPlanError) throw error;
    console.error("Unexpected error in updatePlanSet:", error);
    throw new TrainingPlanError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Deletes a plan set
 * @param supabase - Supabase client instance
 * @param setId - Plan set UUID
 * @param planId - Training plan UUID (for ownership check)
 * @param userId - User UUID
 * @throws TrainingPlanError if set not found or access denied
 */
export async function deletePlanSet(
  supabase: TypedSupabaseClient,
  setId: string,
  planId: string,
  userId: string
): Promise<void> {
  try {
    // Check plan ownership
    await checkPlanOwnership(supabase, planId, userId);

    // Check set exists and belongs to plan
    const { data: existingSet, error: checkError } = await supabase
      .from("plan_exercise_sets")
      .select("training_plan_id")
      .eq("id", setId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking set existence:", checkError);
      throw new TrainingPlanError("Failed to check set existence", 500, "CHECK_ERROR");
    }

    if (!existingSet) {
      throw new TrainingPlanError("Plan set not found", 404, "NOT_FOUND");
    }

    if (existingSet.training_plan_id !== planId) {
      throw new TrainingPlanError("Set does not belong to this training plan", 403, "FORBIDDEN");
    }

    // Delete set
    const { error: deleteError } = await supabase.from("plan_exercise_sets").delete().eq("id", setId);

    if (deleteError) {
      console.error("Error deleting plan set:", deleteError);
      throw new TrainingPlanError("Failed to delete plan set", 500, "DELETE_ERROR");
    }
  } catch (error) {
    if (error instanceof TrainingPlanError) throw error;
    console.error("Unexpected error in deletePlanSet:", error);
    throw new TrainingPlanError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}
