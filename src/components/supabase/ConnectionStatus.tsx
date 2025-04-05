
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { Wifi, WifiOff } from 'lucide-react';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true);
      try {
        // Simple query to check connection
        const { error } = await supabase.from('departments').select('count', { count: 'exact', head: true });
        setIsConnected(!error);
      } catch (err) {
        console.error('Connection check failed:', err);
        setIsConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
    
    // Set up an interval to periodically check connection
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-700">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse mr-1"></div>
          Checking...
        </div>
      </Badge>
    );
  }

  return isConnected ? (
    <Badge className="bg-green-500 text-white">
      <div className="flex items-center gap-1">
        <Wifi size={14} className="mr-1" />
        Connected
      </div>
    </Badge>
  ) : (
    <Badge variant="destructive">
      <div className="flex items-center gap-1">
        <WifiOff size={14} className="mr-1" />
        Offline
      </div>
    </Badge>
  );
};

export default ConnectionStatus;
