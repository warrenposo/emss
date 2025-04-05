
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, Building } from 'lucide-react';
import { toast } from 'sonner';

// Mock data
const initialFenceDepartments = [
  { id: 1, departmentName: "IT Department", fenceDevices: ["Main Gate", "Side Gate"], startTime: "08:00", endTime: "18:00", status: "Active" },
  { id: 2, departmentName: "Finance Department", fenceDevices: ["Main Gate"], startTime: "09:00", endTime: "17:00", status: "Active" },
  { id: 3, departmentName: "HR Department", fenceDevices: ["Main Gate", "Back Gate"], startTime: "08:30", endTime: "17:30", status: "Active" },
  { id: 4, departmentName: "Marketing Department", fenceDevices: ["Side Gate"], startTime: "09:30", endTime: "18:30", status: "Inactive" },
  { id: 5, departmentName: "Operations Department", fenceDevices: ["Main Gate", "Parking Gate"], startTime: "07:00", endTime: "19:00", status: "Active" },
];

// Mock fence devices for selection
const availableFenceDevices = [
  "Main Gate",
  "Back Gate",
  "Side Gate",
  "Parking Gate",
  "Security Checkpoint",
  "Visitor Entrance"
];

const FenceDepartmentsPage = () => {
  const [fenceDepartments, setFenceDepartments] = useState(initialFenceDepartments);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<any>(null);
  const [newDepartment, setNewDepartment] = useState({
    departmentName: '',
    fenceDevices: [] as string[],
    startTime: '09:00',
    endTime: '17:00',
    status: 'Active'
  });

  const filteredDepartments = fenceDepartments.filter(dept => 
    dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDepartment = () => {
    const department = {
      id: fenceDepartments.length + 1,
      ...newDepartment
    };
    setFenceDepartments([...fenceDepartments, department]);
    setNewDepartment({ departmentName: '', fenceDevices: [], startTime: '09:00', endTime: '17:00', status: 'Active' });
    setIsAddDialogOpen(false);
    toast.success('Fence department added successfully');
  };

  const handleEditDepartment = () => {
    setFenceDepartments(fenceDepartments.map(d => 
      d.id === currentDepartment.id ? { ...currentDepartment } : d
    ));
    setIsEditDialogOpen(false);
    toast.success('Fence department updated successfully');
  };

  const handleDeleteDepartment = () => {
    setFenceDepartments(fenceDepartments.filter(d => d.id !== currentDepartment.id));
    setIsDeleteDialogOpen(false);
    toast.success('Fence department deleted successfully');
  };

  const handleDeviceSelection = (device: string, isCurrentDepartment = false) => {
    if (isCurrentDepartment) {
      if (currentDepartment.fenceDevices.includes(device)) {
        setCurrentDepartment({
          ...currentDepartment,
          fenceDevices: currentDepartment.fenceDevices.filter((d: string) => d !== device)
        });
      } else {
        setCurrentDepartment({
          ...currentDepartment,
          fenceDevices: [...currentDepartment.fenceDevices, device]
        });
      }
    } else {
      if (newDepartment.fenceDevices.includes(device)) {
        setNewDepartment({
          ...newDepartment,
          fenceDevices: newDepartment.fenceDevices.filter(d => d !== device)
        });
      } else {
        setNewDepartment({
          ...newDepartment,
          fenceDevices: [...newDepartment.fenceDevices, device]
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Fence Departments</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Add Department
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department Name</TableHead>
              <TableHead>Fence Devices</TableHead>
              <TableHead>Access Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell className="font-medium">{department.departmentName}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {department.fenceDevices.map((device, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-gray-100 rounded-full">{device}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{department.startTime} - {department.endTime}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      department.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {department.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentDepartment(department);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentDepartment(department);
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
                <TableCell colSpan={5} className="text-center">No fence departments found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Department Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Fence Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="departmentName">Department Name</Label>
              <Input
                id="departmentName"
                value={newDepartment.departmentName}
                onChange={(e) => setNewDepartment({ ...newDepartment, departmentName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fence Devices</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableFenceDevices.map((device, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`device-${idx}`}
                      checked={newDepartment.fenceDevices.includes(device)}
                      onChange={() => handleDeviceSelection(device)}
                      className="h-4 w-4 text-primary border-gray-300 rounded"
                    />
                    <label htmlFor={`device-${idx}`} className="text-sm">{device}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newDepartment.startTime}
                  onChange={(e) => setNewDepartment({ ...newDepartment, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newDepartment.endTime}
                  onChange={(e) => setNewDepartment({ ...newDepartment, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={newDepartment.status}
                onChange={(e) => setNewDepartment({ ...newDepartment, status: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDepartment}>Add Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fence Department</DialogTitle>
          </DialogHeader>
          {currentDepartment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-departmentName">Department Name</Label>
                <Input
                  id="edit-departmentName"
                  value={currentDepartment.departmentName}
                  onChange={(e) => setCurrentDepartment({ ...currentDepartment, departmentName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fence Devices</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableFenceDevices.map((device, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`edit-device-${idx}`}
                        checked={currentDepartment.fenceDevices.includes(device)}
                        onChange={() => handleDeviceSelection(device, true)}
                        className="h-4 w-4 text-primary border-gray-300 rounded"
                      />
                      <label htmlFor={`edit-device-${idx}`} className="text-sm">{device}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-startTime">Start Time</Label>
                  <Input
                    id="edit-startTime"
                    type="time"
                    value={currentDepartment.startTime}
                    onChange={(e) => setCurrentDepartment({ ...currentDepartment, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-endTime">End Time</Label>
                  <Input
                    id="edit-endTime"
                    type="time"
                    value={currentDepartment.endTime}
                    onChange={(e) => setCurrentDepartment({ ...currentDepartment, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={currentDepartment.status}
                  onChange={(e) => setCurrentDepartment({ ...currentDepartment, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditDepartment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Department Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Fence Department</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this fence department? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteDepartment}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FenceDepartmentsPage;
