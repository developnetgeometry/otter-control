import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Copy, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { useToggleRateFormula, useDeleteRateFormula } from '@/hooks/useOTSettings';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

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
  onDuplicate: (formula: any) => void;
}

const dayTypeLabels: Record<string, string> = {
  weekday: 'Weekday',
  saturday: 'Saturday',
  sunday: 'Sunday',
  public_holiday: 'Public Holiday',
};

export const RateFormulaCard = ({ formula, onEdit, onDuplicate }: RateFormulaCardProps) => {
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
      <Card className="border border-gray-200 rounded-xl shadow-sm bg-white">
        <CardContent className="p-5 space-y-3">
          {/* Header: Title + Subtitle + Badge */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{formula.formula_name}</h3>
              <p className="text-sm text-gray-500">
                {dayTypeLabels[formula.day_type]} | {formula.employee_category || 'All'}
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
              {formula.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Formula Expression Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-3">
            <Calculator className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="font-mono text-sm text-gray-800 break-all">
              {formula.base_formula}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm pt-2">
            <div>
              <p className="text-gray-500">Multiplier</p>
              <p className="font-medium text-gray-900">{formula.multiplier}×</p>
            </div>
            <div>
              <p className="text-gray-500">Effective From</p>
              <p className="font-medium text-gray-900">{format(new Date(formula.effective_from), 'dd MMM yyyy')}</p>
            </div>
            {formula.effective_to && (
              <div>
                <p className="text-gray-500">Effective To</p>
                <p className="font-medium text-gray-900">{format(new Date(formula.effective_to), 'dd MMM yyyy')}</p>
              </div>
            )}
          </div>

          {/* Actions Row */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Switch
                checked={formula.is_active}
                onCheckedChange={handleToggle}
                disabled={toggleFormula.isPending}
              />
              <span className="text-sm text-gray-600">Enabled</span>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDuplicate(formula)} 
                title="Duplicate Formula"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEdit(formula)} 
                title="Edit Formula"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDeleteDialog(true)} 
                title="Delete Formula"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
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
