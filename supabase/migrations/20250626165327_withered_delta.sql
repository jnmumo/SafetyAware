/*
  # Fix waitlist RLS policy for anonymous users

  1. Security Updates
    - Drop existing policies that may be conflicting
    - Create a clear policy for anonymous users to insert waitlist entries
    - Ensure authenticated users can read their own entries
    - Allow service role to read all entries for admin purposes

  2. Changes
    - Remove any conflicting INSERT policies
    - Add proper INSERT policy for anonymous (anon) role
    - Maintain existing SELECT policies
    - Ensure RLS is enabled on the table
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous waitlist signup" ON waitlist_entries;
DROP POLICY IF EXISTS "Users can read own waitlist entries" ON waitlist_entries;
DROP POLICY IF EXISTS "Service role can read all waitlist entries" ON waitlist_entries;

-- Ensure RLS is enabled
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert into waitlist
CREATE POLICY "Enable anonymous waitlist signup"
  ON waitlist_entries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read their own waitlist entries
CREATE POLICY "Users can read own waitlist entries"
  ON waitlist_entries
  FOR SELECT
  TO authenticated
  USING (email = auth.email());

-- Allow service role to read all waitlist entries (for admin purposes)
CREATE POLICY "Service role can read all waitlist entries"
  ON waitlist_entries
  FOR SELECT
  TO service_role
  USING (true);

-- Allow authenticated users to insert their own waitlist entries
CREATE POLICY "Authenticated users can insert waitlist entries"
  ON waitlist_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);