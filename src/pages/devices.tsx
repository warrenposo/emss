import React from 'react';
import { DeviceSync } from '@/components/DeviceSync';
import { useDevices } from '@/hooks/useDevices';

export default function DevicesPage() {
  const { devices, isLoading, error } = useDevices();

  if (isLoading) {
    return <div>Loading devices...</div>;
  }

  if (error) {
    return <div>Error loading devices: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Devices</h1>
      <div className="grid gap-6">
        {devices.map((device) => (
          <DeviceSync
            key={device.id}
            deviceId={device.id}
            deviceName={device.name}
          />
        ))}
      </div>
    </div>
  );
} 