import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DeviceSync } from './DeviceSync';

interface Device {
  id: string;
  name: string;
  ip_address: string;
  port: number;
  last_sync: string | null;
  status: string;
}

export function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('name');

      if (error) throw error;
      setDevices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleSyncComplete = async (deviceId: string) => {
    // Update the last_sync timestamp
    const { error } = await supabase
      .from('devices')
      .update({ last_sync: new Date().toISOString() })
      .eq('id', deviceId);

    if (error) {
      console.error('Failed to update last_sync:', error);
    } else {
      // Refresh the device list
      fetchDevices();
    }
    setSyncingDeviceId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="text-red-500">{error}</div>
          <Button 
            variant="outline" 
            onClick={fetchDevices}
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>{device.name}</TableCell>
                  <TableCell>{device.ip_address}</TableCell>
                  <TableCell>{device.port}</TableCell>
                  <TableCell>
                    {device.last_sync 
                      ? new Date(device.last_sync).toLocaleString()
                      : 'Never'}
                  </TableCell>
                  <TableCell>{device.status}</TableCell>
                  <TableCell>
                    {syncingDeviceId === device.id ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Syncing...
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSyncingDeviceId(device.id)}
                      >
                        Sync
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {syncingDeviceId && (
        <DeviceSync
          deviceId={syncingDeviceId}
          onSyncComplete={() => handleSyncComplete(syncingDeviceId)}
        />
      )}
    </div>
  );
} 