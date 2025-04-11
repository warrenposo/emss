import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { zktecoApiService } from '@/services/zkteco-api';
import { DeviceUser, DeviceAttendanceRecord } from '@/types/device';

interface DeviceSyncProps {
  deviceId: string;
  onSyncComplete?: () => void;
}

export function DeviceSync({ deviceId, onSyncComplete }: DeviceSyncProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const syncDevice = async () => {
    setIsLoading(true);
    setError('');
    setStatus('Starting sync...');

    try {
      // 1. Get attendance records from device
      setStatus('Fetching attendance records from device...');
      const attendanceResponse = await zktecoApiService.getAttendance();
      
      if (!attendanceResponse.success || !attendanceResponse.data) {
        throw new Error(attendanceResponse.error || 'Failed to fetch attendance records');
      }

      const attendanceRecords = attendanceResponse.data as DeviceAttendanceRecord[];
      setStatus(`Found ${attendanceRecords.length} records to sync`);

      // 2. Get user records from device
      setStatus('Fetching user records from device...');
      const usersResponse = await zktecoApiService.getUsers();
      
      if (!usersResponse.success || !usersResponse.data) {
        throw new Error(usersResponse.error || 'Failed to fetch user records');
      }

      const userRecords = usersResponse.data as DeviceUser[];
      setStatus(`Found ${userRecords.length} users to sync`);

      // 3. Sync users to Supabase
      setStatus('Syncing users to database...');
      const { error: usersError } = await supabase
        .from('employees')
        .upsert(
          userRecords.map(user => ({
            id: user.user_id,
            name: user.name,
            card_number: user.card_number,
            device_id: deviceId,
            last_sync: new Date().toISOString()
          })),
          { onConflict: 'id' }
        );

      if (usersError) throw usersError;

      // 4. Sync attendance records to Supabase
      setStatus('Syncing attendance records to database...');
      const { error: attendanceError } = await supabase
        .from('attendance_logs')
        .upsert(
          attendanceRecords.map(record => ({
            id: record.id,
            user_id: record.user_id,
            device_id: deviceId,
            punch_time: record.punch_time,
            verify_type: record.verify_type,
            temperature: record.temperature,
            status: record.status,
            remark: record.remark
          })),
          { onConflict: 'id' }
        );

      if (attendanceError) throw attendanceError;

      setStatus('Sync completed successfully!');
      onSyncComplete?.();

    } catch (err) {
      console.error('Sync error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during sync');
      setStatus('Sync failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Device Sync</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Device ID: {deviceId}</p>
            </div>
            <Button 
              onClick={syncDevice} 
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
        </div>
      </CardContent>
    </Card>
  );
} 