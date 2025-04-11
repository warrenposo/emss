import React from 'react';
import { DeviceTest } from '@/components/DeviceTest';

export default function TestDevicePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Device Connection Test</h1>
      <DeviceTest />
    </div>
  );
} 