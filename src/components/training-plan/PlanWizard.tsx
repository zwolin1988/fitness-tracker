// src/components/training-plan/PlanWizard.tsx
// Główny komponent orchestrujący cały proces tworzenia/edycji planu

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { CategoryDTO, ExerciseDTO } from "@/types";

import { Button } from "@/components/ui/button";

import { draftToWizardState, useDraftRecovery } from "@/hooks/useDraftRecovery";
import { usePlanSubmit } from "@/hooks/usePlanSubmit";
import { usePlanWizard } from "@/hooks/usePlanWizard";

import { DraftRecoveryBanner } from "./DraftRecoveryBanner";
import { ExerciseSelector } from "./ExerciseSelector";
import { ExerciseSetConfigurator } from "./ExerciseSetConfigurator";
import { PlanBasicsForm } from "./PlanBasicsForm";
import type { ExerciseSetConfig, PlanBasicsFormData, PlanDraft, PlanWizardProps } from "./types";

/**
 * Główny komponent wizarda tworzenia/edycji planu treningowego
 */
export function PlanWizard({ mode, planId, initialData, initialStep = 1, onSuccess, onCancel }: PlanWizardProps) {
  const [availableExercises, setAvailableExercises] = useState<ExerciseDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [draft, setDraft] = useState<PlanDraft | null>(null);
  const [loadedInitialData, setLoadedInitialData] = useState<any>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(mode === "edit" && !initialData);

  // Hooki
  const {
    state,
    goToStep,
    nextStep,
    prevStep,
    saveBasics,
    saveExercises,
    saveSetsConfig,
    canProceedToNextStep,
    isStepValid,
  } = usePlanWizard({ mode, planId, initialData: initialData || loadedInitialData, initialStep });

  const { loadDraft, clearDraft } = useDraftRecovery(state, mode === "create");
  const { submitPlan, isSubmitting, error: submitError } = usePlanSubmit();

  /**
   * Synchronizacja URL z aktualnym krokiem wizarda
   */
  useEffect(() => {
    // Aktualizuj URL tylko jeśli krok się zmienił
    const currentUrl = new URL(window.location.href);
    const currentStepInUrl = currentUrl.searchParams.get("step");
    const expectedStep = state.currentStep.toString();

    if (currentStepInUrl !== expectedStep) {
      currentUrl.searchParams.set("step", expectedStep);
      window.history.replaceState({}, "", currentUrl.toString());
    }
  }, [state.currentStep]);

  /**
   * Ładowanie danych planu w trybie edycji
   */
  useEffect(() => {
    if (mode === "edit" && planId && !initialData) {
      const fetchPlanData = async () => {
        try {
          const response = await fetch(`/api/plans/${planId}`, {
            credentials: "include",
          });

          if (!response.ok) {
            if (response.status === 404) {
              toast.error("Plan nie został znaleziony");
            } else if (response.status === 403) {
              toast.error("Nie masz dostępu do tego planu");
            } else {
              toast.error("Nie udało się pobrać danych planu");
            }
            window.location.href = "/plans";
            return;
          }

          const data = await response.json();
          setLoadedInitialData(data);
        } catch {
          toast.error("Wystąpił błąd podczas ładowania planu");
          window.location.href = "/plans";
        } finally {
          setIsLoadingPlan(false);
        }
      };

      fetchPlanData();
    }
  }, [mode, planId, initialData]);

  /**
   * Ładowanie ćwiczeń i kategorii przy mount
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [exercisesResponse, categoriesResponse] = await Promise.all([
          fetch("/api/exercises?page=1&limit=100", { credentials: "include" }),
          fetch("/api/categories?page=1&limit=50", { credentials: "include" }),
        ]);

        if (!exercisesResponse.ok) {
          throw new Error("Nie udało się pobrać listy ćwiczeń");
        }

        const exercisesData = await exercisesResponse.json();
        setAvailableExercises(exercisesData.items || []);

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.items || []);
        }
      } catch {
        toast.error("Nie udało się pobrać danych");
      } finally {
        setIsLoadingExercises(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Sprawdzenie draftu przy mount (tylko dla mode='create')
   */
  useEffect(() => {
    if (mode === "create") {
      const savedDraft = loadDraft();
      if (savedDraft) {
        setDraft(savedDraft);
        setShowDraftBanner(true);
      }
    }
  }, [mode, loadDraft]);

  /**
   * Obsługa przywrócenia draftu
   */
  const handleRestoreDraft = (draftData: PlanDraft) => {
    const partialState = draftToWizardState(draftData);

    // Załaduj dane z draftu do stanu wizarda
    if (partialState.basics) {
      saveBasics(partialState.basics);
    }
    if (partialState.selectedExerciseIds) {
      saveExercises(partialState.selectedExerciseIds);
    }
    if (partialState.setsConfig) {
      const config: ExerciseSetConfig[] = [];
      partialState.setsConfig.forEach((sets, exerciseId) => {
        config.push({ exerciseId, sets });
      });
      saveSetsConfig(config);
    }
    if (partialState.currentStep) {
      goToStep(partialState.currentStep);
    }

    setShowDraftBanner(false);
    toast.success("Przywrócono niezakończony plan");
  };

  /**
   * Obsługa odrzucenia draftu
   */
  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftBanner(false);
    toast.info("Draft został odrzucony");
  };

  /**
   * Obsługa submit formularza podstaw (krok 1)
   */
  const handleBasicsSubmit = (data: PlanBasicsFormData) => {
    saveBasics(data);
    nextStep();
  };

  /**
   * Obsługa zmiany wybranych ćwiczeń (krok 2)
   */
  const handleExercisesChange = (exerciseIds: string[]) => {
    saveExercises(exerciseIds);
  };

  /**
   * Obsługa zmiany konfiguracji serii (krok 3)
   */
  const handleSetsConfigChange = (config: ExerciseSetConfig[]) => {
    saveSetsConfig(config);
  };

  /**
   * Obsługa usunięcia ćwiczenia w kroku 3
   * Synchronizuje stan z krokiem 2
   */
  const handleExerciseRemoved = (exerciseId: string) => {
    const updatedIds = state.selectedExerciseIds.filter((id) => id !== exerciseId);
    saveExercises(updatedIds);
  };

  /**
   * Obsługa anulowania
   */
  const handleCancel = () => {
    // TODO: Pokazać dialog potwierdzenia jeśli są niezapisane zmiany
    if (onCancel) {
      onCancel();
    } else {
      window.location.href = "/plans";
    }
  };

  /**
   * Finalne zapisanie planu
   */
  const handleSavePlan = async () => {
    // Walidacja przed zapisem
    if (!state.basics || !isStepValid(3)) {
      toast.error("Uzupełnij wszystkie wymagane pola");
      return;
    }

    // Wywołanie API
    let result;
    if (mode === "edit" && planId) {
      // PUT /api/plans/{id}
      // Note: The PUT endpoint only updates basic info + exerciseIds
      // Sets are managed through separate endpoints in a full implementation
      // For MVP, we'll recreate the plan structure
      try {
        // Prepare exercises with sets for create-like structure
        const exercises = state.selectedExerciseIds.map((exerciseId) => {
          const sets = state.setsConfig.get(exerciseId) || [];
          return {
            exerciseId,
            sets: sets.map((set) => ({
              repetitions: set.repetitions,
              weight: set.weight,
              set_order: set.set_order,
            })),
          };
        });

        const command = {
          name: state.basics.name,
          description: state.basics.description,
          exercises,
        };

        const response = await fetch(`/api/plans/${planId}`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        });

        if (!response.ok) {
          throw new Error("Nie udało się zaktualizować planu");
        }

        result = await response.json();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Wystąpił błąd podczas aktualizacji planu");
        return;
      }
    } else {
      // POST /api/plans (create)
      const exercises = state.selectedExerciseIds.map((exerciseId) => {
        const sets = state.setsConfig.get(exerciseId) || [];
        return {
          exerciseId,
          sets: sets.map((set) => ({
            repetitions: set.repetitions,
            weight: set.weight,
            set_order: set.set_order,
          })),
        };
      });

      const command = {
        name: state.basics.name,
        description: state.basics.description,
        exercises,
      };

      result = await submitPlan(command);
    }

    if (result) {
      // Success
      const successMessage =
        mode === "edit"
          ? `Plan "${state.basics.name}" został zaktualizowany`
          : `Plan "${state.basics.name}" został utworzony`;
      toast.success(successMessage);

      if (mode === "create") {
        clearDraft();
      }

      // Wywołaj callback lub redirect
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          if (mode === "edit" && planId) {
            window.location.href = `/plans/${planId}`;
          } else {
            window.location.href = "/plans";
          }
        }, 500);
      }
    } else if (submitError) {
      // Error
      toast.error(submitError);
    }
  };

  if (isLoadingExercises || isLoadingPlan) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-3 text-muted-foreground">{isLoadingPlan ? "Ładowanie danych planu..." : "Ładowanie..."}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Draft Recovery Banner - fixed na dole */}
      {showDraftBanner && draft && (
        <DraftRecoveryBanner draft={draft} onRestore={handleRestoreDraft} onDiscard={handleDiscardDraft} />
      )}

      <main
        className={`mx-auto w-full flex-grow px-4 py-6 sm:px-6 ${state.currentStep === 1 ? "max-w-2xl" : "max-w-4xl lg:px-8"}`}
      >
        <div className="flex flex-col gap-8">
          {/* Step Indicator */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Krok {state.currentStep} z 3</p>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(state.currentStep / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {state.currentStep === 3
                ? "Konfiguracja Serii"
                : mode === "create"
                  ? "Utwórz Plan Treningowy"
                  : "Edytuj Plan Treningowy"}
            </h2>
            {state.currentStep !== 3 && (
              <p className="text-base text-muted-foreground">
                {state.currentStep === 1 && "Zacznij od podania podstawowych informacji o planie."}
                {state.currentStep === 2 && "Wybierz ćwiczenia do swojego planu z katalogu."}
              </p>
            )}
          </div>

          {/* Kroki wizarda */}
          {/* Krok 1: Podstawy */}
          {state.currentStep === 1 && (
            <PlanBasicsForm
              initialData={state.basics || undefined}
              onSubmit={handleBasicsSubmit}
              onCancel={handleCancel}
            />
          )}

          {/* Krok 2: Wybór ćwiczeń */}
          {state.currentStep === 2 && (
            <ExerciseSelector
              availableExercises={availableExercises}
              categories={categories}
              selectedExerciseIds={state.selectedExerciseIds}
              onSelectionChange={handleExercisesChange}
            />
          )}

          {/* Krok 3: Konfiguracja serii */}
          {state.currentStep === 3 && (
            <ExerciseSetConfigurator
              exercises={availableExercises.filter((ex) => state.selectedExerciseIds.includes(ex.id))}
              initialSets={state.setsConfig}
              onSetsConfigured={handleSetsConfigChange}
              onExerciseRemoved={handleExerciseRemoved}
            />
          )}
        </div>
      </main>

      {/* Footer - sticky bottom (nie w kroku 1) */}
      {state.currentStep !== 1 && (
        <footer className="sticky bottom-0 mt-auto border-t border-border bg-background py-4">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Button type="button" variant="secondary" size="lg" onClick={prevStep} data-testid="wizard-back-button">
              Wstecz
            </Button>
            {state.currentStep === 2 && (
              <Button
                type="button"
                variant="default"
                size="lg"
                onClick={nextStep}
                disabled={!canProceedToNextStep()}
                data-testid="wizard-next-button"
              >
                Dalej
              </Button>
            )}
            {state.currentStep === 3 && (
              <Button
                type="button"
                variant="default"
                size="lg"
                onClick={handleSavePlan}
                disabled={!isStepValid(3) || isSubmitting}
                data-testid="wizard-save-button"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "edit" ? "Aktualizowanie..." : "Zapisywanie..."}
                  </>
                ) : (
                  <>{mode === "edit" ? "Zaktualizuj plan" : "Zapisz plan"}</>
                )}
              </Button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
