import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Device {
  id: string;
  name: string;
  ip_address: string;
  port: number;
  status: 'active' | 'inactive';
}

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDevices() {
      try {
        const { data, error } = await supabase
          .from('devices')
          .select('*');

        if (error) throw error;

        setDevices(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch devices');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDevices();
  }, []);

  return { devices, isLoading, error };
} 