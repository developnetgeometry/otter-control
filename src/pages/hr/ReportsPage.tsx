import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { format, subMonths } from 'date-fns';
import { Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { ReportsSummaryCards } from '@/components/hr/ReportsSummaryCards';
import { OTTrendsChart } from '@/components/hr/OTTrendsChart';
import { DepartmentBreakdownChart } from '@/components/hr/DepartmentBreakdownChart';
import { StatusDistributionChart } from '@/components/hr/StatusDistributionChart';
import { ReportsTable } from '@/components/hr/ReportsTable';
import { useDepartments } from '@/hooks/useDepartments';
import { exportOTReport } from '@/lib/api/reports';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 3),
    to: new Date()
  });
  const [departmentId, setDepartmentId] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const { data: departments } = useDepartments();

  const filters = {
    startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
    endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
    departmentId: departmentId !== 'all' ? departmentId : undefined,
    status: status !== 'all' ? status : undefined
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csv = await exportOTReport(filters);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ot-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">OT Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive overtime reporting and insights</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <DateRangePicker value={dateRange} onChange={setDateRange} className="w-auto" />

            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_verification">Pending Verification</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExport} disabled={isExporting} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <ReportsSummaryCards filters={filters} />

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <OTTrendsChart filters={filters} />
          <DepartmentBreakdownChart filters={filters} />
        </div>

        <StatusDistributionChart filters={filters} />

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed OT Records</CardTitle>
            <CardDescription>Complete list of OT requests based on filters</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportsTable filters={filters} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
