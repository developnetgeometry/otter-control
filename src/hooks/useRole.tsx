import { useAuth } from './useAuth';
import type { AppRole } from '@/contexts/AuthContext';

export const useRole = () => {
  const { roles } = useAuth();
  
  const hasRole = (role: AppRole) => roles.includes(role);
  
  const hasAnyRole = (checkRoles: AppRole[]) => 
    checkRoles.some(role => roles.includes(role));
  
  const isAdmin = () => roles.includes('admin');
  const isHR = () => roles.includes('hr') || isAdmin();
  const isSupervisor = () => roles.includes('supervisor');
  const isEmployee = () => roles.includes('employee');
  const isBOD = () => roles.includes('bod');

  return { 
    roles,
    hasRole, 
    hasAnyRole, 
    isAdmin, 
    isHR, 
    isSupervisor, 
    isEmployee, 
    isBOD 
  };
};
