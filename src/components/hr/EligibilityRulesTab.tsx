import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useEligibilityRules } from '@/hooks/useOTSettings';
import { EligibilityRuleCard } from './EligibilityRuleCard';
import { AddEditEligibilityRuleDialog } from './AddEditEligibilityRuleDialog';

export const EligibilityRulesTab = () => {
  const { data: rules, isLoading } = useEligibilityRules();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingRule(null);
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
              <CardTitle>Eligibility Rules</CardTitle>
              <CardDescription>
                Define salary-based eligibility for OT submissions
              </CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rules && rules.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {rules.map((rule) => (
                <EligibilityRuleCard key={rule.id} rule={rule} onEdit={handleEdit} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No eligibility rules configured yet</p>
              <Button onClick={handleAdd} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create First Rule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddEditEligibilityRuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editRule={editingRule}
      />
    </>
  );
};
