import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import ZKLib from './node-zklib-master/zklib';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env.local');
dotenv.config({ path: envPath });

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Enable detailed error logging
app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

interface DeviceConnectionRequest {
  ipAddress: string;
  port?: number;
  timeout?: number;
  deviceId?: string;
}

interface BiometricUser {
  id: string;
  name: string;
  cardno: string;
  role: number;
}

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function initializeDevice(ipAddress: string, port: number = 4370, timeout: number = 10000) {
  try {
    console.log(`[DEBUG] Attempting to connect to device at ${ipAddress}:${port} with timeout ${timeout}ms`);
    
    const zkInstance = new ZKLib(ipAddress, port, timeout, 4000);

    // Connect to device
    await zkInstance.createSocket();
    console.log('[DEBUG] Successfully connected to device');

    // Get device info
    const deviceInfo = await zkInstance.getInfo();
    console.log('[DEBUG] Device info:', deviceInfo);

    return zkInstance;
  } catch (error) {
    console.error('[ERROR] Device connection error:', error);
    throw new Error(`Failed to connect to device at ${ipAddress}:${port}. ${error.message}`);
  }
}

// Connect to device endpoint
app.post('/api/device/connect', async (req, res) => {
  try {
    const { ipAddress, port, timeout, deviceId } = req.body as DeviceConnectionRequest;
    console.log('[DEBUG] Connection request received:', { ipAddress, port, timeout, deviceId });

    const zkInstance = await initializeDevice(ipAddress, port, timeout);
    
    // Get users from device
    const { data: users } = await zkInstance.getUsers();
    console.log('[DEBUG] Retrieved users:', users.length);

    // Store users in Supabase
    const { error } = await supabase
      .from('biometric_data')
      .upsert(
        users.map(user => ({
          device_id: deviceId,
          user_id: user.id,
          name: user.name,
          card_number: user.cardno,
          role: user.role
        }))
      );

    if (error) {
      throw error;
    }

    // Get attendance records
    const { data: attendances } = await zkInstance.getAttendances();
    console.log('[DEBUG] Retrieved attendances:', attendances.length);

    // Store attendance records in Supabase
    const { error: attendanceError } = await supabase
      .from('attendance_logs')
      .upsert(
        attendances.map(record => ({
          device_id: deviceId,
          employee_id: record.userId,
          punch_time: record.timestamp,
          verify_type: record.verifyType,
          status: record.status
        }))
      );

    if (attendanceError) {
      throw attendanceError;
    }

    // Disconnect from device
    await zkInstance.disconnect();

    res.json({
      success: true,
      message: 'Device connected and data synced successfully',
      data: {
        users: users.length,
        attendances: attendances.length
      }
    });
  } catch (error) {
    console.error('[ERROR] Device connection error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sync device data endpoint
app.post('/api/device/sync', async (req, res) => {
  try {
    const { ipAddress, port, timeout } = req.body as DeviceConnectionRequest;
    console.log('[DEBUG] Sync request received:', { ipAddress, port, timeout });

    const zkInstance = await initializeDevice(ipAddress, port, timeout);
    
    // Get attendance data
    const attendance = await zkInstance.getAttendance();
    console.log('[DEBUG] Retrieved attendance records:', attendance.length);

    // Store attendance in Supabase
    const { error } = await supabase
      .from('attendance_records')
      .upsert(
        attendance.map(record => ({
          user_id: record.uid.toString(),
          timestamp: record.timestamp,
          type: record.type
        }))
      );

    if (error) throw error;

    // Disconnect from device
    await zkInstance.disconnect();
    console.log('[DEBUG] Disconnected from device');

    res.json({ success: true, message: 'Attendance data synced successfully' });
  } catch (error) {
    console.error('[ERROR] Sync failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`[INFO] Server is running on port ${PORT}`);
  console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[INFO] Supabase URL: ${supabaseUrl}`);
}); 