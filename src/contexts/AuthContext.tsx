import { createContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  mustChangePassword: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for employee auth from localStorage (custom auth)
    const checkEmployeeAuth = async () => {
      const employeeAuth = localStorage.getItem('employee_auth');
      if (employeeAuth) {
        const authData = JSON.parse(employeeAuth);
        setRoles(authData.roles || []);
        setMustChangePassword(authData.must_change_password || false);
        
        // If must change password, redirect
        if (authData.must_change_password && window.location.pathname !== '/change-password') {
          setTimeout(() => navigate('/change-password'), 100);
        }
      }
    };

    // Set up auth state listener FIRST (critical for session persistence)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch roles after setting session (use setTimeout to avoid deadlock)
        if (session?.user) {
          setTimeout(async () => {
            // Check for employee auth data first
            await checkEmployeeAuth();
            
            const { data } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id);
            if (data && data.length > 0) {
              setRoles(data.map((r) => r.role));
            }
            setLoading(false);
          }, 0);
        } else {
          setRoles([]);
          setMustChangePassword(false);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          // Check employee auth data
          await checkEmployeeAuth();
          
          const { data } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id);
          if (data && data.length > 0) {
            setRoles(data.map((r) => r.role));
          }
          setLoading(false);
        }, 0);
      } else {
        // Check for employee auth even without session
        await checkEmployeeAuth();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
    setMustChangePassword(false);
    localStorage.removeItem('employee_auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, roles, loading, mustChangePassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
