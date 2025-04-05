
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, Wifi } from 'lucide-react';
import { toast } from 'sonner';

// Mock data
const initialFenceDevices = [
  { id: 1, name: "Main Gate", deviceId: "FD-001", ipAddress: "192.168.1.100", location: "Main Entrance", status: "Online" },
  { id: 2, name: "Back Gate", deviceId: "FD-002", ipAddress: "192.168.1.101", location: "Back Entrance", status: "Online" },
  { id: 3, name: "Side Gate", deviceId: "FD-003", ipAddress: "192.168.1.102", location: "East Wing", status: "Offline" },
  { id: 4, name: "Parking Gate", deviceId: "FD-004", ipAddress: "192.168.1.103", location: "Parking Area", status: "Online" },
];

const FenceDevicesPage = () => {
  const [fenceDevices, setFenceDevices] = useState(initialFenceDevices);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<any>(null);
  const [newDevice, setNewDevice] = useState({
    name: '',
    deviceId: '',
    ipAddress: '',
    location: '',
    status: 'Online'
  });

  const filteredDevices = fenceDevices.filter(device => 
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDevice = () => {
    const device = {
      id: fenceDevices.length + 1,
      ...newDevice
    };
    setFenceDevices([...fenceDevices, device]);
    setNewDevice({ name: '', deviceId: '', ipAddress: '', location: '', status: 'Online' });
    setIsAddDialogOpen(false);
    toast.success('Fence device added successfully');
  };

  const handleEditDevice = () => {
    setFenceDevices(fenceDevices.map(d => 
      d.id === currentDevice.id ? { ...currentDevice } : d
    ));
    setIsEditDialogOpen(false);
    toast.success('Fence device updated successfully');
  };

  const handleDeleteDevice = () => {
    setFenceDevices(fenceDevices.filter(d => d.id !== currentDevice.id));
    setIsDeleteDialogOpen(false);
    toast.success('Fence device deleted successfully');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fence Devices</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Add Device
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search devices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device Name</TableHead>
              <TableHead>Device ID</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDevices.length > 0 ? (
              filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>{device.deviceId}</TableCell>
                  <TableCell>{device.ipAddress}</TableCell>
                  <TableCell>{device.location}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${device.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>{device.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentDevice(device);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentDevice(device);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No fence devices found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Device Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Fence Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Device Name</Label>
              <Input
                id="name"
                value={newDevice.name}
                onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deviceId">Device ID</Label>
              <Input
                id="deviceId"
                value={newDevice.deviceId}
                onChange={(e) => setNewDevice({ ...newDevice, deviceId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                value={newDevice.ipAddress}
                onChange={(e) => setNewDevice({ ...newDevice, ipAddress: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={newDevice.location}
                onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDevice}>Add Device</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Device Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fence Device</DialogTitle>
          </DialogHeader>
          {currentDevice && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Device Name</Label>
                <Input
                  id="edit-name"
                  value={currentDevice.name}
                  onChange={(e) => setCurrentDevice({ ...currentDevice, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-deviceId">Device ID</Label>
                <Input
                  id="edit-deviceId"
                  value={currentDevice.deviceId}
                  onChange={(e) => setCurrentDevice({ ...currentDevice, deviceId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ipAddress">IP Address</Label>
                <Input
                  id="edit-ipAddress"
                  value={currentDevice.ipAddress}
                  onChange={(e) => setCurrentDevice({ ...currentDevice, ipAddress: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={currentDevice.location}
                  onChange={(e) => setCurrentDevice({ ...currentDevice, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={currentDevice.status}
                  onChange={(e) => setCurrentDevice({ ...currentDevice, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditDevice}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Device Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Fence Device</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this fence device? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteDevice}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FenceDevicesPage;
