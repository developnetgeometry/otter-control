import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDepartmentBreakdown } from '@/hooks/useReports';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReportFilters } from '@/lib/api/reports';

interface DepartmentBreakdownChartProps {
  filters: ReportFilters;
}

export const DepartmentBreakdownChart = ({ filters }: DepartmentBreakdownChartProps) => {
  const { data: breakdown, isLoading } = useDepartmentBreakdown(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Department Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Breakdown</CardTitle>
        <CardDescription>OT hours by department</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={breakdown}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="hours" fill="hsl(var(--primary))" name="Hours" />
            <Bar dataKey="count" fill="hsl(var(--chart-3))" name="Requests" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
