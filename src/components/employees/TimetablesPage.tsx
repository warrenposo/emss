
import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Search, Clock, Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Timetable } from '@/types/database.types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ConnectionStatus from '@/components/supabase/ConnectionStatus';

const TimetablesPage = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
  const [newTimetable, setNewTimetable] = useState<Partial<Timetable>>({
    name: '',
    start_time: '',
    end_time: '',
    break_start: '',
    break_end: '',
    description: ''
  });

  // Fetch timetables
  const { data: timetables = [], isLoading } = useQuery({
    queryKey: ['timetables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timetables')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching timetables:', error);
        toast.error('Failed to load timetables: ' + error.message);
        return [];
      }
      
      return data as Timetable[];
    }
  });

  // Filter timetables based on search
  const filteredTimetables = timetables.filter(timetable => 
    timetable.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format time for display
  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time;
  };

  // Add timetable mutation
  const addTimetableMutation = useMutation({
    mutationFn: async (newTt: Partial<Timetable>) => {
      console.log('Adding timetable:', newTt);
      
      const { data, error } = await supabase
        .from('timetables')
        .insert([{ 
          name: newTt.name,
          start_time: newTt.start_time,
          end_time: newTt.end_time,
          break_start: newTt.break_start || null,
          break_end: newTt.break_end || null,
          description: newTt.description || null
        }])
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      setIsAddDialogOpen(false);
      setNewTimetable({
        name: '',
        start_time: '',
        end_time: '',
        break_start: '',
        break_end: '',
        description: ''
      });
      toast.success('Timetable added successfully');
    },
    onError: (error: any) => {
      console.error('Error adding timetable:', error);
      toast.error(`Failed to add timetable: ${error.message || 'Unknown error'}`);
    }
  });

  // Update timetable mutation
  const updateTimetableMutation = useMutation({
    mutationFn: async (updatedTt: Timetable) => {
      console.log('Updating timetable:', updatedTt);
      
      const { data, error } = await supabase
        .from('timetables')
        .update({ 
          name: updatedTt.name,
          start_time: updatedTt.start_time,
          end_time: updatedTt.end_time,
          break_start: updatedTt.break_start || null,
          break_end: updatedTt.break_end || null,
          description: updatedTt.description || null
        })
        .eq('id', updatedTt.id)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      setIsEditDialogOpen(false);
      toast.success('Timetable updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating timetable:', error);
      toast.error(`Failed to update timetable: ${error.message || 'Unknown error'}`);
    }
  });

  // Delete timetable mutation
  const deleteTimetableMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting timetable:', id);
      
      const { error } = await supabase
        .from('timetables')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetables'] });
      setIsDeleteDialogOpen(false);
      toast.success('Timetable deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting timetable:', error);
      toast.error(`Failed to delete timetable: ${error.message || 'Unknown error'}`);
    }
  });

  const handleAdd = () => {
    setNewTimetable({
      name: '',
      start_time: '',
      end_time: '',
      break_start: '',
      break_end: '',
      description: ''
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (timetable: Timetable) => {
    setSelectedTimetable(timetable);
    setNewTimetable({
      name: timetable.name,
      start_time: timetable.start_time,
      end_time: timetable.end_time,
      break_start: timetable.break_start || '',
      break_end: timetable.break_end || '',
      description: timetable.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (timetable: Timetable) => {
    setSelectedTimetable(timetable);
    setIsDeleteDialogOpen(true);
  };

  const confirmAdd = () => {
    if (!newTimetable.name || !newTimetable.start_time || !newTimetable.end_time) {
      toast.error('Name, start time, and end time are required');
      return;
    }

    addTimetableMutation.mutate(newTimetable);
  };

  const confirmEdit = () => {
    if (!newTimetable.name || !newTimetable.start_time || !newTimetable.end_time) {
      toast.error('Name, start time, and end time are required');
      return;
    }

    if (!selectedTimetable) return;

    updateTimetableMutation.mutate({
      ...selectedTimetable,
      ...newTimetable,
    } as Timetable);
  };

  const confirmDelete = () => {
    if (!selectedTimetable) return;
    deleteTimetableMutation.mutate(selectedTimetable.id);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Timetables Management</h2>
        <ConnectionStatus />
      </div>

      <Card className="shadow-md">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Clock className="h-6 w-6" /> Timetables
            </CardTitle>
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus size={16} />
              <span className={isMobile ? "sr-only" : ""}>Add Timetable</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 flex items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search timetables..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead className="hidden md:table-cell">Break Start</TableHead>
                  <TableHead className="hidden md:table-cell">Break End</TableHead>
                  <TableHead className="hidden lg:table-cell">Description</TableHead>
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
                      <p className="mt-2 text-sm text-muted-foreground">Loading timetables...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredTimetables.length > 0 ? (
                  filteredTimetables.map((timetable) => (
                    <TableRow key={timetable.id}>
                      <TableCell className="font-medium">{timetable.name}</TableCell>
                      <TableCell>{formatTime(timetable.start_time)}</TableCell>
                      <TableCell>{formatTime(timetable.end_time)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatTime(timetable.break_start)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatTime(timetable.break_end)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{timetable.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(timetable)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(timetable)}
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
                      {searchTerm ? 'No timetables match your search.' : 'No timetables found. Add your first timetable!'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Timetable Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Timetable</DialogTitle>
            <DialogDescription>
              Enter timetable details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newTimetable.name}
                onChange={(e) => setNewTimetable({ ...newTimetable, name: e.target.value })}
                placeholder="Enter timetable name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="time"
                value={newTimetable.start_time}
                onChange={(e) => setNewTimetable({ ...newTimetable, start_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="time"
                value={newTimetable.end_time}
                onChange={(e) => setNewTimetable({ ...newTimetable, end_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="break_start">Break Start</Label>
              <Input
                id="break_start"
                type="time"
                value={newTimetable.break_start}
                onChange={(e) => setNewTimetable({ ...newTimetable, break_start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="break_end">Break End</Label>
              <Input
                id="break_end"
                type="time"
                value={newTimetable.break_end}
                onChange={(e) => setNewTimetable({ ...newTimetable, break_end: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newTimetable.description}
                onChange={(e) => setNewTimetable({ ...newTimetable, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmAdd}>Add Timetable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Timetable Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Timetable</DialogTitle>
            <DialogDescription>
              Update timetable details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={newTimetable.name}
                onChange={(e) => setNewTimetable({ ...newTimetable, name: e.target.value })}
                placeholder="Enter timetable name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-start_time">Start Time *</Label>
              <Input
                id="edit-start_time"
                type="time"
                value={newTimetable.start_time}
                onChange={(e) => setNewTimetable({ ...newTimetable, start_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-end_time">End Time *</Label>
              <Input
                id="edit-end_time"
                type="time"
                value={newTimetable.end_time}
                onChange={(e) => setNewTimetable({ ...newTimetable, end_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-break_start">Break Start</Label>
              <Input
                id="edit-break_start"
                type="time"
                value={newTimetable.break_start}
                onChange={(e) => setNewTimetable({ ...newTimetable, break_start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-break_end">Break End</Label>
              <Input
                id="edit-break_end"
                type="time"
                value={newTimetable.break_end}
                onChange={(e) => setNewTimetable({ ...newTimetable, break_end: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={newTimetable.description}
                onChange={(e) => setNewTimetable({ ...newTimetable, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmEdit}>Update Timetable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Timetable Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Timetable</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this timetable? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedTimetable && (
            <p className="py-4 text-sm text-gray-500">
              You are about to delete timetable: <span className="font-medium text-gray-900">{selectedTimetable.name}</span>
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Timetable</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimetablesPage;
