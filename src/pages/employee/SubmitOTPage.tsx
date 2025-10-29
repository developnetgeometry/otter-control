import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OTSubmissionForm } from '@/components/employee/OTSubmissionForm';
import { useMyOTRequests } from '@/hooks/useOTRequests';
import { AppLayout } from '@/components/layout/AppLayout';
import { Loader2 } from 'lucide-react';
import { formatDate, formatTime, getStatusConfig } from '@/lib/otms-utils';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function SubmitOTPage() {
  const { data: recentRequests, isLoading } = useMyOTRequests();

  const recent5 = recentRequests?.slice(0, 5) || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Submit OT Request</h1>
          <p className="text-muted-foreground">Fill in the form below to submit your overtime request</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>OT Request Details</CardTitle>
                <CardDescription>Provide accurate information for your overtime claim</CardDescription>
              </CardHeader>
              <CardContent>
                <OTSubmissionForm />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Your last 5 OT requests</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : recent5.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No recent submissions</p>
                ) : (
                  <div className="space-y-3">
                    {recent5.map((request) => (
                      <div key={request.id} className="border rounded-lg p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{formatDate(request.ot_date)}</span>
                          <StatusBadge status={request.status} />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatTime(request.start_time)} - {formatTime(request.end_time)} ({request.total_hours}h)
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
