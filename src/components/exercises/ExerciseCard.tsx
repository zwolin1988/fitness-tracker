import { memo } from "react";
import type { ExerciseTemplate } from "@/models";
import { DIFFICULTY_LABELS, MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from "@/lib/constants/exercise-labels";

interface ExerciseCardProps {
  exercise: ExerciseTemplate;
  onAddToWorkout?: (exercise: ExerciseTemplate) => void;
}

export const ExerciseCard = memo(function ExerciseCard({ exercise, onAddToWorkout }: ExerciseCardProps) {
  return (
    <article className="exercise-card group border rounded-lg bg-card hover:border-primary hover:shadow-lg transition-all duration-200 overflow-hidden grid grid-rows-[auto_auto_auto_1fr_auto] h-full">
      {/* Header karty - stała wysokość */}
      <div className="p-4 border-b bg-muted/30 min-h-[120px] flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {exercise.name}
          </h3>
          <div className="mt-2 flex-grow">
            {exercise.description && (
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{exercise.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Poziom trudności - stała wysokość */}
      <div className="p-3 border-b bg-background/50 min-h-[50px] flex items-center">
        {exercise.difficulty && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Poziom:</span>
            <span className={`text-xs font-medium px-2 py-1 rounded ${DIFFICULTY_LABELS[exercise.difficulty].class}`}>
              {DIFFICULTY_LABELS[exercise.difficulty].label}
            </span>
          </div>
        )}
      </div>

      {/* Partie mięśniowe i sprzęt - stała wysokość */}
      <div className="p-3 space-y-2 border-b bg-muted/10 min-h-[100px]">
        {/* Partie mięśniowe */}
        {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
          <div>
            <span className="text-xs font-medium text-muted-foreground block mb-1">Partie mięśniowe:</span>
            <div className="flex flex-wrap gap-1">
              {exercise.muscleGroups.map((muscle) => (
                <span key={muscle} className="text-xs bg-primary/5 text-primary px-2 py-0.5 rounded">
                  {MUSCLE_GROUP_LABELS[muscle] || muscle}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sprzęt */}
        {exercise.equipment && exercise.equipment.length > 0 && (
          <div>
            <span className="text-xs font-medium text-muted-foreground block mb-1">Sprzęt:</span>
            <div className="flex flex-wrap gap-1">
              {exercise.equipment.map((item) => (
                <span key={item} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                  {EQUIPMENT_LABELS[item] || item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Instrukcje - elastyczna wysokość */}
      <div className="p-3 flex-grow overflow-hidden">
        {exercise.instructions && (
          <div>
            <span className="text-xs font-medium text-muted-foreground block mb-2">Jak wykonać:</span>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{exercise.instructions}</p>
          </div>
        )}
      </div>

      {/* Footer karty z akcjami - stała wysokość */}
      <div className="p-4 bg-muted/20 min-h-[60px] flex items-center">
        <button
          onClick={() => onAddToWorkout?.(exercise)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 transition-colors"
        >
          <span>➕</span>
          <span>Dodaj do treningu</span>
        </button>
      </div>
    </article>
  );
});
