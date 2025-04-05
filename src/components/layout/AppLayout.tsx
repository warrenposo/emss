
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { User, Bell, LogOut, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

const AppLayout: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // No session found, redirect to login page
          console.log('No session found, redirecting to login');
          localStorage.removeItem('isLoggedIn');
          navigate('/');
          return;
        }
        
        // If we have a session, set the user
        const userData = {
          name: session.user?.user_metadata?.first_name 
            ? `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name || ''}`
            : session.user.email,
          email: session.user.email,
          department: session.user?.user_metadata?.department || 'Not assigned'
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('user');
          navigate('/');
        } else if (event === 'SIGNED_IN' && session) {
          const userData = {
            name: session.user?.user_metadata?.first_name 
              ? `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name || ''}`
              : session.user.email,
            email: session.user.email,
            department: session.user?.user_metadata?.department || 'Not assigned'
          };
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('isLoggedIn', 'true');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If there's no user after loading is complete, redirect to login
  if (!user && !loading) {
    navigate('/');
    return null;
  }

  const getPageTitle = () => {
    if (location.pathname.includes('/dashboard')) return 'Dashboard';
    if (location.pathname.includes('/employees')) {
      if (location.pathname.includes('/holidays')) return 'Holidays';
      if (location.pathname.includes('/departments')) return 'Departments';
      if (location.pathname.includes('/positions')) return 'Positions';
      return 'Employee Management';
    }
    if (location.pathname.includes('/devices')) return 'Device Management';
    if (location.pathname.includes('/system')) return 'System Configuration';
    if (location.pathname.includes('/attendance')) return 'Attendance';
    return '';
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <Sidebar currentPath={location.pathname} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 h-16 flex justify-between items-center border-b">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleSidebar} 
                className="p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 focus:outline-none"
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h1 className="text-xl font-semibold hidden md:block">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.department}</p>
                </div>
                <div className="relative group">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <p className="px-4 py-2 text-sm text-gray-500 border-b">
                      Signed in as <span className="font-medium text-gray-900">{user?.name}</span>
                    </p>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="py-6 px-4 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
