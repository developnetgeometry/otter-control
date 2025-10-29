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
