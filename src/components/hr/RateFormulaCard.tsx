import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2 } from 'lucide-react';
import { useToggleRateFormula, useDeleteRateFormula } from '@/hooks/useOTSettings';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useState } from 'react';
import { format } from 'date-fns';

interface RateFormulaCardProps {
  formula: {
    id: string;
    formula_name: string;
    day_type: string;
    multiplier: number;
    base_formula: string;
    effective_from: string;
    effective_to?: string;
    is_active: boolean;
    employee_category?: string;
  };
  onEdit: (formula: any) => void;
}

const dayTypeLabels: Record<string, string> = {
  weekday: 'Weekday',
  saturday: 'Saturday',
  sunday: 'Sunday',
  public_holiday: 'Public Holiday',
};

export const RateFormulaCard = ({ formula, onEdit }: RateFormulaCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const toggleFormula = useToggleRateFormula();
  const deleteFormula = useDeleteRateFormula();

  const handleToggle = (checked: boolean) => {
    toggleFormula.mutate({ id: formula.id, isActive: checked });
  };

  const handleDelete = () => {
    deleteFormula.mutate(formula.id, {
      onSuccess: () => setShowDeleteDialog(false)
    });
  };

  return (
    <>
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">{formula.formula_name}</CardTitle>
              <CardDescription className="text-sm mt-1 font-mono">
                {formula.base_formula}
              </CardDescription>
            </div>
            <Badge variant={formula.is_active ? 'default' : 'secondary'}>
              {formula.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Day Type</p>
                <p className="font-medium">{dayTypeLabels[formula.day_type] || formula.day_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Multiplier</p>
                <p className="font-medium">{formula.multiplier}x</p>
              </div>
              <div>
                <p className="text-muted-foreground">Effective From</p>
                <p className="font-medium">{format(new Date(formula.effective_from), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Effective To</p>
                <p className="font-medium">
                  {formula.effective_to ? format(new Date(formula.effective_to), 'dd MMM yyyy') : 'Ongoing'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formula.is_active}
                  onCheckedChange={handleToggle}
                  disabled={toggleFormula.isPending}
                />
                <span className="text-sm text-muted-foreground">Enabled</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(formula)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Rate Formula"
        description="Are you sure you want to delete this formula? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};
