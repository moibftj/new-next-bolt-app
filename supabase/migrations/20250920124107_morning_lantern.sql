/*
# Row Level Security Policies

1. Security Setup
   - Enable RLS on all tables
   - Create policies for role-based access
   - Ensure users can only access their own data
   - Allow admins to access all data
   - Allow employees to manage their coupons

2. Policy Structure
   - Users: Can read/write their own data
   - Employees: Can read/write their own data + manage coupons
   - Admins: Can read all data for dashboard purposes
*/

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_select" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Letters policies
CREATE POLICY "letters_select_owner" ON letters
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "letters_insert_authenticated" ON letters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "letters_update_owner" ON letters
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "letters_admin_select" ON letters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Subscriptions policies
CREATE POLICY "subs_select_owner" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "subs_insert_authenticated" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subs_update_owner" ON subscriptions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "subs_admin_select" ON subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Coupons policies
CREATE POLICY "coupons_select_employee" ON coupons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND (p.role = 'employee' AND p.id = employee_profile_id)
    )
  );

CREATE POLICY "coupons_admin_select" ON coupons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "coupons_public_select" ON coupons
  FOR SELECT USING (active = true);

-- Coupon usage policies
CREATE POLICY "coupon_usage_select_involved" ON coupon_usage
  FOR SELECT USING (
    user_id = auth.uid() OR 
    employee_profile_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "coupon_usage_insert_authenticated" ON coupon_usage
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'employee')
    )
  );

-- Employee metadata policies
CREATE POLICY "employees_meta_select_own" ON employees_meta
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "employees_meta_insert_own" ON employees_meta
  FOR INSERT WITH CHECK (profile_id = auth.uid());

CREATE POLICY "employees_meta_update_own" ON employees_meta
  FOR UPDATE USING (profile_id = auth.uid());

CREATE POLICY "employees_meta_admin_select" ON employees_meta
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Transactions policies
CREATE POLICY "transactions_select_owner" ON transactions
  FOR SELECT USING (
    user_id = auth.uid() OR 
    employee_profile_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "transactions_insert_system" ON transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'employee')
    )
  );