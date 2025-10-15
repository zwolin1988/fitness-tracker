// src/components/training-plan/SetFormList.tsx
// Lista formularzy serii dla pojedynczego ćwiczenia

import { PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { BulkAddSetModal } from "./BulkAddSetModal";
import type { SetFormData, SetFormListProps } from "./types";

/**
 * Lista formularzy serii dla pojedynczego ćwiczenia
 * Format zgodny z designem: formularz na górze, lista read-only poniżej
 */
export function SetFormList({ exerciseId, sets, onSetsChange }: SetFormListProps) {
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [newRepetitions, setNewRepetitions] = useState(10);
  const [newWeight, setNewWeight] = useState(60);

  /**
   * Dodanie nowego seta z formularza
   */
  const handleAddSet = () => {
    const newSet: SetFormData = {
      repetitions: newRepetitions,
      weight: newWeight,
      set_order: sets.length,
    };

    onSetsChange([...sets, newSet]);

    // Reset formularza do domyślnych wartości
    setNewRepetitions(10);
    setNewWeight(60);
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

  /**
   * Obsługa bulk add z modalu
   */
  const handleBulkAddConfirm = (newSets: SetFormData[]) => {
    const updatedSets = [...sets];

    // Dodaj nowe sety z odpowiednimi set_order
    newSets.forEach((set) => {
      updatedSets.push({
        ...set,
        set_order: updatedSets.length,
      });
    });

    onSetsChange(updatedSets);
    setIsBulkAddModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Formularz dodawania nowego seta - NA GÓRZE */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="flex flex-col">
          <label htmlFor={`new-reps-${exerciseId}`} className="mb-1.5 text-sm font-medium text-gray-700">
            Powtórzenia
          </label>
          <Input
            id={`new-reps-${exerciseId}`}
            type="number"
            min={1}
            max={999}
            value={newRepetitions}
            onChange={(e) => setNewRepetitions(parseInt(e.target.value) || 0)}
            placeholder="np. 10"
            className="h-10 bg-white border-gray-300"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor={`new-weight-${exerciseId}`} className="mb-1.5 text-sm font-medium text-gray-700">
            Ciężar (kg)
          </label>
          <Input
            id={`new-weight-${exerciseId}`}
            type="number"
            min={0}
            max={999.99}
            step={2.5}
            value={newWeight}
            onChange={(e) => setNewWeight(parseFloat(e.target.value) || 0)}
            placeholder="np. 60"
            className="h-10 bg-white border-gray-300"
          />
        </div>
        <Button type="button" variant="default" size="default" onClick={handleAddSet}>
          Dodaj
        </Button>
      </div>

      {/* Lista dodanych setów - EDYTOWALNE */}
      {sets.length > 0 && (
        <div className="space-y-2">
          {sets.map((set, index) => {
            const hasRepetitionsError = set.repetitions < 1 || set.repetitions > 999;
            const hasWeightError = set.weight < 0 || set.weight > 999.99;

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
                  {hasRepetitionsError && (
                    <p className="mt-1 text-xs text-red-500">
                      {set.repetitions === 0 || !set.repetitions
                        ? "To pole jest wymagane."
                        : "Wartość musi być między 1 a 999."}
                    </p>
                  )}
                </div>

                <div className="flex flex-col">
                  <Input
                    type="number"
                    min={0}
                    max={999.99}
                    step={2.5}
                    value={set.weight || ""}
                    onChange={(e) => {
                      const updatedSets = [...sets];
                      updatedSets[index] = {
                        ...updatedSets[index],
                        weight: parseFloat(e.target.value) || 0,
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
                      {set.weight < 0 ? "Wartość musi być większa lub równa 0." : "Wartość musi być między 0 a 999.99."}
                    </p>
                  )}
                </div>

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
              </div>
            );
          })}
        </div>
      )}

      {/* Przycisk bulk add - z przerywaną ramką */}
      <div className="border-t border-primary/20 pt-4 dark:border-primary/30">
        <Button
          type="button"
          variant="dashed"
          size="default"
          onClick={() => setIsBulkAddModalOpen(true)}
          className="w-full"
        >
          <PlusCircle className="h-5 w-5" />
          Dodaj serie hurtowo
        </Button>
      </div>

      {/* Bulk Add Modal */}
      <BulkAddSetModal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
        onConfirm={handleBulkAddConfirm}
      />
    </div>
  );
}
