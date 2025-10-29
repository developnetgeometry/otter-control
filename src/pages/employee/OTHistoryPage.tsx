import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OTHistoryTable } from '@/components/employee/OTHistoryTable';
import { OTSummaryCards } from '@/components/employee/OTSummaryCards';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExportButton } from '@/components/shared/ExportButton';
import { useMyOTRequests, useOTSummary } from '@/hooks/useOTRequests';
import { AppLayout } from '@/components/layout/AppLayout';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import type { OtStatus } from '@/types/otms';

export default function OTHistoryPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<OtStatus | 'all'>('all');

  const { data: requests, isLoading } = useMyOTRequests();
  const { data: summary } = useOTSummary();

  // Filter requests
  const filteredRequests = requests?.filter((request) => {
    // Status filter
    if (statusFilter !== 'all' && request.status !== statusFilter) {
      return false;
    }

    // Date range filter
    if (dateRange?.from) {
      const requestDate = new Date(request.ot_date);
      if (requestDate < dateRange.from) return false;
      if (dateRange.to && requestDate > dateRange.to) return false;
    }

    return true;
  }) || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My OT History</h1>
            <p className="text-muted-foreground">View and track all your overtime requests</p>
          </div>
          <ExportButton data={filteredRequests} filename="my-ot-history" />
        </div>

        <OTSummaryCards summary={summary} />

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>OT Requests</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-full sm:w-auto"
                />
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OtStatus | 'all')}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending_verification">Pending Verification</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <OTHistoryTable requests={filteredRequests} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
