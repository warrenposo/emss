import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import ZKLib from './lib/zklib';

const app = express();
app.use(cors());
app.use(express.json());

// Enable detailed error logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

interface DeviceConnectionRequest {
  ipAddress: string;
  port: number;
  timeout?: number;
}

interface BiometricUser {
  id: string;
  name: string;
  cardNumber: string;
  role: number;
}

interface DeviceInfo {
  serialNumber: string;
  model: string;
  version: string;
}

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

async function initializeDevice(ipAddress: string, port: number, timeout: number = 5000): Promise<any> {
  try {
    console.log(`[DEBUG] Attempting to connect to device at ${ipAddress}:${port} with timeout ${timeout}ms`);
    const zk = new ZKLib(ipAddress, port);
    
    // Try to connect using the socket
    await zk.connect();
    console.log('[DEBUG] Socket created successfully');
    
    // Disable device first (as in the PHP example)
    await zk.disableDevice();
    console.log('[DEBUG] Device disabled successfully');
    
    // Enable device (as in the PHP example)
    await zk.enableDevice();
    console.log('[DEBUG] Device enabled successfully');
    
    console.log('[DEBUG] Successfully connected to device');
    return zk;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[ERROR] Device connection error:', errorMessage);
    throw new Error(`Failed to connect to device at ${ipAddress}:${port}. ${errorMessage}`);
  }
}

app.post('/api/device/connect', async (req: Request<{}, {}, DeviceConnectionRequest>, res: Response): Promise<Response | void> => {
  const { ipAddress, port, timeout } = req.body;
  console.log('[DEBUG] Connection request received:', { ipAddress, port, timeout });

  if (!ipAddress || !port) {
    console.error('[ERROR] Missing required fields:', { ipAddress, port });
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: ipAddress and port are required'
    });
  }

  try {
    const zkInstance = await initializeDevice(ipAddress, port, timeout);
    await zkInstance.disconnect();
    console.log('[DEBUG] Connection successful');
    return res.json({ 
      success: true, 
      message: 'Successfully connected to device',
      device: { ipAddress, port }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[ERROR] Connection failed:', errorMessage);
    return res.status(500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
});

app.post('/api/device/sync', async (req: Request<{}, {}, DeviceConnectionRequest>, res: Response): Promise<Response | void> => {
  const { ipAddress, port, timeout } = req.body;
  console.log('[DEBUG] Sync request received:', { ipAddress, port, timeout });

  if (!ipAddress || !port) {
    console.error('[ERROR] Missing required fields:', { ipAddress, port });
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: ipAddress and port are required'
    });
  }

  try {
    const zkInstance = await initializeDevice(ipAddress, port, timeout);
    
    // Get device information
    console.log('[DEBUG] Getting device info...');
    const deviceInfo = await zkInstance.getInfo();
    console.log('[DEBUG] Device info:', deviceInfo);

    // Get users
    console.log('[DEBUG] Getting users...');
    const response = await zkInstance.getUsers();
    await zkInstance.disconnect();
    console.log('[DEBUG] Retrieved users:', response.data.length);

    const formattedUsers: BiometricUser[] = response.data.map((user: any) => ({
      id: user.id || user.uid,
      name: user.name,
      cardNumber: user.cardno || user.cardNumber,
      role: user.role
    }));

    return res.json({
      success: true,
      data: {
        users: formattedUsers,
        deviceInfo,
        totalUsers: formattedUsers.length
      },
      message: 'Successfully retrieved users from device'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[ERROR] Sync failed:', errorMessage);
    return res.status(500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`[INFO] Server is running on port ${PORT}`);
  console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);
}); 