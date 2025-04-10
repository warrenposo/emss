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

  const syncMutation = useMutation({
    mutationFn: async () => {
      setIsSyncing(true);
      try {
        // Call the API endpoint to sync with the biometric device
        const response = await fetch('/api/devices/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device_id: deviceId,
            ip_address: ipAddress,
            port: 4370, // Default ZKTeco port
            timeout: 5000 // 5 seconds timeout
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to sync with biometric device');
        }

        const data = await response.json();

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
      }
    },
    onSuccess: (data) => {
      toast.success(`Biometric data synced successfully. ${data.records || 0} records processed.`);
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

  const handleSync = async () => {
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
            <p className="text-sm text-gray-500">
              This will sync attendance records from the biometric device. 
              Make sure the device is powered on and connected to the network.
            </p>
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