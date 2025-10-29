import { supabase } from '@/integrations/supabase/client';
import type { EmployeeProfile } from '@/types/otms';

export const fetchEmployees = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      department:departments(name, code),
      supervisor:profiles!profiles_supervisor_id_fkey(full_name, email)
    `)
    .order('full_name');

  if (error) throw error;
  return data as any as EmployeeProfile[];
};

export const fetchEmployeeById = async (id: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      department:departments(name, code),
      supervisor:profiles!profiles_supervisor_id_fkey(full_name, email)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as any as EmployeeProfile;
};

export const createEmployee = async (employee: {
  id: string;
  full_name: string;
  employee_id: string;
  email: string;
  department_id?: string;
  position?: string;
  designation?: string;
  employment_type: string;
  basic_salary?: number;
  work_location?: string;
  state?: string;
  supervisor_id?: string;
  joining_date?: string;
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([employee])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEmployee = async (id: string, updates: Partial<EmployeeProfile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEmployeeStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
