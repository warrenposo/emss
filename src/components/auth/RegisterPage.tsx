
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const clearError = () => {
    setShowError(false);
    setErrorMessage('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Basic validation
    if (password !== confirmPassword) {
      setShowError(true);
      setErrorMessage("Passwords don't match");
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please check that your passwords match.",
      });
      return;
    }

    if (password.length < 6) {
      setShowError(true);
      setErrorMessage("Password must be at least 6 characters");
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log("Registering new user with email:", email);
      
      // Register new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (authError) {
        console.error("Registration error:", authError);
        setShowError(true);
        setErrorMessage(authError.message);
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: authError.message,
        });
        return;
      }
      
      console.log("Registration successful:", authData);
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully. You can now log in.",
      });

      // Auto-login after registration
      if (authData?.user) {
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/dashboard');
      } else {
        // If email confirmation is required
        toast({
          description: "Please check your email to confirm your account before logging in.",
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error("Unexpected registration error:", error);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Register</CardTitle>
          <CardDescription className="text-center">
            Create a new account to access the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    clearError();
                  }}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    clearError();
                  }}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                required
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                required
                autoComplete="new-password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearError();
                }}
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Creating account..." : "Register"}
            </Button>
            <div className="text-sm text-gray-500 mt-2 text-center">
              Already have an account? <a href="/" className="text-blue-600 hover:underline">Login</a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
