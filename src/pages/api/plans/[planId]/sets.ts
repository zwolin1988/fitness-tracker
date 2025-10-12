// src/pages/api/plans/[planId]/sets.ts
// API endpoint for creating plan exercise sets

import type { APIRoute } from "astro";

import { CreatePlanSetSchema, PlanSetPlanIdParamSchema } from "@/lib/schemas/training-plan";
import { TrainingPlanError, createPlanSet } from "@/lib/services/training-plan";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * POST /api/plans/{planId}/sets
 * Creates a new set for a training plan
 * Requires: Authorization header with Bearer token
 * Path param: planId (uuid)
 * Body: { exerciseId, repetitions, weight, set_order? }
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
    const paramValidation = PlanSetPlanIdParamSchema.safeParse(params);

    if (!paramValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid plan ID",
          details: paramValidation.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { planId } = paramValidation.data;

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
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

    const validationResult = CreatePlanSetSchema.safeParse(body);

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

    // Build command with planId (set_order is optional, will be auto-generated if not provided)
    const command = {
      training_plan_id: planId,
      exercise_id: validationResult.data.exerciseId,
      repetitions: validationResult.data.repetitions,
      weight: validationResult.data.weight,
      ...(validationResult.data.set_order !== undefined && { set_order: validationResult.data.set_order }),
    };

    // Create plan set
    const newSet = await createPlanSet(supabase, planId, user.id, command as any);

    return new Response(JSON.stringify(newSet), {
      status: 201,
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
    console.error("Unexpected error in POST /api/plans/[planId]/sets:", error);
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
