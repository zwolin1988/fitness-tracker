import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import eslintPluginAstro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginReact from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

// File path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

const baseConfig = tseslint.config({
  extends: [eslint.configs.recommended, tseslint.configs.strict, tseslint.configs.stylistic],
  rules: {
    "no-console": "warn",
    "no-unused-vars": "off",
  },
});

const jsxA11yConfig = tseslint.config({
  files: ["**/*.{js,jsx,ts,tsx}"],
  extends: [jsxA11y.flatConfigs.recommended],
  languageOptions: {
    ...jsxA11y.flatConfigs.recommended.languageOptions,
  },
  rules: {
    ...jsxA11y.flatConfigs.recommended.rules,
  },
});

const reactConfig = tseslint.config({
  files: ["**/*.{js,jsx,ts,tsx}"],
  extends: [pluginReact.configs.flat.recommended],
  languageOptions: {
    ...pluginReact.configs.flat.recommended.languageOptions,
    globals: {
      window: true,
      document: true,
    },
  },
  plugins: {
    "react-hooks": eslintPluginReactHooks,
    "react-compiler": reactCompiler,
  },
  settings: { react: { version: "detect" } },
  rules: {
    ...eslintPluginReactHooks.configs.recommended.rules,
    "react/react-in-jsx-scope": "off",
    "react-compiler/react-compiler": "error",
  },
});

// E2E test configuration
const e2eConfig = tseslint.config({
  files: ["e2e/**/*.ts"],
  rules: {
    "no-console": "off", // Console is useful in E2E tests for debugging
    "react-hooks/rules-of-hooks": "off", // Playwright fixtures are not React hooks
  },
});

// Test files configuration
const testConfig = tseslint.config({
  files: ["**/*.test.ts", "**/*.test.tsx", "src/test/**/*.ts"],
  rules: {
    "no-console": "off", // Console is useful in tests for debugging
    "@typescript-eslint/no-explicit-any": "off", // Allow 'any' in test mocks
    "@typescript-eslint/no-non-null-assertion": "off", // Allow non-null assertions in tests
    "@typescript-eslint/no-empty-function": "off", // Allow empty functions in test mocks
  },
});

// API endpoints and services configuration
const apiConfig = tseslint.config({
  files: ["src/pages/api/**/*.ts", "src/lib/services/**/*.ts", "src/lib/*.ts"],
  rules: {
    "no-console": "off", // Console is useful for server-side logging and debugging utilities
  },
});

// React components that use browser APIs
const componentConfig = tseslint.config({
  files: ["src/components/**/*.tsx"],
  rules: {
    "no-console": "warn", // Allow console but warn in components
  },
});

// Hooks configuration
const hooksConfig = tseslint.config({
  files: ["src/hooks/**/*.ts", "src/hooks/**/*.tsx"],
  rules: {
    "no-console": "warn", // Allow console but warn in hooks
  },
});

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      "html/**",
      "dist/**",
      ".astro/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  baseConfig,
  jsxA11yConfig,
  reactConfig,
  apiConfig,
  componentConfig,
  hooksConfig,
  e2eConfig,
  testConfig,
  eslintPluginAstro.configs["flat/recommended"],
  eslintPluginPrettier
);
