import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ThresholdWarningProps {
  totalHours: number;
  otDate: string;
}

export const ThresholdWarning = ({ totalHours, otDate }: ThresholdWarningProps) => {
  const { user } = useAuth();
  const [violations, setViolations] = useState<any[]>([]);

  useEffect(() => {
    const checkThresholds = async () => {
      if (!user || !otDate) return;

      const { data, error } = await supabase.rpc('check_threshold_violations', {
        employee_id: user.id,
        requested_hours: totalHours,
        requested_date: otDate,
      });

      if (error) {
        console.error('Threshold check error:', error);
        return;
      }

      const result = data as { violations: any[] };
      setViolations(result?.violations || []);
    };

    checkThresholds();
  }, [user, totalHours, otDate]);

  if (violations.length === 0) return null;

  return (
    <Alert variant="destructive" className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-400">Threshold Warnings</AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-500">
        <ul className="list-disc list-inside space-y-1 mt-2">
          {violations.map((violation, index) => (
            <li key={index}>
              <strong>{violation.type.replace('_', ' ').toUpperCase()}</strong>: 
              Current: {violation.current}h, Requested: {violation.requested}h, 
              Total: {violation.total}h exceeds limit of {violation.limit}h
            </li>
          ))}
        </ul>
        <p className="mt-2 text-sm">
          You can still submit this request, but it may require additional approval.
        </p>
      </AlertDescription>
    </Alert>
  );
};
