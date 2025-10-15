// src/components/exercise/ExerciseCatalog.tsx
// Katalog ćwiczeń z filtrowaniem i opcjonalnym multi-select

import { ChevronDown, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import type { ExerciseCatalogProps, ExerciseFilters } from "@/components/training-plan/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DIFFICULTY_MAP = {
  "łatwe": 1,
  "średnie": 2,
  "trudne": 3,
};

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "Wszystkie poziomy" },
  { value: "łatwe", label: "Łatwe" },
  { value: "średnie", label: "Średnie" },
  { value: "trudne", label: "Trudne" },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "nogi": { bg: "bg-blue-100 dark:bg-blue-900/50", text: "text-blue-800 dark:text-blue-300" },
  "klatka piersiowa": { bg: "bg-red-100 dark:bg-red-900/50", text: "text-red-800 dark:text-red-300" },
  "plecy": { bg: "bg-yellow-100 dark:bg-yellow-900/50", text: "text-yellow-800 dark:text-yellow-300" },
  "brzuch": { bg: "bg-green-100 dark:bg-green-900/50", text: "text-green-800 dark:text-green-300" },
  "ramiona": { bg: "bg-purple-100 dark:bg-purple-900/50", text: "text-purple-800 dark:text-purple-300" },
  "biceps": { bg: "bg-indigo-100 dark:bg-indigo-900/50", text: "text-indigo-800 dark:text-indigo-300" },
  "triceps": { bg: "bg-pink-100 dark:bg-pink-900/50", text: "text-pink-800 dark:text-pink-300" },
  "cardio": { bg: "bg-orange-100 dark:bg-orange-900/50", text: "text-orange-800 dark:text-orange-300" },
};

/**
 * Komponent katalogu ćwiczeń z filtrowaniem i opcjonalnym multi-select
 */
export function ExerciseCatalog({
  exercises,
  categories,
  multiSelect = false,
  selectedIds = [],
  onSelectionChange,
  onExerciseClick,
}: ExerciseCatalogProps) {
  const [filters, setFilters] = useState<ExerciseFilters>({
    searchQuery: "",
    categoryId: undefined,
    difficulty: undefined,
  });

  /**
   * Mapowanie kategorii ID -> nazwa
   */
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  /**
   * Przefiltrowane ćwiczenia
   */
  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      // Filtrowanie po wyszukiwaniu
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = exercise.name.toLowerCase().includes(query);
        const matchesDescription = exercise.description?.toLowerCase().includes(query);

        if (!matchesName && !matchesDescription) {
          return false;
        }
      }

      // Filtrowanie po kategorii
      if (filters.categoryId && filters.categoryId !== "all" && exercise.category_id !== filters.categoryId) {
        return false;
      }

      // Filtrowanie po trudności
      if (filters.difficulty && filters.difficulty !== "all" && exercise.difficulty !== filters.difficulty) {
        return false;
      }

      return true;
    });
  }, [exercises, filters]);

  /**
   * Obsługa zmiany wyszukiwania
   */
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
  }, []);

  /**
   * Obsługa zmiany kategorii
   */
  const handleCategoryChange = useCallback((categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: categoryId === "all" ? undefined : categoryId,
    }));
  }, []);

  /**
   * Obsługa zmiany poziomu trudności
   */
  const handleDifficultyChange = useCallback((difficulty: string) => {
    setFilters((prev) => ({
      ...prev,
      difficulty: difficulty === "all" ? undefined : difficulty,
    }));
  }, []);

  /**
   * Obsługa kliknięcia w ćwiczenie (multi-select lub single)
   */
  const handleExerciseClick = useCallback(
    (exerciseId: string) => {
      if (multiSelect && onSelectionChange) {
        const isSelected = selectedIds.includes(exerciseId);

        if (isSelected) {
          // Odznacz
          onSelectionChange(selectedIds.filter((id) => id !== exerciseId));
        } else {
          // Zaznacz
          onSelectionChange([...selectedIds, exerciseId]);
        }
      } else if (onExerciseClick) {
        const exercise = exercises.find((ex) => ex.id === exerciseId);
        if (exercise) {
          onExerciseClick(exercise);
        }
      }
    },
    [multiSelect, onSelectionChange, selectedIds, onExerciseClick, exercises]
  );

  /**
   * Renderowanie wskaźników trudności
   */
  const renderDifficultyIndicator = (difficulty: string) => {
    const level = DIFFICULTY_MAP[difficulty as keyof typeof DIFFICULTY_MAP] || 1;
    const color = level === 1 ? "bg-green-500" : level === 2 ? "bg-yellow-500" : "bg-red-500";

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3].map((dot) => (
          <div
            key={dot}
            className={`h-2 w-4 rounded-full ${dot <= level ? color : "bg-neutral-300 dark:bg-neutral-700"}`}
          />
        ))}
      </div>
    );
  };

  /**
   * Pobieranie koloru kategorii
   */
  const getCategoryColor = (categoryId: string) => {
    const categoryName = categoryMap.get(categoryId) || "";
    const normalized = categoryName.toLowerCase();
    return CATEGORY_COLORS[normalized] || { bg: "bg-gray-100", text: "text-gray-800" };
  };

  /**
   * Pobieranie nazwy kategorii
   */
  const getCategoryName = (categoryId: string) => {
    return categoryMap.get(categoryId) || categoryId;
  };

  /**
   * Pobieranie labela aktywnej kategorii
   */
  const getActiveCategoryLabel = () => {
    if (!filters.categoryId) return "Kategoria";
    return getCategoryName(filters.categoryId);
  };

  /**
   * Pobieranie labela aktywnej trudności
   */
  const getActiveDifficultyLabel = () => {
    if (!filters.difficulty) return "Poziom trudności";
    const option = DIFFICULTY_OPTIONS.find((opt) => opt.value === filters.difficulty);
    return option?.label || "Poziom trudności";
  };

  const selectedCount = selectedIds.length;

  return (
    <div className="space-y-6">
      {/* Search and Filters - Sticky */}
      <div className="sticky top-0 z-10 -mx-4 -mt-2 bg-background/80 p-4 backdrop-blur-sm sm:top-4 sm:mx-0 sm:rounded-lg">
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Szukaj ćwiczeń..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="h-12 w-full pl-10 pr-4 bg-card/50"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-full bg-primary/10 px-4 text-sm font-semibold text-primary hover:bg-primary/20 hover:text-primary"
                >
                  <span>{getActiveCategoryLabel()}</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleCategoryChange("all")}>Wszystkie kategorie</DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem key={category.id} onClick={() => handleCategoryChange(category.id)}>
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 rounded-full bg-primary/10 px-4 text-sm font-semibold text-primary hover:bg-primary/20 hover:text-primary"
                >
                  <span>{getActiveDifficultyLabel()}</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <DropdownMenuItem key={option.value} onClick={() => handleDifficultyChange(option.value)}>
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Selection Banner - Before grid */}
      {selectedCount > 0 && (
        <div className="rounded-lg border border-primary/50 bg-primary/10 p-4 text-center">
          <p className="font-semibold text-primary">
            Wybrano {selectedCount} {selectedCount === 1 ? "ćwiczenie" : selectedCount < 5 ? "ćwiczenia" : "ćwiczeń"}. Gotowy do kontynuacji?
          </p>
        </div>
      )}

      {/* Grid ćwiczeń */}
      {filteredExercises.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Nie znaleziono ćwiczeń</p>
        </div>
      ) : (
        <section>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {filteredExercises.map((exercise) => {
              const isSelected = selectedIds.includes(exercise.id);
              const categoryColor = getCategoryColor(exercise.category_id);
              const categoryName = getCategoryName(exercise.category_id);

              return (
                <div
                  key={exercise.id}
                  className={`group relative cursor-pointer rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background ${
                    isSelected ? "ring-2 ring-inset ring-primary" : ""
                  }`}
                  onClick={() => handleExerciseClick(exercise.id)}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleExerciseClick(exercise.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                        isSelected ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <span className={`text-2xl ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                        {categoryName.toLowerCase() === "nogi" && "🏋️"}
                        {categoryName.toLowerCase() === "klatka piersiowa" && "💪"}
                        {categoryName.toLowerCase() === "plecy" && "🦾"}
                        {categoryName.toLowerCase() === "brzuch" && "🧘"}
                        {categoryName.toLowerCase() === "ramiona" && "💪"}
                        {categoryName.toLowerCase() === "biceps" && "💪"}
                        {categoryName.toLowerCase() === "triceps" && "💪"}
                        {categoryName.toLowerCase() === "cardio" && "🏃"}
                        {!["nogi", "klatka piersiowa", "plecy", "brzuch", "ramiona", "biceps", "triceps", "cardio"].includes(categoryName.toLowerCase()) && "💪"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-grow">
                      <p className="font-semibold text-foreground">{exercise.name}</p>
                      <Badge className={`mt-1 ${categoryColor.bg} ${categoryColor.text} border-none`}>
                        {categoryName}
                      </Badge>
                      <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                        <span className="font-medium">Poziom:</span>
                        {renderDifficultyIndicator(exercise.difficulty)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
