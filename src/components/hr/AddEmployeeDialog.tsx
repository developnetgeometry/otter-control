import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCreateEmployee, useNextEmployeeId } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  employee_id: z.string().optional(),
  email: z.string().email('Invalid email address'),
  department_id: z.string().optional(),
  position: z.string().optional(),
  employment_type: z.enum(['Permanent', 'Contract', 'Internship'], {
    required_error: 'Employment type is required',
  }),
  basic_salary: z.coerce.number().min(0).optional(),
  joining_date: z.string().optional(),
  default_password: z.string().min(8, 'Password must be at least 8 characters').default('Temp@1234'),
});

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddEmployeeDialog = ({ open, onOpenChange }: AddEmployeeDialogProps) => {
  const createEmployee = useCreateEmployee();
  const { data: departments } = useDepartments();
  const { data: nextEmployeeId, isLoading: isLoadingNextId } = useNextEmployeeId();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employment_type: 'Permanent',
      default_password: 'Temp@1234',
    },
  });

  useEffect(() => {
    if (nextEmployeeId && open) {
      form.setValue('employee_id', nextEmployeeId);
    }
  }, [nextEmployeeId, open, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const employeeData = {
      full_name: values.full_name,
      employee_id: values.employee_id || nextEmployeeId || 'EMP001',
      email: values.email,
      employment_type: values.employment_type,
      department_id: values.department_id,
      position: values.position,
      basic_salary: values.basic_salary,
      joining_date: values.joining_date,
      default_password: values.default_password,
    };
    createEmployee.mutate(employeeData, {
      onSuccess: (data) => {
        form.reset();
        onOpenChange(false);
        
        // Show credentials in success message
        if (data?.credentials) {
          const message = `Employee ${values.full_name} has been successfully registered.\n\nEmployee ID: ${data.credentials.employee_id}\nDefault Password: ${data.credentials.default_password}\n\nPlease share these credentials with the employee securely.`;
          // Toast will be shown by the mutation hook, but we could add additional UI here
          console.log(message);
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Create a new employee profile in the system
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-muted/50 border border-border rounded-lg p-4">
                  <FormLabel className="text-sm font-medium">Employee ID</FormLabel>
                  <div className="mt-1 flex items-center gap-2">
                    {isLoadingNextId ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Generating ID...</span>
                      </div>
                    ) : (
                      <p className="text-lg font-semibold">{nextEmployeeId || 'EMP001'}</p>
                    )}
                    <Badge variant="secondary" className="ml-2">Auto-generated</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">This ID is automatically assigned</p>
                </div>
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments?.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="basic_salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Basic Salary (RM)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="employment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Permanent">Permanent</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="joining_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joining Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="default_password"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Default Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          placeholder="e.g., Temp@1234" 
                          {...field} 
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Employee will be required to change this password on first login
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createEmployee.isPending}>
                  {createEmployee.isPending ? 'Creating...' : 'Create Employee'}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

