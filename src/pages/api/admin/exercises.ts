// src/pages/api/admin/exercises.ts
// Admin API endpoint for creating exercises

import type { APIRoute } from "astro";

import { verifyAdminRole } from "@/lib/auth/admin";
import { CreateExerciseSchema } from "@/lib/schemas/exercise";
import { ExerciseError, createExercise } from "@/lib/services/exercise";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * POST /api/admin/exercises
 * Creates a new exercise (admin only)
 * Requires: Authorization header with Bearer token
 * Body: { name, description?, icon_svg?, difficulty, category_id }
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Get Supabase client from context
    const supabase = locals.supabase;
    if (!supabase) {
      return new Response(JSON.stringify({ error: "Database client not available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify admin role
    const { isAdmin, error: authError } = await verifyAdminRole(supabase);

    if (!isAdmin) {
      return new Response(
        JSON.stringify({
          error: authError || "Forbidden",
          message: "Admin access required",
        }),
        {
          status: authError?.includes("Unauthorized") ? 401 : 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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

    const validationResult = CreateExerciseSchema.safeParse(body);

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

    // Create exercise
    const newExercise = await createExercise(supabase, validationResult.data);

    return new Response(JSON.stringify(newExercise), {
      status: 201,
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
    console.error("Unexpected error in POST /api/admin/exercises:", error);
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
