// src/lib/schemas/profile.ts
// Zod validation schemas for Profile API endpoints

import { z } from "zod";

/**
 * Schema for updating user profile (PUT /profile)
 * - name: required, non-empty string, max 100 chars
 * - weight: required number > 0
 * - height: required number > 0
 */
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required and cannot be empty")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  weight: z
    .number()
    .positive("Weight must be greater than 0")
    .max(500, "Weight must not exceed 500 kg"),
  height: z
    .number()
    .positive("Height must be greater than 0")
    .max(300, "Height must not exceed 300 cm"),
});

export type UpdateProfileBody = z.infer<typeof UpdateProfileSchema>;
