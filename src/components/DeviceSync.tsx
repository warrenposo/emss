import React, { useState } from 'react';
import { zktecoService } from '@/services/zkteco';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface DeviceSyncProps {
  deviceId: string;
  deviceName: string;
}

export function DeviceSync({ deviceId, deviceName }: DeviceSyncProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [attendanceCount, setAttendanceCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);

  const handleSync = async () => {
    setIsLoading(true);
    setError('');
    setStatus('Connecting to device...');

    try {
      // Test connection
      const connectResponse = await zktecoService.connect('192.168.100.51', 4370);
      if (!connectResponse.success) {
        throw new Error(connectResponse.message);
      }
      setStatus('Connected successfully');

      // Get attendance records
      setStatus('Fetching attendance records...');
      const attendanceResponse = await zktecoService.getAttendanceRecords('192.168.100.51', 4370);
      if (attendanceResponse.success) {
        setAttendanceCount(attendanceResponse.data.length);
        setStatus(`Found ${attendanceResponse.data.length} attendance records`);
      }

      // Get user records
      setStatus('Fetching user records...');
      const userResponse = await zktecoService.getUserRecords('192.168.100.51', 4370);
      if (userResponse.success) {
        setUserCount(userResponse.data.length);
        setStatus(`Found ${userResponse.data.length} user records`);
      }

      // Get device info
      setStatus('Fetching device information...');
      const deviceInfoResponse = await zktecoService.getDeviceInfo('192.168.100.51', 4370);
      if (deviceInfoResponse.success) {
        setStatus(`Device info retrieved: ${deviceInfoResponse.data.deviceName}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('Sync failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Device Sync: {deviceName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">IP Address: 192.168.100.51</p>
              <p className="text-sm text-muted-foreground">Port: 4370</p>
            </div>
            <Button 
              onClick={handleSync} 
              disabled={isLoading}
              className="w-32"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                'Sync Device'
              )}
            </Button>
          </div>

          {status && (
            <div className="text-sm">
              <p className="font-medium">Status: {status}</p>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500">
              <p>Error: {error}</p>
            </div>
          )}

          {(attendanceCount > 0 || userCount > 0) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium">Attendance Records</p>
                <p className="text-2xl font-bold">{attendanceCount}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium">User Records</p>
                <p className="text-2xl font-bold">{userCount}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 