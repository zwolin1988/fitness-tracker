// CategoryCard.tsx - Card component for displaying a single category

import { useState } from "react";
import { Dumbbell } from "lucide-react";
import type { CategoryDTO } from "@/types";

interface CategoryCardProps {
  category: CategoryDTO; // dane kategorii z API
  exercisesCount?: number; // opcjonalna liczba ćwiczeń
  onClick?: (categoryId: string) => void; // optional custom handler
}

export default function CategoryCard({ category, exercisesCount = 0, onClick }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(category.id);
    } else {
      // Default navigation
      window.location.href = `/exercises?categoryId=${category.id}`;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Kategoria: ${category.name}`}
    >
      {/* Image Section */}
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {category.image_url && !imageError ? (
          <img
            src={category.image_url}
            alt={category.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            onError={handleImageError}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">📋</div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 line-clamp-1">{category.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{category.description || "Brak opisu"}</p>

        {/* Exercises Count Badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Dumbbell className="h-4 w-4" />
          <span>{exercisesCount} ćwiczeń</span>
        </div>
      </div>
    </div>
  );
}
