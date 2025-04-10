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
        const response = await fetch('/api/attendance/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device_id: deviceId,
            ip_address: ipAddress,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to sync with biometric device');
        }

        // Update the last sync timestamp in the devices table
        const { error } = await supabase
          .from('devices')
          .update({ last_sync: new Date().toISOString() })
          .eq('id', deviceId);

        if (error) {
          throw error;
        }

        return response.json();
      } finally {
        setIsSyncing(false);
      }
    },
    onSuccess: () => {
      toast.success('Biometric data synced successfully');
      setIsDialogOpen(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to sync biometric data: ${error.message}`);
    },
  });

  const handleSync = async () => {
    await syncMutation.mutateAsync();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        disabled={isSyncing}
      >
        <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
        {isSyncing ? 'Syncing...' : 'Sync'}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync Biometric Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              This will sync attendance data from the biometric device at {ipAddress}.
              The process may take a few minutes.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSyncing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSync}
                disabled={isSyncing}
              >
                {isSyncing ? 'Syncing...' : 'Start Sync'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BiometricSync; 