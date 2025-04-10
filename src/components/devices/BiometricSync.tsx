import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RefreshCw } from 'lucide-react';

type BiometricSyncProps = {
  deviceId: string;
  ipAddress: string;
  onSuccess?: () => void;
};

const BiometricSync: React.FC<BiometricSyncProps> = ({ deviceId, ipAddress, onSuccess }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<string>('');

  const syncMutation = useMutation({
    mutationFn: async () => {
      setIsSyncing(true);
      setSyncProgress('Connecting to device...');
      
      try {
        const response = await fetch('/api/devices/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device_id: deviceId,
            ip_address: ipAddress,
            port: 4370,
            timeout: 5000
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to sync with biometric device');
        }

        setSyncProgress(`Processing ${data.records} records...`);

        // Update the last sync timestamp in the devices table
        const { error: updateError } = await supabase
          .from('devices')
          .update({ 
            last_update: new Date().toISOString(),
            status: 'Online'
          })
          .eq('id', deviceId);

        if (updateError) {
          throw updateError;
        }

        return data;
      } finally {
        setIsSyncing(false);
        setSyncProgress('');
      }
    },
    onSuccess: (data) => {
      toast.success(`Successfully synced ${data.records} attendance records`);
      setIsDialogOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync biometric data: ${error.message}`);
      // Update device status to offline if connection failed
      supabase
        .from('devices')
        .update({ 
          status: 'Offline',
          last_update: new Date().toISOString()
        })
        .eq('id', deviceId)
        .then(() => {
          console.log('Device status updated to offline');
        })
        .catch(console.error);
    },
  });

  const handleSync = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={handleSync}
        disabled={isSyncing}
      >
        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Syncing...' : 'Sync'}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync Biometric Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Device IP</Label>
              <Input value={ipAddress} disabled />
            </div>
            {syncProgress && (
              <div className="text-sm text-gray-500">
                {syncProgress}
              </div>
            )}
            {!isSyncing && (
              <p className="text-sm text-gray-500">
                This will sync attendance records from the biometric device. 
                Make sure the device is powered on and connected to the network.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSyncing}>
              Cancel
            </Button>
            <Button onClick={() => syncMutation.mutate()} disabled={isSyncing}>
              {isSyncing ? 'Syncing...' : 'Start Sync'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BiometricSync; 