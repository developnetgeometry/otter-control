import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatDate, formatTime, formatHours, formatCurrency } from '@/lib/otms-utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OTRequestDetailsDialog } from '@/components/employee/OTRequestDetailsDialog';
import { ApproveRejectDialog } from './ApproveRejectDialog';
import type { OTRequestWithRelations } from '@/types/otms';

interface OTApprovalTableProps {
  requests: OTRequestWithRelations[];
  isLoading: boolean;
}

export const OTApprovalTable = ({ requests, isLoading }: OTApprovalTableProps) => {
  const [selectedRequest, setSelectedRequest] = useState<OTRequestWithRelations | null>(null);
  const [actionRequest, setActionRequest] = useState<{ request: OTRequestWithRelations; action: 'approve' | 'reject' } | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No OT requests found</p>
      </div>
    );
  }

  const canTakeAction = (request: OTRequestWithRelations) => {
    return request.status === 'verified';
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Supervisor</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{request.employee?.full_name}</div>
                    <div className="text-sm text-muted-foreground">{request.employee?.employee_id}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {request.employee?.department?.name || 'N/A'}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{formatDate(request.ot_date)}</TableCell>
                <TableCell className="text-sm">
                  {formatTime(request.start_time)} - {formatTime(request.end_time)}
                </TableCell>
                <TableCell>{formatHours(request.total_hours)}</TableCell>
                <TableCell className="font-medium">{formatCurrency(request.ot_amount)}</TableCell>
                <TableCell>
                  <StatusBadge status={request.status} />
                </TableCell>
                <TableCell>
                  <div className="text-sm">{request.supervisor?.full_name || 'N/A'}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canTakeAction(request) && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActionRequest({ request, action: 'approve' })}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActionRequest({ request, action: 'reject' })}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <OTRequestDetailsDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      />

      <ApproveRejectDialog
        request={actionRequest?.request || null}
        action={actionRequest?.action || 'approve'}
        open={!!actionRequest}
        onOpenChange={(open) => !open && setActionRequest(null)}
      />
    </>
  );
};
