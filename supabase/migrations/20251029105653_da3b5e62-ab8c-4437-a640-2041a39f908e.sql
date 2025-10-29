-- =====================================================
-- OTMS Database Schema Migration
-- Overtime Management System - Complete Setup
-- =====================================================

-- =====================================================
-- SECTION 1: CREATE ENUMS
-- =====================================================

CREATE TYPE public.app_role AS ENUM ('employee', 'supervisor', 'hr', 'bod', 'admin');
CREATE TYPE public.day_type AS ENUM ('weekday', 'saturday', 'sunday', 'public_holiday');
CREATE TYPE public.ot_status AS ENUM ('pending_verification', 'verified', 'approved', 'reviewed', 'rejected');

-- =====================================================
-- SECTION 2: CREATE FOUNDATION TABLES
-- =====================================================

-- Departments Table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Profiles Table (Employee Details)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  basic_salary NUMERIC(10,2),
  supervisor_id UUID REFERENCES public.profiles(id),
  employment_type TEXT NOT NULL CHECK (employment_type IN ('Permanent', 'Contract', 'Internship')),
  position TEXT,
  designation TEXT,
  joining_date DATE,
  work_location TEXT,
  state TEXT,
  status TEXT DEFAULT 'pending_activation' CHECK (status IN ('pending_activation', 'active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Roles Table (RBAC)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- =====================================================
-- SECTION 3: CREATE TRIGGER FUNCTIONS
-- =====================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply trigger to profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Security Definer Function for Role Checking (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- =====================================================
-- SECTION 4: CREATE OT CONFIGURATION TABLES
-- =====================================================

-- OT Global Settings
CREATE TABLE public.ot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_limit_days INTEGER DEFAULT 3,
  salary_threshold NUMERIC(10,2) DEFAULT 4000,
  max_daily_hours NUMERIC(4,2) DEFAULT 12,
  rounding_rule TEXT DEFAULT 'nearest_0.5' CHECK (rounding_rule IN ('nearest_0.5', 'round_up', 'round_down')),
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Public Holidays
CREATE TABLE public.public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_name TEXT NOT NULL,
  holiday_date DATE UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- OT Eligibility Rules
CREATE TABLE public.ot_eligibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  min_salary NUMERIC(10,2) DEFAULT 0,
  max_salary NUMERIC(10,2) DEFAULT 999999,
  department_ids UUID[],
  role_ids TEXT[],
  employment_types TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- OT Rate Formulas
CREATE TABLE public.ot_rate_formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_name TEXT NOT NULL,
  day_type public.day_type NOT NULL,
  employee_category TEXT DEFAULT 'standard',
  base_formula TEXT NOT NULL,
  multiplier NUMERIC(4,2) NOT NULL,
  conditional_logic JSONB,
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- OT Approval Thresholds
CREATE TABLE public.ot_approval_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threshold_name TEXT NOT NULL,
  daily_limit_hours NUMERIC(4,2) DEFAULT 4,
  weekly_limit_hours NUMERIC(5,2) DEFAULT 20,
  monthly_limit_hours NUMERIC(6,2) DEFAULT 80,
  max_claimable_amount NUMERIC(10,2) DEFAULT 1000,
  auto_block_enabled BOOLEAN DEFAULT true,
  alert_recipients UUID[],
  applies_to_department_ids UUID[],
  applies_to_role_ids TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- SECTION 5: CREATE OT REQUESTS TABLE
-- =====================================================

CREATE TABLE public.ot_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  ot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_hours NUMERIC(4,2) NOT NULL,
  day_type public.day_type NOT NULL,
  reason TEXT NOT NULL,
  attachment_url TEXT,
  
  -- Calculated values
  orp NUMERIC(10,2),
  hrp NUMERIC(10,2),
  ot_amount NUMERIC(10,2),
  
  -- Workflow status
  status public.ot_status DEFAULT 'pending_verification',
  
  -- Supervisor verification
  supervisor_id UUID REFERENCES public.profiles(id),
  supervisor_verified_at TIMESTAMP WITH TIME ZONE,
  supervisor_remarks TEXT,
  
  -- HR approval
  hr_id UUID REFERENCES public.profiles(id),
  hr_approved_at TIMESTAMP WITH TIME ZONE,
  hr_remarks TEXT,
  
  -- BOD review
  bod_reviewed_at TIMESTAMP WITH TIME ZONE,
  bod_remarks TEXT,
  
  -- Audit trail
  eligibility_rule_id UUID REFERENCES public.ot_eligibility_rules(id),
  formula_id UUID REFERENCES public.ot_rate_formulas(id),
  threshold_violations JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Apply trigger to ot_requests
CREATE TRIGGER update_ot_requests_updated_at
  BEFORE UPDATE ON public.ot_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- SECTION 6: CREATE BUSINESS LOGIC FUNCTIONS
-- =====================================================

-- Function: Determine Day Type
CREATE OR REPLACE FUNCTION public.determine_day_type(ot_date DATE)
RETURNS public.day_type
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  day_of_week INTEGER;
  is_holiday BOOLEAN;
BEGIN
  -- Check if it's a public holiday
  SELECT EXISTS (
    SELECT 1 FROM public.public_holidays WHERE holiday_date = ot_date
  ) INTO is_holiday;
  
  IF is_holiday THEN
    RETURN 'public_holiday'::public.day_type;
  END IF;
  
  -- Get day of week (0 = Sunday, 6 = Saturday)
  day_of_week := EXTRACT(DOW FROM ot_date);
  
  IF day_of_week = 0 THEN
    RETURN 'sunday'::public.day_type;
  ELSIF day_of_week = 6 THEN
    RETURN 'saturday'::public.day_type;
  ELSE
    RETURN 'weekday'::public.day_type;
  END IF;
END;
$$;

-- Function: Calculate OT Amount
CREATE OR REPLACE FUNCTION public.calculate_ot_amount(
  basic_salary NUMERIC,
  total_hours NUMERIC,
  day_type public.day_type
)
RETURNS TABLE(orp NUMERIC, hrp NUMERIC, ot_amount NUMERIC)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  calc_orp NUMERIC;
  calc_hrp NUMERIC;
  calc_amount NUMERIC;
BEGIN
  -- Calculate ORP and HRP
  calc_orp := basic_salary / 26;
  calc_hrp := calc_orp / 8;
  
  -- Calculate OT amount based on day type
  CASE day_type
    WHEN 'weekday' THEN
      calc_amount := 1.5 * calc_hrp * total_hours;
    
    WHEN 'saturday' THEN
      calc_amount := 2 * calc_hrp * total_hours;
    
    WHEN 'sunday' THEN
      IF total_hours <= 4 THEN
        calc_amount := 0.5 * calc_orp;
      ELSIF total_hours <= 8 THEN
        calc_amount := 1 * calc_orp;
      ELSE
        calc_amount := (1 * calc_orp) + (2 * calc_hrp * (total_hours - 8));
      END IF;
    
    WHEN 'public_holiday' THEN
      IF total_hours <= 8 THEN
        calc_amount := 2 * calc_orp;
      ELSE
        calc_amount := (2 * calc_orp) + (3 * calc_hrp * (total_hours - 8));
      END IF;
  END CASE;
  
  RETURN QUERY SELECT 
    ROUND(calc_orp, 2),
    ROUND(calc_hrp, 2),
    ROUND(calc_amount, 2);
END;
$$;

-- Function: Check OT Eligibility
CREATE OR REPLACE FUNCTION public.check_ot_eligibility(
  employee_id UUID,
  ot_date DATE
)
RETURNS TABLE(
  is_eligible BOOLEAN,
  rule_id UUID,
  rule_name TEXT,
  reason TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  emp_record RECORD;
  rule_record RECORD;
  global_threshold NUMERIC;
BEGIN
  -- Get employee details
  SELECT 
    p.basic_salary,
    p.department_id,
    p.employment_type,
    p.supervisor_id,
    p.status
  INTO emp_record
  FROM public.profiles p
  WHERE p.id = employee_id;
  
  -- Check if employee exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'Employee not found';
    RETURN;
  END IF;
  
  -- Check if employee is active
  IF emp_record.status != 'active' THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'Employee account is not active';
    RETURN;
  END IF;
  
  -- Check if supervisor is assigned
  IF emp_record.supervisor_id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'No supervisor assigned';
    RETURN;
  END IF;
  
  -- Get global salary threshold
  SELECT salary_threshold INTO global_threshold FROM public.ot_settings LIMIT 1;
  
  -- Check salary threshold
  IF emp_record.basic_salary >= COALESCE(global_threshold, 4000) THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'Basic salary exceeds eligibility threshold';
    RETURN;
  END IF;
  
  -- Find matching eligibility rule
  SELECT 
    r.id,
    r.rule_name
  INTO rule_record
  FROM public.ot_eligibility_rules r
  WHERE r.is_active = true
    AND emp_record.basic_salary >= r.min_salary
    AND emp_record.basic_salary <= r.max_salary
    AND (r.department_ids IS NULL OR emp_record.department_id = ANY(r.department_ids))
    AND (r.employment_types IS NULL OR emp_record.employment_type = ANY(r.employment_types))
  LIMIT 1;
  
  IF rule_record.id IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'No matching eligibility rule found';
    RETURN;
  END IF;
  
  -- Employee is eligible
  RETURN QUERY SELECT true, rule_record.id, rule_record.rule_name, 'Eligible for OT'::TEXT;
END;
$$;

-- Function: Check Threshold Violations
CREATE OR REPLACE FUNCTION public.check_threshold_violations(
  employee_id UUID,
  requested_hours NUMERIC,
  requested_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  emp_dept_id UUID;
  threshold_record RECORD;
  daily_hours NUMERIC;
  weekly_hours NUMERIC;
  monthly_hours NUMERIC;
  violations JSONB := '[]'::JSONB;
BEGIN
  -- Get employee department
  SELECT department_id INTO emp_dept_id FROM public.profiles WHERE id = employee_id;
  
  -- Get applicable threshold
  SELECT 
    daily_limit_hours,
    weekly_limit_hours,
    monthly_limit_hours,
    max_claimable_amount
  INTO threshold_record
  FROM public.ot_approval_thresholds
  WHERE is_active = true
    AND (applies_to_department_ids IS NULL OR emp_dept_id = ANY(applies_to_department_ids))
  LIMIT 1;
  
  -- If no threshold found, use defaults
  IF threshold_record IS NULL THEN
    SELECT 4, 20, 80, 1000 
    INTO threshold_record;
  END IF;
  
  -- Calculate existing OT hours for the day
  SELECT COALESCE(SUM(total_hours), 0)
  INTO daily_hours
  FROM public.ot_requests
  WHERE employee_id = check_threshold_violations.employee_id
    AND ot_date = requested_date
    AND status NOT IN ('rejected');
  
  -- Check daily limit
  IF (daily_hours + requested_hours) > threshold_record.daily_limit_hours THEN
    violations := violations || jsonb_build_object(
      'type', 'daily_limit',
      'limit', threshold_record.daily_limit_hours,
      'current', daily_hours,
      'requested', requested_hours,
      'total', daily_hours + requested_hours
    );
  END IF;
  
  -- Calculate weekly hours
  SELECT COALESCE(SUM(total_hours), 0)
  INTO weekly_hours
  FROM public.ot_requests
  WHERE employee_id = check_threshold_violations.employee_id
    AND ot_date >= date_trunc('week', requested_date)
    AND ot_date < date_trunc('week', requested_date) + INTERVAL '1 week'
    AND status NOT IN ('rejected');
  
  -- Check weekly limit
  IF (weekly_hours + requested_hours) > threshold_record.weekly_limit_hours THEN
    violations := violations || jsonb_build_object(
      'type', 'weekly_limit',
      'limit', threshold_record.weekly_limit_hours,
      'current', weekly_hours,
      'requested', requested_hours,
      'total', weekly_hours + requested_hours
    );
  END IF;
  
  -- Calculate monthly hours
  SELECT COALESCE(SUM(total_hours), 0)
  INTO monthly_hours
  FROM public.ot_requests
  WHERE employee_id = check_threshold_violations.employee_id
    AND ot_date >= date_trunc('month', requested_date)
    AND ot_date < date_trunc('month', requested_date) + INTERVAL '1 month'
    AND status NOT IN ('rejected');
  
  -- Check monthly limit
  IF (monthly_hours + requested_hours) > threshold_record.monthly_limit_hours THEN
    violations := violations || jsonb_build_object(
      'type', 'monthly_limit',
      'limit', threshold_record.monthly_limit_hours,
      'current', monthly_hours,
      'requested', requested_hours,
      'total', monthly_hours + requested_hours
    );
  END IF;
  
  RETURN jsonb_build_object('violations', violations);
END;
$$;

-- Function: Get Active Formula
CREATE OR REPLACE FUNCTION public.get_active_formula(
  day_type public.day_type,
  employee_category TEXT,
  ot_date DATE
)
RETURNS TABLE(
  formula_id UUID,
  multiplier NUMERIC,
  base_formula TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.multiplier,
    f.base_formula
  FROM public.ot_rate_formulas f
  WHERE f.is_active = true
    AND f.day_type = get_active_formula.day_type
    AND f.employee_category = get_active_formula.employee_category
    AND f.effective_from <= ot_date
    AND (f.effective_to IS NULL OR f.effective_to >= ot_date)
  ORDER BY f.created_at DESC
  LIMIT 1;
END;
$$;

-- =====================================================
-- SECTION 7: ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_rate_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_approval_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_holidays ENABLE ROW LEVEL SECURITY;

-- ========== PROFILES TABLE POLICIES ==========

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Supervisors can view team profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = supervisor_id
  OR public.has_role(auth.uid(), 'supervisor')
);

CREATE POLICY "HR and Admin can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'hr')
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'bod')
);

CREATE POLICY "Users can update own non-sensitive profile fields"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "HR and Admin can insert profiles"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'hr')
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "HR and Admin can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'hr')
  OR public.has_role(auth.uid(), 'admin')
);

-- ========== USER ROLES TABLE POLICIES ==========

CREATE POLICY "Users can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only Admin can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only Admin can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only Admin can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ========== DEPARTMENTS TABLE POLICIES ==========

CREATE POLICY "All authenticated users can view departments"
ON public.departments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "HR and Admin can insert departments"
ON public.departments FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'hr')
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "HR and Admin can update departments"
ON public.departments FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'hr')
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "HR and Admin can delete departments"
ON public.departments FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'hr')
  OR public.has_role(auth.uid(), 'admin')
);

-- ========== OT REQUESTS TABLE POLICIES ==========

CREATE POLICY "Employees can view own OT requests"
ON public.ot_requests FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

CREATE POLICY "Supervisors can view team OT requests"
ON public.ot_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = ot_requests.employee_id
    AND profiles.supervisor_id = auth.uid()
  )
);

CREATE POLICY "HR, BOD, and Admin can view all OT requests"
ON public.ot_requests FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'hr')
  OR public.has_role(auth.uid(), 'bod')
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Employees can insert own OT requests"
ON public.ot_requests FOR INSERT
TO authenticated
WITH CHECK (
  employee_id = auth.uid()
  AND public.has_role(auth.uid(), 'employee')
);

CREATE POLICY "Supervisors can update team OT requests for verification"
ON public.ot_requests FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'supervisor')
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = ot_requests.employee_id
    AND profiles.supervisor_id = auth.uid()
  )
);

CREATE POLICY "HR can update OT requests for approval"
ON public.ot_requests FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'hr')
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "BOD can update OT requests for review"
ON public.ot_requests FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'bod')
  OR public.has_role(auth.uid(), 'admin')
);

-- ========== CONFIGURATION TABLES POLICIES ==========

CREATE POLICY "All authenticated users can view eligibility rules"
ON public.ot_eligibility_rules FOR SELECT
TO authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR and Admin can manage eligibility rules"
ON public.ot_eligibility_rules FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated users can view rate formulas"
ON public.ot_rate_formulas FOR SELECT
TO authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR and Admin can manage rate formulas"
ON public.ot_rate_formulas FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated users can view approval thresholds"
ON public.ot_approval_thresholds FOR SELECT
TO authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "HR and Admin can manage approval thresholds"
ON public.ot_approval_thresholds FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated users can view OT settings"
ON public.ot_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "HR and Admin can manage OT settings"
ON public.ot_settings FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated users can view public holidays"
ON public.public_holidays FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "HR and Admin can manage public holidays"
ON public.public_holidays FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'hr') OR public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- SECTION 8: STORAGE BUCKET FOR OT ATTACHMENTS
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('ot-attachments', 'ot-attachments', false);

-- RLS Policies for Storage
CREATE POLICY "Employees can upload own OT attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ot-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Employees can view own OT attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ot-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Supervisors, HR, BOD, and Admin can view all OT attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ot-attachments'
  AND (
    public.has_role(auth.uid(), 'supervisor')
    OR public.has_role(auth.uid(), 'hr')
    OR public.has_role(auth.uid(), 'bod')
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "HR and Admin can delete OT attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'ot-attachments'
  AND (
    public.has_role(auth.uid(), 'hr')
    OR public.has_role(auth.uid(), 'admin')
  )
);

-- =====================================================
-- SECTION 9: SEED DATA
-- =====================================================

-- Insert Default OT Settings
INSERT INTO public.ot_settings (submission_limit_days, salary_threshold, max_daily_hours, rounding_rule)
VALUES (3, 4000, 12, 'nearest_0.5');

-- Insert Sample Departments
INSERT INTO public.departments (name, code) VALUES
  ('Information Technology', 'IT'),
  ('Human Resources', 'HR'),
  ('Finance & Accounting', 'FIN'),
  ('Operations', 'OPS'),
  ('Sales & Marketing', 'SALES'),
  ('Customer Service', 'CS');

-- Insert Default Eligibility Rule
INSERT INTO public.ot_eligibility_rules (rule_name, min_salary, max_salary, is_active)
VALUES ('Default Eligibility (Salary < RM4000)', 0, 3999.99, true);

-- Insert Default Rate Formulas
INSERT INTO public.ot_rate_formulas (formula_name, day_type, employee_category, base_formula, multiplier, effective_from, is_active) VALUES
  ('Weekday Standard Rate', 'weekday', 'standard', '1.5 × HRP × TOH', 1.5, '2024-01-01', true),
  ('Saturday Standard Rate', 'saturday', 'standard', '2 × HRP × TOH', 2.0, '2024-01-01', true),
  ('Sunday Standard Rate', 'sunday', 'standard', 'Tiered: ≤4hr: 0.5×ORP, ≤8hr: 1×ORP, >8hr: 1×ORP + 2×HRP×(TOH-8)', 1.0, '2024-01-01', true),
  ('Public Holiday Standard Rate', 'public_holiday', 'standard', 'Tiered: ≤8hr: 2×ORP, >8hr: 2×ORP + 3×HRP×(TOH-8)', 2.0, '2024-01-01', true);

-- Insert Default Approval Threshold
INSERT INTO public.ot_approval_thresholds (threshold_name, daily_limit_hours, weekly_limit_hours, monthly_limit_hours, max_claimable_amount, auto_block_enabled, is_active)
VALUES ('Default Company Threshold', 4, 20, 80, 1000, true, true);

-- Insert 2025 Malaysian Public Holidays (Fixed date issue)
INSERT INTO public.public_holidays (holiday_name, holiday_date) VALUES
  ('New Year''s Day', '2025-01-01'),
  ('Thaipusam', '2025-01-28'),
  ('Chinese New Year', '2025-02-12'),
  ('Chinese New Year (2nd Day)', '2025-02-13'),
  ('Nuzul Al-Quran', '2025-03-28'),
  ('Hari Raya Aidilfitri', '2025-04-10'),
  ('Hari Raya Aidilfitri (2nd Day)', '2025-04-11'),
  ('Labour Day', '2025-05-01'),
  ('Wesak Day', '2025-05-12'),
  ('Agong''s Birthday', '2025-06-07'),
  ('Hari Raya Aidiladha', '2025-06-17'),
  ('Awal Muharram', '2025-07-07'),
  ('Merdeka Day', '2025-08-31'),
  ('Prophet Muhammad''s Birthday', '2025-09-05'),
  ('Malaysia Day', '2025-09-16'),
  ('Deepavali', '2025-10-20'),
  ('Christmas Day', '2025-12-25');

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================