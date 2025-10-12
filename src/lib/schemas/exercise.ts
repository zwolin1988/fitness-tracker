// src/lib/schemas/exercise.ts
// Zod validation schemas for Exercise API endpoints

import { z } from "zod";

/**
 * Schema for pagination and filtering query parameters used in GET /api/exercises
 * - categoryId: optional UUID for filtering by category
 * - difficulty: optional string for filtering by difficulty level
 * - page: must be >= 1 (default: 1)
 * - limit: must be between 1 and 100 (default: 20)
 */
export const ListExercisesQuerySchema = z.object({
  categoryId: z
    .string()
    .uuid("Category ID must be a valid UUID")
    .optional(),
  difficulty: z
    .string()
    .min(1, "Difficulty cannot be empty")
    .optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1, "Page must be at least 1")),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100, "Limit must not exceed 100")),
});

export type ListExercisesQuery = z.infer<typeof ListExercisesQuerySchema>;

/**
 * Schema for UUID path parameter used in GET/PUT/DELETE /api/exercises/{id}
 */
export const ExerciseIdParamSchema = z.object({
  id: z.string().uuid("Invalid exercise ID format"),
});

export type ExerciseIdParam = z.infer<typeof ExerciseIdParamSchema>;

/**
 * Schema for creating a new exercise (POST /admin/exercises)
 * - name: required, min 1 char, max 200 chars
 * - description: optional, max 1000 chars
 * - icon_svg: optional, max 10000 chars (SVG markup)
 * - difficulty: required, non-empty string
 * - category_id: required, must be valid UUID
 */
export const CreateExerciseSchema = z.object({
  name: z
    .string()
    .min(1, "Exercise name is required")
    .max(200, "Exercise name must not exceed 200 characters")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .trim()
    .optional()
    .nullable()
    .transform((val) => val || null),
  icon_svg: z
    .string()
    .max(10000, "Icon SVG must not exceed 10000 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  difficulty: z
    .string()
    .min(1, "Difficulty is required")
    .max(50, "Difficulty must not exceed 50 characters")
    .trim(),
  category_id: z
    .string()
    .uuid("Category ID must be a valid UUID"),
});

export type CreateExerciseBody = z.infer<typeof CreateExerciseSchema>;

/**
 * Schema for updating an existing exercise (PUT /admin/exercises/{id})
 * All fields are optional, but at least one must be provided
 */
export const UpdateExerciseSchema = z
  .object({
    name: z
      .string()
      .min(1, "Exercise name must not be empty")
      .max(200, "Exercise name must not exceed 200 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(1000, "Description must not exceed 1000 characters")
      .trim()
      .optional()
      .nullable()
      .transform((val) => val || null),
    icon_svg: z
      .string()
      .max(10000, "Icon SVG must not exceed 10000 characters")
      .optional()
      .nullable()
      .transform((val) => val || null),
    difficulty: z
      .string()
      .min(1, "Difficulty must not be empty")
      .max(50, "Difficulty must not exceed 50 characters")
      .trim()
      .optional(),
    category_id: z
      .string()
      .uuid("Category ID must be a valid UUID")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateExerciseBody = z.infer<typeof UpdateExerciseSchema>;
