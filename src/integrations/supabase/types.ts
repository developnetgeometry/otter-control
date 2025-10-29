export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      departments: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      ot_approval_thresholds: {
        Row: {
          alert_recipients: string[] | null
          applies_to_department_ids: string[] | null
          applies_to_role_ids: string[] | null
          auto_block_enabled: boolean | null
          created_at: string | null
          created_by: string | null
          daily_limit_hours: number | null
          id: string
          is_active: boolean | null
          max_claimable_amount: number | null
          monthly_limit_hours: number | null
          threshold_name: string
          updated_at: string | null
          weekly_limit_hours: number | null
        }
        Insert: {
          alert_recipients?: string[] | null
          applies_to_department_ids?: string[] | null
          applies_to_role_ids?: string[] | null
          auto_block_enabled?: boolean | null
          created_at?: string | null
          created_by?: string | null
          daily_limit_hours?: number | null
          id?: string
          is_active?: boolean | null
          max_claimable_amount?: number | null
          monthly_limit_hours?: number | null
          threshold_name: string
          updated_at?: string | null
          weekly_limit_hours?: number | null
        }
        Update: {
          alert_recipients?: string[] | null
          applies_to_department_ids?: string[] | null
          applies_to_role_ids?: string[] | null
          auto_block_enabled?: boolean | null
          created_at?: string | null
          created_by?: string | null
          daily_limit_hours?: number | null
          id?: string
          is_active?: boolean | null
          max_claimable_amount?: number | null
          monthly_limit_hours?: number | null
          threshold_name?: string
          updated_at?: string | null
          weekly_limit_hours?: number | null
        }
        Relationships: []
      }
      ot_eligibility_rules: {
        Row: {
          created_at: string | null
          created_by: string | null
          department_ids: string[] | null
          employment_types: string[] | null
          id: string
          is_active: boolean | null
          max_salary: number | null
          min_salary: number | null
          role_ids: string[] | null
          rule_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          department_ids?: string[] | null
          employment_types?: string[] | null
          id?: string
          is_active?: boolean | null
          max_salary?: number | null
          min_salary?: number | null
          role_ids?: string[] | null
          rule_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          department_ids?: string[] | null
          employment_types?: string[] | null
          id?: string
          is_active?: boolean | null
          max_salary?: number | null
          min_salary?: number | null
          role_ids?: string[] | null
          rule_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ot_rate_formulas: {
        Row: {
          base_formula: string
          conditional_logic: Json | null
          created_at: string | null
          created_by: string | null
          day_type: Database["public"]["Enums"]["day_type"]
          effective_from: string
          effective_to: string | null
          employee_category: string | null
          formula_name: string
          id: string
          is_active: boolean | null
          multiplier: number
          updated_at: string | null
        }
        Insert: {
          base_formula: string
          conditional_logic?: Json | null
          created_at?: string | null
          created_by?: string | null
          day_type: Database["public"]["Enums"]["day_type"]
          effective_from: string
          effective_to?: string | null
          employee_category?: string | null
          formula_name: string
          id?: string
          is_active?: boolean | null
          multiplier: number
          updated_at?: string | null
        }
        Update: {
          base_formula?: string
          conditional_logic?: Json | null
          created_at?: string | null
          created_by?: string | null
          day_type?: Database["public"]["Enums"]["day_type"]
          effective_from?: string
          effective_to?: string | null
          employee_category?: string | null
          formula_name?: string
          id?: string
          is_active?: boolean | null
          multiplier?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      ot_requests: {
        Row: {
          attachment_url: string | null
          bod_remarks: string | null
          bod_reviewed_at: string | null
          created_at: string | null
          day_type: Database["public"]["Enums"]["day_type"]
          eligibility_rule_id: string | null
          employee_id: string
          end_time: string
          formula_id: string | null
          hr_approved_at: string | null
          hr_id: string | null
          hr_remarks: string | null
          hrp: number | null
          id: string
          orp: number | null
          ot_amount: number | null
          ot_date: string
          reason: string
          start_time: string
          status: Database["public"]["Enums"]["ot_status"] | null
          supervisor_id: string | null
          supervisor_remarks: string | null
          supervisor_verified_at: string | null
          threshold_violations: Json | null
          total_hours: number
          updated_at: string | null
        }
        Insert: {
          attachment_url?: string | null
          bod_remarks?: string | null
          bod_reviewed_at?: string | null
          created_at?: string | null
          day_type: Database["public"]["Enums"]["day_type"]
          eligibility_rule_id?: string | null
          employee_id: string
          end_time: string
          formula_id?: string | null
          hr_approved_at?: string | null
          hr_id?: string | null
          hr_remarks?: string | null
          hrp?: number | null
          id?: string
          orp?: number | null
          ot_amount?: number | null
          ot_date: string
          reason: string
          start_time: string
          status?: Database["public"]["Enums"]["ot_status"] | null
          supervisor_id?: string | null
          supervisor_remarks?: string | null
          supervisor_verified_at?: string | null
          threshold_violations?: Json | null
          total_hours: number
          updated_at?: string | null
        }
        Update: {
          attachment_url?: string | null
          bod_remarks?: string | null
          bod_reviewed_at?: string | null
          created_at?: string | null
          day_type?: Database["public"]["Enums"]["day_type"]
          eligibility_rule_id?: string | null
          employee_id?: string
          end_time?: string
          formula_id?: string | null
          hr_approved_at?: string | null
          hr_id?: string | null
          hr_remarks?: string | null
          hrp?: number | null
          id?: string
          orp?: number | null
          ot_amount?: number | null
          ot_date?: string
          reason?: string
          start_time?: string
          status?: Database["public"]["Enums"]["ot_status"] | null
          supervisor_id?: string | null
          supervisor_remarks?: string | null
          supervisor_verified_at?: string | null
          threshold_violations?: Json | null
          total_hours?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ot_requests_eligibility_rule_id_fkey"
            columns: ["eligibility_rule_id"]
            isOneToOne: false
            referencedRelation: "ot_eligibility_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ot_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ot_requests_formula_id_fkey"
            columns: ["formula_id"]
            isOneToOne: false
            referencedRelation: "ot_rate_formulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ot_requests_hr_id_fkey"
            columns: ["hr_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ot_requests_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ot_settings: {
        Row: {
          id: string
          max_daily_hours: number | null
          rounding_rule: string | null
          salary_threshold: number | null
          submission_limit_days: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          max_daily_hours?: number | null
          rounding_rule?: string | null
          salary_threshold?: number | null
          submission_limit_days?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          max_daily_hours?: number | null
          rounding_rule?: string | null
          salary_threshold?: number | null
          submission_limit_days?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          basic_salary: number | null
          created_at: string | null
          department_id: string | null
          designation: string | null
          email: string
          employee_id: string
          employment_type: string
          full_name: string
          id: string
          joining_date: string | null
          position: string | null
          state: string | null
          status: string | null
          supervisor_id: string | null
          updated_at: string | null
          work_location: string | null
        }
        Insert: {
          basic_salary?: number | null
          created_at?: string | null
          department_id?: string | null
          designation?: string | null
          email: string
          employee_id: string
          employment_type: string
          full_name: string
          id: string
          joining_date?: string | null
          position?: string | null
          state?: string | null
          status?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
          work_location?: string | null
        }
        Update: {
          basic_salary?: number | null
          created_at?: string | null
          department_id?: string | null
          designation?: string | null
          email?: string
          employee_id?: string
          employment_type?: string
          full_name?: string
          id?: string
          joining_date?: string | null
          position?: string | null
          state?: string | null
          status?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
          work_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_holidays: {
        Row: {
          created_at: string | null
          holiday_date: string
          holiday_name: string
          id: string
        }
        Insert: {
          created_at?: string | null
          holiday_date: string
          holiday_name: string
          id?: string
        }
        Update: {
          created_at?: string | null
          holiday_date?: string
          holiday_name?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_ot_amount: {
        Args: {
          basic_salary: number
          day_type: Database["public"]["Enums"]["day_type"]
          total_hours: number
        }
        Returns: {
          hrp: number
          orp: number
          ot_amount: number
        }[]
      }
      check_ot_eligibility: {
        Args: { employee_id: string; ot_date: string }
        Returns: {
          is_eligible: boolean
          reason: string
          rule_id: string
          rule_name: string
        }[]
      }
      check_threshold_violations: {
        Args: {
          employee_id: string
          requested_date: string
          requested_hours: number
        }
        Returns: Json
      }
      determine_day_type: {
        Args: { ot_date: string }
        Returns: Database["public"]["Enums"]["day_type"]
      }
      get_active_formula: {
        Args: {
          day_type: Database["public"]["Enums"]["day_type"]
          employee_category: string
          ot_date: string
        }
        Returns: {
          base_formula: string
          formula_id: string
          multiplier: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "employee" | "supervisor" | "hr" | "bod" | "admin"
      day_type: "weekday" | "saturday" | "sunday" | "public_holiday"
      ot_status:
        | "pending_verification"
        | "verified"
        | "approved"
        | "reviewed"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["employee", "supervisor", "hr", "bod", "admin"],
      day_type: ["weekday", "saturday", "sunday", "public_holiday"],
      ot_status: [
        "pending_verification",
        "verified",
        "approved",
        "reviewed",
        "rejected",
      ],
    },
  },
} as const
