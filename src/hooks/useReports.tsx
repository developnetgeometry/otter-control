import { useQuery } from '@tanstack/react-query';
import { fetchOTStatistics, fetchOTTrends, fetchDepartmentBreakdown, type ReportFilters } from '@/lib/api/reports';

export const useOTStatistics = (filters: ReportFilters = {}) => {
  return useQuery({
    queryKey: ['ot-statistics', filters],
    queryFn: () => fetchOTStatistics(filters)
  });
};

export const useOTTrends = (filters: ReportFilters = {}) => {
  return useQuery({
    queryKey: ['ot-trends', filters],
    queryFn: () => fetchOTTrends(filters)
  });
};

export const useDepartmentBreakdown = (filters: ReportFilters = {}) => {
  return useQuery({
    queryKey: ['department-breakdown', filters],
    queryFn: () => fetchDepartmentBreakdown(filters)
  });
};
