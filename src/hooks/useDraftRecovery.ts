// src/hooks/useDraftRecovery.ts
// Hook do zapisywania i przywracania draftu z localStorage

import { useCallback, useEffect, useRef } from "react";

import type { PlanDraft, SetFormData, WizardState } from "@/components/training-plan/types";

interface UseDraftRecoveryReturn {
  loadDraft: () => PlanDraft | null;
  saveDraft: (state: WizardState) => void;
  clearDraft: () => void;
}

const DRAFT_KEY = "training-plan-draft";
const AUTO_SAVE_INTERVAL = 30000; // 30 sekund

/**
 * Hook do zapisywania i przywracania draftu z localStorage
 */
export function useDraftRecovery(wizardState: WizardState, autoSaveEnabled = true): UseDraftRecoveryReturn {
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousStateRef = useRef<string>("");

  /**
   * Odczytuje draft z localStorage
   */
  const loadDraft = useCallback((): PlanDraft | null => {
    try {
      const draftJson = localStorage.getItem(DRAFT_KEY);

      if (!draftJson) {
        return null;
      }

      const draft = JSON.parse(draftJson) as PlanDraft;

      // Sprawdź czy draft nie jest zbyt stary (np. > 7 dni)
      const MAX_DRAFT_AGE = 7 * 24 * 60 * 60 * 1000; // 7 dni
      const now = Date.now();

      if (now - draft.timestamp > MAX_DRAFT_AGE) {
        // Draft jest zbyt stary, usuń go
        localStorage.removeItem(DRAFT_KEY);
        return null;
      }

      return draft;
    } catch (error) {
      console.error("Error loading draft from localStorage:", error);
      return null;
    }
  }, []);

  /**
   * Zapisuje draft do localStorage
   */
  const saveDraft = useCallback((state: WizardState) => {
    // Nie zapisuj draftu w trybie edycji
    if (state.mode === "edit") {
      return;
    }

    // Nie zapisuj pustego stanu (brak żadnych danych)
    if (!state.basics && state.selectedExerciseIds.length === 0 && state.setsConfig.size === 0) {
      return;
    }

    try {
      // Konwertuj Map na Object (Map nie jest serializowalne)
      const setsConfigObject: Record<string, SetFormData[]> = {};
      state.setsConfig.forEach((value, key) => {
        setsConfigObject[key] = value;
      });

      const draft: PlanDraft = {
        step: state.currentStep,
        basics: state.basics || undefined,
        selectedExerciseIds: state.selectedExerciseIds,
        setsConfig: setsConfigObject,
        timestamp: Date.now(),
      };

      const draftJson = JSON.stringify(draft);

      // Sprawdź czy stan się zmienił (optymalizacja)
      if (draftJson === previousStateRef.current) {
        return;
      }

      localStorage.setItem(DRAFT_KEY, draftJson);
      previousStateRef.current = draftJson;
    } catch (error) {
      console.error("Error saving draft to localStorage:", error);
    }
  }, []);

  /**
   * Usuwa draft z localStorage
   */
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      previousStateRef.current = "";
    } catch (error) {
      console.error("Error clearing draft from localStorage:", error);
    }
  }, []);

  /**
   * Auto-save do localStorage co 30 sekund
   */
  useEffect(() => {
    if (!autoSaveEnabled) {
      return;
    }

    // Zapisz natychmiast przy zmianie stanu
    saveDraft(wizardState);

    // Ustaw interval dla auto-save
    autoSaveIntervalRef.current = setInterval(() => {
      saveDraft(wizardState);
    }, AUTO_SAVE_INTERVAL);

    // Cleanup
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [wizardState, autoSaveEnabled, saveDraft]);

  /**
   * Cleanup przy unmount komponentu
   */
  useEffect(() => {
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, []);

  return {
    loadDraft,
    saveDraft,
    clearDraft,
  };
}

/**
 * Helper function: Konwertuje PlanDraft z localStorage do formatu WizardState
 */
export function draftToWizardState(draft: PlanDraft): Partial<WizardState> {
  // Konwertuj Object z powrotem na Map
  const setsConfig = new Map<string, SetFormData[]>();

  if (draft.setsConfig) {
    Object.entries(draft.setsConfig).forEach(([key, value]) => {
      setsConfig.set(key, value);
    });
  }

  return {
    currentStep: draft.step,
    basics: draft.basics || null,
    selectedExerciseIds: draft.selectedExerciseIds || [],
    setsConfig,
  };
}
