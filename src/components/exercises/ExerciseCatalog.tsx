import { useState, useMemo, useCallback } from "react";
import type { ExerciseTemplate, Category } from "@/types";
import { CategoryFilter } from "./CategoryFilter";
import { ExerciseCard } from "./ExerciseCard";

interface ExerciseCatalogProps {
  exercises: ExerciseTemplate[];
  categories: Category[];
}

export function ExerciseCatalog({ exercises, categories }: ExerciseCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Obliczanie liczby ćwiczeń w każdej kategorii
  const exerciseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((category) => {
      counts[category.id] = exercises.filter((ex) => ex.category === category.id).length;
    });
    return counts;
  }, [exercises, categories]);

  // Filtrowanie ćwiczeń według wybranej kategorii
  const filteredExercises = useMemo(() => {
    if (selectedCategory === "all") {
      return exercises;
    }
    return exercises.filter((exercise) => exercise.category === selectedCategory);
  }, [exercises, selectedCategory]);

  // Grupowanie przefiltrowanych ćwiczeń według kategorii dla wyświetlenia
  const groupedExercises = useMemo(() => {
    if (selectedCategory !== "all") {
      // Jeśli wybrano konkretną kategorię, zwróć tylko tę kategorię
      const category = categories.find((c) => c.id === selectedCategory);
      if (!category) return [];
      return [
        {
          category,
          exercises: filteredExercises,
        },
      ];
    }

    // Jeśli wybrano "wszystkie", grupuj według kategorii
    return categories
      .map((category) => ({
        category,
        exercises: exercises.filter((ex) => ex.category === category.id),
      }))
      .filter((group) => group.exercises.length > 0);
  }, [selectedCategory, categories, exercises, filteredExercises]);

  const handleAddToWorkout = useCallback((exercise: ExerciseTemplate) => {
    // TODO: Implementacja dodawania do treningu
    if (import.meta.env.DEV) {
      console.log("Dodawanie do treningu:", exercise.name);
    }
  }, []);

  return (
    <div>
      {/* Filtr kategorii */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        exerciseCounts={exerciseCounts}
        totalCount={exercises.length}
      />

      {/* Sekcje z ćwiczeniami */}
      {groupedExercises.map(({ category, exercises: categoryExercises }) => (
        <section key={category.id} className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryExercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} onAddToWorkout={handleAddToWorkout} />
            ))}
          </div>
        </section>
      ))}

      {/* Informacja o liczbie ćwiczeń */}
      <div className="mt-12 p-6 rounded-lg bg-muted/50 text-center">
        <p className="text-sm text-muted-foreground">
          {selectedCategory === "all" ? (
            <>
              Łącznie dostępnych:{" "}
              <span className="font-bold text-foreground">{exercises.length}</span> ćwiczeń
            </>
          ) : (
            <>
              Wyświetlono: <span className="font-bold text-foreground">{filteredExercises.length}</span> z{" "}
              <span className="font-bold text-foreground">{exercises.length}</span> ćwiczeń
            </>
          )}
        </p>
      </div>
    </div>
  );
}
