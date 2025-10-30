import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOTRequests } from '@/hooks/useOTRequests';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReportFilters } from '@/lib/api/reports';

interface StatusDistributionChartProps {
  filters: ReportFilters;
}

const COLORS = {
  approved: 'hsl(var(--chart-1))',
  rejected: 'hsl(var(--chart-2))',
  verified: 'hsl(var(--chart-3))',
  pending_verification: 'hsl(var(--chart-4))'
};

export const StatusDistributionChart = ({ filters }: StatusDistributionChartProps) => {
  const { data: requests, isLoading } = useOTRequests(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const statusCounts = requests?.reduce((acc: any, req: any) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(statusCounts || {}).map(([status, count]) => ({
    name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count,
    status
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
        <CardDescription>OT requests by status</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || '#888'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
