import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest matchers with jest-dom
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();
} as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  disconnect = vi.fn();
  observe = vi.fn();
  unobserve = vi.fn();
} as unknown as typeof ResizeObserver;

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render") ||
        args[0].includes("Not implemented: HTMLFormElement.prototype.submit"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
