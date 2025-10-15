// src/hooks/usePlanWizard.ts
// Hook zarządzający stanem wizarda tworzenia/edycji planu treningowego

import { useCallback, useEffect, useState } from "react";

import type {
  ExerciseSetConfig,
  PlanBasicsFormData,
  SetFormData,
  TrainingPlanDetailResponse,
  WizardMode,
  WizardState,
  WizardStep,
} from "@/components/training-plan/types";

interface UsePlanWizardProps {
  mode: WizardMode;
  planId?: string;
  initialData?: TrainingPlanDetailResponse;
  initialStep?: WizardStep;
}

interface UsePlanWizardReturn {
  state: WizardState;
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  saveBasics: (data: PlanBasicsFormData) => void;
  saveExercises: (exerciseIds: string[]) => void;
  saveSetsConfig: (config: ExerciseSetConfig[]) => void;
  canProceedToNextStep: () => boolean;
  isStepValid: (step: WizardStep) => boolean;
}

/**
 * Główny hook zarządzający stanem wizarda tworzenia/edycji planu
 */
export function usePlanWizard({ mode, planId, initialData, initialStep = 1 }: UsePlanWizardProps): UsePlanWizardReturn {
  const [state, setState] = useState<WizardState>(() => {
    // Inicjalizacja stanu z initialData (dla trybu edit)
    if (mode === "edit" && initialData) {
      const setsConfig = new Map<string, SetFormData[]>();

      // Grupowanie setów według exerciseId
      initialData.sets.forEach((set) => {
        const existingSets = setsConfig.get(set.exercise_id) || [];
        existingSets.push({
          id: set.id,
          repetitions: set.repetitions,
          weight: set.weight,
          set_order: set.set_order,
        });
        setsConfig.set(set.exercise_id, existingSets);
      });

      return {
        mode,
        currentStep: initialStep,
        completedSteps: [],
        basics: {
          name: initialData.name,
          description: initialData.description || undefined,
        },
        selectedExerciseIds: initialData.exercises.map((e) => e.id),
        setsConfig,
        isLoading: false,
        error: null,
      };
    }

    // Inicjalizacja pustego stanu (dla trybu create)
    return {
      mode,
      currentStep: initialStep,
      completedSteps: [],
      basics: null,
      selectedExerciseIds: [],
      setsConfig: new Map(),
      isLoading: false,
      error: null,
    };
  });

  /**
   * Sprawdza czy krok jest poprawnie wypełniony
   */
  const isStepValid = useCallback(
    (step: WizardStep): boolean => {
      switch (step) {
        case 1:
          // Walidacja kroku 1: nazwa wymagana, min 3 znaki
          return (
            state.basics !== null && state.basics.name.trim().length >= 3 && state.basics.name.trim().length <= 100
          );

        case 2:
          // Walidacja kroku 2: co najmniej 1 ćwiczenie wybrane
          return state.selectedExerciseIds.length > 0;

        case 3:
          // Walidacja kroku 3: każde ćwiczenie ma co najmniej 1 poprawny set
          if (state.selectedExerciseIds.length === 0) return false;

          for (const exerciseId of state.selectedExerciseIds) {
            const sets = state.setsConfig.get(exerciseId) || [];

            // Każde ćwiczenie musi mieć co najmniej 1 set
            if (sets.length === 0) return false;

            // Każdy set musi być poprawnie wypełniony
            for (const set of sets) {
              if (set.repetitions < 1 || set.repetitions > 999) return false;
              if (set.weight < 0 || set.weight > 999.99) return false;
            }
          }

          return true;

        default:
          return false;
      }
    },
    [state.basics, state.selectedExerciseIds, state.setsConfig]
  );

  /**
   * Sprawdza czy można przejść do następnego kroku
   */
  const canProceedToNextStep = useCallback((): boolean => {
    return isStepValid(state.currentStep);
  }, [state.currentStep, isStepValid]);

  /**
   * Przechodzi do określonego kroku
   */
  const goToStep = useCallback((step: WizardStep) => {
    setState((prev) => ({
      ...prev,
      currentStep: step,
    }));
  }, []);

  /**
   * Przechodzi do następnego kroku (z walidacją)
   */
  const nextStep = useCallback(() => {
    if (!canProceedToNextStep()) {
      // Cannot proceed to next step: current step is not valid
      return;
    }

    setState((prev) => {
      const nextStepNumber = (prev.currentStep + 1) as WizardStep;

      // Sprawdź czy następny krok nie przekracza 3
      if (nextStepNumber > 3) {
        return prev;
      }

      // Dodaj aktualny krok do completedSteps jeśli jeszcze nie jest
      const completedSteps = prev.completedSteps.includes(prev.currentStep)
        ? prev.completedSteps
        : [...prev.completedSteps, prev.currentStep];

      return {
        ...prev,
        currentStep: nextStepNumber,
        completedSteps,
      };
    });
  }, [canProceedToNextStep]);

  /**
   * Wraca do poprzedniego kroku
   */
  const prevStep = useCallback(() => {
    setState((prev) => {
      const prevStepNumber = (prev.currentStep - 1) as WizardStep;

      // Sprawdź czy poprzedni krok nie jest mniejszy niż 1
      if (prevStepNumber < 1) {
        return prev;
      }

      return {
        ...prev,
        currentStep: prevStepNumber,
      };
    });
  }, []);

  /**
   * Zapisuje dane z formularza podstaw (krok 1)
   */
  const saveBasics = useCallback((data: PlanBasicsFormData) => {
    setState((prev) => ({
      ...prev,
      basics: data,
    }));
  }, []);

  /**
   * Zapisuje wybrane ćwiczenia (krok 2)
   */
  const saveExercises = useCallback((exerciseIds: string[]) => {
    setState((prev) => {
      // Zachowaj setsConfig tylko dla ćwiczeń które nadal są wybrane
      const newSetsConfig = new Map<string, SetFormData[]>();
      exerciseIds.forEach((id) => {
        const sets = prev.setsConfig.get(id);
        if (sets !== undefined) {
          newSetsConfig.set(id, sets);
        }
      });

      return {
        ...prev,
        selectedExerciseIds: exerciseIds,
        setsConfig: newSetsConfig,
      };
    });
  }, []);

  /**
   * Zapisuje konfigurację serii (krok 3)
   */
  const saveSetsConfig = useCallback((config: ExerciseSetConfig[]) => {
    setState((prev) => {
      const newSetsConfig = new Map<string, SetFormData[]>();

      config.forEach((exerciseConfig) => {
        newSetsConfig.set(exerciseConfig.exerciseId, exerciseConfig.sets);
      });

      return {
        ...prev,
        setsConfig: newSetsConfig,
      };
    });
  }, []);

  /**
   * Jeśli planId się zmieni (np. po zapisie), zaktualizuj state
   */
  useEffect(() => {
    if (mode === "edit" && planId && initialData) {
      setState((prev) => {
        // Nie aktualizuj jeśli już mamy dane
        if (prev.basics !== null) return prev;

        const setsConfig = new Map<string, SetFormData[]>();
        initialData.sets.forEach((set) => {
          const existingSets = setsConfig.get(set.exercise_id) || [];
          existingSets.push({
            id: set.id,
            repetitions: set.repetitions,
            weight: set.weight,
            set_order: set.set_order,
          });
          setsConfig.set(set.exercise_id, existingSets);
        });

        return {
          ...prev,
          basics: {
            name: initialData.name,
            description: initialData.description || undefined,
          },
          selectedExerciseIds: initialData.exercises.map((e) => e.id),
          setsConfig,
        };
      });
    }
  }, [mode, planId, initialData]);

  return {
    state,
    goToStep,
    nextStep,
    prevStep,
    saveBasics,
    saveExercises,
    saveSetsConfig,
    canProceedToNextStep,
    isStepValid,
  };
}
