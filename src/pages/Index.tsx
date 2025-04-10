import React, { useEffect, useState } from 'react';
import LoginPage from '../components/auth/LoginPage';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  // Check if browser storage is available
  const checkStorageAvailability = () => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  };
  
  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;
    
    const checkSession = async () => {
      if (!mounted) return;
      
      setIsLoading(true);
      try {
        // Check storage availability first
        if (!checkStorageAvailability()) {
          throw new Error('Browser storage is not available. Please enable cookies and storage access for this site.');
        }

        if (!supabase) {
          throw new Error('Supabase client is not properly configured');
        }

        const { data, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('Error checking session:', error);
          
          // If we haven't exceeded max retries, try again
          if (retryCount < MAX_RETRIES) {
            setRetryCount(prev => prev + 1);
            retryTimeout = setTimeout(checkSession, RETRY_DELAY);
            return;
          }
          
          setError('Failed to check login status. Please try refreshing the page.');
          toast.error('Authentication error: ' + error.message);
          return;
        }
        
        // Reset retry count on success
        setRetryCount(0);
        
        if (data?.session) {
          console.log('User is already logged in, redirecting to dashboard');
          try {
            localStorage.setItem('isLoggedIn', 'true');
          } catch (storageError) {
            console.error('Error setting login state:', storageError);
            // Try sessionStorage as fallback
            try {
              sessionStorage.setItem('isLoggedIn', 'true');
            } catch (sessionError) {
              console.error('Error setting session storage:', sessionError);
            }
          }
          navigate('/dashboard');
        }
      } catch (err: any) {
        if (!mounted) return;
        console.error('Unexpected error checking session:', err);
        
        // If we haven't exceeded max retries, try again
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          retryTimeout = setTimeout(checkSession, RETRY_DELAY);
          return;
        }
        
        setError(err.message || 'An unexpected error occurred. Please try refreshing the page.');
        toast.error('Authentication error: ' + (err.message || 'Unknown error'));
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Small delay before first check to ensure DOM is ready
    setTimeout(checkSession, 100);
    
    return () => {
      mounted = false;
      clearTimeout(retryTimeout);
    };
  }, [navigate, retryCount]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {retryCount > 0 ? `Retrying... (Attempt ${retryCount}/${MAX_RETRIES})` : 'Loading...'}
          </p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              If loading persists, try clearing your browser cache or using incognito mode.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-gray-500 mb-6 text-sm">
            {retryCount >= MAX_RETRIES 
              ? 'Maximum retry attempts reached. Please try the following:'
              : 'Try the following steps:'}
          </p>
          <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
            <li>• Clear your browser cache and cookies</li>
            <li>• Try using incognito/private browsing mode</li>
            <li>• Check if third-party cookies are enabled</li>
            <li>• Ensure your browser is up to date</li>
          </ul>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload page
            </button>
            <button 
              onClick={() => {
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                } catch (e) {
                  window.location.reload();
                }
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear storage and reload
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <LoginPage />;
};

export default Index;
