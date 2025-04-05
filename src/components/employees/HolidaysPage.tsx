
import React, { useState } from 'react';
import { 
  Plus, Pencil, Trash2, Search, CalendarDays
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { Holiday } from '@/types/database.types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ConnectionStatus from '@/components/supabase/ConnectionStatus';

const HolidaysPage = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [newHoliday, setNewHoliday] = useState<Partial<Holiday>>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Fetch holidays
  const { data: holidays = [], isLoading } = useQuery({
    queryKey: ['holidays'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .order('date');
        
      if (error) {
        console.error('Error fetching holidays:', error);
        toast.error('Failed to load holidays: ' + error.message);
        return [];
      }
      
      return data as Holiday[];
    }
  });

  // Filter holidays based on search
  const filteredHolidays = holidays.filter(holiday => 
    holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (holiday.description && holiday.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  // Add holiday mutation
  const addHolidayMutation = useMutation({
    mutationFn: async (newHol: Partial<Holiday>) => {
      console.log('Adding holiday:', newHol);
      
      const { data, error } = await supabase
        .from('holidays')
        .insert([{ 
          name: newHol.name,
          date: newHol.date,
          description: newHol.description || null
        }])
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      setIsAddDialogOpen(false);
      setNewHoliday({
        name: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      toast.success('Holiday added successfully');
    },
    onError: (error: any) => {
      console.error('Error adding holiday:', error);
      toast.error(`Failed to add holiday: ${error.message || 'Unknown error'}`);
    }
  });

  // Update holiday mutation
  const updateHolidayMutation = useMutation({
    mutationFn: async (updatedHol: Holiday) => {
      console.log('Updating holiday:', updatedHol);
      
      const { data, error } = await supabase
        .from('holidays')
        .update({ 
          name: updatedHol.name,
          date: updatedHol.date,
          description: updatedHol.description || null
        })
        .eq('id', updatedHol.id)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      setIsEditDialogOpen(false);
      toast.success('Holiday updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating holiday:', error);
      toast.error(`Failed to update holiday: ${error.message || 'Unknown error'}`);
    }
  });

  // Delete holiday mutation
  const deleteHolidayMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting holiday:', id);
      
      const { error } = await supabase
        .from('holidays')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      setIsDeleteDialogOpen(false);
      toast.success('Holiday deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting holiday:', error);
      toast.error(`Failed to delete holiday: ${error.message || 'Unknown error'}`);
    }
  });

  const handleAdd = () => {
    setNewHoliday({
      name: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setNewHoliday({
      name: holiday.name,
      date: holiday.date,
      description: holiday.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsDeleteDialogOpen(true);
  };

  const confirmAdd = () => {
    if (!newHoliday.name || !newHoliday.date) {
      toast.error('Name and date are required');
      return;
    }

    addHolidayMutation.mutate(newHoliday);
  };

  const confirmEdit = () => {
    if (!newHoliday.name || !newHoliday.date) {
      toast.error('Name and date are required');
      return;
    }

    if (!selectedHoliday) return;

    updateHolidayMutation.mutate({
      ...selectedHoliday,
      ...newHoliday,
    } as Holiday);
  };

  const confirmDelete = () => {
    if (!selectedHoliday) return;
    deleteHolidayMutation.mutate(selectedHoliday.id);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Holidays Management</h2>
        <ConnectionStatus />
      </div>

      <Card className="shadow-md">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <CalendarDays className="h-6 w-6" /> Holidays
            </CardTitle>
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus size={16} />
              <span className={isMobile ? "sr-only" : ""}>Add Holiday</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 flex items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search holidays..."
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
                  <TableHead>Date</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-primary animate-spin" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading holidays...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredHolidays.length > 0 ? (
                  filteredHolidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium">{holiday.name}</TableCell>
                      <TableCell>{formatDate(holiday.date)}</TableCell>
                      <TableCell className="hidden md:table-cell">{holiday.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(holiday)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(holiday)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      {searchTerm ? 'No holidays match your search.' : 'No holidays found. Add your first holiday!'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Holiday Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Holiday</DialogTitle>
            <DialogDescription>
              Enter holiday details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                placeholder="Enter holiday name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newHoliday.description}
                onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmAdd}>Add Holiday</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Holiday Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Holiday</DialogTitle>
            <DialogDescription>
              Update holiday details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                placeholder="Enter holiday name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date *</Label>
              <Input
                id="edit-date"
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={newHoliday.description}
                onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmEdit}>Update Holiday</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Holiday Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Holiday</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this holiday? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedHoliday && (
            <p className="py-4 text-sm text-gray-500">
              You are about to delete holiday: <span className="font-medium text-gray-900">{selectedHoliday.name}</span>
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Holiday</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HolidaysPage;
