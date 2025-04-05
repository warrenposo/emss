
import React, { useState } from 'react';
import { 
  Search, Edit, Trash2, 
  RefreshCw, DownloadCloud, Database, Menu 
} from 'lucide-react';

const DevicesList: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');

  // Mock devices data
  const devices = [
    {
      id: 1,
      serialNumber: 'AC2200345678',
      deviceAlias: 'Main Entrance',
      lastUpdate: '2023-03-26 09:15:22',
      areaName: 'Main Building',
      updateStatus: 'Updated',
      licence: 'Licensed',
      deviceName: 'FingerPrint Scanner A101',
      statusString: 'Online',
      timezone: 'Africa/Nairobi',
      mac: '00:1A:2B:3C:4D:5E',
      ipAddress: '192.168.1.100',
      platform: 'Linux',
      fwVersion: '2.1.5',
      pushVersion: '1.0.3'
    },
    {
      id: 2,
      serialNumber: 'AC2200345679',
      deviceAlias: 'Side Entrance',
      lastUpdate: '2023-03-26 09:10:15',
      areaName: 'East Wing',
      updateStatus: 'Updated',
      licence: 'Licensed',
      deviceName: 'FingerPrint Scanner A101',
      statusString: 'Online',
      timezone: 'Africa/Nairobi',
      mac: '00:1A:2B:3C:4D:5F',
      ipAddress: '192.168.1.101',
      platform: 'Linux',
      fwVersion: '2.1.5',
      pushVersion: '1.0.3'
    },
    {
      id: 3,
      serialNumber: 'AC2200345680',
      deviceAlias: 'IT Department',
      lastUpdate: '2023-03-26 08:45:10',
      areaName: 'Second Floor',
      updateStatus: 'Updated',
      licence: 'Licensed',
      deviceName: 'Card Reader X200',
      statusString: 'Online',
      timezone: 'Africa/Nairobi',
      mac: '00:1A:2B:3C:4D:60',
      ipAddress: '192.168.1.102',
      platform: 'Linux',
      fwVersion: '1.9.2',
      pushVersion: '1.0.2'
    },
    {
      id: 4,
      serialNumber: 'AC2200345681',
      deviceAlias: 'Finance Department',
      lastUpdate: '2023-03-25 17:30:05',
      areaName: 'Third Floor',
      updateStatus: 'Pending',
      licence: 'Licensed',
      deviceName: 'FingerPrint Scanner A101',
      statusString: 'Offline',
      timezone: 'Africa/Nairobi',
      mac: '00:1A:2B:3C:4D:61',
      ipAddress: '192.168.1.103',
      platform: 'Linux',
      fwVersion: '2.1.4',
      pushVersion: '1.0.3'
    },
    {
      id: 5,
      serialNumber: 'AC2200345682',
      deviceAlias: 'HR Department',
      lastUpdate: '2023-03-26 09:00:18',
      areaName: 'First Floor',
      updateStatus: 'Updated',
      licence: 'Unlicensed',
      deviceName: 'Card Reader X200',
      statusString: 'Online',
      timezone: 'Africa/Nairobi',
      mac: '00:1A:2B:3C:4D:62',
      ipAddress: '192.168.1.104',
      platform: 'Linux',
      fwVersion: '1.9.2',
      pushVersion: '1.0.2'
    }
  ];

  // Filter devices based on search input
  const filteredDevices = devices.filter(device => {
    return (
      device.serialNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      device.deviceAlias.toLowerCase().includes(searchValue.toLowerCase()) ||
      device.deviceName.toLowerCase().includes(searchValue.toLowerCase()) ||
      device.areaName.toLowerCase().includes(searchValue.toLowerCase()) ||
      device.ipAddress.toLowerCase().includes(searchValue.toLowerCase())
    );
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-5">
          <h2 className="text-xl font-semibold mb-5">Device Management</h2>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button className="btn-outline flex items-center gap-1">
              <Edit size={16} />
              <span>Edit License</span>
            </button>
            <button className="btn-outline flex items-center gap-1">
              <Edit size={16} />
              <span>Edit Device</span>
            </button>
            <div className="relative">
              <button className="btn-outline flex items-center gap-1">
                <Database size={16} />
                <span>Clear Data</span>
                <Menu size={16} />
              </button>
            </div>
            <div className="relative">
              <button className="btn-outline flex items-center gap-1">
                <Edit size={16} />
                <span>Device Name</span>
                <Menu size={16} />
              </button>
            </div>
            <div className="relative">
              <button className="btn-outline flex items-center gap-1">
                <DownloadCloud size={16} />
                <span>Transfer Data</span>
                <Menu size={16} />
              </button>
            </div>
            <div className="relative">
              <button className="btn-outline flex items-center gap-1">
                <RefreshCw size={16} />
                <span>Clear Data</span>
                <Menu size={16} />
              </button>
            </div>
            <button className="btn-outline flex items-center gap-1">
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
          
          {/* Search filter */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search devices by serial number, name, alias or IP..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="form-input"
              />
            </div>
            <button className="btn-primary flex items-center gap-1 flex-shrink-0">
              <Search size={16} />
              <span>Search</span>
            </button>
          </div>
          
          {/* Devices table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serial Number
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device Alias
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Update
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Area Name
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Update Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    License
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device Name
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timezone
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MAC
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platform
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FW Version
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Push Version
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {device.serialNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {device.deviceAlias}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {device.lastUpdate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {device.areaName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        device.updateStatus === 'Updated' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {device.updateStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        device.licence === 'Licensed' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {device.licence}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {device.deviceName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        device.statusString === 'Online' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {device.statusString}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {device.timezone}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {device.mac}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {device.ipAddress}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {device.platform}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {device.fwVersion}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {device.pushVersion}
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

export default DevicesList;
