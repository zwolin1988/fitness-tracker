// src/pages/api/exercises/[id].ts
// Public API endpoint for getting exercise details by ID

import type { APIRoute } from "astro";

import { ExerciseIdParamSchema } from "@/lib/schemas/exercise";
import { ExerciseError, getExerciseById } from "@/lib/services/exercise";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * GET /api/exercises/{id}
 * Returns detailed information about a single exercise including category
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

    // Validate path parameter
    const validationResult = ExerciseIdParamSchema.safeParse(params);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid exercise ID",
          details: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id } = validationResult.data;

    // Fetch exercise detail from service
    const exercise = await getExerciseById(supabase, id);

    return new Response(JSON.stringify(exercise), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle ExerciseError
    if (error instanceof ExerciseError) {
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
    console.error("Unexpected error in GET /api/exercises/[id]:", error);
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
