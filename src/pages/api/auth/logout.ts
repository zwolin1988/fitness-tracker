// src/pages/api/auth/logout.ts
// API endpoint for user logout with Supabase Auth

import type { APIRoute } from "astro";

import { AuthError, logoutUser } from "@/lib/services/auth";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * POST /api/auth/logout
 * Logs out the current user and invalidates session
 * Requires: Authorization header with Bearer token
 * Returns: { success: true } on success
 */
export const POST: APIRoute = async ({ locals, cookies }) => {
  try {
    // Get Supabase client from context
    const supabase = locals.supabase;
    if (!supabase) {
      return new Response(JSON.stringify({ error: "Database client not available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Logout user
    await logoutUser(supabase);

    // Clear session cookies
    cookies.delete("sb-access-token", {
      path: "/",
    });

    cookies.delete("sb-refresh-token", {
      path: "/",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Wylogowano pomyślnie",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Handle AuthError
    if (error instanceof AuthError) {
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
