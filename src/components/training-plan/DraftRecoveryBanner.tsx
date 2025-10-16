// src/components/training-plan/DraftRecoveryBanner.tsx
// Modal wyświetlany na dole ekranu gdy wykryto draft w localStorage

import { Button } from "@/components/ui/button";

import type { DraftRecoveryBannerProps } from "./types";

/**
 * Modal odzyskiwania draftu - fixed na dole ekranu
 */
export function DraftRecoveryBanner({ draft, onRestore, onDiscard }: DraftRecoveryBannerProps) {
  return (
    <div className="inset-x-0 bottom-0 sm:bottom-4 flex justify-center p-4 ">
      <div className="w-full max-w-lg bg-background-dark/90 dark:bg-background-light/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-white/10 dark:border-black/10">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <p className="text-black font-medium text-center sm:text-left flex-grow">
            Znaleziono niezakończony plan. Przywrócić?
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="default"
              onClick={() => onRestore(draft)}
              className="flex-1 sm:flex-initial h-10 px-5 rounded-lg"
            >
              Przywróć
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onDiscard}
              className="flex-1 sm:flex-initial h-10 px-5 rounded-lg bg-white/10 dark:bg-black/10 dark:text-black hover:bg-white/20 dark:hover:bg-black/20"
            >
              Odrzuć
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
