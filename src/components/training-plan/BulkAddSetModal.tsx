// src/components/training-plan/BulkAddSetModal.tsx
// Modal do bulk add serii

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { BulkAddSetFormData, BulkAddSetModalProps, SetFormData } from "./types";

/**
 * Modal do bulk add serii
 */
export function BulkAddSetModal({ isOpen, onClose, onConfirm }: BulkAddSetModalProps) {
  const [formData, setFormData] = useState<BulkAddSetFormData>({
    count: 3,
    repetitions: 10,
    weight: 0,
  });

  const [errors, setErrors] = useState<Partial<BulkAddSetFormData>>({});

  /**
   * Reset formularza gdy modal się otwiera
   */
  useEffect(() => {
    if (isOpen) {
      setFormData({
        count: 3,
        repetitions: 10,
        weight: 0,
      });
      setErrors({});
    }
  }, [isOpen]);

  /**
   * Walidacja formularza
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<BulkAddSetFormData> = {};

    if (formData.count < 1 || formData.count > 10) {
      newErrors.count = 1;
    }

    if (formData.repetitions < 1) {
      newErrors.repetitions = 1;
    }

    if (formData.weight < 0 || formData.weight > 999.99) {
      newErrors.weight = 1;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Obsługa zmiany wartości
   */
  const handleChange = (field: keyof BulkAddSetFormData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({ ...prev, [field]: numValue }));

    // Clear error dla tego pola
    setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [field]: _, ...newErrors } = prev;
      return newErrors;
    });
  };

  /**
   * Obsługa potwierdzenia
   */
  const handleConfirm = () => {
    if (!validateForm()) {
      return;
    }

    // Generuj sety
    const newSets: SetFormData[] = Array.from({ length: formData.count }, (_, index) => ({
      repetitions: formData.repetitions,
      weight: formData.weight,
      set_order: index, // Będzie zaktualizowane przez parent
    }));

    onConfirm(newSets);
  };

  /**
   * Preview text
   */
  const getPreviewText = (): string => {
    const { count, repetitions, weight } = formData;

    if (count === 1) {
      return `Zostanie dodana 1 seria: ${repetitions} powtórzeń po ${weight} kg`;
    }

    return `Zostanie dodanych ${count} serii: ${count}×${repetitions} po ${weight} kg`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }} modal>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj wiele serii</DialogTitle>
          <DialogDescription>Dodaj kilka serii z tymi samymi parametrami za jednym razem.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Liczba setów */}
          <div className="space-y-2">
            <Label htmlFor="bulk-count">
              Liczba serii <span className="text-destructive">*</span>
            </Label>
            <Input
              id="bulk-count"
              type="number"
              min={1}
              max={10}
              step={1}
              value={formData.count}
              onChange={(e) => handleChange("count", e.target.value)}
              className={errors.count ? "border-destructive" : ""}
            />
            {errors.count && <p className="text-sm text-destructive">Liczba serii musi być między 1 a 10</p>}
          </div>

          {/* Powtórzenia */}
          <div className="space-y-2">
            <Label htmlFor="bulk-repetitions">
              Powtórzenia <span className="text-destructive">*</span>
            </Label>
            <Input
              id="bulk-repetitions"
              type="number"
              min={1}
              max={999}
              step={1}
              value={formData.repetitions}
              onChange={(e) => handleChange("repetitions", e.target.value)}
              className={errors.repetitions ? "border-destructive" : ""}
            />
            {errors.repetitions && <p className="text-sm text-destructive">Powtórzenia muszą być większe niż 0</p>}
          </div>

          {/* Ciężar */}
          <div className="space-y-2">
            <Label htmlFor="bulk-weight">Ciężar (kg)</Label>
            <Input
              id="bulk-weight"
              type="number"
              min={0}
              max={999.99}
              step={2.5}
              value={formData.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              className={errors.weight ? "border-destructive" : ""}
            />
            {errors.weight && <p className="text-sm text-destructive">Ciężar musi być między 0 a 999.99 kg</p>}
          </div>

          {/* Preview */}
          <div className="rounded-lg border bg-muted p-3">
            <p className="text-sm font-medium">{getPreviewText()}</p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Dodaj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
