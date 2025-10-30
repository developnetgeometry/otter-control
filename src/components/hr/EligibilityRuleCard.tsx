import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2 } from 'lucide-react';
import { useToggleEligibilityRule, useDeleteEligibilityRule } from '@/hooks/useOTSettings';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useState } from 'react';

interface EligibilityRuleCardProps {
  rule: {
    id: string;
    rule_name: string;
    min_salary: number;
    max_salary: number;
    department_ids?: string[];
    employment_types?: string[];
    is_active: boolean;
  };
  onEdit: (rule: any) => void;
}

export const EligibilityRuleCard = ({ rule, onEdit }: EligibilityRuleCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const toggleRule = useToggleEligibilityRule();
  const deleteRule = useDeleteEligibilityRule();

  const handleToggle = (checked: boolean) => {
    toggleRule.mutate({ id: rule.id, isActive: checked });
  };

  const handleDelete = () => {
    deleteRule.mutate(rule.id, {
      onSuccess: () => setShowDeleteDialog(false)
    });
  };

  return (
    <>
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">{rule.rule_name}</CardTitle>
              <CardDescription className="text-sm mt-1">
                Salary Range: RM {rule.min_salary.toLocaleString()} - RM {rule.max_salary.toLocaleString()}
              </CardDescription>
            </div>
            <Badge variant={rule.is_active ? 'default' : 'secondary'}>
              {rule.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rule.employment_types && rule.employment_types.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Employment Types:</p>
                <div className="flex flex-wrap gap-1">
                  {rule.employment_types.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.is_active}
                  onCheckedChange={handleToggle}
                  disabled={toggleRule.isPending}
                />
                <span className="text-sm text-muted-foreground">Enabled</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(rule)}
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
        title="Delete Eligibility Rule"
        description="Are you sure you want to delete this rule? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};
