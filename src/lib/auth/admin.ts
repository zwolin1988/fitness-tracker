// src/lib/auth/admin.ts
// Helper functions for admin authorization

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/db/database.types";

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Verifies if the current user has admin role
 * @param supabase - Supabase client instance
 * @returns Object with isAdmin flag and optional error
 */
export async function verifyAdminRole(
  supabase: TypedSupabaseClient
): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
  try {
    // Get current user from JWT
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { isAdmin: false, error: "Unauthorized - invalid or missing token" };
    }

    // Fetch user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return { isAdmin: false, userId: user.id, error: "User profile not found" };
    }

    // Check if user has admin role
    if (profile.role !== "admin") {
      return { isAdmin: false, userId: user.id, error: "Forbidden - admin role required" };
    }

    return { isAdmin: true, userId: user.id };
  } catch {
    return { isAdmin: false, error: "Authorization check failed" };
  }
}
