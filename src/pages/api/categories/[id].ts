// src/pages/api/categories/[id].ts
// Public API endpoint for getting category details by ID

import type { APIRoute } from "astro";

import { CategoryIdParamSchema } from "@/lib/schemas/category";
import { CategoryError, getCategoryById } from "@/lib/services/category";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * GET /api/categories/:id
 * Returns category details with exercises count
 * Path params: id (UUID)
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
    const validationResult = CategoryIdParamSchema.safeParse(params);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid category ID",
          details: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id } = validationResult.data;

    // Fetch category from service
    const category = await getCategoryById(supabase, id);

    return new Response(JSON.stringify(category), {
      status: 200,
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
