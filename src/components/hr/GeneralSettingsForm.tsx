import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOTSettings, useUpdateOTSettings } from '@/hooks/useOTSettings';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const formSchema = z.object({
  submission_limit_days: z.coerce.number().min(1).max(30),
  salary_threshold: z.coerce.number().min(0),
  max_daily_hours: z.coerce.number().min(1).max(24),
  rounding_rule: z.string()
});

export const GeneralSettingsForm = () => {
  const { data: settings, isLoading } = useOTSettings();
  const updateSettings = useUpdateOTSettings();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      submission_limit_days: settings?.submission_limit_days || 3,
      salary_threshold: settings?.salary_threshold || 4000,
      max_daily_hours: settings?.max_daily_hours || 12,
      rounding_rule: settings?.rounding_rule || 'nearest_0.5'
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateSettings.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="submission_limit_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Submission Limit (Days)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="3" {...field} />
              </FormControl>
              <FormDescription>
                Maximum number of days back employees can submit OT claims
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salary_threshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary Threshold (RM)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="4000" {...field} />
              </FormControl>
              <FormDescription>
                Maximum basic salary for OT eligibility
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_daily_hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Daily Hours</FormLabel>
              <FormControl>
                <Input type="number" placeholder="12" {...field} />
              </FormControl>
              <FormDescription>
                Maximum OT hours allowed per day
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rounding_rule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rounding Rule</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rounding rule" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="nearest_0.5">Nearest 0.5 hour</SelectItem>
                  <SelectItem value="nearest_1">Nearest 1 hour</SelectItem>
                  <SelectItem value="exact">Exact (no rounding)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How OT hours should be rounded
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {settings?.updated_at && (
          <p className="text-sm text-muted-foreground">
            Last updated: {format(new Date(settings.updated_at), 'PPP p')}
          </p>
        )}

        <Button type="submit" disabled={updateSettings.isPending}>
          {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </form>
    </Form>
  );
};
