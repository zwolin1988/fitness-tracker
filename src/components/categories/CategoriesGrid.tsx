// CategoriesGrid.tsx - Main React component for displaying categories grid

import { useEffect, useCallback } from "react";
import { useCategories } from "@/components/hooks/useCategories";
import SkeletonGrid from "./SkeletonGrid";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import CategoryCard from "./CategoryCard";
import Pagination from "./Pagination";
import AdminFAB from "./AdminFAB";

interface CategoriesGridProps {
  initialPage?: number; // opcjonalny initial page (default: 1)
  userRole?: string | null; // rola użytkownika dla AdminFAB i EmptyState
}

export default function CategoriesGrid({ initialPage, userRole }: CategoriesGridProps) {
  // Odczyt page z URL query params
  const getPageFromUrl = useCallback((): number => {
    if (typeof window === "undefined") return initialPage || 1;

    const searchParams = new URLSearchParams(window.location.search);
    const pageParam = searchParams.get("page");

    if (pageParam) {
      const parsed = parseInt(pageParam, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        return parsed;
      }
    }

    return initialPage || 1;
  }, [initialPage]);

  const pageFromUrl = getPageFromUrl();

  // Użycie custom hook
  const { categories, page, totalPages, isLoading, error, refetch, goToPage } = useCategories({
    initialPage: pageFromUrl,
    limit: 20,
  });

  // Synchronizacja URL z page state
  useEffect(() => {
    if (typeof window === "undefined") return;

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("page", page.toString());
    window.history.pushState({}, "", newUrl.toString());
  }, [page]);

  // Listen do browser back/forward
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      const pageFromUrl = getPageFromUrl();
      if (pageFromUrl !== page) {
        goToPage(pageFromUrl);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [page, goToPage, getPageFromUrl]);

  // Handler dla page change
  const handlePageChange = (newPage: number) => {
    goToPage(newPage);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Conditional rendering based on state
  if (isLoading) {
    return <SkeletonGrid count={8} />;
  }

  if (error) {
    // Określenie typu błędu na podstawie error message
    let errorType: "network" | "server" | "auth" | undefined;
    if (error.message.includes("Unauthorized")) {
      errorType = "auth";
    } else if (error.message.includes("Failed to fetch")) {
      errorType = "network";
    } else if (error.message.includes("server")) {
      errorType = "server";
    }

    return <ErrorState message={error.message} onRetry={refetch} errorType={errorType} />;
  }

  if (categories.length === 0) {
    return <EmptyState userRole={userRole} />;
  }

  // Success state - wyświetlanie gridu
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} exercisesCount={0} />
        ))}
      </div>

      {/* Pagination - wyświetlaj tylko jeśli jest więcej niż 1 strona */}
      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />}

      {/* Admin FAB */}
      <AdminFAB userRole={userRole} />
    </>
  );
}
