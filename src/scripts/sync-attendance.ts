import axios from 'axios';
import { ZKLibrary } from '@/lib/zk-lib';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function syncAttendance() {
  try {
    // Initialize ZKLibrary with device IP and port
    const zk = new ZKLibrary('192.168.1.136', 4370, 'UDP');
    
    // Connect to the device
    if (!zk.connect()) {
      throw new Error('Failed to connect to biometric device');
    }

    // Get attendance data from the device
    const attendanceData = zk.getAttendance();
    
    if (!attendanceData) {
      throw new Error('Failed to get attendance data');
    }

    // Process each attendance record
    for (const record of attendanceData) {
      const [uid, employeeId, state, timestamp] = record;
      
      // Convert timestamp to ISO format
      const dateTime = new Date(timestamp);
      
      // Send attendance data to API
      await axios.post(`${API_URL}/api/attendance`, {
        employee_id: employeeId,
        device_id: 'BIOMETRIC_DEVICE_1',
        timestamp: dateTime.toISOString(),
        state: state === 0 ? 'in' : 'out'
      });
    }

    // Clear attendance data from device after successful sync
    zk.clearAttendance();
    
    // Disconnect from device
    zk.disconnect();
    
    console.log('Attendance sync completed successfully');
  } catch (error) {
    console.error('Error syncing attendance:', error);
  }
}

// Run sync every 5 minutes
setInterval(syncAttendance, 5 * 60 * 1000);

// Initial sync
syncAttendance(); 