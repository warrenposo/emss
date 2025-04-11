import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { zktecoApiService } from '@/services/zkteco-api';
import { ZKTECO_API_CONFIG } from '@/config/zkteco-api';

export function ZKTecoApiTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [devices, setDevices] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const testApi = async () => {
    setIsLoading(true);
    setError('');
    setStatus('Testing API connection...');

    try {
      // Test devices endpoint
      setStatus('Fetching devices...');
      const devicesResponse = await zktecoApiService.getDevices();
      if (devicesResponse.success && devicesResponse.data) {
        setDevices(devicesResponse.data);
        setStatus(`Found ${devicesResponse.data.length} devices`);
      } else {
        throw new Error(devicesResponse.error || 'Failed to fetch devices');
      }

      // Test attendance endpoint
      setStatus('Fetching attendance records...');
      const attendanceResponse = await zktecoApiService.getAttendance();
      if (attendanceResponse.success && attendanceResponse.data) {
        setAttendance(attendanceResponse.data);
        setStatus(`Found ${attendanceResponse.data.length} attendance records`);
      }

      // Test users endpoint
      setStatus('Fetching users...');
      const usersResponse = await zktecoApiService.getUsers();
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
        setStatus(`Found ${usersResponse.data.length} users`);
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
        <CardTitle>ZKTeco API Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">API Base URL: {ZKTECO_API_CONFIG.baseUrl}</p>
            </div>
            <Button 
              onClick={testApi} 
              disabled={isLoading}
              className="w-32"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test API'
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

          {devices.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Devices ({devices.length})</h3>
              <div className="max-h-60 overflow-y-auto">
                <pre className="text-sm">
                  {JSON.stringify(devices.slice(0, 5), null, 2)}
                  {devices.length > 5 && (
                    <p className="text-muted-foreground mt-2">
                      ... and {devices.length - 5} more devices
                    </p>
                  )}
                </pre>
              </div>
            </div>
          )}

          {attendance.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Attendance Records ({attendance.length})</h3>
              <div className="max-h-60 overflow-y-auto">
                <pre className="text-sm">
                  {JSON.stringify(attendance.slice(0, 5), null, 2)}
                  {attendance.length > 5 && (
                    <p className="text-muted-foreground mt-2">
                      ... and {attendance.length - 5} more records
                    </p>
                  )}
                </pre>
              </div>
            </div>
          )}

          {users.length > 0 && (
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Users ({users.length})</h3>
              <div className="max-h-60 overflow-y-auto">
                <pre className="text-sm">
                  {JSON.stringify(users.slice(0, 5), null, 2)}
                  {users.length > 5 && (
                    <p className="text-muted-foreground mt-2">
                      ... and {users.length - 5} more users
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