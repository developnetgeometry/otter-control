import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2 } from 'lucide-react';
import { useToggleApprovalThreshold, useDeleteApprovalThreshold } from '@/hooks/useOTSettings';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useState } from 'react';

interface ApprovalThresholdCardProps {
  threshold: {
    id: string;
    threshold_name: string;
    daily_limit_hours?: number;
    weekly_limit_hours?: number;
    monthly_limit_hours?: number;
    max_claimable_amount?: number;
    auto_block_enabled?: boolean;
    is_active: boolean;
  };
  onEdit: (threshold: any) => void;
}

export const ApprovalThresholdCard = ({ threshold, onEdit }: ApprovalThresholdCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const toggleThreshold = useToggleApprovalThreshold();
  const deleteThreshold = useDeleteApprovalThreshold();

  const handleToggle = (checked: boolean) => {
    toggleThreshold.mutate({ id: threshold.id, isActive: checked });
  };

  const handleDelete = () => {
    deleteThreshold.mutate(threshold.id, {
      onSuccess: () => setShowDeleteDialog(false)
    });
  };

  return (
    <>
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold">{threshold.threshold_name}</CardTitle>
              <CardDescription className="text-sm mt-1">
                Daily: {threshold.daily_limit_hours || 0}h • Weekly: {threshold.weekly_limit_hours || 0}h • Monthly: {threshold.monthly_limit_hours || 0}h
              </CardDescription>
            </div>
            <Badge variant={threshold.is_active ? 'default' : 'secondary'}>
              {threshold.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Max Claimable</p>
                <p className="font-medium">RM {threshold.max_claimable_amount?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Auto-Block</p>
                <Badge variant={threshold.auto_block_enabled ? 'default' : 'outline'}>
                  {threshold.auto_block_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  checked={threshold.is_active}
                  onCheckedChange={handleToggle}
                  disabled={toggleThreshold.isPending}
                />
                <span className="text-sm text-muted-foreground">Enabled</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(threshold)}
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
        title="Delete Approval Threshold"
        description="Are you sure you want to delete this threshold? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};
