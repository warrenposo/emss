
import React from 'react';
import { useLocation } from 'react-router-dom';
import DevicesList from '../components/devices/DevicesList';
import FenceDevicesPage from '../components/devices/FenceDevicesPage';
import FenceDepartmentsPage from '../components/devices/FenceDepartmentsPage';

const DevicesPage = () => {
  const location = useLocation();
  const path = location.pathname;

  // Render appropriate component based on the route
  if (path === '/devices/fence-devices') {
    return <FenceDevicesPage />;
  } else if (path === '/devices/fence-departments') {
    return <FenceDepartmentsPage />;
  }

  return <DevicesList />;
};

export default DevicesPage;
