import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, Users, Cpu, Settings, 
  ChevronDown, ChevronRight, 
  Briefcase, Building, Map, UserCircle, 
  Calendar, Clock, ClipboardList, 
  FileText, BarChart, CheckSquare
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  href: string;
  isActive: boolean;
  subItems?: { id: string; title: string; href: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentPath }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    employees: currentPath.includes('/employees'),
    devices: currentPath.includes('/devices'),
    attendance: currentPath.includes('/attendance'),
    system: currentPath.includes('/system'),
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const navSections: NavSection[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <Home size={18} />,
      href: '/dashboard',
      isActive: currentPath === '/dashboard',
    },
    {
      id: 'employees',
      title: 'Employees',
      icon: <Users size={18} />,
      href: '/employees',
      isActive: currentPath.includes('/employees'),
      subItems: [
        { id: 'employee-list', title: 'Employee List', href: '/employees' },
        { id: 'departments', title: 'Departments', href: '/employees/departments' },
        { id: 'areas', title: 'Areas', href: '/employees/areas' },
        { id: 'positions', title: 'Positions', href: '/employees/positions' },
        { id: 'holidays', title: 'Holidays', href: '/employees/holidays' },
        { id: 'timetables', title: 'Timetables', href: '/employees/timetables' },
        { id: 'shifts', title: 'Shifts', href: '/employees/shifts' },
        { id: 'dept-schedules', title: 'Department Schedules', href: '/employees/department-schedules' },
        { id: 'emp-schedules', title: 'Employee Schedules', href: '/employees/employee-schedules' },
        { id: 'temp-schedules', title: 'Temporary Schedules', href: '/employees/temporary-schedules' },
        { id: 'leaves', title: 'Employee Leave', href: '/employees/leaves' },
      ]
    },
    {
      id: 'devices',
      title: 'Devices',
      icon: <Cpu size={18} />,
      href: '/devices',
      isActive: currentPath.includes('/devices'),
      subItems: [
        { id: 'device-list', title: 'Device List', href: '/devices' },
        { id: 'fence-devices', title: 'Fence Devices', href: '/devices/fence-devices' },
        { id: 'fence-employees', title: 'Fence Employees', href: '/devices/fence-employees' },
        { id: 'fence-departments', title: 'Fence Departments', href: '/devices/fence-departments' },
      ]
    },
    {
      id: 'attendance',
      title: 'Attendance',
      icon: <CheckSquare size={18} />,
      href: '/attendance',
      isActive: currentPath.includes('/attendance'),
      subItems: [
        { id: 'attendance-list', title: 'Attendance List', href: '/attendance' },
        { id: 'attendance-overview', title: 'Overview', href: '/attendance/overview' },
        { id: 'attendance-reports', title: 'Reports', href: '/attendance/reports' },
      ]
    },
    {
      id: 'system',
      title: 'System',
      icon: <Settings size={18} />,
      href: '/system',
      isActive: currentPath.includes('/system'),
      subItems: [
        { id: 'rules', title: 'Rules', href: '/system/rules' },
        { id: 'users', title: 'Users', href: '/system/users' },
        { id: 'email', title: 'Email', href: '/system/email' },
        { id: 'mobile', title: 'Mobile', href: '/system/mobile' },
      ]
    },
  ];

  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
      {/* Sidebar header */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <h1 className="text-xl font-semibold text-white">Isanda EMS</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navSections.map((section) => (
            <li key={section.id}>
              {section.subItems ? (
                <>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full nav-link ${section.isActive ? 'active' : ''}`}
                  >
                    {section.icon}
                    <span>{section.title}</span>
                    {expandedSections[section.id] ? (
                      <ChevronDown size={16} className="ml-auto" />
                    ) : (
                      <ChevronRight size={16} className="ml-auto" />
                    )}
                  </button>
                  {expandedSections[section.id] && section.subItems && (
                    <ul className="mt-1 ml-6 space-y-1 border-l border-sidebar-border/50 pl-2">
                      {section.subItems.map((subItem) => (
                        <li key={subItem.id}>
                          <Link
                            to={subItem.href}
                            className={`sidebar-item ${
                              currentPath === subItem.href ? 'bg-sidebar-accent/50' : ''
                            }`}
                          >
                            <span className="text-sm">{subItem.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link to={section.href} className={`nav-link ${section.isActive ? 'active' : ''}`}>
                  {section.icon}
                  <span>{section.title}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar footer */}
      <div className="p-4 border-t border-sidebar-border/50 text-xs text-sidebar-foreground/80">
        <p>Isanda Investments Limited</p>
        <p>© {new Date().getFullYear()} All rights reserved</p>
      </div>
    </div>
  );
};

export default Sidebar;
