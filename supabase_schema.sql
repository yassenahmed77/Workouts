-- ==============================================================================
-- WORKOUTS PRO - CLEAN SUPABASE SCHEMA
-- Profiles (users), Custom Exercises Library, Workout Plans & Logs
-- ==============================================================================

-- 1. USERS / PROFILES TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('coach', 'trainee')),
  avatar_text TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  joined_date TEXT,
  height_cm NUMERIC DEFAULT 170,
  weight_kg NUMERIC DEFAULT 70,
  target_weight_kg NUMERIC DEFAULT 70,
  goal TEXT DEFAULT 'Hypertrophy / Muscle Gain',
  assigned_plan_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. EXERCISES TABLE (Custom movements with video guide URLs & alternatives)
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_muscle TEXT NOT NULL,
  equipment TEXT NOT NULL,
  category TEXT NOT NULL,
  execution_cue TEXT,
  tips JSONB DEFAULT '[]'::jsonb,
  alternative_exercise TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. WORKOUT PLANS TABLE
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL,
  duration_weeks INTEGER DEFAULT 8,
  days_per_week INTEGER DEFAULT 4,
  days JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_for_user_id TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- 4. WORKOUT LOGS TABLE
CREATE TABLE IF NOT EXISTS workout_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT,
  day_id TEXT,
  day_name TEXT,
  date TEXT,
  duration_seconds INTEGER DEFAULT 0,
  total_volume_kg NUMERIC DEFAULT 0,
  completed_exercises JSONB DEFAULT '[]'::jsonb,
  coach_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS) & ALLOW ACCESS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access users" ON users;
CREATE POLICY "Public access users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access exercises" ON exercises;
CREATE POLICY "Public access exercises" ON exercises FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access plans" ON plans;
CREATE POLICY "Public access plans" ON plans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access workout_logs" ON workout_logs;
CREATE POLICY "Public access workout_logs" ON workout_logs FOR ALL USING (true) WITH CHECK (true);

-- 6. INITIAL PROFILES (Admin: Yassen Ahmed & Trainee: Rawan Ahmed)
INSERT INTO users (
  id, name, email, role, avatar_text, status, joined_date,
  height_cm, weight_kg, target_weight_kg, goal, assigned_plan_id, notes
)
VALUES
  (
    'coach-1',
    'Yassen Ahmed',
    'yassen.ahmed@fitness.io',
    'coach',
    'YA',
    'active',
    '2024-01-01',
    180,
    80,
    80,
    'Athletic Performance',
    NULL,
    'System Admin & Trainer.'
  ),
  (
    'user-rawan-1',
    'Rawan Ahmed',
    'rawan.ahmed@fitness.io',
    'trainee',
    'RA',
    'pending',
    '2024-08-01',
    165,
    60,
    58,
    'Fat Loss & Conditioning',
    NULL,
    'Rawan Ahmed athlete profile.'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  avatar_text = EXCLUDED.avatar_text,
  status = EXCLUDED.status,
  height_cm = EXCLUDED.height_cm,
  weight_kg = EXCLUDED.weight_kg,
  target_weight_kg = EXCLUDED.target_weight_kg,
  goal = EXCLUDED.goal,
  assigned_plan_id = EXCLUDED.assigned_plan_id,
  notes = EXCLUDED.notes;
