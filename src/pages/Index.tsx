import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const { user, signOut } = useAuth();
  const { roles } = useRole();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to OTMS Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Logged in as:</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Your roles:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {roles.map((role) => (
                <span 
                  key={role} 
                  className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
