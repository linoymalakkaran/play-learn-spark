import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface LoginFormProps {
  email: string;
  password: string;
  rememberMe: boolean;
  errors: Record<string, string>;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onRememberMeChange: (checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  rememberMe,
  errors,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onSubmit,
  onForgotPassword,
  onSwitchToRegister
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm font-['Comic_Neue'] font-bold text-purple-700 flex items-center gap-2">
            📧 Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
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
          <Label htmlFor="password" className="text-sm font-['Comic_Neue'] font-bold text-purple-700 flex items-center gap-2">
            🔒 Password
          </Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Enter your secret password"
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
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 font-['Comic_Neue'] flex items-center gap-1">
              ❌ {errors.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => onRememberMeChange(!!checked)}
              disabled={isLoading}
              className="border-purple-300 data-[state=checked]:bg-purple-500"
            />
            <Label htmlFor="rememberMe" className="text-sm text-purple-600 font-['Comic_Neue'] font-bold">
              🧠 Remember me
            </Label>
          </div>
          
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-800 font-['Comic_Neue'] font-bold hover:underline"
            disabled={isLoading}
          >
            🤔 Forgot password?
          </button>
        </div>
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
        className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-['Comic_Neue'] font-bold py-4 px-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            🔄 Signing in...
          </div>
        ) : (
          '🚀 Sign In & Start Learning!'
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-purple-600 font-['Comic_Neue']">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-800 font-['Comic_Neue'] font-bold hover:underline"
            disabled={isLoading}
          >
            🌟 Create one now!
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;