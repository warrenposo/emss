import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { zktecoService } from '@/services/zkteco';

export function DeviceTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [userRecords, setUserRecords] = useState<any[]>([]);

  const testConnection = async () => {
    setIsLoading(true);
    setError('');
    setStatus('Testing connection...');

    try {
      // Test connection
      const connectResponse = await zktecoService.connect('192.168.100.51', 4370);
      if (!connectResponse.success) {
        throw new Error(connectResponse.message);
      }
      setStatus('Connected successfully');

      // Get device info
      setStatus('Fetching device information...');
      const deviceInfoResponse = await zktecoService.getDeviceInfo('192.168.100.51', 4370);
      if (deviceInfoResponse.success) {
        setDeviceInfo(deviceInfoResponse.data);
        setStatus(`Device info retrieved: ${deviceInfoResponse.data.deviceName}`);
      }

      // Get attendance records
      setStatus('Fetching attendance records...');
      const attendanceResponse = await zktecoService.getAttendanceRecords('192.168.100.51', 4370);
      if (attendanceResponse.success) {
        setAttendanceRecords(attendanceResponse.data);
        setStatus(`Found ${attendanceResponse.data.length} attendance records`);
      }

      // Get user records
      setStatus('Fetching user records...');
      const userResponse = await zktecoService.getUserRecords('192.168.100.51', 4370);
      if (userResponse.success) {
        setUserRecords(userResponse.data);
        setStatus(`Found ${userResponse.data.length} user records`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('Test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Device Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">IP Address: 192.168.100.51</p>
              <p className="text-sm text-muted-foreground">Port: 4370</p>
            </div>
            <Button 
              onClick={testConnection} 
              disabled={isLoading}
              className="w-32"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
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

          {deviceInfo && (
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Device Information</h3>
              <pre className="text-sm">
                {JSON.stringify(deviceInfo, null, 2)}
              </pre>
            </div>
          )}

          {attendanceRecords.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Attendance Records ({attendanceRecords.length})</h3>
              <div className="max-h-60 overflow-y-auto">
                <pre className="text-sm">
                  {JSON.stringify(attendanceRecords.slice(0, 5), null, 2)}
                  {attendanceRecords.length > 5 && (
                    <p className="text-muted-foreground mt-2">
                      ... and {attendanceRecords.length - 5} more records
                    </p>
                  )}
                </pre>
              </div>
            </div>
          )}

          {userRecords.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">User Records ({userRecords.length})</h3>
              <div className="max-h-60 overflow-y-auto">
                <pre className="text-sm">
                  {JSON.stringify(userRecords.slice(0, 5), null, 2)}
                  {userRecords.length > 5 && (
                    <p className="text-muted-foreground mt-2">
                      ... and {userRecords.length - 5} more records
                    </p>
                  )}
                </pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 