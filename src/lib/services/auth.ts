// src/lib/services/auth.ts
// Authentication service for managing user sessions with Supabase Auth

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/db/database.types";
import type { LoginCredentials, RegisterCredentials } from "@/lib/schemas/auth";

/**
 * Custom error class for authentication operations
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 500
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Login user with email and password
 * Returns session tokens on success
 */
export async function loginUser(supabase: SupabaseClient<Database>, credentials: LoginCredentials) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes("Invalid login credentials")) {
        throw new AuthError("Nieprawidłowy email lub hasło", "INVALID_CREDENTIALS", 401);
      }
      if (error.message.includes("Email not confirmed")) {
        throw new AuthError(
          "Email nie został potwierdzony. Sprawdź swoją skrzynkę pocztową.",
          "EMAIL_NOT_CONFIRMED",
          403
        );
      }
      throw new AuthError(error.message, "AUTH_ERROR", 400);
    }

    if (!data.user || !data.session) {
      throw new AuthError("Nie udało się utworzyć sesji", "SESSION_CREATION_FAILED", 500);
    }

    return {
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Wystąpił nieoczekiwany błąd podczas logowania", "UNEXPECTED_ERROR", 500);
  }
}

/**
 * Register new user with email, password and profile data
 * Creates user in auth.users and profile in profiles table
 */
export async function registerUser(supabase: SupabaseClient<Database>, credentials: RegisterCredentials) {
  try {
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
        },
      },
    });

    if (authError) {
      // Handle specific Supabase auth errors
      if (authError.message.includes("already registered")) {
        throw new AuthError("Użytkownik z tym adresem email już istnieje", "EMAIL_ALREADY_EXISTS", 400);
      }
      if (authError.message.includes("Password should be")) {
        throw new AuthError("Hasło nie spełnia wymagań bezpieczeństwa", "WEAK_PASSWORD", 400);
      }
      throw new AuthError(authError.message, "AUTH_ERROR", 400);
    }

    if (!authData.user) {
      throw new AuthError("Nie udało się utworzyć konta użytkownika", "USER_CREATION_FAILED", 500);
    }

    // Step 2: Create profile record
    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: authData.user.id,
      name: credentials.name,
      weight: credentials.weight,
      height: credentials.height,
      role: "user",
    });

    if (profileError) {
      // If profile creation fails, we should ideally rollback the auth user
      // However, Supabase doesn't support transactions across auth and database
      // This is a known limitation - the user exists but profile doesn't
      console.error("Profile creation failed for user:", authData.user.id, profileError);
      throw new AuthError(
        "Konto zostało utworzone, ale wystąpił błąd przy tworzeniu profilu. Skontaktuj się z administratorem.",
        "PROFILE_CREATION_FAILED",
        500
      );
    }

    return {
      user: authData.user,
      session: authData.session,
      requiresEmailVerification: !authData.session, // If no session, email verification required
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Wystąpił nieoczekiwany błąd podczas rejestracji", "UNEXPECTED_ERROR", 500);
  }
}

/**
 * Logout current user
 * Invalidates the session token
 */
export async function logoutUser(supabase: SupabaseClient<Database>) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new AuthError("Nie udało się wylogować użytkownika", "LOGOUT_FAILED", 500);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Wystąpił nieoczekiwany błąd podczas wylogowania", "UNEXPECTED_ERROR", 500);
  }
}

/**
 * Send password reset email
 * Generates a time-limited reset link valid for 24h
 */
export async function sendPasswordResetEmail(supabase: SupabaseClient<Database>, email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password`,
    });

    if (error) {
      throw new AuthError("Nie udało się wysłać emaila resetującego hasło", "PASSWORD_RESET_FAILED", 400);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Wystąpił nieoczekiwany błąd podczas resetowania hasła", "UNEXPECTED_ERROR", 500);
  }
}

/**
 * Update user password
 * User must be authenticated
 */
export async function updateUserPassword(supabase: SupabaseClient<Database>, newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      if (error.message.includes("Password should be")) {
        throw new AuthError("Hasło nie spełnia wymagań bezpieczeństwa", "WEAK_PASSWORD", 400);
      }
      throw new AuthError("Nie udało się zaktualizować hasła", "PASSWORD_UPDATE_FAILED", 400);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Wystąpił nieoczekiwany błąd podczas aktualizacji hasła", "UNEXPECTED_ERROR", 500);
  }
}

/**
 * Get current user session
 * Returns user and session if authenticated, null otherwise
 */
export async function getCurrentUser(supabase: SupabaseClient<Database>) {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}
