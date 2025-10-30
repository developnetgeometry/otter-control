import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useApprovalThresholds } from '@/hooks/useOTSettings';
import { ApprovalThresholdCard } from './ApprovalThresholdCard';
import { AddEditApprovalThresholdDialog } from './AddEditApprovalThresholdDialog';

export const ApprovalThresholdsTab = () => {
  const { data: thresholds, isLoading } = useApprovalThresholds();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingThreshold, setEditingThreshold] = useState<any>(null);

  const handleEdit = (threshold: any) => {
    setEditingThreshold(threshold);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingThreshold(null);
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
              <CardTitle>Approval Thresholds</CardTitle>
              <CardDescription>
                Set daily, weekly, and monthly OT limits
              </CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Threshold
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {thresholds && thresholds.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {thresholds.map((threshold) => (
                <ApprovalThresholdCard key={threshold.id} threshold={threshold} onEdit={handleEdit} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No approval thresholds configured yet</p>
              <Button onClick={handleAdd} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create First Threshold
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddEditApprovalThresholdDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editThreshold={editingThreshold}
      />
    </>
  );
};
