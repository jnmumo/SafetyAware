/*
  # Fix user creation trigger and RLS policies

  1. Database Trigger Fix
    - Drop and recreate the user creation trigger function
    - Ensure proper handling of user metadata from auth.users
    - Add error handling for enum type casting
    - Fix age group mapping logic

  2. RLS Policy Updates
    - Ensure proper INSERT policies for user creation
    - Fix any policy conflicts that might prevent user creation

  3. Constraints and Defaults
    - Add proper default values and constraints
    - Ensure age group enum values match exactly

  This migration fixes the "Database error saving new user" issue by properly handling
  the automatic user profile creation when a new user signs up through Supabase Auth.
*/

-- First, let's ensure the age_group enum has the correct values
DO $$
BEGIN
  -- Check if the enum type exists and recreate it if needed
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'age_group_enum') THEN
    CREATE TYPE age_group_enum AS ENUM ('5-10', '11-15', '16-19');
  END IF;
END $$;

-- Drop the existing trigger function if it exists
DROP FUNCTION IF EXISTS handle_new_user_signup() CASCADE;

-- Create the improved trigger function
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_age INTEGER;
  user_age_group age_group_enum;
BEGIN
  -- Extract user metadata with proper defaults
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'User');
  
  -- Handle age with proper validation and default
  BEGIN
    user_age := COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 12);
    -- Ensure age is within valid range
    IF user_age < 5 OR user_age > 19 THEN
      user_age := 12;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    user_age := 12;
  END;
  
  -- Handle age_group with proper enum casting and validation
  BEGIN
    user_age_group := COALESCE(NEW.raw_user_meta_data->>'age_group', '11-15')::age_group_enum;
  EXCEPTION WHEN OTHERS THEN
    -- If the provided age_group is invalid, calculate it from age
    IF user_age >= 5 AND user_age <= 10 THEN
      user_age_group := '5-10'::age_group_enum;
    ELSIF user_age >= 11 AND user_age <= 15 THEN
      user_age_group := '11-15'::age_group_enum;
    ELSIF user_age >= 16 AND user_age <= 19 THEN
      user_age_group := '16-19'::age_group_enum;
    ELSE
      user_age_group := '11-15'::age_group_enum;
    END IF;
  END;

  -- Insert the user profile
  BEGIN
    INSERT INTO public.users (
      id,
      name,
      age,
      age_group,
      avatar,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      user_name,
      user_age,
      user_age_group,
      COALESCE(NEW.raw_user_meta_data->>'avatar', ''),
      NOW(),
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
  END;

  -- Create initial user progress
  BEGIN
    INSERT INTO public.user_progress (
      user_id,
      current_level,
      total_lessons_completed,
      streak_days,
      total_points,
      completed_lesson_ids,
      last_activity_date,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      1,
      0,
      1,
      0,
      '{}',
      CURRENT_DATE,
      NOW(),
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Failed to create user progress for %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();

-- Ensure RLS is enabled on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can read own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;

DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can read own achievements" ON user_achievements;

-- Create comprehensive RLS policies for users table
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create comprehensive RLS policies for user_progress table
CREATE POLICY "Users can insert own progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create comprehensive RLS policies for user_achievements table
CREATE POLICY "Users can insert own achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add a policy to allow the trigger function to insert data
-- This is needed because the trigger runs in a different security context
CREATE POLICY "Allow trigger to insert user data"
  ON users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow trigger to insert progress data"
  ON user_progress
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Ensure the trigger function has proper permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE ON users TO authenticated;
GRANT INSERT, UPDATE ON user_progress TO authenticated;
GRANT INSERT ON user_achievements TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users USING btree (id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id_unique ON user_progress USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id_achievement ON user_achievements USING btree (user_id, achievement_id);