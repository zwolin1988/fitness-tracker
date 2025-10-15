// useCategories.ts - Custom hook for fetching and managing categories data

import { useState, useEffect, useCallback } from "react";
import type { CategoryDTO } from "@/types";

// State interface for categories grid
interface CategoriesGridState {
  categories: CategoryDTO[];
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
}

// API Response type
interface ListCategoriesResponse {
  items: CategoryDTO[];
  page: number;
  totalPages: number;
}

// Hook parameters
interface UseCategoriesParams {
  initialPage?: number;
  limit?: number;
}

// Hook return type
export interface UseCategoriesReturn {
  categories: CategoryDTO[];
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export function useCategories({ initialPage = 1, limit = 20 }: UseCategoriesParams = {}): UseCategoriesReturn {
  const [state, setState] = useState<CategoriesGridState>({
    categories: [],
    page: initialPage,
    totalPages: 0,
    isLoading: true,
    error: null,
  });

  // Fetch function
  const fetchCategories = useCallback(
    async (pageNumber: number) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const url = new URL("/api/categories", window.location.origin);
        url.searchParams.set("page", pageNumber.toString());
        url.searchParams.set("limit", limit.toString());

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // include cookies for auth
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Redirect to login
            window.location.href = "/auth/login?redirect=/categories";
            throw new Error("Unauthorized");
          }

          if (response.status === 400) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Invalid request");
          }

          throw new Error("Failed to fetch categories");
        }

        const data: ListCategoriesResponse = await response.json();

        // Validate response structure
        if (!Array.isArray(data.items)) {
          throw new Error("Invalid response structure");
        }

        setState({
          categories: data.items,
          page: data.page,
          totalPages: data.totalPages,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err : new Error("Unknown error"),
        }));
      }
    },
    [limit]
  );

  // Initial fetch
  useEffect(() => {
    fetchCategories(initialPage);
  }, [fetchCategories, initialPage]);

  // Navigation functions
  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= state.totalPages) {
        fetchCategories(newPage);
      }
    },
    [fetchCategories, state.totalPages]
  );

  const nextPage = useCallback(() => {
    goToPage(state.page + 1);
  }, [goToPage, state.page]);

  const prevPage = useCallback(() => {
    goToPage(state.page - 1);
  }, [goToPage, state.page]);

  const refetch = useCallback(async () => {
    await fetchCategories(state.page);
  }, [fetchCategories, state.page]);

  return {
    categories: state.categories,
    page: state.page,
    totalPages: state.totalPages,
    isLoading: state.isLoading,
    error: state.error,
    refetch,
    goToPage,
    nextPage,
    prevPage,
  };
}
