// src/lib/services/profile.ts
// Service layer for Profile operations with Supabase

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/db/database.types";
import type { ProfileDTO, UpdateProfileCommand } from "@/types";

// Type alias for our Supabase client
type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Custom error class for profile-related errors
 */
export class ProfileError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = "ProfileError";
  }
}

/**
 * Retrieves the profile of the authenticated user
 * @param supabase - Supabase client instance with user session
 * @param userId - User ID from JWT token
 * @returns User's profile data
 * @throws ProfileError if profile not found or database error occurs
 */
export async function getProfile(supabase: TypedSupabaseClient, userId: string): Promise<ProfileDTO> {
  try {
    // Fetch profile by user_id
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("user_id, name, weight, height, updated_at")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      // PGRST116 is Supabase error code for "not found"
      if (fetchError.code === "PGRST116") {
        throw new ProfileError("Profile not found", 404, "NOT_FOUND");
      }
      console.error("Error fetching profile:", fetchError);
      throw new ProfileError("Failed to fetch profile", 500, "FETCH_ERROR");
    }

    if (!profile) {
      throw new ProfileError("Profile not found", 404, "NOT_FOUND");
    }

    // Map database row to ProfileDTO (excluding 'role' field)
    return {
      user_id: profile.user_id,
      name: profile.name,
      weight: profile.weight,
      height: profile.height,
      updated_at: profile.updated_at,
    };
  } catch (error) {
    if (error instanceof ProfileError) throw error;
    console.error("Unexpected error in getProfile:", error);
    throw new ProfileError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Updates the profile of the authenticated user
 * @param supabase - Supabase client instance with user session
 * @param userId - User ID from JWT token
 * @param command - Profile update data (name, weight, height)
 * @returns Updated profile data
 * @throws ProfileError if profile not found or database error occurs
 */
export async function updateProfile(
  supabase: TypedSupabaseClient,
  userId: string,
  command: UpdateProfileCommand
): Promise<ProfileDTO> {
  try {
    // Check if profile exists
    const { data: existing, error: checkError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking profile existence:", checkError);
      throw new ProfileError("Failed to check profile existence", 500, "CHECK_ERROR");
    }

    if (!existing) {
      throw new ProfileError("Profile not found", 404, "NOT_FOUND");
    }

    // Update profile with new data
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        name: command.name,
        weight: command.weight,
        height: command.height,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select("user_id, name, weight, height, updated_at")
      .single();

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw new ProfileError("Failed to update profile", 500, "UPDATE_ERROR");
    }

    if (!updatedProfile) {
      throw new ProfileError("Failed to retrieve updated profile", 500, "UPDATE_ERROR");
    }

    // Map database row to ProfileDTO (excluding 'role' field)
    return {
      user_id: updatedProfile.user_id,
      name: updatedProfile.name,
      weight: updatedProfile.weight,
      height: updatedProfile.height,
      updated_at: updatedProfile.updated_at,
    };
  } catch (error) {
    if (error instanceof ProfileError) throw error;
    console.error("Unexpected error in updateProfile:", error);
    throw new ProfileError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}
