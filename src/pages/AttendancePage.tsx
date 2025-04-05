
import React from 'react';
import { useLocation } from 'react-router-dom';
import AttendanceList from '../components/attendance/AttendanceList';
import AttendanceReportsPage from '../components/attendance/AttendanceReportsPage';
import OverviewPage from '../components/attendance/OverviewPage';

const AttendancePage = () => {
  const location = useLocation();
  const path = location.pathname;

  // Render appropriate component based on the route
  if (path === '/attendance/reports') {
    return <AttendanceReportsPage />;
  } else if (path === '/attendance/overview') {
    return <OverviewPage />;
  }

  return <AttendanceList />;
};

export default AttendancePage;
