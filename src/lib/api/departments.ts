import { supabase } from '@/integrations/supabase/client';

export interface Department {
  id: string;
  code: string;
  name: string;
  created_at: string;
}

export const fetchDepartments = async () => {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as Department[];
};

export const createDepartment = async (department: { code: string; name: string }) => {
  const { data, error } = await supabase
    .from('departments')
    .insert(department)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateDepartment = async (id: string, updates: { code?: string; name?: string }) => {
  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteDepartment = async (id: string) => {
  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const fetchDepartmentWithEmployeeCount = async (id: string) => {
  const [deptResult, countResult] = await Promise.all([
    supabase.from('departments').select('*').eq('id', id).single(),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('department_id', id)
  ]);

  if (deptResult.error) throw deptResult.error;

  return {
    ...deptResult.data,
    employee_count: countResult.count || 0
  };
};
