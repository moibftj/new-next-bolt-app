/*
# Initial Database Schema for Talk To My Lawyer

1. New Tables
   - `profiles` - User profiles extending auth.users with role information
   - `letters` - Generated legal letters with AI metadata
   - `employees_meta` - Employee-specific data including coupon codes
   - `coupons` - Discount coupons managed by employees
   - `coupon_usage` - Tracking coupon usage and commissions
   - `subscriptions` - User subscription plans and status
   - `transactions` - Payment transactions and commission tracking

2. Security
   - All tables will have RLS enabled in next migration
   - Proper foreign key relationships established
   - Default values set for consistency
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text,
  name text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'employee', 'admin')),
  is_subscribed boolean DEFAULT false,
  subscription_plan text,
  points int DEFAULT 0,
  commission_earned numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Letters table
CREATE TABLE IF NOT EXISTS letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  sender_name text,
  sender_address text,
  attorney_name text,
  recipient_name text,
  matter text,
  resolution text,
  content text,
  status text DEFAULT 'received' CHECK (status IN ('received', 'under_review', 'approved', 'posted')),
  generated_by_ai boolean DEFAULT true,
  ai_meta jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employee metadata table
CREATE TABLE IF NOT EXISTS employees_meta (
  profile_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  coupon_code text UNIQUE,
  points int DEFAULT 0,
  commission_earned numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  employee_profile_id uuid REFERENCES profiles(id),
  percent_off int DEFAULT 20,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS coupon_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES coupons(id),
  employee_profile_id uuid REFERENCES profiles(id),
  user_id uuid REFERENCES profiles(id),
  subscription_id uuid REFERENCES subscriptions(id),
  revenue numeric,
  created_at timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  plan text CHECK (plan IN ('one_letter', 'four_letters', 'eight_letters')),
  price numeric,
  stripe_session_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  subscription_id uuid REFERENCES subscriptions(id),
  amount_cents int,
  coupon_id uuid REFERENCES coupons(id),
  employee_profile_id uuid REFERENCES profiles(id),
  commission_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_letters_user_id ON letters(user_id);
CREATE INDEX IF NOT EXISTS idx_letters_status ON letters(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_employee ON coupon_usage(employee_profile_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_letters_updated_at BEFORE UPDATE ON letters
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();