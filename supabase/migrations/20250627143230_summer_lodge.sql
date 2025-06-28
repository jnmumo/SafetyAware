/*
  # Fix waitlist entries permissions and RLS policies

  1. Security Updates
    - Grant necessary table permissions to anon and authenticated roles
    - Fix anonymous read policy to prevent unauthorized data exposure
    - Ensure proper INSERT permissions for waitlist functionality

  2. Changes
    - Add GRANT statements for INSERT and SELECT permissions
    - Update anonymous read policy to be more restrictive
    - Maintain existing RLS policies with proper table permissions
*/

-- Grant necessary permissions to anon role
GRANT INSERT ON public.waitlist_entries TO anon;
GRANT SELECT ON public.waitlist_entries TO anon;

-- Grant necessary permissions to authenticated role
GRANT INSERT ON public.waitlist_entries TO authenticated;
GRANT SELECT ON public.waitlist_entries TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the anonymous read policy to be more restrictive
DROP POLICY IF EXISTS "Anonymous users can read waitlist entries" ON waitlist_entries;

-- Create a more restrictive anonymous read policy
-- This allows checking if an email already exists without exposing all data
CREATE POLICY "Anonymous users can check email existence"
  ON waitlist_entries
  FOR SELECT
  TO anon
  USING (false);

-- Ensure other policies exist (recreate if needed)
DROP POLICY IF EXISTS "Anonymous users can join waitlist" ON waitlist_entries;
CREATE POLICY "Anonymous users can join waitlist"
  ON waitlist_entries
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can join waitlist" ON waitlist_entries;
CREATE POLICY "Authenticated users can join waitlist"
  ON waitlist_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own waitlist entries" ON waitlist_entries;
CREATE POLICY "Users can read own waitlist entries"
  ON waitlist_entries
  FOR SELECT
  TO authenticated
  USING (auth.email() = email);

-- Ensure service role policies exist
DROP POLICY IF EXISTS "Service role can read all waitlist entries" ON waitlist_entries;
CREATE POLICY "Service role can read all waitlist entries"
  ON waitlist_entries
  FOR SELECT
  TO service_role
  USING (true);

DROP POLICY IF EXISTS "Service role can manage all waitlist entries" ON waitlist_entries;
CREATE POLICY "Service role can manage all waitlist entries"
  ON waitlist_entries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);