import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useRateFormulas } from '@/hooks/useOTSettings';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const RateFormulasTable = () => {
  const { data: formulas, isLoading } = useRateFormulas();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const dayTypeLabels: Record<string, string> = {
    weekday: 'Weekday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    public_holiday: 'Public Holiday'
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Formula Name</TableHead>
              <TableHead>Day Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Multiplier</TableHead>
              <TableHead>Effective From</TableHead>
              <TableHead>Effective To</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formulas && formulas.length > 0 ? (
              formulas.map((formula) => (
                <TableRow key={formula.id}>
                  <TableCell className="font-medium">{formula.formula_name}</TableCell>
                  <TableCell>{dayTypeLabels[formula.day_type] || formula.day_type}</TableCell>
                  <TableCell className="capitalize">{formula.employee_category}</TableCell>
                  <TableCell>{formula.multiplier}x</TableCell>
                  <TableCell>{format(new Date(formula.effective_from), 'PP')}</TableCell>
                  <TableCell>
                    {formula.effective_to ? format(new Date(formula.effective_to), 'PP') : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={formula.is_active ? 'default' : 'secondary'}>
                      {formula.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No rate formulas found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Note: Rate formulas are managed by system administrators. Contact IT for modifications.
      </p>
    </div>
  );
};
