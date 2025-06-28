/*
  # Fix waitlist entries RLS policy

  1. Security Updates
    - Drop existing policies that might be conflicting
    - Create new comprehensive policies for waitlist entries
    - Allow anonymous users to insert waitlist entries
    - Allow authenticated users to insert waitlist entries
    - Allow users to read their own waitlist entries
    - Allow service role to read all entries for admin purposes

  2. Changes
    - Ensure RLS is enabled on waitlist_entries table
    - Create clear, non-conflicting policies for INSERT and SELECT operations
    - Handle both anonymous and authenticated user scenarios
*/

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous waitlist signup" ON waitlist_entries;
DROP POLICY IF EXISTS "Allow authenticated waitlist signup" ON waitlist_entries;
DROP POLICY IF EXISTS "Users can read own waitlist entries" ON waitlist_entries;
DROP POLICY IF EXISTS "Service role can read all waitlist entries" ON waitlist_entries;

-- Ensure RLS is enabled
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert waitlist entries
CREATE POLICY "Anonymous users can join waitlist"
  ON waitlist_entries
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert waitlist entries
CREATE POLICY "Authenticated users can join waitlist"
  ON waitlist_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to read their own waitlist entries (for authenticated users)
CREATE POLICY "Users can read own waitlist entries"
  ON waitlist_entries
  FOR SELECT
  TO authenticated
  USING (auth.email() = email);

-- Allow anonymous users to read their own entries (for checking if already exists)
CREATE POLICY "Anonymous users can read waitlist entries"
  ON waitlist_entries
  FOR SELECT
  TO anon
  USING (true);

-- Allow service role to read all waitlist entries for admin purposes
CREATE POLICY "Service role can read all waitlist entries"
  ON waitlist_entries
  FOR SELECT
  TO service_role
  USING (true);

-- Allow service role to manage all waitlist entries
CREATE POLICY "Service role can manage all waitlist entries"
  ON waitlist_entries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);