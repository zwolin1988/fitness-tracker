// src/components/training-plan/PlansList.tsx
// Lista planów treningowych z możliwością dodania nowego

import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { TrainingPlanDTO } from "@/types";

import { Button } from "@/components/ui/button";

interface PlansListResponse {
  items: TrainingPlanDTO[];
  page: number;
  totalPages: number;
}

/**
 * Komponent listy planów treningowych
 */
export function PlansList() {
  const [plans, setPlans] = useState<TrainingPlanDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Pobieranie planów z API
   */
  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/plans", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Nie udało się pobrać planów");
      }

      const data: PlansListResponse = await response.json();
      setPlans(data.items || []);
    } catch {
      toast.error("Nie udało się pobrać listy planów");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Ładowanie planów przy mount
   */
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  /**
   * Obsługa kliknięcia "Nowy plan"
   */
  const handleNewPlan = useCallback(() => {
    // Sprawdź limit 7 planów
    if (plans.length >= 7) {
      toast.error("Osiągnięto limit 7 planów treningowych. Usuń istniejący plan aby dodać nowy.");
      return;
    }

    // Przekieruj do strony tworzenia planu
    window.location.href = "/plans/create";
  }, [plans.length]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Ładowanie planów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header z przyciskiem */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Plany Treningowe</h1>
          <p className="text-muted-foreground">
            {plans.length} / 7 {plans.length === 1 ? "plan" : "planów"}
          </p>
        </div>
        <Button onClick={handleNewPlan} disabled={plans.length >= 7}>
          <Plus className="mr-2 h-4 w-4" />
          Nowy plan
        </Button>
      </div>

      {/* Lista planów */}
      {plans.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">Nie masz jeszcze żadnych planów treningowych</p>
          <Button onClick={handleNewPlan}>
            <Plus className="mr-2 h-4 w-4" />
            Utwórz pierwszy plan
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-lg border bg-card p-6 hover:border-primary transition-colors">
              <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
              {plan.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{plan.description}</p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Utworzono: {new Date(plan.created_at).toLocaleDateString("pl-PL")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ostrzeżenie o limicie */}
      {plans.length >= 7 && (
        <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Osiągnięto maksymalny limit 7 planów treningowych. Usuń istniejący plan aby dodać nowy.
          </p>
        </div>
      )}
    </div>
  );
}
