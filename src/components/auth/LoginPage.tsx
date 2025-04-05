
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Lock, Mail, LogIn } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          localStorage.setItem('isLoggedIn', 'true');
          navigate('/dashboard');
        }
      }
    );

    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/dashboard');
      }
    };
    
    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const clearError = () => {
    setShowError(false);
    setErrorMessage('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoading(true);
    
    try {
      console.log(`Attempting to login with email: ${email}`);
      
      if (!email || !password) {
        setShowError(true);
        setErrorMessage("Email and password are required");
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Login error:", error);
        setShowError(true);
        setErrorMessage(error.message);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
      } else if (data.user) {
        console.log("Login successful, user:", data.user);
        
        if (rememberMe) {
          localStorage.setItem('isLoggedIn', 'true');
        }
        
        // First user is automatically administrator based on our SQL migration
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('role, active')
          .eq('id', data.user.id)
          .single();
        
        if (userProfile?.active === false) {
          await supabase.auth.signOut();
          setShowError(true);
          setErrorMessage("Your account has been deactivated. Please contact an administrator.");
          toast({
            variant: "destructive",
            title: "Account inactive",
            description: "Your account has been deactivated. Please contact an administrator.",
          });
          setLoading(false);
          return;
        }
        
        toast({
          title: "Login successful",
          description: `Welcome back! You are logged in as ${userProfile?.role || 'user'}.`,
        });
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      setShowError(true);
      setErrorMessage(error.message || "An unexpected error occurred");
      toast({
        variant: "destructive",
        title: "An unexpected error occurred",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });

      if (error) {
        setShowError(true);
        setErrorMessage(error.message);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
      }
    } catch (error: any) {
      setShowError(true);
      setErrorMessage(error.message || "An unexpected error occurred");
      toast({
        variant: "destructive",
        title: "An unexpected error occurred",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-2 text-center bg-primary text-white rounded-t-lg p-6">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 px-6">
            {showError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError();
                    }}
                    className="pl-10"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password" className="font-medium">Password</Label>
                  <a 
                    href="#" 
                    className="text-sm text-primary hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        description: "Password reset functionality is coming soon.",
                      });
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError();
                    }}
                    className="pl-10"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe" 
                  checked={rememberMe} 
                  onCheckedChange={() => setRememberMe(!rememberMe)}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full py-6 font-semibold" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn size={18} />
                    Sign In
                  </span>
                )}
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleGoogleLogin} 
                disabled={loading} 
                className="w-full" 
                type="button"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Sign in with Google
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center p-6 bg-gray-50 border-t rounded-b-lg">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-primary font-medium hover:underline">
                Register now
              </a>
            </p>
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Attendance Management System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
