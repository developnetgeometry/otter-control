import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/AppLayout';
import { Clock, CheckSquare, Users, FileCheck, TrendingUp, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const { roles, isEmployee, isSupervisor, isHR, isBOD } = useRole();

  const getRoleBasedContent = () => {
    if (isEmployee()) {
      return {
        title: 'Employee Dashboard',
        description: 'Submit and track your overtime requests',
        actions: [
          { label: 'Submit OT Request', href: '/ot/submit', icon: Clock },
          { label: 'View My OT History', href: '/ot/history', icon: FileCheck }
        ]
      };
    }
    
    if (isSupervisor()) {
      return {
        title: 'Supervisor Dashboard',
        description: 'Verify and manage team overtime requests',
        actions: [
          { label: 'Verify OT Requests', href: '/supervisor/verify', icon: CheckSquare },
          { label: 'Team OT History', href: '/supervisor/team-history', icon: FileCheck }
        ]
      };
    }
    
    if (isHR()) {
      return {
        title: 'HR Dashboard',
        description: 'Manage employees and approve overtime requests',
        actions: [
          { label: 'Manage Employees', href: '/hr/employees', icon: Users },
          { label: 'Approve OT Requests', href: '/hr/approve', icon: FileCheck },
          { label: 'View Reports', href: '/hr/reports', icon: TrendingUp }
        ]
      };
    }
    
    if (isBOD()) {
      return {
        title: 'BOD Dashboard',
        description: 'Review overtime requests and analytics',
        actions: [
          { label: 'Review OT Requests', href: '/bod/review', icon: FileCheck },
          { label: 'View Analytics', href: '/bod/analytics', icon: TrendingUp }
        ]
      };
    }
    
    return {
      title: 'Dashboard',
      description: 'Welcome to OTMS',
      actions: []
    };
  };

  const content = getRoleBasedContent();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground mt-2">{user?.email}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{content.title}</CardTitle>
            <CardDescription>{content.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <span 
                  key={role} 
                  className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {role}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {content.actions.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {content.actions.map((action) => {
              const Icon = action.icon;
              return (
                <Card key={action.href} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{action.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link to={action.href}>
                      <Button variant="ghost" className="w-full justify-between group">
                        Go to page
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your overtime summary will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Statistics and recent activity will be displayed once you start using the system.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Index;
