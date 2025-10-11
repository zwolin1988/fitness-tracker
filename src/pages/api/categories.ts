// src/pages/api/categories.ts
// Public API endpoint for listing categories with pagination

import type { APIRoute } from "astro";

import { ListCategoriesQuerySchema } from "@/lib/schemas/category";
import { CategoryError, listCategories } from "@/lib/services/category";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * GET /api/categories
 * Returns a paginated list of categories
 * Query params: page (default: 1), limit (default: 20, max: 100)
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
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit"),
    };

    const validationResult = ListCategoriesQuerySchema.safeParse(queryParams);

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

    const { page, limit } = validationResult.data;

    // Fetch categories from service
    const result = await listCategories(supabase, page, limit);

    return new Response(JSON.stringify(result), {
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
