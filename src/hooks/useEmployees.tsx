import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEmployees, fetchEmployeeById, createEmployee, updateEmployee, updateEmployeeStatus, getNextEmployeeId } from '@/lib/api/employees';
import { useToast } from '@/hooks/use-toast';

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => fetchEmployeeById(id),
    enabled: !!id
  });
};

export const useNextEmployeeId = () => {
  return useQuery({
    queryKey: ['next-employee-id'],
    queryFn: getNextEmployeeId,
    staleTime: 0,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['next-employee-id'] });
      toast({
        title: 'Success',
        description: 'Employee created successfully'
      });
    },
    onError: (error: any) => {
      // Check for duplicate employee_id error
      if (error.message?.includes('duplicate key') || error.code === '23505') {
        toast({
          title: 'Error',
          description: 'Employee ID already exists. Please try again.',
          variant: 'destructive'
        });
        queryClient.invalidateQueries({ queryKey: ['next-employee-id'] });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create employee',
          variant: 'destructive'
        });
      }
    }
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateEmployee(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Success',
        description: 'Employee updated successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update employee',
        variant: 'destructive'
      });
    }
  });
};

export const useUpdateEmployeeStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateEmployeeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: 'Success',
        description: 'Employee status updated successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive'
      });
    }
  });
};
