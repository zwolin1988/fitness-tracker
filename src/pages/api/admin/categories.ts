// src/pages/api/admin/categories.ts
// Admin API endpoint for creating new categories (POST)

import type { APIRoute } from "astro";

import { verifyAdminRole } from "@/lib/auth/admin";
import { CreateCategorySchema } from "@/lib/schemas/category";
import { CategoryError, createCategory } from "@/lib/services/category";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * POST /api/admin/categories
 * Creates a new category (admin only)
 * Requires: Authorization header with Bearer token
 * Body: { name: string, description?: string, image_url?: string }
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
    const authResult = await verifyAdminRole(supabase);
    if (!authResult.isAdmin) {
      return new Response(
        JSON.stringify({
          error: authResult.error || "Unauthorized",
        }),
        {
          status: authResult.error?.includes("Forbidden") ? 403 : 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON body",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate request body
    const validationResult = CreateCategorySchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create category via service
    const category = await createCategory(supabase, validationResult.data);

    return new Response(JSON.stringify(category), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle CategoryError
    if (error instanceof CategoryError) {
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
