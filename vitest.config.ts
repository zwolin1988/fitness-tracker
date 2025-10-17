import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment setup
    environment: "jsdom",
    globals: true,

    // Setup files
    setupFiles: ["./src/test/setup.ts"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData/",
        "dist/",
        ".astro/",
        "coverage/",
      ],
      thresholds: {
        lines: 75,
        functions: 75,
        branches: 75,
        statements: 75,
      },
    },

    // Include patterns
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],

    // Exclude patterns
    exclude: ["node_modules", "dist", ".astro", ".idea", ".git", ".cache", "build"],

    // Reporters
    reporters: ["default", "html"],

    // Test timeout
    testTimeout: 10000,

    // Retry failed tests
    retry: 0,

    // Watch mode options
    watch: false,

    // UI configuration
    ui: true,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
