
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, Calendar } from 'lucide-react';
import { toast } from 'sonner';

// Mock data
const initialTemporarySchedules = [
  { id: 1, employeeId: "EMP001", employeeName: "John Doe", department: "IT", startDate: "2023-04-01", endDate: "2023-04-15", reason: "Project Deadline", status: "Approved" },
  { id: 2, employeeId: "EMP002", employeeName: "Jane Smith", department: "Marketing", startDate: "2023-04-10", endDate: "2023-04-20", reason: "Campaign Launch", status: "Pending" },
  { id: 3, employeeId: "EMP003", employeeName: "Michael Johnson", department: "Finance", startDate: "2023-04-05", endDate: "2023-04-12", reason: "Monthly Closing", status: "Approved" },
  { id: 4, employeeId: "EMP004", employeeName: "Sarah Williams", department: "HR", startDate: "2023-04-15", endDate: "2023-04-25", reason: "Recruitment Drive", status: "Approved" },
  { id: 5, employeeId: "EMP005", employeeName: "David Brown", department: "Operations", startDate: "2023-04-03", endDate: "2023-04-10", reason: "Inventory Check", status: "Rejected" },
];

const TemporarySchedulesPage = () => {
  const [tempSchedules, setTempSchedules] = useState(initialTemporarySchedules);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<any>(null);
  const [newSchedule, setNewSchedule] = useState({
    employeeId: '',
    employeeName: '',
    department: '',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'Pending'
  });

  const filteredSchedules = tempSchedules.filter(schedule => 
    schedule.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSchedule = () => {
    const schedule = {
      id: tempSchedules.length + 1,
      ...newSchedule
    };
    setTempSchedules([...tempSchedules, schedule]);
    setNewSchedule({ employeeId: '', employeeName: '', department: '', startDate: '', endDate: '', reason: '', status: 'Pending' });
    setIsAddDialogOpen(false);
    toast.success('Temporary schedule added successfully');
  };

  const handleEditSchedule = () => {
    setTempSchedules(tempSchedules.map(s => 
      s.id === currentSchedule.id ? { ...currentSchedule } : s
    ));
    setIsEditDialogOpen(false);
    toast.success('Temporary schedule updated successfully');
  };

  const handleDeleteSchedule = () => {
    setTempSchedules(tempSchedules.filter(s => s.id !== currentSchedule.id));
    setIsDeleteDialogOpen(false);
    toast.success('Temporary schedule deleted successfully');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Temporary Schedules</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Add Schedule
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search schedules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Employee Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules.length > 0 ? (
              filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>{schedule.employeeId}</TableCell>
                  <TableCell className="font-medium">{schedule.employeeName}</TableCell>
                  <TableCell>{schedule.department}</TableCell>
                  <TableCell>{schedule.startDate}</TableCell>
                  <TableCell>{schedule.endDate}</TableCell>
                  <TableCell>{schedule.reason}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      schedule.status === 'Approved' 
                        ? 'bg-green-100 text-green-800' 
                        : schedule.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
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
                <TableCell colSpan={8} className="text-center">No temporary schedules found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Schedule Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Temporary Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                value={newSchedule.employeeId}
                onChange={(e) => setNewSchedule({ ...newSchedule, employeeId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeName">Employee Name</Label>
              <Input
                id="employeeName"
                value={newSchedule.employeeName}
                onChange={(e) => setNewSchedule({ ...newSchedule, employeeName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={newSchedule.department}
                onChange={(e) => setNewSchedule({ ...newSchedule, department: e.target.value })}
              />
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
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={newSchedule.reason}
                onChange={(e) => setNewSchedule({ ...newSchedule, reason: e.target.value })}
              />
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
            <DialogTitle>Edit Temporary Schedule</DialogTitle>
          </DialogHeader>
          {currentSchedule && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-employeeId">Employee ID</Label>
                <Input
                  id="edit-employeeId"
                  value={currentSchedule.employeeId}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, employeeId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-employeeName">Employee Name</Label>
                <Input
                  id="edit-employeeName"
                  value={currentSchedule.employeeName}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, employeeName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={currentSchedule.department}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, department: e.target.value })}
                />
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
                <Label htmlFor="edit-reason">Reason</Label>
                <Input
                  id="edit-reason"
                  value={currentSchedule.reason}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, reason: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={currentSchedule.status}
                  onChange={(e) => setCurrentSchedule({ ...currentSchedule, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
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
            <DialogTitle>Delete Temporary Schedule</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this temporary schedule? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSchedule}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemporarySchedulesPage;
