// src/pages/api/workouts/[id]/sets.ts
// API endpoint for creating workout sets

import type { APIRoute } from "astro";

import { CreateWorkoutSetSchema, WorkoutIdParamSchema } from "@/lib/schemas/workout";
import { WorkoutError, createWorkoutSet } from "@/lib/services/workout";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * POST /api/workouts/{id}/sets
 * Creates a new set for a workout
 * Requires: Authorization header with Bearer token
 * Path param: id (uuid)
 * Body: { exerciseTemplateId, repetitions?, weight?, distance?, duration? }
 * Note: At least one metric (repetitions, weight, distance, duration) must be provided
 */
export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    // Get Supabase client from context
    const supabase = locals.supabase;
    if (!supabase) {
      return new Response(JSON.stringify({ error: "Database client not available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get authenticated user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "Invalid or missing authentication token",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate path parameter
    const paramValidation = WorkoutIdParamSchema.safeParse(params);

    if (!paramValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid workout ID",
          details: paramValidation.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id: workoutId } = paramValidation.data;

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON",
          message: "Request body must be valid JSON",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validationResult = CreateWorkoutSetSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Build command
    const command = {
      workout_id: workoutId,
      exercise_template_id: validationResult.data.exerciseTemplateId,
      repetitions: validationResult.data.repetitions,
      weight: validationResult.data.weight,
      distance: validationResult.data.distance,
      duration: validationResult.data.duration,
    };

    // Create workout set
    const newSet = await createWorkoutSet(supabase, workoutId, user.id, command);

    return new Response(JSON.stringify(newSet), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle WorkoutError
    if (error instanceof WorkoutError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          code: error.code,
        }),
        {
          status: error.statusCode,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle unexpected errors
    console.error("Unexpected error in POST /api/workouts/[id]/sets:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
