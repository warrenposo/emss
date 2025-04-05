
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, Calendar, Download, Filter } from 'lucide-react';
import { toast } from 'sonner';

// Mock data for departments and shifts
const departments = [
  { id: 1, name: "Administration" },
  { id: 2, name: "IT" },
  { id: 3, name: "Finance" },
  { id: 4, name: "Human Resources" },
  { id: 5, name: "Operations" },
];

const shifts = [
  { id: 1, name: "Morning Shift" },
  { id: 2, name: "Afternoon Shift" },
  { id: 3, name: "Evening Shift" },
  { id: 4, name: "Night Shift" },
];

// Mock data for schedules
const initialSchedules = [
  { id: 1, department: "Administration", shift: "Morning Shift", startDate: "2023-06-01", endDate: "2023-06-30", status: "Active" },
  { id: 2, department: "IT", shift: "Afternoon Shift", startDate: "2023-06-01", endDate: "2023-06-30", status: "Active" },
  { id: 3, department: "Finance", shift: "Evening Shift", startDate: "2023-06-01", endDate: "2023-06-30", status: "Active" },
  { id: 4, department: "Operations", shift: "Night Shift", startDate: "2023-06-01", endDate: "2023-06-30", status: "Pending" },
];

const DepartmentSchedulePage = () => {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<any>(null);
  const [newSchedule, setNewSchedule] = useState({
    department: "",
    shift: "",
    startDate: "",
    endDate: "",
    status: "Pending"
  });

  // Filter schedules based on search term and department filter
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = 
      schedule.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.shift.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === "" || schedule.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const handleAddSchedule = () => {
    const schedule = {
      id: schedules.length + 1,
      ...newSchedule
    };
    setSchedules([...schedules, schedule]);
    setNewSchedule({
      department: "",
      shift: "",
      startDate: "",
      endDate: "",
      status: "Pending"
    });
    setIsAddDialogOpen(false);
    toast.success('Schedule added successfully');
  };

  const handleEditSchedule = () => {
    setSchedules(schedules.map(s => 
      s.id === currentSchedule.id ? { ...currentSchedule } : s
    ));
    setIsEditDialogOpen(false);
    toast.success('Schedule updated successfully');
  };

  const handleDeleteSchedule = () => {
    setSchedules(schedules.filter(s => s.id !== currentSchedule.id));
    setIsDeleteDialogOpen(false);
    toast.success('Schedule deleted successfully');
  };

  const handleExport = () => {
    toast.success('Schedule exported successfully');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Department Schedules</h1>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Export
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Add Schedule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search schedules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div>
          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger>
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <span>{filterDepartment || "Filter by Department"}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_departments">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.department}</TableCell>
                  <TableCell>{schedule.shift}</TableCell>
                  <TableCell>{schedule.startDate}</TableCell>
                  <TableCell>{schedule.endDate}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${schedule.status === 'Active' ? 'bg-green-100 text-green-800' : 
                        schedule.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {schedule.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentSchedule(schedule);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentSchedule(schedule);
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
                <TableCell colSpan={6} className="text-center">No schedules found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Schedule Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Department Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                value={newSchedule.department} 
                onValueChange={(value) => setNewSchedule({ ...newSchedule, department: value })}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift">Shift</Label>
              <Select 
                value={newSchedule.shift} 
                onValueChange={(value) => setNewSchedule({ ...newSchedule, shift: value })}
              >
                <SelectTrigger id="shift">
                  <SelectValue placeholder="Select Shift" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map(shift => (
                    <SelectItem key={shift.id} value={shift.name}>{shift.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newSchedule.startDate}
                  onChange={(e) => setNewSchedule({ ...newSchedule, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newSchedule.endDate}
                  onChange={(e) => setNewSchedule({ ...newSchedule, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newSchedule.status} 
                onValueChange={(value) => setNewSchedule({ ...newSchedule, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSchedule}>Add Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department Schedule</DialogTitle>
          </DialogHeader>
          {currentSchedule && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select 
                  value={currentSchedule.department} 
                  onValueChange={(value) => setCurrentSchedule({ ...currentSchedule, department: value })}
                >
                  <SelectTrigger id="edit-department">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-shift">Shift</Label>
                <Select 
                  value={currentSchedule.shift} 
                  onValueChange={(value) => setCurrentSchedule({ ...currentSchedule, shift: value })}
                >
                  <SelectTrigger id="edit-shift">
                    <SelectValue placeholder="Select Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map(shift => (
                      <SelectItem key={shift.id} value={shift.name}>{shift.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-startDate">Start Date</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={currentSchedule.startDate}
                    onChange={(e) => setCurrentSchedule({ ...currentSchedule, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-endDate">End Date</Label>
                  <Input
                    id="edit-endDate"
                    type="date"
                    value={currentSchedule.endDate}
                    onChange={(e) => setCurrentSchedule({ ...currentSchedule, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={currentSchedule.status} 
                  onValueChange={(value) => setCurrentSchedule({ ...currentSchedule, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSchedule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Schedule Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this department schedule? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSchedule}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentSchedulePage;
