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

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  departments: Department[];
  positions: Position[];
}

const EditEmployeeDialog: React.FC<EditEmployeeDialogProps> = ({ open, onOpenChange, employee, departments, positions }) => {
  const queryClient = useQueryClient();
  const [editedEmployee, setEditedEmployee] = React.useState<Employee>(employee);

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
      onOpenChange(false);
      toast.success('Employee updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating employee:', error);
      toast.error(`Failed to update employee: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedEmployee.first_name || !editedEmployee.last_name) {
      toast.error('Please fill in at least the first and last name');
      return;
    }
    updateEmployeeMutation.mutate(editedEmployee);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update the employee details. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={editedEmployee.first_name}
                onChange={(e) => setEditedEmployee({ ...editedEmployee, first_name: e.target.value })}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={editedEmployee.last_name}
                onChange={(e) => setEditedEmployee({ ...editedEmployee, last_name: e.target.value })}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="badge_number">Badge Number</Label>
            <Input
              id="badge_number"
              value={editedEmployee.badge_number}
              onChange={(e) => setEditedEmployee({ ...editedEmployee, badge_number: e.target.value })}
              placeholder="Enter badge number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={editedEmployee.email}
              onChange={(e) => setEditedEmployee({ ...editedEmployee, email: e.target.value })}
              placeholder="Enter email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={editedEmployee.gender}
              onValueChange={(value) => setEditedEmployee({ ...editedEmployee, gender: value })}
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
              value={editedEmployee.department_id}
              onValueChange={(value) => setEditedEmployee({ ...editedEmployee, department_id: value })}
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
              value={editedEmployee.position_id}
              onValueChange={(value) => setEditedEmployee({ ...editedEmployee, position_id: value })}
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
                value={editedEmployee.phone}
                onChange={(e) => setEditedEmployee({ ...editedEmployee, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                value={editedEmployee.mobile}
                onChange={(e) => setEditedEmployee({ ...editedEmployee, mobile: e.target.value })}
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
                value={editedEmployee.birthday}
                onChange={(e) => setEditedEmployee({ ...editedEmployee, birthday: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hire_date">Hire Date</Label>
              <Input
                id="hire_date"
                type="date"
                value={editedEmployee.hire_date}
                onChange={(e) => setEditedEmployee({ ...editedEmployee, hire_date: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={editedEmployee.notes}
              onChange={(e) => setEditedEmployee({ ...editedEmployee, notes: e.target.value })}
              placeholder="Enter any notes"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateEmployeeMutation.isPending}>
              {updateEmployeeMutation.isPending ? 'Updating...' : 'Update Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog; 