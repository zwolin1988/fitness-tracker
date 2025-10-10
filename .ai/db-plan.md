# Schemat bazy danych PostgreSQL - Fitness Tracker

## 1. Tabele i ich definicje



### 1.1. users

This table is managed by Supabase Auth

- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- email VARCHAR(255) NOT NULL UNIQUE
- password_hash VARCHAR NOT NULL
- created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL

### 1.2. profiles
- user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
- name VARCHAR(100) NOT NULL
- weight NUMERIC(6,2) NOT NULL CHECK (weight > 0)
- height NUMERIC(6,2) NOT NULL CHECK (height > 0)
- role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
- updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL

### 1.3. categories
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- name VARCHAR(100) NOT NULL UNIQUE
- description TEXT
- image_url VARCHAR(500)
- created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL

### 1.4. exercises
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- name VARCHAR(100) NOT NULL
- description TEXT
- icon_svg TEXT
- difficulty VARCHAR(50) NOT NULL
- category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT
- created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL

### 1.5. training_plans
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- name VARCHAR(100) NOT NULL
- description TEXT
- created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
- updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL

> *Limitu aktywnych planów (maks. 7 na użytkownika) egzekwować na poziomie aplikacji.*

### 1.6. plan_exercises (tabela pośrednia)
- training_plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE
- exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE
- order_index INTEGER NOT NULL
- PRIMARY KEY (training_plan_id, exercise_id)

### 1.7. plan_exercise_sets
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- training_plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE
- exercise_id UUID NOT NULL REFERENCES exercises(id)
- set_order INTEGER NOT NULL
- repetitions INTEGER NOT NULL CHECK (repetitions > 0)
- weight NUMERIC(6,2) NOT NULL CHECK (weight >= 0)
- created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL

### 1.8. workouts
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
- training_plan_id UUID REFERENCES training_plans(id)
- start_time TIMESTAMP WITH TIME ZONE NOT NULL
- end_time TIMESTAMP WITH TIME ZONE
- created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL

### 1.9. workout_sets
- id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE
- exercise_id UUID NOT NULL REFERENCES exercises(id)
- set_order INTEGER NOT NULL
- repetitions INTEGER NOT NULL CHECK (repetitions > 0)
- weight NUMERIC(6,2) NOT NULL CHECK (weight >= 0)
- completed BOOLEAN DEFAULT false NOT NULL
- modified_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL

## 2. Relacje między tabelami

- **users** (1) — (1) **profiles**
- **users** (1) — (N) **training_plans**
- **categories** (1) — (N) **exercises**
- **training_plans** (M) — (N) **exercises** poprzez **plan_exercises**
- **training_plans** (1) — (N) **plan_exercise_sets**
- **users** (1) — (N) **workouts**
- **workouts** (1) — (N) **workout_sets**
- **exercises** powiązane z planami i sesjami przez tabele pośrednie i zestawy

## 3. Indeksy

- CREATE INDEX ON profiles(role);
- CREATE INDEX ON training_plans(user_id);
- CREATE INDEX ON exercises(category_id);
- CREATE INDEX ON workouts(start_time);
- CREATE INDEX ON plan_exercise_sets(training_plan_id, exercise_id);
- CREATE INDEX ON workout_sets(workout_id, set_order);

**Uwaga:** Tabela `auth.users` jest zarządzana przez Supabase Auth i ma własne indeksy.

## 4. Zasady PostgreSQL (RLS)

### 4.1. Podstawowe polityki dla użytkowników
- **profiles, training_plans, workouts**: Użytkownicy mają dostęp tylko do własnych danych (WHERE user_id = auth.uid())
- **categories, exercises**: Wszyscy mogą czytać (SELECT), tylko admini mogą modyfikować (INSERT/UPDATE/DELETE)

### 4.2. Polityki dla adminów
Admini identyfikowani przez `role = 'admin'` w tabeli profiles mają dodatkowe uprawnienia:
- **categories**: Pełny dostęp (CRUD)
- **exercises**: Pełny dostęp (CRUD)

### 4.3. Przykładowe polityki RLS

```sql
-- profiles: użytkownicy zarządzają swoim profilem
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_policy ON profiles
  FOR ALL USING (auth.uid() = user_id);

-- categories: czytanie dla wszystkich, modyfikacja dla adminów
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_select ON categories
  FOR SELECT USING (true);
CREATE POLICY categories_admin ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- exercises: czytanie dla wszystkich, modyfikacja dla adminów
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY exercises_select ON exercises
  FOR SELECT USING (true);
CREATE POLICY exercises_admin ON exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- training_plans: użytkownicy zarządzają własnymi planami
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY plans_policy ON training_plans
  FOR ALL USING (auth.uid() = user_id);

-- workouts: użytkownicy zarządzają własnymi treningami
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY workouts_policy ON workouts
  FOR ALL USING (auth.uid() = user_id);
```

## 5. Dodatkowe uwagi i wyjaśnienia

- **UUID:** Generacja kluczy przy użyciu `uuid_generate_v4()` (rozszerzenie `uuid-ossp`).
- **Transakcje:** Wszystkie operacje wieloetapowe (np. zapis treningu + zestawów) powinny być wykonywane w ramach transakcji.
- **Typy numeryczne:** Użycie `NUMERIC(6,2)` zapewnia precyzyjne wartości dla wagi, wzrostu i ciężaru.
- **Role użytkowników:** Kolumna `role` w tabeli `profiles` określa uprawnienia ('user' domyślnie, 'admin' dla administratorów). Admini mogą zarządzać kategoriami i ćwiczeniami.
- **JSONB:** W przyszłości kolumny JSONB mogą być dodane, aby przechowywać niestandardowe dane.
- **Tech stack:** Schemat bazuje na PostgreSQL w Supabase ([tech-stack.md](../.ai/tech-stack.md)).
- **Normalizacja:** Schemat zgodny z 3NF, co zapewnia minimalizację duplikacji danych i integralność.
