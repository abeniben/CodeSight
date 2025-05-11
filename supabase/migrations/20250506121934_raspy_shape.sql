/*
  # Create submissions table
  
  1. New Tables
    - `submissions` table for storing code submissions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `language` (text)
      - `code` (text)
      - `created_at` (timestamp, default now())
  
  2. Security
    - Enable RLS on submissions table
    - Add policy for authenticated users to read all submissions
    - Add policy for authenticated users to insert their own submissions
*/

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all submissions
CREATE POLICY "Allow authenticated users to read all submissions"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert their own submissions
CREATE POLICY "Allow authenticated users to insert their own submissions"
  ON submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);