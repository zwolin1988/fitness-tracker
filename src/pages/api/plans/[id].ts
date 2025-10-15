// src/pages/api/plans/[id].ts
// API endpoint for getting, updating, and deleting a training plan

import type { APIRoute } from "astro";

import { TrainingPlanIdParamSchema, UpdateTrainingPlanSchema } from "@/lib/schemas/training-plan";
import {
  TrainingPlanError,
  deleteTrainingPlan,
  getTrainingPlanById,
  updateTrainingPlan,
} from "@/lib/services/training-plan";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * GET /api/plans/{id}
 * Returns detailed information about a training plan including exercises and sets
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
    const validationResult = TrainingPlanIdParamSchema.safeParse(params);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid training plan ID",
          details: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id } = validationResult.data;

    // Fetch training plan detail
    const plan = await getTrainingPlanById(supabase, id, user.id);

    return new Response(JSON.stringify(plan), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle TrainingPlanError
    if (error instanceof TrainingPlanError) {
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
    console.error("Unexpected error in GET /api/plans/[id]:", error);
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
 * PUT /api/plans/{id}
 * Updates an existing training plan
 * Requires: Authorization header with Bearer token
 * Path param: id (uuid)
 * Body: { name?, description?, exerciseIds? }
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
    const paramValidation = TrainingPlanIdParamSchema.safeParse(params);

    if (!paramValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid training plan ID",
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

    const validationResult = UpdateTrainingPlanSchema.safeParse(body);

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

    // Update training plan
    const updatedPlan = await updateTrainingPlan(supabase, id, user.id, validationResult.data);

    return new Response(JSON.stringify(updatedPlan), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle TrainingPlanError
    if (error instanceof TrainingPlanError) {
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
    console.error("Unexpected error in PUT /api/plans/[id]:", error);
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
 * DELETE /api/plans/{id}
 * Deletes a training plan (CASCADE will delete associated exercises and sets)
 * Requires: Authorization header with Bearer token
 * Path param: id (uuid)
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
    const validationResult = TrainingPlanIdParamSchema.safeParse(params);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid training plan ID",
          details: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id } = validationResult.data;

    // Delete training plan
    await deleteTrainingPlan(supabase, id, user.id);

    // Return 204 No Content on success
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // Handle TrainingPlanError
    if (error instanceof TrainingPlanError) {
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
    console.error("Unexpected error in DELETE /api/plans/[id]:", error);
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
