-- Migration: Seed database with test data
-- Date: 2025-10-14
-- Description: Add test users, categories, exercises, training plans, and workouts
-- Admin user: bfe54383-7eb6-4581-969e-49a2b4b750d6
-- Regular user: 65a9651d-d0d2-4b69-bbfa-9a09a239d9a9

-- ===========================
-- 1. PROFILES
-- ===========================

INSERT INTO profiles (user_id, name, weight, height, role, updated_at) VALUES
  ('bfe54383-7eb6-4581-969e-49a2b4b750d6', 'Jan Kowalski (Admin)', 85.5, 180.0, 'admin', NOW()),
  ('65a9651d-d0d2-4b69-bbfa-9a09a239d9a9', 'Anna Nowak', 65.0, 168.0, 'user', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  weight = EXCLUDED.weight,
  height = EXCLUDED.height,
  role = EXCLUDED.role,
  updated_at = EXCLUDED.updated_at;

-- ===========================
-- 2. CATEGORIES
-- ===========================

INSERT INTO categories (id, name, description, image_url, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Klatka piersiowa', 'Ćwiczenia na mięśnie klatki piersiowej', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Plecy', 'Ćwiczenia na mięśnie grzbietu', 'https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=400', NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Nogi', 'Ćwiczenia na mięśnie nóg', 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400', NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'Ramiona', 'Ćwiczenia na barki i ramiona', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400', NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'Biceps', 'Ćwiczenia na mięśnie dwugłowe ramion', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400', NOW()),
  ('550e8400-e29b-41d4-a716-446655440006', 'Triceps', 'Ćwiczenia na mięśnie trójgłowe ramion', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400', NOW()),
  ('550e8400-e29b-41d4-a716-446655440007', 'Brzuch', 'Ćwiczenia na mięśnie brzucha', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', NOW()),
  ('550e8400-e29b-41d4-a716-446655440008', 'Cardio', 'Ćwiczenia cardio i wytrzymałościowe', 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400', NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

-- ===========================
-- 3. EXERCISES
-- ===========================

-- Klatka piersiowa (6 ćwiczeń)
INSERT INTO exercises (id, name, description, icon_svg, difficulty, category_id, created_at) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Wyciskanie sztangi na ławce płaskiej', 'Podstawowe ćwiczenie na klatkę piersiową', NULL, 'średnie', '550e8400-e29b-41d4-a716-446655440001', NOW()),
  ('650e8400-e29b-41d4-a716-446655440002', 'Wyciskanie hantli na ławce skośnej', 'Ćwiczenie na górną część klatki', NULL, 'średnie', '550e8400-e29b-41d4-a716-446655440001', NOW()),
  ('650e8400-e29b-41d4-a716-446655440003', 'Pompki', 'Podstawowe ćwiczenie z wagą ciała', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440001', NOW()),
  ('650e8400-e29b-41d4-a716-446655440004', 'Rozpiętki z hantlami', 'Izolacja mięśni klatki piersiowej', NULL, 'średnie', '550e8400-e29b-41d4-a716-446655440001', NOW()),
  ('650e8400-e29b-41d4-a716-446655440005', 'Dipy na poręczach', 'Ćwiczenie na dolną część klatki', NULL, 'średnie', '550e8400-e29b-41d4-a716-446655440001', NOW()),
  ('650e8400-e29b-41d4-a716-446655440006', 'Wyciskanie na maszynie', 'Ćwiczenie maszynowe na klatkę', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440001', NOW()),

-- Plecy (6 ćwiczeń)
  ('650e8400-e29b-41d4-a716-446655440007', 'Martwy ciąg', 'Kompleksowe ćwiczenie na plecy i nogi', NULL, 'trudne', '550e8400-e29b-41d4-a716-446655440002', NOW()),
  ('650e8400-e29b-41d4-a716-446655440008', 'Podciąganie na drążku', 'Ćwiczenie z wagą ciała na szerokość pleców', NULL, 'średnie', '550e8400-e29b-41d4-a716-446655440002', NOW()),
  ('650e8400-e29b-41d4-a716-446655440009', 'Wiosłowanie sztangą', 'Ćwiczenie na grubość pleców', NULL, 'średnie', '550e8400-e29b-41d4-a716-446655440002', NOW()),
  ('650e8400-e29b-41d4-a716-446655440010', 'Wiosłowanie hantlem', 'Jednostronne wiosłowanie', NULL, 'średnie', '550e8400-e29b-41d4-a716-446655440002', NOW()),
  ('650e8400-e29b-41d4-a716-446655440011', 'Ściąganie drążka wyciągu górnego', 'Ćwiczenie maszynowe na szerokość pleców', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440002', NOW()),
  ('650e8400-e29b-41d4-a716-446655440012', 'Przyciąganie linki siedząc', 'Ćwiczenie na środek pleców', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440002', NOW()),

-- Nogi (5 ćwiczeń)
  ('650e8400-e29b-41d4-a716-446655440013', 'Przysiad ze sztangą', 'Podstawowe ćwiczenie na nogi', NULL, 'trudne', '550e8400-e29b-41d4-a716-446655440003', NOW()),
  ('650e8400-e29b-41d4-a716-446655440014', 'Wypychanie na suwnicy', 'Ćwiczenie maszynowe na nogi', NULL, 'średnie', '550e8400-e29b-41d4-a716-446655440003', NOW()),
  ('650e8400-e29b-41d4-a716-446655440015', 'Wykroki z hantlami', 'Ćwiczenie funkcjonalne na nogi', NULL, 'średnie', '550e8400-e29b-41d4-a716-446655440003', NOW()),
  ('650e8400-e29b-41d4-a716-446655440016', 'Prostowanie nóg na maszynie', 'Izolacja czworogłowego', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440003', NOW()),
  ('650e8400-e29b-41d4-a716-446655440017', 'Uginanie nóg na maszynie', 'Izolacja mięśni tylnej części uda', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440003', NOW()),

-- Ramiona (4 ćwiczenia)
  ('650e8400-e29b-41d4-a716-446655440018', 'Wyciskanie sztangi nad głowę', 'OHP - podstawowe ćwiczenie na barki', NULL, 'średnie', '550e8400-e29b-41d4-a716-446655440004', NOW()),
  ('650e8400-e29b-41d4-a716-446655440019', 'Unoszenie hantli bokiem', 'Izolacja środkowej części barków', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440004', NOW()),
  ('650e8400-e29b-41d4-a716-446655440020', 'Wznosy hantli w przód', 'Izolacja przednich barków', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440004', NOW()),
  ('650e8400-e29b-41d4-a716-446655440021', 'Odwodzenie ramion w tył', 'Tylne partie barków', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440004', NOW()),

-- Biceps (3 ćwiczenia)
  ('650e8400-e29b-41d4-a716-446655440022', 'Uginanie ramion ze sztangą', 'Podstawowe ćwiczenie na biceps', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440005', NOW()),
  ('650e8400-e29b-41d4-a716-446655440023', 'Uginanie ramion z hantlami', 'Uginanie naprzemienne', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440005', NOW()),
  ('650e8400-e29b-41d4-a716-446655440024', 'Uginanie na modlitewniku', 'Izolacja bicepsa', NULL, 'średnie', '550e8400-e29b-41d4-a716-446655440005', NOW()),

-- Triceps (3 ćwiczenia)
  ('650e8400-e29b-41d4-a716-446655440025', 'Wyciskanie francuskie', 'Podstawowe ćwiczenie na triceps', NULL, 'średnie', '550e8400-e29b-41d4-a716-446655440006', NOW()),
  ('650e8400-e29b-41d4-a716-446655440026', 'Prostowanie ramion na wyciągu', 'Izolacja tricepsa', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440006', NOW()),
  ('650e8400-e29b-41d4-a716-446655440027', 'Dipy na ławce', 'Ćwiczenie z wagą ciała', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440006', NOW()),

-- Brzuch (4 ćwiczenia)
  ('650e8400-e29b-41d4-a716-446655440028', 'Spięcia brzucha', 'Podstawowe ćwiczenie na brzuch', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440007', NOW()),
  ('650e8400-e29b-41d4-a716-446655440029', 'Plank', 'Ćwiczenie stabilizacyjne', NULL, 'średnie', '550e8400-e29b-41d4-a716-446655440007', NOW()),
  ('650e8400-e29b-41d4-a716-446655440030', 'Unoszenie nóg w zwisie', 'Ćwiczenie na dolną część brzucha', NULL, 'trudne', '550e8400-e29b-41d4-a716-446655440007', NOW()),
  ('650e8400-e29b-41d4-a716-446655440031', 'Skręty rosyjskie', 'Ćwiczenie na mięśnie skośne', NULL, 'średnie', '550e8400-e29b-41d4-a716-446655440007', NOW()),

-- Cardio (3 ćwiczenia)
  ('650e8400-e29b-41d4-a716-446655440032', 'Bieg', 'Bieganie na bieżni lub zewnątrz', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440008', NOW()),
  ('650e8400-e29b-41d4-a716-446655440033', 'Rower stacjonarny', 'Jazda na rowerze stacjonarnym', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440008', NOW()),
  ('650e8400-e29b-41d4-a716-446655440034', 'Orbitrek', 'Trening na orbitreku', NULL, 'łatwe', '550e8400-e29b-41d4-a716-446655440008', NOW())
ON CONFLICT (id) DO NOTHING;

-- ===========================
-- 4. TRAINING PLANS
-- ===========================

-- Plan treningowy dla admina (Jan Kowalski)
INSERT INTO training_plans (id, user_id, name, description, created_at, updated_at) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'bfe54383-7eb6-4581-969e-49a2b4b750d6', 'Push Pull Legs', 'Klasyczny 3-dniowy split PPL', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
  ('750e8400-e29b-41d4-a716-446655440002', 'bfe54383-7eb6-4581-969e-49a2b4b750d6', 'Upper Lower', 'Plan 4-dniowy góra/dół', NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days')
ON CONFLICT (id) DO NOTHING;

-- Plan treningowy dla zwykłego usera (Anna Nowak)
INSERT INTO training_plans (id, user_id, name, description, created_at, updated_at) VALUES
  ('750e8400-e29b-41d4-a716-446655440003', '65a9651d-d0d2-4b69-bbfa-9a09a239d9a9', 'Full Body 3x', 'Plan FBW dla początkujących', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
  ('750e8400-e29b-41d4-a716-446655440004', '65a9651d-d0d2-4b69-bbfa-9a09a239d9a9', 'Trening obwodowy', 'Trening obwodowy na redukcję', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- ===========================
-- 5. PLAN EXERCISES (powiązania ćwiczeń z planami)
-- ===========================

-- Push Pull Legs - Push Day (klatka, ramiona, triceps)
INSERT INTO plan_exercises (training_plan_id, exercise_id, order_index) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 1), -- Wyciskanie sztangi
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 2), -- Wyciskanie hantli skos
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440018', 3), -- OHP
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440019', 4), -- Unoszenie bokiem
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440025', 5), -- Wyciskanie francuskie
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440026', 6)  -- Prostowanie ramion
ON CONFLICT (training_plan_id, exercise_id) DO NOTHING;

-- Full Body 3x (Anna Nowak)
INSERT INTO plan_exercises (training_plan_id, exercise_id, order_index) VALUES
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440013', 1), -- Przysiad
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 2), -- Wyciskanie
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440009', 3), -- Wiosłowanie sztangą
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440018', 4), -- OHP
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440028', 5)  -- Brzuszki
ON CONFLICT (training_plan_id, exercise_id) DO NOTHING;

-- ===========================
-- 6. PLAN EXERCISE SETS (zestawy dla planów)
-- ===========================

-- Push Pull Legs - przykładowe serie
INSERT INTO plan_exercise_sets (id, training_plan_id, exercise_id, set_order, repetitions, weight, created_at) VALUES
  -- Wyciskanie sztangi (3 serie)
  ('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 1, 8, 80.0, NOW()),
  ('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 2, 8, 80.0, NOW()),
  ('850e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 3, 8, 80.0, NOW()),
  -- Wyciskanie hantli skos (3 serie)
  ('850e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 1, 10, 30.0, NOW()),
  ('850e8400-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 2, 10, 30.0, NOW()),
  ('850e8400-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 3, 10, 30.0, NOW())
ON CONFLICT (id) DO NOTHING;

-- Full Body - przykładowe serie dla Anny
INSERT INTO plan_exercise_sets (id, training_plan_id, exercise_id, set_order, repetitions, weight, created_at) VALUES
  -- Przysiad (3 serie)
  ('850e8400-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440013', 1, 12, 40.0, NOW()),
  ('850e8400-e29b-41d4-a716-446655440008', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440013', 2, 12, 40.0, NOW()),
  ('850e8400-e29b-41d4-a716-446655440009', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440013', 3, 12, 40.0, NOW()),
  -- Wyciskanie (3 serie)
  ('850e8400-e29b-41d4-a716-446655440010', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 1, 10, 30.0, NOW()),
  ('850e8400-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 2, 10, 30.0, NOW()),
  ('850e8400-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 3, 10, 30.0, NOW())
ON CONFLICT (id) DO NOTHING;

-- ===========================
-- 7. WORKOUTS (przykładowe treningi)
-- ===========================

-- Treningi Jana (admin) - ostatnie 2 tygodnie
INSERT INTO workouts (id, user_id, training_plan_id, start_time, end_time, created_at) VALUES
  ('950e8400-e29b-41d4-a716-446655440001', 'bfe54383-7eb6-4581-969e-49a2b4b750d6', '750e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '14 days' + INTERVAL '10 hours', NOW() - INTERVAL '14 days' + INTERVAL '11 hours', NOW() - INTERVAL '14 days'),
  ('950e8400-e29b-41d4-a716-446655440002', 'bfe54383-7eb6-4581-969e-49a2b4b750d6', '750e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '12 days' + INTERVAL '10 hours', NOW() - INTERVAL '12 days' + INTERVAL '11 hours', NOW() - INTERVAL '12 days'),
  ('950e8400-e29b-41d4-a716-446655440003', 'bfe54383-7eb6-4581-969e-49a2b4b750d6', '750e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '10 days' + INTERVAL '10 hours', NOW() - INTERVAL '10 days' + INTERVAL '11 hours', NOW() - INTERVAL '10 days'),
  ('950e8400-e29b-41d4-a716-446655440004', 'bfe54383-7eb6-4581-969e-49a2b4b750d6', '750e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '7 days' + INTERVAL '10 hours', NOW() - INTERVAL '7 days' + INTERVAL '11 hours 15 minutes', NOW() - INTERVAL '7 days'),
  ('950e8400-e29b-41d4-a716-446655440005', 'bfe54383-7eb6-4581-969e-49a2b4b750d6', '750e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '5 days' + INTERVAL '10 hours', NOW() - INTERVAL '5 days' + INTERVAL '11 hours 10 minutes', NOW() - INTERVAL '5 days'),
  ('950e8400-e29b-41d4-a716-446655440006', 'bfe54383-7eb6-4581-969e-49a2b4b750d6', '750e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '3 days' + INTERVAL '10 hours', NOW() - INTERVAL '3 days' + INTERVAL '11 hours 20 minutes', NOW() - INTERVAL '3 days'),
  ('950e8400-e29b-41d4-a716-446655440007', 'bfe54383-7eb6-4581-969e-49a2b4b750d6', '750e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '1 day' + INTERVAL '10 hours', NOW() - INTERVAL '1 day' + INTERVAL '11 hours', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Treningi Anny (user) - ostatnie 2 tygodnie
INSERT INTO workouts (id, user_id, training_plan_id, start_time, end_time, created_at) VALUES
  ('950e8400-e29b-41d4-a716-446655440008', '65a9651d-d0d2-4b69-bbfa-9a09a239d9a9', '750e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '13 days' + INTERVAL '18 hours', NOW() - INTERVAL '13 days' + INTERVAL '19 hours', NOW() - INTERVAL '13 days'),
  ('950e8400-e29b-41d4-a716-446655440009', '65a9651d-d0d2-4b69-bbfa-9a09a239d9a9', '750e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '11 days' + INTERVAL '18 hours', NOW() - INTERVAL '11 days' + INTERVAL '19 hours', NOW() - INTERVAL '11 days'),
  ('950e8400-e29b-41d4-a716-446655440010', '65a9651d-d0d2-4b69-bbfa-9a09a239d9a9', '750e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '9 days' + INTERVAL '18 hours', NOW() - INTERVAL '9 days' + INTERVAL '19 hours', NOW() - INTERVAL '9 days'),
  ('950e8400-e29b-41d4-a716-446655440011', '65a9651d-d0d2-4b69-bbfa-9a09a239d9a9', '750e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '6 days' + INTERVAL '18 hours', NOW() - INTERVAL '6 days' + INTERVAL '19 hours 10 minutes', NOW() - INTERVAL '6 days'),
  ('950e8400-e29b-41d4-a716-446655440012', '65a9651d-d0d2-4b69-bbfa-9a09a239d9a9', '750e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '4 days' + INTERVAL '18 hours', NOW() - INTERVAL '4 days' + INTERVAL '19 hours 5 minutes', NOW() - INTERVAL '4 days'),
  ('950e8400-e29b-41d4-a716-446655440013', '65a9651d-d0d2-4b69-bbfa-9a09a239d9a9', '750e8400-e29b-41d4-a716-446655440003', NOW() - INTERVAL '2 days' + INTERVAL '18 hours', NOW() - INTERVAL '2 days' + INTERVAL '19 hours 15 minutes', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- ===========================
-- 8. WORKOUT SETS (serie wykonane podczas treningów)
-- ===========================

-- Przykładowe serie z ostatniego treningu Jana
INSERT INTO workout_sets (id, workout_id, exercise_id, set_order, repetitions, weight, completed, modified_at) VALUES
  -- Wyciskanie sztangi
  ('a50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', 1, 8, 80.0, true, NOW() - INTERVAL '1 day' + INTERVAL '10 hours 5 minutes'),
  ('a50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', 2, 8, 80.0, true, NOW() - INTERVAL '1 day' + INTERVAL '10 hours 10 minutes'),
  ('a50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', 3, 7, 80.0, true, NOW() - INTERVAL '1 day' + INTERVAL '10 hours 15 minutes'),
  -- Wyciskanie hantli skos
  ('a50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440002', 1, 10, 30.0, true, NOW() - INTERVAL '1 day' + INTERVAL '10 hours 25 minutes'),
  ('a50e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440002', 2, 10, 30.0, true, NOW() - INTERVAL '1 day' + INTERVAL '10 hours 30 minutes'),
  ('a50e8400-e29b-41d4-a716-446655440006', '950e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440002', 3, 9, 30.0, true, NOW() - INTERVAL '1 day' + INTERVAL '10 hours 35 minutes')
ON CONFLICT (id) DO NOTHING;

-- Przykładowe serie z ostatniego treningu Anny
INSERT INTO workout_sets (id, workout_id, exercise_id, set_order, repetitions, weight, completed, modified_at) VALUES
  -- Przysiad
  ('a50e8400-e29b-41d4-a716-446655440007', '950e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440013', 1, 12, 40.0, true, NOW() - INTERVAL '2 days' + INTERVAL '18 hours 5 minutes'),
  ('a50e8400-e29b-41d4-a716-446655440008', '950e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440013', 2, 12, 40.0, true, NOW() - INTERVAL '2 days' + INTERVAL '18 hours 10 minutes'),
  ('a50e8400-e29b-41d4-a716-446655440009', '950e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440013', 3, 11, 40.0, true, NOW() - INTERVAL '2 days' + INTERVAL '18 hours 15 minutes'),
  -- Wyciskanie
  ('a50e8400-e29b-41d4-a716-446655440010', '950e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440001', 1, 10, 30.0, true, NOW() - INTERVAL '2 days' + INTERVAL '18 hours 25 minutes'),
  ('a50e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440001', 2, 10, 30.0, true, NOW() - INTERVAL '2 days' + INTERVAL '18 hours 30 minutes'),
  ('a50e8400-e29b-41d4-a716-446655440012', '950e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440001', 3, 9, 30.0, true, NOW() - INTERVAL '2 days' + INTERVAL '18 hours 35 minutes')
ON CONFLICT (id) DO NOTHING;

-- ===========================
-- VERIFICATION
-- ===========================

DO $$
DECLARE
  profile_count INTEGER;
  category_count INTEGER;
  exercise_count INTEGER;
  plan_count INTEGER;
  workout_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO category_count FROM categories;
  SELECT COUNT(*) INTO exercise_count FROM exercises;
  SELECT COUNT(*) INTO plan_count FROM training_plans;
  SELECT COUNT(*) INTO workout_count FROM workouts;

  RAISE NOTICE 'Seed data verification:';
  RAISE NOTICE '  Profiles: %', profile_count;
  RAISE NOTICE '  Categories: %', category_count;
  RAISE NOTICE '  Exercises: %', exercise_count;
  RAISE NOTICE '  Training Plans: %', plan_count;
  RAISE NOTICE '  Workouts: %', workout_count;

  IF profile_count < 2 THEN
    RAISE WARNING 'Expected at least 2 profiles, found %', profile_count;
  END IF;

  IF category_count < 8 THEN
    RAISE WARNING 'Expected at least 8 categories, found %', category_count;
  END IF;

  IF exercise_count < 30 THEN
    RAISE WARNING 'Expected at least 30 exercises, found %', exercise_count;
  END IF;
END $$;
