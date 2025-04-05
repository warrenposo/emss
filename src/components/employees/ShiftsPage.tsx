
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Clock } from 'lucide-react';
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
import { ShiftWithRelations, Department, Timetable } from '@/types/database.types';

const ShiftsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ShiftWithRelations | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [newShift, setNewShift] = useState<Partial<ShiftWithRelations>>({
    name: '',
    timetable_id: null,
    department_id: null,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    color: '#6E59A5'
  });

  // Fetch departments and timetables for dropdowns
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch departments
        const { data: deptData, error: deptError } = await supabase
          .from('departments')
          .select('*')
          .order('name');
          
        if (deptError) throw deptError;
        setDepartments(deptData as Department[]);
        
        // Fetch timetables
        const { data: ttData, error: ttError } = await supabase
          .from('timetables')
          .select('*')
          .order('name');
          
        if (ttError) throw ttError;
        setTimetables(ttData as Timetable[]);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        toast.error('Failed to load required data');
      }
    };
    
    fetchDropdownData();
  }, []);

  // Fetch shifts with relations
  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          department:departments(*),
          timetable:timetables(*)
        `)
        .order('start_date');
        
      if (error) {
        console.error('Error fetching shifts:', error);
        toast.error('Failed to load shifts: ' + error.message);
        return [];
      }
      
      return data as ShiftWithRelations[];
    }
  });

  // Add shift mutation
  const addShiftMutation = useMutation({
    mutationFn: async (newShiftData: Partial<ShiftWithRelations>) => {
      console.log('Adding shift:', newShiftData);
      
      const { data, error } = await supabase
        .from('shifts')
        .insert([{
          name: newShiftData.name,
          timetable_id: newShiftData.timetable_id,
          department_id: newShiftData.department_id,
          start_date: newShiftData.start_date,
          end_date: newShiftData.end_date,
          color: newShiftData.color
        }])
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      setIsAddDialogOpen(false);
      setNewShift({
        name: '',
        timetable_id: null,
        department_id: null,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        color: '#6E59A5'
      });
      toast.success("Shift added successfully");
    },
    onError: (error: any) => {
      console.error('Error adding shift:', error);
      toast.error(`Failed to add shift: ${error.message || 'Unknown error'}`);
    }
  });

  // Update shift mutation
  const updateShiftMutation = useMutation({
    mutationFn: async (updatedShift: ShiftWithRelations) => {
      console.log('Updating shift:', updatedShift);
      
      const { data, error } = await supabase
        .from('shifts')
        .update({
          name: updatedShift.name,
          timetable_id: updatedShift.timetable_id,
          department_id: updatedShift.department_id,
          start_date: updatedShift.start_date,
          end_date: updatedShift.end_date,
          color: updatedShift.color
        })
        .eq('id', updatedShift.id)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      setIsEditDialogOpen(false);
      toast.success("Shift updated successfully");
    },
    onError: (error: any) => {
      console.error('Error updating shift:', error);
      toast.error(`Failed to update shift: ${error.message || 'Unknown error'}`);
    }
  });

  // Delete shift mutation
  const deleteShiftMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting shift:', id);
      
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      setIsDeleteDialogOpen(false);
      toast.success("Shift deleted successfully");
    },
    onError: (error: any) => {
      console.error('Error deleting shift:', error);
      toast.error(`Failed to delete shift: ${error.message || 'Unknown error'}`);
    }
  });

  // Filter shifts based on search input
  const filteredShifts = shifts.filter(shift =>
    shift.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    (shift.department?.name || '').toLowerCase().includes(searchValue.toLowerCase()) ||
    (shift.timetable?.name || '').toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleAdd = () => {
    setNewShift({
      name: '',
      timetable_id: null,
      department_id: null,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      color: '#6E59A5'
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (shift: ShiftWithRelations) => {
    setSelectedShift(shift);
    setNewShift({
      name: shift.name,
      timetable_id: shift.timetable_id,
      department_id: shift.department_id,
      start_date: shift.start_date,
      end_date: shift.end_date,
      color: shift.color || '#6E59A5'
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (shift: ShiftWithRelations) => {
    setSelectedShift(shift);
    setIsDeleteDialogOpen(true);
  };

  const confirmAdd = () => {
    if (!newShift.name || !newShift.start_date || !newShift.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(newShift.end_date!) < new Date(newShift.start_date!)) {
      toast.error("End date cannot be earlier than start date");
      return;
    }

    addShiftMutation.mutate(newShift);
  };

  const confirmEdit = () => {
    if (!newShift.name || !newShift.start_date || !newShift.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(newShift.end_date!) < new Date(newShift.start_date!)) {
      toast.error("End date cannot be earlier than start date");
      return;
    }

    if (!selectedShift?.id) return;

    updateShiftMutation.mutate({
      ...selectedShift,
      ...newShift,
      id: selectedShift.id
    } as ShiftWithRelations);
  };

  const confirmDelete = () => {
    if (!selectedShift?.id) return;
    deleteShiftMutation.mutate(selectedShift.id);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Shift Management</h2>
        <ConnectionStatus />
      </div>
      
      <Card className="shadow-md">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Clock className="h-6 w-6" /> Shifts
            </CardTitle>
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus size={16} />
              <span className={isMobile ? "sr-only" : ""}>Add Shift</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 flex items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search shifts..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Timetable</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Color</TableHead>
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
                      <p className="mt-2 text-sm text-muted-foreground">Loading shifts...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredShifts.length > 0 ? (
                  filteredShifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell>{shift.name}</TableCell>
                      <TableCell>{shift.timetable?.name || 'Not assigned'}</TableCell>
                      <TableCell>{shift.department?.name || 'Not assigned'}</TableCell>
                      <TableCell>{new Date(shift.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(shift.end_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: shift.color || '#6E59A5' }}
                          />
                          <span>{shift.color || '#6E59A5'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(shift)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(shift)}
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
                      {searchValue ? 'No shifts match your search.' : 'No shifts found. Add your first shift!'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Shift Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Shift</DialogTitle>
            <DialogDescription>
              Enter the details for the new shift.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Shift Name</Label>
              <Input
                id="name"
                value={newShift.name || ''}
                onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                placeholder="Enter shift name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timetable_id">Timetable</Label>
              <Select
                value={newShift.timetable_id || ''}
                onValueChange={(value) => setNewShift({ ...newShift, timetable_id: value || null })}
              >
                <SelectTrigger id="timetable_id">
                  <SelectValue placeholder="Select timetable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {timetables.map((timetable) => (
                    <SelectItem key={timetable.id} value={timetable.id}>
                      {timetable.name} ({timetable.start_time} - {timetable.end_time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department_id">Department</Label>
              <Select
                value={newShift.department_id || ''}
                onValueChange={(value) => setNewShift({ ...newShift, department_id: value || null })}
              >
                <SelectTrigger id="department_id">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={newShift.start_date}
                onChange={(e) => setNewShift({ ...newShift, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={newShift.end_date}
                onChange={(e) => setNewShift({ ...newShift, end_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="color"
                  type="color"
                  className="w-12 h-10 p-1"
                  value={newShift.color || '#6E59A5'}
                  onChange={(e) => setNewShift({ ...newShift, color: e.target.value })}
                />
                <Input
                  value={newShift.color || '#6E59A5'}
                  onChange={(e) => setNewShift({ ...newShift, color: e.target.value })}
                  placeholder="#6E59A5"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmAdd}>Add Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Shift Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
            <DialogDescription>
              Update the shift details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_name">Shift Name</Label>
              <Input
                id="edit_name"
                value={newShift.name || ''}
                onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                placeholder="Enter shift name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_timetable_id">Timetable</Label>
              <Select
                value={newShift.timetable_id || ''}
                onValueChange={(value) => setNewShift({ ...newShift, timetable_id: value || null })}
              >
                <SelectTrigger id="edit_timetable_id">
                  <SelectValue placeholder="Select timetable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {timetables.map((timetable) => (
                    <SelectItem key={timetable.id} value={timetable.id}>
                      {timetable.name} ({timetable.start_time} - {timetable.end_time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_department_id">Department</Label>
              <Select
                value={newShift.department_id || ''}
                onValueChange={(value) => setNewShift({ ...newShift, department_id: value || null })}
              >
                <SelectTrigger id="edit_department_id">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_start_date">Start Date</Label>
              <Input
                id="edit_start_date"
                type="date"
                value={newShift.start_date}
                onChange={(e) => setNewShift({ ...newShift, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_end_date">End Date</Label>
              <Input
                id="edit_end_date"
                type="date"
                value={newShift.end_date}
                onChange={(e) => setNewShift({ ...newShift, end_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_color">Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="edit_color"
                  type="color"
                  className="w-12 h-10 p-1"
                  value={newShift.color || '#6E59A5'}
                  onChange={(e) => setNewShift({ ...newShift, color: e.target.value })}
                />
                <Input
                  value={newShift.color || '#6E59A5'}
                  onChange={(e) => setNewShift({ ...newShift, color: e.target.value })}
                  placeholder="#6E59A5"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Shift Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Shift</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this shift? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-gray-500">
            {selectedShift && (
              <p>
                You are about to delete shift: <span className="font-medium text-gray-900">
                  {selectedShift.name}
                </span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiftsPage;
