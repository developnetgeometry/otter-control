import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle } from 'lucide-react';

interface EligibilityCheckProps {
  eligibility: {
    isEligible: boolean;
    reason: string;
  };
}

export const EligibilityCheck = ({ eligibility }: EligibilityCheckProps) => {
  if (eligibility.isEligible) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800 dark:text-green-400">Eligible for OT</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-500">
          {eligibility.reason}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertTitle>Not Eligible for OT</AlertTitle>
      <AlertDescription>{eligibility.reason}</AlertDescription>
    </Alert>
  );
};
