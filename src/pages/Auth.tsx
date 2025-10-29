import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';
import { SetPasswordForm } from '@/components/auth/SetPasswordForm';
import { getDefaultRouteForRole } from '@/lib/auth';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, roles, loading } = useAuth();
  const [isSetPassword, setIsSetPassword] = useState(false);

  useEffect(() => {
    // Check if this is a password recovery or invitation link
    const type = searchParams.get('type');
    if (type === 'recovery' || type === 'invite') {
      setIsSetPassword(true);
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect authenticated users to their default dashboard
    if (!loading && user && roles.length > 0) {
      const defaultRoute = getDefaultRouteForRole(roles);
      navigate(defaultRoute, { replace: true });
    }
  }, [user, roles, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSetPassword ? 'Set Your Password' : 'Overtime Management System'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSetPassword 
              ? 'Create a password to activate your account' 
              : 'Sign in to your account to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSetPassword ? <SetPasswordForm /> : <LoginForm />}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
