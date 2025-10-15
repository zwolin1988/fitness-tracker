// src/hooks/usePlanSubmit.ts
// Hook do wysyłania planu na API

import { useState } from "react";

import type { CreateTrainingPlanCommand, TrainingPlanDTO } from "@/types";

interface UsePlanSubmitReturn {
  submitPlan: (command: CreateTrainingPlanCommand) => Promise<TrainingPlanDTO | null>;
  isSubmitting: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook do wysyłania planu na API
 */
export function usePlanSubmit(): UsePlanSubmitReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Czyści błąd
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Wysyła plan do API
   */
  const submitPlan = async (command: CreateTrainingPlanCommand): Promise<TrainingPlanDTO | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Sprawdzenie limitu 7 planów (GET /api/plans + liczenie)
      const plansResponse = await fetch("/api/plans", {
        method: "GET",
        credentials: "include", // Wyślij cookies z sesją
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!plansResponse.ok) {
        // Jeśli 401, użytkownik nie jest zalogowany
        if (plansResponse.status === 401) {
          throw new Error("Sesja wygasła. Zaloguj się ponownie.");
        }

        throw new Error("Nie udało się sprawdzić liczby planów");
      }

      const plansData = await plansResponse.json();

      // Sprawdź limit 7 planów
      if (plansData.items && plansData.items.length >= 7) {
        throw new Error("Osiągnięto limit 7 aktywnych planów treningowych. Usuń nieaktywny plan aby stworzyć nowy.");
      }

      // 2. POST /api/plans z całym planem (bulk create)
      const response = await fetch("/api/plans", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        // Obsługa różnych kodów błędów
        const errorData = await response.json();

        if (response.status === 401) {
          throw new Error("Sesja wygasła. Zaloguj się ponownie.");
        }

        if (response.status === 403) {
          // Limit planów przekroczony (obsługa z API)
          throw new Error(
            errorData.error ||
              "Osiągnięto limit 7 aktywnych planów treningowych. Usuń nieaktywny plan aby stworzyć nowy."
          );
        }

        if (response.status === 404) {
          // Jedno lub więcej ćwiczeń nie istnieje
          throw new Error(errorData.error || "Jedno lub więcej wybranych ćwiczeń nie istnieje. Odśwież listę ćwiczeń.");
        }

        if (response.status === 400 || response.status === 422) {
          // Błędy walidacji
          if (errorData.details) {
            // Formatuj szczegóły błędów do jednego komunikatu
            const errorMessages = Object.entries(errorData.details)
              .map(([field, messages]) => {
                if (Array.isArray(messages)) {
                  return `${field}: ${messages.join(", ")}`;
                }
                return `${field}: ${messages}`;
              })
              .join("; ");

            throw new Error(`Błędy walidacji: ${errorMessages}`);
          }

          throw new Error(errorData.error || "Sprawdź poprawność wypełnionych pól");
        }

        if (response.status === 500) {
          throw new Error("Wystąpił błąd serwera. Spróbuj ponownie.");
        }

        throw new Error(errorData.error || "Nie udało się zapisać planu");
      }

      const plan = await response.json();
      return plan as TrainingPlanDTO;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nieznany błąd";
      setError(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitPlan, isSubmitting, error, clearError };
}
