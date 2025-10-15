// src/components/training-plan/StepIndicator.tsx
// Komponent wskaźnika postępu wizarda - progress bar

import { memo } from "react";

import type { StepIndicatorProps } from "./types";

/**
 * Komponent wyświetlający wskaźnik postępu wizarda jako progress bar
 */
export const StepIndicator = memo(function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const progressPercentage = (currentStep / steps) * 100;

  return (
    <div className="mb-8 w-full">
      <p className="mb-2 text-sm font-medium text-gray-600">
        Krok {currentStep} z {steps}
      </p>
      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
});
