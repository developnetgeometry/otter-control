import { format, parseISO } from 'date-fns';
import type { OtStatus, DayType } from '@/types/otms';

/**
 * Format currency amount in MYR (Malaysian Ringgit)
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return 'RM 0.00';
  return `RM ${amount.toFixed(2)}`;
};

/**
 * Format hours with 1 decimal place
 */
export const formatHours = (hours: number | null | undefined): string => {
  if (hours === null || hours === undefined) return '0.0 hrs';
  return `${hours.toFixed(1)} hrs`;
};

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd MMM yyyy');
};

/**
 * Format date and time to readable string
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd MMM yyyy, hh:mm a');
};

/**
 * Format time from time string (HH:mm:ss)
 */
export const formatTime = (time: string | null | undefined): string => {
  if (!time) return '-';
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

/**
 * Calculate hours between start and end time
 */
export const calculateHours = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  const totalMinutes = endMinutes - startMinutes;
  return totalMinutes / 60;
};

/**
 * Get status badge configuration
 */
export const getStatusConfig = (status: OtStatus) => {
  const configs = {
    pending_verification: {
      label: 'Pending Verification',
      variant: 'default' as const,
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    verified: {
      label: 'Verified',
      variant: 'default' as const,
      className: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    approved: {
      label: 'Approved',
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    reviewed: {
      label: 'Reviewed',
      variant: 'default' as const,
      className: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    rejected: {
      label: 'Rejected',
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-800 border-red-200'
    }
  };
  
  return configs[status] || configs.pending_verification;
};

/**
 * Get day type label
 */
export const getDayTypeLabel = (dayType: DayType): string => {
  const labels: Record<DayType, string> = {
    weekday: 'Weekday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    public_holiday: 'Public Holiday'
  };
  return labels[dayType];
};

/**
 * Get day type color class
 */
export const getDayTypeColor = (dayType: DayType): string => {
  const colors: Record<DayType, string> = {
    weekday: 'bg-slate-100 text-slate-800',
    saturday: 'bg-blue-100 text-blue-800',
    sunday: 'bg-orange-100 text-orange-800',
    public_holiday: 'bg-purple-100 text-purple-800'
  };
  return colors[dayType];
};
