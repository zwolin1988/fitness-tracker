// src/lib/schemas/workout.ts
// Zod validation schemas for Workouts and Workout Sets API

import { z } from "zod";

// ===========================
// Workout Schemas
// ===========================

/**
 * Schema for creating a new workout session
 * POST /api/workouts
 * Note: start_time is auto-generated on server
 * Note: planId is required - user must select a training plan
 */
export const CreateWorkoutSchema = z.object({
  planId: z
    .string()
    .uuid({ message: "Training plan ID must be a valid UUID" })
    .describe("ID of the training plan to base this workout on (required)"),
});

/**
 * Schema for workout ID path parameter
 * Used in: GET /api/workouts/{id}, POST /api/workouts/{id}/end
 */
export const WorkoutIdParamSchema = z.object({
  id: z.string().uuid({ message: "Workout ID must be a valid UUID" }),
});

/**
 * Schema for ending a workout session
 * POST /api/workouts/{id}/end
 * Note: end_time is auto-generated on server
 */
export const EndWorkoutSchema = z.object({
  // Empty object - end_time is set automatically
  // Could be extended with optional summary fields in the future
});

/**
 * Schema for date filtering query parameters
 * GET /api/workouts?start_date=2025-01-01&end_date=2025-01-31
 */
export const WorkoutListQuerySchema = z.object({
  start_date: z
    .string()
    .datetime({ message: "Start date must be in ISO 8601 format" })
    .optional()
    .describe("Filter workouts starting from this date (inclusive)"),
  end_date: z
    .string()
    .datetime({ message: "End date must be in ISO 8601 format" })
    .optional()
    .describe("Filter workouts up to this date (inclusive)"),
});

// ===========================
// Workout Set Schemas
// ===========================

/**
 * Schema for creating a new workout set
 * POST /api/workouts/{id}/sets
 */
export const CreateWorkoutSetSchema = z.object({
  exerciseId: z
    .string()
    .uuid({ message: "Exercise ID must be a valid UUID" })
    .describe("ID of the exercise for this set"),
  repetitions: z
    .number()
    .int()
    .positive({ message: "Repetitions must be a positive integer" })
    .max(999, { message: "Repetitions cannot exceed 999" })
    .describe("Number of repetitions performed"),
  weight: z
    .number()
    .nonnegative({ message: "Weight must be 0 or greater" })
    .max(999.99, { message: "Weight cannot exceed 999.99 kg" })
    .describe("Weight used in kg"),
});

/**
 * Schema for workout set path parameters
 * Used in: PATCH /api/workouts/{workoutId}/sets/{setId}
 */
export const WorkoutSetParamsSchema = z.object({
  workoutId: z.string().uuid({ message: "Workout ID must be a valid UUID" }),
  setId: z.string().uuid({ message: "Set ID must be a valid UUID" }),
});

/**
 * Schema for updating a workout set (PATCH - partial update)
 * PATCH /api/workouts/{workoutId}/sets/{setId}
 */
export const UpdateWorkoutSetSchema = z
  .object({
    repetitions: z
      .number()
      .int()
      .positive({ message: "Repetitions must be a positive integer" })
      .max(999, { message: "Repetitions cannot exceed 999" })
      .optional()
      .describe("Number of repetitions performed"),
    weight: z
      .number()
      .nonnegative({ message: "Weight must be 0 or greater" })
      .max(999.99, { message: "Weight cannot exceed 999.99 kg" })
      .optional()
      .describe("Weight used in kg"),
    completed: z.boolean().optional().describe("Whether this set has been completed by the user"),
  })
  .refine(
    (data) => {
      // At least one field must be provided for PATCH
      return data.repetitions !== undefined || data.weight !== undefined || data.completed !== undefined;
    },
    {
      message: "At least one field must be provided for update",
    }
  );

// ===========================
// Type Exports (inferred from schemas)
// ===========================

export type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;
export type WorkoutIdParam = z.infer<typeof WorkoutIdParamSchema>;
export type EndWorkoutInput = z.infer<typeof EndWorkoutSchema>;
export type WorkoutListQuery = z.infer<typeof WorkoutListQuerySchema>;
export type CreateWorkoutSetInput = z.infer<typeof CreateWorkoutSetSchema>;
export type WorkoutSetParams = z.infer<typeof WorkoutSetParamsSchema>;
export type UpdateWorkoutSetInput = z.infer<typeof UpdateWorkoutSetSchema>;
