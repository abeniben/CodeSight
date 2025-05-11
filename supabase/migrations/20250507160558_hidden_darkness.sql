/*
  # Add edit policy for submissions table
  
  1. Changes
    - Add UPDATE policy for submissions table
      - Allows users to edit their own submissions
  
  2. Security
    - Users can only update submissions where they are the owner (user_id matches auth.uid)
*/

-- Create policy to allow authenticated users to update their own submissions
CREATE POLICY "Allow users to update own submissions"
  ON submissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);