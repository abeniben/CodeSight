/*
  # Add review votes and replies tables
  
  1. New Tables
    - `review_votes` table for storing likes/dislikes
      - `id` (uuid, primary key)
      - `review_id` (uuid, references reviews)
      - `user_id` (uuid, references auth.users)
      - `vote` (boolean, true for like, false for dislike)
      - `created_at` (timestamp, default now())
    
    - `replies` table for storing nested replies
      - `id` (uuid, primary key)
      - `review_id` (uuid, references reviews)
      - `parent_id` (uuid, self-reference for nested replies)
      - `user_id` (uuid, references auth.users)
      - `user_email` (text)
      - `comment` (text)
      - `created_at` (timestamp, default now())
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read all votes and replies
      - Create their own votes and replies
      - Update their own votes and replies
      - Delete their own votes and replies
*/

-- Create review_votes table
CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  vote BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(review_id, user_id)
);

-- Create replies table
CREATE TABLE IF NOT EXISTS replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  user_email TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

-- Policies for review_votes
CREATE POLICY "Allow authenticated users to read all votes"
  ON review_votes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert their own votes"
  ON review_votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own votes"
  ON review_votes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own votes"
  ON review_votes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Policies for replies
CREATE POLICY "Allow authenticated users to read all replies"
  ON replies FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert their own replies"
  ON replies FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own replies"
  ON replies FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own replies"
  ON replies FOR DELETE TO authenticated
  USING (auth.uid() = user_id);