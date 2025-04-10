import { NextApiRequest, NextApiResponse } from 'next';
import { ZKLib } from '@/lib/zklib';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { device_id, ip_address, port = 4370, timeout = 5000 } = req.body;

  if (!device_id || !ip_address) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Initialize ZK device
    const zk = new ZKLib(ip_address, port, timeout);
    
    // Connect to device
    console.log('Connecting to device...', ip_address, port);
    const connected = await zk.connect();
    
    if (!connected) {
      throw new Error('Failed to connect to device');
    }

    console.log('Connected to device');

    // Get device information
    const deviceInfo = await zk.getInfo();
    console.log('Device info:', deviceInfo);

    // Get attendance logs
    console.log('Getting attendance logs...');
    const attendanceLogs = await zk.getAttendance();
    console.log(`Found ${attendanceLogs.length} attendance records`);

    // Process attendance logs
    // TODO: Save attendance logs to database

    // Disconnect from device
    await zk.disconnect();

    return res.status(200).json({ 
      message: 'Sync completed successfully',
      records: attendanceLogs.length,
      deviceInfo
    });

  } catch (error) {
    console.error('Error syncing device:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to sync with biometric device'
    });
  }
} 