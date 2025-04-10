import express, { Request, Response } from 'express';
import cors from 'cors';
import { ZKLib, ZKUser } from 'node-zklib';

const app = express();
app.use(cors());
app.use(express.json());

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
app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

async function initializeDevice(ipAddress: string, port: number, timeout: number = 5000): Promise<ZKLib> {
  try {
    console.log(`Attempting to connect to device at ${ipAddress}:${port}`);
    const zkInstance = new ZKLib(ipAddress, port);
    await zkInstance.createSocket();
    console.log('Successfully connected to device');
    return zkInstance;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Device connection error:', errorMessage);
    throw new Error(`Failed to connect to device at ${ipAddress}:${port}. ${errorMessage}`);
  }
}

app.post('/api/device/connect', async (req: Request<{}, {}, DeviceConnectionRequest>, res: Response) => {
  const { ipAddress, port, timeout } = req.body;

  if (!ipAddress || !port) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: ipAddress and port are required'
    });
  }

  try {
    const zkInstance = await initializeDevice(ipAddress, port, timeout);
    await zkInstance.disconnect();
    res.json({ 
      success: true, 
      message: 'Successfully connected to device',
      device: { ipAddress, port }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
});

app.post('/api/device/sync', async (req: Request<{}, {}, DeviceConnectionRequest>, res: Response) => {
  const { ipAddress, port, timeout } = req.body;

  if (!ipAddress || !port) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: ipAddress and port are required'
    });
  }

  try {
    const zkInstance = await initializeDevice(ipAddress, port, timeout);
    
    // Get device information
    const deviceInfo = await zkInstance.getInfo();
    console.log('Device info:', deviceInfo);

    // Get users
    const response = await zkInstance.getUsers();
    await zkInstance.disconnect();

    const formattedUsers: BiometricUser[] = response.data.map((user: ZKUser) => ({
      id: user.id,
      name: user.name,
      cardNumber: user.cardno,
      role: user.role
    }));

    res.json({
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
    console.error('Sync error:', errorMessage);
    res.status(500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 