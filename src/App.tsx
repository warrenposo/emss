
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./components/dashboard/Dashboard";
import EmployeePage from "./pages/EmployeePage";
import DevicesPage from "./pages/DevicesPage";
import AttendancePage from "./pages/AttendancePage";
import SystemPage from "./pages/SystemPage";
import RegisterPage from "./components/auth/RegisterPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Employee Routes */}
            <Route path="/employees" element={<EmployeePage />} />
            <Route path="/employees/holidays" element={<EmployeePage />} />
            <Route path="/employees/departments" element={<EmployeePage />} />
            <Route path="/employees/areas" element={<EmployeePage />} />
            <Route path="/employees/positions" element={<EmployeePage />} />
            <Route path="/employees/timetables" element={<EmployeePage />} />
            <Route path="/employees/shifts" element={<EmployeePage />} />
            <Route path="/employees/department-schedules" element={<EmployeePage />} />
            <Route path="/employees/employee-schedules" element={<EmployeePage />} />
            <Route path="/employees/temporary-schedules" element={<EmployeePage />} />
            <Route path="/employees/leaves" element={<EmployeePage />} />
            
            {/* Device Routes */}
            <Route path="/devices" element={<DevicesPage />} />
            <Route path="/devices/fence-devices" element={<DevicesPage />} />
            <Route path="/devices/fence-employees" element={<DevicesPage />} />
            <Route path="/devices/fence-departments" element={<DevicesPage />} />
            
            {/* Attendance Routes */}
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/attendance/overview" element={<AttendancePage />} />
            <Route path="/attendance/reports" element={<AttendancePage />} />
            
            {/* System Routes */}
            <Route path="/system" element={<SystemPage />} />
            <Route path="/system/rules" element={<SystemPage />} />
            <Route path="/system/users" element={<SystemPage />} />
            <Route path="/system/email" element={<SystemPage />} />
            <Route path="/system/mobile" element={<SystemPage />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
