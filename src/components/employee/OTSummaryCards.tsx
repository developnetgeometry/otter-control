import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { formatCurrency, formatHours } from '@/lib/otms-utils';
import type { OTSummary } from '@/types/otms';

interface OTSummaryCardsProps {
  summary?: OTSummary;
}

export const OTSummaryCards = ({ summary }: OTSummaryCardsProps) => {
  if (!summary) {
    return null;
  }

  const cards = [
    {
      title: 'Total Hours',
      value: formatHours(summary.totalHours),
      icon: Clock,
      color: 'text-blue-600',
    },
    {
      title: 'Total Amount',
      value: formatCurrency(summary.totalAmount),
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Total Requests',
      value: summary.totalRequests.toString(),
      icon: FileText,
      color: 'text-purple-600',
    },
    {
      title: 'Pending',
      value: summary.pendingCount.toString(),
      icon: AlertCircle,
      color: 'text-yellow-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
