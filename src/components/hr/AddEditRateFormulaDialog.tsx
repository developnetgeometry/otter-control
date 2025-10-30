import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateRateFormula, useUpdateRateFormula } from '@/hooks/useOTSettings';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect } from 'react';

const formSchema = z.object({
  formula_name: z.string().min(1, 'Formula name is required'),
  day_type: z.enum(['weekday', 'saturday', 'sunday', 'public_holiday']),
  employee_category: z.string().default('standard'),
  multiplier: z.coerce.number().min(0, 'Multiplier must be positive'),
  base_formula: z.string().min(1, 'Base formula is required'),
  effective_from: z.string().min(1, 'Effective from date is required'),
  effective_to: z.string().optional(),
  is_active: z.boolean().default(true),
});

interface AddEditRateFormulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editFormula?: any;
}

export const AddEditRateFormulaDialog = ({ open, onOpenChange, editFormula }: AddEditRateFormulaDialogProps) => {
  const createFormula = useCreateRateFormula();
  const updateFormula = useUpdateRateFormula();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      formula_name: '',
      day_type: 'weekday',
      employee_category: 'standard',
      multiplier: 1.5,
      base_formula: '',
      effective_from: new Date().toISOString().split('T')[0],
      effective_to: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (editFormula) {
      form.reset({
        formula_name: editFormula.formula_name,
        day_type: editFormula.day_type,
        employee_category: editFormula.employee_category || 'standard',
        multiplier: editFormula.multiplier,
        base_formula: editFormula.base_formula,
        effective_from: editFormula.effective_from,
        effective_to: editFormula.effective_to || '',
        is_active: editFormula.is_active,
      });
    } else {
      form.reset({
        formula_name: '',
        day_type: 'weekday',
        employee_category: 'standard',
        multiplier: 1.5,
        base_formula: '',
        effective_from: new Date().toISOString().split('T')[0],
        effective_to: '',
        is_active: true,
      });
    }
  }, [editFormula, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (editFormula) {
      updateFormula.mutate(
        { id: editFormula.id, updates: values as any },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        }
      );
    } else {
      createFormula.mutate(values as any, {
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
          <DialogTitle>{editFormula ? 'Edit' : 'Add'} Rate Formula</DialogTitle>
          <DialogDescription>
            Configure OT calculation formula for specific day types
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="formula_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formula Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Weekday Standard Rate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="day_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekday">Weekday</SelectItem>
                          <SelectItem value="saturday">Saturday</SelectItem>
                          <SelectItem value="sunday">Sunday</SelectItem>
                          <SelectItem value="public_holiday">Public Holiday</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="multiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Multiplier</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="base_formula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Formula</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., multiplier × HRP × TOH" {...field} />
                    </FormControl>
                    <FormDescription>
                      Use HRP (Hourly Rate of Pay), TOH (Total OT Hours), ORP (One-day Rate of Pay)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="effective_from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective From</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effective_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective To (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable this formula for OT calculations
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
                <Button type="submit" disabled={createFormula.isPending || updateFormula.isPending}>
                  {createFormula.isPending || updateFormula.isPending ? 'Saving...' : editFormula ? 'Update Formula' : 'Create Formula'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
