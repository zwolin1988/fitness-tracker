// src/lib/schemas/category.ts
// Zod validation schemas for Category API endpoints

import { z } from "zod";

/**
 * Schema for pagination query parameters used in GET /categories
 * - page: must be >= 1 (default: 1)
 * - limit: must be between 1 and 100 (default: 20)
 */
export const ListCategoriesQuerySchema = z.object({
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

export type ListCategoriesQuery = z.infer<typeof ListCategoriesQuerySchema>;

/**
 * Schema for UUID path parameter used in GET/PUT/DELETE /categories/:id
 */
export const CategoryIdParamSchema = z.object({
  id: z.string().uuid("Invalid category ID format"),
});

export type CategoryIdParam = z.infer<typeof CategoryIdParamSchema>;

/**
 * Schema for creating a new category (POST /admin/categories)
 * - name: required, min 1 char, max 100 chars
 * - description: optional, max 500 chars
 * - image_url: optional, must be valid URL
 */
export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Category name must not exceed 100 characters").trim(),
  description: z.string().max(500, "Description must not exceed 500 characters").trim().optional().nullable(),
  image_url: z
    .string()
    .url("Image URL must be a valid URL")
    .optional()
    .nullable()
    .transform((val) => val || null),
});

export type CreateCategoryBody = z.infer<typeof CreateCategorySchema>;

/**
 * Schema for updating an existing category (PUT /admin/categories/:id)
 * All fields are optional, but at least one must be provided
 */
export const UpdateCategorySchema = z
  .object({
    name: z
      .string()
      .min(1, "Category name must not be empty")
      .max(100, "Category name must not exceed 100 characters")
      .trim()
      .optional(),
    description: z.string().max(500, "Description must not exceed 500 characters").trim().optional().nullable(),
    image_url: z
      .string()
      .url("Image URL must be a valid URL")
      .optional()
      .nullable()
      .transform((val) => val || null),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateCategoryBody = z.infer<typeof UpdateCategorySchema>;
