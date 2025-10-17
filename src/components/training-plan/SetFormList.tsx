// src/components/training-plan/SetFormList.tsx
// Lista formularzy serii dla pojedynczego ćwiczenia

import { PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { SetFormData, SetFormListProps } from "./types";

/**
 * Lista formularzy serii dla pojedynczego ćwiczenia
 * Format zgodny z designem: lista edytowalna, bez formularza na górze
 */
export function SetFormList({ exerciseId, sets, onSetsChange }: SetFormListProps) {
  /**
   * Dodanie nowego seta - kopiuje ostatni set lub dodaje z wartościami domyślnymi
   */
  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1];

    // Jeśli ostatnia seria ma uzupełnione dane (powtórzenia > 0 i ciężar > 0), skopiuj je
    const shouldCopy = lastSet && lastSet.repetitions > 0 && lastSet.weight > 0;

    const newSet: SetFormData = {
      repetitions: shouldCopy ? lastSet.repetitions : 1,
      weight: shouldCopy ? lastSet.weight : 2.5,
      set_order: sets.length,
    };

    onSetsChange([...sets, newSet]);
  };

  /**
   * Usunięcie seta
   */
  const handleRemoveSet = (index: number) => {
    const updatedSets = sets.filter((_, i) => i !== index);

    // Aktualizuj set_order po usunięciu
    const reorderedSets = updatedSets.map((set, i) => ({
      ...set,
      set_order: i,
    }));

    onSetsChange(reorderedSets);
  };

  return (
    <div className="space-y-4">
      {/* Lista dodanych setów - EDYTOWALNE */}
      {sets.length > 0 && (
        <div className="space-y-2">
          {sets.map((set, index) => {
            // Walidacja:
            // - Powtórzenia: muszą być > 0 i <= 999
            // - Ciężar: może być >= 0 (w tym 0), ale nie może być pusty (undefined/null)
            const hasRepetitionsError = set.repetitions <= 0 || set.repetitions > 999;
            const hasWeightError =
              set.weight === undefined || set.weight === null || set.weight < 0 || set.weight > 999.99;
            const isFirstSet = index === 0;

            return (
              <div
                key={index}
                className="grid grid-cols-[auto_1fr_1fr_auto] items-start gap-3 rounded bg-background-light dark:bg-background-dark p-2 border border-border"
              >
                <span className="font-semibold text-foreground pt-2 pl-1">{index + 1}</span>

                <div className="flex flex-col">
                  <Input
                    type="number"
                    min={1}
                    max={999}
                    placeholder="Powtórzenia"
                    value={set.repetitions || ""}
                    onChange={(e) => {
                      const updatedSets = [...sets];
                      updatedSets[index] = {
                        ...updatedSets[index],
                        repetitions: parseInt(e.target.value) || 0,
                      };
                      onSetsChange(updatedSets);
                    }}
                    className={`h-9 w-full rounded border p-2 text-sm ${
                      hasRepetitionsError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-primary/20 dark:border-primary/30 focus:border-primary focus:ring-primary"
                    } bg-background text-foreground`}
                  />
                  {hasRepetitionsError && <p className="mt-1 text-xs text-red-500">Wartość musi być między 1 a 999.</p>}
                </div>

                <div className="flex flex-col">
                  <Input
                    type="number"
                    min={0}
                    max={999.99}
                    step={2.5}
                    placeholder="Ciężar (kg)"
                    value={set.weight ?? ""}
                    onChange={(e) => {
                      const updatedSets = [...sets];
                      const value = e.target.value;
                      updatedSets[index] = {
                        ...updatedSets[index],
                        weight: value === "" ? undefined : parseFloat(value),
                      };
                      onSetsChange(updatedSets);
                    }}
                    className={`h-9 w-full rounded border p-2 text-sm ${
                      hasWeightError
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-primary/20 dark:border-primary/30 focus:border-primary focus:ring-primary"
                    } bg-background text-foreground`}
                  />
                  {hasWeightError && (
                    <p className="mt-1 text-xs text-red-500">
                      Wartość musi być od 0 do 999.99 kg (nie może być pusta).
                    </p>
                  )}
                </div>

                {!isFirstSet && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSet(index)}
                    className="h-7 w-7 text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 mt-1"
                    aria-label={`Usuń set ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                {isFirstSet && <div className="w-7" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Przycisk do dodawania serii */}
      <div className="border-t border-primary/20 pt-4 dark:border-primary/30">
        <Button type="button" variant="default" size="default" onClick={handleAddSet} className="w-full">
          <PlusCircle className="h-5 w-5" />
          Dodaj serię
        </Button>
      </div>
    </div>
  );
}
