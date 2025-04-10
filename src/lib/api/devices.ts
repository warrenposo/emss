import express from 'express';
import { ZKLib } from '../zklib';

const router = express.Router();

router.post('/sync', async (req, res) => {
  const { device_id, ip_address, port = 4370, timeout = 5000 } = req.body;

  if (!device_id || !ip_address) {
    return res.status(400).json({ 
      success: false,
      message: 'Missing required fields' 
    });
  }

  let zk: ZKLib | null = null;

  try {
    // Initialize ZK device
    zk = new ZKLib(ip_address, port, timeout);
    
    // Connect to device
    console.log('Connecting to device...', ip_address, port);
    await zk.connect();
    console.log('Connected to device');

    // Get device information
    const deviceInfo = await zk.getInfo();
    console.log('Device info:', deviceInfo);

    // Get attendance logs
    console.log('Getting attendance logs...');
    const attendanceLogs = await zk.getAttendance();
    console.log(`Found ${attendanceLogs.length} attendance records`);

    // Return success response
    return res.status(200).json({ 
      success: true,
      message: 'Sync completed successfully',
      records: attendanceLogs.length,
      deviceInfo,
      logs: attendanceLogs
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
});

export default router; 