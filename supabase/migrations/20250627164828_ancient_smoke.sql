/*
  # Authentication Performance Optimization

  1. Optimized trigger function for faster user creation
  2. Streamlined RLS policies with better performance
  3. Improved indexes for faster queries
  4. ON CONFLICT handling to prevent duplicate key errors
  5. Reduced database overhead for authentication operations
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_signup();

-- Create optimized trigger function
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
  -- Extract metadata with simple defaults (no complex error handling)
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'User');
  user_age := COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 12);
  
  -- Simple age group determination
  IF user_age <= 10 THEN
    user_age_group := '5-10';
  ELSIF user_age <= 15 THEN
    user_age_group := '11-15';
  ELSE
    user_age_group := '16-19';
  END IF;

  -- Fast user insert with ON CONFLICT to handle duplicates
  INSERT INTO public.users (
    id, name, age, age_group, avatar, created_at, updated_at
  ) VALUES (
    NEW.id, user_name, user_age, user_age_group, '', NOW(), NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    age = EXCLUDED.age,
    age_group = EXCLUDED.age_group,
    updated_at = NOW();

  -- Fast progress insert with ON CONFLICT
  INSERT INTO public.user_progress (
    user_id, current_level, total_lessons_completed, streak_days, 
    total_points, completed_lesson_ids, last_activity_date, created_at, updated_at
  ) VALUES (
    NEW.id, 1, 0, 1, 0, '{}', CURRENT_DATE, NOW(), NOW()
  ) ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create optimized trigger (AFTER INSERT for better performance)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- Clean up existing indexes to avoid conflicts
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_auth_id;
DROP INDEX IF EXISTS idx_user_progress_user_id_unique;
DROP INDEX IF EXISTS idx_users_id_fast;
DROP INDEX IF EXISTS idx_user_progress_user_id_fast;
DROP INDEX IF EXISTS idx_user_achievements_user_id_fast;

-- Create optimized indexes (without CONCURRENTLY)
CREATE INDEX IF NOT EXISTS idx_users_id_optimized ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id_optimized ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id_optimized ON public.user_achievements(user_id);

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_users_age_group ON public.users(age_group);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id_achievement ON public.user_achievements(user_id, achievement_id);

-- Optimize RLS policies for better performance
-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_service_all" ON public.users;

DROP POLICY IF EXISTS "Users can read own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Service role can manage progress" ON public.user_progress;
DROP POLICY IF EXISTS "progress_select_own" ON public.user_progress;
DROP POLICY IF EXISTS "progress_update_own" ON public.user_progress;
DROP POLICY IF EXISTS "progress_insert_own" ON public.user_progress;
DROP POLICY IF EXISTS "progress_service_all" ON public.user_progress;

-- Create streamlined RLS policies with optimized names
CREATE POLICY "users_select_own" ON public.users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "users_service_all" ON public.users FOR ALL TO service_role USING (true);

CREATE POLICY "progress_select_own" ON public.user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "progress_update_own" ON public.user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "progress_insert_own" ON public.user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_service_all" ON public.user_progress FOR ALL TO service_role USING (true);

-- Grant optimized permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.users TO postgres, service_role;
GRANT ALL ON public.user_progress TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_progress TO authenticated;

-- Ensure trigger function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user_signup() TO postgres, service_role;

-- Update table statistics for better query planning
ANALYZE public.users;
ANALYZE public.user_progress;
ANALYZE public.user_achievements;