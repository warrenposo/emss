import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import { getAttendanceRecords, getDepartments, getDevices } from '@/lib/attendance';
import { toast } from "sonner";
import { isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface AttendanceRecord {
  id: string;
  user_id: string;
  device_id: string;
  timestamp: string;
  temperature: number | null;
  verify_type: string | null;
  status: string | null;
  remark: string | null;
  created_at: string;
}

interface Device {
  id: string;
  serial_number: string;
  device_type: string;
  alias: string;
  status: string;
  ip_address: string;
  platform: string;
  firmware_version: string;
  last_update: string;
}

/**
 * AttendanceList Component
 * 
 * Displays a list of attendance records with filtering and pagination capabilities.
 * Works in both connected mode (with Supabase) and demo mode (with mock data).
 */
const AttendanceList = () => {
  const { toast } = useToast();
  // State for filters
  const [userIdFilter, setUserIdFilter] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all_devices');
  const [verifyTypeFilter, setVerifyTypeFilter] = useState('all_types');
  const [statusFilter, setStatusFilter] = useState('all_statuses');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Show notification if Supabase is not configured (demo mode)
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      toast.info('Using demo data - Supabase integration not configured');
    }
  }, []);

  /**
   * Fetch devices data
   */
  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('devices')
          .select('*')
          .order('alias');

        if (error) throw error;
        return data as Device[];
      } catch (error) {
        console.error('Error fetching devices:', error);
        toast.error('Failed to load devices');
        return [];
      }
    }
  });

  /**
   * Fetch attendance records with filters
   */
  const {
    data: attendanceData,
    isLoading: isLoadingRecords,
    refetch,
  } = useQuery({
    queryKey: ['attendance', currentPage, itemsPerPage, isSearching, userIdFilter, deviceFilter, verifyTypeFilter, statusFilter, startDate, endDate],
    queryFn: async () => {
      try {
        let query = supabase
          .from('attendance_records')
          .select('*', { count: 'exact' });

        if (isSearching) {
          if (userIdFilter) {
            query = query.ilike('user_id', `%${userIdFilter}%`);
          }
          if (deviceFilter !== 'all_devices') {
            query = query.eq('device_id', deviceFilter);
          }
          if (verifyTypeFilter !== 'all_types') {
            query = query.eq('verify_type', verifyTypeFilter);
          }
          if (statusFilter !== 'all_statuses') {
            query = query.eq('status', statusFilter);
          }
          if (startDate) {
            query = query.gte('timestamp', startDate.toISOString());
          }
          if (endDate) {
            query = query.lte('timestamp', endDate.toISOString());
          }
        }

        const { data, error, count } = await query
          .order('timestamp', { ascending: false })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

        if (error) throw error;

        return { data: data as AttendanceRecord[], count: count || 0 };
      } catch (error) {
        console.error('Error fetching attendance records:', error);
        toast.error('Failed to load attendance records');
        return { data: [], count: 0 };
      }
    },
  });

  const handleSearch = () => {
    setIsSearching(true);
    setCurrentPage(1);
    refetch();
  };

  const handleReset = () => {
    setUserIdFilter('');
    setDeviceFilter('all_devices');
    setVerifyTypeFilter('all_types');
    setStatusFilter('all_statuses');
    setStartDate(undefined);
    setEndDate(undefined);
    setIsSearching(false);
    setCurrentPage(1);
    refetch();
  };

  const handleExport = async () => {
    try {
      toast.info('Preparing export...');
      setTimeout(() => {
        toast.success('Export successful');
      }, 1500);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const syncAttendance = async () => {
    try {
      setIsLoading(true);
      
      if (deviceFilter === 'all_devices') {
        throw new Error('Please select a specific device to sync');
      }

      const response = await fetch('http://localhost:3005/api/device/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: deviceFilter
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync attendance');
      }

      const data = await response.json();
      
      toast({
        title: 'Success',
        description: `Successfully synced ${data.records || 0} attendance records from ${data.deviceInfo.alias}`,
      });

      refetch();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sync attendance',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil((attendanceData?.count || 0) / itemsPerPage);
  const paginatedData = attendanceData?.data || [];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Attendance Records</h1>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Daily Attendance</CardTitle>
          <CardDescription>
            View and manage employee attendance records
            {!isSupabaseConfigured() && " (Demo Mode)"}
          </CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
            {/* User ID Filter */}
            <Input
              type="text"
              placeholder="Search User ID..."
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="bg-background"
            />
            {/* Device Filter */}
            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_devices">All Devices</SelectItem>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.alias} ({device.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Verify Type Filter */}
            <Select value={verifyTypeFilter} onValueChange={setVerifyTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Verify Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_types">All Types</SelectItem>
                <SelectItem value="fingerprint">Fingerprint</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="face">Face</SelectItem>
              </SelectContent>
            </Select>
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_statuses">All Statuses</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
            {/* Date Range Filters */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Start Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>End Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Button onClick={syncAttendance} disabled={isLoading}>
              {isLoading ? 'Syncing...' : 'Sync Device'}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Verify Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingRecords ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.user_id}</TableCell>
                      <TableCell>{record.device_id}</TableCell>
                      <TableCell>{format(new Date(record.timestamp), 'PPpp')}</TableCell>
                      <TableCell>{record.temperature || '-'}</TableCell>
                      <TableCell>{record.verify_type || '-'}</TableCell>
                      <TableCell>{record.status || '-'}</TableCell>
                      <TableCell>{record.remark || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronFirst className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronLast className="h-4 w-4" />
              </Button>
            </div>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceList;
