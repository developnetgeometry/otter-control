import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOTTrends } from '@/hooks/useReports';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { ReportFilters } from '@/lib/api/reports';

interface OTTrendsChartProps {
  filters: ReportFilters;
}

export const OTTrendsChart = ({ filters }: OTTrendsChartProps) => {
  const { data: trends, isLoading } = useOTTrends(filters);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OT Trends</CardTitle>
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
        <CardTitle>OT Trends</CardTitle>
        <CardDescription>Overtime hours and amount over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="hours"
              stroke="hsl(var(--primary))"
              name="Hours"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="amount"
              stroke="hsl(var(--chart-2))"
              name="Amount (RM)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
