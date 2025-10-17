import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

/**
 * Custom render function that wraps components with common providers
 * Add providers here as needed (e.g., ThemeProvider, QueryClientProvider, etc.)
 */
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  // For now, we don't have any providers, but this structure is ready for them
  // Example with provider:
  // const Wrapper = ({ children }: { children: React.ReactNode }) => (
  //   <ThemeProvider>{children}</ThemeProvider>
  // );

  return render(ui, options);
}

/**
 * Mock Supabase client for testing
 */
export const mockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  })),
};

/**
 * Wait for async operations
 */
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create mock user for testing
 */
export const createMockUser = (overrides = {}) => ({
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
  createdAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Create mock workout for testing
 */
export const createMockWorkout = (overrides = {}) => ({
  id: "test-workout-id",
  userId: "test-user-id",
  name: "Test Workout",
  startedAt: new Date().toISOString(),
  completedAt: undefined,
  ...overrides,
});

// Re-export testing library utilities
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
