import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useRateFormulas } from '@/hooks/useOTSettings';
import { RateFormulaCard } from './RateFormulaCard';
import { AddEditRateFormulaDialog } from './AddEditRateFormulaDialog';

export const RateFormulasTab = () => {
  const { data: formulas, isLoading } = useRateFormulas();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<any>(null);
  const [activeDayType, setActiveDayType] = useState<string>('all');

  const handleEdit = (formula: any) => {
    setEditingFormula(formula);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingFormula(null);
    setDialogOpen(true);
  };

  const handleDuplicate = (formula: any) => {
    const duplicatedFormula = {
      ...formula,
      id: undefined,
      formula_name: `${formula.formula_name} (Copy)`,
      effective_from: new Date().toISOString().split('T')[0],
    };
    setEditingFormula(duplicatedFormula);
    setDialogOpen(true);
  };

  const dayTypeLabels: Record<string, string> = {
    weekday: 'Weekday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    public_holiday: 'Public Holiday'
  };

  const filteredFormulas = formulas?.filter(f => 
    activeDayType === 'all' || f.day_type === activeDayType
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">OT Rate Formulas</h2>
            <p className="text-sm text-gray-500 mt-1">Define overtime rate calculation formulas by day type</p>
          </div>
          <Button onClick={handleAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Formula
          </Button>
        </div>

        {/* Day Type Tabs */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={activeDayType === 'all' ? 'default' : 'outline'} 
            onClick={() => setActiveDayType('all')}
            size="sm"
          >
            All
          </Button>
          <Button 
            variant={activeDayType === 'weekday' ? 'default' : 'outline'} 
            onClick={() => setActiveDayType('weekday')}
            size="sm"
          >
            Weekday
          </Button>
          <Button 
            variant={activeDayType === 'saturday' ? 'default' : 'outline'} 
            onClick={() => setActiveDayType('saturday')}
            size="sm"
          >
            Saturday
          </Button>
          <Button 
            variant={activeDayType === 'sunday' ? 'default' : 'outline'} 
            onClick={() => setActiveDayType('sunday')}
            size="sm"
          >
            Sunday
          </Button>
          <Button 
            variant={activeDayType === 'public_holiday' ? 'default' : 'outline'} 
            onClick={() => setActiveDayType('public_holiday')}
            size="sm"
          >
            Public Holiday
          </Button>
        </div>

        {/* Formula Cards */}
        {filteredFormulas.length > 0 ? (
          <div className="space-y-4">
            {filteredFormulas.map((formula) => (
              <RateFormulaCard 
                key={formula.id} 
                formula={formula} 
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 mb-4">
              {activeDayType === 'all' 
                ? 'No rate formulas configured yet'
                : `No formulas configured for ${dayTypeLabels[activeDayType]}`
              }
            </p>
            <Button onClick={handleAdd} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create First Formula
            </Button>
          </div>
        )}
      </div>

      <AddEditRateFormulaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editFormula={editingFormula}
      />
    </>
  );
};
