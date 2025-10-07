import type { ExerciseTemplate } from "@/models";

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
    description: "Alternatywa dla wyciskania sztangi, pozwala na większy zakres ruchu",
    category: "strength",
    muscleGroups: ["chest", "triceps", "shoulders"],
    equipment: ["dumbbells", "bench"],
    difficulty: "beginner",
    instructions:
      "Połóż się na ławce z hantlami w rękach. Opuść hantle kontrolowanym ruchem do boków klatki, następnie wypchnij je w górę.",
  },
  {
    id: "template-3",
    name: "Rozpiętki hantlami",
    description: "Izolacja klatki piersiowej z naciskiem na rozciągnięcie mięśni",
    category: "strength",
    muscleGroups: ["chest"],
    equipment: ["dumbbells", "bench"],
    difficulty: "intermediate",
    instructions:
      "Leżąc na ławce, rozłóż ramiona w bok z lekko zgiętymi łokciami. Opuść hantle w bok, następnie ściągnij je nad klatką.",
  },

  // Strength - Plecy
  {
    id: "template-4",
    name: "Wiosłowanie sztangą",
    description: "Podstawowe ćwiczenie na plecy budujące szerokość i grubość",
    category: "strength",
    muscleGroups: ["back", "biceps"],
    equipment: ["barbell"],
    difficulty: "intermediate",
    instructions:
      "Pochyl się z prostymi plecami, chwyć sztangę. Przyciągnij ją do dolnej części klatki, ściągając łopatki.",
  },
  {
    id: "template-5",
    name: "Podciąganie",
    description: "Ćwiczenie z własną masą ciała na szerokie plecy",
    category: "strength",
    muscleGroups: ["back", "biceps"],
    equipment: ["pull-up-bar"],
    difficulty: "intermediate",
    instructions: "Zwiś na drążku, podciągnij się aż broda znajdzie się nad drążkiem. Opuść się kontrolowanym ruchem.",
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
    description: "Król ćwiczeń na nogi - buduje siłę i masę całej dolnej partii ciała",
    category: "strength",
    muscleGroups: ["legs", "glutes", "core"],
    equipment: ["barbell", "squat-rack"],
    difficulty: "intermediate",
    instructions:
      "Ustaw sztangę na barkach, stopy na szerokość bioder. Opuść się jak gdybyś siadał na krześle, następnie wróć do pozycji wyjściowej.",
  },
  {
    id: "template-8",
    name: "Wykroki z hantlami",
    description: "Ćwiczenie funkcjonalne rozwijające równowagę i siłę nóg",
    category: "strength",
    muscleGroups: ["legs", "glutes"],
    equipment: ["dumbbells"],
    difficulty: "beginner",
    instructions:
      "Trzymając hantle, zrób krok do przodu i opuść się aż oba kolana będą zgięte pod kątem 90°. Wróć do pozycji wyjściowej.",
  },
  {
    id: "template-9",
    name: "Wypychanie nóg",
    description: "Bezpieczne ćwiczenie maszynowe idealne dla początkujących",
    category: "strength",
    muscleGroups: ["legs", "glutes"],
    equipment: ["leg-press-machine"],
    difficulty: "beginner",
    instructions: "Usiądź w maszynie, stopy na płycie. Opuść nogi do klatki, następnie wypchnij płytę do góry.",
  },

  // Strength - Ramiona
  {
    id: "template-10",
    name: "Wyciskanie hantli nad głowę",
    description: "Buduje szerokie barki i stabilizuje mięśnie głębokie",
    category: "strength",
    muscleGroups: ["shoulders", "triceps"],
    equipment: ["dumbbells"],
    difficulty: "beginner",
    instructions: "Stojąc prosto, wypchnij hantle nad głowę w linii prostej. Kontroluj ruch w dół i w górę.",
  },
  {
    id: "template-11",
    name: "Uginanie ramion ze sztangą",
    description: "Klasyczne ćwiczenie budujące obwód ramion",
    category: "strength",
    muscleGroups: ["biceps"],
    equipment: ["barbell"],
    difficulty: "beginner",
    instructions:
      "Trzymając sztangę podchwytem, ugnij ramiona przyciągając sztangę do klatki. Opuść kontrolowanym ruchem.",
  },
  {
    id: "template-12",
    name: "Pompki na poręczach",
    description: "Efektywne ćwiczenie z własną masą ciała na triceps i klatkę",
    category: "strength",
    muscleGroups: ["triceps", "chest"],
    equipment: ["dip-bars"],
    difficulty: "intermediate",
    instructions:
      "Podpierając się na poręczach, opuść ciało aż łokcie będą zgięte pod kątem 90°. Wypchnij się do góry.",
  },

  // Cardio
  {
    id: "template-13",
    name: "Bieg",
    description: "Klasyczny trening cardio poprawiający wytrzymałość i spalający kalorie",
    category: "cardio",
    muscleGroups: ["legs", "cardio"],
    equipment: [],
    difficulty: "beginner",
    instructions:
      "Rozpocznij od rozgrzewki, biegnij w równym tempie odpowiednim dla swojego poziomu. Zakończ chłodzeniem.",
  },
  {
    id: "template-14",
    name: "Rower",
    description: "Przyjazny dla stawów trening cardio rozwijający nogi i wytrzymałość",
    category: "cardio",
    muscleGroups: ["legs", "cardio"],
    equipment: ["bike"],
    difficulty: "beginner",
    instructions:
      "Dostosuj wysokość siodełka, jedź w równym tempie z kontrolą oddechu. Zmieniaj opór dla większego wyzwania.",
  },
  {
    id: "template-15",
    name: "Wioślarz",
    description: "Kompleksowy trening angażujący całe ciało, łączy cardio z siłą",
    category: "cardio",
    muscleGroups: ["back", "legs", "cardio"],
    equipment: ["rowing-machine"],
    difficulty: "intermediate",
    instructions:
      "Pchnij nogami, następnie przeciągnij uchwyt do klatki. Wróć w odwrotnej kolejności - ramiona, tułów, nogi.",
  },

  // Flexibility
  {
    id: "template-16",
    name: "Rozciąganie statyczne",
    description: "Podstawowe rozciąganie poprawiające elastyczność i regenerację",
    category: "flexibility",
    muscleGroups: [],
    equipment: [],
    difficulty: "beginner",
    instructions:
      "Utrzymuj każdą pozycję przez 15-30 sekund. Oddychaj głęboko i nie forsuj. Skup się na głównych grupach mięśniowych.",
  },
  {
    id: "template-17",
    name: "Yoga Flow",
    description: "Dynamiczna sekwencja jogi łącząca oddech z ruchem",
    category: "flexibility",
    muscleGroups: [],
    equipment: ["yoga-mat"],
    difficulty: "intermediate",
    instructions: "Synchronizuj oddech z ruchem. Przechodzenie między pozycjami powinno być płynne i kontrolowane.",
  },

  // Sports
  {
    id: "template-18",
    name: "Piłka nożna",
    description: "Zespołowy sport rozwijający kondycję, koordynację i szybkość",
    category: "sports",
    muscleGroups: ["legs", "cardio"],
    equipment: [],
    difficulty: "intermediate",
    instructions:
      "Rozgrzej się przed grą. Skup się na technice podań, strzałów i kontroli piłki. Pamiętaj o nawodnieniu.",
  },
  {
    id: "template-19",
    name: "Koszykówka",
    description: "Dynamiczny sport rozwijający zwinność, skok i koordynację ręka-oko",
    category: "sports",
    muscleGroups: ["legs", "cardio"],
    equipment: [],
    difficulty: "intermediate",
    instructions: "Ćwicz rzuty, prowadzenie piłki i obronę. Skup się na szybkich zmianach kierunku i skokach.",
  },
  {
    id: "template-20",
    name: "Pływanie",
    description: "Kompleksowy trening całego ciała w wodzie, bezpieczny dla stawów",
    category: "sports",
    muscleGroups: ["full-body", "cardio"],
    equipment: [],
    difficulty: "intermediate",
    instructions: "Ćwicz różne style pływackie. Skup się na prawidłowej technice oddechu i koordynacji ruchów.",
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
