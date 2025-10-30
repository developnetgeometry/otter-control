import { supabase } from '@/integrations/supabase/client';

export const fetchOTSettings = async () => {
  const { data, error } = await supabase
    .from('ot_settings')
    .select('*')
    .limit(1)
    .single();

  if (error) throw error;
  return data;
};

export const updateOTSettings = async (settings: {
  submission_limit_days?: number;
  salary_threshold?: number;
  max_daily_hours?: number;
  rounding_rule?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('ot_settings')
    .select('id')
    .limit(1)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('ot_settings')
      .update({ ...settings, updated_by: user.id })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('ot_settings')
      .insert({ ...settings, updated_by: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const fetchRateFormulas = async () => {
  const { data, error } = await supabase
    .from('ot_rate_formulas')
    .select('*')
    .order('effective_from', { ascending: false });

  if (error) throw error;
  return data;
};

export const fetchPublicHolidays = async () => {
  const { data, error } = await supabase
    .from('public_holidays')
    .select('*')
    .order('holiday_date');

  if (error) throw error;
  return data;
};

export const createPublicHoliday = async (holiday: {
  holiday_date: string;
  holiday_name: string;
}) => {
  const { data, error } = await supabase
    .from('public_holidays')
    .insert(holiday)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePublicHoliday = async (id: string) => {
  const { error } = await supabase
    .from('public_holidays')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Eligibility Rules API
export const fetchEligibilityRules = async () => {
  const { data, error } = await supabase
    .from('ot_eligibility_rules')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createEligibilityRule = async (rule: {
  rule_name: string;
  min_salary?: number;
  max_salary?: number;
  department_ids?: string[];
  employment_types?: string[];
  is_active?: boolean;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ot_eligibility_rules')
    .insert({ ...rule, created_by: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEligibilityRule = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('ot_eligibility_rules')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEligibilityRule = async (id: string) => {
  const { error } = await supabase
    .from('ot_eligibility_rules')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const toggleEligibilityRule = async (id: string, isActive: boolean) => {
  const { data, error } = await supabase
    .from('ot_eligibility_rules')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Rate Formulas API (Enhanced)
export const createRateFormula = async (formula: {
  formula_name: string;
  day_type: 'weekday' | 'saturday' | 'sunday' | 'public_holiday';
  employee_category?: string;
  multiplier: number;
  base_formula: string;
  effective_from: string;
  effective_to?: string;
  is_active?: boolean;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ot_rate_formulas')
    .insert([{ 
      formula_name: formula.formula_name,
      day_type: formula.day_type,
      employee_category: formula.employee_category,
      multiplier: formula.multiplier,
      base_formula: formula.base_formula,
      effective_from: formula.effective_from,
      effective_to: formula.effective_to,
      is_active: formula.is_active
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateRateFormula = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('ot_rate_formulas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteRateFormula = async (id: string) => {
  const { error } = await supabase
    .from('ot_rate_formulas')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const toggleRateFormula = async (id: string, isActive: boolean) => {
  const { data, error } = await supabase
    .from('ot_rate_formulas')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Approval Thresholds API
export const fetchApprovalThresholds = async () => {
  const { data, error } = await supabase
    .from('ot_approval_thresholds')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createApprovalThreshold = async (threshold: {
  threshold_name: string;
  daily_limit_hours?: number;
  weekly_limit_hours?: number;
  monthly_limit_hours?: number;
  max_claimable_amount?: number;
  applies_to_department_ids?: string[];
  auto_block_enabled?: boolean;
  alert_recipients?: string[];
  is_active?: boolean;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ot_approval_thresholds')
    .insert({ ...threshold, created_by: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateApprovalThreshold = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('ot_approval_thresholds')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteApprovalThreshold = async (id: string) => {
  const { error } = await supabase
    .from('ot_approval_thresholds')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const toggleApprovalThreshold = async (id: string, isActive: boolean) => {
  const { data, error } = await supabase
    .from('ot_approval_thresholds')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
