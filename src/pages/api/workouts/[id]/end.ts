// src/pages/api/workouts/[id]/end.ts
// API endpoint for ending a workout session

import type { APIRoute } from "astro";

import { WorkoutIdParamSchema } from "@/lib/schemas/workout";
import { WorkoutError, endWorkout } from "@/lib/services/workout";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * POST /api/workouts/{id}/end
 * Ends a workout session by setting end_time and calculating summary
 * Requires: Authorization header with Bearer token
 * Path param: id (uuid)
 * Note: end_time is auto-generated on server
 */
export const POST: APIRoute = async ({ params, locals }) => {
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
    const validationResult = WorkoutIdParamSchema.safeParse(params);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid workout ID",
          details: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id } = validationResult.data;

    // End workout
    const completedWorkout = await endWorkout(supabase, id, user.id);

    return new Response(JSON.stringify(completedWorkout), {
      status: 200,
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
    console.error("Unexpected error in POST /api/workouts/[id]/end:", error);
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
