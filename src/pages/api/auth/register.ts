// src/pages/api/auth/register.ts
// API endpoint for user registration with Supabase Auth

import type { APIRoute } from "astro";

import { RegisterSchema } from "@/lib/schemas/auth";
import { AuthError, registerUser } from "@/lib/services/auth";

// Disable prerendering for this API endpoint
export const prerender = false;

/**
 * POST /api/auth/register
 * Registers new user with email, password and profile data
 * Body: { email: string, password: string, name: string, weight: number, height: number }
 * Returns: { user, requiresEmailVerification } on success
 */
export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {
    // Get Supabase client from context
    const supabase = locals.supabase;
    if (!supabase) {
      return new Response(JSON.stringify({ error: "Database client not available" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
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

    const validationResult = RegisterSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Attempt to register user
    const { user, session, requiresEmailVerification } = await registerUser(supabase, validationResult.data);

    // If session exists (auto-login after registration), set cookies
    if (session) {
      cookies.set("sb-access-token", session.access_token, {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      cookies.set("sb-refresh-token", session.refresh_token, {
        path: "/",
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name,
        },
        requiresEmailVerification,
        message: requiresEmailVerification
          ? "Konto zostało utworzone. Sprawdź swoją skrzynkę pocztową i potwierdź adres email."
          : "Konto zostało utworzone pomyślnie.",
      }),
      {
        status: 201,
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

    // Handle unexpected errors
    console.error("Unexpected error in POST /api/auth/register:", error);
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
