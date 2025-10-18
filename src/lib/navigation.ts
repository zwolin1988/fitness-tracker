/**
 * Navigation utilities for auth state and user profile management
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export interface UserProfile {
  name: string | null;
  role: "user" | "admin";
}

export interface NavigationState {
  user: { id: string; email?: string } | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

/**
 * Get current user from Supabase session
 */
export async function getUserSession(supabase: SupabaseClient) {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return user;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Error getting user session:", error);
    }
    return null;
  }
}

/**
 * Get user profile with role information
 */
export async function getUserProfile(supabase: SupabaseClient, userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("user_id", userId)
      .single();

    if (error) {
      throw error;
    }

    return profile as UserProfile | null;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Error getting user profile:", error);
    }
    return null;
  }
}

/**
 * Check if user has admin role
 */
export function isUserAdmin(profile: UserProfile | null): boolean {
  return profile?.role === "admin";
}

/**
 * Get complete navigation state for the current user
 * Combines user session and profile data
 */
export async function getNavigationState(supabase: SupabaseClient | null): Promise<NavigationState> {
  // Default state for no supabase client
  if (!supabase) {
    return {
      user: null,
      profile: null,
      isAdmin: false,
      isLoggedIn: false,
    };
  }

  const user = await getUserSession(supabase);

  // No user logged in
  if (!user) {
    return {
      user: null,
      profile: null,
      isAdmin: false,
      isLoggedIn: false,
    };
  }

  const profile = await getUserProfile(supabase, user.id);
  const isAdmin = isUserAdmin(profile);

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
    isAdmin,
    isLoggedIn: true,
  };
}

/**
 * Generate mobile menu ID based on user state
 */
export function getMobileMenuId(isLoggedIn: boolean): string {
  return isLoggedIn ? "mobile-menu" : "";
}

/**
 * Generate navigation class based on admin status
 */
export function getNavigationClass(isAdmin: boolean): string {
  const baseClass = "border-b border-border sticky top-0 z-50";
  const bgClass = isAdmin ? "bg-gradient-to-r from-primary/10 to-primary/5" : "bg-background";

  return `${baseClass} ${bgClass}`;
}
