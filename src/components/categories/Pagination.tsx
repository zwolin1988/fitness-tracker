// Pagination.tsx - Pagination controls component

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number; // aktualna strona (1-indexed)
  totalPages: number; // łączna liczba stron
  onPageChange: (page: number) => void; // callback przy zmianie strony
  maxVisiblePages?: number; // max liczba widocznych numerów stron (default: 7)
}

export default function Pagination({ currentPage, totalPages, onPageChange, maxVisiblePages = 7 }: PaginationProps) {
  // Generowanie numerów stron z inteligentną elipsą
  const generatePageNumbers = (): (number | string)[] => {
    if (totalPages <= maxVisiblePages) {
      // Jeśli wszystkie strony mieszczą się, pokaż wszystkie
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    // Zawsze pokazuj pierwszą stronę
    pages.push(1);

    let startPage = Math.max(2, currentPage - halfVisible);
    let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

    // Dostosuj zakres jeśli jesteśmy blisko początku lub końca
    if (currentPage <= halfVisible) {
      endPage = Math.min(totalPages - 1, maxVisiblePages - 1);
    } else if (currentPage >= totalPages - halfVisible) {
      startPage = Math.max(2, totalPages - maxVisiblePages + 2);
    }

    // Dodaj elipsę na początku jeśli potrzeba
    if (startPage > 2) {
      pages.push("...");
    }

    // Dodaj strony środkowe
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Dodaj elipsę na końcu jeśli potrzeba
    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    // Zawsze pokazuj ostatnią stronę
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="mt-8">
      <nav aria-label="Nawigacja po stronach" className="flex items-center justify-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Poprzednia strona"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Poprzednia
        </Button>

        {/* Page Numbers */}
        <div className="flex gap-1">
          {pageNumbers.map((page, index) =>
            page === "..." ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                aria-label={`Strona ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </Button>
            )
          )}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Następna strona"
        >
          Następna
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </nav>

      {/* Info Text */}
      <p className="text-center text-sm text-muted-foreground mt-2">
        Strona {currentPage} z {totalPages}
      </p>
    </div>
  );
}
