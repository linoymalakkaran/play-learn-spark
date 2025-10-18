import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface RegisterFormProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    grade: string;
  };
  rememberMe: boolean;
  errors: Record<string, string>;
  isLoading: boolean;
  onFormDataChange: (field: string, value: string) => void;
  onRememberMeChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  formData,
  rememberMe,
  errors,
  isLoading,
  onFormDataChange,
  onRememberMeChange,
  onSubmit,
  onSwitchToLogin
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation helpers - simplified
  const getPasswordStrength = (password: string) => {
    if (password.length >= 4) return 'Good';
    return 'Too Short';
  };

  const getPasswordStrengthColor = (password: string) => {
    if (password.length >= 4) return 'text-green-600';
    return 'text-red-600';
  };

  const grades = [
    { value: '1', label: 'Grade 1' },
    { value: '2', label: 'Grade 2' },
    { value: '3', label: 'Grade 3' },
    { value: '4', label: 'Grade 4' },
    { value: '5', label: 'Grade 5' },
    { value: '6', label: 'Grade 6' },
    { value: '7', label: 'Grade 7' },
    { value: '8', label: 'Grade 8' },
    { value: '9', label: 'Grade 9' },
    { value: '10', label: 'Grade 10' },
    { value: '11', label: 'Grade 11' },
    { value: '12', label: 'Grade 12' }
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-sm font-['Comic_Neue'] font-bold text-purple-700 flex items-center gap-2">
            👤 First Name
          </Label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => onFormDataChange('firstName', e.target.value)}
            placeholder="Your first name"
            className={`mt-1 border-2 rounded-xl font-['Comic_Neue'] ${
              errors.firstName ? 'border-red-400' : 'border-purple-200 focus:border-purple-500'
            }`}
            disabled={isLoading}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600 font-['Comic_Neue'] flex items-center gap-1">
              ❌ {errors.firstName}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="lastName" className="text-sm font-['Comic_Neue'] font-bold text-purple-700 flex items-center gap-2">
            👨‍👩‍👧‍👦 Last Name
          </Label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => onFormDataChange('lastName', e.target.value)}
            placeholder="Your last name"
            className={`mt-1 border-2 rounded-xl font-['Comic_Neue'] ${
              errors.lastName ? 'border-red-400' : 'border-purple-200 focus:border-purple-500'
            }`}
            disabled={isLoading}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600 font-['Comic_Neue'] flex items-center gap-1">
              ❌ {errors.lastName}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="text-sm font-['Comic_Neue'] font-bold text-purple-700 flex items-center gap-2">
          📧 Email Address (This will be your username)
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onFormDataChange('email', e.target.value)}
          placeholder="your-email@example.com"
          className={`mt-1 border-2 rounded-xl font-['Comic_Neue'] ${
            errors.email ? 'border-red-400' : 'border-purple-200 focus:border-purple-500'
          }`}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 font-['Comic_Neue'] flex items-center gap-1">
            ❌ {errors.email}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="grade" className="text-sm font-['Comic_Neue'] font-bold text-purple-700 flex items-center gap-2">
          � Select Your Grade
        </Label>
        <select
          id="grade"
          value={formData.grade}
          onChange={(e) => onFormDataChange('grade', e.target.value)}
          className={`mt-1 w-full border-2 rounded-xl font-['Comic_Neue'] p-3 ${
            errors.grade ? 'border-red-400' : 'border-purple-200 focus:border-purple-500'
          }`}
          disabled={isLoading}
        >
          <option value="">Choose your grade...</option>
          {grades.map((grade) => (
            <option key={grade.value} value={grade.value}>
              {grade.label}
            </option>
          ))}
        </select>
        {errors.grade && (
          <p className="mt-1 text-sm text-red-600 font-['Comic_Neue'] flex items-center gap-1">
            ❌ {errors.grade}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password" className="text-sm font-['Comic_Neue'] font-bold text-purple-700 flex items-center gap-2">
          🔐 Create Password (minimum 4 characters)
        </Label>
        <div className="relative mt-1">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => onFormDataChange('password', e.target.value)}
            placeholder="Create your password"
            className={`pr-12 border-2 rounded-xl font-['Comic_Neue'] ${
              errors.password ? 'border-red-400' : 'border-purple-200 focus:border-purple-500'
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-600 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        
        {formData.password && (
          <div className="mt-2">
            <p className={`text-sm font-['Comic_Neue'] font-bold ${getPasswordStrengthColor(formData.password)}`}>
              🔒 Password: {getPasswordStrength(formData.password)}
            </p>
          </div>
        )}
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 font-['Comic_Neue'] flex items-center gap-1">
            ❌ {errors.password}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="text-sm font-['Comic_Neue'] font-bold text-purple-700 flex items-center gap-2">
          🔑 Confirm Password
        </Label>
        <div className="relative mt-1">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => onFormDataChange('confirmPassword', e.target.value)}
            placeholder="Type your password again"
            className={`pr-12 border-2 rounded-xl font-['Comic_Neue'] ${
              errors.confirmPassword ? 'border-red-400' : 'border-purple-200 focus:border-purple-500'
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-600 transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {formData.confirmPassword && formData.password === formData.confirmPassword && (
          <p className="mt-1 text-sm text-green-600 font-['Comic_Neue'] font-bold flex items-center gap-1">
            ✅ Passwords match perfectly!
          </p>
        )}
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600 font-['Comic_Neue'] flex items-center gap-1">
            ❌ {errors.confirmPassword}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={(checked) => onRememberMeChange(!!checked)}
          disabled={isLoading}
          className="border-purple-300 data-[state=checked]:bg-purple-500"
        />
        <Label htmlFor="rememberMe" className="text-sm text-purple-600 font-['Comic_Neue'] font-bold">
          🧠 Remember me after registration
        </Label>
      </div>

      {errors.submit && (
        <div className="bg-red-100 border-2 border-red-300 rounded-xl p-3">
          <p className="text-sm text-red-700 font-['Comic_Neue'] font-bold flex items-center gap-2">
            😕 {errors.submit}
          </p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white font-['Comic_Neue'] font-bold py-4 px-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            🚀 Creating your account...
          </div>
        ) : (
          '🌟 Create My Account & Start Learning!'
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-purple-600 font-['Comic_Neue']">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-800 font-['Comic_Neue'] font-bold hover:underline"
            disabled={isLoading}
          >
            🔑 Sign in here!
          </button>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;