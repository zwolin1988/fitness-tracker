// src/pages/api/workouts/[id].ts
// API endpoint for getting workout details

import type { APIRoute } from "astro";

import { WorkoutIdParamSchema } from "@/lib/schemas/workout";
import { WorkoutError, getWorkoutById } from "@/lib/services/workout";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * GET /api/workouts/{id}
 * Returns detailed information about a workout including all exercise sets
 * Requires: Authorization header with Bearer token
 * Path param: id (uuid)
 */
export const GET: APIRoute = async ({ params, locals }) => {
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

    // Fetch workout detail
    const workout = await getWorkoutById(supabase, id, user.id);

    return new Response(JSON.stringify(workout), {
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
    console.error("Unexpected error in GET /api/workouts/[id]:", error);
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
