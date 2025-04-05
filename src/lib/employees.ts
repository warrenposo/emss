
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Employees Module
 * 
 * This file contains functions for managing employee data.
 * Handles both demo mode with mock data and real database operations.
 */

// Types for employee data
export interface Employee {
  id?: string;
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

// Mock data for development without Supabase
const mockEmployees = [
  {
    id: '1',
    badge_number: '15',
    first_name: 'Dominic',
    last_name: 'Ndubi',
    gender: 'Male',
    department: 'Sales',
    department_id: '1',
    position: 'Sales Manager',
    position_id: '1',
    card_no: 'C1001',
    passport_no: 'P39284756',
    phone: '+254 723456789',
    mobile: '+254 712345678',
    email: 'dominic.ndubi@example.com',
    birthday: '1985-05-15',
    hire_date: '2020-01-10',
    resign_date: '',
    notes: 'Department lead'
  },
  // Add more mock employees here
];

/**
 * Get all employees with optional filtering
 * 
 * @param {Object} options Filter and pagination options
 * @returns {Promise<{data: Employee[], count: number}>}
 */
export const getEmployees = async ({
  idFilter = '',
  nameFilter = '',
  departmentFilter = '',
  page = 1,
  pageSize = 20
}: {
  idFilter?: string;
  nameFilter?: string;
  departmentFilter?: string;
  page?: number;
  pageSize?: number;
}) => {
  try {
    console.log('Fetching employees with filters:', {
      idFilter, nameFilter, departmentFilter, page, pageSize
    });
    
    // If Supabase is not configured, return mock data
    if (!isSupabaseConfigured()) {
      console.log('Using mock employee data (Supabase not configured)');
      
      // Apply filters to mock data
      let filteredData = [...mockEmployees];
      
      if (idFilter) {
        filteredData = filteredData.filter(employee => 
          employee.badge_number.toLowerCase().includes(idFilter.toLowerCase()));
      }
      
      if (nameFilter) {
        filteredData = filteredData.filter(employee => 
          `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(nameFilter.toLowerCase()));
      }
      
      if (departmentFilter && departmentFilter !== '') {
        filteredData = filteredData.filter(employee => 
          employee.department.toLowerCase() === departmentFilter.toLowerCase());
      }
      
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
    console.log('Using Supabase for employee data');
    
    // Start building the query
    let query = supabase
      .from('employees')
      .select(`
        *,
        departments:department_id (name),
        positions:position_id (title)
      `, { count: 'exact' });

    // Apply filters
    if (idFilter) {
      query = query.ilike('badge_number', `%${idFilter}%`);
    }
    
    if (nameFilter) {
      query = query.or(`first_name.ilike.%${nameFilter}%,last_name.ilike.%${nameFilter}%`);
    }
    
    if (departmentFilter && departmentFilter !== '') {
      query = query.eq('department_id', departmentFilter);
    }
    
    // Calculate pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    // Get paginated results
    const { data, error, count } = await query
      .order('last_name', { ascending: true })
      .range(from, to);
      
    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
    
    // Transform data to match Employee interface
    const formattedData = data.map(employee => ({
      id: employee.id,
      badge_number: employee.badge_number,
      first_name: employee.first_name,
      last_name: employee.last_name,
      gender: employee.gender,
      department: employee.departments?.name || '',
      department_id: employee.department_id,
      position: employee.positions?.title || '',
      position_id: employee.position_id,
      card_no: employee.card_no,
      passport_no: employee.passport_no,
      phone: employee.phone,
      mobile: employee.mobile,
      email: employee.email,
      birthday: employee.birthday,
      hire_date: employee.hire_date,
      resign_date: employee.resign_date || '',
      notes: employee.notes || ''
    }));
    
    return { 
      data: formattedData, 
      count: count || 0 
    };
  } catch (error) {
    console.error('Error in getEmployees:', error);
    // Fall back to mock data if there's an error
    return { 
      data: mockEmployees.slice(0, pageSize),
      count: mockEmployees.length
    };
  }
};

/**
 * Add a new employee
 * 
 * @param {Employee} employee The employee data to add
 * @returns {Promise<{success: boolean, message: string, data?: Employee}>}
 */
export const addEmployee = async (employee: Employee) => {
  try {
    console.log('Adding employee:', employee);
    
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured. Cannot add employee to database.');
      // In demo mode, just simulate a successful addition
      return {
        success: true,
        message: 'Employee added successfully (DEMO MODE - no database changes)',
        data: {
          id: String(mockEmployees.length + 1),
          ...employee
        }
      };
    }
    
    // Validate required fields
    if (!employee.badge_number || !employee.first_name || !employee.last_name || !employee.email || !employee.hire_date) {
      return {
        success: false,
        message: 'Missing required fields'
      };
    }
    
    // Insert the employee
    const { data, error } = await supabase
      .from('employees')
      .insert(employee)
      .select();
    
    if (error) {
      console.error('Error adding employee:', error);
      return {
        success: false,
        message: `Database error: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Employee added successfully',
      data: data[0]
    };
  } catch (error) {
    console.error('Error in addEmployee:', error);
    return {
      success: false,
      message: `Unexpected error: ${error.message || 'Unknown error'}`
    };
  }
};

/**
 * Update an existing employee
 * 
 * @param {string} id The ID of the employee to update
 * @param {Employee} employee The updated employee data
 * @returns {Promise<{success: boolean, message: string, data?: Employee}>}
 */
export const updateEmployee = async (id: string, employee: Partial<Employee>) => {
  try {
    console.log('Updating employee:', { id, employee });
    
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured. Cannot update employee in database.');
      // In demo mode, just simulate a successful update
      return {
        success: true,
        message: 'Employee updated successfully (DEMO MODE - no database changes)',
        data: {
          id,
          ...employee
        } as Employee
      };
    }
    
    // Update the employee
    const { data, error } = await supabase
      .from('employees')
      .update(employee)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating employee:', error);
      return {
        success: false,
        message: `Database error: ${error.message}`
      };
    }
    
    if (!data || data.length === 0) {
      return {
        success: false,
        message: `Employee with ID ${id} not found`
      };
    }
    
    return {
      success: true,
      message: 'Employee updated successfully',
      data: data[0]
    };
  } catch (error) {
    console.error('Error in updateEmployee:', error);
    return {
      success: false,
      message: `Unexpected error: ${error.message || 'Unknown error'}`
    };
  }
};

/**
 * Delete an employee
 * 
 * @param {string} id The ID of the employee to delete
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const deleteEmployee = async (id: string) => {
  try {
    console.log('Deleting employee:', id);
    
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured. Cannot delete employee from database.');
      // In demo mode, just simulate a successful deletion
      return {
        success: true,
        message: 'Employee deleted successfully (DEMO MODE - no database changes)'
      };
    }
    
    // Delete the employee
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting employee:', error);
      return {
        success: false,
        message: `Database error: ${error.message}`
      };
    }
    
    return {
      success: true,
      message: 'Employee deleted successfully'
    };
  } catch (error) {
    console.error('Error in deleteEmployee:', error);
    return {
      success: false,
      message: `Unexpected error: ${error.message || 'Unknown error'}`
    };
  }
};

/**
 * Get all departments
 * 
 * @returns {Promise<{id: string, name: string}[]>}
 */
export const getDepartments = async () => {
  try {
    if (!isSupabaseConfigured()) {
      // Mock departments for demo mode
      return [
        { id: '1', name: 'Sales' },
        { id: '2', name: 'Marketing' },
        { id: '3', name: 'IT' },
        { id: '4', name: 'Finance' },
        { id: '5', name: 'HR' }
      ];
    }
    
    const { data, error } = await supabase
      .from('departments')
      .select('id, name')
      .order('name');
    
    if (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getDepartments:', error);
    // Return mock data on error
    return [
      { id: '1', name: 'Sales' },
      { id: '2', name: 'Marketing' },
      { id: '3', name: 'IT' },
      { id: '4', name: 'Finance' },
      { id: '5', name: 'HR' }
    ];
  }
};

/**
 * Get all positions
 * 
 * @returns {Promise<{id: string, title: string}[]>}
 */
export const getPositions = async () => {
  try {
    if (!isSupabaseConfigured()) {
      // Mock positions for demo mode
      return [
        { id: '1', title: 'Manager' },
        { id: '2', title: 'Supervisor' },
        { id: '3', title: 'Developer' },
        { id: '4', title: 'Designer' },
        { id: '5', title: 'Accountant' }
      ];
    }
    
    const { data, error } = await supabase
      .from('positions')
      .select('id, title')
      .order('title');
    
    if (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getPositions:', error);
    // Return mock data on error
    return [
      { id: '1', title: 'Manager' },
      { id: '2', title: 'Supervisor' },
      { id: '3', title: 'Developer' },
      { id: '4', title: 'Designer' },
      { id: '5', title: 'Accountant' }
    ];
  }
};
