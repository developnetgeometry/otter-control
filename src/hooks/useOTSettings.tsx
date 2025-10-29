import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOTSettings, updateOTSettings, fetchRateFormulas, fetchPublicHolidays, createPublicHoliday, deletePublicHoliday } from '@/lib/api/settings';
import { useToast } from '@/hooks/use-toast';

export const useOTSettings = () => {
  return useQuery({
    queryKey: ['ot-settings'],
    queryFn: fetchOTSettings
  });
};

export const useUpdateOTSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateOTSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ot-settings'] });
      toast({
        title: 'Success',
        description: 'OT settings updated successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive'
      });
    }
  });
};

export const useRateFormulas = () => {
  return useQuery({
    queryKey: ['rate-formulas'],
    queryFn: fetchRateFormulas
  });
};

export const usePublicHolidays = () => {
  return useQuery({
    queryKey: ['public-holidays'],
    queryFn: fetchPublicHolidays
  });
};

export const useCreatePublicHoliday = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createPublicHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-holidays'] });
      toast({
        title: 'Success',
        description: 'Public holiday added successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add holiday',
        variant: 'destructive'
      });
    }
  });
};

export const useDeletePublicHoliday = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deletePublicHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-holidays'] });
      toast({
        title: 'Success',
        description: 'Public holiday deleted successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete holiday',
        variant: 'destructive'
      });
    }
  });
};
