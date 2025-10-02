/*
  # Create Achievements and Referrals Tables

  1. New Tables
    - `achievements`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users
      - `type` (text) - Achievement type (e.g., 'streak', 'milestone', 'reviewer')
      - `title` (text) - Achievement title
      - `description` (text) - Achievement description
      - `earned_at` (timestamptz) - When the achievement was earned
      - `metadata` (jsonb) - Additional data (e.g., streak count, months completed)
      - `created_at` (timestamptz)
    
    - `referrals`
      - `id` (uuid, primary key) - Unique identifier
      - `referrer_id` (uuid, foreign key) - User who referred (references auth.users)
      - `referral_code` (text, unique) - Unique referral code for the referrer
      - `referred_email` (text) - Email of referred user
      - `referred_user_id` (uuid, nullable) - User ID once they sign up (references auth.users)
      - `status` (text) - Status: 'pending', 'completed', 'rewarded'
      - `reward_amount` (numeric) - Discount amount earned
      - `completed_at` (timestamptz, nullable) - When referral was completed
      - `rewarded_at` (timestamptz, nullable) - When reward was given
      - `created_at` (timestamptz)

  2. Indexes
    - Index on user_id for achievements lookup
    - Index on referrer_id for referrals lookup
    - Unique index on referral_code

  3. Security
    - Enable RLS on both tables
    - Users can read their own achievements
    - Users can read their own referrals
    - Only authenticated users can create referrals
*/

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  earned_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code text UNIQUE NOT NULL,
  referred_email text,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  reward_amount numeric DEFAULT 0,
  completed_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_earned_at ON achievements(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Achievements policies
CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update own referrals"
  ON referrals FOR UPDATE
  TO authenticated
  USING (auth.uid() = referrer_id)
  WITH CHECK (auth.uid() = referrer_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(user_name text)
RETURNS text AS $$
DECLARE
  base_code text;
  final_code text;
  counter int := 0;
BEGIN
  -- Extract first name and convert to uppercase, limit to 6 chars
  base_code := upper(substring(regexp_replace(user_name, '[^a-zA-Z]', '', 'g') FROM 1 FOR 6));
  
  -- Add random numbers
  final_code := base_code || floor(random() * 1000)::text;
  
  -- Check uniqueness and increment if needed
  WHILE EXISTS (SELECT 1 FROM referrals WHERE referral_code = final_code) LOOP
    counter := counter + 1;
    final_code := base_code || (floor(random() * 1000) + counter)::text;
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;
