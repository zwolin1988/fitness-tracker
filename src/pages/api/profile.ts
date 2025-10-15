// src/pages/api/profile.ts
// API endpoint for managing authenticated user's profile

import type { APIRoute } from "astro";

import { UpdateProfileSchema } from "@/lib/schemas/profile";
import { ProfileError, getProfile, updateProfile } from "@/lib/services/profile";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * GET /api/profile
 * Returns the profile of the authenticated user
 * Requires: Authorization header with Bearer token
 */
export const GET: APIRoute = async ({ locals }) => {
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

    // Fetch user's profile
    const profile = await getProfile(supabase, user.id);

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle ProfileError
    if (error instanceof ProfileError) {
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
    console.error("Unexpected error in GET /api/profile:", error);
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
 * PUT /api/profile
 * Updates the profile of the authenticated user
 * Requires: Authorization header with Bearer token
 * Body: { name: string, weight: number, height: number }
 */
export const PUT: APIRoute = async ({ request, locals }) => {
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

    const validationResult = UpdateProfileSchema.safeParse(body);

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

    // Update user's profile
    const updatedProfile = await updateProfile(supabase, user.id, validationResult.data);

    return new Response(JSON.stringify(updatedProfile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle ProfileError
    if (error instanceof ProfileError) {
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
    console.error("Unexpected error in PUT /api/profile:", error);
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
