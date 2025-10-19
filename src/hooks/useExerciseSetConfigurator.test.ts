/**
 * Unit tests for useExerciseSetConfigurator hook
 * Tests cover initialization, drag & drop, state management, and edge cases
 */

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import type { ExerciseDTO } from "@/types";

import type { SetFormData } from "@/components/training-plan/types";

import {
  useExerciseSetConfigurator,
  validateSetData,
  createDefaultSet,
  initializeExercisesWithSets,
  useConfigSync,
} from "./useExerciseSetConfigurator";

describe("useExerciseSetConfigurator", () => {
  // Mock data
  const mockExercises: ExerciseDTO[] = [
    {
      id: "ex1",
      name: "Przysiad ze sztangą",
      description: "Podstawowe ćwiczenie siłowe",
      category_id: "cat1",
      icon_svg: null,
      difficulty: "intermediate",
      created_at: "2025-01-01",
    },
    {
      id: "ex2",
      name: "Wyciskanie hantli",
      description: "Ćwiczenie na klatkę piersiową",
      category_id: "cat2",
      icon_svg: null,
      difficulty: "beginner",
      created_at: "2025-01-01",
    },
    {
      id: "ex3",
      name: "Martwy ciąg",
      description: "Ćwiczenie full-body",
      category_id: "cat1",
      icon_svg: null,
      difficulty: "advanced",
      created_at: "2025-01-01",
    },
  ];

  const mockInitialSets = new Map<string, SetFormData[]>([
    [
      "ex1",
      [
        { repetitions: 10, weight: 50, set_order: 0 },
        { repetitions: 8, weight: 55, set_order: 1 },
      ],
    ],
    [
      "ex2",
      [
        { repetitions: 12, weight: 20, set_order: 0 },
        { repetitions: 10, weight: 22.5, set_order: 1 },
        { repetitions: 8, weight: 25, set_order: 2 },
      ],
    ],
  ]);

  describe("Helper Functions", () => {
    describe("validateSetData", () => {
      it("should return true for valid set data", () => {
        const validSets: SetFormData[] = [
          { repetitions: 10, weight: 50, set_order: 0 },
          { repetitions: 8, weight: 55, set_order: 1 },
        ];

        expect(validateSetData(validSets)).toBe(true);
      });

      it("should return false for empty array", () => {
        expect(validateSetData([])).toBe(false);
      });

      it("should return false for null/undefined", () => {
        expect(validateSetData(null as any)).toBe(false);
        expect(validateSetData(undefined as any)).toBe(false);
      });

      it("should return false for repetitions <= 0", () => {
        const invalidSets: SetFormData[] = [{ repetitions: 0, weight: 50, set_order: 0 }];

        expect(validateSetData(invalidSets)).toBe(false);
      });

      it("should return false for repetitions > 999", () => {
        const invalidSets: SetFormData[] = [{ repetitions: 1000, weight: 50, set_order: 0 }];

        expect(validateSetData(invalidSets)).toBe(false);
      });

      it("should return false for negative weight", () => {
        const invalidSets: SetFormData[] = [{ repetitions: 10, weight: -5, set_order: 0 }];

        expect(validateSetData(invalidSets)).toBe(false);
      });

      it("should return false for weight > 999.99", () => {
        const invalidSets: SetFormData[] = [{ repetitions: 10, weight: 1000, set_order: 0 }];

        expect(validateSetData(invalidSets)).toBe(false);
      });

      it("should return false for negative set_order", () => {
        const invalidSets: SetFormData[] = [{ repetitions: 10, weight: 50, set_order: -1 }];

        expect(validateSetData(invalidSets)).toBe(false);
      });

      it("should return false if any set is invalid", () => {
        const mixedSets: SetFormData[] = [
          { repetitions: 10, weight: 50, set_order: 0 },
          { repetitions: 0, weight: 50, set_order: 1 }, // Invalid
          { repetitions: 8, weight: 55, set_order: 2 },
        ];

        expect(validateSetData(mixedSets)).toBe(false);
      });

      it("should accept weight of 0 (bodyweight exercises)", () => {
        const bodyweightSets: SetFormData[] = [{ repetitions: 15, weight: 0, set_order: 0 }];

        expect(validateSetData(bodyweightSets)).toBe(true);
      });
    });

    describe("createDefaultSet", () => {
      it("should create default set with order 0", () => {
        const defaultSet = createDefaultSet();

        expect(defaultSet).toEqual({
          repetitions: 1,
          weight: 2.5,
          set_order: 0,
        });
      });

      it("should create default set with custom order", () => {
        const defaultSet = createDefaultSet(5);

        expect(defaultSet).toEqual({
          repetitions: 1,
          weight: 2.5,
          set_order: 5,
        });
      });
    });

    describe("initializeExercisesWithSets", () => {
      it("should initialize with default sets when no initial sets", () => {
        const result = initializeExercisesWithSets(mockExercises);

        expect(result).toHaveLength(3);
        expect(result[0].exercise.id).toBe("ex1");
        expect(result[0].sets).toEqual([{ repetitions: 1, weight: 2.5, set_order: 0 }]);
        expect(result[0].order).toBe(0);
        expect(result[1].order).toBe(1);
        expect(result[2].order).toBe(2);
      });

      it("should use initial sets when provided and valid", () => {
        const result = initializeExercisesWithSets(mockExercises, mockInitialSets);

        expect(result[0].sets).toEqual(mockInitialSets.get("ex1"));
        expect(result[1].sets).toEqual(mockInitialSets.get("ex2"));
        expect(result[2].sets).toEqual([{ repetitions: 1, weight: 2.5, set_order: 0 }]); // ex3 not in initialSets
      });

      it("should use default sets when initial sets are invalid", () => {
        const invalidSets = new Map<string, SetFormData[]>([
          [
            "ex1",
            [
              { repetitions: -5, weight: 50, set_order: 0 }, // Invalid
            ],
          ],
        ]);

        const result = initializeExercisesWithSets(mockExercises, invalidSets);

        expect(result[0].sets).toEqual([{ repetitions: 1, weight: 2.5, set_order: 0 }]);
      });

      it("should use default sets when initial sets are empty array", () => {
        const emptySets = new Map<string, SetFormData[]>([["ex1", []]]);

        const result = initializeExercisesWithSets(mockExercises, emptySets);

        expect(result[0].sets).toEqual([{ repetitions: 1, weight: 2.5, set_order: 0 }]);
      });

      it("should handle empty exercises array", () => {
        const result = initializeExercisesWithSets([]);

        expect(result).toEqual([]);
      });
    });
  });

  describe("Hook Initialization", () => {
    it("should initialize with exercises and default sets", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      expect(result.current.exercisesWithSets).toHaveLength(3);
      expect(result.current.exercisesWithSets[0].exercise.id).toBe("ex1");
      expect(result.current.exercisesWithSets[0].sets).toEqual([{ repetitions: 1, weight: 2.5, set_order: 0 }]);
    });

    it("should initialize with initial sets when provided", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises, mockInitialSets));

      expect(result.current.exercisesWithSets[0].sets).toEqual(mockInitialSets.get("ex1"));
      expect(result.current.exercisesWithSets[1].sets).toEqual(mockInitialSets.get("ex2"));
    });

    it("should expand first exercise by default", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      expect(result.current.expandedExerciseId).toBe("ex1");
    });

    it("should have no expanded exercise when exercises array is empty", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator([]));

      expect(result.current.expandedExerciseId).toBeNull();
    });

    it("should generate valid config on initialization", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises, mockInitialSets));

      expect(result.current.config).toHaveLength(3);
      expect(result.current.config[0]).toEqual({
        exerciseId: "ex1",
        sets: mockInitialSets.get("ex1"),
      });
    });

    it("should validate as valid when all sets are valid", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises, mockInitialSets));

      expect(result.current.isValid).toBe(true);
    });

    it("should validate as invalid when exercises array is empty", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator([]));

      expect(result.current.isValid).toBe(false);
    });
  });

  describe("handleToggle", () => {
    it("should toggle expanded exercise", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      expect(result.current.expandedExerciseId).toBe("ex1");

      act(() => {
        result.current.handleToggle("ex2");
      });

      expect(result.current.expandedExerciseId).toBe("ex2");
    });

    it("should collapse expanded exercise when toggled again", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      act(() => {
        result.current.handleToggle("ex1");
      });

      expect(result.current.expandedExerciseId).toBeNull();
    });

    it("should allow expanding different exercise", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      act(() => {
        result.current.handleToggle("ex3");
      });

      expect(result.current.expandedExerciseId).toBe("ex3");

      act(() => {
        result.current.handleToggle("ex2");
      });

      expect(result.current.expandedExerciseId).toBe("ex2");
    });
  });

  describe("handleSetsChange", () => {
    it("should update sets for specific exercise", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      const newSets: SetFormData[] = [
        { repetitions: 10, weight: 50, set_order: 0 },
        { repetitions: 8, weight: 55, set_order: 1 },
      ];

      act(() => {
        result.current.handleSetsChange("ex1", newSets);
      });

      expect(result.current.exercisesWithSets[0].sets).toEqual(newSets);
    });

    it("should not affect other exercises", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises, mockInitialSets));

      const newSets: SetFormData[] = [{ repetitions: 15, weight: 60, set_order: 0 }];

      const ex2SetsBefore = result.current.exercisesWithSets[1].sets;

      act(() => {
        result.current.handleSetsChange("ex1", newSets);
      });

      expect(result.current.exercisesWithSets[1].sets).toEqual(ex2SetsBefore);
    });

    it("should update config after sets change", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      const newSets: SetFormData[] = [{ repetitions: 20, weight: 100, set_order: 0 }];

      act(() => {
        result.current.handleSetsChange("ex1", newSets);
      });

      expect(result.current.config[0].sets).toEqual(newSets);
    });

    it("should handle empty sets array (validation happens elsewhere)", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      act(() => {
        result.current.handleSetsChange("ex1", []);
      });

      expect(result.current.exercisesWithSets[0].sets).toEqual([]);
      expect(result.current.isValid).toBe(false);
    });

    it("should preserve order field after sets change", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      const newSets: SetFormData[] = [{ repetitions: 10, weight: 50, set_order: 0 }];

      act(() => {
        result.current.handleSetsChange("ex2", newSets);
      });

      expect(result.current.exercisesWithSets[1].order).toBe(1);
    });
  });

  describe("handleRemoveExercise", () => {
    it("should remove exercise from list", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      expect(result.current.exercisesWithSets).toHaveLength(3);

      act(() => {
        result.current.handleRemoveExercise("ex2");
      });

      expect(result.current.exercisesWithSets).toHaveLength(2);
      expect(result.current.exercisesWithSets.find((e) => e.exercise.id === "ex2")).toBeUndefined();
    });

    it("should recalculate order after removal", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      act(() => {
        result.current.handleRemoveExercise("ex1");
      });

      expect(result.current.exercisesWithSets[0].order).toBe(0); // ex2 should now be order 0
      expect(result.current.exercisesWithSets[1].order).toBe(1); // ex3 should now be order 1
    });

    it("should expand first remaining when expanded exercise is removed", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      expect(result.current.expandedExerciseId).toBe("ex1");

      act(() => {
        result.current.handleRemoveExercise("ex1");
      });

      expect(result.current.expandedExerciseId).toBe("ex2"); // First remaining
    });

    it("should not change expanded state when non-expanded exercise is removed", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      act(() => {
        result.current.handleToggle("ex2");
      });

      expect(result.current.expandedExerciseId).toBe("ex2");

      act(() => {
        result.current.handleRemoveExercise("ex1");
      });

      expect(result.current.expandedExerciseId).toBe("ex2");
    });

    it("should set expanded to null when last exercise is removed", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator([mockExercises[0]]));

      expect(result.current.expandedExerciseId).toBe("ex1");

      act(() => {
        result.current.handleRemoveExercise("ex1");
      });

      expect(result.current.expandedExerciseId).toBeNull();
      expect(result.current.exercisesWithSets).toHaveLength(0);
    });

    it("should call onExerciseRemoved callback when provided", () => {
      const onExerciseRemoved = vi.fn();
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises, undefined, onExerciseRemoved));

      act(() => {
        result.current.handleRemoveExercise("ex1");
      });

      expect(onExerciseRemoved).toHaveBeenCalledTimes(1);
      expect(onExerciseRemoved).toHaveBeenCalledWith("ex1");
    });

    it("should not throw when onExerciseRemoved callback is not provided", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      expect(() => {
        act(() => {
          result.current.handleRemoveExercise("ex1");
        });
      }).not.toThrow();
    });

    it("should update config after removal", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      expect(result.current.config).toHaveLength(3);

      act(() => {
        result.current.handleRemoveExercise("ex2");
      });

      expect(result.current.config).toHaveLength(2);
      expect(result.current.config.find((c) => c.exerciseId === "ex2")).toBeUndefined();
    });

    it("should handle removing multiple exercises sequentially", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      act(() => {
        result.current.handleRemoveExercise("ex1");
      });

      expect(result.current.exercisesWithSets).toHaveLength(2);

      act(() => {
        result.current.handleRemoveExercise("ex3");
      });

      expect(result.current.exercisesWithSets).toHaveLength(1);
      expect(result.current.exercisesWithSets[0].exercise.id).toBe("ex2");
      expect(result.current.exercisesWithSets[0].order).toBe(0);
    });
  });

  describe("handleDragEnd", () => {
    it("should reorder exercises on drag end", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      const dragEvent = {
        active: { id: "ex1" },
        over: { id: "ex3" },
      } as any;

      act(() => {
        result.current.handleDragEnd(dragEvent);
      });

      // ex1 should move to ex3's position
      expect(result.current.exercisesWithSets[0].exercise.id).toBe("ex2");
      expect(result.current.exercisesWithSets[1].exercise.id).toBe("ex3");
      expect(result.current.exercisesWithSets[2].exercise.id).toBe("ex1");
    });

    it("should update order field after reorder", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      const dragEvent = {
        active: { id: "ex1" },
        over: { id: "ex3" },
      } as any;

      act(() => {
        result.current.handleDragEnd(dragEvent);
      });

      expect(result.current.exercisesWithSets[0].order).toBe(0);
      expect(result.current.exercisesWithSets[1].order).toBe(1);
      expect(result.current.exercisesWithSets[2].order).toBe(2);
    });

    it("should not change order when over is null", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      const initialOrder = result.current.exercisesWithSets.map((e) => e.exercise.id);

      const dragEvent = {
        active: { id: "ex1" },
        over: null,
      } as any;

      act(() => {
        result.current.handleDragEnd(dragEvent);
      });

      const finalOrder = result.current.exercisesWithSets.map((e) => e.exercise.id);
      expect(finalOrder).toEqual(initialOrder);
    });

    it("should not change order when active and over are the same", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      const initialOrder = result.current.exercisesWithSets.map((e) => e.exercise.id);

      const dragEvent = {
        active: { id: "ex1" },
        over: { id: "ex1" },
      } as any;

      act(() => {
        result.current.handleDragEnd(dragEvent);
      });

      const finalOrder = result.current.exercisesWithSets.map((e) => e.exercise.id);
      expect(finalOrder).toEqual(initialOrder);
    });

    it("should handle drag from last to first position", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      const dragEvent = {
        active: { id: "ex3" },
        over: { id: "ex1" },
      } as any;

      act(() => {
        result.current.handleDragEnd(dragEvent);
      });

      expect(result.current.exercisesWithSets[0].exercise.id).toBe("ex3");
      expect(result.current.exercisesWithSets[1].exercise.id).toBe("ex1");
      expect(result.current.exercisesWithSets[2].exercise.id).toBe("ex2");
    });

    it("should preserve sets data after reorder", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises, mockInitialSets));

      const ex1SetsBefore = result.current.exercisesWithSets[0].sets;

      const dragEvent = {
        active: { id: "ex1" },
        over: { id: "ex2" },
      } as any;

      act(() => {
        result.current.handleDragEnd(dragEvent);
      });

      const ex1AfterReorder = result.current.exercisesWithSets.find((e) => e.exercise.id === "ex1");
      expect(ex1AfterReorder?.sets).toEqual(ex1SetsBefore);
    });

    it("should update config after reorder", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      const dragEvent = {
        active: { id: "ex1" },
        over: { id: "ex3" },
      } as any;

      act(() => {
        result.current.handleDragEnd(dragEvent);
      });

      expect(result.current.config[0].exerciseId).toBe("ex2");
      expect(result.current.config[1].exerciseId).toBe("ex3");
      expect(result.current.config[2].exerciseId).toBe("ex1");
    });

    it("should handle invalid exercise IDs gracefully", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises));

      const initialOrder = result.current.exercisesWithSets.map((e) => e.exercise.id);

      const dragEvent = {
        active: { id: "invalid-id" },
        over: { id: "ex2" },
      } as any;

      act(() => {
        result.current.handleDragEnd(dragEvent);
      });

      const finalOrder = result.current.exercisesWithSets.map((e) => e.exercise.id);
      expect(finalOrder).toEqual(initialOrder);
    });
  });

  describe("Integration Tests", () => {
    it("should handle full user flow: add sets, reorder, remove", () => {
      const onExerciseRemoved = vi.fn();
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises, undefined, onExerciseRemoved));

      // Initially 3 exercises with default sets
      expect(result.current.exercisesWithSets).toHaveLength(3);
      expect(result.current.expandedExerciseId).toBe("ex1");

      // User adds sets to first exercise
      const newSets: SetFormData[] = [
        { repetitions: 10, weight: 50, set_order: 0 },
        { repetitions: 8, weight: 55, set_order: 1 },
        { repetitions: 6, weight: 60, set_order: 2 },
      ];

      act(() => {
        result.current.handleSetsChange("ex1", newSets);
      });

      expect(result.current.exercisesWithSets[0].sets).toEqual(newSets);

      // User expands second exercise
      act(() => {
        result.current.handleToggle("ex2");
      });

      expect(result.current.expandedExerciseId).toBe("ex2");

      // User reorders: ex3 to first position
      const dragEvent = {
        active: { id: "ex3" },
        over: { id: "ex1" },
      } as any;

      act(() => {
        result.current.handleDragEnd(dragEvent);
      });

      expect(result.current.exercisesWithSets[0].exercise.id).toBe("ex3");
      expect(result.current.exercisesWithSets[1].exercise.id).toBe("ex1");

      // Sets should be preserved
      const ex1AfterReorder = result.current.exercisesWithSets.find((e) => e.exercise.id === "ex1");
      expect(ex1AfterReorder?.sets).toEqual(newSets);

      // User removes middle exercise (ex1)
      act(() => {
        result.current.handleRemoveExercise("ex1");
      });

      expect(result.current.exercisesWithSets).toHaveLength(2);
      expect(onExerciseRemoved).toHaveBeenCalledWith("ex1");

      // Final state: ex3, ex2
      expect(result.current.exercisesWithSets[0].exercise.id).toBe("ex3");
      expect(result.current.exercisesWithSets[1].exercise.id).toBe("ex2");
      expect(result.current.exercisesWithSets[0].order).toBe(0);
      expect(result.current.exercisesWithSets[1].order).toBe(1);
    });

    it("should maintain valid state throughout multiple operations", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises, mockInitialSets));

      expect(result.current.isValid).toBe(true);

      // Add more sets
      act(() => {
        result.current.handleSetsChange("ex3", [{ repetitions: 5, weight: 100, set_order: 0 }]);
      });

      expect(result.current.isValid).toBe(true);

      // Reorder
      act(() => {
        result.current.handleDragEnd({
          active: { id: "ex1" },
          over: { id: "ex2" },
        } as any);
      });

      expect(result.current.isValid).toBe(true);

      // Remove
      act(() => {
        result.current.handleRemoveExercise("ex2");
      });

      expect(result.current.isValid).toBe(true);
    });

    it("should invalidate when sets become invalid", () => {
      const { result } = renderHook(() => useExerciseSetConfigurator(mockExercises, mockInitialSets));

      expect(result.current.isValid).toBe(true);

      // Set invalid data
      act(() => {
        result.current.handleSetsChange("ex1", [{ repetitions: -5, weight: 50, set_order: 0 }]);
      });

      expect(result.current.isValid).toBe(false);
    });
  });

  describe("useConfigSync", () => {
    it("should call onSetsConfigured on mount", () => {
      const onSetsConfigured = vi.fn();
      const config = [{ exerciseId: "ex1", sets: [{ repetitions: 10, weight: 50, set_order: 0 }] }];

      renderHook(() => useConfigSync(config, onSetsConfigured));

      expect(onSetsConfigured).toHaveBeenCalledTimes(1);
      expect(onSetsConfigured).toHaveBeenCalledWith(config);
    });

    it("should call onSetsConfigured when config changes", () => {
      const onSetsConfigured = vi.fn();
      const initialConfig = [{ exerciseId: "ex1", sets: [{ repetitions: 10, weight: 50, set_order: 0 }] }];

      const { rerender } = renderHook(({ config }) => useConfigSync(config, onSetsConfigured), {
        initialProps: { config: initialConfig },
      });

      expect(onSetsConfigured).toHaveBeenCalledTimes(1);

      const newConfig = [{ exerciseId: "ex2", sets: [{ repetitions: 8, weight: 60, set_order: 0 }] }];

      rerender({ config: newConfig });

      expect(onSetsConfigured).toHaveBeenCalledTimes(2);
      expect(onSetsConfigured).toHaveBeenCalledWith(newConfig);
    });

    it("should not call onSetsConfigured when callback reference changes but config is same", () => {
      const onSetsConfigured1 = vi.fn();
      const onSetsConfigured2 = vi.fn();
      const config = [{ exerciseId: "ex1", sets: [{ repetitions: 10, weight: 50, set_order: 0 }] }];

      const { rerender } = renderHook(({ callback }) => useConfigSync(config, callback), {
        initialProps: { callback: onSetsConfigured1 },
      });

      expect(onSetsConfigured1).toHaveBeenCalledTimes(1);

      rerender({ callback: onSetsConfigured2 });

      expect(onSetsConfigured2).toHaveBeenCalledTimes(1);
      expect(onSetsConfigured1).toHaveBeenCalledTimes(1); // Not called again
    });
  });
});
