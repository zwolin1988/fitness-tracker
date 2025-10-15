// src/components/training-plan/PlanBasicsForm.tsx
// Formularz podstawowych informacji o planie (krok 1)

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { PlanBasicsFormData, PlanBasicsFormErrors, PlanBasicsFormProps, PlanGoal } from "./types";

const GOAL_OPTIONS: { value: PlanGoal; label: string }[] = [
  { value: "strength", label: "Siła" },
  { value: "muscle_mass", label: "Masa mięśniowa" },
  { value: "endurance", label: "Wytrzymałość" },
  { value: "general_fitness", label: "Ogólna sprawność" },
];

/**
 * Formularz podstawowych informacji o planie
 */
export function PlanBasicsForm({ initialData, onSubmit, onCancel }: PlanBasicsFormProps) {
  const [formData, setFormData] = useState<PlanBasicsFormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    goal: initialData?.goal,
  });

  const [errors, setErrors] = useState<PlanBasicsFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /**
   * Aktualizacja formData gdy initialData się zmienia
   */
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        goal: initialData.goal,
      });
    }
  }, [initialData]);

  /**
   * Walidacja pola nazwa
   */
  const validateName = (name: string): string | undefined => {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return "Nazwa planu jest wymagana";
    }

    if (trimmedName.length < 3) {
      return "Nazwa musi mieć co najmniej 3 znaki";
    }

    if (trimmedName.length > 100) {
      return "Nazwa nie może przekraczać 100 znaków";
    }

    return undefined;
  };

  /**
   * Walidacja pola opis
   */
  const validateDescription = (description: string): string | undefined => {
    if (description.length > 500) {
      return "Opis nie może przekraczać 500 znaków";
    }

    return undefined;
  };

  /**
   * Walidacja całego formularza
   */
  const validateForm = (): boolean => {
    const newErrors: PlanBasicsFormErrors = {
      name: validateName(formData.name),
      description: validateDescription(formData.description || ""),
    };

    setErrors(newErrors);

    return !newErrors.name && !newErrors.description;
  };

  /**
   * Obsługa zmiany nazwy
   */
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => ({ ...prev, name: newName }));

    // Walidacja na bieżąco jeśli pole było już dotknięte
    if (touched.name) {
      setErrors((prev) => ({
        ...prev,
        name: validateName(newName),
      }));
    }
  };

  /**
   * Obsługa zmiany opisu
   */
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setFormData((prev) => ({ ...prev, description: newDescription }));

    // Walidacja na bieżąco jeśli pole było już dotknięte
    if (touched.description) {
      setErrors((prev) => ({
        ...prev,
        description: validateDescription(newDescription),
      }));
    }
  };

  /**
   * Obsługa zmiany celu
   */
  const handleGoalChange = (value: string) => {
    setFormData((prev) => ({ ...prev, goal: value as PlanGoal }));
  };

  /**
   * Obsługa blur (oznaczenie pola jako dotknięte)
   */
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Walidacja pola przy blur
    if (field === "name") {
      setErrors((prev) => ({
        ...prev,
        name: validateName(formData.name),
      }));
    } else if (field === "description") {
      setErrors((prev) => ({
        ...prev,
        description: validateDescription(formData.description || ""),
      }));
    }
  };

  /**
   * Obsługa submit formularza
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Oznacz wszystkie pola jako dotknięte
    setTouched({ name: true, description: true });

    // Waliduj formularz
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 pb-24">
        {/* Nazwa planu */}
        <div className="space-y-2">
          <Label htmlFor="plan-name" className="font-medium text-foreground">
            Nazwa planu <span className="text-primary">*</span>
          </Label>
          <Input
            id="plan-name"
            type="text"
            placeholder="np. Trening siłowy górnej partii"
            value={formData.name}
            onChange={handleNameChange}
            onBlur={() => handleBlur("name")}
            className={`h-12 ${errors.name && touched.name ? "border-destructive" : ""}`}
            aria-invalid={errors.name && touched.name ? "true" : "false"}
            aria-describedby={errors.name && touched.name ? "name-error" : undefined}
          />
          {errors.name && touched.name && (
            <p id="name-error" className="text-sm text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        {/* Opis */}
        <div className="space-y-2">
          <Label htmlFor="plan-description" className="font-medium text-foreground">
            Opis (Opcjonalny)
          </Label>
          <Textarea
            id="plan-description"
            placeholder="Krótki opis Twojego planu treningowego..."
            value={formData.description}
            onChange={handleDescriptionChange}
            onBlur={() => handleBlur("description")}
            rows={4}
            className={`resize-none ${errors.description && touched.description ? "border-destructive" : ""}`}
            aria-invalid={errors.description && touched.description ? "true" : "false"}
            aria-describedby={errors.description && touched.description ? "description-error" : undefined}
          />
          {errors.description && touched.description && (
            <p id="description-error" className="text-sm text-destructive">
              {errors.description}
            </p>
          )}
        </div>

        {/* Cel treningu */}
        <fieldset className="space-y-3">
          <legend className="font-medium text-foreground">Cel treningowy</legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {GOAL_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-center justify-center h-11 px-3 rounded-lg text-sm font-medium border cursor-pointer transition-colors ${
                  formData.goal === option.value
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                <input
                  type="radio"
                  name="training-goal"
                  value={option.value}
                  checked={formData.goal === option.value}
                  onChange={(e) => handleGoalChange(e.target.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      </form>

      {/* Footer - sticky bottom (jak w kroku 2 i 3) */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-background py-4">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 sm:px-6">
          <Button type="button" variant="secondary" size="lg" onClick={onCancel}>
            Anuluj
          </Button>
          <Button type="submit" variant="default" size="lg" disabled={!!errors.name} onClick={handleSubmit}>
            Dalej
          </Button>
        </div>
      </footer>
    </>
  );
}
