import React, { useState } from 'react';
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
      
      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('device-sync', {
        body: { 
          ipAddress,
          deviceId,
          port: 4370 // Default ZKTeco port
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to sync device');
      }

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
        description: error.message || 'Failed to sync device',
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