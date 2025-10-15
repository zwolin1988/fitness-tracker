// EmptyState.tsx - Empty state component when no categories exist

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  userRole?: string | null; // rola użytkownika
}

export default function EmptyState({ userRole }: EmptyStateProps) {
  const handleAddCategory = () => {
    window.location.href = "/admin/categories";
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-6xl mb-4">📋</div>
      <h3 className="text-lg font-semibold mb-2">Brak kategorii</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Nie znaleziono żadnych kategorii ćwiczeń.
        {userRole === "admin" && " Dodaj pierwszą kategorię aby rozpocząć."}
      </p>
      {userRole === "admin" && (
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj kategorię
        </Button>
      )}
    </div>
  );
}
