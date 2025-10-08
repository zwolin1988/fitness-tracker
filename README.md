# Fitness Tracker

A modern, intuitive web application for tracking workouts, managing exercises, and monitoring fitness progress.

## Table of Contents

- [Description](#description)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Description

Fitness Tracker is a comprehensive web application designed to help users manage their fitness journey through:

- **Exercise Database Management** - Organized categorization of exercises by muscle groups (back, shoulders, biceps, triceps, chest, legs & glutes, calves, core, abs, cardio)
- **Workout Session Tracking** - Create and log detailed workout sessions with exercises, sets, and weights
- **Workout History** - View complete training history with historical snapshots of exercises
- **Progress Analytics** - Generate statistics and visualize progress through volume and strength charts
- **Workout Plans** - Access and execute predefined workout plans with default parameters

The application addresses common pain points in existing fitness tracking solutions by providing:
- Detailed exercise categorization and personalization
- Granular workout parameter tracking (sets + weight)
- Historical snapshots that preserve exercise state at the time of workout creation
- Comprehensive workout planning capabilities

## Tech Stack

### Frontend

- **[Astro](https://astro.build/)** v5.13.7 - Server-side rendering framework with SSR mode
- **[React](https://react.dev/)** v19.1.1 - Interactive UI components
- **[TypeScript](https://www.typescriptlang.org/)** v5 - Type-safe JavaScript with strict mode
- **[Tailwind CSS](https://tailwindcss.com/)** v4.1.13 - Utility-first CSS framework with CSS variables
- **[Shadcn/ui](https://ui.shadcn.com/)** - Accessible component library (New York style, non-RSC)

### Backend

- **[Supabase](https://supabase.com/)** - Complete backend solution providing:
  - PostgreSQL database
  - Authentication and authorization with RLS (Row Level Security)
  - Backend-as-a-Service SDK
  - Media storage for exercise images

### AI Integration

- **[Openrouter.ai](https://openrouter.ai/)** - AI model integration with access to multiple providers (OpenAI, Anthropic, Google) and built-in cost controls

### CI/CD & Hosting

- **GitHub Actions** - Automated CI/CD pipelines
- **DigitalOcean** - Application hosting via Docker containers

### Development Tools

- **ESLint** v9 - Code linting with React Compiler plugin, TypeScript strict rules, and accessibility checks
- **Prettier** - Code formatting
- **Husky** + **lint-staged** - Pre-commit hooks for automated linting and formatting

## Prerequisites

- **Node.js** v22.14.0 (as specified in `.nvmrc`)
- **npm** (comes with Node.js)
- **Supabase account** (for backend services)

## Getting Started

1. **Clone the repository:**

```bash
git clone <repository-url>
cd fitness-tracker
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

Create a `.env` file in the project root with your Supabase credentials:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run the development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

5. **Build for production:**

```bash
npm run build
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build application for production with SSR |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint with React Compiler plugin |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format code with Prettier |

## Project Scope

### MVP Features (Current Phase)

#### Core Functionality
- **Exercise Management (Admin)**
  - Create, read, update, delete exercises
  - Exercise attributes: name, category, image (SVG/PNG), description, YouTube link, muscle groups, difficulty level, equipment type
  - Organized by 10 muscle group categories

- **Workout Management (Users)**
  - Create workouts manually by selecting exercises and specifying sets and weights
  - Create workouts from predefined plans
  - Edit and delete personal workouts
  - View workout history with complete details

- **Workout Plans**
  - Create and manage workout plans with predefined exercises and default parameters
  - Execute workouts based on plans
  - Track completion status for each exercise in a plan

- **Progress Tracking**
  - View workout history with filtering by category and date range
  - Generate volume and strength statistics charts
  - Analyze progress over custom time periods

#### Technical Features
- **Historical Snapshots** - Workouts preserve exercise details (name, description, image, muscle groups) at the time of creation
- **Media Management** - Image hosting via Supabase Storage with support for SVG and PNG formats
- **Authentication & Authorization**
  - User registration and login via Supabase Auth
  - Role-based access control (Admin, User)
  - Row-level security ensuring users see only their own data

### Future Roadmap (Post-MVP)

- Social sharing and community features
- Auto-suggest functionality for exercises and plans
- Media versioning and retention policies
- User-submitted exercise moderation system
- Integration with wearable devices
- Enhanced analytics and progress insights

### Out of Scope for MVP

- Wearable device integration
- Social/community features
- Automatic plan updates when new exercises are added
- Mobile native applications

## Project Status

![Status](https://img.shields.io/badge/status-in%20development-yellow)

**Current Phase:** MVP Development

The project is actively under development with the following recent milestones:
- ✅ Project structure and architecture setup
- ✅ Type system and domain models implementation
- ✅ Tech stack documentation
- 🚧 Core features implementation in progress
- ⏳ Supabase integration pending
- ⏳ UI components and pages pending

### Success Metrics

We will measure success through:
- Number of registered and active users
- Average number of workouts created per month
- Percentage of workouts with complete data (sets + weight)
- Number of exercises added/edited in the database
- Workout plan completion rate
- User satisfaction scores from post-MVP surveys

## License

To be determined. Please contact the repository owner for licensing information.

---

**Built with ❤️ using modern web technologies**
