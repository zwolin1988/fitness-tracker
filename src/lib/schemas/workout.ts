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
 */
export const CreateWorkoutSchema = z.object({
  exerciseTemplateId: z
    .string()
    .uuid({ message: "Exercise template ID must be a valid UUID" })
    .describe("ID of the first exercise to include in the workout"),
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
export const CreateWorkoutSetSchema = z
  .object({
    exerciseTemplateId: z
      .string()
      .uuid({ message: "Exercise template ID must be a valid UUID" })
      .describe("ID of the exercise template for this set"),
    repetitions: z
      .number()
      .int()
      .positive({ message: "Repetitions must be a positive integer" })
      .max(999, { message: "Repetitions cannot exceed 999" })
      .optional()
      .nullable()
      .describe("Number of repetitions performed"),
    weight: z
      .number()
      .positive({ message: "Weight must be a positive number" })
      .max(9999.99, { message: "Weight cannot exceed 9999.99 kg" })
      .optional()
      .nullable()
      .describe("Weight used in kg"),
    distance: z
      .number()
      .positive({ message: "Distance must be a positive number" })
      .max(999999.99, { message: "Distance cannot exceed 999999.99 meters" })
      .optional()
      .nullable()
      .describe("Distance covered in meters"),
    duration: z
      .number()
      .int()
      .positive({ message: "Duration must be a positive integer" })
      .max(86400, { message: "Duration cannot exceed 24 hours (86400 seconds)" })
      .optional()
      .nullable()
      .describe("Duration in seconds"),
  })
  .refine(
    (data) => {
      // At least one metric must be provided
      return (
        data.repetitions !== undefined &&
        data.repetitions !== null ||
        data.weight !== undefined &&
        data.weight !== null ||
        data.distance !== undefined &&
        data.distance !== null ||
        data.duration !== undefined &&
        data.duration !== null
      );
    },
    {
      message: "At least one metric (repetitions, weight, distance, or duration) must be provided",
    }
  );

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
      .nullable()
      .describe("Number of repetitions performed"),
    weight: z
      .number()
      .positive({ message: "Weight must be a positive number" })
      .max(9999.99, { message: "Weight cannot exceed 9999.99 kg" })
      .optional()
      .nullable()
      .describe("Weight used in kg"),
    distance: z
      .number()
      .positive({ message: "Distance must be a positive number" })
      .max(999999.99, { message: "Distance cannot exceed 999999.99 meters" })
      .optional()
      .nullable()
      .describe("Distance covered in meters"),
    duration: z
      .number()
      .int()
      .positive({ message: "Duration must be a positive integer" })
      .max(86400, { message: "Duration cannot exceed 24 hours (86400 seconds)" })
      .optional()
      .nullable()
      .describe("Duration in seconds"),
  })
  .refine(
    (data) => {
      // At least one field must be provided for PATCH
      return (
        data.repetitions !== undefined ||
        data.weight !== undefined ||
        data.distance !== undefined ||
        data.duration !== undefined
      );
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
