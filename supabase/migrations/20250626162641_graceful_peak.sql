/*
  # Create waitlist table for email collection

  1. New Tables
    - `waitlist_entries`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `created_at` (timestamp)
      - `source` (text, optional - to track where signup came from)
      - `status` (text, default 'pending')

  2. Security
    - Enable RLS on `waitlist_entries` table
    - Add policy for anonymous users to insert their email
    - Add policy for authenticated users to read their own entries
*/

CREATE TABLE IF NOT EXISTS waitlist_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  source text DEFAULT 'landing_page',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert their email (for waitlist signup)
CREATE POLICY "Allow anonymous waitlist signup"
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

-- Allow service role to read all entries (for admin purposes)
CREATE POLICY "Service role can read all waitlist entries"
  ON waitlist_entries
  FOR SELECT
  TO service_role
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_email ON waitlist_entries (email);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_created_at ON waitlist_entries (created_at DESC);