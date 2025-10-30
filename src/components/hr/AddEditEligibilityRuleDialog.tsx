import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useCreateEligibilityRule, useUpdateEligibilityRule } from '@/hooks/useOTSettings';
import { useDepartments } from '@/hooks/useDepartments';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect } from 'react';

const formSchema = z.object({
  rule_name: z.string().min(1, 'Rule name is required'),
  min_salary: z.coerce.number().min(0, 'Minimum salary must be 0 or greater'),
  max_salary: z.coerce.number().min(0, 'Maximum salary must be 0 or greater'),
  employment_types: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
});

interface AddEditEligibilityRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRule?: any;
}

const employmentTypeOptions = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
];

export const AddEditEligibilityRuleDialog = ({ open, onOpenChange, editRule }: AddEditEligibilityRuleDialogProps) => {
  const createRule = useCreateEligibilityRule();
  const updateRule = useUpdateEligibilityRule();
  const { data: departments } = useDepartments();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rule_name: '',
      min_salary: 0,
      max_salary: 4000,
      employment_types: [],
      is_active: true,
    },
  });

  useEffect(() => {
    if (editRule) {
      form.reset({
        rule_name: editRule.rule_name,
        min_salary: editRule.min_salary,
        max_salary: editRule.max_salary,
        employment_types: editRule.employment_types || [],
        is_active: editRule.is_active,
      });
    } else {
      form.reset({
        rule_name: '',
        min_salary: 0,
        max_salary: 4000,
        employment_types: [],
        is_active: true,
      });
    }
  }, [editRule, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editRule) {
      updateRule.mutate(
        { id: editRule.id, updates: values as any },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        }
      );
    } else {
      createRule.mutate(values as any, {
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
          <DialogTitle>{editRule ? 'Edit' : 'Add'} Eligibility Rule</DialogTitle>
          <DialogDescription>
            Define salary-based eligibility criteria for OT submissions
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="rule_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rule Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Standard Eligibility" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="min_salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Salary (RM)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Salary (RM)</FormLabel>
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
                name="employment_types"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Types (Optional)</FormLabel>
                    <div className="space-y-2">
                      {employmentTypeOptions.map((type) => (
                        <div key={type.value} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes(type.value)}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, type.value]);
                              } else {
                                field.onChange(current.filter((v) => v !== type.value));
                              }
                            }}
                          />
                          <label className="text-sm">{type.label}</label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
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
                        Enable this rule for OT eligibility checks
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
                <Button type="submit" disabled={createRule.isPending || updateRule.isPending}>
                  {createRule.isPending || updateRule.isPending ? 'Saving...' : editRule ? 'Update Rule' : 'Create Rule'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
