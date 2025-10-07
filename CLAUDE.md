# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production with SSR
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint with React Compiler plugin
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier

## Tech Stack

- **Astro 5.13.7** - Server-side rendering framework with `output: "server"` mode
- **React 19.1.1** - Interactive UI components (no RSC/Next.js directives)
- **TypeScript 5** - Strict mode with React JSX transform
- **Tailwind CSS 4.1.13** - Utility-first styling with CSS variables and @theme inline blocks
- **Shadcn/ui** - Component library configured for "new-york" style, `rsc: false`
- **Node.js adapter** - Standalone server mode for deployment

## Project Architecture

### Current Structure

- `./src/layouts/Layout.astro` - Main layout with optional navigation, dark mode by default
- `./src/pages/` - File-based routing (dashboard, workouts, goals, progress, auth pages)
- `./src/components/` - Mixed Astro (static) and React (interactive) components
- `./src/components/ui/` - Shadcn/ui components (configured for non-RSC React)
- `./src/models/` - Domain entities (User, Goal, Workout) with barrel exports via `src/models/index.ts`
- `./src/lib/utils.ts` - Utilities (cn() helper for class merging)
- `./src/styles/global.css` - Tailwind 4 with CSS variables, dark mode, and @theme inline
- `./public/` - Static assets

### Missing Infrastructure (Planned)

- `./src/pages/api/` - API endpoints (not yet implemented)
- `./src/middleware/index.ts` - Request/response middleware (not yet implemented)
- `./src/db/` - Database clients and Supabase integration (not yet implemented)

### Path Aliases

- `@/*` → `./src/*` (configured in tsconfig.json)
- Used throughout for clean imports (e.g., `@/components/ui/button`)

## Component Strategy

**When to use Astro (.astro) vs React (.tsx):**

- **Astro components** - Static content, layouts, server-rendered pages (e.g., Navigation.astro, Welcome.astro)
- **React components** - Interactive features requiring client-side state/events
  - Use `client:load` directive to hydrate React components
  - Never use "use client" or other Next.js directives
  - Extract logic into custom hooks in `src/components/hooks`

## API Endpoints

When creating API routes in `src/pages/api/`:

- Use uppercase method names (GET, POST) for endpoint handlers
- Add `export const prerender = false` to disable prerendering
- Use Zod for input validation
- Extract business logic into services in `src/lib/services`
- Access Supabase from `context.locals.supabase` instead of importing directly

## Styling with Tailwind CSS 4

- Uses `@import "tailwindcss"` and `@theme inline` blocks in global.css
- CSS variables for theming with light/dark variants (oklch color space)
- Dark mode: `.dark` class applied to `<html>` element
- Design tokens exposed via CSS custom properties (--background, --foreground, etc.)
- Shadcn/ui configured with `cssVariables: true` and neutral base color

## Type System

- Domain models in `src/models/` with individual files per entity
- Barrel exports via `src/models/index.ts` for clean imports
- Polish language for UI text, English for code/types/comments

### Workout Data Model

The app uses a three-tier structure for workout tracking:

1. **ExerciseTemplate** (`src/models/workout.ts`) - Catalog of available exercises
   - Global library of exercises users can choose from
   - Includes metadata: category, muscle groups, equipment, difficulty, instructions
   - Example: "Przysiad ze sztangą", "Wyciskanie hantli", "Bieg"

2. **Workout** (`src/models/workout.ts`) - User's workout session
   - Represents a single training session
   - Has `startedAt` and `completedAt` timestamps
   - Can be in-progress (`completedAt` is undefined)
   - Contains calculated metrics (duration, calories burned)

3. **WorkoutExercise** (`src/models/workout.ts`) - Exercise performed in a workout
   - Links ExerciseTemplate to a specific Workout
   - Stores actual performance data (sets, reps, weight, distance, etc.)
   - Has `order` field for sequencing exercises in the workout
   - Can track completion status per exercise

### Mock Data (Until Supabase Integration)

Mock data available in `src/lib/mocks/`:
- `exercise-templates.ts` - 20 predefined exercises across all categories
- `workouts.ts` - Sample workout sessions and performed exercises
- Helper functions for querying mock data (by ID, user, status, etc.)
- Import via barrel export: `import { mockExerciseTemplates, getWorkoutById } from "@/lib/mocks"`

## Code Quality

### ESLint Configuration

- ESLint 9 with flat config format
- TypeScript strict and stylistic rules
- React Compiler plugin enabled at error level (`react-compiler/react-compiler: "error"`)
- Accessibility rules via eslint-plugin-jsx-a11y
- Astro-specific linting via eslint-plugin-astro
- Prettier integration

### Pre-commit Hooks

- Husky + lint-staged configured
- Auto-fixes ESLint issues for `.ts`, `.tsx`, `.astro` files
- Auto-formats `.json`, `.css`, `.md` files with Prettier

## React Patterns

- Use functional components with hooks (no class components)
- Never use "use client" directive (this is not Next.js)
- Extract custom hooks to `src/components/hooks`
- Use React.memo() for expensive components
- Use useCallback for event handlers passed to children
- Use useMemo for expensive calculations
- Prefer useTransition for non-urgent updates

## Backend Integration (Planned)

- Supabase for authentication and database
- Use `SupabaseClient` type from `src/db/supabase.client.ts` (not from @supabase/supabase-js)
- Access via `context.locals.supabase` in Astro routes
- Validate data with Zod schemas
