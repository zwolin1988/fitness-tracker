-- migration: full schema creation for fitness tracker
-- description: creates all tables (profiles, categories, exercises, training_plans, plan_exercises, plan_exercise_sets, workouts, workout_sets), indexes, and granular rls policies
-- note: the users table is managed by supabase auth
-- created at: 2025-10-10 12:45:00 utc

create extension if not exists "uuid-ossp";

-- table: profiles
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name varchar(100) not null,
  weight numeric(6,2) not null check (weight > 0),
  height numeric(6,2) not null check (height > 0),
  role varchar(20) not null default 'user' check (role in ('user','admin')),
  updated_at timestamp with time zone default now() not null
);
alter table profiles enable row level security;
create policy profiles_select on profiles for select to authenticated using (auth.uid() = user_id);
create policy profiles_insert on profiles for insert to authenticated with check (auth.uid() = user_id);
create policy profiles_update on profiles for update to authenticated using (auth.uid() = user_id);
create policy profiles_delete on profiles for delete to authenticated using (auth.uid() = user_id);

-- table: categories
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name varchar(100) not null unique,
  description text,
  image_url varchar(500),
  created_at timestamp with time zone default now() not null
);
alter table categories enable row level security;
create policy categories_select on categories for select to anon using (true);
create policy categories_select_auth on categories for select to authenticated using (true);
create policy categories_insert on categories for insert to authenticated with check (
  exists (select 1 from profiles where user_id = auth.uid() and role = 'admin')
);
create policy categories_update on categories for update to authenticated using (
  exists (select 1 from profiles where user_id = auth.uid() and role = 'admin')
);
create policy categories_delete on categories for delete to authenticated using (
  exists (select 1 from profiles where user_id = auth.uid() and role = 'admin')
);

-- table: exercises
create table exercises (
  id uuid primary key default uuid_generate_v4(),
  name varchar(100) not null,
  description text,
  icon_svg text,
  difficulty varchar(50) not null,
  category_id uuid not null references categories(id) on delete restrict,
  created_at timestamp with time zone default now() not null
);
alter table exercises enable row level security;
create policy exercises_select on exercises for select to anon using (true);
create policy exercises_select_auth on exercises for select to authenticated using (true);
create policy exercises_insert on exercises for insert to authenticated with check (
  exists (select 1 from profiles where user_id = auth.uid() and role = 'admin')
);
create policy exercises_update on exercises for update to authenticated using (
  exists (select 1 from profiles where user_id = auth.uid() and role = 'admin')
);
create policy exercises_delete on exercises for delete to authenticated using (
  exists (select 1 from profiles where user_id = auth.uid() and role = 'admin')
);

-- table: training_plans
create table training_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(100) not null,
  description text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
alter table training_plans enable row level security;
create policy training_plans_select on training_plans for select to authenticated using (auth.uid() = user_id);
create policy training_plans_insert on training_plans for insert to authenticated with check (auth.uid() = user_id);
create policy training_plans_update on training_plans for update to authenticated using (auth.uid() = user_id);
create policy training_plans_delete on training_plans for delete to authenticated using (auth.uid() = user_id);

-- table: plan_exercises
create table plan_exercises (
  training_plan_id uuid not null references training_plans(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  order_index integer not null,
  primary key (training_plan_id, exercise_id)
);
alter table plan_exercises enable row level security;
create policy plan_exercises_select on plan_exercises for select to authenticated using (
  exists (select 1 from training_plans where id = plan_exercises.training_plan_id and user_id = auth.uid())
);
create policy plan_exercises_insert on plan_exercises for insert to authenticated with check (
  exists (select 1 from training_plans where id = plan_exercises.training_plan_id and user_id = auth.uid())
);
create policy plan_exercises_update on plan_exercises for update to authenticated using (
  exists (select 1 from training_plans where id = plan_exercises.training_plan_id and user_id = auth.uid())
);
create policy plan_exercises_delete on plan_exercises for delete to authenticated using (
  exists (select 1 from training_plans where id = plan_exercises.training_plan_id and user_id = auth.uid())
);

-- table: plan_exercise_sets
create table plan_exercise_sets (
  id uuid primary key default uuid_generate_v4(),
  training_plan_id uuid not null references training_plans(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  set_order integer not null,
  repetitions integer not null check (repetitions > 0),
  weight numeric(6,2) not null check (weight >= 0),
  created_at timestamp with time zone default now() not null
);
alter table plan_exercise_sets enable row level security;
create policy plan_exercise_sets_select on plan_exercise_sets for select to authenticated using (
  exists (select 1 from training_plans where id = plan_exercise_sets.training_plan_id and user_id = auth.uid())
);
create policy plan_exercise_sets_insert on plan_exercise_sets for insert to authenticated with check (
  exists (select 1 from training_plans where id = plan_exercise_sets.training_plan_id and user_id = auth.uid())
);
create policy plan_exercise_sets_update on plan_exercise_sets for update to authenticated using (
  exists (select 1 from training_plans where id = plan_exercise_sets.training_plan_id and user_id = auth.uid())
);
create policy plan_exercise_sets_delete on plan_exercise_sets for delete to authenticated using (
  exists (select 1 from training_plans where id = plan_exercise_sets.training_plan_id and user_id = auth.uid())
);

-- table: workouts
create table workouts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  training_plan_id uuid references training_plans(id),
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  created_at timestamp with time zone default now() not null
);
alter table workouts enable row level security;
create policy workouts_select on workouts for select to authenticated using (auth.uid() = user_id);
create policy workouts_insert on workouts for insert to authenticated with check (auth.uid() = user_id);
create policy workouts_update on workouts for update to authenticated using (auth.uid() = user_id);
create policy workouts_delete on workouts for delete to authenticated using (auth.uid() = user_id);

-- table: workout_sets
create table workout_sets (
  id uuid primary key default uuid_generate_v4(),
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  set_order integer not null,
  repetitions integer not null check (repetitions > 0),
  weight numeric(6,2) not null check (weight >= 0),
  completed boolean default false not null,
  modified_at timestamp with time zone default now() not null
);
alter table workout_sets enable row level security;
create policy workout_sets_select on workout_sets for select to authenticated using (
  exists (select 1 from workouts where id = workout_sets.workout_id and user_id = auth.uid())
);
create policy workout_sets_insert on workout_sets for insert to authenticated with check (
  exists (select 1 from workouts where id = workout_sets.workout_id and user_id = auth.uid())
);
create policy workout_sets_update on workout_sets for update to authenticated using (
  exists (select 1 from workouts where id = workout_sets.workout_id and user_id = auth.uid())
);
create policy workout_sets_delete on workout_sets for delete to authenticated using (
  exists (select 1 from workouts where id = workout_sets.workout_id and user_id = auth.uid())
);

-- indexes
create index on profiles(role);
create index on training_plans(user_id);
create index on exercises(category_id);
create index on workouts(start_time);
create index on plan_exercise_sets(training_plan_id, exercise_id);
create index on workout_sets(workout_id, set_order);
