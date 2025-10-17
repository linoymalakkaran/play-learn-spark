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
    username: string;
    password: string;
    confirmPassword: string;
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

  // Password validation helpers
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return { text: 'Very Weak', color: 'text-red-600', bg: 'bg-red-100' };
      case 2:
        return { text: 'Weak', color: 'text-orange-600', bg: 'bg-orange-100' };
      case 3:
        return { text: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 4:
        return { text: 'Strong', color: 'text-green-600', bg: 'bg-green-100' };
      case 5:
        return { text: 'Very Strong', color: 'text-green-700', bg: 'bg-green-200' };
      default:
        return { text: '', color: '', bg: '' };
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordStrengthInfo = getPasswordStrengthText(passwordStrength);

  const passwordValidation = [
    { test: formData.password.length >= 8, text: 'At least 8 characters' },
    { test: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { test: /[a-z]/.test(formData.password), text: 'One lowercase letter' },
    { test: /[0-9]/.test(formData.password), text: 'One number' },
    { test: /[^A-Za-z0-9]/.test(formData.password), text: 'One special character' }
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
          📧 Email Address
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
        <Label htmlFor="username" className="text-sm font-['Comic_Neue'] font-bold text-purple-700 flex items-center gap-2">
          🏷️ Username
        </Label>
        <Input
          id="username"
          type="text"
          value={formData.username}
          onChange={(e) => onFormDataChange('username', e.target.value)}
          placeholder="Choose a cool username"
          className={`mt-1 border-2 rounded-xl font-['Comic_Neue'] ${
            errors.username ? 'border-red-400' : 'border-purple-200 focus:border-purple-500'
          }`}
          disabled={isLoading}
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-600 font-['Comic_Neue'] flex items-center gap-1">
            ❌ {errors.username}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password" className="text-sm font-['Comic_Neue'] font-bold text-purple-700 flex items-center gap-2">
          🔐 Create Password
        </Label>
        <div className="relative mt-1">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => onFormDataChange('password', e.target.value)}
            placeholder="Create a strong password"
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
          <div className="mt-3 space-y-2">
            <div className={`text-xs px-3 py-2 rounded-xl font-['Comic_Neue'] font-bold ${passwordStrengthInfo.bg} ${passwordStrengthInfo.color}`}>
              🔒 Password Strength: {passwordStrengthInfo.text}
            </div>
            <div className="bg-purple-50 rounded-xl p-3 space-y-1">
              <p className="text-xs font-['Comic_Neue'] font-bold text-purple-700 mb-2">✅ Password Checklist:</p>
              {passwordValidation.map((rule, index) => (
                <div key={index} className="flex items-center text-xs font-['Comic_Neue']">
                  {rule.test ? (
                    <div className="text-green-600 mr-2">✅</div>
                  ) : (
                    <div className="text-gray-400 mr-2">⚪</div>
                  )}
                  <span className={rule.test ? 'text-green-600 font-bold' : 'text-gray-500'}>
                    {rule.text}
                  </span>
                </div>
              ))}
            </div>
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