// src/lib/schemas/training-plan.ts
// Zod validation schemas for Training Plan API endpoints

import { z } from "zod";

/**
 * Schema for UUID path parameter used in GET/PUT/DELETE /api/plans/{id}
 */
export const TrainingPlanIdParamSchema = z.object({
  id: z.string().uuid("Invalid training plan ID format"),
});

export type TrainingPlanIdParam = z.infer<typeof TrainingPlanIdParamSchema>;

/**
 * Schema for creating a new training plan (POST /api/plans)
 * - name: required, min 1 char, max 100 chars
 * - description: optional, max 1000 chars
 * - exerciseIds: required, array of UUIDs (exercises to include in plan)
 */
export const CreateTrainingPlanSchema = z.object({
  name: z
    .string()
    .min(1, "Training plan name is required")
    .max(100, "Training plan name must not exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .trim()
    .optional()
    .nullable()
    .transform((val) => val || null),
  exerciseIds: z
    .array(z.string().uuid("Each exercise ID must be a valid UUID"))
    .min(1, "At least one exercise is required")
    .max(50, "Maximum 50 exercises per plan"),
});

export type CreateTrainingPlanBody = z.infer<typeof CreateTrainingPlanSchema>;

/**
 * Schema for updating an existing training plan (PUT /api/plans/{id})
 * All fields are optional, but at least one must be provided
 */
export const UpdateTrainingPlanSchema = z
  .object({
    name: z
      .string()
      .min(1, "Training plan name must not be empty")
      .max(100, "Training plan name must not exceed 100 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(1000, "Description must not exceed 1000 characters")
      .trim()
      .optional()
      .nullable()
      .transform((val) => val || null),
    exerciseIds: z
      .array(z.string().uuid("Each exercise ID must be a valid UUID"))
      .min(1, "At least one exercise is required")
      .max(50, "Maximum 50 exercises per plan")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateTrainingPlanBody = z.infer<typeof UpdateTrainingPlanSchema>;

/**
 * Schema for path parameters in plan set endpoints
 * Used in POST/PUT/DELETE /api/plans/{planId}/sets/...
 */
export const PlanSetPlanIdParamSchema = z.object({
  planId: z.string().uuid("Invalid plan ID format"),
});

export type PlanSetPlanIdParam = z.infer<typeof PlanSetPlanIdParamSchema>;

/**
 * Schema for path parameters with both planId and setId
 * Used in PUT/DELETE /api/plans/{planId}/sets/{setId}
 */
export const PlanSetIdParamsSchema = z.object({
  planId: z.string().uuid("Invalid plan ID format"),
  setId: z.string().uuid("Invalid set ID format"),
});

export type PlanSetIdParams = z.infer<typeof PlanSetIdParamsSchema>;

/**
 * Schema for creating a new plan exercise set (POST /api/plans/{planId}/sets)
 * - exerciseId: required, UUID
 * - repetitions: required, > 0, max 999
 * - weight: required, >= 0, max 999.99
 * - set_order: optional, >= 0 (auto-generated if not provided)
 */
export const CreatePlanSetSchema = z.object({
  exerciseId: z.string().uuid("Exercise ID must be a valid UUID"),
  repetitions: z
    .number()
    .int("Repetitions must be an integer")
    .positive("Repetitions must be greater than 0")
    .max(999, "Repetitions must not exceed 999"),
  weight: z
    .number()
    .nonnegative("Weight must be 0 or greater")
    .max(999.99, "Weight must not exceed 999.99"),
  set_order: z
    .number()
    .int("Set order must be an integer")
    .nonnegative("Set order must be 0 or greater")
    .optional(),
});

export type CreatePlanSetBody = z.infer<typeof CreatePlanSetSchema>;

/**
 * Schema for updating an existing plan exercise set (PUT /api/plans/{planId}/sets/{setId})
 * All fields are optional, but at least one must be provided
 */
export const UpdatePlanSetSchema = z
  .object({
    repetitions: z
      .number()
      .int("Repetitions must be an integer")
      .positive("Repetitions must be greater than 0")
      .max(999, "Repetitions must not exceed 999")
      .optional(),
    weight: z
      .number()
      .nonnegative("Weight must be 0 or greater")
      .max(999.99, "Weight must not exceed 999.99")
      .optional(),
    set_order: z
      .number()
      .int("Set order must be an integer")
      .nonnegative("Set order must be 0 or greater")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdatePlanSetBody = z.infer<typeof UpdatePlanSetSchema>;
