/*
# Seed Data for Talk To My Lawyer

1. Test Users
   - Admin user for dashboard access
   - Regular users for testing letter generation
   - Employee user with coupon code

2. Sample Data
   - Test letters in various states
   - Employee coupons
   - Sample subscriptions
*/

-- Insert test admin user (you'll need to create this user in Supabase Auth first)
-- This is just the profile data - the auth user must be created separately
INSERT INTO profiles (id, email, name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@talktomylawyer.com', 'Admin User', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Insert test users
INSERT INTO profiles (id, email, name, role, is_subscribed, subscription_plan) VALUES
  ('00000000-0000-0000-0000-000000000002', 'user1@example.com', 'John Doe', 'user', true, 'four_letters'),
  ('00000000-0000-0000-0000-000000000003', 'user2@example.com', 'Jane Smith', 'user', false, null),
  ('00000000-0000-0000-0000-000000000004', 'employee1@example.com', 'Bob Johnson', 'employee', false, null)
ON CONFLICT (id) DO NOTHING;

-- Insert employee metadata
INSERT INTO employees_meta (profile_id, coupon_code, points, commission_earned) VALUES
  ('00000000-0000-0000-0000-000000000004', 'SAVE20BOB', 5, 149.50)
ON CONFLICT (profile_id) DO NOTHING;

-- Insert coupons
INSERT INTO coupons (code, employee_profile_id, percent_off, active) VALUES
  ('SAVE20BOB', '00000000-0000-0000-0000-000000000004', 20, true),
  ('WELCOME20', '00000000-0000-0000-0000-000000000004', 20, true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample letters
INSERT INTO letters (
  user_id, 
  title, 
  sender_name, 
  sender_address, 
  attorney_name, 
  recipient_name, 
  matter, 
  resolution, 
  content, 
  status,
  ai_meta
) VALUES
  (
    '00000000-0000-0000-0000-000000000002',
    'Demand Letter - Unpaid Invoice',
    'John Doe',
    '123 Main St, Anytown, ST 12345',
    'Smith & Associates Law Firm',
    'ABC Company',
    'Unpaid invoice #12345 for services rendered',
    'Payment of $5,000 within 30 days',
    'Dear ABC Company,\n\nThis letter serves as formal demand for payment of outstanding invoice #12345 in the amount of $5,000...',
    'posted',
    '{"schema_version":"1.0","title":"Demand Letter - Unpaid Invoice","date":"2024-01-15","tone":"firm but professional","summary":"Formal demand for payment of overdue invoice","tags":["payment","invoice","demand"]}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Cease and Desist - Trademark Infringement',
    'John Doe',
    '123 Main St, Anytown, ST 12345',
    'Smith & Associates Law Firm',
    'XYZ Corporation',
    'Unauthorized use of trademarked logo',
    'Immediate cessation of trademark use',
    'Dear XYZ Corporation,\n\nWe represent John Doe regarding the unauthorized use of his registered trademark...',
    'under_review',
    '{"schema_version":"1.0","title":"Cease and Desist - Trademark Infringement","date":"2024-01-20","tone":"firm but professional","summary":"Demand to stop trademark infringement","tags":["trademark","cease and desist","intellectual property"]}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Contract Dispute Resolution',
    'Jane Smith',
    '456 Oak Ave, Another City, ST 67890',
    'Johnson Legal Group',
    'Contractor LLC',
    'Breach of construction contract terms',
    'Completion of work per original agreement',
    'Dear Contractor LLC,\n\nThis letter addresses the breach of contract regarding the construction project...',
    'received',
    '{"schema_version":"1.0","title":"Contract Dispute Resolution","date":"2024-01-25","tone":"professional","summary":"Request for contract compliance","tags":["contract","construction","dispute"]}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample subscriptions
INSERT INTO subscriptions (user_id, plan, price, status) VALUES
  ('00000000-0000-0000-0000-000000000002', 'four_letters', 299.00, 'active'),
  ('00000000-0000-0000-0000-000000000003', 'one_letter', 299.00, 'pending')
ON CONFLICT (id) DO NOTHING;

-- Insert sample transactions
INSERT INTO transactions (user_id, subscription_id, amount_cents, coupon_id, employee_profile_id, commission_paid) 
SELECT 
  s.user_id,
  s.id,
  (s.price * 100)::int,
  c.id,
  c.employee_profile_id,
  true
FROM subscriptions s
LEFT JOIN coupons c ON c.code = 'SAVE20BOB'
WHERE s.user_id = '00000000-0000-0000-0000-000000000002'
ON CONFLICT (id) DO NOTHING;