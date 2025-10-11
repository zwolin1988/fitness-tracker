// src/pages/api/admin/categories/[id].ts
// Admin API endpoint for updating and deleting categories (PUT, DELETE)

import type { APIRoute } from "astro";

import { verifyAdminRole } from "@/lib/auth/admin";
import { CategoryIdParamSchema, UpdateCategorySchema } from "@/lib/schemas/category";
import { CategoryError, deleteCategory, updateCategory } from "@/lib/services/category";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * PUT /api/admin/categories/:id
 * Updates an existing category (admin only)
 * Requires: Authorization header with Bearer token
 * Path params: id (UUID)
 * Body: { name?: string, description?: string, image_url?: string }
 */
export const PUT: APIRoute = async ({ request, params, locals }) => {
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

    // Validate path parameter
    const paramValidation = CategoryIdParamSchema.safeParse(params);
    if (!paramValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid category ID",
          details: paramValidation.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id } = paramValidation.data;

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
    const validationResult = UpdateCategorySchema.safeParse(body);

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

    // Update category via service
    const category = await updateCategory(supabase, id, validationResult.data);

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

/**
 * DELETE /api/admin/categories/:id
 * Deletes a category (admin only)
 * Requires: Authorization header with Bearer token
 * Path params: id (UUID)
 * Returns: 204 No Content on success
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

    // Validate path parameter
    const paramValidation = CategoryIdParamSchema.safeParse(params);
    if (!paramValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid category ID",
          details: paramValidation.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { id } = paramValidation.data;

    // Delete category via service
    await deleteCategory(supabase, id);

    // Return 204 No Content on successful deletion
    return new Response(null, {
      status: 204,
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
