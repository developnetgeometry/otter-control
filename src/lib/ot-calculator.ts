import { supabase } from '@/integrations/supabase/client';
import { differenceInHours, parse, isWeekend, getDay } from 'date-fns';
import type { DayType } from '@/types/otms';

export const calculateHours = (startTime: string, endTime: string): number => {
  const start = parse(startTime, 'HH:mm', new Date());
  let end = parse(endTime, 'HH:mm', new Date());
  
  // Handle overnight shifts (cross-midnight)
  if (end <= start) {
    end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
  }
  
  const totalMilliseconds = end.getTime() - start.getTime();
  const totalHours = totalMilliseconds / (1000 * 60 * 60);
  
  return Math.round(totalHours * 100) / 100; // Round to 2 decimals
};

export const determineDayType = async (date: string): Promise<DayType> => {
  // Check if it's a public holiday
  const { data: holiday } = await supabase
    .from('public_holidays')
    .select('*')
    .eq('holiday_date', date)
    .maybeSingle();

  if (holiday) {
    return 'public_holiday';
  }

  // Check day of week
  const dateObj = new Date(date);
  const dayOfWeek = getDay(dateObj);

  if (dayOfWeek === 0) {
    return 'sunday';
  } else if (dayOfWeek === 6) {
    return 'saturday';
  } else {
    return 'weekday';
  }
};

export const calculateOTAmount = async (
  basicSalary: number,
  totalHours: number,
  dayType: DayType
): Promise<{ orp: number; hrp: number; otAmount: number }> => {
  const { data, error } = await supabase.rpc('calculate_ot_amount', {
    basic_salary: basicSalary,
    total_hours: totalHours,
    day_type: dayType
  });

  if (error) throw error;

  const result = data?.[0] || { orp: 0, hrp: 0, ot_amount: 0 };

  return {
    orp: Number(result.orp),
    hrp: Number(result.hrp),
    otAmount: Number(result.ot_amount)
  };
};

export const checkEligibility = async (
  employeeId: string,
  otDate: string
): Promise<{ isEligible: boolean; reason: string }> => {
  const { data, error } = await supabase.rpc('check_ot_eligibility', {
    employee_id: employeeId,
    ot_date: otDate
  });

  if (error) throw error;

  const result = data?.[0] || { is_eligible: false, reason: 'Unknown error' };

  return {
    isEligible: result.is_eligible,
    reason: result.reason
  };
};
