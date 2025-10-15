// SkeletonGrid.tsx - Loading skeleton component for categories grid

interface SkeletonGridProps {
  count?: number; // liczba skeleton cards (default: 8)
}

export default function SkeletonGrid({ count = 8 }: SkeletonGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg border bg-card overflow-hidden">
          {/* Image placeholder */}
          <div className="aspect-video w-full bg-muted" />

          {/* Content placeholder */}
          <div className="p-4 space-y-3">
            {/* Title placeholder */}
            <div className="h-6 bg-muted rounded w-3/4" />

            {/* Description placeholders */}
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />

            {/* Badge placeholder */}
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
