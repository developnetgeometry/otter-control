import { Database } from '@/integrations/supabase/types';

// Base types from Supabase
export type OtStatus = Database['public']['Enums']['ot_status'];
export type DayType = Database['public']['Enums']['day_type'];
export type AppRole = Database['public']['Enums']['app_role'];

// OT Request with relations
export type OTRequestWithRelations = Database['public']['Tables']['ot_requests']['Row'] & {
  employee?: {
    full_name: string;
    employee_id: string;
    email: string;
    department?: {
      name: string;
      code: string;
    };
  };
  supervisor?: {
    full_name: string;
  };
  hr?: {
    full_name: string;
  };
};

// Employee Profile with relations
export type EmployeeProfile = Database['public']['Tables']['profiles']['Row'] & {
  department?: {
    name: string;
    code: string;
  };
  supervisor?: {
    full_name: string;
    email: string;
  };
};

// Navigation menu item
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: AppRole[];
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
}

export interface OTSummary {
  totalHours: number;
  totalAmount: number;
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}
