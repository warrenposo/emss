import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash2, Filter, Download, Upload, 
  Building, Map, UserPlus, Calculator 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ConnectionStatus from '@/components/supabase/ConnectionStatus';
import { useIsMobile } from '@/hooks/use-mobile';
import { Employee } from '@/types/database.types';

const EmployeesList: React.FC = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchDepartment, setSearchDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState<Employee>({
    id: '',
    badge_number: '',
    first_name: '',
    last_name: '',
    email: '',
    hire_date: new Date().toISOString().split('T')[0],
  });
  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [positions, setPositions] = useState<{id: string, title: string}[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        setDepartments(data || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
        toast.error('Failed to load departments');
      }
    };

    const fetchPositions = async () => {
      try {
        const { data, error } = await supabase
          .from('positions')
          .select('id, title')
          .order('title');
          
        if (error) throw error;
        setPositions(data || []);
      } catch (error) {
        console.error('Error fetching positions:', error);
        toast.error('Failed to load positions');
      }
    };

    fetchDepartments();
    fetchPositions();
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("You must be logged in to view and manage employees");
      }
    };
    
    checkAuthStatus();
  }, []);

  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees', currentPage, pageSize, searchId, searchName, searchDepartment],
    queryFn: async () => {
      console.log('Fetching employees with filters:', { searchId, searchName, searchDepartment, page: currentPage, pageSize });
      
      let query = supabase
        .from('employees')
        .select(`
          *,
          departments:department_id (name),
          positions:position_id (title)
        `, { count: 'exact' });
      
      if (searchId) {
        query = query.ilike('badge_number', `%${searchId}%`);
      }
      
      if (searchName) {
        query = query.or(`first_name.ilike.%${searchName}%,last_name.ilike.%${searchName}%`);
      }
      
      if (searchDepartment && searchDepartment !== 'all_departments') {
        query = query.eq('department_id', searchDepartment);
      }
      
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error, count } = await query
        .order('last_name', { ascending: true })
        .range(from, to);
      
      if (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees: ' + error.message);
        return { data: [], count: 0 };
      }
      
      return { 
        data: data.map(employee => ({
          id: employee.id,
          badge_number: employee.badge_number,
          first_name: employee.first_name,
          last_name: employee.last_name,
          gender: employee.gender,
          department: employee.departments?.name || '',
          department_id: employee.department_id,
          position: employee.positions?.title || '',
          position_id: employee.position_id,
          card_no: employee.card_no || '',
          passport_no: employee.passport_no || '',
          phone: employee.phone || '',
          mobile: employee.mobile || '',
          email: employee.email,
          birthday: employee.birthday || '',
          hire_date: employee.hire_date,
          resign_date: employee.resign_date || '',
          notes: employee.notes || ''
        })),
        count: count || 0
      };
    }
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async (newEmp: Partial<Employee>) => {
      console.log('Adding employee:', newEmp);
      
      try {
        // Check if user is authenticated
        const { data: session } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('You must be logged in to add employees');
        }

        const { data, error } = await supabase
          .from('employees')
          .insert([{
            badge_number: newEmp.badge_number || '',
            first_name: newEmp.first_name,
            last_name: newEmp.last_name,
            gender: newEmp.gender || null,
            department_id: newEmp.department_id || null,
            position_id: newEmp.position_id || null,
            card_no: newEmp.card_no || null,
            passport_no: newEmp.passport_no || null,
            phone: newEmp.phone || null,
            mobile: newEmp.mobile || null,
            email: newEmp.email || '',
            birthday: newEmp.birthday || null,
            hire_date: newEmp.hire_date || new Date().toISOString().split('T')[0],
            resign_date: newEmp.resign_date || null,
            notes: newEmp.notes || null
          }])
          .select();
          
        if (error) {
          console.error('Error adding employee:', error);
          throw new Error(error.message);
        }
        
        return data[0];
      } catch (error: any) {
        console.error('Error in mutation:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success('Employee added successfully');
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setNewEmployee({
        id: '',
        badge_number: '',
        first_name: '',
        last_name: '',
        email: '',
        hire_date: new Date().toISOString().split('T')[0],
      });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error(`Failed to add employee: ${error.message}`);
    }
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async (updatedEmp: Employee) => {
      console.log('Updating employee:', updatedEmp);
      
      // Check if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to update employees');
      }

      const { data, error } = await supabase
        .from('employees')
        .update({
          badge_number: updatedEmp.badge_number,
          first_name: updatedEmp.first_name,
          last_name: updatedEmp.last_name,
          gender: updatedEmp.gender || null,
          department_id: updatedEmp.department_id || null,
          position_id: updatedEmp.position_id || null,
          card_no: updatedEmp.card_no || null,
          passport_no: updatedEmp.passport_no || null,
          phone: updatedEmp.phone || null,
          mobile: updatedEmp.mobile || null,
          email: updatedEmp.email,
          birthday: updatedEmp.birthday || null,
          hire_date: updatedEmp.hire_date,
          resign_date: updatedEmp.resign_date || null,
          notes: updatedEmp.notes || null
        })
        .eq('id', updatedEmp.id)
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      toast.success('Employee updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating employee:', error);
      toast.error(`Failed to update employee: ${error.message}`);
    }
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting employee with ID:', id);
      
      // Check if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to delete employees');
      }

      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
      toast.success('Employee deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting employee:', error);
      toast.error(`Failed to delete employee: ${error.message}`);
    }
  });

  const handleSearch = () => {
    setCurrentPage(1);
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  const handleAdd = () => {
    setNewEmployee({
      id: '',
      badge_number: '',
      first_name: '',
      last_name: '',
      gender: '',
      department_id: '',
      position_id: '',
      card_no: '',
      passport_no: '',
      phone: '',
      mobile: '',
      email: '',
      birthday: '',
      hire_date: new Date().toISOString().split('T')[0],
      resign_date: '',
      notes: ''
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNewEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmAdd = () => {
    if (!newEmployee.first_name || !newEmployee.last_name) {
      toast.error('Please fill in at least the first and last name');
      return;
    }
    addEmployeeMutation.mutate(newEmployee);
  };

  const confirmEdit = () => {
    if (!newEmployee.first_name || !newEmployee.last_name) {
      toast.error('Please fill in at least the first and last name');
      return;
    }
    updateEmployeeMutation.mutate(newEmployee);
  };

  const confirmDelete = () => {
    if (!selectedEmployee?.id) return;
    deleteEmployeeMutation.mutate(selectedEmployee.id);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Employee Management</h2>
        <ConnectionStatus />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="flex flex-wrap gap-2 mb-6">
            <Button variant="outline" className="flex items-center gap-1" onClick={handleAdd}>
              <Plus size={16} />
              <span className={isMobile ? "sr-only" : ""}>Add</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1" 
              onClick={() => selectedEmployee && handleEdit(selectedEmployee)}
              disabled={!selectedEmployee}
            >
              <Edit size={16} />
              <span className={isMobile ? "sr-only" : ""}>Update</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1" 
              onClick={() => selectedEmployee && handleDelete(selectedEmployee)}
              disabled={!selectedEmployee}
            >
              <Trash2 size={16} />
              <span className={isMobile ? "sr-only" : ""}>Delete</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-1" disabled>
              <Filter size={16} />
              <span className={isMobile ? "sr-only" : ""}>Select</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-1" disabled>
              <Building size={16} />
              <span className={isMobile ? "sr-only" : ""}>Update Department</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-1" disabled>
              <Map size={16} />
              <span className={isMobile ? "sr-only" : ""}>Update Area</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-1" disabled>
              <UserPlus size={16} />
              <span className={isMobile ? "sr-only" : ""}>Add Transaction</span>
            </Button>
            <Button variant="outline" className="flex items-center gap-1" disabled>
              <Calculator size={16} />
              <span className={isMobile ? "sr-only" : ""}>Calculations</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search Name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="relative">
              <Select
                value={searchDepartment}
                onValueChange={setSearchDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_departments">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="flex items-center gap-1 flex-shrink-0" onClick={handleSearch}>
                <Search size={16} />
                <span className={isMobile ? "sr-only" : ""}>Search</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-1 flex-shrink-0" disabled>
                <Upload size={16} />
                <span className={isMobile ? "sr-only" : ""}>Import</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-1 flex-shrink-0" disabled>
                <Download size={16} />
                <span className={isMobile ? "sr-only" : ""}>Export</span>
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Badge Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Hired Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingEmployees ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-primary animate-spin" />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading employees...</p>
                    </TableCell>
                  </TableRow>
                ) : employeesData?.data?.length > 0 ? (
                  employeesData.data.map((employee) => (
                    <TableRow 
                      key={employee.id} 
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedEmployee?.id === employee.id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <TableCell>{employee.badge_number}</TableCell>
                      <TableCell>{`${employee.first_name} ${employee.last_name}`}</TableCell>
                      <TableCell>{employee.gender || '-'}</TableCell>
                      <TableCell>{employee.department || '-'}</TableCell>
                      <TableCell>{employee.position || '-'}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.phone || employee.mobile || '-'}</TableCell>
                      <TableCell>{employee.hire_date}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No employees found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {employeesData?.data?.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div>
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, employeesData.count)} of {employeesData.count} entries
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={(currentPage * pageSize) >= employeesData.count}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter employee details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="badge_number">Badge Number</Label>
              <Input
                id="badge_number"
                value={newEmployee.badge_number}
                onChange={(e) => setNewEmployee({...newEmployee, badge_number: e.target.value})}
                placeholder="Enter badge number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={newEmployee.first_name}
                onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={newEmployee.last_name}
                onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                placeholder="Enter last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={newEmployee.gender || "not_specified"}
                onValueChange={(value) => setNewEmployee({...newEmployee, gender: value === "not_specified" ? "" : value})}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Select gender</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department_id">Department</Label>
              <Select
                value={newEmployee.department_id || "not_specified"}
                onValueChange={(value) => setNewEmployee({...newEmployee, department_id: value === "not_specified" ? "" : value})}
              >
                <SelectTrigger id="department_id">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Select department</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position_id">Position</Label>
              <Select
                value={newEmployee.position_id || "not_specified"}
                onValueChange={(value) => setNewEmployee({...newEmployee, position_id: value === "not_specified" ? "" : value})}
              >
                <SelectTrigger id="position_id">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Select position</SelectItem>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>{pos.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newEmployee.phone || ''}
                onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={newEmployee.mobile || ''}
                onChange={(e) => setNewEmployee({...newEmployee, mobile: e.target.value})}
                placeholder="Enter mobile number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input
                id="hire_date"
                type="date"
                value={newEmployee.hire_date}
                onChange={(e) => setNewEmployee({...newEmployee, hire_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="card_no">Card Number</Label>
              <Input
                id="card_no"
                value={newEmployee.card_no || ''}
                onChange={(e) => setNewEmployee({...newEmployee, card_no: e.target.value})}
                placeholder="Enter card number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passport_no">Passport Number</Label>
              <Input
                id="passport_no"
                value={newEmployee.passport_no || ''}
                onChange={(e) => setNewEmployee({...newEmployee, passport_no: e.target.value})}
                placeholder="Enter passport number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmAdd}>Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee details below. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit_badge_number">Badge Number</Label>
              <Input
                id="edit_badge_number"
                value={newEmployee.badge_number}
                onChange={(e) => setNewEmployee({...newEmployee, badge_number: e.target.value})}
                placeholder="Enter badge number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_first_name">First Name *</Label>
              <Input
                id="edit_first_name"
                value={newEmployee.first_name}
                onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_last_name">Last Name *</Label>
              <Input
                id="edit_last_name"
                value={newEmployee.last_name}
                onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                placeholder="Enter last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_gender">Gender</Label>
              <Select
                value={newEmployee.gender || "not_specified"}
                onValueChange={(value) => setNewEmployee({...newEmployee, gender: value === "not_specified" ? "" : value})}
              >
                <SelectTrigger id="edit_gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Select gender</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_department_id">Department</Label>
              <Select
                value={newEmployee.department_id || "not_specified"}
                onValueChange={(value) => setNewEmployee({...newEmployee, department_id: value === "not_specified" ? "" : value})}
              >
                <SelectTrigger id="edit_department_id">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Select department</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_position_id">Position</Label>
              <Select
                value={newEmployee.position_id || "not_specified"}
                onValueChange={(value) => setNewEmployee({...newEmployee, position_id: value === "not_specified" ? "" : value})}
              >
                <SelectTrigger id="edit_position_id">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Select position</SelectItem>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>{pos.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_phone">Phone</Label>
              <Input
                id="edit_phone"
                value={newEmployee.phone || ''}
                onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_mobile">Mobile</Label>
              <Input
                id="edit_mobile"
                value={newEmployee.mobile || ''}
                onChange={(e) => setNewEmployee({...newEmployee, mobile: e.target.value})}
                placeholder="Enter mobile number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_hire_date">Hire Date</Label>
              <Input
                id="edit_hire_date"
                type="date"
                value={newEmployee.hire_date}
                onChange={(e) => setNewEmployee({...newEmployee, hire_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_card_no">Card Number</Label>
              <Input
                id="edit_card_no"
                value={newEmployee.card_no || ''}
                onChange={(e) => setNewEmployee({...newEmployee, card_no: e.target.value})}
                placeholder="Enter card number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_passport_no">Passport Number</Label>
              <Input
                id="edit_passport_no"
                value={newEmployee.passport_no || ''}
                onChange={(e) => setNewEmployee({...newEmployee, passport_no: e.target.value})}
                placeholder="Enter passport number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmEdit}>Update Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedEmployee && (
              <p className="text-sm text-gray-500">
                You are about to delete employee: <span className="font-medium text-gray-900">{selectedEmployee.first_name} {selectedEmployee.last_name}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeesList;
