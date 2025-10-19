// src/components/training-plan/PlansList.tsx
// Lista planów treningowych z możliwością dodania nowego

import { Plus, ChevronRight, Dumbbell } from "lucide-react";
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

  /**
   * Formatowanie daty ostatniej sesji (TODO: implementacja po dodaniu workouts)
   */
  const formatLastSession = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Dzisiaj";
    if (diffDays === 1) return "Wczoraj";
    if (diffDays < 7) return `${diffDays} dni temu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tygodni temu`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} miesięcy temu`;
    return `${Math.floor(diffDays / 365)} lat temu`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Ładowanie planów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      {/* Header z przyciskiem */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold">Twoje Plany Treningowe</h2>
        <Button onClick={handleNewPlan} disabled={plans.length >= 7} data-testid="create-new-plan-button">
          <Plus className="mr-2 h-4 w-4" />
          Nowy plan
        </Button>
      </div>

      {/* Lista planów */}
      {plans.length === 0 ? (
        <div className="bg-card/50 rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">Nie masz jeszcze żadnych planów treningowych</p>
          <Button onClick={handleNewPlan} data-testid="create-first-plan-button">
            <Plus className="mr-2 h-4 w-4" />
            Utwórz pierwszy plan
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-card/50 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-4 px-2">Aktywne plany ({plans.length}/7)</h3>
            <div className="divide-y divide-border">
              {plans.map((plan) => (
                <a
                  key={plan.id}
                  href={`/plans/${plan.id}`}
                  className="flex items-center justify-between p-3 hover:bg-primary/10 rounded-lg cursor-pointer transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    {/* Ikona */}
                    <div className="flex items-center justify-center size-12 bg-primary/10 rounded-lg text-primary">
                      <Dumbbell className="size-6" />
                    </div>

                    {/* Informacje */}
                    <div>
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">Utworzono: {formatLastSession(plan.created_at)}</p>
                    </div>
                  </div>

                  {/* Strzałka */}
                  <ChevronRight className="size-5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
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
