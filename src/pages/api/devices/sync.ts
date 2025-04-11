import type { NextApiRequest, NextApiResponse } from 'next';
import ZKLib from '../../../lib/zklib';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { device_id, ip_address, port = 4370, timeout = 5000 } = req.body;

  if (!device_id || !ip_address) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields: device_id and ip_address are required' 
    });
  }

  let zk: ZKLib | null = null;

  try {
    // Initialize ZK device
    zk = new ZKLib(ip_address, port, timeout);
    
    // Connect to device
    console.log('Connecting to device...', { ip_address, port, timeout });
    const connected = await zk.connect();
    
    if (!connected) {
      throw new Error('Failed to establish connection with device');
    }
    
    console.log('Connected to device successfully');

    // Disable device before operations
    await zk.disableDevice();
    console.log('Device disabled for operations');

    // Get device information
    const deviceInfo = await zk.getInfo();
    console.log('Device info:', deviceInfo);

    // Get attendance logs
    console.log('Getting attendance logs...');
    const attendanceLogs = await zk.getAttendance();
    console.log(`Found ${attendanceLogs.length} attendance records`);

    // Transform attendance logs to match database schema
    const formattedLogs = attendanceLogs.map(log => ({
      employee_id: log[1], // User ID from device
      device_id: device_id,
      punch_time: new Date(log[3]).toISOString(), // Timestamp
      verify_type: getVerifyType(log[2]), // Convert verify type code to string
      status: 'Present', // Default status
      temperature: null, // Temperature if available
      remark: 'Synced from device'
    }));

    // Re-enable device after operations
    await zk.enableDevice();
    console.log('Device re-enabled');

    // Return success response
    return res.status(200).json({ 
      success: true,
      message: 'Sync completed successfully',
      records: formattedLogs.length,
      deviceInfo,
      logs: formattedLogs
    });

  } catch (error) {
    console.error('Error syncing device:', error);
    return res.status(500).json({ 
      success: false,
      message: error instanceof Error ? error.message : 'Failed to sync with biometric device'
    });
  } finally {
    // Always try to disconnect
    if (zk) {
      try {
        await zk.disconnect();
        console.log('Disconnected from device');
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
    }
  }
}

// Helper function to convert device verify type code to string
function getVerifyType(code: number): string {
  switch (code) {
    case 0: return 'password';
    case 1: return 'fingerprint';
    case 2: return 'card';
    case 3: return 'face';
    default: return 'unknown';
  }
} 