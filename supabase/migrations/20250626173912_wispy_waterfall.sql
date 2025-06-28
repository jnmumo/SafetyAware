/*
  # Fix user signup trigger function

  1. Updates
    - Drop and recreate the handle_new_user_signup function with proper error handling
    - Ensure the function correctly handles user metadata and creates user records
    - Add proper type casting and null checks
    - Handle the age_group enum properly

  2. Security
    - Maintains existing RLS policies
    - Ensures trigger runs with proper permissions
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_signup();

-- Create improved trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_age INTEGER;
  user_age_group age_group_enum;
BEGIN
  -- Extract and validate user metadata
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'User');
  
  -- Handle age with proper casting and validation
  BEGIN
    user_age := COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 12);
    -- Ensure age is within valid range
    IF user_age < 5 OR user_age > 19 THEN
      user_age := 12;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    user_age := 12;
  END;
  
  -- Handle age_group with proper enum casting
  BEGIN
    user_age_group := COALESCE((NEW.raw_user_meta_data->>'age_group')::age_group_enum, '11-15'::age_group_enum);
  EXCEPTION WHEN OTHERS THEN
    -- If age_group is invalid, determine from age
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

  -- Insert user record with error handling
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
    -- Log the error but don't fail the auth signup
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    -- Still create a basic user record
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
      'User',
      12,
      '11-15'::age_group_enum,
      '',
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
  END;

  -- Create user progress record with error handling
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
    -- Log the error but don't fail
    RAISE WARNING 'Failed to create user progress for %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user_signup() TO service_role;