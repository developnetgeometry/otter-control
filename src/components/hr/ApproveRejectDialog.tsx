import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useUpdateOTStatus } from '@/hooks/useOTRequests';
import { formatDate, formatTime, formatCurrency } from '@/lib/otms-utils';
import type { OTRequestWithRelations } from '@/types/otms';
import { Loader2 } from 'lucide-react';

interface ApproveRejectDialogProps {
  request: OTRequestWithRelations | null;
  action: 'approve' | 'reject';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ApproveRejectDialog = ({
  request,
  action,
  open,
  onOpenChange,
}: ApproveRejectDialogProps) => {
  const [remarks, setRemarks] = useState('');
  const updateStatus = useUpdateOTStatus();

  const handleSubmit = async () => {
    if (!request) return;

    // Validate remarks for rejection
    if (action === 'reject' && !remarks.trim()) {
      return;
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    await updateStatus.mutateAsync({
      id: request.id,
      status: newStatus,
      remarks: remarks || undefined,
      remarkField: 'hr_remarks' as const,
    });

    setRemarks('');
    onOpenChange(false);
  };

  if (!request) return null;

  const isApprove = action === 'approve';
  const title = isApprove ? 'Approve OT Request' : 'Reject OT Request';
  const description = isApprove
    ? 'Confirm approval of this overtime request.'
    : 'Please provide a reason for rejecting this overtime request.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Request Summary */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Employee:</span>
                <div className="font-medium">{request.employee?.full_name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Employee ID:</span>
                <div className="font-medium">{request.employee?.employee_id}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <div className="font-medium">{formatDate(request.ot_date)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Time:</span>
                <div className="font-medium">
                  {formatTime(request.start_time)} - {formatTime(request.end_time)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Hours:</span>
                <div className="font-medium">{request.total_hours} hrs</div>
              </div>
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <div className="font-medium">{formatCurrency(request.ot_amount)}</div>
              </div>
            </div>
            {request.reason && (
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground text-sm">Reason:</span>
                <p className="text-sm mt-1">{request.reason}</p>
              </div>
            )}
          </div>

          {/* Remarks Field */}
          <div className="space-y-2">
            <Label htmlFor="remarks">
              HR Remarks {action === 'reject' && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="remarks"
              placeholder={
                isApprove
                  ? 'Add any comments (optional)...'
                  : 'Please explain the reason for rejection...'
              }
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={4}
              className="resize-none"
            />
            {action === 'reject' && !remarks.trim() && (
              <p className="text-sm text-destructive">Remarks are required for rejection</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateStatus.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateStatus.isPending || (action === 'reject' && !remarks.trim())}
            variant={isApprove ? 'default' : 'destructive'}
          >
            {updateStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isApprove ? 'Approve' : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
