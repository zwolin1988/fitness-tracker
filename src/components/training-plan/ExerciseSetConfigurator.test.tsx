/**
 * Integration tests for ExerciseSetConfigurator component
 * Tests cover UI rendering, drag & drop integration, and user interactions
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";

import type { ExerciseDTO } from "@/types";

import type { SetFormData } from "./types";
import { ExerciseSetConfigurator } from "./ExerciseSetConfigurator";

// Mock @dnd-kit modules
vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-context">{children}</div>,
  closestCenter: vi.fn(),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ""),
    },
  },
}));

// Mock child components to simplify tests
vi.mock("./ExerciseSetConfigAccordion", () => ({
  ExerciseSetConfigAccordion: ({
    exercise,
    sets,
    isExpanded,
    onToggle,
    onSetsChange,
    onRemoveExercise,
  }: {
    exercise: ExerciseDTO;
    sets: SetFormData[];
    isExpanded: boolean;
    onToggle: () => void;
    onSetsChange: (sets: SetFormData[]) => void;
    onRemoveExercise: () => void;
  }) => (
    <div data-testid={`exercise-accordion-${exercise.id}`}>
      <button data-testid={`toggle-${exercise.id}`} onClick={onToggle}>
        {exercise.name} {isExpanded ? "(expanded)" : "(collapsed)"}
      </button>
      <div data-testid={`sets-count-${exercise.id}`}>{sets.length} sets</div>
      <button
        data-testid={`add-set-${exercise.id}`}
        onClick={() => onSetsChange([...sets, { repetitions: 10, weight: 50, set_order: sets.length }])}
      >
        Add Set
      </button>
      <button data-testid={`remove-${exercise.id}`} onClick={onRemoveExercise}>
        Remove
      </button>
    </div>
  ),
}));

describe("ExerciseSetConfigurator Component", () => {
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
  ];

  const mockInitialSets = new Map<string, SetFormData[]>([
    [
      "ex1",
      [
        { repetitions: 10, weight: 50, set_order: 0 },
        { repetitions: 8, weight: 55, set_order: 1 },
      ],
    ],
  ]);

  let mockOnSetsConfigured: ReturnType<typeof vi.fn>;
  let mockOnExerciseRemoved: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSetsConfigured = vi.fn();
    mockOnExerciseRemoved = vi.fn();
  });

  describe("Rendering", () => {
    it("should render empty state when no exercises provided", () => {
      render(<ExerciseSetConfigurator exercises={[]} onSetsConfigured={mockOnSetsConfigured} />);

      expect(screen.getByText("Nie wybrano żadnych ćwiczeń")).toBeInTheDocument();
    });

    it("should render all exercises", () => {
      render(<ExerciseSetConfigurator exercises={mockExercises} onSetsConfigured={mockOnSetsConfigured} />);

      expect(screen.getByTestId("exercise-accordion-ex1")).toBeInTheDocument();
      expect(screen.getByTestId("exercise-accordion-ex2")).toBeInTheDocument();
      expect(screen.getByText("Przysiad ze sztangą (expanded)")).toBeInTheDocument();
      expect(screen.getByText("Wyciskanie hantli (collapsed)")).toBeInTheDocument();
    });

    it("should render DndContext and SortableContext", () => {
      render(<ExerciseSetConfigurator exercises={mockExercises} onSetsConfigured={mockOnSetsConfigured} />);

      expect(screen.getByTestId("dnd-context")).toBeInTheDocument();
      expect(screen.getByTestId("sortable-context")).toBeInTheDocument();
    });

    it("should render with initial sets", () => {
      render(
        <ExerciseSetConfigurator
          exercises={mockExercises}
          initialSets={mockInitialSets}
          onSetsConfigured={mockOnSetsConfigured}
        />
      );

      // ex1 should have 2 sets from initialSets
      expect(screen.getByTestId("sets-count-ex1")).toHaveTextContent("2 sets");
      // ex2 should have 1 default set
      expect(screen.getByTestId("sets-count-ex2")).toHaveTextContent("1 sets");
    });

    it("should expand first exercise by default", () => {
      render(<ExerciseSetConfigurator exercises={mockExercises} onSetsConfigured={mockOnSetsConfigured} />);

      expect(screen.getByText("Przysiad ze sztangą (expanded)")).toBeInTheDocument();
      expect(screen.getByText("Wyciskanie hantli (collapsed)")).toBeInTheDocument();
    });
  });

  describe("Configuration Sync", () => {
    it("should call onSetsConfigured on mount", () => {
      render(<ExerciseSetConfigurator exercises={mockExercises} onSetsConfigured={mockOnSetsConfigured} />);

      expect(mockOnSetsConfigured).toHaveBeenCalled();
      const config = mockOnSetsConfigured.mock.calls[0][0];
      expect(config).toHaveLength(2);
      expect(config[0].exerciseId).toBe("ex1");
      expect(config[1].exerciseId).toBe("ex2");
    });

    it("should call onSetsConfigured when sets change", async () => {
      const user = userEvent.setup();

      render(<ExerciseSetConfigurator exercises={mockExercises} onSetsConfigured={mockOnSetsConfigured} />);

      const initialCallCount = mockOnSetsConfigured.mock.calls.length;

      // Add set to ex1
      await user.click(screen.getByTestId("add-set-ex1"));

      // Should call onSetsConfigured again
      expect(mockOnSetsConfigured.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it("should call onSetsConfigured when exercise is removed", async () => {
      const user = userEvent.setup();

      render(
        <ExerciseSetConfigurator
          exercises={mockExercises}
          onSetsConfigured={mockOnSetsConfigured}
          onExerciseRemoved={mockOnExerciseRemoved}
        />
      );

      const initialCallCount = mockOnSetsConfigured.mock.calls.length;

      // Remove ex1
      await user.click(screen.getByTestId("remove-ex1"));

      // Should call both callbacks
      expect(mockOnExerciseRemoved).toHaveBeenCalledWith("ex1");
      expect(mockOnSetsConfigured.mock.calls.length).toBeGreaterThan(initialCallCount);

      // Config should now have only ex2
      const latestConfig = mockOnSetsConfigured.mock.calls[mockOnSetsConfigured.mock.calls.length - 1][0];
      expect(latestConfig).toHaveLength(1);
      expect(latestConfig[0].exerciseId).toBe("ex2");
    });
  });

  describe("User Interactions", () => {
    it("should toggle expanded state on toggle click", async () => {
      const user = userEvent.setup();

      render(<ExerciseSetConfigurator exercises={mockExercises} onSetsConfigured={mockOnSetsConfigured} />);

      // ex1 is expanded by default
      expect(screen.getByText("Przysiad ze sztangą (expanded)")).toBeInTheDocument();

      // Toggle ex2
      await user.click(screen.getByTestId("toggle-ex2"));

      // ex2 should now be expanded
      expect(screen.getByText("Wyciskanie hantli (expanded)")).toBeInTheDocument();
      // ex1 should be collapsed (but still shows expanded in our mock - this is limitation of mocked child)
    });

    it("should add sets to exercise", async () => {
      const user = userEvent.setup();

      render(<ExerciseSetConfigurator exercises={mockExercises} onSetsConfigured={mockOnSetsConfigured} />);

      // Initially ex1 has 1 set (default)
      expect(screen.getByTestId("sets-count-ex1")).toHaveTextContent("1 sets");

      // Add set
      await user.click(screen.getByTestId("add-set-ex1"));

      // Should now have 2 sets
      expect(screen.getByTestId("sets-count-ex1")).toHaveTextContent("2 sets");
    });

    it("should remove exercise from list", async () => {
      const user = userEvent.setup();

      render(
        <ExerciseSetConfigurator
          exercises={mockExercises}
          onSetsConfigured={mockOnSetsConfigured}
          onExerciseRemoved={mockOnExerciseRemoved}
        />
      );

      // Initially 2 exercises
      expect(screen.getByTestId("exercise-accordion-ex1")).toBeInTheDocument();
      expect(screen.getByTestId("exercise-accordion-ex2")).toBeInTheDocument();

      // Remove ex1
      await user.click(screen.getByTestId("remove-ex1"));

      // ex1 should be removed
      expect(screen.queryByTestId("exercise-accordion-ex1")).not.toBeInTheDocument();
      expect(screen.getByTestId("exercise-accordion-ex2")).toBeInTheDocument();

      // Callback should be called
      expect(mockOnExerciseRemoved).toHaveBeenCalledWith("ex1");
    });

    it("should show empty state when all exercises are removed", async () => {
      const user = userEvent.setup();

      render(
        <ExerciseSetConfigurator
          exercises={mockExercises}
          onSetsConfigured={mockOnSetsConfigured}
          onExerciseRemoved={mockOnExerciseRemoved}
        />
      );

      // Remove all exercises
      await user.click(screen.getByTestId("remove-ex1"));
      await user.click(screen.getByTestId("remove-ex2"));

      // Should show empty state
      expect(screen.getByText("Nie wybrano żadnych ćwiczeń")).toBeInTheDocument();
    });
  });

  describe("Integration with initialSets", () => {
    it("should preserve initial sets when rendering", () => {
      render(
        <ExerciseSetConfigurator
          exercises={mockExercises}
          initialSets={mockInitialSets}
          onSetsConfigured={mockOnSetsConfigured}
        />
      );

      // ex1 should have 2 sets from initialSets
      expect(screen.getByTestId("sets-count-ex1")).toHaveTextContent("2 sets");
    });

    it("should use default sets when initialSets not provided for exercise", () => {
      render(
        <ExerciseSetConfigurator
          exercises={mockExercises}
          initialSets={mockInitialSets}
          onSetsConfigured={mockOnSetsConfigured}
        />
      );

      // ex2 not in initialSets, should have 1 default set
      expect(screen.getByTestId("sets-count-ex2")).toHaveTextContent("1 sets");
    });

    it("should report correct config with initial sets", () => {
      render(
        <ExerciseSetConfigurator
          exercises={mockExercises}
          initialSets={mockInitialSets}
          onSetsConfigured={mockOnSetsConfigured}
        />
      );

      const config = mockOnSetsConfigured.mock.calls[0][0];

      // ex1 should have 2 sets from initialSets
      expect(config[0].exerciseId).toBe("ex1");
      expect(config[0].sets).toHaveLength(2);
      expect(config[0].sets[0]).toEqual({ repetitions: 10, weight: 50, set_order: 0 });

      // ex2 should have 1 default set
      expect(config[1].exerciseId).toBe("ex2");
      expect(config[1].sets).toHaveLength(1);
      expect(config[1].sets[0]).toEqual({ repetitions: 1, weight: 2.5, set_order: 0 });
    });
  });

  describe("Edge Cases", () => {
    it("should handle single exercise", () => {
      render(<ExerciseSetConfigurator exercises={[mockExercises[0]]} onSetsConfigured={mockOnSetsConfigured} />);

      expect(screen.getByTestId("exercise-accordion-ex1")).toBeInTheDocument();
      expect(screen.queryByTestId("exercise-accordion-ex2")).not.toBeInTheDocument();
    });

    it("should handle removing last exercise", async () => {
      const user = userEvent.setup();

      render(
        <ExerciseSetConfigurator
          exercises={[mockExercises[0]]}
          onSetsConfigured={mockOnSetsConfigured}
          onExerciseRemoved={mockOnExerciseRemoved}
        />
      );

      await user.click(screen.getByTestId("remove-ex1"));

      expect(screen.getByText("Nie wybrano żadnych ćwiczeń")).toBeInTheDocument();
      expect(mockOnExerciseRemoved).toHaveBeenCalledWith("ex1");
    });

    it("should not crash when onExerciseRemoved is not provided", async () => {
      const user = userEvent.setup();

      render(<ExerciseSetConfigurator exercises={mockExercises} onSetsConfigured={mockOnSetsConfigured} />);

      await user.click(screen.getByTestId("remove-ex1"));

      // Should not crash, just remove the exercise
      expect(screen.queryByTestId("exercise-accordion-ex1")).not.toBeInTheDocument();
    });

    it("should handle invalid initial sets gracefully", () => {
      const invalidSets = new Map<string, SetFormData[]>([
        [
          "ex1",
          [
            { repetitions: -5, weight: 50, set_order: 0 }, // Invalid
          ],
        ],
      ]);

      render(
        <ExerciseSetConfigurator
          exercises={mockExercises}
          initialSets={invalidSets}
          onSetsConfigured={mockOnSetsConfigured}
        />
      );

      // Should use default set for ex1 (validation fails)
      const config = mockOnSetsConfigured.mock.calls[0][0];
      expect(config[0].sets).toEqual([{ repetitions: 1, weight: 2.5, set_order: 0 }]);
    });
  });
});
