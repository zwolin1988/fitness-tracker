import type { ExerciseTemplate } from "@/types";

/**
 * Mock data - katalog dostępnych ćwiczeń
 * Użytkownik wybiera z tych szablonów podczas tworzenia treningu
 */

export const mockExerciseTemplates: ExerciseTemplate[] = [
  // Strength - Klatka piersiowa
  {
    id: "template-1",
    name: "Wyciskanie sztangi leżąc",
    description: "Podstawowe ćwiczenie na klatkę piersiową",
    category: "strength",
    muscleGroups: ["chest", "triceps", "shoulders"],
    equipment: ["barbell", "bench"],
    difficulty: "beginner",
    instructions:
      "Połóż się na ławce, chwyć sztangę nieco szerzej niż szerokość barków. Opuść sztangę do klatki, następnie wypchnij ją w górę.",
  },
  {
    id: "template-2",
    name: "Wyciskanie hantli leżąc",
    description: "Alternatywa dla wyciskania sztangi",
    category: "strength",
    muscleGroups: ["chest", "triceps", "shoulders"],
    equipment: ["dumbbells", "bench"],
    difficulty: "beginner",
  },
  {
    id: "template-3",
    name: "Rozpiętki hantlami",
    description: "Izolacja klatki piersiowej",
    category: "strength",
    muscleGroups: ["chest"],
    equipment: ["dumbbells", "bench"],
    difficulty: "intermediate",
  },

  // Strength - Plecy
  {
    id: "template-4",
    name: "Wiosłowanie sztangą",
    description: "Podstawowe ćwiczenie na plecy",
    category: "strength",
    muscleGroups: ["back", "biceps"],
    equipment: ["barbell"],
    difficulty: "intermediate",
  },
  {
    id: "template-5",
    name: "Podciąganie",
    description: "Ćwiczenie z własną masą ciała",
    category: "strength",
    muscleGroups: ["back", "biceps"],
    equipment: ["pull-up-bar"],
    difficulty: "intermediate",
  },
  {
    id: "template-6",
    name: "Martwy ciąg",
    description: "Kompleksowe ćwiczenie siłowe",
    category: "strength",
    muscleGroups: ["back", "legs", "core"],
    equipment: ["barbell"],
    difficulty: "advanced",
    instructions:
      "Stań przy sztandze, pochyl się i chwyć ją. Prostuj nogi i tułów jednocześnie, utrzymując plecy proste.",
  },

  // Strength - Nogi
  {
    id: "template-7",
    name: "Przysiad ze sztangą",
    description: "Król ćwiczeń na nogi",
    category: "strength",
    muscleGroups: ["legs", "glutes", "core"],
    equipment: ["barbell", "squat-rack"],
    difficulty: "intermediate",
  },
  {
    id: "template-8",
    name: "Wykroki z hantlami",
    description: "Ćwiczenie funkcjonalne na nogi",
    category: "strength",
    muscleGroups: ["legs", "glutes"],
    equipment: ["dumbbells"],
    difficulty: "beginner",
  },
  {
    id: "template-9",
    name: "Wypychanie nóg",
    description: "Ćwiczenie maszynowe na nogi",
    category: "strength",
    muscleGroups: ["legs", "glutes"],
    equipment: ["leg-press-machine"],
    difficulty: "beginner",
  },

  // Strength - Ramiona
  {
    id: "template-10",
    name: "Wyciskanie hantli nad głowę",
    description: "Ćwiczenie na barki",
    category: "strength",
    muscleGroups: ["shoulders", "triceps"],
    equipment: ["dumbbells"],
    difficulty: "beginner",
  },
  {
    id: "template-11",
    name: "Uginanie ramion ze sztangą",
    description: "Podstawowe ćwiczenie na biceps",
    category: "strength",
    muscleGroups: ["biceps"],
    equipment: ["barbell"],
    difficulty: "beginner",
  },
  {
    id: "template-12",
    name: "Pompki na poręczach",
    description: "Ćwiczenie na triceps",
    category: "strength",
    muscleGroups: ["triceps", "chest"],
    equipment: ["dip-bars"],
    difficulty: "intermediate",
  },

  // Cardio
  {
    id: "template-13",
    name: "Bieg",
    description: "Bieg na świeżym powietrzu lub bieżni",
    category: "cardio",
    muscleGroups: ["legs", "cardio"],
    equipment: [],
    difficulty: "beginner",
  },
  {
    id: "template-14",
    name: "Rower",
    description: "Jazda na rowerze stacjonarnym lub szosowym",
    category: "cardio",
    muscleGroups: ["legs", "cardio"],
    equipment: ["bike"],
    difficulty: "beginner",
  },
  {
    id: "template-15",
    name: "Wioślarz",
    description: "Trening cardio + siła",
    category: "cardio",
    muscleGroups: ["back", "legs", "cardio"],
    equipment: ["rowing-machine"],
    difficulty: "intermediate",
  },

  // Flexibility
  {
    id: "template-16",
    name: "Rozciąganie statyczne",
    description: "Podstawowe rozciąganie całego ciała",
    category: "flexibility",
    muscleGroups: [],
    equipment: [],
    difficulty: "beginner",
  },
  {
    id: "template-17",
    name: "Yoga Flow",
    description: "Dynamiczna sekwencja jogi",
    category: "flexibility",
    muscleGroups: [],
    equipment: ["yoga-mat"],
    difficulty: "intermediate",
  },

  // Sports
  {
    id: "template-18",
    name: "Piłka nożna",
    description: "Mecz lub trening piłkarski",
    category: "sports",
    muscleGroups: ["legs", "cardio"],
    equipment: [],
    difficulty: "intermediate",
  },
  {
    id: "template-19",
    name: "Koszykówka",
    description: "Mecz lub trening koszykówki",
    category: "sports",
    muscleGroups: ["legs", "cardio"],
    equipment: [],
    difficulty: "intermediate",
  },
  {
    id: "template-20",
    name: "Pływanie",
    description: "Trening pływacki",
    category: "sports",
    muscleGroups: ["full-body", "cardio"],
    equipment: [],
    difficulty: "intermediate",
  },
];

/**
 * Pomocnicze funkcje do pracy z szablonami ćwiczeń
 */

export function getExerciseTemplateById(id: string): ExerciseTemplate | undefined {
  return mockExerciseTemplates.find((template) => template.id === id);
}

export function getExerciseTemplatesByCategory(category: ExerciseTemplate["category"]): ExerciseTemplate[] {
  return mockExerciseTemplates.filter((template) => template.category === category);
}

export function getExerciseTemplatesByMuscleGroup(muscleGroup: string): ExerciseTemplate[] {
  return mockExerciseTemplates.filter((template) => template.muscleGroups?.includes(muscleGroup));
}

export function getExerciseTemplatesByDifficulty(difficulty: ExerciseTemplate["difficulty"]): ExerciseTemplate[] {
  return mockExerciseTemplates.filter((template) => template.difficulty === difficulty);
}

export function searchExerciseTemplates(query: string): ExerciseTemplate[] {
  const lowerQuery = query.toLowerCase();
  return mockExerciseTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(lowerQuery) || template.description?.toLowerCase().includes(lowerQuery)
  );
}
