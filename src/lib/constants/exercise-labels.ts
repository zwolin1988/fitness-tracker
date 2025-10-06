/**
 * Etykiety poziomów trudności ćwiczeń
 */
export const DIFFICULTY_LABELS = {
  beginner: { label: "Początkujący", class: "bg-green-500/10 text-green-500" },
  intermediate: { label: "Średniozaawansowany", class: "bg-yellow-500/10 text-yellow-500" },
  advanced: { label: "Zaawansowany", class: "bg-red-500/10 text-red-500" },
} as const;

/**
 * Etykiety partii mięśniowych
 */
export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: "Klatka piersiowa",
  back: "Plecy",
  shoulders: "Barki",
  biceps: "Biceps",
  triceps: "Triceps",
  legs: "Nogi",
  glutes: "Pośladki",
  core: "Mięśnie brzucha",
  cardio: "Układ krążenia",
  "full-body": "Całe ciało",
};

/**
 * Etykiety sprzętu treningowego
 */
export const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: "Sztanga",
  dumbbells: "Hantle",
  bench: "Ławka",
  "pull-up-bar": "Drążek",
  "squat-rack": "Klatka do przysiadów",
  "leg-press-machine": "Maszyna do wypychania nóg",
  "dip-bars": "Poręcze",
  bike: "Rower",
  "rowing-machine": "Wioślarz",
  "yoga-mat": "Mata do jogi",
};
