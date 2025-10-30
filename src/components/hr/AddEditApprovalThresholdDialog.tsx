import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useCreateApprovalThreshold, useUpdateApprovalThreshold } from '@/hooks/useOTSettings';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect } from 'react';

const formSchema = z.object({
  threshold_name: z.string().min(1, 'Threshold name is required'),
  daily_limit_hours: z.coerce.number().min(0, 'Daily limit must be 0 or greater'),
  weekly_limit_hours: z.coerce.number().min(0, 'Weekly limit must be 0 or greater'),
  monthly_limit_hours: z.coerce.number().min(0, 'Monthly limit must be 0 or greater'),
  max_claimable_amount: z.coerce.number().min(0, 'Max claimable amount must be 0 or greater'),
  auto_block_enabled: z.boolean().default(true),
  is_active: z.boolean().default(true),
});

interface AddEditApprovalThresholdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editThreshold?: any;
}

export const AddEditApprovalThresholdDialog = ({ open, onOpenChange, editThreshold }: AddEditApprovalThresholdDialogProps) => {
  const createThreshold = useCreateApprovalThreshold();
  const updateThreshold = useUpdateApprovalThreshold();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      threshold_name: '',
      daily_limit_hours: 4,
      weekly_limit_hours: 20,
      monthly_limit_hours: 80,
      max_claimable_amount: 1000,
      auto_block_enabled: true,
      is_active: true,
    },
  });

  useEffect(() => {
    if (editThreshold) {
      form.reset({
        threshold_name: editThreshold.threshold_name,
        daily_limit_hours: editThreshold.daily_limit_hours,
        weekly_limit_hours: editThreshold.weekly_limit_hours,
        monthly_limit_hours: editThreshold.monthly_limit_hours,
        max_claimable_amount: editThreshold.max_claimable_amount,
        auto_block_enabled: editThreshold.auto_block_enabled,
        is_active: editThreshold.is_active,
      });
    } else {
      form.reset({
        threshold_name: '',
        daily_limit_hours: 4,
        weekly_limit_hours: 20,
        monthly_limit_hours: 80,
        max_claimable_amount: 1000,
        auto_block_enabled: true,
        is_active: true,
      });
    }
  }, [editThreshold, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editThreshold) {
      updateThreshold.mutate(
        { id: editThreshold.id, updates: values as any },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        }
      );
    } else {
      createThreshold.mutate(values as any, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{editThreshold ? 'Edit' : 'Add'} Approval Threshold</DialogTitle>
          <DialogDescription>
            Set daily, weekly, and monthly OT limits and maximum claimable amounts
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="threshold_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Threshold Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Default Threshold" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="daily_limit_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Limit (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weekly_limit_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weekly Limit (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthly_limit_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Limit (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="max_claimable_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Claimable Amount (RM)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auto_block_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Auto-Block</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Automatically block submissions that exceed limits
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable this threshold for OT approval checks
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createThreshold.isPending || updateThreshold.isPending}>
                  {createThreshold.isPending || updateThreshold.isPending ? 'Saving...' : editThreshold ? 'Update Threshold' : 'Create Threshold'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
