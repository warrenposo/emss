import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/database.types';

type Department = Database['public']['Tables']['departments']['Row'];
type Position = Database['public']['Tables']['positions']['Row'];
type Employee = Database['public']['Tables']['employees']['Row'];

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
  positions: Position[];
}

const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({ open, onOpenChange, departments, positions }) => {
  const queryClient = useQueryClient();
  const [newEmployee, setNewEmployee] = React.useState<Partial<Employee>>({
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
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setNewEmployee({
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
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error(`Failed to add employee: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.first_name || !newEmployee.last_name) {
      toast.error('Please fill in at least the first and last name');
      return;
    }
    addEmployeeMutation.mutate(newEmployee);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Enter the details for the new employee. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={newEmployee.first_name}
                onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={newEmployee.last_name}
                onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="badge_number">Badge Number</Label>
            <Input
              id="badge_number"
              value={newEmployee.badge_number}
              onChange={(e) => setNewEmployee({ ...newEmployee, badge_number: e.target.value })}
              placeholder="Enter badge number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              placeholder="Enter email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={newEmployee.gender}
              onValueChange={(value) => setNewEmployee({ ...newEmployee, gender: value })}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department_id">Department</Label>
            <Select
              value={newEmployee.department_id}
              onValueChange={(value) => setNewEmployee({ ...newEmployee, department_id: value })}
            >
              <SelectTrigger id="department_id">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position_id">Position</Label>
            <Select
              value={newEmployee.position_id}
              onValueChange={(value) => setNewEmployee({ ...newEmployee, position_id: value })}
            >
              <SelectTrigger id="position_id">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={newEmployee.mobile}
                onChange={(e) => setNewEmployee({ ...newEmployee, mobile: e.target.value })}
                placeholder="Enter mobile number"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={newEmployee.birthday}
                onChange={(e) => setNewEmployee({ ...newEmployee, birthday: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input
                id="hire_date"
                type="date"
                value={newEmployee.hire_date}
                onChange={(e) => setNewEmployee({ ...newEmployee, hire_date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={newEmployee.notes}
              onChange={(e) => setNewEmployee({ ...newEmployee, notes: e.target.value })}
              placeholder="Enter any notes"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addEmployeeMutation.isPending}>
              {addEmployeeMutation.isPending ? 'Adding...' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog; 