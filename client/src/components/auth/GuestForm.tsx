import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface GuestFormProps {
  name: string;
  grade: string;
  errors: Record<string, string>;
  isLoading: boolean;
  onNameChange: (name: string) => void;
  onGradeChange: (grade: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToLogin: () => void;
  onSwitchToRegister: () => void;
}

const GuestForm: React.FC<GuestFormProps> = ({
  name,
  grade,
  errors,
  isLoading,
  onNameChange,
  onGradeChange,
  onSubmit,
  onSwitchToLogin,
  onSwitchToRegister
}) => {
  const grades = [
    { value: 'pre-k', label: 'Pre-K (3-4 years)' },
    { value: 'kindergarten', label: 'Kindergarten (5-6 years)' },
    { value: 'grade-1', label: 'Grade 1 (6-7 years)' },
    { value: 'grade-2', label: 'Grade 2 (7-8 years)' },
    { value: 'grade-3', label: 'Grade 3 (8-9 years)' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex rounded-xl bg-purple-100/50 p-1 space-x-1">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="flex-1 rounded-lg py-2 px-4 text-sm font-['Comic_Neue'] font-medium transition-all duration-200 text-purple-600 hover:text-purple-700"
        >
          Login 🚪
        </button>
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="flex-1 rounded-lg py-2 px-4 text-sm font-['Comic_Neue'] font-medium transition-all duration-200 text-purple-600 hover:text-purple-700"
        >
          Register 🌟
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg py-2 px-4 text-sm font-['Comic_Neue'] font-medium transition-all duration-200 bg-white text-purple-700 shadow-sm"
        >
          Guest 👋
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Name Field */}
        <div>
          <Label htmlFor="guest-name" className="text-sm font-['Comic_Neue'] font-medium text-purple-700">
            What's your name? 😊
          </Label>
          <Input
            id="guest-name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="mt-1 font-['Comic_Neue'] border-2 border-purple-200 focus:border-purple-400 rounded-xl"
            required
          />
          {errors.name && (
            <p className="text-red-500 text-xs font-['Comic_Neue'] mt-1 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.name}
            </p>
          )}
        </div>

        {/* Grade Selection */}
        <div>
          <Label htmlFor="guest-grade" className="text-sm font-['Comic_Neue'] font-medium text-purple-700">
            What grade are you in? 🎒 (Optional)
          </Label>
          <select
            id="guest-grade"
            value={grade}
            onChange={(e) => onGradeChange(e.target.value)}
            className="mt-1 w-full px-3 py-2 font-['Comic_Neue'] border-2 border-purple-200 focus:border-purple-400 rounded-xl bg-white focus:outline-none focus:ring-0"
          >
            <option value="">Select your grade (optional)</option>
            {grades.map((gradeOption) => (
              <option key={gradeOption.value} value={gradeOption.value}>
                {gradeOption.label}
              </option>
            ))}
          </select>
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200 border-2">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">ℹ️</div>
              <div className="flex-1">
                <h4 className="font-['Comic_Neue'] font-bold text-blue-700 text-sm mb-2">
                  What can you do as a guest?
                </h4>
                <ul className="text-xs font-['Comic_Neue'] text-blue-600 space-y-1">
                  <li>• Play all learning games and activities</li>
                  <li>• Track your progress locally on this device</li>
                  <li>• Learn alphabet, numbers, colors, and more!</li>
                  <li>• Access fun stories and interactive content</li>
                </ul>
                <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs font-['Comic_Neue'] text-yellow-700">
                    <span className="font-bold">Note:</span> To sync progress across devices and access advanced features, create an account later! 🌟
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-['Fredoka_One'] py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Starting...
            </div>
          ) : (
            <span className="flex items-center justify-center">
              🚀 Start Learning!
            </span>
          )}
        </Button>

        {/* Error Display */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-600 text-sm font-['Comic_Neue'] flex items-center">
              <span className="mr-2">❌</span>
              {errors.submit}
            </p>
          </div>
        )}
      </div>
    </form>
  );
};

export default GuestForm;