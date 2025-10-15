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
import { StepIndicator } from "./StepIndicator";
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
  } = usePlanWizard({ mode, planId, initialData, initialStep });

  const { loadDraft, clearDraft } = useDraftRecovery(state, mode === "create");
  const { submitPlan, isSubmitting, error: submitError } = usePlanSubmit();

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
      } catch (err) {
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

    // Przygotowanie command dla API
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

    // TODO: Obsługa edycji (mode='edit') - PUT /api/plans/{id} + sets CRUD
    // W MVP skupiamy się na tworzeniu nowych planów
    if (mode === "edit") {
      toast.error("Edycja planów będzie dostępna wkrótce");
      return;
    }

    // Wywołanie API
    const result = await submitPlan(command);

    if (result) {
      // Success
      toast.success(`Plan "${state.basics.name}" został utworzony`);
      clearDraft();

      // Wywołaj callback lub redirect
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          window.location.href = "/plans";
        }, 500);
      }
    } else if (submitError) {
      // Error
      toast.error(submitError);
    }
  };

  if (isLoadingExercises) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Draft Recovery Banner - fixed na dole */}
      {showDraftBanner && draft && (
        <DraftRecoveryBanner draft={draft} onRestore={handleRestoreDraft} onDiscard={handleDiscardDraft} />
      )}

      <main className={`mx-auto w-full flex-grow px-4 py-6 sm:px-6 ${state.currentStep === 1 ? "max-w-2xl" : "max-w-4xl lg:px-8"}`}>
        <div className="flex flex-col gap-8">

          {/* Step Indicator */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Krok {state.currentStep} z 3
            </p>
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
              {state.currentStep === 3 ? "Konfiguracja Serii" : mode === "create" ? "Utwórz Plan Treningowy" : "Edytuj Plan Treningowy"}
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
            />
          )}
        </div>
      </main>

      {/* Footer - sticky bottom (nie w kroku 1) */}
      {state.currentStep !== 1 && (
        <footer className="sticky bottom-0 mt-auto border-t border-border bg-background py-4">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={prevStep}
            >
              Wstecz
            </Button>
            {state.currentStep === 2 && (
              <Button
                type="button"
                variant="default"
                size="lg"
                onClick={nextStep}
                disabled={!canProceedToNextStep()}
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
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Zapisywanie...
                  </>
                ) : (
                  <>Zapisz plan</>
                )}
              </Button>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
