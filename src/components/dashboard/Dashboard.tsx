
import React from 'react';
import { Calendar, Clock, Fingerprint, ThermometerSun, Laptop } from 'lucide-react';

const Dashboard: React.FC = () => {
  // Mock user data
  const user = {
    badgeNumber: '15',
    name: 'Dominic Ndubi',
    department: 'Sales',
    dateTime: '2025-03-26 21:00:16',
    verifyType: 'FingerPrint',
    temperature: '0',
    deviceName: 'Main Entrance'
  };

  // Mock device status data
  const deviceStats = {
    online: 12,
    offline: 3,
    unlicensed: 1,
    total: 16
  };

  // Mock attendance records
  const attendanceRecords = [
    {
      id: 1,
      photo: '',
      badgeNumber: '15',
      name: 'Dominic Ndubi',
      department: 'Sales',
      dateTime: '2025-03-26 21:00:16',
      verifyType: 'FingerPrint',
      temperature: '0',
      deviceName: 'Main Entrance'
    },
    {
      id: 2,
      photo: '',
      badgeNumber: '22',
      name: 'Jane Smith',
      department: 'Marketing',
      dateTime: '2025-03-26 09:15:22',
      verifyType: 'FingerPrint',
      temperature: '0',
      deviceName: 'Side Entrance'
    },
    {
      id: 3,
      photo: '',
      badgeNumber: '08',
      name: 'Michael Johnson',
      department: 'IT',
      dateTime: '2025-03-26 08:45:10',
      verifyType: 'CardSwipe',
      temperature: '0',
      deviceName: 'IT Department'
    },
    {
      id: 4,
      photo: '',
      badgeNumber: '34',
      name: 'Sarah Williams',
      department: 'Finance',
      dateTime: '2025-03-26 08:30:05',
      verifyType: 'FingerPrint',
      temperature: '0',
      deviceName: 'Main Entrance'
    },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* User card and date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User information card */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-5">
              <div className="flex flex-col lg:flex-row gap-5">
                <div className="flex-shrink-0 bg-primary/10 rounded-lg h-24 w-24 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary/70" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">Badge Number</span>
                      <span className="text-lg font-semibold">{user.badgeNumber}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">Name</span>
                      <span className="text-lg font-semibold">{user.name}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">Department</span>
                      <span className="text-lg font-semibold">{user.department}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">Date Time</span>
                      <span className="text-lg font-semibold">{user.dateTime}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">Verify Type</span>
                      <div className="flex items-center gap-1">
                        <Fingerprint size={18} className="text-primary" />
                        <span className="text-lg font-semibold">{user.verifyType}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">Temperature</span>
                      <div className="flex items-center gap-1">
                        <ThermometerSun size={18} className="text-primary" />
                        <span className="text-lg font-semibold">{user.temperature}°C</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">Device Name</span>
                      <div className="flex items-center gap-1">
                        <Laptop size={18} className="text-primary" />
                        <span className="text-lg font-semibold">{user.deviceName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Date card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm h-full">
            <div className="p-5 flex flex-col h-full">
              <div className="mb-4 flex items-center">
                <Calendar className="h-5 w-5 text-primary mr-2" />
                <h3 className="text-lg font-medium">Today</h3>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold mb-1">{formatDate(new Date().toISOString())}</div>
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span id="current-time">
                    {new Date().toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Status */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-5">
          <h2 className="text-xl font-semibold mb-4">Device Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="flex flex-col items-center">
              <div className="relative h-24 w-24">
                <svg className="h-24 w-24" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eaeaea"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="3"
                    strokeDasharray={`${(deviceStats.online / deviceStats.total) * 100}, 100`}
                    strokeLinecap="round"
                  />
                  <text
                    x="18"
                    y="18"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    fontWeight="bold"
                    fill="#333"
                  >
                    {Math.round((deviceStats.online / deviceStats.total) * 100)}%
                  </text>
                </svg>
              </div>
              <div className="text-center mt-2">
                <div className="font-medium">Online</div>
                <div className="flex items-center justify-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span>{deviceStats.online}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative h-24 w-24">
                <svg className="h-24 w-24" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eaeaea"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray={`${(deviceStats.offline / deviceStats.total) * 100}, 100`}
                    strokeLinecap="round"
                  />
                  <text
                    x="18"
                    y="18"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    fontWeight="bold"
                    fill="#333"
                  >
                    {Math.round((deviceStats.offline / deviceStats.total) * 100)}%
                  </text>
                </svg>
              </div>
              <div className="text-center mt-2">
                <div className="font-medium">Offline</div>
                <div className="flex items-center justify-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span>{deviceStats.offline}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative h-24 w-24">
                <svg className="h-24 w-24" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eaeaea"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="3"
                    strokeDasharray={`${(deviceStats.unlicensed / deviceStats.total) * 100}, 100`}
                    strokeLinecap="round"
                  />
                  <text
                    x="18"
                    y="18"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    fontWeight="bold"
                    fill="#333"
                  >
                    {Math.round((deviceStats.unlicensed / deviceStats.total) * 100)}%
                  </text>
                </svg>
              </div>
              <div className="text-center mt-2">
                <div className="font-medium">Unlicensed</div>
                <div className="flex items-center justify-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                  <span>{deviceStats.unlicensed}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative h-24 w-24">
                <svg className="h-24 w-24" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eaeaea"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                    strokeLinecap="round"
                  />
                  <text
                    x="18"
                    y="18"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    fontWeight="bold"
                    fill="#333"
                  >
                    {deviceStats.total}
                  </text>
                </svg>
              </div>
              <div className="text-center mt-2">
                <div className="font-medium">Total Devices</div>
                <div className="flex items-center justify-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  <span>{deviceStats.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-5">
          <h2 className="text-xl font-semibold mb-4">Recent Attendance</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Photo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Badge Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verify Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Temperature
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device Name
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.badgeNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.dateTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Fingerprint size={16} className="text-primary" />
                        <span>{record.verifyType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <ThermometerSun size={16} className="text-primary" />
                        <span>{record.temperature}°C</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.deviceName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
