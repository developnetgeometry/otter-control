import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/contexts/AuthContext';

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signInWithEmployeeId = async (employeeId: string, password: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('authenticate-employee', {
      body: { employee_id: employeeId, password }
    });

    if (error) {
      return { data: null, error: { message: 'Authentication failed' } };
    }

    if (!data.success) {
      return { data: null, error: { message: data.error || 'Invalid Employee ID or Password' } };
    }

    // If email_otp is returned, verify it to establish a session
    if (data.session?.email_otp) {
      const { error: otpError } = await supabase.auth.verifyOtp({
        type: 'email',
        email: `${employeeId}@otms.internal`,
        token: data.session.email_otp
      });

      if (otpError) {
        console.error('OTP verification error:', otpError);
      }
    }

    // Store user info in localStorage for auth context
    localStorage.setItem('employee_auth', JSON.stringify({
      user_id: data.user.id,
      employee_id: data.user.employee_id,
      full_name: data.user.full_name,
      roles: data.user.roles,
      must_change_password: data.user.must_change_password
    }));

    return { data: data.user, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error: { message: 'An unexpected error occurred' } };
  }
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
