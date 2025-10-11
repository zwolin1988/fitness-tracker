// src/lib/services/category.ts
// Service layer for Category operations with Supabase

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/db/database.types";
import type { CategoryDTO, CreateCategoryCommand, UpdateCategoryCommand } from "@/types";

// Type alias for our Supabase client
type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Response type for paginated list of categories
 */
export interface ListCategoriesResponse {
  items: CategoryDTO[];
  page: number;
  totalPages: number;
}

/**
 * Response type for category detail with exercises count
 */
export interface CategoryDetailResponse extends CategoryDTO {
  exercisesCount: number;
}

/**
 * Custom error class for category-related errors
 */
export class CategoryError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = "CategoryError";
  }
}

/**
 * Retrieves a paginated list of categories
 * @param supabase - Supabase client instance
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Paginated list of categories
 */
export async function listCategories(
  supabase: TypedSupabaseClient,
  page: number,
  limit: number
): Promise<ListCategoriesResponse> {
  try {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Fetch categories with pagination
    const { data: categories, error: fetchError } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (fetchError) {
      console.error("Error fetching categories:", fetchError);
      throw new CategoryError("Failed to fetch categories", 500, "FETCH_ERROR");
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase.from("categories").select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error counting categories:", countError);
      throw new CategoryError("Failed to count categories", 500, "COUNT_ERROR");
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return {
      items: categories || [],
      page,
      totalPages,
    };
  } catch (error) {
    if (error instanceof CategoryError) throw error;
    console.error("Unexpected error in listCategories:", error);
    throw new CategoryError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Retrieves a single category by ID with exercises count
 * @param supabase - Supabase client instance
 * @param id - Category UUID
 * @returns Category detail with exercises count
 * @throws CategoryError if category not found
 */
export async function getCategoryById(supabase: TypedSupabaseClient, id: string): Promise<CategoryDetailResponse> {
  try {
    // Fetch category
    const { data: category, error: fetchError } = await supabase.from("categories").select("*").eq("id", id).single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        throw new CategoryError("Category not found", 404, "NOT_FOUND");
      }
      console.error("Error fetching category:", fetchError);
      throw new CategoryError("Failed to fetch category", 500, "FETCH_ERROR");
    }

    // Count exercises in this category
    const { count, error: countError } = await supabase
      .from("exercises")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (countError) {
      console.error("Error counting exercises:", countError);
      throw new CategoryError("Failed to count exercises", 500, "COUNT_ERROR");
    }

    return {
      ...category,
      exercisesCount: count || 0,
    };
  } catch (error) {
    if (error instanceof CategoryError) throw error;
    console.error("Unexpected error in getCategoryById:", error);
    throw new CategoryError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Creates a new category (admin only)
 * @param supabase - Supabase client instance
 * @param command - Category creation data
 * @returns Newly created category
 * @throws CategoryError if name already exists or validation fails
 */
export async function createCategory(
  supabase: TypedSupabaseClient,
  command: CreateCategoryCommand
): Promise<CategoryDTO> {
  try {
    // Check if category with this name already exists
    const { data: existing, error: checkError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", command.name)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing category:", checkError);
      throw new CategoryError("Failed to check existing category", 500, "CHECK_ERROR");
    }

    if (existing) {
      throw new CategoryError("Category with this name already exists", 409, "DUPLICATE_NAME");
    }

    // Insert new category
    const { data: category, error: insertError } = await supabase
      .from("categories")
      .insert({
        name: command.name,
        description: command.description || null,
        image_url: command.image_url || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating category:", insertError);
      // Check for unique constraint violation
      if (insertError.code === "23505") {
        throw new CategoryError("Category with this name already exists", 409, "DUPLICATE_NAME");
      }
      throw new CategoryError("Failed to create category", 500, "INSERT_ERROR");
    }

    return category;
  } catch (error) {
    if (error instanceof CategoryError) throw error;
    console.error("Unexpected error in createCategory:", error);
    throw new CategoryError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Updates an existing category (admin only)
 * @param supabase - Supabase client instance
 * @param id - Category UUID
 * @param command - Category update data
 * @returns Updated category
 * @throws CategoryError if category not found or name already exists
 */
export async function updateCategory(
  supabase: TypedSupabaseClient,
  id: string,
  command: UpdateCategoryCommand
): Promise<CategoryDTO> {
  try {
    // Check if category exists
    const { data: existing, error: checkError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking category existence:", checkError);
      throw new CategoryError("Failed to check category existence", 500, "CHECK_ERROR");
    }

    if (!existing) {
      throw new CategoryError("Category not found", 404, "NOT_FOUND");
    }

    // If updating name, check for duplicates
    if (command.name) {
      const { data: duplicate, error: dupError } = await supabase
        .from("categories")
        .select("id")
        .eq("name", command.name)
        .neq("id", id)
        .maybeSingle();

      if (dupError) {
        console.error("Error checking duplicate name:", dupError);
        throw new CategoryError("Failed to check duplicate name", 500, "CHECK_ERROR");
      }

      if (duplicate) {
        throw new CategoryError("Category with this name already exists", 409, "DUPLICATE_NAME");
      }
    }

    // Build update object with only provided fields
    const updateData: Partial<Database["public"]["Tables"]["categories"]["Update"]> = {};
    if (command.name !== undefined) updateData.name = command.name;
    if (command.description !== undefined) updateData.description = command.description || null;
    if (command.image_url !== undefined) updateData.image_url = command.image_url || null;

    // Update category
    const { data: category, error: updateError } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating category:", updateError);
      // Check for unique constraint violation
      if (updateError.code === "23505") {
        throw new CategoryError("Category with this name already exists", 409, "DUPLICATE_NAME");
      }
      throw new CategoryError("Failed to update category", 500, "UPDATE_ERROR");
    }

    return category;
  } catch (error) {
    if (error instanceof CategoryError) throw error;
    console.error("Unexpected error in updateCategory:", error);
    throw new CategoryError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}

/**
 * Deletes a category (admin only)
 * @param supabase - Supabase client instance
 * @param id - Category UUID
 * @throws CategoryError if category not found or has associated exercises
 */
export async function deleteCategory(supabase: TypedSupabaseClient, id: string): Promise<void> {
  try {
    // Check if category exists
    const { data: existing, error: checkError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking category existence:", checkError);
      throw new CategoryError("Failed to check category existence", 500, "CHECK_ERROR");
    }

    if (!existing) {
      throw new CategoryError("Category not found", 404, "NOT_FOUND");
    }

    // Check if category has associated exercises
    const { count, error: countError } = await supabase
      .from("exercises")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id);

    if (countError) {
      console.error("Error checking category exercises:", countError);
      throw new CategoryError("Failed to check category exercises", 500, "CHECK_ERROR");
    }

    if (count && count > 0) {
      throw new CategoryError("Cannot delete category with associated exercises", 409, "HAS_EXERCISES");
    }

    // Delete category
    const { error: deleteError } = await supabase.from("categories").delete().eq("id", id);

    if (deleteError) {
      console.error("Error deleting category:", deleteError);
      throw new CategoryError("Failed to delete category", 500, "DELETE_ERROR");
    }
  } catch (error) {
    if (error instanceof CategoryError) throw error;
    console.error("Unexpected error in deleteCategory:", error);
    throw new CategoryError("An unexpected error occurred", 500, "UNEXPECTED_ERROR");
  }
}
