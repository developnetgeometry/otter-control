import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';
import { formatDate, formatTime, formatHours, formatCurrency } from '@/lib/otms-utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { OTRequestDetailsDialog } from './OTRequestDetailsDialog';
import type { OTRequestWithRelations } from '@/types/otms';

interface OTHistoryTableProps {
  requests: OTRequestWithRelations[];
  isLoading: boolean;
}

export const OTHistoryTable = ({ requests, isLoading }: OTHistoryTableProps) => {
  const [selectedRequest, setSelectedRequest] = useState<OTRequestWithRelations | null>(null);

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

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{formatDate(request.ot_date)}</TableCell>
                <TableCell>
                  {formatTime(request.start_time)} - {formatTime(request.end_time)}
                </TableCell>
                <TableCell>{formatHours(request.total_hours)}</TableCell>
                <TableCell>{formatCurrency(request.ot_amount)}</TableCell>
                <TableCell>
                  <StatusBadge status={request.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
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
    </>
  );
};
