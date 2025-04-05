export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      areas: {
        Row: {
          coordinates: unknown | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          coordinates?: unknown | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          coordinates?: unknown | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      attendance_logs: {
        Row: {
          created_at: string | null
          device_id: string | null
          employee_id: string
          id: string
          punch_time: string
          punch_type: string
          remark: string | null
          status: string | null
          temperature: number | null
          verify_type: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          employee_id: string
          id?: string
          punch_time: string
          punch_type: string
          remark?: string | null
          status?: string | null
          temperature?: number | null
          verify_type?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          employee_id?: string
          id?: string
          punch_time?: string
          punch_type?: string
          remark?: string | null
          status?: string | null
          temperature?: number | null
          verify_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_logs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      devices: {
        Row: {
          alias: string | null
          area_id: string | null
          created_at: string | null
          device_type: string
          firmware_version: string | null
          id: string
          ip_address: string | null
          last_update: string | null
          license_key: string | null
          mac_address: string | null
          platform: string | null
          push_version: string | null
          serial_number: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          alias?: string | null
          area_id?: string | null
          created_at?: string | null
          device_type: string
          firmware_version?: string | null
          id?: string
          ip_address?: string | null
          last_update?: string | null
          license_key?: string | null
          mac_address?: string | null
          platform?: string | null
          push_version?: string | null
          serial_number: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          alias?: string | null
          area_id?: string | null
          created_at?: string | null
          device_type?: string
          firmware_version?: string | null
          id?: string
          ip_address?: string | null
          last_update?: string | null
          license_key?: string | null
          mac_address?: string | null
          platform?: string | null
          push_version?: string | null
          serial_number?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          auto_calculate: boolean | null
          created_at: string | null
          cross_day_threshold: number | null
          daily_report: boolean | null
          email_account: string | null
          email_body_template: string | null
          email_on_absent: boolean | null
          email_on_break_early: boolean | null
          email_on_break_late: boolean | null
          email_on_early_out: boolean | null
          email_on_late: boolean | null
          email_password: string | null
          email_subject_template: string | null
          export_time: string | null
          id: string
          monthly_report: boolean | null
          smtp_port: number | null
          smtp_server: string | null
          supervisor_email: string | null
          updated_at: string | null
        }
        Insert: {
          auto_calculate?: boolean | null
          created_at?: string | null
          cross_day_threshold?: number | null
          daily_report?: boolean | null
          email_account?: string | null
          email_body_template?: string | null
          email_on_absent?: boolean | null
          email_on_break_early?: boolean | null
          email_on_break_late?: boolean | null
          email_on_early_out?: boolean | null
          email_on_late?: boolean | null
          email_password?: string | null
          email_subject_template?: string | null
          export_time?: string | null
          id?: string
          monthly_report?: boolean | null
          smtp_port?: number | null
          smtp_server?: string | null
          supervisor_email?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_calculate?: boolean | null
          created_at?: string | null
          cross_day_threshold?: number | null
          daily_report?: boolean | null
          email_account?: string | null
          email_body_template?: string | null
          email_on_absent?: boolean | null
          email_on_break_early?: boolean | null
          email_on_break_late?: boolean | null
          email_on_early_out?: boolean | null
          email_on_late?: boolean | null
          email_password?: string | null
          email_subject_template?: string | null
          export_time?: string | null
          id?: string
          monthly_report?: boolean | null
          smtp_port?: number | null
          smtp_server?: string | null
          supervisor_email?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          badge_number: string
          birthday: string | null
          card_no: string | null
          created_at: string | null
          department_id: string | null
          email: string
          first_name: string
          gender: string | null
          hire_date: string
          id: string
          last_name: string
          mobile: string | null
          notes: string | null
          passport_no: string | null
          phone: string | null
          position_id: string | null
          resign_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          badge_number: string
          birthday?: string | null
          card_no?: string | null
          created_at?: string | null
          department_id?: string | null
          email: string
          first_name: string
          gender?: string | null
          hire_date: string
          id?: string
          last_name: string
          mobile?: string | null
          notes?: string | null
          passport_no?: string | null
          phone?: string | null
          position_id?: string | null
          resign_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          badge_number?: string
          birthday?: string | null
          card_no?: string | null
          created_at?: string | null
          department_id?: string | null
          email?: string
          first_name?: string
          gender?: string | null
          hire_date?: string
          id?: string
          last_name?: string
          mobile?: string | null
          notes?: string | null
          passport_no?: string | null
          phone?: string | null
          position_id?: string | null
          resign_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      leaves: {
        Row: {
          created_at: string | null
          employee_id: string
          end_date: string
          id: string
          leave_type: string
          remark: string | null
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          end_date: string
          id?: string
          leave_type: string
          remark?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          end_date?: string
          id?: string
          leave_type?: string
          remark?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaves_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      schedules: {
        Row: {
          break_in: string | null
          break_out: string | null
          check_in: string
          check_out: string
          created_at: string | null
          department_id: string | null
          employee_id: string | null
          end_date: string | null
          id: string
          is_temporary: boolean | null
          name: string
          schedule_type: string
          start_date: string
          updated_at: string | null
          work_days: string[]
          work_hours: unknown
        }
        Insert: {
          break_in?: string | null
          break_out?: string | null
          check_in: string
          check_out: string
          created_at?: string | null
          department_id?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          is_temporary?: boolean | null
          name: string
          schedule_type: string
          start_date: string
          updated_at?: string | null
          work_days: string[]
          work_hours: unknown
        }
        Update: {
          break_in?: string | null
          break_out?: string | null
          check_in?: string
          check_out?: string
          created_at?: string | null
          department_id?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          is_temporary?: boolean | null
          name?: string
          schedule_type?: string
          start_date?: string
          updated_at?: string | null
          work_days?: string[]
          work_hours?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "schedules_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          color: string | null
          created_at: string | null
          department_id: string | null
          end_date: string
          id: string
          name: string
          start_date: string
          timetable_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          department_id?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
          timetable_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          department_id?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          timetable_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_timetable_id_fkey"
            columns: ["timetable_id"]
            isOneToOne: false
            referencedRelation: "timetables"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          absence_threshold: number | null
          allow_early_out: number | null
          allow_late_in: number | null
          company_name: string
          created_at: string | null
          date_time_format: string | null
          day_change_time: string | null
          duplicate_punch_interval: number | null
          id: string
          min_overtime_break_early_out: number | null
          min_overtime_break_late_in: number | null
          min_overtime_early_in: number | null
          min_overtime_late_out: number | null
          updated_at: string | null
          weekend_days: string[] | null
        }
        Insert: {
          absence_threshold?: number | null
          allow_early_out?: number | null
          allow_late_in?: number | null
          company_name?: string
          created_at?: string | null
          date_time_format?: string | null
          day_change_time?: string | null
          duplicate_punch_interval?: number | null
          id?: string
          min_overtime_break_early_out?: number | null
          min_overtime_break_late_in?: number | null
          min_overtime_early_in?: number | null
          min_overtime_late_out?: number | null
          updated_at?: string | null
          weekend_days?: string[] | null
        }
        Update: {
          absence_threshold?: number | null
          allow_early_out?: number | null
          allow_late_in?: number | null
          company_name?: string
          created_at?: string | null
          date_time_format?: string | null
          day_change_time?: string | null
          duplicate_punch_interval?: number | null
          id?: string
          min_overtime_break_early_out?: number | null
          min_overtime_break_late_in?: number | null
          min_overtime_early_in?: number | null
          min_overtime_late_out?: number | null
          updated_at?: string | null
          weekend_days?: string[] | null
        }
        Relationships: []
      }
      timetables: {
        Row: {
          break_end: string | null
          break_start: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          name: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          name: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          name?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          active: boolean | null
          created_at: string | null
          department: string | null
          first_name: string | null
          id: string
          last_login: string | null
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          department?: string | null
          first_name?: string | null
          id: string
          last_login?: string | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          department?: string | null
          first_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: "administrator" | "manager" | "supervisor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
