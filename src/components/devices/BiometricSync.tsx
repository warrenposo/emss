import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface BiometricSyncProps {
  deviceId: string;
  ipAddress: string;
  onSuccess?: () => void;
}

export function BiometricSync({ deviceId, ipAddress, onSuccess }: BiometricSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      console.log('Starting sync with device:', { deviceId, ipAddress });
      
      // Call the local server endpoint
      const response = await fetch('http://localhost:3005/api/device/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ipAddress,
          deviceId,
          port: 4370 // Default ZKTeco port
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync device');
      }

      const data = await response.json();
      console.log('Sync response:', data);

      toast({
        title: 'Success',
        description: 'Biometric data synced successfully',
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      onSuccess?.();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sync device',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
    >
      {isSyncing ? 'Syncing...' : 'Sync'}
    </Button>
  );
} 