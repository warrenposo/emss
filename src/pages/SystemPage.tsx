
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Settings, Users, Mail, Phone, CheckCircle, Save } from 'lucide-react';
import UsersPage from '../components/system/UsersPage';
import MobilePage from '../components/system/MobilePage';
import { supabase, isUserAdmin, getCurrentUserRole } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SystemPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Fetch current role directly for debugging
        const currentRole = await getCurrentUserRole();
        setUserRole(currentRole);
        
        if (user) {
          console.log('Current user ID:', user.id);
          
          // Direct database query to check role
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            setDebugInfo(`Error fetching profile: ${profileError.message}`);
          } else {
            console.log('User profile:', profile);
            setDebugInfo(`Your current role is: ${profile?.role || 'unknown'}`);
          }
        }
        
        // Check admin status using the helper function
        const adminStatus = await isUserAdmin();
        console.log('Admin status result:', adminStatus);
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          toast({
            variant: "destructive",
            title: "Access Restricted",
            description: "Only administrators can access system settings.",
          });
        }
      } catch (error: any) {
        console.error("Error checking admin status:", error);
        setDebugInfo(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [toast]);

  // If still checking admin status, show loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="p-8">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription className="flex flex-col gap-4">
            <p className="text-lg font-medium">Access Denied</p>
            <p>You need administrator privileges to access system settings.</p>
            <p className="text-sm mt-2">Current role: {userRole || 'unknown'}</p>
            {debugInfo && (
              <div className="bg-gray-100 p-3 rounded text-xs text-gray-700 font-mono">
                {debugInfo}
              </div>
            )}
            <div className="flex space-x-4 mt-4">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-fit"
              >
                Return to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/');
                }}
              >
                Sign Out
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render appropriate component based on the route
  if (path === '/system/users') {
    return <UsersPage />;
  } else if (path === '/system/mobile') {
    return <MobilePage />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-5">
          <h2 className="text-xl font-semibold mb-5">System Rules</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    defaultValue="Isanda Investments Limited" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Duplicate Punch Interval</label>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="form-input w-24" 
                      defaultValue="8" 
                    />
                    <span className="ml-2 text-sm text-gray-500">minutes</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Min Overtime Early In</label>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="form-input w-24" 
                      defaultValue="10" 
                    />
                    <span className="ml-2 text-sm text-gray-500">minutes</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Min Overtime Late Out</label>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="form-input w-24" 
                      defaultValue="10" 
                    />
                    <span className="ml-2 text-sm text-gray-500">minutes</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Min Overtime Break Late In</label>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="form-input w-24" 
                      defaultValue="10" 
                    />
                    <span className="ml-2 text-sm text-gray-500">minutes</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Min Overtime Break Early Out</label>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="form-input w-24" 
                      defaultValue="10" 
                    />
                    <span className="ml-2 text-sm text-gray-500">minutes</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Allow Late-In</label>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="form-input w-24" 
                      defaultValue="10" 
                    />
                    <span className="ml-2 text-sm text-gray-500">minutes</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Allow Early-Out</label>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="form-input w-24" 
                      defaultValue="30" 
                    />
                    <span className="ml-2 text-sm text-gray-500">minutes</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">When late exceeds</label>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="form-input w-24" 
                      defaultValue="300" 
                    />
                    <span className="ml-2 text-sm text-gray-500">minutes, count as absence</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">When early-leave exceeds</label>
                  <div className="flex items-center">
                    <input 
                      type="number" 
                      className="form-input w-24" 
                      defaultValue="300" 
                    />
                    <span className="ml-2 text-sm text-gray-500">minutes, count as absence</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Missing Check-In as</label>
                  <div className="flex items-center space-x-2">
                    <select className="form-input">
                      <option>Incomplete</option>
                      <option>Absent</option>
                      <option>Late</option>
                    </select>
                    <input 
                      type="number" 
                      className="form-input w-24" 
                      defaultValue="10" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Missing Check-Out as</label>
                  <div className="flex items-center space-x-2">
                    <select className="form-input">
                      <option>Incomplete</option>
                      <option>Absent</option>
                      <option>Early Leave</option>
                    </select>
                    <input 
                      type="number" 
                      className="form-input w-24" 
                      defaultValue="60" 
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Day Change Time</label>
                  <input 
                    type="time" 
                    className="form-input" 
                    defaultValue="23:59" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Sort Column</label>
                  <select className="form-input">
                    <option>Employee Name</option>
                    <option>Employee ID</option>
                    <option>Department</option>
                    <option>Position</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">DateTime Format</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    defaultValue="dd-MM-yyyy HH:mm:ss" 
                  />
                </div>
                
                <div className="flex items-center h-5 mt-4">
                  <input
                    id="export-each-employee"
                    type="checkbox"
                    className="h-4 w-4 text-primary border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="export-each-employee" className="ml-2 text-sm text-gray-700">
                    Export Each Employee in a Page
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">WeekEnd</label>
                  <div className="grid grid-cols-7 gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <label key={day} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary border-gray-300 rounded"
                          defaultChecked={index >= 5} // Saturday and Sunday checked by default
                        />
                        <span className="ml-2 text-sm text-gray-700">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button className="btn-primary flex items-center gap-1">
                <Save size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemPage;
