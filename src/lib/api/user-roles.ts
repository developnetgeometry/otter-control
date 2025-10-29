import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/types/otms';

export const fetchUserRoles = async () => {
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      *,
      profiles(full_name, email, employee_id)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const assignRole = async (userId: string, role: AppRole) => {
  const { data, error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const revokeRole = async (id: string) => {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
