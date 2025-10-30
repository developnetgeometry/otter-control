import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchOTSettings, 
  updateOTSettings, 
  fetchRateFormulas, 
  fetchPublicHolidays, 
  createPublicHoliday, 
  deletePublicHoliday,
  fetchEligibilityRules,
  createEligibilityRule,
  updateEligibilityRule,
  deleteEligibilityRule,
  toggleEligibilityRule,
  createRateFormula,
  updateRateFormula,
  deleteRateFormula,
  toggleRateFormula,
  fetchApprovalThresholds,
  createApprovalThreshold,
  updateApprovalThreshold,
  deleteApprovalThreshold,
  toggleApprovalThreshold
} from '@/lib/api/settings';
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

// Eligibility Rules Hooks
export const useEligibilityRules = () => {
  return useQuery({
    queryKey: ['eligibility-rules'],
    queryFn: fetchEligibilityRules
  });
};

export const useCreateEligibilityRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createEligibilityRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligibility-rules'] });
      toast({
        title: 'Success',
        description: 'Eligibility rule created successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create eligibility rule',
        variant: 'destructive'
      });
    }
  });
};

export const useUpdateEligibilityRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateEligibilityRule(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligibility-rules'] });
      toast({
        title: 'Success',
        description: 'Eligibility rule updated successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update eligibility rule',
        variant: 'destructive'
      });
    }
  });
};

export const useDeleteEligibilityRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteEligibilityRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligibility-rules'] });
      toast({
        title: 'Success',
        description: 'Eligibility rule deleted successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete eligibility rule',
        variant: 'destructive'
      });
    }
  });
};

export const useToggleEligibilityRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleEligibilityRule(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligibility-rules'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update rule status',
        variant: 'destructive'
      });
    }
  });
};

// Rate Formulas Hooks (Enhanced)
export const useCreateRateFormula = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createRateFormula,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-formulas'] });
      toast({
        title: 'Success',
        description: 'Rate formula created successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create rate formula',
        variant: 'destructive'
      });
    }
  });
};

export const useUpdateRateFormula = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateRateFormula(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-formulas'] });
      toast({
        title: 'Success',
        description: 'Rate formula updated successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update rate formula',
        variant: 'destructive'
      });
    }
  });
};

export const useDeleteRateFormula = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteRateFormula,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-formulas'] });
      toast({
        title: 'Success',
        description: 'Rate formula deleted successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete rate formula',
        variant: 'destructive'
      });
    }
  });
};

export const useToggleRateFormula = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleRateFormula(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-formulas'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update formula status',
        variant: 'destructive'
      });
    }
  });
};

// Approval Thresholds Hooks
export const useApprovalThresholds = () => {
  return useQuery({
    queryKey: ['approval-thresholds'],
    queryFn: fetchApprovalThresholds
  });
};

export const useCreateApprovalThreshold = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createApprovalThreshold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-thresholds'] });
      toast({
        title: 'Success',
        description: 'Approval threshold created successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create approval threshold',
        variant: 'destructive'
      });
    }
  });
};

export const useUpdateApprovalThreshold = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateApprovalThreshold(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-thresholds'] });
      toast({
        title: 'Success',
        description: 'Approval threshold updated successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update approval threshold',
        variant: 'destructive'
      });
    }
  });
};

export const useDeleteApprovalThreshold = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteApprovalThreshold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-thresholds'] });
      toast({
        title: 'Success',
        description: 'Approval threshold deleted successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete approval threshold',
        variant: 'destructive'
      });
    }
  });
};

export const useToggleApprovalThreshold = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleApprovalThreshold(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-thresholds'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update threshold status',
        variant: 'destructive'
      });
    }
  });
};
