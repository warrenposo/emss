import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash2, Filter, Download, Upload, 
  Building, Map, UserPlus, Calculator, Pencil, Trash 
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
import { Database } from '@/types/database.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import AddEmployeeDialog from './AddEmployeeDialog';
import EditEmployeeDialog from './EditEmployeeDialog';

type Department = Database['public']['Tables']['departments']['Row'];
type Position = Database['public']['Tables']['positions']['Row'];
type Employee = Database['public']['Tables']['employees']['Row'] & {
  departments?: { name: string } | null;
  positions?: { title: string } | null;
};

type EmployeeWithRelations = Employee & {
  department: string;
  position: string;
};

const EmployeesList: React.FC = () => {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchDepartment, setSearchDepartment] = useState('all_departments');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithRelations | null>(null);
  const [newEmployee, setNewEmployee] = useState<Employee>({
    id: '',
    badge_number: '',
    first_name: '',
    last_name: '',
    email: '',
    hire_date: new Date().toISOString().split('T')[0],
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
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
          .select('*')
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
      let query = supabase
        .from('employees')
        .select(`
          *,
          departments (name),
          positions (title)
        `);

      if (searchId) {
        query = query.ilike('id', `%${searchId}%`);
      }
      if (searchName) {
        query = query.ilike('name', `%${searchName}%`);
      }
      if (searchDepartment && searchDepartment !== 'all_departments') {
        query = query.eq('department_id', searchDepartment);
      }

      const { data: employees, error } = await query
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)
        .order('id');

      if (error) {
        throw new Error(error.message);
      }

      return employees?.map((employee) => ({
        ...employee,
        department: employee.departments?.name || '',
        position: employee.positions?.title || '',
      })) as EmployeeWithRelations[];
    },
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async (newEmp: Partial<Employee>) => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          throw new Error('You must be logged in to add employees');
        }

        const employeeData = {
          badge_number: newEmp.badge_number,
          first_name: newEmp.first_name || '',
          last_name: newEmp.last_name || '',
          gender: newEmp.gender?.toLowerCase() || null,
          department_id: newEmp.department_id,
          position_id: newEmp.position_id,
          card_no: newEmp.card_no,
          passport_no: newEmp.passport_no,
          phone: newEmp.phone,
          mobile: newEmp.mobile,
          email: newEmp.email || '',
          birthday: newEmp.birthday,
          hire_date: newEmp.hire_date || new Date().toISOString().split('T')[0],
          resign_date: newEmp.resign_date,
          notes: newEmp.notes,
          user_id: session.session.user.id
        };

        if (employeeData.gender && !['male', 'female', 'other'].includes(employeeData.gender)) {
          throw new Error('Invalid gender value');
        }

        const { data, error } = await supabase
          .from('employees')
          .insert([employeeData])
          .select('*')
          .single();
          
        if (error) throw error;
        return data;
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
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('You must be logged in to update employees');
      }

      const updateData = {
        badge_number: updatedEmp.badge_number,
        first_name: updatedEmp.first_name || '',
        last_name: updatedEmp.last_name || '',
        gender: updatedEmp.gender?.toLowerCase() || null,
        department_id: updatedEmp.department_id,
        position_id: updatedEmp.position_id,
        card_no: updatedEmp.card_no,
        passport_no: updatedEmp.passport_no,
        phone: updatedEmp.phone,
        mobile: updatedEmp.mobile,
        email: updatedEmp.email || '',
        birthday: updatedEmp.birthday,
        hire_date: updatedEmp.hire_date,
        resign_date: updatedEmp.resign_date,
        notes: updatedEmp.notes,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', updatedEmp.id)
        .select('*')
        .single();
        
      if (error) throw error;
      return data;
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
    mutationFn: async (employeeId: string) => {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        throw new Error('Unauthorized');
      }

      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete employee: ${error.message}`);
    },
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
    <div className="container mx-auto py-6 space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Employees</h1>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium text-base">Add New Employee</span>
          </Button>
        </div>

        <div className="flex gap-4 flex-wrap mb-6">
          <Input
            placeholder="Search by ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="max-w-[200px]"
          />
          <Input
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="max-w-[200px]"
          />
          <Select value={searchDepartment} onValueChange={setSearchDepartment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_departments">All Departments</SelectItem>
              {departments?.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingEmployees ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      Loading employees...
                    </div>
                  </TableCell>
                </TableRow>
              ) : employeesData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                employeesData?.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.id}</TableCell>
                    <TableCell>{`${employee.first_name} ${employee.last_name}`}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(employee)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(employee)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {employeesData?.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div>
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, employeesData.length)} of {employeesData.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={(currentPage * pageSize) >= employeesData.length}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <AddEmployeeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        departments={departments}
        positions={positions}
      />

      {selectedEmployee && (
        <>
          <EditEmployeeDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            employee={selectedEmployee}
            departments={departments}
            positions={positions}
          />

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the employee
                  record from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteEmployeeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Delete'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};

export default EmployeesList;
