import { supabase } from '@/integrations/supabase/client';
import type { OTRequestWithRelations, OtStatus, DayType } from '@/types/otms';

export const fetchOTRequests = async (filters?: {
  status?: OtStatus;
  employeeId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  let query = supabase
    .from('ot_requests')
    .select(`
      *,
      employee:profiles!ot_requests_employee_id_fkey(
        full_name,
        employee_id,
        email,
        department:departments(name, code)
      ),
      supervisor:profiles!ot_requests_supervisor_id_fkey(full_name),
      hr:profiles!ot_requests_hr_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.employeeId) {
    query = query.eq('employee_id', filters.employeeId);
  }
  if (filters?.startDate) {
    query = query.gte('ot_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('ot_date', filters.endDate);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as OTRequestWithRelations[];
};

export const fetchMyOTRequests = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  return fetchOTRequests({ employeeId: user.id });
};

export const fetchTeamOTRequests = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ot_requests')
    .select(`
      *,
      employee:profiles!ot_requests_employee_id_fkey(
        full_name,
        employee_id,
        email,
        department:departments(name, code)
      )
    `)
    .eq('supervisor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as OTRequestWithRelations[];
};

export const createOTRequest = async (request: {
  ot_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  day_type: DayType;
  reason: string;
  attachment_url?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check eligibility before proceeding
  const { data: eligibility, error: eligibilityError } = await supabase.rpc('check_ot_eligibility', {
    employee_id: user.id,
    ot_date: request.ot_date
  });

  if (eligibilityError) throw eligibilityError;
  
  const eligibilityResult = eligibility?.[0];
  if (!eligibilityResult?.is_eligible) {
    throw new Error(eligibilityResult?.reason || 'Not eligible to submit OT');
  }

  // Get supervisor_id from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('supervisor_id, basic_salary')
    .eq('id', user.id)
    .single();

  // Calculate OT amount
  const { data: calculation } = await supabase.rpc('calculate_ot_amount', {
    basic_salary: profile?.basic_salary || 0,
    total_hours: request.total_hours,
    day_type: request.day_type
  });

  const { data, error } = await supabase
    .from('ot_requests')
    .insert([{
      ot_date: request.ot_date,
      start_time: request.start_time,
      end_time: request.end_time,
      total_hours: request.total_hours,
      day_type: request.day_type,
      reason: request.reason,
      attachment_url: request.attachment_url,
      employee_id: user.id,
      supervisor_id: profile?.supervisor_id,
      orp: calculation?.[0]?.orp,
      hrp: calculation?.[0]?.hrp,
      ot_amount: calculation?.[0]?.ot_amount
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateOTRequestStatus = async (
  id: string,
  status: OtStatus,
  remarks?: string,
  remarkField?: 'supervisor_remarks' | 'hr_remarks' | 'bod_remarks'
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updates: any = { status };

  if (remarkField && remarks) {
    updates[remarkField] = remarks;
  }

  if (status === 'verified') {
    updates.supervisor_verified_at = new Date().toISOString();
    updates.supervisor_id = user.id;
  } else if (status === 'approved') {
    updates.hr_approved_at = new Date().toISOString();
    updates.hr_id = user.id;
  } else if (status === 'reviewed') {
    updates.bod_reviewed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('ot_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const fetchOTSummary = async (employeeId?: string) => {
  let query = supabase.from('ot_requests').select('*');

  if (employeeId) {
    query = query.eq('employee_id', employeeId);
  }

  const { data, error } = await query;

  if (error) throw error;

  const summary = {
    totalHours: data?.reduce((sum, req) => sum + Number(req.total_hours || 0), 0) || 0,
    totalAmount: data?.reduce((sum, req) => sum + Number(req.ot_amount || 0), 0) || 0,
    totalRequests: data?.length || 0,
    pendingCount: data?.filter(req => req.status.includes('pending')).length || 0,
    approvedCount: data?.filter(req => req.status === 'approved').length || 0,
    rejectedCount: data?.filter(req => req.status === 'rejected').length || 0
  };

  return summary;
};
