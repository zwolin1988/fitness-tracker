// src/pages/api/admin/exercises/[id].ts
// Admin API endpoint for updating and deleting exercises

import type { APIRoute } from "astro";

import { verifyAdminRole } from "@/lib/auth/admin";
import { ExerciseIdParamSchema, UpdateExerciseSchema } from "@/lib/schemas/exercise";
import { ExerciseError, deleteExercise, updateExercise } from "@/lib/services/exercise";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * PUT /api/admin/exercises/{id}
 * Updates an existing exercise (admin only)
 * Requires: Authorization header with Bearer token
 * Body: { name?, description?, icon_svg?, difficulty?, category_id? }
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
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

    // Validate path parameter
    const paramValidation = ExerciseIdParamSchema.safeParse(params);

    if (!paramValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid exercise ID",
          details: paramValidation.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id } = paramValidation.data;

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

    const validationResult = UpdateExerciseSchema.safeParse(body);

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

    // Update exercise
    const updatedExercise = await updateExercise(supabase, id, validationResult.data);

    return new Response(JSON.stringify(updatedExercise), {
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
    console.error("Unexpected error in PUT /api/admin/exercises/[id]:", error);
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

/**
 * DELETE /api/admin/exercises/{id}
 * Deletes an exercise (admin only)
 * Requires: Authorization header with Bearer token
 * Business rule: Cannot delete if exercise is used in training plans or workouts
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
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

    // Validate path parameter
    const paramValidation = ExerciseIdParamSchema.safeParse(params);

    if (!paramValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid exercise ID",
          details: paramValidation.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id } = paramValidation.data;

    // Delete exercise
    await deleteExercise(supabase, id);

    // Return 204 No Content on success
    return new Response(null, {
      status: 204,
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
    console.error("Unexpected error in DELETE /api/admin/exercises/[id]:", error);
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
