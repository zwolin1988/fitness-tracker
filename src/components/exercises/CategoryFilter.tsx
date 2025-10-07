import type { Category } from "@/models";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  exerciseCounts: Record<string, number>;
  totalCount: number;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  exerciseCounts,
  totalCount,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filtr kategorii ćwiczeń">
      {/* Przycisk "Wszystkie" */}
      <button
        onClick={() => onCategoryChange("all")}
        aria-label="Pokaż wszystkie ćwiczenia"
        aria-pressed={selectedCategory === "all"}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          selectedCategory === "all"
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-card hover:bg-accent hover:text-accent-foreground"
        }`}
      >
        <span aria-hidden="true">📋</span>
        <span className="font-medium">Wszystkie</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            selectedCategory === "all"
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-primary/10 text-primary"
          }`}
          aria-label={`${totalCount} ćwiczeń`}
        >
          {totalCount}
        </span>
      </button>

      {/* Przyciski kategorii */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          aria-label={`Filtruj ćwiczenia: ${category.label}`}
          aria-pressed={selectedCategory === category.id}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            selectedCategory === category.id
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-card hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <span aria-hidden="true">{category.icon}</span>
          <span className="font-medium">{category.label}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              selectedCategory === category.id
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-primary/10 text-primary"
            }`}
            aria-label={`${exerciseCounts[category.id] || 0} ćwiczeń`}
          >
            {exerciseCounts[category.id] || 0}
          </span>
        </button>
      ))}
    </div>
  );
}
