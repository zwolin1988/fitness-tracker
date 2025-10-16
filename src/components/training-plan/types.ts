// src/components/training-plan/types.ts
// ViewModel types for Training Plan Wizard

import type { CategoryDTO, ExerciseDTO, PlanExerciseSetDTO, TrainingPlanDTO } from "@/types";

/**
 * Typ kroku w wizardzie
 */
export type WizardStep = 1 | 2 | 3;

/**
 * Tryb działania wizarda
 */
export type WizardMode = "create" | "edit";

/**
 * Stan wizarda
 */
export interface WizardState {
  mode: WizardMode;
  currentStep: WizardStep;
  completedSteps: WizardStep[];
  basics: PlanBasicsFormData | null;
  selectedExerciseIds: string[];
  setsConfig: Map<string, SetFormData[]>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Dane formularza podstawowych informacji (krok 1)
 */
export interface PlanBasicsFormData {
  name: string;
  description?: string;
  goal?: PlanGoal;
}

/**
 * Cele treningu (opcjonalne)
 */
export type PlanGoal = "strength" | "muscle_mass" | "endurance" | "general_fitness";

/**
 * Błędy walidacji formularza podstaw
 */
export interface PlanBasicsFormErrors {
  name?: string;
  description?: string;
}

/**
 * Dane pojedynczej serii w formularzu
 */
export interface SetFormData {
  id?: string; // Dla edycji - ID istniejącego setu
  repetitions: number;
  weight: number;
  set_order: number;
}

/**
 * Konfiguracja serii dla ćwiczenia
 */
export interface ExerciseSetConfig {
  exerciseId: string;
  sets: SetFormData[];
}

/**
 * Ćwiczenie z przypisanymi seriami (widok dla kroku 3)
 */
export interface ExerciseWithSets {
  exercise: ExerciseDTO;
  sets: SetFormData[];
  order: number; // kolejność w planie
}

/**
 * Draft zapisany w localStorage
 */
export interface PlanDraft {
  step: WizardStep;
  basics?: PlanBasicsFormData;
  selectedExerciseIds?: string[];
  setsConfig?: Record<string, SetFormData[]>; // Map nie jest serializowalne
  timestamp: number;
}

/**
 * Dane formularza bulk add
 */
export interface BulkAddSetFormData {
  count: number;
  repetitions: number;
  weight: number;
}

/**
 * Błędy walidacji setu
 */
export interface SetFormErrors {
  repetitions?: string;
  weight?: string;
}

/**
 * Response z API dla szczegółów planu (GET /api/plans/{id})
 */
export interface TrainingPlanDetailResponse extends TrainingPlanDTO {
  exercises: ExerciseDTO[];
  sets: PlanExerciseSetDTO[];
}

/**
 * Filtrowanie ćwiczeń w katalogu
 */
export interface ExerciseFilters {
  categoryId?: string;
  difficulty?: string;
  searchQuery?: string;
}

/**
 * Props dla głównego komponentu PlanWizard
 */
export interface PlanWizardProps {
  mode: WizardMode;
  planId?: string; // wymagane dla mode='edit'
  initialData?: TrainingPlanDetailResponse; // dla edycji
  initialStep?: WizardStep; // opcjonalnie z query params
  onSuccess?: () => void; // callback po udanym zapisie
  onCancel?: () => void; // callback po anulowaniu
}

/**
 * Props dla PlanWizardDialog
 */
export interface PlanWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Props dla StepIndicator
 */
export interface StepIndicatorProps {
  steps: number; // zawsze 3
  currentStep: number; // 1, 2, lub 3
  completedSteps: number[]; // np. [1] jeśli krok 1 ukończony
}

/**
 * Props dla PlanBasicsForm
 */
export interface PlanBasicsFormProps {
  initialData?: PlanBasicsFormData;
  onSubmit: (data: PlanBasicsFormData) => void;
  onCancel: () => void;
}

/**
 * Props dla ExerciseSelector
 */
export interface ExerciseSelectorProps {
  availableExercises: ExerciseDTO[];
  categories: CategoryDTO[];
  selectedExerciseIds: string[];
  onSelectionChange: (exerciseIds: string[]) => void;
}

/**
 * Props dla ExerciseSetConfigurator
 */
export interface ExerciseSetConfiguratorProps {
  exercises: ExerciseDTO[];
  initialSets?: Map<string, SetFormData[]>; // dla edycji
  onSetsConfigured: (config: ExerciseSetConfig[]) => void;
  onExerciseRemoved?: (exerciseId: string) => void; // callback po usunięciu ćwiczenia
}

/**
 * Props dla ExerciseSetConfigAccordion
 */
export interface ExerciseSetConfigAccordionProps {
  exercise: ExerciseDTO;
  sets: SetFormData[];
  isExpanded: boolean;
  onToggle: () => void;
  onSetsChange: (sets: SetFormData[]) => void;
  onRemoveExercise?: () => void; // callback po kliknięciu przycisku usuń ćwiczenie
  dragHandleProps?: Record<string, unknown>; // listeners z useSortable
}

/**
 * Props dla SetFormList
 */
export interface SetFormListProps {
  exerciseId: string;
  sets: SetFormData[];
  onSetsChange: (sets: SetFormData[]) => void;
}

/**
 * Props dla BulkAddSetModal
 */
export interface BulkAddSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sets: SetFormData[]) => void;
}

/**
 * Props dla DraftRecoveryBanner
 */
export interface DraftRecoveryBannerProps {
  draft: PlanDraft;
  onRestore: (draft: PlanDraft) => void;
  onDiscard: () => void;
}

/**
 * Props dla ExerciseCatalog (reused component)
 */
export interface ExerciseCatalogProps {
  exercises: ExerciseDTO[];
  categories: CategoryDTO[];
  multiSelect?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (exerciseIds: string[]) => void;
  onExerciseClick?: (exercise: ExerciseDTO) => void;
}
