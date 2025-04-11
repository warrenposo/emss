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
import { getAttendanceRecords, getDepartments, getDevices, AttendanceRecord } from '@/lib/attendance';
import { toast } from "sonner";
import { isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

/**
 * AttendanceList Component
 * 
 * Displays a list of attendance records with filtering and pagination capabilities.
 * Works in both connected mode (with Supabase) and demo mode (with mock data).
 */
const AttendanceList = () => {
  const { toast } = useToast();
  // State for filters
  const [idFilter, setIdFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all_departments');
  const [deviceFilter, setDeviceFilter] = useState('all_devices');
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
   * Fetch departments data
   * Uses mock data if Supabase is not configured
   */
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      try {
        // Fetch departments from API or mock data
        return await getDepartments();
      } catch (error) {
        // Error handling
        console.error('Error fetching departments:', error);
        toast.error('Failed to load departments');
        return [];
      }
    }
  });

  /**
   * Fetch devices data
   * Uses mock data if Supabase is not configured
   */
  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      try {
        // Fetch devices from API or mock data
        return await getDevices();
      } catch (error) {
        // Error handling
        console.error('Error fetching devices:', error);
        toast.error('Failed to load devices');
        return [];
      }
    }
  });

  /**
   * Fetch attendance records with filters
   * Applies all active filters and pagination
   */
  const {
    data: attendanceData,
    isLoading: isLoadingRecords,
    refetch,
  } = useQuery({
    queryKey: ['attendance', currentPage, itemsPerPage, isSearching, idFilter, nameFilter, departmentFilter, deviceFilter, startDate, endDate],
    queryFn: async () => {
      try {
        // Fetch attendance records with active filters
        return await getAttendanceRecords({
          idFilter: isSearching ? idFilter : '',
          nameFilter: isSearching ? nameFilter : '',
          departmentFilter: isSearching ? departmentFilter : '',
          deviceFilter: isSearching ? deviceFilter : '',
          startDate: isSearching ? startDate : undefined,
          endDate: isSearching ? endDate : undefined,
          page: currentPage,
          pageSize: itemsPerPage,
        });
      } catch (error) {
        // Error handling
        console.error('Error fetching attendance records:', error);
        toast.error('Failed to load attendance records');
        return { data: [], count: 0 };
      }
    },
  });

  /**
   * Handle search button click
   * Activates filters and refreshes data
   */
  const handleSearch = () => {
    setIsSearching(true);
    setCurrentPage(1);
    refetch();
  };

  /**
   * Reset all filters to default values
   */
  const handleReset = () => {
    setIdFilter('');
    setNameFilter('');
    setDepartmentFilter('all_departments');
    setDeviceFilter('all_devices');
    setStartDate(undefined);
    setEndDate(undefined);
    setIsSearching(false);
    setCurrentPage(1);
    refetch();
  };

  /**
   * Export attendance data
   * Currently a placeholder - can be implemented with backend integration
   */
  const handleExport = async () => {
    try {
      toast.info('Preparing export...');
      
      // This would be expanded in a real implementation to use your backend
      // For now, we'll just simulate an export with a delay
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
      
      // Call the local server endpoint for device sync
      const response = await fetch('http://localhost:3005/api/device/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ipAddress: '192.168.100.51', // Your device IP
          port: 4370
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync attendance');
      }

      const data = await response.json();
      
      toast({
        title: 'Success',
        description: `Successfully synced ${data.recordCount || 0} attendance records`,
      });

      // Refresh the attendance data
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

  const getAttendanceType = (type: number) => {
    switch (type) {
      case 0:
        return 'Check-In';
      case 1:
        return 'Check-Out';
      case 2:
        return 'Break-Out';
      case 3:
        return 'Break-In';
      case 4:
        return 'Overtime-In';
      case 5:
        return 'Overtime-Out';
      default:
        return 'Unknown';
    }
  };

  // Calculate total pages for pagination
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-2">
            {/* Employee ID Filter */}
            <Input
              type="text"
              placeholder="Search ID..."
              value={idFilter}
              onChange={(e) => setIdFilter(e.target.value)}
              className="bg-background"
            />
            {/* Employee Name Filter */}
            <Input
              type="text"
              placeholder="Search Name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="bg-background"
            />
            
            {/* Department Filter */}
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_departments">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Device Filter */}
            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_devices">All Devices</SelectItem>
                {devices.map((device) => (
                  <SelectItem key={device} value={device}>{device}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Date Range Filters */}
            <div className="flex space-x-2">
              {/* Start Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start text-left font-normal relative">
                    {startDate ? (
                      format(startDate, "MM/dd/yyyy")
                    ) : (
                      <span>Start Date</span>
                    )}
                    {startDate && (
                      <X
                        className="ml-2 h-4 w-4 absolute right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStartDate(undefined);
                        }}
                      />
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              
              {/* End Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 justify-start text-left font-normal relative">
                    {endDate ? (
                      format(endDate, "MM/dd/yyyy")
                    ) : (
                      <span>End Date</span>
                    )}
                    {endDate && (
                      <X
                        className="ml-2 h-4 w-4 absolute right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEndDate(undefined);
                        }}
                      />
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Filter Action Buttons */}
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handleReset}>Reset</Button>
            <div className="flex gap-2">
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline">Import</Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Attendance Records Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Verification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingRecords ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 rounded-full border-2 border-t-transparent border-primary animate-spin" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading attendance records...</p>
                  </TableCell>
                </TableRow>
              ) : attendanceData?.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                attendanceData?.data?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.user_id}</TableCell>
                    <TableCell>
                      {record.employee 
                        ? `${record.employee.first_name} ${record.employee.last_name}`
                        : 'Unknown Employee'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(record.timestamp), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(record.timestamp), 'hh:mm a')}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        record.type === 0 && "bg-green-100 text-green-800",
                        record.type === 1 && "bg-blue-100 text-blue-800"
                      )}>
                        {getAttendanceType(record.type)}
                      </span>
                    </TableCell>
                    <TableCell>{record.device_name || 'Unknown Device'}</TableCell>
                    <TableCell>{record.verify_mode || 'Fingerprint'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Total Records: {attendanceData?.count || 0}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Page:</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronFirst className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="mx-2 text-sm">
                  {currentPage} / {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                >
                  <ChevronLast className="h-4 w-4" />
                </Button>
              </div>
              {/* Records Per Page Selector */}
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(Number(value));
                  setCurrentPage(1);
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="20" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-4">
        <h2 className="text-2xl font-bold">Attendance Records</h2>
        <Button 
          onClick={syncAttendance} 
          disabled={isLoading}
        >
          {isLoading ? 'Syncing...' : 'Sync Attendance'}
        </Button>
      </div>

      <div className="border rounded-lg mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingRecords ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading records...
                </TableCell>
              </TableRow>
            ) : attendanceData?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No attendance records found
                </TableCell>
              </TableRow>
            ) : (
              attendanceData?.data?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {record.employee 
                      ? `${record.employee.first_name} ${record.employee.last_name}`
                      : 'Unknown Employee'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(record.timestamp), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(record.timestamp), 'hh:mm a')}
                  </TableCell>
                  <TableCell>{getAttendanceType(record.type)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AttendanceList;
