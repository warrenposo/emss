
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ConnectionStatus from '@/components/supabase/ConnectionStatus';
import { useIsMobile } from '@/hooks/use-mobile';
import { Employee, Leave } from '@/types/database.types';

const LeavesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newLeave, setNewLeave] = useState<Partial<Leave>>({
    employee_id: '',
    leave_type: 'Annual',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    remark: ''
  });

  // Fetch employees for the dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('id, first_name, last_name, badge_number, email, hire_date')
          .order('last_name');
          
        if (error) throw error;
        setEmployees(data as Employee[]);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees');
      }
    };
    
    fetchEmployees();
  }, []);

  // Fetch leaves
  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ['leaves'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leaves')
        .select(`
          *,
          employee:employees(id, first_name, last_name, badge_number, email, hire_date)
        `)
        .order('start_date', { ascending: false });
        
      if (error) {
        console.error('Error fetching leaves:', error);
        toast.error('Failed to load leaves: ' + error.message);
        return [];
      }
      
      return data as Leave[];
    }
  });

  // Add leave mutation
  const addLeaveMutation = useMutation({
    mutationFn: async (newLeaveData: Partial<Leave>) => {
      console.log('Adding leave:', newLeaveData);
      
      const { data, error } = await supabase
        .from('leaves')
        .insert([{
          employee_id: newLeaveData.employee_id,
          leave_type: newLeaveData.leave_type,
          start_date: newLeaveData.start_date,
          end_date: newLeaveData.end_date,
          status: newLeaveData.status,
          remark: newLeaveData.remark
        }])
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      setIsAddDialogOpen(false);
      setNewLeave({
        employee_id: '',
        leave_type: 'Annual',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        remark: ''
      });
      toast.success("Leave added successfully");
    },
    onError: (error: any) => {
      console.error('Error adding leave:', error);
      toast.error(`Failed to add leave: ${error.message || 'Unknown error'}`);
    }
  });

  // Update leave mutation
  const updateLeaveMutation = useMutation({
    mutationFn: async (updatedLeave: Leave) => {
      console.log('Updating leave:', updatedLeave);
      
      const { data, error } = await supabase
        .from('leaves')
        .update({
          employee_id: updatedLeave.employee_id,
          leave_type: updatedLeave.leave_type,
          start_date: updatedLeave.start_date,
          end_date: updatedLeave.end_date,
          status: updatedLeave.status,
          remark: updatedLeave.remark
        })
        .eq('id', updatedLeave.id)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      setIsEditDialogOpen(false);
      toast.success("Leave updated successfully");
    },
    onError: (error: any) => {
      console.error('Error updating leave:', error);
      toast.error(`Failed to update leave: ${error.message || 'Unknown error'}`);
    }
  });

  // Delete leave mutation
  const deleteLeaveMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting leave:', id);
      
      const { error } = await supabase
        .from('leaves')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      setIsDeleteDialogOpen(false);
      toast.success("Leave deleted successfully");
    },
    onError: (error: any) => {
      console.error('Error deleting leave:', error);
      toast.error(`Failed to delete leave: ${error.message || 'Unknown error'}`);
    }
  });

  // Filter leaves based on search input
  const filteredLeaves = leaves.filter(leave => {
    const employeeName = leave.employee ? 
      `${leave.employee.first_name} ${leave.employee.last_name}`.toLowerCase() : '';
    return employeeName.includes(searchValue.toLowerCase()) ||
      leave.leave_type.toLowerCase().includes(searchValue.toLowerCase()) ||
      leave.status?.toLowerCase().includes(searchValue.toLowerCase());
  });

  const handleAdd = () => {
    setNewLeave({
      employee_id: '',
      leave_type: 'Annual',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      remark: ''
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (leave: Leave) => {
    setSelectedLeave(leave);
    setNewLeave({ ...leave });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (leave: Leave) => {
    setSelectedLeave(leave);
    setIsDeleteDialogOpen(true);
  };

  const confirmAdd = () => {
    if (!newLeave.employee_id || !newLeave.start_date || !newLeave.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(newLeave.end_date!) < new Date(newLeave.start_date!)) {
      toast.error("End date cannot be earlier than start date");
      return;
    }

    addLeaveMutation.mutate(newLeave);
  };

  const confirmEdit = () => {
    if (!newLeave.employee_id || !newLeave.start_date || !newLeave.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(newLeave.end_date!) < new Date(newLeave.start_date!)) {
      toast.error("End date cannot be earlier than start date");
      return;
    }

    if (!selectedLeave?.id) return;

    updateLeaveMutation.mutate({
      ...selectedLeave,
      ...newLeave
    } as Leave);
  };

  const confirmDelete = () => {
    if (!selectedLeave?.id) return;
    deleteLeaveMutation.mutate(selectedLeave.id);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Leave Management</h2>
        <ConnectionStatus />
      </div>
      
      <Card className="shadow-md">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="h-6 w-6" /> Employee Leaves
            </CardTitle>
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus size={16} />
              <span className={isMobile ? "sr-only" : ""}>Add Leave</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search leaves..."
                className="pl-10"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remark</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-primary animate-spin" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading leaves...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        {leave.employee ? 
                          `${leave.employee.first_name} ${leave.employee.last_name}` : 
                          'Unknown Employee'}
                      </TableCell>
                      <TableCell>{leave.leave_type}</TableCell>
                      <TableCell>{new Date(leave.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(leave.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {leave.remark || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(leave)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(leave)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      {searchValue ? 'No leaves match your search.' : 'No leaves found. Add your first leave!'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Leave Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Leave</DialogTitle>
            <DialogDescription>
              Enter the details for the new leave record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee</Label>
              <Select
                value={newLeave.employee_id}
                onValueChange={(value) => setNewLeave({ ...newLeave, employee_id: value })}
              >
                <SelectTrigger id="employee_id">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} ({employee.badge_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave_type">Leave Type</Label>
              <Select
                value={newLeave.leave_type}
                onValueChange={(value) => setNewLeave({ ...newLeave, leave_type: value })}
              >
                <SelectTrigger id="leave_type">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual">Annual Leave</SelectItem>
                  <SelectItem value="Sick">Sick Leave</SelectItem>
                  <SelectItem value="Maternity">Maternity Leave</SelectItem>
                  <SelectItem value="Paternity">Paternity Leave</SelectItem>
                  <SelectItem value="Compassionate">Compassionate Leave</SelectItem>
                  <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={newLeave.start_date}
                onChange={(e) => setNewLeave({ ...newLeave, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={newLeave.end_date}
                onChange={(e) => setNewLeave({ ...newLeave, end_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newLeave.status || 'Pending'}
                onValueChange={(value) => setNewLeave({ ...newLeave, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="remark">Remark</Label>
              <Input
                id="remark"
                value={newLeave.remark || ''}
                onChange={(e) => setNewLeave({ ...newLeave, remark: e.target.value })}
                placeholder="Enter any remarks"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmAdd}>Add Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Leave Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Leave</DialogTitle>
            <DialogDescription>
              Update the leave record details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_employee_id">Employee</Label>
              <Select
                value={newLeave.employee_id}
                onValueChange={(value) => setNewLeave({ ...newLeave, employee_id: value })}
              >
                <SelectTrigger id="edit_employee_id">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} ({employee.badge_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_leave_type">Leave Type</Label>
              <Select
                value={newLeave.leave_type}
                onValueChange={(value) => setNewLeave({ ...newLeave, leave_type: value })}
              >
                <SelectTrigger id="edit_leave_type">
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual">Annual Leave</SelectItem>
                  <SelectItem value="Sick">Sick Leave</SelectItem>
                  <SelectItem value="Maternity">Maternity Leave</SelectItem>
                  <SelectItem value="Paternity">Paternity Leave</SelectItem>
                  <SelectItem value="Compassionate">Compassionate Leave</SelectItem>
                  <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_start_date">Start Date</Label>
              <Input
                id="edit_start_date"
                type="date"
                value={newLeave.start_date}
                onChange={(e) => setNewLeave({ ...newLeave, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_end_date">End Date</Label>
              <Input
                id="edit_end_date"
                type="date"
                value={newLeave.end_date}
                onChange={(e) => setNewLeave({ ...newLeave, end_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={newLeave.status || 'Pending'}
                onValueChange={(value) => setNewLeave({ ...newLeave, status: value })}
              >
                <SelectTrigger id="edit_status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_remark">Remark</Label>
              <Input
                id="edit_remark"
                value={newLeave.remark || ''}
                onChange={(e) => setNewLeave({ ...newLeave, remark: e.target.value })}
                placeholder="Enter any remarks"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Leave Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Leave</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this leave record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-gray-500">
            {selectedLeave && selectedLeave.employee && (
              <p>
                You are about to delete a leave record for <span className="font-medium text-gray-900">
                  {selectedLeave.employee.first_name} {selectedLeave.employee.last_name}
                </span> from <span className="font-medium text-gray-900">
                  {new Date(selectedLeave.start_date).toLocaleDateString()}
                </span> to <span className="font-medium text-gray-900">
                  {new Date(selectedLeave.end_date).toLocaleDateString()}
                </span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeavesPage;
