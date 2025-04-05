
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import EmployeesList from '../components/employees/EmployeesList';
import HolidaysPage from '../components/employees/HolidaysPage';
import DepartmentsPage from '../components/employees/DepartmentsPage';
import AreasPage from '../components/employees/AreasPage';
import PositionsPage from '../components/employees/PositionsPage';
import TimetablesPage from '../components/employees/TimetablesPage';
import ShiftsPage from '../components/employees/ShiftsPage';
import DepartmentSchedulePage from '../components/employees/DepartmentSchedulePage';
import TemporarySchedulesPage from '../components/employees/TemporarySchedulesPage';
import LeavesPage from '../components/employees/LeavesPage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the function to check and create necessary tables
const createRequiredTables = async () => {
  try {
    console.log('Checking for required tables...');
    
    // Safely check if tables exist using a more reliable approach
    try {
      // Holidays table check
      const { data: holidaysData, error: holidaysError } = await supabase
        .from('holidays')
        .select('id')
        .limit(1);
      
      if (holidaysError) {
        console.error('Error checking holidays table:', holidaysError);
        toast.error('Error checking holidays table: ' + holidaysError.message);
      } else {
        console.log('Holidays table exists');
      }
    } catch (err) {
      console.error('Error checking holidays table:', err);
    }

    try {
      // Timetables table check
      const { data: timetablesData, error: timetablesError } = await supabase
        .from('timetables')
        .select('id')
        .limit(1);
      
      if (timetablesError) {
        console.error('Error checking timetables table:', timetablesError);
        toast.error('Error checking timetables table: ' + timetablesError.message);
      } else {
        console.log('Timetables table exists');
      }
    } catch (err) {
      console.error('Error checking timetables table:', err);
    }

    try {
      // Shifts table check
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select('id')
        .limit(1);
      
      if (shiftsError) {
        console.error('Error checking shifts table:', shiftsError);
        toast.error('Error checking shifts table: ' + shiftsError.message);
      } else {
        console.log('Shifts table exists');
      }
    } catch (err) {
      console.error('Error checking shifts table:', err);
    }

    // Check if user is admin or has necessary permissions
    const { data: userData } = await supabase.auth.getUser();
    if (userData && userData.user) {
      console.log('Checking user permissions for user:', userData.user.id);
      
      // Get user role from user_profiles
      const { data: userProfile, error: userProfileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userData.user.id)
        .single();
        
      if (userProfileError) {
        console.error('Error checking user profile:', userProfileError);
        // Let's create a profile for this user if it doesn't exist
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: userData.user.id,
            first_name: userData.user.user_metadata?.first_name || 'User',
            last_name: userData.user.user_metadata?.last_name || '',
            role: 'administrator' // Make this user an admin
          });
          
        if (insertError) {
          console.error('Error creating user profile:', insertError);
        } else {
          console.log('Created admin profile for user');
          toast.success('Your administrator profile has been created. Please refresh the page.');
        }
      } else {
        console.log('User role:', userProfile?.role);
      }
    }

    console.log('Required tables check complete');
  } catch (error) {
    console.error('Error checking tables:', error);
    toast.error('Error checking required tables');
  }
};

const EmployeePage = () => {
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    // Check tables and user permissions when the component mounts
    createRequiredTables();
  }, []);

  // Render appropriate component based on the route
  if (path === '/employees/holidays') {
    return <HolidaysPage />;
  } else if (path === '/employees/departments') {
    return <DepartmentsPage />;
  } else if (path === '/employees/areas') {
    return <AreasPage />;
  } else if (path === '/employees/positions') {
    return <PositionsPage />;
  } else if (path === '/employees/timetables') {
    return <TimetablesPage />;
  } else if (path === '/employees/shifts') {
    return <ShiftsPage />;
  } else if (path === '/employees/department-schedules') {
    return <DepartmentSchedulePage />;
  } else if (path === '/employees/temporary-schedules') {
    return <TemporarySchedulesPage />;
  } else if (path === '/employees/leaves') {
    return <LeavesPage />;
  }

  return <EmployeesList />;
};

export default EmployeePage;
