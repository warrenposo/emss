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
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/device-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          ipAddress,
          deviceId
        })
      });

      const data = await response.json();

      if (!response.ok) {
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
      toast({
        title: 'Error',
        description: error.message,
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