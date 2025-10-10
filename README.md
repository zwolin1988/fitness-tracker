# Fitness Tracker

A modern web application for creating personalized workout plans and tracking your fitness progress.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

Fitness Tracker is a comprehensive web application that enables users to create and execute personalized workout plans while monitoring their fitness progress over time. The platform provides a seamless experience for managing your fitness journey with real-time tracking and insightful visualizations.

### Key Features

- **User Authentication**: Secure registration and login with email/password via Supabase Auth, including password reset functionality
- **Profile Management**: Track personal metrics including name, weight, and height
- **Admin Panel**: Administrators can manage exercise categories and exercises (add, edit, delete)
- **Exercise Library**: Browse and select from a comprehensive database of exercises organized by categories, with descriptions, difficulty levels, and visual icons
- **Workout Planning**: Create up to 7 active workout plans with customizable exercises and sets
- **Real-time Tracking**: Execute workouts with live parameter adjustments and set completion tracking
- **Progress Visualizations**: Dashboard featuring weekly volume charts and maximum weight per session graphs
- **Workout Summaries**: Detailed post-workout statistics including total exercises, sets, reps, maximum weight, and total volume
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices with WCAG A accessibility compliance

Built with modern technologies including Astro 5, React 19, TypeScript, and Supabase for a fast, scalable, and reliable experience.

## Tech Stack

### Frontend
- **[Astro 5](https://astro.build/)** - Fast, modern web framework with minimal JavaScript
- **[React 19](https://react.dev/)** - Interactive UI components and dynamic functionality
- **[TypeScript 5](https://www.typescriptlang.org/)** - Static typing for robust code quality
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework for rapid styling
- **[Shadcn/ui](https://ui.shadcn.com/)** - Accessible React component library

### Backend
- **[Supabase](https://supabase.com/)** - Complete backend solution providing:
  - PostgreSQL database
  - Built-in authentication
  - Backend-as-a-Service SDK
  - Self-hosting capability (open source)

### AI Integration
- **[Openrouter.ai](https://openrouter.ai/)** - Access to multiple AI models (OpenAI, Anthropic, Google, etc.) with cost control features

### CI/CD & Hosting
- **[GitHub Actions](https://github.com/features/actions)** - Automated CI/CD pipeline
- **[DigitalOcean](https://www.digitalocean.com/)** - Docker-based hosting for scalability and performance

### Testing & Code Quality
- **Jest** - Unit testing framework
- **React Testing Library** - React component testing
- **Cypress** - End-to-end testing
- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit quality checks
- **lint-staged** - Run linters on staged files

## Getting Started Locally

### Prerequisites

- **Node.js**: Version 22.14.0 (specified in `.nvmrc`)
  - Recommended: Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions
  - Run `nvm use` to automatically switch to the correct version
- **npm** or **yarn**: Package manager
- **Supabase Account**: Required for backend functionality ([Sign up here](https://supabase.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fitness-tracker.git
   cd fitness-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:
   ```env
   # Supabase Configuration
   PUBLIC_SUPABASE_URL=your_supabase_project_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Optional: AI Integration
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

   > **Note**: Get your Supabase credentials from your [Supabase project dashboard](https://app.supabase.com/)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:4321` (default Astro port) or the port shown in your terminal.

### Database Setup

The application uses Supabase PostgreSQL database with the following schema:

**Core Tables:**
- `profiles` - User profile information (name, weight, height)
- `categories` - Exercise categories with descriptions and images
- `exercises` - Exercise library with difficulty levels and category assignments
- `training_plans` - User workout plans (limit 7 active per user)
- `plan_exercises` - Exercises included in plans
- `plan_exercise_sets` - Planned sets with reps and weights
- `workouts` - Workout sessions with timestamps
- `workout_sets` - Actual performed sets during workouts

**Setup Instructions:**
1. Create a Supabase project at [app.supabase.com](https://app.supabase.com/)
2. Run migrations from `supabase/migrations/` directory using Supabase CLI
3. Configure environment variables (see step 3 above)

For detailed schema documentation, see [.ai/db-plan.md](.ai/db-plan.md)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot-reload |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run astro` | Run Astro CLI commands |
| `npm run lint` | Run ESLint to check for code issues |
| `npm run lint:fix` | Automatically fix ESLint issues |
| `npm run format` | Format code with Prettier |

### Pre-commit Hooks

This project uses Husky and lint-staged to ensure code quality:
- Automatically runs ESLint on `.ts`, `.tsx`, and `.astro` files
- Automatically formats `.json`, `.css`, and `.md` files with Prettier

## Project Scope

### Included in MVP

✅ **Authentication & Authorization**
- Email/password registration and login via Supabase Auth
- Password reset functionality
- JWT session management with auto-refresh
- Role-based access control (user, admin)

✅ **User Profile Management**
- Personal metrics tracking (name, weight, height)
- Profile CRUD operations

✅ **Admin Panel**
- Category management (CRUD operations for exercise categories)
- Exercise management (CRUD operations for exercises)
- Role-based authorization via RLS policies

✅ **Exercise Library**
- Comprehensive exercise database with SVG icons
- Organized by categories (separate entity with name, description, image)
- Exercise categorization and difficulty levels
- Searchable and filterable interface (by category ID and difficulty)

✅ **Workout Plan Creation**
- Create custom workout plans with names and descriptions
- Select exercises from the library
- Define sets with reps and weight parameters
- Up to 7 active plans per user

✅ **Workout Execution**
- Start/stop workout sessions with timestamps
- Real-time parameter modifications
- Set completion tracking
- Live workout progress

✅ **Analytics & Visualizations**
- Post-workout summaries (exercises, sets, reps, max weight, total volume)
- Dashboard with weekly volume charts
- Maximum weight per session graphs
- Customizable date range filters

✅ **Quality & Accessibility**
- Responsive design (mobile, tablet, desktop breakpoints)
- WCAG A accessibility compliance
- Error handling with appropriate HTTP status codes (401, 400/422, 500)
- Minimum 70% test coverage for business logic

✅ **DevOps**
- CI/CD pipeline with GitHub Actions
- Automated testing
- Separate develop/staging/production environments
- Daily database backups with 30-day retention

### Not Included in MVP

❌ Native mobile applications (iOS/Android)
❌ Integration with external fitness devices or services
❌ Offline mode functionality
❌ More than 7 active workout plans per user
❌ Social features (sharing, following, etc.)

## Project Status

**Current Version**: `0.0.1` (Early Development)

**Development Stage**: MVP in progress

### Target Success Metrics

- ✅ Weekly and monthly completed workouts tracking
- ✅ Total weight lifted per week/month monitoring
- ✅ Average time from login to first session: < 3 minutes
- ✅ Test coverage: ≥ 70% for business logic
- ✅ Production error rate: < 1%
- ✅ Daily user retention: ≥ 30%

### Roadmap

- [ ] Complete core authentication system
- [ ] Implement exercise library and filtering
- [ ] Build workout plan creation interface
- [ ] Develop real-time workout tracking
- [ ] Create dashboard with visualizations
- [ ] Achieve 70% test coverage
- [ ] Deploy to production environment
- [ ] Gather user feedback and iterate

## License

This project license is to be determined. Please contact the repository owner for licensing information.

---

**Built with ❤️ using Astro, React, and Supabase**
