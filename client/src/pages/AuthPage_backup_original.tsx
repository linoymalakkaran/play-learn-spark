import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthPageProps {
  mode?: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const { login, register, isLoading, isAuthenticated } = useAuth();
  
  const [authMode, setAuthMode] = useState(mode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Registration-specific validations
    if (authMode === 'register') {
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }

      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }

      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      if (authMode === 'login') {
        const result = await login(formData.email, formData.password, rememberMe);
        
        if (result.success) {
          // Handle remember me
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', formData.email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
          
          setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
          
          // Redirect after short delay
          setTimeout(() => {
            navigate('/');
          }, 1000);
        } else {
          if (result.message?.toLowerCase().includes('user not found') || 
              result.message?.toLowerCase().includes('email not found')) {
            setMessage({ 
              type: 'error', 
              text: 'No account found with this email address. Please check your email or register for a new account.' 
            });
          } else if (result.message?.toLowerCase().includes('password')) {
            setMessage({ 
              type: 'error', 
              text: 'Incorrect password. Please try again or use the forgot password option.' 
            });
          } else {
            setMessage({ type: 'error', text: result.message || 'Login failed. Please try again.' });
          }
        }
      } else {
        const result = await register({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: 'parent'
        });
        
        if (result.success) {
          setMessage({ type: 'success', text: 'Registration successful! Welcome to Play Learn Spark!' });
          
          // Handle remember me
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', formData.email);
          }
          
          // Redirect after short delay
          setTimeout(() => {
            navigate('/');
          }, 1500);
        } else {
          if (result.message?.toLowerCase().includes('already exists') || 
              result.message?.toLowerCase().includes('already registered')) {
            setMessage({ 
              type: 'error', 
              text: 'An account with this email address already exists. Please use the login form or try a different email.' 
            });
          } else if (result.message?.toLowerCase().includes('username')) {
            setMessage({ 
              type: 'error', 
              text: 'This username is already taken. Please choose a different username.' 
            });
          } else {
            setMessage({ type: 'error', text: result.message || 'Registration failed. Please try again.' });
          }
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    }
  };

  const switchMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    setMessage(null);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {authMode === 'login' ? 'Welcome Back!' : 'Join Play Learn Spark'}
          </CardTitle>
          <CardDescription>
            {authMode === 'login' 
              ? 'Sign in to continue your learning journey' 
              : 'Create your account to get started'
            }
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {message && (
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                {message.type === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            {/* Registration Fields */}
            {authMode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-500">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? 'border-red-500' : ''}
                      disabled={isLoading}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="johndoe123"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.username ? 'border-red-500' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-red-500">{errors.username}</p>
                  )}
                </div>
              </>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field (Register only) */}
            {authMode === 'register' && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              
              {authMode === 'login' && (
                <Link
                  to="/forgot-password"
                  className="text-sm text-purple-600 hover:text-purple-500"
                >
                  Forgot password?
                </Link>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {authMode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                authMode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>

            {/* Mode Switch */}
            <Separator />
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {authMode === 'login' 
                  ? "Don't have an account? " 
                  : "Already have an account? "
                }
                <Button
                  type="button"
                  variant="link"
                  className="p-0 text-purple-600 hover:text-purple-500"
                  onClick={switchMode}
                  disabled={isLoading}
                >
                  {authMode === 'login' ? 'Sign up here' : 'Sign in here'}
                </Button>
              </p>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default AuthPage;