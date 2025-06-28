/*
  # Fix waitlist entries RLS policy

  1. Security Updates
    - Drop existing policies that might be conflicting
    - Create a clear policy for anonymous users to insert waitlist entries
    - Ensure authenticated users can also insert entries
    - Maintain read permissions for users to see their own entries

  This migration fixes the RLS policy issue preventing anonymous users from signing up for the waitlist.
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable anonymous waitlist signup" ON waitlist_entries;
DROP POLICY IF EXISTS "Authenticated users can insert waitlist entries" ON waitlist_entries;
DROP POLICY IF EXISTS "Users can read own waitlist entries" ON waitlist_entries;
DROP POLICY IF EXISTS "Service role can read all waitlist entries" ON waitlist_entries;

-- Create new policies with clear permissions
CREATE POLICY "Allow anonymous waitlist signup"
  ON waitlist_entries
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated waitlist signup"
  ON waitlist_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own waitlist entries"
  ON waitlist_entries
  FOR SELECT
  TO authenticated
  USING (email = auth.email());

CREATE POLICY "Service role can read all waitlist entries"
  ON waitlist_entries
  FOR SELECT
  TO service_role
  USING (true);