import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Attendance Module
 * 
 * This file contains functions for fetching and managing attendance records.
 * In development mode without Supabase, it uses mock data.
 * When connected to Supabase, it will use the database.
 */

// Types
export interface AttendanceRecord {
  id?: string;
  employee_id: string;
  employee_name: string;
  department: string;
  device_name: string;
  punch_date: string;
  punch_time: string;
  status: 'Present' | 'Absent' | 'Late';
  verify_type: string;
  device_serial: string;
  remark?: string;
  created_at?: string;
}

/**
 * Mock data for development without Supabase
 * This data will be used when Supabase is not configured
 */
const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    employee_id: '1001',
    employee_name: 'John Doe',
    department: 'Engineering',
    device_name: 'Main Entrance',
    punch_date: '2023-09-01',
    punch_time: '09:00:00',
    status: 'Present',
    verify_type: 'Fingerprint',
    device_serial: 'DEV001',
    remark: '',
  },
  {
    id: '2',
    employee_id: '1002',
    employee_name: 'Jane Smith',
    department: 'Marketing',
    device_name: 'Side Entrance',
    punch_date: '2023-09-01',
    punch_time: '09:15:00',
    status: 'Late',
    verify_type: 'Card',
    device_serial: 'DEV002',
    remark: 'Traffic delay',
  },
  {
    id: '3',
    employee_id: '1003',
    employee_name: 'Bob Johnson',
    department: 'Finance',
    device_name: 'Back Entrance',
    punch_date: '2023-09-01',
    punch_time: '08:45:00',
    status: 'Present',
    verify_type: 'Face',
    device_serial: 'DEV003',
    remark: '',
  },
];

const mockDepartments = ['Engineering', 'Marketing', 'Finance', 'HR', 'Operations'];
const mockDevices = ['Main Entrance', 'Side Entrance', 'Back Entrance', 'Parking Entrance'];

/**
 * Get all attendance records with filtering
 * 
 * @param {Object} options Filter and pagination options
 * @param {string} options.idFilter Filter by employee ID
 * @param {string} options.nameFilter Filter by employee name
 * @param {string} options.departmentFilter Filter by department
 * @param {string} options.deviceFilter Filter by device
 * @param {Date} options.startDate Filter by start date
 * @param {Date} options.endDate Filter by end date
 * @param {number} options.page Page number for pagination
 * @param {number} options.pageSize Number of records per page
 * @returns {Promise<{data: AttendanceRecord[], count: number}>} Attendance records and total count
 */
export const getAttendanceRecords = async ({
  idFilter = '',
  nameFilter = '',
  departmentFilter = '',
  deviceFilter = '',
  startDate,
  endDate,
  page = 1,
  pageSize = 20
}: {
  idFilter?: string;
  nameFilter?: string;
  departmentFilter?: string;
  deviceFilter?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}) => {
  try {
    console.log('Fetching attendance records with filters:', {
      idFilter, nameFilter, departmentFilter, deviceFilter, startDate, endDate, page, pageSize
    });
    
    // If Supabase is not configured, return mock data
    if (!isSupabaseConfigured()) {
      console.log('Using mock attendance data (Supabase not configured)');
      
      // Apply filters to mock data
      let filteredData = [...mockAttendanceRecords];
      
      if (idFilter) {
        filteredData = filteredData.filter(record => 
          record.employee_id.toLowerCase().includes(idFilter.toLowerCase()));
      }
      
      if (nameFilter) {
        filteredData = filteredData.filter(record => 
          record.employee_name.toLowerCase().includes(nameFilter.toLowerCase()));
      }
      
      if (departmentFilter && departmentFilter !== 'all_departments') {
        filteredData = filteredData.filter(record => 
          record.department === departmentFilter);
      }
      
      if (deviceFilter && deviceFilter !== 'all_devices') {
        filteredData = filteredData.filter(record => 
          record.device_name === deviceFilter);
      }
      
      // Date range filtering
      if (startDate) {
        filteredData = filteredData.filter(record => 
          new Date(record.punch_date) >= startDate);
      }
      
      if (endDate) {
        filteredData = filteredData.filter(record => 
          new Date(record.punch_date) <= endDate);
      }
      
      // Sort by date descending
      filteredData.sort((a, b) => 
        new Date(b.punch_date).getTime() - new Date(a.punch_date).getTime());
      
      // Apply pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = filteredData.slice(start, end);
      
      return { 
        data: paginatedData,
        count: filteredData.length
      };
    }

    // If Supabase is configured, use it
    console.log('Using Supabase for attendance records');
    
    // Start building the query
    let query = supabase
      .from('attendance_logs')
      .select(`
        id,
        punch_time,
        employee_id,
        status,
        remark,
        verify_type,
        device_id,
        employees!employees (first_name, last_name),
        devices!devices (alias, serial_number)
      `, { count: 'exact' });

    // Apply filters
    if (idFilter) {
      query = query.ilike('employee_id', `%${idFilter}%`);
    }
    
    if (nameFilter) {
      query = query.or(`employees.first_name.ilike.%${nameFilter}%,employees.last_name.ilike.%${nameFilter}%`);
    }
    
    if (departmentFilter && departmentFilter !== 'all_departments') {
      query = query.eq('employees.department_id', departmentFilter);
    }
    
    if (deviceFilter && deviceFilter !== 'all_devices') {
      query = query.eq('device_id', deviceFilter);
    }
    
    // Date range filtering
    if (startDate) {
      query = query.gte('punch_time', startDate.toISOString());
    }
    
    if (endDate) {
      query = query.lte('punch_time', endDate.toISOString());
    }
    
    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Get paginated results
    const { data, error, count } = await query
      .order('punch_time', { ascending: false })
      .range(from, to);
      
    if (error) {
      console.error('Error fetching attendance records:', error);
      throw error;
    }
    
    // Transform data to match AttendanceRecord interface
    const formattedData: AttendanceRecord[] = data.map(record => {
      const punchDateTime = new Date(record.punch_time);
      const employee = record.employees || {};
      const device = record.devices || {};
      
      return {
        id: record.id,
        employee_id: record.employee_id || '',
        employee_name: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unknown',
        department: 'Department', // TODO: Add department query
        device_name: device.alias || 'Unknown Device',
        punch_date: punchDateTime.toISOString().split('T')[0],
        punch_time: punchDateTime.toISOString().split('T')[1].substring(0, 8),
        status: record.status || 'Present',
        verify_type: record.verify_type || 'Unknown',
        device_serial: device.serial_number || '',
        remark: record.remark || '',
        created_at: record.created_at
      };
    });
    
    return { 
      data: formattedData, 
      count: count || 0 
    };
  } catch (error) {
    console.error('Error in getAttendanceRecords:', error);
    // Fall back to mock data if there's an error
    return { 
      data: mockAttendanceRecords.slice(0, pageSize),
      count: mockAttendanceRecords.length
    };
  }
};

/**
 * Get department list
 * 
 * @returns {Promise<string[]>} List of department names
 */
export const getDepartments = async () => {
  try {
    // If Supabase is not configured, return mock data
    if (!isSupabaseConfigured()) {
      console.log('Using mock department data (Supabase not configured)');
      return mockDepartments;
    }

    console.log('Fetching departments from Supabase');
    const { data, error } = await supabase
      .from('departments')
      .select('id, name')
      .order('name');
      
    if (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
    
    return data.map(dept => dept.name);
  } catch (error) {
    console.error('Error in getDepartments:', error);
    // Fall back to mock data if there's an error
    return mockDepartments;
  }
};

/**
 * Get device list
 * 
 * @returns {Promise<string[]>} List of device names
 */
export const getDevices = async () => {
  try {
    // If Supabase is not configured, return mock data
    if (!isSupabaseConfigured()) {
      console.log('Using mock device data (Supabase not configured)');
      return mockDevices;
    }

    console.log('Fetching devices from Supabase');
    const { data, error } = await supabase
      .from('devices')
      .select('id, alias')
      .order('alias');
      
    if (error) {
      console.error('Error fetching devices:', error);
      throw error;
    }
    
    return data.map(device => device.alias);
  } catch (error) {
    console.error('Error in getDevices:', error);
    // Fall back to mock data if there's an error
    return mockDevices;
  }
};

/**
 * BIOMETRIC INTEGRATION POINT
 * 
 * Add a new attendance record from biometric data
 * This function should be called from your biometric API integration
 * 
 * @param {Object} attendanceData The attendance data from the biometric device
 * @returns {Promise<{success: boolean, message: string, data?: any}>}
 */
export const addAttendanceRecord = async (attendanceData: {
  employee_id: string,
  device_id: string,
  punch_time: Date | string,
  verify_type: string,
  status?: string,
  remark?: string
}) => {
  try {
    console.log('INTEGRATION POINT: Adding attendance record', attendanceData);
    
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Supabase not configured. Cannot add attendance record.'
      };
    }
    
    // Validate required fields
    if (!attendanceData.employee_id || !attendanceData.device_id || !attendanceData.punch_time) {
      return {
        success: false,
        message: 'Missing required fields: employee_id, device_id, punch_time'
      };
    }
    
    // Insert the attendance record
    const { data, error } = await supabase
      .from('attendance_logs')
      .insert({
        employee_id: attendanceData.employee_id,
        device_id: attendanceData.device_id,
        punch_time: new Date(attendanceData.punch_time).toISOString(),
        punch_type: 'check-in', // Default to check-in, you may want to determine this based on your logic
        verify_type: attendanceData.verify_type || 'fingerprint',
        status: attendanceData.status || 'Present',
        remark: attendanceData.remark || ''
      })
      .select();
    
    if (error) {
      console.error('Error adding attendance record:', error);
      return {
        success: false,
        message: `Database error: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Attendance record added successfully',
      data: data[0]
    };
  } catch (error) {
    console.error('Error in addAttendanceRecord:', error);
    return {
      success: false,
      message: `Unexpected error: ${error.message || 'Unknown error'}`
    };
  }
};

/**
 * Get attendance statistics for dashboard
 * 
 * @param {Date} startDate Start date for statistics
 * @param {Date} endDate End date for statistics
 * @returns {Promise<{present: number, absent: number, late: number}>}
 */
export const getAttendanceStats = async (startDate?: Date, endDate?: Date) => {
  try {
    // Default to today if no dates provided
    const today = new Date();
    const start = startDate || new Date(today.setHours(0, 0, 0, 0));
    const end = endDate || new Date(today.setHours(23, 59, 59, 999));
    
    if (!isSupabaseConfigured()) {
      // Mock statistics for demo mode
      return {
        present: 24,
        absent: 3,
        late: 5
      };
    }
    
    // Query attendance logs for statistics
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('status, count')
      .gte('punch_time', start.toISOString())
      .lte('punch_time', end.toISOString())
      .group('status');
    
    if (error) {
      console.error('Error fetching attendance statistics:', error);
      throw error;
    }
    
    // Format results
    const stats = {
      present: 0,
      absent: 0,
      late: 0
    };
    
    data.forEach(item => {
      if (item.status?.toLowerCase() === 'present') {
        stats.present = parseInt(item.count);
      } else if (item.status?.toLowerCase() === 'absent') {
        stats.absent = parseInt(item.count);
      } else if (item.status?.toLowerCase() === 'late') {
        stats.late = parseInt(item.count);
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error in getAttendanceStats:', error);
    // Return default stats if there's an error
    return {
      present: 0,
      absent: 0,
      late: 0
    };
  }
};
