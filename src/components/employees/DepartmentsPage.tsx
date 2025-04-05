
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ConnectionStatus from '@/components/supabase/ConnectionStatus';
import { useIsMobile } from '@/hooks/use-mobile';
import { Department } from '@/types/database.types';

const DepartmentsPage = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '' });

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("You must be logged in to view and manage departments");
        // You could redirect to login here if needed
      }
    };
    
    checkAuthStatus();
  }, []);

  // Fetch departments
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching departments:', error);
        toast.error('Failed to load departments: ' + error.message);
        return [];
      }
      
      return data as Department[];
    }
  });

  // Add department mutation
  const addDepartmentMutation = useMutation({
    mutationFn: async (newDept: { name: string; description: string }) => {
      console.log('Adding department:', newDept);
      
      const { data, error } = await supabase
        .from('departments')
        .insert([{ name: newDept.name, description: newDept.description || null }])
        .select();
        
      if (error) {
        console.error('Error in mutation:', error);
        throw error;
      }
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setIsAddDialogOpen(false);
      setNewDepartment({ name: '', description: '' });
      toast.success("Department added successfully");
    },
    onError: (error: any) => {
      console.error('Error adding department:', error);
      toast.error(`Failed to add department: ${error.message || 'Unknown error'}`);
    }
  });

  // Update department mutation
  const updateDepartmentMutation = useMutation({
    mutationFn: async (updatedDept: Department) => {
      console.log('Updating department:', updatedDept);
      
      const { data, error } = await supabase
        .from('departments')
        .update({ name: updatedDept.name, description: updatedDept.description || null })
        .eq('id', updatedDept.id)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setIsEditDialogOpen(false);
      toast.success("Department updated successfully");
    },
    onError: (error: any) => {
      console.error('Error updating department:', error);
      toast.error(`Failed to update department: ${error.message || 'Unknown error'}`);
    }
  });

  // Delete department mutation
  const deleteDepartmentMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting department:', id);
      
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setIsDeleteDialogOpen(false);
      toast.success("Department deleted successfully");
    },
    onError: (error: any) => {
      console.error('Error deleting department:', error);
      toast.error(`Failed to delete department: ${error.message || 'Unknown error'}`);
    }
  });

  // Filter departments based on search input
  const filteredDepartments = departments.filter(department => 
    department.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleAdd = () => {
    setNewDepartment({ name: '', description: '' });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setNewDepartment({ name: department.name, description: department.description || '' });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const confirmAdd = () => {
    if (!newDepartment.name.trim()) {
      toast.error("Department name is required");
      return;
    }

    addDepartmentMutation.mutate(newDepartment);
  };

  const confirmEdit = () => {
    if (!newDepartment.name.trim()) {
      toast.error("Department name is required");
      return;
    }

    if (!selectedDepartment) return;

    updateDepartmentMutation.mutate({
      id: selectedDepartment.id,
      name: newDepartment.name,
      description: newDepartment.description
    });
  };

  const confirmDelete = () => {
    if (!selectedDepartment) return;
    deleteDepartmentMutation.mutate(selectedDepartment.id);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Department Management</h2>
        <ConnectionStatus />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 md:p-5">
          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button variant="outline" className="flex items-center gap-1" onClick={handleAdd}>
              <Plus size={16} />
              <span className={isMobile ? "sr-only" : ""}>Add</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={() => selectedDepartment && handleEdit(selectedDepartment)}
              disabled={!selectedDepartment}
            >
              <Edit size={16} />
              <span className={isMobile ? "sr-only" : ""}>Update</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1" 
              onClick={() => selectedDepartment && handleDelete(selectedDepartment)}
              disabled={!selectedDepartment}
            >
              <Trash2 size={16} />
              <span className={isMobile ? "sr-only" : ""}>Delete</span>
            </Button>
          </div>
          
          {/* Search filter */}
          <div className="flex flex-col md:flex-row gap-2 mb-6">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search departments..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="form-input"
              />
            </div>
            <Button className="flex items-center gap-1 flex-shrink-0">
              <Search size={16} />
              <span>Search</span>
            </Button>
          </div>
          
          {/* Departments table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Department Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-primary animate-spin" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading departments...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredDepartments.length > 0 ? (
                  filteredDepartments.map((department) => (
                    <TableRow 
                      key={department.id} 
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedDepartment?.id === department.id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setSelectedDepartment(department)}
                    >
                      <TableCell className="font-medium">{department.id.substring(0, 8)}</TableCell>
                      <TableCell>{department.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{department.description}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                      No departments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add Department Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
            <DialogDescription>
              Enter the details for the new department.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name</Label>
              <Input 
                id="name" 
                value={newDepartment.name} 
                onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                placeholder="Enter department name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={newDepartment.description} 
                onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                placeholder="Enter department description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmAdd}>Add Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update the department details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Department Name</Label>
              <Input 
                id="edit-name" 
                value={newDepartment.name} 
                onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                placeholder="Enter department name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input 
                id="edit-description" 
                value={newDepartment.description} 
                onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                placeholder="Enter department description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmEdit}>Update Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Department Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this department? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {selectedDepartment && (
              <p className="text-sm text-gray-500">
                You are about to delete department: <span className="font-medium text-gray-900">{selectedDepartment.name}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentsPage;
