
import React, { useEffect, useState } from 'react';
import LoginPage from '../components/auth/LoginPage';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setError('Failed to check login status');
          toast.error('Authentication error: ' + error.message);
          return;
        }
        
        if (data.session) {
          console.log('User is already logged in, redirecting to dashboard');
          localStorage.setItem('isLoggedIn', 'true');
          navigate('/dashboard');
        }
      } catch (err: any) {
        console.error('Unexpected error checking session:', err);
        setError('An unexpected error occurred');
        toast.error('Authentication error: ' + (err.message || 'Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
          <p className="text-gray-500 mb-6 text-sm">Try refreshing the page or check your internet connection.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }

  return <LoginPage />;
};

export default Index;
