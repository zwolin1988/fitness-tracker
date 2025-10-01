# AI Rules for Fitness Tracker

A modern fitness tracking application built with Astro, React, and TypeScript. Features workout tracking, goal setting, and progress monitoring with a server-side rendered architecture.

## Tech Stack

- **Astro 5.13.7** - Server-side rendering framework with hybrid output mode
- **React 19.1.1** - Interactive UI components 
- **TypeScript 5** - Type safety
- **Tailwind CSS 4.1.13** - Utility-first styling with CSS variables
- **Shadcn/ui** - Component library (New York style, no RSC)
- **Node.js adapter** - Standalone server mode

## Project Architecture

### Current Structure
- `./src/layouts/` - Astro layouts (`Layout.astro` is the main template)
- `./src/pages/` - File-based routing (dashboard, workouts, goals, progress, auth)
- `./src/components/` - Mixed Astro (static) and React (interactive) components
- `./src/components/ui/` - Shadcn/ui components (configured for non-RSC React)
- `./src/types/` - Domain entities (User, Goal, Workout) with barrel exports
- `./src/lib/` - Utilities (`utils.ts` for cn() helper)
- `./src/styles/global.css` - Tailwind 4 with CSS variables and dark mode
- `./public/` - Static assets

### Missing Infrastructure (Planned)
- `./src/pages/api/` - API endpoints (not yet implemented)
- `./src/middleware/index.ts` - Request/response middleware (not yet implemented) 
- `./src/db/` - Database clients and Supabase integration (not yet implemented)

## Key Development Patterns

### Component Strategy
- **Static content**: Use `.astro` components (see `Navigation.astro`, `Welcome.astro`)
- **Interactive features**: Use React `.tsx` components with `client:load` directive
- **Layouts**: Single `Layout.astro` with optional navigation and dark mode by default

### Styling Approach
- **CSS Variables**: Custom properties for theming with light/dark variants
- **Tailwind 4**: Uses `@import "tailwindcss"` and `@theme inline` blocks
- **Path aliases**: `@/` points to `./src/` (configured in `tsconfig.json`)
- **Design system**: Shadcn/ui configured for "new-york" style without RSC

## Development Workflow

### Build & Scripts
- `npm run dev` - Development server (port 3000)
- `npm run build` - Production build with SSR
- `npm run lint` - ESLint with React Compiler plugin
- `npm run format` - Prettier formatting

### Quality Tools
- **ESLint 9**: Flat config with TypeScript, React, Astro, and a11y rules
- **React Compiler**: Enabled as error-level rule for optimization
- **Husky + lint-staged**: Pre-commit hooks for code quality
- **TypeScript**: Strict mode with React JSX transform

## Type System

### Domain Models
- Located in `src/types/` with individual files per entity
- Barrel exports via `src/types/index.ts` for clean imports
- Current entities: `User`, `Goal`, `Workout` (basic interfaces)
- Polish language used in UI text, English for code/types

## Frontend

### General Guidelines

- Use Astro components (.astro) for static content and layout
- Implement framework components in React only when interactivity is needed

### Guidelines for Styling

#### Tailwind

- Use the @layer directive to organize styles into components, utilities, and base layers
- Use arbitrary values with square brackets (e.g., w-[123px]) for precise one-off designs
- Implement the Tailwind configuration file for customizing theme, plugins, and variants
- Leverage the theme() function in CSS for accessing Tailwind theme values
- Implement dark mode with the dark: variant
- Use responsive variants (sm:, md:, lg:, etc.) for adaptive designs
- Leverage state variants (hover:, focus-visible:, active:, etc.) for interactive elements

### Guidelines for Accessibility

#### ARIA Best Practices

- Use ARIA landmarks to identify regions of the page (main, navigation, search, etc.)
- Apply appropriate ARIA roles to custom interface elements that lack semantic HTML equivalents
- Set aria-expanded and aria-controls for expandable content like accordions and dropdowns
- Use aria-live regions with appropriate politeness settings for dynamic content updates
- Implement aria-hidden to hide decorative or duplicative content from screen readers
- Apply aria-label or aria-labelledby for elements without visible text labels
- Use aria-describedby to associate descriptive text with form inputs or complex elements
- Implement aria-current for indicating the current item in a set, navigation, or process
- Avoid redundant ARIA that duplicates the semantics of native HTML elements

### Guidelines for Astro

- Leverage View Transitions API for smooth page transitions (use ClientRouter)
- Use content collections with type safety for blog posts, documentation, etc.
- Leverage Server Endpoints for API routes
- Use POST, GET  - uppercase format for endpoint handlers
- Use `export const prerender = false` for API routes
- Use zod for input validation in API routes
- Extract logic into services in `src/lib/services`
- Implement middleware for request/response modification
- Use image optimization with the Astro Image integration
- Implement hybrid rendering with server-side rendering where needed
- Use Astro.cookies for server-side cookie management
- Leverage import.meta.env for environment variables

### Guidelines for React

- Use functional components with hooks instead of class components
- Never use "use client" and other Next.js directives as we use React with Astro
- Extract logic into custom hooks in `src/components/hooks`
- Implement React.memo() for expensive components that render often with the same props
- Utilize React.lazy() and Suspense for code-splitting and performance optimization
- Use the useCallback hook for event handlers passed to child components to prevent unnecessary re-renders
- Prefer useMemo for expensive calculations to avoid recomputation on every render
- Implement useId() for generating unique IDs for accessibility attributes
- Consider using the new useOptimistic hook for optimistic UI updates in forms
- Use useTransition for non-urgent state updates to keep the UI responsive

### Backend and Database

- Use Supabase for backend services, including authentication and database interactions.
- Follow Supabase guidelines for security and performance.
- Use Zod schemas to validate data exchanged with the backend.
- Use supabase from context.locals in Astro routes instead of importing supabaseClient directly
- Use SupabaseClient type from `src/db/supabase.client.ts`, not from `@supabase/supabase-js`