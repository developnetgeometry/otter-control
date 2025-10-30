import { format } from 'date-fns';
import { useOTRequests } from '@/hooks/useOTRequests';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReportFilters } from '@/lib/api/reports';

interface ReportsTableProps {
  filters: ReportFilters;
}

export const ReportsTable = ({ filters }: ReportsTableProps) => {
  const { data: requests, isLoading } = useOTRequests(filters);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No OT records found for the selected filters
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Supervisor</TableHead>
            <TableHead>HR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request: any) => (
            <TableRow key={request.id}>
              <TableCell>{format(new Date(request.ot_date), 'PP')}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{request.employee?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{request.employee?.employee_id}</p>
                </div>
              </TableCell>
              <TableCell>{request.employee?.department?.name || '-'}</TableCell>
              <TableCell>{request.total_hours}</TableCell>
              <TableCell>RM {request.ot_amount?.toFixed(2) || '-'}</TableCell>
              <TableCell>
                <StatusBadge status={request.status} />
              </TableCell>
              <TableCell>{request.supervisor?.full_name || '-'}</TableCell>
              <TableCell>{request.hr?.full_name || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
