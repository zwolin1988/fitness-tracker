# REST API Plan

## 1. Resources

### Public & User Resources
- **Auth**: Handled by Supabase Auth SDK (client-side)
- **Profile**: `/profile` → `profiles`
- **Category**: `/categories` → `categories` (read-only for users)
- **Exercise**: `/exercises` → `exercises` (read-only for users)
- **Training Plan**: `/plans` → `training_plans`
- **Plan Sets**: `/plans/{planId}/sets` → `plan_exercise_sets`
- **Workout**: `/workouts` → `workouts`
- **Workout Sets**: `/workouts/{workoutId}/sets` → `workout_sets`

### Admin Resources
- **Admin Category**: `/admin/categories` → `categories` (CRUD)
- **Admin Exercise**: `/admin/exercises` → `exercises` (CRUD)

## 2. Endpoints

### Auth
**Note:** Authentication is handled by **Supabase Auth SDK** client-side. No custom API endpoints needed.

Supabase Auth provides built-in methods:
- `supabase.auth.signUp({ email, password })` - Registration
- `supabase.auth.signInWithPassword({ email, password })` - Login
- `supabase.auth.signOut()` - Logout
- `supabase.auth.resetPasswordForEmail(email)` - Password reset
- `supabase.auth.getSession()` - Get current session
- Automatic JWT token management and refresh

### Profile
- GET /profile
  - Query user from JWT
  - Response: `200` `{ name, weight, height }`
- PUT /profile
  - Payload: `{ name, weight, height }`
  - Validation: weight>0, height>0
  - Response: `200` updated profile

### Categories (Public)
- GET /categories
  - Query: `?page=&limit=`
  - Response: `200` `{ items: [{ id, name, description, imageUrl }], page, totalPages }`
- GET /categories/{id}
  - Response: `200` category detail with exercises count

### Categories (Admin Only)
- POST /admin/categories
  - Payload: `{ name, description, imageUrl }`
  - Validation: name required and unique
  - Response: `201` new category
- PUT /admin/categories/{id}
  - Payload: `{ name, description, imageUrl }`
  - Response: `200` updated category
- DELETE /admin/categories/{id}
  - Business: Cannot delete if exercises exist with this categoryId
  - Response: `204` or `409` if exercises exist

### Exercises (Public)
- GET /exercises
  - Query: `?categoryId=&difficulty=&page=&limit=`
  - Response: `200` `{ items: [...], page, totalPages }`
- GET /exercises/{id}
  - Response: `200` exercise detail with category info

### Exercises (Admin Only)
- POST /admin/exercises
  - Payload: `{ name, description, iconSvg, difficulty, categoryId }`
  - Validation: name required, categoryId must exist, difficulty enum
  - Response: `201` new exercise
- PUT /admin/exercises/{id}
  - Payload: `{ name, description, iconSvg, difficulty, categoryId }`
  - Response: `200` updated exercise
- DELETE /admin/exercises/{id}
  - Business: Cannot delete if used in active plans or workouts
  - Response: `204` or `409` if in use

### Training Plans
- GET /plans
  - Response: `200` list of plans (excludes soft-deleted)
- POST /plans
  - Payload: `{ name, description, exercises: [{ exerciseId, sets?: [{ repetitions, weight, set_order? }] }] }`
  - Business: max 7 active plans
  - Note: **Supports bulk create** - can include exercises with all sets in one request
  - Response: `201` new plan
- GET /plans/{id}
  - Response: `200` plan detail with exercises and sets
- PUT /plans/{id}
  - Payload: `{ name, description, exercises: [{ exerciseId, sets? }] }`
  - Response: `200` updated plan
- DELETE /plans/{id}
  - Note: **Soft delete** - sets `deleted_at` timestamp
  - Workouts referencing this plan remain intact with full history
  - Response: `204`

### Plan Sets
- POST /plans/{planId}/sets
  - Payload: `{ exerciseId, repetitions>0, weight>=0 }`
  - Response: `201` set record
- PUT /plans/{planId}/sets/{setId}
  - Payload: `{ repetitions, weight }`
  - Response: `200`
- DELETE /plans/{planId}/sets/{setId}
  - Response: `204`

### Workouts
- POST /workouts
  - Payload: `{ planId }`
  - Creates start_time
  - Response: `201` `{ workoutId, startTime }`
- GET /workouts
  - Query: `?from=&to=&page=&limit=`
  - Response: `200` list
- GET /workouts/{id}
  - Response: `200` detail + sets
- POST /workouts/{id}/end
  - Sets end_time
  - Response: `200` summary

### Workout Sets
- POST /workouts/{id}/sets
  - Payload: `{ exerciseId, setOrder, repetitions>0, weight>=0 }`
  - Response: `201`
- PATCH /workouts/{id}/sets/{setId}
  - Payload: `{ repetitions, weight, completed }`
  - Response: `200`

## 3. Authentication & Authorization

### User Authentication
- JWT Bearer tokens managed by Supabase Auth
- Tokens included automatically in requests via Supabase client
- Row-level security (RLS) enforces `user_id` constraints

### Protected Routes
- `/profile` - authenticated users only (own profile)
- `/plans` - authenticated users only (own plans)
- `/workouts` - authenticated users only (own workouts)
- `/admin/*` - admin role only

### Admin Authorization
- Admin role stored in `profiles` table as `role` column (enum: 'user', 'admin')
- Middleware checks `auth.uid()` and verifies `role = 'admin'` from profiles
- RLS policies allow admins to INSERT/UPDATE/DELETE categories and exercises
- Regular users have read-only access to categories and exercises

## 4. Validation & Business Logic
- **Profiles**: `weight>0`, `height>0`
- **Sets**: `repetitions>0`, `weight>=0`
- **Plans**: Enforce ≤7 active plans per user (soft-deleted plans don't count)
- **Pagination**: `limit` ≤100, `page` ≥1
- **Error Handling**: 400/422 for validation, 401 for auth, 404 for missing
- **Rate Limiting**: 100 req/min per user (middleware)

## 5. Training Plan Creation - Two Approaches

### Approach 1: Bulk Create (Recommended)
Create a complete plan with exercises and all sets in a **single request**:

```json
POST /api/plans
{
  "name": "FBW A - Full Body Workout",
  "description": "3x per week strength training",
  "exercises": [
    {
      "exerciseId": "uuid-squat",
      "sets": [
        { "repetitions": 10, "weight": 50 },
        { "repetitions": 10, "weight": 50 },
        { "repetitions": 8, "weight": 55 }
      ]
    },
    {
      "exerciseId": "uuid-bench-press",
      "sets": [
        { "repetitions": 12, "weight": 30 },
        { "repetitions": 10, "weight": 35 }
      ]
    }
  ]
}
```

**Benefits:**
- ✅ Single HTTP request (faster)
- ✅ Transactional consistency
- ✅ Better UX (one loading state)
- ✅ Automatic rollback on error

### Approach 2: Incremental
Create plan first, then add sets separately:

```json
// Step 1: Create plan
POST /api/plans
{
  "name": "FBW B",
  "exercises": [
    { "exerciseId": "uuid-squat" },
    { "exerciseId": "uuid-bench-press" }
  ]
}
// Response: { id: "plan-uuid", ... }

// Step 2: Add sets (multiple requests)
POST /api/plans/plan-uuid/sets
{ "exerciseId": "uuid-squat", "repetitions": 10, "weight": 50 }

POST /api/plans/plan-uuid/sets
{ "exerciseId": "uuid-squat", "repetitions": 10, "weight": 50 }
// ... repeat for each set
```

**Use case:** When user wants to create plan structure first, then add sets later.

## 6. Soft Delete Implementation

### Training Plans
- DELETE operation sets `deleted_at` timestamp instead of hard delete
- Soft-deleted plans are excluded from GET /plans list (filtered by RLS)
- Workouts maintain `training_plan_id` reference even after plan deletion
- Full workout history is preserved

**Why soft delete?**
- Maintains referential integrity
- Preserves workout history and statistics
- Enables data analysis across deleted plans
- Allows potential "restore" feature in future
