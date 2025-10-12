// src/lib/services/exercise.ts
// Service layer for Exercise operations with Supabase

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/db/database.types";
import type { CategoryDTO, CreateExerciseCommand, ExerciseDTO, UpdateExerciseCommand } from "@/types";

// Type alias for our Supabase client
type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Response type for paginated list of exercises
 */
export interface ListExercisesResponse {
  items: ExerciseDTO[];
  page: number;
  totalPages: number;
}

/**
 * Response type for exercise detail with category information
 */
export interface ExerciseDetailResponse extends ExerciseDTO {
  category: CategoryDTO;
}

/**
 * Filter options for listing exercises
 */
export interface ExerciseFilters {
  categoryId?: string;
  difficulty?: string;
}

/**
 * Custom error class for exercise-related errors
 */
export class ExerciseError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = "ExerciseError";
  }
}

/**
 * Retrieves a paginated list of exercises with optional filtering
 * @param supabase - Supabase client instance
 * @param filters - Optional filters (categoryId, difficulty)
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Paginated list of exercises
 */
export async function listExercises(
  supabase: TypedSupabaseClient,
  filters: ExerciseFilters,
  page: number,
  limit: number
): Promise<ListExercisesResponse> {
  try {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build query with filters
    let query = supabase.from("exercises").select("*").order("created_at", { ascending: false });

    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    if (filters.difficulty) {
      query = query.eq("difficulty", filters.difficulty);
    }

    // Fetch exercises with pagination
    const { data: exercises, error: fetchError } = await query.range(offset, offset + limit - 1);

    if (fetchError) {
      console.error("Error fetching exercises:", fetchError);
      throw new ExerciseError("Failed to fetch exercises", 500, "FETCH_ERROR");
    }

    // Get total count for pagination (with same filters)
    let countQuery = supabase.from("exercises").select("*", { count: "exact", head: true });

    if (filters.categoryId) {
      countQuery = countQuery.eq("category_id", filters.categoryId);
    }

    if (filters.difficulty) {
      countQuery = countQuery.eq("difficulty", filters.difficulty);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error("Error counting exercises:", countError);
      throw new ExerciseError("Failed to count exercises", 500, "COUNT_ERROR");
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return {
      items: exercises || [],
      page,
      totalPages,
    };
  } catch (error) {
    if (error instanceof ExerciseError) throw error;
    console.error("Unexpected error in listExercises:", error);
    throw new ExerciseError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Retrieves a single exercise by ID with category information
 * @param supabase - Supabase client instance
 * @param id - Exercise UUID
 * @returns Exercise detail with category
 * @throws ExerciseError if exercise not found
 */
export async function getExerciseById(supabase: TypedSupabaseClient, id: string): Promise<ExerciseDetailResponse> {
  try {
    // Fetch exercise with category join
    const { data: exercise, error: fetchError } = await supabase
      .from("exercises")
      .select("*, categories(*)")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        throw new ExerciseError("Exercise not found", 404, "NOT_FOUND");
      }
      console.error("Error fetching exercise:", fetchError);
      throw new ExerciseError("Failed to fetch exercise", 500, "FETCH_ERROR");
    }

    if (!exercise || !exercise.categories) {
      throw new ExerciseError("Exercise or category not found", 404, "NOT_FOUND");
    }

    // Map to response format
    const { categories, ...exerciseData } = exercise;

    return {
      ...exerciseData,
      category: categories as CategoryDTO,
    };
  } catch (error) {
    if (error instanceof ExerciseError) throw error;
    console.error("Unexpected error in getExerciseById:", error);
    throw new ExerciseError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Creates a new exercise (admin only)
 * @param supabase - Supabase client instance
 * @param command - Exercise creation data
 * @returns Newly created exercise
 * @throws ExerciseError if validation fails or category doesn't exist
 */
export async function createExercise(
  supabase: TypedSupabaseClient,
  command: CreateExerciseCommand
): Promise<ExerciseDTO> {
  try {
    // Check if category exists
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", command.category_id)
      .maybeSingle();

    if (categoryError) {
      console.error("Error checking category:", categoryError);
      throw new ExerciseError("Failed to check category", 500, "CHECK_ERROR");
    }

    if (!category) {
      throw new ExerciseError("Category not found", 404, "CATEGORY_NOT_FOUND");
    }

    // Check if exercise with this name already exists
    const { data: existing, error: checkError } = await supabase
      .from("exercises")
      .select("id")
      .eq("name", command.name)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing exercise:", checkError);
      throw new ExerciseError("Failed to check existing exercise", 500, "CHECK_ERROR");
    }

    if (existing) {
      throw new ExerciseError("Exercise with this name already exists", 409, "DUPLICATE_NAME");
    }

    // Insert new exercise
    const { data: exercise, error: insertError } = await supabase
      .from("exercises")
      .insert({
        name: command.name,
        description: command.description || null,
        icon_svg: command.icon_svg || null,
        difficulty: command.difficulty,
        category_id: command.category_id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating exercise:", insertError);
      // Check for unique constraint violation
      if (insertError.code === "23505") {
        throw new ExerciseError("Exercise with this name already exists", 409, "DUPLICATE_NAME");
      }
      // Check for foreign key violation
      if (insertError.code === "23503") {
        throw new ExerciseError("Category not found", 404, "CATEGORY_NOT_FOUND");
      }
      throw new ExerciseError("Failed to create exercise", 500, "INSERT_ERROR");
    }

    return exercise;
  } catch (error) {
    if (error instanceof ExerciseError) throw error;
    console.error("Unexpected error in createExercise:", error);
    throw new ExerciseError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Updates an existing exercise (admin only)
 * @param supabase - Supabase client instance
 * @param id - Exercise UUID
 * @param command - Exercise update data
 * @returns Updated exercise
 * @throws ExerciseError if exercise not found or validation fails
 */
export async function updateExercise(
  supabase: TypedSupabaseClient,
  id: string,
  command: UpdateExerciseCommand
): Promise<ExerciseDTO> {
  try {
    // Check if exercise exists
    const { data: existing, error: checkError } = await supabase
      .from("exercises")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking exercise existence:", checkError);
      throw new ExerciseError("Failed to check exercise existence", 500, "CHECK_ERROR");
    }

    if (!existing) {
      throw new ExerciseError("Exercise not found", 404, "NOT_FOUND");
    }

    // If updating category_id, check if category exists
    if (command.category_id) {
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("id", command.category_id)
        .maybeSingle();

      if (categoryError) {
        console.error("Error checking category:", categoryError);
        throw new ExerciseError("Failed to check category", 500, "CHECK_ERROR");
      }

      if (!category) {
        throw new ExerciseError("Category not found", 404, "CATEGORY_NOT_FOUND");
      }
    }

    // If updating name, check for duplicates
    if (command.name) {
      const { data: duplicate, error: dupError } = await supabase
        .from("exercises")
        .select("id")
        .eq("name", command.name)
        .neq("id", id)
        .maybeSingle();

      if (dupError) {
        console.error("Error checking duplicate name:", dupError);
        throw new ExerciseError("Failed to check duplicate name", 500, "CHECK_ERROR");
      }

      if (duplicate) {
        throw new ExerciseError("Exercise with this name already exists", 409, "DUPLICATE_NAME");
      }
    }

    // Build update object with only provided fields
    const updateData: Partial<Database["public"]["Tables"]["exercises"]["Update"]> = {};
    if (command.name !== undefined) updateData.name = command.name;
    if (command.description !== undefined) updateData.description = command.description || null;
    if (command.icon_svg !== undefined) updateData.icon_svg = command.icon_svg || null;
    if (command.difficulty !== undefined) updateData.difficulty = command.difficulty;
    if (command.category_id !== undefined) updateData.category_id = command.category_id;

    // Update exercise
    const { data: exercise, error: updateError } = await supabase
      .from("exercises")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating exercise:", updateError);
      // Check for unique constraint violation
      if (updateError.code === "23505") {
        throw new ExerciseError("Exercise with this name already exists", 409, "DUPLICATE_NAME");
      }
      // Check for foreign key violation
      if (updateError.code === "23503") {
        throw new ExerciseError("Category not found", 404, "CATEGORY_NOT_FOUND");
      }
      throw new ExerciseError("Failed to update exercise", 500, "UPDATE_ERROR");
    }

    return exercise;
  } catch (error) {
    if (error instanceof ExerciseError) throw error;
    console.error("Unexpected error in updateExercise:", error);
    throw new ExerciseError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Deletes an exercise (admin only)
 * @param supabase - Supabase client instance
 * @param id - Exercise UUID
 * @throws ExerciseError if exercise not found or is in use
 */
export async function deleteExercise(supabase: TypedSupabaseClient, id: string): Promise<void> {
  try {
    // Check if exercise exists
    const { data: existing, error: checkError } = await supabase
      .from("exercises")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking exercise existence:", checkError);
      throw new ExerciseError("Failed to check exercise existence", 500, "CHECK_ERROR");
    }

    if (!existing) {
      throw new ExerciseError("Exercise not found", 404, "NOT_FOUND");
    }

    // Check if exercise is used in plan_exercise_sets
    const { count: planSetsCount, error: planSetsError } = await supabase
      .from("plan_exercise_sets")
      .select("*", { count: "exact", head: true })
      .eq("exercise_id", id);

    if (planSetsError) {
      console.error("Error checking plan exercise sets:", planSetsError);
      throw new ExerciseError("Failed to check exercise usage in plans", 500, "CHECK_ERROR");
    }

    if (planSetsCount && planSetsCount > 0) {
      throw new ExerciseError(
        "Cannot delete exercise that is used in training plans",
        409,
        "IN_USE_IN_PLANS"
      );
    }

    // Check if exercise is used in workout_sets
    const { count: workoutSetsCount, error: workoutSetsError } = await supabase
      .from("workout_sets")
      .select("*", { count: "exact", head: true })
      .eq("exercise_id", id);

    if (workoutSetsError) {
      console.error("Error checking workout sets:", workoutSetsError);
      throw new ExerciseError("Failed to check exercise usage in workouts", 500, "CHECK_ERROR");
    }

    if (workoutSetsCount && workoutSetsCount > 0) {
      throw new ExerciseError(
        "Cannot delete exercise that is used in workouts",
        409,
        "IN_USE_IN_WORKOUTS"
      );
    }

    // Delete exercise
    const { error: deleteError } = await supabase.from("exercises").delete().eq("id", id);

    if (deleteError) {
      console.error("Error deleting exercise:", deleteError);
      throw new ExerciseError("Failed to delete exercise", 500, "DELETE_ERROR");
    }
  } catch (error) {
    if (error instanceof ExerciseError) throw error;
    console.error("Unexpected error in deleteExercise:", error);
    throw new ExerciseError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}
