import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/contexts/AuthContext';

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUpWithEmail = async (email: string, password: string) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl
    }
  });
  return { data, error };
};

export const updatePassword = async (password: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  return { data, error };
};

export const getDefaultRouteForRole = (roles: AppRole[]): string => {
  if (roles.includes('admin') || roles.includes('hr')) return '/dashboard';
  if (roles.includes('bod')) return '/bod/review';
  if (roles.includes('supervisor')) return '/supervisor/verify';
  if (roles.includes('employee')) return '/dashboard';
  return '/';
};
