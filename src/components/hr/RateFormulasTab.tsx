import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useRateFormulas } from '@/hooks/useOTSettings';
import { RateFormulaCard } from './RateFormulaCard';
import { AddEditRateFormulaDialog } from './AddEditRateFormulaDialog';

export const RateFormulasTab = () => {
  const { data: formulas, isLoading } = useRateFormulas();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<any>(null);

  const handleEdit = (formula: any) => {
    setEditingFormula(formula);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingFormula(null);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rate Formulas</CardTitle>
              <CardDescription>
                Configure daily OT pay calculation rates
              </CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Formula
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {formulas && formulas.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {formulas.map((formula) => (
                <RateFormulaCard key={formula.id} formula={formula} onEdit={handleEdit} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No rate formulas configured yet</p>
              <Button onClick={handleAdd} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create First Formula
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddEditRateFormulaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editFormula={editingFormula}
      />
    </>
  );
};
