import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../contexts/AuthContextEnhanced';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  User, 
  Users, 
  GraduationCap, 
  Shield,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Coffee
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

type LoginFormData = z.infer<typeof loginSchema>;

const roleIcons = {
  admin: Shield,
  educator: GraduationCap,
  parent: Users,
  child: User,
  guest: Coffee
};

const roleColors = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  educator: 'bg-blue-100 text-blue-800 border-blue-200',
  parent: 'bg-green-100 text-green-800 border-green-200',
  child: 'bg-purple-100 text-purple-800 border-purple-200',
  guest: 'bg-gray-100 text-gray-800 border-gray-200'
};

export const EnhancedLoginForm: React.FC = () => {
  const { login, loginAsGuest, isLoading, error, clearError, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'login' | 'guest'>('login');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false
    },
    mode: 'onChange'
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data.email, data.password, data.rememberMe);
      // Navigation will be handled by the auth context
    } catch (err: any) {
      console.error('Login failed:', err);
    }
  };

  const handleGuestLogin = async () => {
    try {
      clearError();
      await loginAsGuest();
      // Navigation will be handled by the auth context
    } catch (err: any) {
      console.error('Guest login failed:', err);
    }
  };

  const handleModeChange = (mode: 'login' | 'guest') => {
    setLoginMode(mode);
    reset();
    clearError();
  };

  // If user is already logged in, show welcome message
  if (user) {
    const RoleIcon = roleIcons[user.role as keyof typeof roleIcons] || User;
    const roleColorClass = roleColors[user.role as keyof typeof roleColors] || roleColors.guest;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <RoleIcon className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome back!
            </CardTitle>
            <CardDescription>
              You are already logged in as <strong>{user.firstName} {user.lastName}</strong>
            </CardDescription>
            <Badge className={`${roleColorClass} border`}>
              {user.role.toUpperCase()}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => {/* logout logic */}} 
              variant="outline" 
              className="w-full"
            >
              Switch Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Sign in to continue your learning journey
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={loginMode} onValueChange={handleModeChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Sign In</span>
              </TabsTrigger>
              <TabsTrigger value="guest" className="flex items-center space-x-2">
                <Coffee className="w-4 h-4" />
                <span>Guest Access</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      {...register('rememberMe')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || !isValid}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="guest" className="space-y-4 mt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                  <Coffee className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Try as Guest
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Explore our platform with limited access. No registration required!
                  </p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-800 mb-2">Guest Features:</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Browse public learning activities</li>
                    <li>• View sample content and demos</li>
                    <li>• Explore the platform interface</li>
                    <li>• Access basic learning tools</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Guest access has limited features. 
                    Create an account for full access to all learning tools and progress tracking.
                  </p>
                </div>

                <Button 
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Accessing as Guest...
                    </>
                  ) : (
                    <>
                      <Coffee className="mr-2 h-4 w-4" />
                      Continue as Guest
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Don't have an account?
            </p>
            <Link to="/register">
              <Button variant="outline" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Create New Account
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedLoginForm;