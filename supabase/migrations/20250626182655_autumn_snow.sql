/*
  # Fix User Signup Database Trigger

  1. Database Trigger Issues
    - Fix the `handle_new_user_signup` trigger function
    - Ensure proper error handling and data validation
    - Add proper permissions and security context

  2. Row Level Security
    - Update RLS policies to allow trigger operations
    - Ensure service role can create user records

  3. User Progress Creation
    - Ensure user_progress is created automatically
    - Handle any constraint violations gracefully
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_signup();

-- Create improved trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_age INTEGER;
  user_age_group age_group_enum;
  user_name TEXT;
BEGIN
  -- Extract user metadata with defaults
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'User');
  user_age := COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 12);
  
  -- Determine age group based on age
  IF user_age >= 5 AND user_age <= 10 THEN
    user_age_group := '5-10';
  ELSIF user_age >= 11 AND user_age <= 15 THEN
    user_age_group := '11-15';
  ELSIF user_age >= 16 AND user_age <= 19 THEN
    user_age_group := '16-19';
  ELSE
    -- Default to middle group if age is invalid
    user_age_group := '11-15';
    user_age := 12;
  END IF;

  -- Insert user profile with error handling
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
  EXCEPTION
    WHEN unique_violation THEN
      -- User already exists, update instead
      UPDATE public.users 
      SET 
        name = user_name,
        age = user_age,
        age_group = user_age_group,
        avatar = COALESCE(NEW.raw_user_meta_data->>'avatar', avatar),
        updated_at = NOW()
      WHERE id = NEW.id;
    WHEN OTHERS THEN
      -- Log error and re-raise
      RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
      RAISE;
  END;

  -- Insert user progress with error handling
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
  EXCEPTION
    WHEN unique_violation THEN
      -- Progress already exists, skip
      NULL;
    WHEN OTHERS THEN
      -- Log error but don't fail the entire operation
      RAISE LOG 'Error creating user progress for %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- Update RLS policies to allow trigger operations
-- Temporarily disable RLS to update policies
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Allow trigger to insert user data" ON public.users;

DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can read own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Allow trigger to insert progress data" ON public.user_progress;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create new policies for users table
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage users"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create new policies for user_progress table
CREATE POLICY "Users can read own progress"
  ON public.user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage progress"
  ON public.user_progress
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions to the function
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT ALL ON public.user_progress TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_progress TO authenticated;

-- Ensure the trigger function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user_signup() TO postgres, service_role;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id_unique ON public.user_progress(user_id);