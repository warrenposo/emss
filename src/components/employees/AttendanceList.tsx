import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type Attendance = {
  id: string;
  employee_id: string;
  entry_time: string;
  exit_time: string | null;
  device_id: string;
  created_at: string;
  employee: {
    first_name: string;
    last_name: string;
    badge_number: string;
  };
};

const AttendanceList: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const { data: attendanceData, isLoading, refetch } = useQuery({
    queryKey: ['attendance', dateFilter, searchValue],
    queryFn: async () => {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          employee:employees(first_name, last_name, badge_number)
        `)
        .order('entry_time', { ascending: false });

      if (dateFilter) {
        const startDate = new Date(dateFilter);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(dateFilter);
        endDate.setHours(23, 59, 59, 999);

        query = query
          .gte('entry_time', startDate.toISOString())
          .lte('entry_time', endDate.toISOString());
      }

      if (searchValue) {
        query = query.or(
          `employee.first_name.ilike.%${searchValue}%,employee.last_name.ilike.%${searchValue}%,employee.badge_number.ilike.%${searchValue}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as Attendance[];
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Attendance Records</h1>
          <div className="flex gap-4">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="max-w-[200px]"
            />
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search by name or badge number..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Badge Number</TableHead>
                <TableHead>Entry Time</TableHead>
                <TableHead>Exit Time</TableHead>
                <TableHead>Device ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      Loading attendance records...
                    </div>
                  </TableCell>
                </TableRow>
              ) : attendanceData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                attendanceData?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {record.employee?.first_name} {record.employee?.last_name}
                    </TableCell>
                    <TableCell>{record.employee?.badge_number}</TableCell>
                    <TableCell>
                      {new Date(record.entry_time).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {record.exit_time ? new Date(record.exit_time).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>{record.device_id}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceList; 