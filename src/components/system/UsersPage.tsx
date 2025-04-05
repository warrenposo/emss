import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define user role type to match the enum in the database
type UserRole = 'administrator' | 'manager' | 'supervisor' | 'viewer';

// Define user profile type
interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  department: string | null;
  last_login: string | null;
  active: boolean;
  email?: string; // From auth.users
}

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    role: 'viewer' as UserRole,
    department: '',
    active: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();

  // Fetch users with their profiles
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Get all user profiles directly - this table exists in our schema
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*');

      if (profilesError) {
        throw new Error(`Error fetching profiles: ${profilesError.message}`);
      }

      // If we wanted to get emails, we would need to handle that differently
      // For now, just use the profiles data we have
      const combinedUsers: UserProfile[] = profiles.map((profile: any) => {
        return {
          ...profile,
          email: profile.email || `user-${profile.id.substring(0, 8)}@example.com` // Fallback email value
        };
      });

      return combinedUsers;
    }
  });

  const filteredUsers = users.filter(user => 
    (user.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.role?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            department: userData.department,
            role: userData.role
          }
        }
      });

      if (authError) throw new Error(authError.message);

      // The profile should be created automatically through the trigger
      // But we might want to update active status if it's different from default
      if (!userData.active && authData.user) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ active: userData.active })
          .eq('id', authData.user.id);

        if (updateError) throw new Error(updateError.message);
      }

      return authData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "User added successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: UserProfile) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          department: userData.department,
          active: userData.active,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id);

      if (error) throw new Error(error.message);
      return userData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "User updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  });

  // Delete user functionality would be an admin API in production
  // For now, we'll just update the active status
  const toggleUserActiveStatus = useMutation({
    mutationFn: async (user: UserProfile) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          active: !user.active,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw new Error(error.message);
      return user;
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: `User ${user.active ? 'deactivated' : 'activated'} successfully`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  });

  const handleAddUser = () => {
    createUserMutation.mutate(newUser);
  };

  const handleEditUser = () => {
    if (currentUser) {
      updateUserMutation.mutate(currentUser);
    }
  };

  const handleDeleteUser = () => {
    if (currentUser) {
      toggleUserActiveStatus.mutate(currentUser);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const resetNewUserForm = () => {
    setNewUser({
      email: '',
      password: '',
      confirmPassword: '',
      first_name: '',
      last_name: '',
      role: 'viewer',
      department: '',
      active: true
    });
  };

  // Reset the form when closing the dialog
  useEffect(() => {
    if (!isAddDialogOpen) {
      resetNewUserForm();
    }
  }, [isAddDialogOpen]);

  const roles: UserRole[] = ["administrator", "manager", "supervisor", "viewer"];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">System Users</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Add User
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
          <p>Error: {(error as Error).message}</p>
          <p className="text-sm mt-1">You may need administrator privileges to view all users.</p>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">Loading users...</div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Shield size={16} className="text-primary" />
                      {user.role}
                    </div>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCurrentUser(user);
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
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-sm text-gray-500">No users found</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={newUser.first_name}
                  onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={newUser.last_name}
                  onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                checked={newUser.active}
                onChange={(e) => setNewUser({ ...newUser, active: e.target.checked })}
                className="h-4 w-4 text-primary border-gray-300 rounded"
              />
              <Label htmlFor="active">Active Account</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? "Adding..." : "Add User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {currentUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-first-name">First Name</Label>
                  <Input
                    id="edit-first-name"
                    value={currentUser.first_name || ''}
                    onChange={(e) => setCurrentUser({ ...currentUser, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-last-name">Last Name</Label>
                  <Input
                    id="edit-last-name"
                    value={currentUser.last_name || ''}
                    onChange={(e) => setCurrentUser({ ...currentUser, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={currentUser.email || ''}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">Email address cannot be changed</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={currentUser.role}
                    onValueChange={(value) => setCurrentUser({ ...currentUser, role: value as UserRole })}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Input
                    id="edit-department"
                    value={currentUser.department || ''}
                    onChange={(e) => setCurrentUser({ ...currentUser, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={currentUser.active}
                  onChange={(e) => setCurrentUser({ ...currentUser, active: e.target.checked })}
                  className="h-4 w-4 text-primary border-gray-300 rounded"
                />
                <Label htmlFor="edit-active">Active Account</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleEditUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog - Changed to Activate/Deactivate */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentUser?.active ? "Deactivate User" : "Activate User"}
            </DialogTitle>
          </DialogHeader>
          {currentUser && (
            <p>
              Are you sure you want to {currentUser.active ? "deactivate" : "activate"} the account for{" "}
              <span className="font-semibold">{currentUser.first_name} {currentUser.last_name}</span>?
              {currentUser.active && " The user will no longer be able to log in."}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              variant={currentUser?.active ? "destructive" : "default"}
              onClick={handleDeleteUser}
              disabled={toggleUserActiveStatus.isPending}
            >
              {toggleUserActiveStatus.isPending 
                ? "Processing..." 
                : (currentUser?.active ? "Deactivate" : "Activate")
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
