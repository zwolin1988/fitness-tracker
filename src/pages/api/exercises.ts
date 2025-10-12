// src/pages/api/exercises.ts
// Public API endpoint for listing exercises with filtering and pagination

import type { APIRoute } from "astro";

import { ListExercisesQuerySchema } from "@/lib/schemas/exercise";
import { ExerciseError, listExercises } from "@/lib/services/exercise";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * GET /api/exercises
 * Returns a paginated list of exercises with optional filtering
 * Query params: categoryId (uuid), difficulty (string), page (default: 1), limit (default: 20, max: 100)
 */
export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Get Supabase client from context
    const supabase = locals.supabase;
    if (!supabase) {
      return new Response(JSON.stringify({ error: "Database client not available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate query parameters
    const queryParams = {
      categoryId: url.searchParams.get("categoryId"),
      difficulty: url.searchParams.get("difficulty"),
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
    };

    const validationResult = ListExercisesQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { categoryId, difficulty, page, limit } = validationResult.data;

    // Build filters object
    const filters = {
      categoryId,
      difficulty,
    };

    // Fetch exercises from service
    const result = await listExercises(supabase, filters, page, limit);

    return new Response(JSON.stringify(result), {
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
    console.error("Unexpected error in GET /api/exercises:", error);
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
