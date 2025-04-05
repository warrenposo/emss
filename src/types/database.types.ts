
// Supabase database type definitions
export interface Holiday {
  id: string;
  name: string;
  description?: string | null;
  date: string; // Store as string in database format 'YYYY-MM-DD'
  created_at?: string;
  updated_at?: string;
}

export interface Timetable {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_start?: string | null;
  break_end?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Position {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id: string;
  badge_number: string;
  first_name: string;
  last_name: string;
  gender?: string;
  department?: string;
  department_id?: string;
  position?: string;
  position_id?: string;
  card_no?: string;
  passport_no?: string;
  phone?: string;
  mobile?: string;
  email: string;
  birthday?: string;
  hire_date: string;
  resign_date?: string;
  notes?: string;
}

export interface Shift {
  id: string;
  name: string;
  timetable_id: string | null;
  department_id: string | null;
  start_date: string;
  end_date: string;
  color?: string | null;
  created_at?: string;
  updated_at?: string;
}

// For the ShiftsPage display with relations
export interface ShiftWithRelations extends Shift {
  timetable?: Timetable;
  department?: Department;
}

export interface Area {
  id: string;
  name: string;
  coordinates?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Leave {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  status?: string;
  remark?: string;
  created_at?: string;
  updated_at?: string;
  employee?: Employee;
}

export interface Schedule {
  id: string;
  name: string;
  work_days: string[];
  schedule_type: string;
  check_in: string;
  check_out: string;
  break_in?: string;
  break_out?: string;
  work_hours: string;
  department_id?: string;
  employee_id?: string;
  start_date: string;
  end_date?: string;
  is_temporary?: boolean;
  created_at?: string;
  updated_at?: string;
  department?: Department;
  employee?: Employee;
}
