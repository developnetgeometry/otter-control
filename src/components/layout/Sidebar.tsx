import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  History, 
  CheckSquare, 
  Users as UsersIcon,
  FileCheck, 
  BarChart3, 
  Settings, 
  Building2, 
  ClipboardList,
  TrendingUp,
  Shield,
  CalendarDays
} from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types/otms';

const navigationItems: NavItem[] = [
  // Employee routes
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['employee', 'supervisor', 'hr', 'bod', 'admin'] },
  { title: 'Submit OT', href: '/ot/submit', icon: Clock, roles: ['employee'] },
  { title: 'My OT History', href: '/ot/history', icon: History, roles: ['employee'] },
  
  // Supervisor routes
  { title: 'Verify OT', href: '/supervisor/verify', icon: CheckSquare, roles: ['supervisor'] },
  { title: 'Team OT History', href: '/supervisor/team-history', icon: History, roles: ['supervisor'] },
  
  // HR routes
  { title: 'Employees', href: '/hr/employees', icon: UsersIcon, roles: ['hr', 'admin'] },
  { title: 'Approve OT', href: '/hr/approve', icon: FileCheck, roles: ['hr', 'admin'] },
  { title: 'Reports', href: '/hr/reports', icon: BarChart3, roles: ['hr', 'admin'] },
  { title: 'OT Settings', href: '/hr/settings', icon: Settings, roles: ['hr', 'admin'] },
  { title: 'Departments', href: '/hr/departments', icon: Building2, roles: ['hr', 'admin'] },
  
  // BOD routes
  { title: 'Review OT', href: '/bod/review', icon: ClipboardList, roles: ['bod', 'admin'] },
  { title: 'Analytics', href: '/bod/analytics', icon: TrendingUp, roles: ['bod', 'admin'] },
  
  // Admin routes
  { title: 'User Roles', href: '/admin/roles', icon: Shield, roles: ['admin'] },
  { title: 'System Settings', href: '/admin/system-settings', icon: CalendarDays, roles: ['admin'] },
];

export const Sidebar = () => {
  const location = useLocation();
  const { hasAnyRole } = useRole();
  
  const visibleItems = navigationItems.filter(item => hasAnyRole(item.roles));
  
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 border-r bg-card">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary">OTMS</h1>
        <p className="text-sm text-muted-foreground">Overtime Management</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
