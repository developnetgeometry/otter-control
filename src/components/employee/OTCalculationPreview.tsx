import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatHours, getDayTypeLabel, getDayTypeColor } from '@/lib/otms-utils';
import { Calculator } from 'lucide-react';
import type { DayType } from '@/types/otms';

interface OTCalculationPreviewProps {
  calculations: {
    totalHours: number;
    dayType: DayType;
    orp: number;
    hrp: number;
    otAmount: number;
  };
}

export const OTCalculationPreview = ({ calculations }: OTCalculationPreviewProps) => {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5" />
          Calculation Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Day Type:</span>
          <Badge className={getDayTypeColor(calculations.dayType)}>
            {getDayTypeLabel(calculations.dayType)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Hours</p>
            <p className="text-lg font-semibold">{formatHours(calculations.totalHours)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">OT Amount</p>
            <p className="text-lg font-semibold text-primary">{formatCurrency(calculations.otAmount)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">ORP (Ordinary Rate)</p>
            <p className="text-sm font-medium">{formatCurrency(calculations.orp)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">HRP (Hourly Rate)</p>
            <p className="text-sm font-medium">{formatCurrency(calculations.hrp)}</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Calculation: Based on {getDayTypeLabel(calculations.dayType)} rate formula
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
