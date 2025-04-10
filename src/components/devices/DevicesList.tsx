import React, { useState } from 'react';
import { 
  Search, Edit, Trash2, 
  RefreshCw, DownloadCloud, Database, Menu 
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BiometricSync from './BiometricSync';

type Device = {
  id: string;
  serial_number: string;
  device_name: string;
  last_update: string;
  area_name: string;
  update_status: string;
  license: string;
  status_string: string;
  timezone: string;
  mac: string;
  ip_address: string;
  platform: string;
  fw_version: string;
  push_version: string;
  device_type: string;
  is_biometric: boolean;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
};

const DevicesList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [newDevice, setNewDevice] = useState<Partial<Device>>({
    serial_number: '',
    device_name: '',
    ip_address: '',
    is_biometric: false,
  });

  const queryClient = useQueryClient();

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Device[];
    },
  });

  const addDeviceMutation = useMutation({
    mutationFn: async (device: Partial<Device>) => {
      const { data, error } = await supabase
        .from('devices')
        .insert([{
          serial_number: device.serial_number,
          device_name: device.device_name,
          ip_address: device.ip_address,
          is_biometric: device.is_biometric,
          last_update: new Date().toISOString(),
          status_string: 'Online',
          device_type: device.is_biometric ? 'Biometric' : 'Standard',
          platform: 'Windows',
          fw_version: '1.0.0',
          push_version: '1.0.0',
          timezone: 'UTC',
          mac: '00:00:00:00:00:00'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as Device;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setIsAddDialogOpen(false);
      setNewDevice({
        serial_number: '',
        device_name: '',
        ip_address: '',
        is_biometric: false,
      });
      toast.success('Device added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add device: ${error.message}`);
    },
  });

  const updateDeviceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Device> }) => {
      const { data, error } = await supabase
        .from('devices')
        .update({
          serial_number: updates.serial_number,
          device_name: updates.device_name,
          ip_address: updates.ip_address,
          is_biometric: updates.is_biometric,
          last_update: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Device;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setIsEditDialogOpen(false);
      setSelectedDevice(null);
      toast.success('Device updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update device: ${error.message}`);
    },
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setIsDeleteDialogOpen(false);
      setSelectedDevice(null);
      toast.success('Device deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete device: ${error.message}`);
    },
  });

  const filteredDevices = devices.filter(device =>
    device.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.ip_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!newDevice.serial_number || !newDevice.device_name || !newDevice.ip_address) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate IP address format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(newDevice.ip_address)) {
      toast.error('Please enter a valid IP address');
      return;
    }

    addDeviceMutation.mutate(newDevice);
  };

  const handleEdit = () => {
    if (selectedDevice) {
      updateDeviceMutation.mutate({
        id: selectedDevice.id,
        updates: selectedDevice,
      });
    }
  };

  const handleDelete = () => {
    if (selectedDevice) {
      deleteDeviceMutation.mutate(selectedDevice.id);
    }
  };

  if (isLoading) {
    return <div>Loading devices...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Devices</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Add Device
        </Button>
      </div>

      <Input
        placeholder="Search devices..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Serial Number</th>
              <th className="p-4 text-left">Device Name</th>
              <th className="p-4 text-left">IP Address</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Last Update</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device) => (
              <tr key={device.id} className="border-b">
                <td className="p-4">{device.serial_number}</td>
                <td className="p-4">{device.device_name}</td>
                <td className="p-4">{device.ip_address}</td>
                <td className="p-4">
                  {device.is_biometric ? 'Biometric' : 'Standard'}
                </td>
                <td className="p-4">
                  {new Date(device.last_update).toLocaleString()}
                </td>
                <td className="p-4 space-x-2">
                  {device.is_biometric && (
                    <BiometricSync
                      deviceId={device.id}
                      ipAddress={device.ip_address}
                      onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['devices'] });
                      }}
                    />
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedDevice(device);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedDevice(device);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Device Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Serial Number</Label>
              <Input
                value={newDevice.serial_number}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, serial_number: e.target.value })
                }
                placeholder="Enter device serial number"
              />
            </div>
            <div>
              <Label>Device Name</Label>
              <Input
                value={newDevice.device_name}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, device_name: e.target.value })
                }
                placeholder="Enter device name"
              />
            </div>
            <div>
              <Label>IP Address</Label>
              <Input
                value={newDevice.ip_address}
                onChange={(e) =>
                  setNewDevice({ ...newDevice, ip_address: e.target.value })
                }
                placeholder="Enter device IP address (e.g., 192.168.100.51)"
              />
            </div>
            <div>
              <Label>Device Type</Label>
              <Select
                value={newDevice.is_biometric ? 'biometric' : 'standard'}
                onValueChange={(value) =>
                  setNewDevice({ ...newDevice, is_biometric: value === 'biometric' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="biometric">Biometric</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Device</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Device Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Device</DialogTitle>
          </DialogHeader>
          {selectedDevice && (
            <div className="space-y-4">
              <div>
                <Label>Serial Number</Label>
                <Input
                  value={selectedDevice.serial_number}
                  onChange={(e) =>
                    setSelectedDevice({
                      ...selectedDevice,
                      serial_number: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Device Name</Label>
                <Input
                  value={selectedDevice.device_name}
                  onChange={(e) =>
                    setSelectedDevice({
                      ...selectedDevice,
                      device_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>IP Address</Label>
                <Input
                  value={selectedDevice.ip_address}
                  onChange={(e) =>
                    setSelectedDevice({
                      ...selectedDevice,
                      ip_address: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Device Type</Label>
                <Select
                  value={selectedDevice.is_biometric ? 'biometric' : 'standard'}
                  onValueChange={(value) =>
                    setSelectedDevice({
                      ...selectedDevice,
                      is_biometric: value === 'biometric',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="biometric">Biometric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Device Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Device</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this device? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DevicesList;
