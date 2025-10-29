import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchOTRequests, 
  fetchMyOTRequests, 
  fetchTeamOTRequests,
  createOTRequest, 
  updateOTRequestStatus,
  fetchOTSummary 
} from '@/lib/api/ot-requests';
import { useToast } from '@/hooks/use-toast';

export const useOTRequests = (filters?: any) => {
  return useQuery({
    queryKey: ['ot-requests', filters],
    queryFn: () => fetchOTRequests(filters)
  });
};

export const useMyOTRequests = () => {
  return useQuery({
    queryKey: ['my-ot-requests'],
    queryFn: fetchMyOTRequests
  });
};

export const useTeamOTRequests = () => {
  return useQuery({
    queryKey: ['team-ot-requests'],
    queryFn: fetchTeamOTRequests
  });
};

export const useOTSummary = (employeeId?: string) => {
  return useQuery({
    queryKey: ['ot-summary', employeeId],
    queryFn: () => fetchOTSummary(employeeId)
  });
};

export const useCreateOTRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createOTRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-ot-requests'] });
      queryClient.invalidateQueries({ queryKey: ['ot-summary'] });
      toast({
        title: 'Success',
        description: 'OT request submitted successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit OT request',
        variant: 'destructive'
      });
    }
  });
};

export const useUpdateOTStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, status, remarks, remarkField }: any) => 
      updateOTRequestStatus(id, status, remarks, remarkField),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ot-requests'] });
      queryClient.invalidateQueries({ queryKey: ['team-ot-requests'] });
      toast({
        title: 'Success',
        description: 'OT request updated successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update OT request',
        variant: 'destructive'
      });
    }
  });
};
