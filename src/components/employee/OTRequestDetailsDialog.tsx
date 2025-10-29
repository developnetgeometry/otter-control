import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate, formatTime, formatHours, formatCurrency, formatDateTime, getDayTypeLabel, getDayTypeColor } from '@/lib/otms-utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Calendar, Clock, DollarSign, FileText, User, MessageSquare } from 'lucide-react';
import type { OTRequestWithRelations } from '@/types/otms';

interface OTRequestDetailsDialogProps {
  request: OTRequestWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OTRequestDetailsDialog = ({ request, open, onOpenChange }: OTRequestDetailsDialogProps) => {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>OT Request Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <StatusBadge status={request.status} />
          </div>

          <Separator />

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">OT Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(request.ot_date)}</p>
              </div>
              <Badge className={getDayTypeColor(request.day_type)}>
                {getDayTypeLabel(request.day_type)}
              </Badge>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Time Period</p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(request.start_time)} - {formatTime(request.end_time)} ({formatHours(request.total_hours)})
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">OT Amount</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(request.ot_amount)}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                  <div>ORP: {formatCurrency(request.orp)}</div>
                  <div>HRP: {formatCurrency(request.hrp)}</div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Reason</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.reason}</p>
              </div>
            </div>

            {request.attachment_url && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Attachment</p>
                  <a
                    href={request.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Document
                  </a>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Approval Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold">Approval Timeline</h3>

            {/* Supervisor */}
            {request.supervisor_verified_at && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Supervisor Verification</span>
                  <Badge variant="outline" className="ml-auto">
                    {formatDateTime(request.supervisor_verified_at)}
                  </Badge>
                </div>
                {request.supervisor_remarks && (
                  <div className="ml-6 p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Remarks:</p>
                    <p className="text-sm">{request.supervisor_remarks}</p>
                  </div>
                )}
              </div>
            )}

            {/* HR */}
            {request.hr_approved_at && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">HR Approval</span>
                  <Badge variant="outline" className="ml-auto">
                    {formatDateTime(request.hr_approved_at)}
                  </Badge>
                </div>
                {request.hr_remarks && (
                  <div className="ml-6 p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Remarks:</p>
                    <p className="text-sm">{request.hr_remarks}</p>
                  </div>
                )}
              </div>
            )}

            {/* BOD */}
            {request.bod_reviewed_at && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">BOD Review</span>
                  <Badge variant="outline" className="ml-auto">
                    {formatDateTime(request.bod_reviewed_at)}
                  </Badge>
                </div>
                {request.bod_remarks && (
                  <div className="ml-6 p-3 bg-muted rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Remarks:</p>
                    <p className="text-sm">{request.bod_remarks}</p>
                  </div>
                )}
              </div>
            )}

            {/* Rejection remarks */}
            {request.status === 'rejected' && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Request Rejected</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {request.supervisor_remarks || request.hr_remarks || request.bod_remarks || 'No reason provided'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Metadata */}
          <div className="text-xs text-muted-foreground">
            <p>Submitted: {formatDateTime(request.created_at)}</p>
            {request.updated_at !== request.created_at && (
              <p>Last Updated: {formatDateTime(request.updated_at)}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
