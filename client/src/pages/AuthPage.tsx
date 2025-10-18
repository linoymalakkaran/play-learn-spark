import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import GuestForm from '@/components/auth/GuestForm';

interface AuthPageProps {
  mode?: 'login' | 'register' | 'guest';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode = 'login' }) => {
  const [currentMode, setCurrentMode] = useState<'login' | 'register' | 'guest'>(mode);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  // Guest form state
  const [guestData, setGuestData] = useState({
    name: '',
    grade: ''
  });

  const { login, register, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, rememberMe);
      
      // Redirect to intended page or profile
      const from = (location.state as any)?.from?.pathname || '/profile';
      navigate(from, { replace: true });
    } catch (error: any) {
      setErrors({ 
        submit: error.message || 'Login failed. Please check your credentials.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!registerData.firstName) newErrors.firstName = 'First name is required';
    if (!registerData.lastName) newErrors.lastName = 'Last name is required';
    if (!registerData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(registerData.email)) newErrors.email = 'Please enter a valid email';
    if (!registerData.username) newErrors.username = 'Username is required';
    else if (registerData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!registerData.password) newErrors.password = 'Password is required';
    else if (!validatePassword(registerData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }
    if (!registerData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        username: registerData.username,
        role: 'child' // Default role
      });
      
      // Redirect to profile after successful registration
      navigate('/profile', { replace: true });
    } catch (error: any) {
      setErrors({ 
        submit: error.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!guestData.name.trim()) newErrors.name = 'Name is required';
    else if (guestData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginAsGuest(guestData.name, guestData.grade);
      
      if (result.success) {
        // Redirect to profile after successful guest login
        navigate('/profile', { replace: true });
      } else {
        setErrors({ 
          submit: result.message || 'Failed to start guest session. Please try again.' 
        });
      }
    } catch (error: any) {
      setErrors({ 
        submit: error.message || 'Failed to start guest session. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleRegisterDataChange = (field: string, value: string) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fun Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">🌟</div>
        <div className="absolute top-20 right-20 text-5xl opacity-20 animate-pulse">🚀</div>
        <div className="absolute bottom-20 left-20 text-4xl opacity-20 animate-bounce delay-300">🎯</div>
        <div className="absolute bottom-10 right-10 text-5xl opacity-20 animate-pulse delay-500">✨</div>
        <div className="absolute top-1/2 left-1/4 text-3xl opacity-20 animate-bounce delay-700">🦁</div>
        <div className="absolute top-1/3 right-1/3 text-4xl opacity-20 animate-pulse delay-200">🌈</div>
      </div>
      
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-2xl relative z-10 rounded-3xl">
        <CardContent className="p-8">
          {/* Header with Logo */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="text-4xl animate-pulse">🎓</div>
              <h1 className="text-2xl font-['Fredoka_One'] bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Play Learn Spark
              </h1>
            </div>
            <div className="text-3xl mb-2">
              {currentMode === 'login' ? '🚪' : currentMode === 'register' ? '🌟' : '👋'}
            </div>
            <h2 className="text-xl font-['Comic_Neue'] font-bold text-purple-700">
              {currentMode === 'login' ? 'Welcome Back!' : 
               currentMode === 'register' ? 'Join the Adventure!' : 
               'Start Learning Now!'}
            </h2>
            <p className="text-sm font-['Comic_Neue'] text-purple-600 mt-2">
              {currentMode === 'login' 
                ? 'Sign in to continue your learning journey! 🎯' 
                : currentMode === 'register'
                ? 'Create your account to start learning! 🚀'
                : 'Enter your name to begin exploring! No sign-up needed! 🎮'
              }
            </p>
          </div>

          {currentMode === 'login' ? (
            <LoginForm
              email={email}
              password={password}
              rememberMe={rememberMe}
              errors={errors}
              isLoading={isLoading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onRememberMeChange={setRememberMe}
              onSubmit={handleLogin}
              onForgotPassword={handleForgotPassword}
              onSwitchToRegister={() => setCurrentMode('register')}
            />
          ) : currentMode === 'register' ? (
            <RegisterForm
              formData={registerData}
              rememberMe={rememberMe}
              errors={errors}
              isLoading={isLoading}
              onFormDataChange={handleRegisterDataChange}
              onRememberMeChange={setRememberMe}
              onSubmit={handleRegister}
              onSwitchToLogin={() => setCurrentMode('login')}
            />
          ) : (
            <GuestForm
              name={guestData.name}
              grade={guestData.grade}
              errors={errors}
              isLoading={isLoading}
              onNameChange={(name) => setGuestData(prev => ({ ...prev, name }))}
              onGradeChange={(grade) => setGuestData(prev => ({ ...prev, grade }))}
              onSubmit={handleGuestLogin}
              onSwitchToLogin={() => setCurrentMode('login')}
              onSwitchToRegister={() => setCurrentMode('register')}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;