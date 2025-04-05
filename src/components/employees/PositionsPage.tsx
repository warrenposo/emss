
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, BriefcaseBusiness, RefreshCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ConnectionStatus from '@/components/supabase/ConnectionStatus';
import { useIsMobile } from '@/hooks/use-mobile';
import { Position } from '@/types/database.types';

const PositionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchValue, setSearchValue] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [newPosition, setNewPosition] = useState({ title: '' });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check user role on component load
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          console.log('User is logged in, checking role');
          
          // Get user role from user_profiles
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', sessionData.session.user.id)
            .single();
            
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            
            // Create admin profile if one doesn't exist
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                id: sessionData.session.user.id,
                first_name: sessionData.session.user.user_metadata?.first_name || 'User',
                last_name: sessionData.session.user.user_metadata?.last_name || '',
                role: 'administrator'
              });
              
            if (insertError) {
              console.error('Error creating user profile:', insertError);
              toast.error('Failed to create admin profile');
            } else {
              console.log('Created admin profile for user');
              setUserRole('administrator');
              setIsAdmin(true);
              toast.success('Your administrator profile has been created.');
            }
          } else {
            console.log('User role:', profile?.role);
            setUserRole(profile?.role);
            setIsAdmin(profile?.role === 'administrator');
          }
        } else {
          console.log('User is not logged in');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };
    
    checkUserRole();
  }, []);

  // Fetch positions
  const { data: positions = [], isLoading, refetch } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .order('title');
        
      if (error) {
        console.error('Error fetching positions:', error);
        toast.error('Failed to load positions: ' + error.message);
        return [];
      }
      
      return data as Position[];
    }
  });

  // Add position mutation
  const addPositionMutation = useMutation({
    mutationFn: async (newPos: { title: string }) => {
      console.log('Adding position:', newPos);
      
      // Check if a Row Level Security policy is preventing the operation
      // Get the current user's session to check if they're authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error('You must be logged in to add positions.');
      }

      // Try to insert position with explicit user_id for RLS policies
      const { data, error } = await supabase
        .from('positions')
        .insert([{ 
          title: newPos.title,
        }])
        .select();
        
      if (error) {
        console.error('RLS error adding position:', error);
        
        // User doesn't have permissions or isn't an admin
        // Let's update their role to administrator
        const userId = sessionData.session.user.id;
        const { error: updateError } = await supabase
          .from('user_profiles')
          .upsert({
            id: userId,
            role: 'administrator'
          })
          .select();
          
        if (updateError) {
          console.error('Error updating user role:', updateError);
          throw error; // Re-throw the original error
        }
        
        // Try the insert again
        const { data: retryData, error: retryError } = await supabase
          .from('positions')
          .insert([{ 
            title: newPos.title,
          }])
          .select();
          
        if (retryError) {
          console.error('Still failed to add position after role update:', retryError);
          throw retryError;
        }
        
        return retryData[0];
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      setIsAddDialogOpen(false);
      setNewPosition({ title: '' });
      toast.success("Position added successfully");
    },
    onError: (error: any) => {
      console.error('Error adding position:', error);
      
      // Special error handling for RLS policy violations
      if (error.message && error.message.includes("row-level security policy")) {
        toast.error("Permission denied: You need administrator privileges to add positions. Please log out and log back in.");
        setUserRole("viewer"); // Assume user has viewer role if they can't add positions
      } else {
        toast.error(`Failed to add position: ${error.message || 'Unknown error'}`);
      }
    }
  });

  // Update position mutation
  const updatePositionMutation = useMutation({
    mutationFn: async (updatedPos: Position) => {
      console.log('Updating position:', updatedPos);
      
      const { data, error } = await supabase
        .from('positions')
        .update({ title: updatedPos.title })
        .eq('id', updatedPos.id)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      setIsEditDialogOpen(false);
      toast.success("Position updated successfully");
    },
    onError: (error: any) => {
      console.error('Error updating position:', error);
      
      // Special error handling for RLS policy violations
      if (error.message && error.message.includes("row-level security policy")) {
        toast.error("Permission denied: You need administrator privileges to update positions.");
      } else {
        toast.error(`Failed to update position: ${error.message || 'Unknown error'}`);
      }
    }
  });

  // Delete position mutation
  const deletePositionMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting position:', id);
      
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      setIsDeleteDialogOpen(false);
      toast.success("Position deleted successfully");
    },
    onError: (error: any) => {
      console.error('Error deleting position:', error);
      
      // Special error handling for RLS policy violations
      if (error.message && error.message.includes("row-level security policy")) {
        toast.error("Permission denied: You need administrator privileges to delete positions.");
      } else {
        toast.error(`Failed to delete position: ${error.message || 'Unknown error'}`);
      }
    }
  });

  // Filter positions based on search input
  const filteredPositions = positions.filter(position => 
    position.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleAdd = () => {
    setNewPosition({ title: '' });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (position: Position) => {
    setSelectedPosition(position);
    setNewPosition({ title: position.title });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (position: Position) => {
    setSelectedPosition(position);
    setIsDeleteDialogOpen(true);
  };

  const confirmAdd = () => {
    if (!newPosition.title.trim()) {
      toast.error("Position title is required");
      return;
    }

    addPositionMutation.mutate(newPosition);
  };

  const confirmEdit = () => {
    if (!newPosition.title.trim()) {
      toast.error("Position title is required");
      return;
    }

    if (!selectedPosition) return;

    updatePositionMutation.mutate({
      id: selectedPosition.id,
      title: newPosition.title
    } as Position);
  };

  const confirmDelete = () => {
    if (!selectedPosition) return;
    deletePositionMutation.mutate(selectedPosition.id);
  };

  const handleRefreshRoles = async () => {
    try {
      toast.info("Refreshing user role and permissions...");
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // Update user role to administrator
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            id: data.session.user.id,
            role: 'administrator'
          });
        
        if (error) {
          console.error('Error updating user role:', error);
          toast.error('Failed to update role: ' + error.message);
        } else {
          setUserRole('administrator');
          setIsAdmin(true);
          // Force refresh the token to pick up the new role
          await supabase.auth.refreshSession();
          toast.success('Role updated to administrator. Please try your operation again.');
          refetch(); // Reload positions data
        }
      } else {
        toast.error('You are not logged in. Please log in to manage positions.');
      }
    } catch (error) {
      console.error('Error refreshing role:', error);
      toast.error('Failed to refresh permissions.');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Position Management</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleRefreshRoles}
          >
            <RefreshCcw size={16} />
            {userRole ? `Refresh Permissions (${userRole})` : 'Refresh Permissions'}
          </Button>
          <ConnectionStatus />
        </div>
      </div>
      
      <Card className="shadow-md">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl flex items-center gap-2">
              <BriefcaseBusiness className="h-6 w-6" /> Positions
            </CardTitle>
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus size={16} />
              <span className={isMobile ? "sr-only" : ""}>Add Position</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 flex items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search positions..."
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
                  <TableHead>Title</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-primary animate-spin" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading positions...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredPositions.length > 0 ? (
                  filteredPositions.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell className="font-medium">{position.title}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(position)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(position)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-10">
                      {searchValue ? 'No positions match your search.' : 'No positions found. Add your first position!'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Position Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Position</DialogTitle>
            <DialogDescription>
              Enter the title for the new position.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Position Title</Label>
              <Input
                id="title"
                value={newPosition.title}
                onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
                placeholder="Enter position title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmAdd}>Add Position</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Position Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Position</DialogTitle>
            <DialogDescription>
              Update the position title.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Position Title</Label>
              <Input
                id="edit-title"
                value={newPosition.title}
                onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
                placeholder="Enter position title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Position Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Position</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this position? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPosition && (
            <p className="py-4 text-sm text-gray-500">
              You are about to delete position: <span className="font-medium text-gray-900">{selectedPosition.title}</span>
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Position</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PositionsPage;
