// src/components/training-plan/PlanDetail.tsx
// Komponent szczegółów planu treningowego

import { ArrowLeft, Edit, Copy, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { ExerciseDTO, PlanExerciseSetDTO, TrainingPlanDTO } from "@/types";

import { Button } from "@/components/ui/button";

interface TrainingPlanDetailResponse extends TrainingPlanDTO {
  exercises: ExerciseDTO[];
  sets: PlanExerciseSetDTO[];
}

interface ExerciseWithSetsView {
  exercise: ExerciseDTO;
  sets: PlanExerciseSetDTO[];
  totalSets: number;
  setsDescription: string;
}

interface PlanDetailProps {
  planId: string;
}

/**
 * Komponent szczegółów planu treningowego
 */
export function PlanDetail({ planId }: PlanDetailProps) {
  const [plan, setPlan] = useState<TrainingPlanDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Pobieranie szczegółów planu
   */
  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/plans/${planId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Plan nie został znaleziony");
          } else if (response.status === 403) {
            toast.error("Nie masz dostępu do tego planu");
          } else {
            toast.error("Nie udało się pobrać szczegółów planu");
          }
          window.location.href = "/plans";
          return;
        }

        const data: TrainingPlanDetailResponse = await response.json();
        setPlan(data);
      } catch {
        toast.error("Wystąpił błąd podczas ładowania planu");
        window.location.href = "/plans";
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlanDetails();
  }, [planId]);

  /**
   * Grupowanie setów według ćwiczenia
   */
  const exercisesWithSets: ExerciseWithSetsView[] = plan
    ? plan.exercises.map((exercise) => {
        const exerciseSets = plan.sets
          .filter((set) => set.exercise_id === exercise.id)
          .sort((a, b) => a.set_order - b.set_order);

        // Formatowanie opisu setów
        const totalSets = exerciseSets.length;
        let setsDescription = "";

        if (totalSets > 0) {
          // Sprawdź czy wszystkie sety mają takie same parametry
          const firstSet = exerciseSets[0];
          const allSame = exerciseSets.every(
            (set) => set.repetitions === firstSet.repetitions && set.weight === firstSet.weight
          );

          if (allSame) {
            setsDescription = `${totalSets} sets of ${firstSet.repetitions} reps`;
            if (firstSet.weight > 0) {
              setsDescription += ` @ ${firstSet.weight}kg`;
            }
          } else {
            setsDescription = `${totalSets} sets (mixed)`;
          }
        } else {
          setsDescription = "No sets configured";
        }

        return {
          exercise,
          sets: exerciseSets,
          totalSets,
          setsDescription,
        };
      })
    : [];

  /**
   * Całkowita liczba setów
   */
  const totalSets = plan ? plan.sets.length : 0;

  /**
   * Ostatni trening (TODO: implementacja po dodaniu treningów)
   */
  const lastWorkoutDate = null;

  /**
   * Obsługa usunięcia planu
   */
  const handleDelete = async () => {
    if (!confirm("Czy na pewno chcesz usunąć ten plan? Tej operacji nie można cofnąć.")) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/plans/${planId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Nie udało się usunąć planu");
      }

      toast.success("Plan został usunięty");
      window.location.href = "/plans";
    } catch {
      toast.error("Nie udało się usunąć planu");
      setIsDeleting(false);
    }
  };

  /**
   * Obsługa duplikowania planu (TODO: implementacja)
   */
  const handleDuplicate = () => {
    toast.info("Funkcja duplikowania będzie dostępna wkrótce");
  };

  /**
   * Obsługa rozpoczęcia treningu (TODO: implementacja)
   */
  const handleStartWorkout = () => {
    toast.info("Funkcja rozpoczynania treningu będzie dostępna wkrótce");
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Ładowanie szczegółów planu...</p>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Przycisk powrotu */}
      <Button variant="ghost" onClick={() => (window.location.href = "/plans")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Powrót do planów
      </Button>

      {/* Header z nazwą i opisem */}
      <div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{plan.name}</h2>
        {plan.description && <p className="mt-2 text-muted-foreground">{plan.description}</p>}
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Ćwiczenia</p>
          <p className="text-3xl font-bold">{exercisesWithSets.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Wszystkie serie</p>
          <p className="text-3xl font-bold">{totalSets}</p>
        </div>
        <div className="bg-card border rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Ostatni trening</p>
          <p className="text-3xl font-bold">{lastWorkoutDate || "—"}</p>
        </div>
      </div>

      {/* Tabela ćwiczeń */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">Ćwiczenia</h3>
        <div className="overflow-hidden border rounded-lg">
          {/* Header tabeli - tylko desktop */}
          <div className="hidden md:grid md:grid-cols-[auto,1fr,1fr] bg-muted font-medium">
            <div className="px-6 py-3 text-left text-sm"></div>
            <div className="px-6 py-3 text-left text-sm">Ćwiczenie</div>
            <div className="px-6 py-3 text-left text-sm">Serie i powtórzenia</div>
          </div>

          {/* Rows */}
          <div className="divide-y">
            {exercisesWithSets.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Ten plan nie zawiera jeszcze żadnych ćwiczeń</div>
            ) : (
              exercisesWithSets.map(({ exercise, setsDescription }) => (
                <div key={exercise.id} className="grid grid-cols-[auto,1fr,1fr] items-center hover:bg-muted/50">
                  {/* Ikona ćwiczenia */}
                  <div className="p-4">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {exercise.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Nazwa ćwiczenia */}
                  <div className="px-6 py-4 text-sm font-medium">{exercise.name}</div>

                  {/* Opis setów */}
                  <div className="px-6 py-4 text-sm text-muted-foreground">{setsDescription}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Akcje */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6">
        <Button onClick={handleStartWorkout} size="lg" className="flex-1 sm:flex-auto">
          Rozpocznij trening
        </Button>
        <Button variant="outline" size="lg" onClick={() => (window.location.href = `/plans/${planId}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edytuj plan
        </Button>
        <Button variant="outline" size="lg" onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplikuj
        </Button>
        <Button variant="outline" size="lg" onClick={handleDelete} disabled={isDeleting} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {isDeleting ? "Usuwanie..." : "Usuń"}
        </Button>
      </div>
    </div>
  );
}
