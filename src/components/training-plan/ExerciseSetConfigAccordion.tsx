// src/components/training-plan/ExerciseSetConfigAccordion.tsx
// Collapsible accordion dla pojedynczego ćwiczenia w kroku 3

import { GripVertical, Trash2 } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

import { SetFormList } from "./SetFormList";
import type { ExerciseSetConfigAccordionProps } from "./types";

/**
 * Collapsible accordion dla pojedynczego ćwiczenia
 */
export function ExerciseSetConfigAccordion({
  exercise,
  sets,
  isExpanded,
  onToggle,
  onSetsChange,
  onRemoveExercise,
  dragHandleProps,
}: ExerciseSetConfigAccordionProps) {
  return (
    <Accordion type="single" collapsible value={isExpanded ? exercise.id : ""} onValueChange={onToggle}>
      <AccordionItem value={exercise.id} className="rounded-lg border border-blue-200 bg-blue-100">
        <div className="flex items-center gap-3 px-4">
          {/* Drag Handle */}
          <button
            type="button"
            className="cursor-grab text-gray-500 hover:text-blue-600"
            aria-label="Drag to reorder"
            {...dragHandleProps}
          >
            <GripVertical className="h-5 w-5" />
          </button>

          {/* Accordion Trigger */}
          <AccordionTrigger className="flex-1 hover:no-underline py-4">
            <div className="flex items-center justify-between w-full">
              {/* Nazwa ćwiczenia */}
              <span className="font-semibold text-gray-900">{exercise.name}</span>
            </div>
          </AccordionTrigger>

          {/* Remove Exercise Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveExercise?.();
            }}
            className="h-8 w-8 text-red-600 hover:bg-red-100 hover:text-red-700"
            aria-label={`Usuń ćwiczenie ${exercise.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Accordion Content */}
        <AccordionContent className="border-t border-blue-200 bg-blue-50/50 p-4">
          <SetFormList exerciseId={exercise.id} sets={sets} onSetsChange={onSetsChange} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
