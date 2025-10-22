import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../contexts/AuthContextEnhanced';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Loader2, User, Users, GraduationCap, Shield, Eye, EyeOff } from 'lucide-react';

const registrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  role: z.enum(['parent', 'child', 'educator']),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  age: z.number().min(1).max(150).optional(),
  grade: z.string().max(20).optional(),
  language: z.enum(['en', 'ar', 'ml', 'es', 'fr']).optional(),
  invitedBy: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const roleOptions = [
  {
    value: 'parent',
    label: 'Parent/Guardian',
    icon: Users,
    description: 'Manage your children\'s learning journey',
    features: ['Track child progress', 'Set learning goals', 'Communicate with teachers', 'Access family analytics']
  },
  {
    value: 'child',
    label: 'Student',
    icon: User,
    description: 'Learn and grow with fun activities',
    features: ['Interactive learning', 'Achievement badges', 'Progress tracking', 'Safe environment']
  },
  {
    value: 'educator',
    label: 'Teacher/Educator',
    icon: GraduationCap,
    description: 'Create and manage educational content',
    features: ['Create activities', 'Manage classes', 'Student analytics', 'Assignment tools']
  }
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية (Arabic)' },
  { value: 'ml', label: 'മലയാളം (Malayalam)' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'fr', label: 'Français (French)' }
];

export const EnhancedRegistrationForm: React.FC = () => {
  const { register: registerUser, isLoading, error, clearError } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('parent');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      role: 'parent',
      language: 'en'
    },
    mode: 'onChange'
  });

  const watchedRole = watch('role');

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      clearError();
      await registerUser({
        email: data.email,
        password: data.password,
        username: data.username,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        grade: data.grade,
        language: data.language || 'en',
        invitedBy: data.invitedBy
      });
    } catch (err: any) {
      console.error('Registration failed:', err);
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setValue('role', role as any);
    trigger('role');
  };

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['email', 'password', 'confirmPassword', 'username'] 
      : ['firstName', 'lastName', 'role'];
    
    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const selectedRoleData = roleOptions.find(option => option.value === selectedRole);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-900">
            Join Play Learn Spark
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Create your account and start your learning journey
          </CardDescription>
          <div className="flex justify-center space-x-2 mt-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-center">Account Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    {...register('username')}
                    className={errors.username ? 'border-red-500' : ''}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      {...register('password')}
                      className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      {...register('confirmPassword')}
                      className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="w-full"
                  disabled={!watch('email') || !watch('password') || !watch('confirmPassword') || !watch('username')}
                >
                  Continue
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-center">Personal Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      {...register('firstName')}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      {...register('lastName')}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age (Optional)</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Age"
                      min="1"
                      max="150"
                      {...register('age', { valueAsNumber: true })}
                      className={errors.age ? 'border-red-500' : ''}
                    />
                    {errors.age && (
                      <p className="text-sm text-red-600">{errors.age.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade (Optional)</Label>
                    <Input
                      id="grade"
                      type="text"
                      placeholder="Grade level"
                      {...register('grade')}
                      className={errors.grade ? 'border-red-500' : ''}
                    />
                    {errors.grade && (
                      <p className="text-sm text-red-600">{errors.grade.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select defaultValue="en" onValueChange={(value) => setValue('language', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-3">
                  <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="flex-1"
                    disabled={!watch('firstName') || !watch('lastName')}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-center">Choose Your Role</h3>
                
                <div className="space-y-4">
                  {roleOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedRole === option.value;
                    
                    return (
                      <div
                        key={option.value}
                        onClick={() => handleRoleSelect(option.value)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`p-2 rounded-lg ${
                            isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Icon size={24} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-lg">{option.label}</h4>
                              {isSelected && <Badge variant="default">Selected</Badge>}
                            </div>
                            <p className="text-gray-600 mt-1">{option.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {option.features.map((feature, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      {...register('acceptTerms')}
                      className="mt-1"
                    />
                    <Label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                      I agree to the{' '}
                      <a href="/terms" className="text-blue-600 hover:underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                  {errors.acceptTerms && (
                    <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !isValid}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedRegistrationForm;