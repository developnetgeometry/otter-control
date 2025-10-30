import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface OTStatistics {
  totalRequests: number;
  totalHours: number;
  totalAmount: number;
  approvalRate: number;
}

export interface OTTrendPoint {
  date: string;
  hours: number;
  amount: number;
  count: number;
}

export interface DepartmentBreakdown {
  department: string;
  hours: number;
  amount: number;
  count: number;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  status?: string;
}

export const fetchOTStatistics = async (filters: ReportFilters = {}): Promise<OTStatistics> => {
  let query = supabase
    .from('ot_requests')
    .select('total_hours, ot_amount, status');

  if (filters.startDate) {
    query = query.gte('ot_date', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('ot_date', filters.endDate);
  }
  if (filters.departmentId) {
    query = query.eq('employee_id.department_id', filters.departmentId);
  }
  if (filters.status) {
    query = query.eq('status', filters.status as any);
  }

  const { data, error } = await query;

  if (error) throw error;

  const totalRequests = data?.length || 0;
  const totalHours = data?.reduce((sum, req) => sum + Number(req.total_hours || 0), 0) || 0;
  const totalAmount = data?.reduce((sum, req) => sum + Number(req.ot_amount || 0), 0) || 0;
  const approvedCount = data?.filter(req => req.status === 'approved').length || 0;
  const approvalRate = totalRequests > 0 ? (approvedCount / totalRequests) * 100 : 0;

  return {
    totalRequests,
    totalHours,
    totalAmount,
    approvalRate
  };
};

export const fetchOTTrends = async (filters: ReportFilters = {}): Promise<OTTrendPoint[]> => {
  let query = supabase
    .from('ot_requests')
    .select('ot_date, total_hours, ot_amount')
    .order('ot_date');

  if (filters.startDate) {
    query = query.gte('ot_date', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('ot_date', filters.endDate);
  }
  if (filters.status) {
    query = query.eq('status', filters.status as any);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Group by month
  const grouped = data?.reduce((acc: Record<string, OTTrendPoint>, req) => {
    const month = format(new Date(req.ot_date), 'MMM yyyy');
    if (!acc[month]) {
      acc[month] = { date: month, hours: 0, amount: 0, count: 0 };
    }
    acc[month].hours += Number(req.total_hours || 0);
    acc[month].amount += Number(req.ot_amount || 0);
    acc[month].count += 1;
    return acc;
  }, {});

  return Object.values(grouped || {});
};

export const fetchDepartmentBreakdown = async (filters: ReportFilters = {}): Promise<DepartmentBreakdown[]> => {
  let query = supabase
    .from('ot_requests')
    .select(`
      total_hours,
      ot_amount,
      employee:profiles!ot_requests_employee_id_fkey(
        department:departments(name)
      )
    `);

  if (filters.startDate) {
    query = query.gte('ot_date', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('ot_date', filters.endDate);
  }
  if (filters.status) {
    query = query.eq('status', filters.status as any);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Group by department
  const grouped = data?.reduce((acc: Record<string, DepartmentBreakdown>, req: any) => {
    const deptName = req.employee?.department?.name || 'Unknown';
    if (!acc[deptName]) {
      acc[deptName] = { department: deptName, hours: 0, amount: 0, count: 0 };
    }
    acc[deptName].hours += Number(req.total_hours || 0);
    acc[deptName].amount += Number(req.ot_amount || 0);
    acc[deptName].count += 1;
    return acc;
  }, {});

  return Object.values(grouped || {});
};

export const exportOTReport = async (filters: ReportFilters = {}): Promise<string> => {
  let query = supabase
    .from('ot_requests')
    .select(`
      *,
      employee:profiles!ot_requests_employee_id_fkey(
        full_name,
        employee_id,
        department:departments(name)
      ),
      supervisor:profiles!ot_requests_supervisor_id_fkey(full_name),
      hr:profiles!ot_requests_hr_id_fkey(full_name)
    `)
    .order('ot_date', { ascending: false });

  if (filters.startDate) {
    query = query.gte('ot_date', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('ot_date', filters.endDate);
  }
  if (filters.status) {
    query = query.eq('status', filters.status as any);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Generate CSV
  const headers = [
    'Date',
    'Employee ID',
    'Employee Name',
    'Department',
    'Start Time',
    'End Time',
    'Total Hours',
    'Day Type',
    'OT Amount',
    'Status',
    'Verified By',
    'Approved By'
  ];

  const rows = data?.map((req: any) => [
    req.ot_date,
    req.employee?.employee_id || '',
    req.employee?.full_name || '',
    req.employee?.department?.name || '',
    req.start_time,
    req.end_time,
    req.total_hours,
    req.day_type,
    req.ot_amount || '',
    req.status,
    req.supervisor?.full_name || '',
    req.hr?.full_name || ''
  ]);

  const csv = [
    headers.join(','),
    ...(rows?.map(row => row.map(cell => `"${cell}"`).join(',')) || [])
  ].join('\n');

  return csv;
};
