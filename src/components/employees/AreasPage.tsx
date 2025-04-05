
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Area } from '@/types/database.types';
import ConnectionStatus from '@/components/supabase/ConnectionStatus';
import { useIsMobile } from '@/hooks/use-mobile';

const AreasPage = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentArea, setCurrentArea] = useState<Area | null>(null);
  const [newArea, setNewArea] = useState({
    name: '',
    coordinates: ''
  });

  // Fetch areas
  const { data: areas = [], isLoading } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching areas:', error);
        toast.error('Failed to load areas: ' + error.message);
        return [];
      }

      return data.map(area => ({
        id: area.id,
        name: area.name,
        coordinates: area.coordinates ? String(area.coordinates) : null,
        created_at: area.created_at,
        updated_at: area.updated_at
      })) as Area[];
    }
  });

  // Filter areas based on search
  const filteredAreas = areas.filter(area => 
    area.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add area mutation
  const addAreaMutation = useMutation({
    mutationFn: async (newAreaData: { name: string; coordinates: string }) => {
      console.log('Adding area:', newAreaData);
      
      const { data, error } = await supabase
        .from('areas')
        .insert([{ 
          name: newAreaData.name,
          coordinates: newAreaData.coordinates || null
        }])
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      setIsAddDialogOpen(false);
      setNewArea({ name: '', coordinates: '' });
      toast.success('Area added successfully');
    },
    onError: (error: any) => {
      console.error('Error adding area:', error);
      toast.error(`Failed to add area: ${error.message || 'Unknown error'}`);
    }
  });

  // Update area mutation
  const updateAreaMutation = useMutation({
    mutationFn: async (updatedArea: Area) => {
      console.log('Updating area:', updatedArea);
      
      const { data, error } = await supabase
        .from('areas')
        .update({ 
          name: updatedArea.name,
          coordinates: updatedArea.coordinates
        })
        .eq('id', updatedArea.id)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      setIsEditDialogOpen(false);
      toast.success('Area updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating area:', error);
      toast.error(`Failed to update area: ${error.message || 'Unknown error'}`);
    }
  });

  // Delete area mutation
  const deleteAreaMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting area:', id);
      
      const { error } = await supabase
        .from('areas')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      setIsDeleteDialogOpen(false);
      toast.success('Area deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting area:', error);
      toast.error(`Failed to delete area: ${error.message || 'Unknown error'}`);
    }
  });

  const handleAdd = () => {
    setNewArea({ name: '', coordinates: '' });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (area: Area) => {
    setCurrentArea(area);
    setNewArea({ 
      name: area.name, 
      coordinates: area.coordinates || '' 
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (area: Area) => {
    setCurrentArea(area);
    setIsDeleteDialogOpen(true);
  };

  const confirmAdd = () => {
    if (!newArea.name.trim()) {
      toast.error('Area name is required');
      return;
    }

    addAreaMutation.mutate(newArea);
  };

  const confirmEdit = () => {
    if (!newArea.name.trim()) {
      toast.error('Area name is required');
      return;
    }

    if (!currentArea) return;

    updateAreaMutation.mutate({
      id: currentArea.id,
      name: newArea.name,
      coordinates: newArea.coordinates || null
    });
  };

  const confirmDelete = () => {
    if (!currentArea) return;
    deleteAreaMutation.mutate(currentArea.id);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Areas Management</h2>
        <ConnectionStatus />
      </div>

      <Card className="shadow-md">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Map className="h-6 w-6" /> Areas
            </CardTitle>
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus size={16} />
              <span className={isMobile ? "sr-only" : ""}>Add Area</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 flex items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search areas..."
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
                  <TableHead>Coordinates</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-primary animate-spin" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading areas...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredAreas.length > 0 ? (
                  filteredAreas.map((area) => (
                    <TableRow key={area.id}>
                      <TableCell className="font-medium">{area.name}</TableCell>
                      <TableCell>{area.coordinates || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(area)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(area)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10">
                      {searchTerm ? 'No areas match your search.' : 'No areas found. Add your first area!'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Area Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Area</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Area Name</Label>
              <Input
                id="name"
                value={newArea.name}
                onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                placeholder="Enter area name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coordinates">Coordinates (Optional)</Label>
              <Input
                id="coordinates"
                value={newArea.coordinates}
                onChange={(e) => setNewArea({ ...newArea, coordinates: e.target.value })}
                placeholder="Enter coordinates"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmAdd}>Add Area</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Area Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Area</DialogTitle>
          </DialogHeader>
          {currentArea && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Area Name</Label>
                <Input
                  id="edit-name"
                  value={newArea.name}
                  onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-coordinates">Coordinates (Optional)</Label>
                <Input
                  id="edit-coordinates"
                  value={newArea.coordinates}
                  onChange={(e) => setNewArea({ ...newArea, coordinates: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Area Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Area</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this area? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AreasPage;
