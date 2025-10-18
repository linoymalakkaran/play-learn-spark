import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface GuestPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuestPopup: React.FC<GuestPopupProps> = ({ isOpen, onClose }) => {
  const [guestData, setGuestData] = useState({
    name: '',
    grade: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { loginAsGuest } = useAuth();
  const navigate = useNavigate();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!guestData.name.trim()) newErrors.name = 'Name is required';
    else if (guestData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!guestData.grade) newErrors.grade = 'Please select your grade';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginAsGuest(guestData.name, guestData.grade);
      
      if (result.success) {
        // Close popup and redirect to home
        onClose();
        navigate('/', { replace: true });
      } else {
        setErrors({ submit: result.message || 'Failed to start as guest. Please try again.' });
      }
    } catch (error: any) {
      setErrors({ 
        submit: error.message || 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setGuestData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    // Button click handler - can be used for additional logic if needed
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex min-h-screen">
      <div className="flex items-center justify-center w-full p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
          {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-['Comic_Neue'] font-bold text-purple-700 flex items-center gap-2">
            🌟 Start as Guest
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="guestName" className="text-sm font-['Comic_Neue'] font-bold text-purple-700 flex items-center gap-2">
              👤 What's your name?
            </Label>
            <Input
              id="guestName"
              type="text"
              value={guestData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your name"
              className={`mt-1 border-2 rounded-xl font-['Comic_Neue'] ${
                errors.name ? 'border-red-400' : 'border-purple-200 focus:border-purple-500'
              }`}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 font-['Comic_Neue'] flex items-center gap-1">
                ❌ {errors.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="guestGrade" className="text-sm font-['Comic_Neue'] font-bold text-purple-700 flex items-center gap-2">
              🎓 Select Your Grade
            </Label>
            <select
              id="guestGrade"
              value={guestData.grade}
              onChange={(e) => handleInputChange('grade', e.target.value)}
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

          {errors.submit && (
            <div className="bg-red-100 border-2 border-red-300 rounded-xl p-3">
              <p className="text-sm text-red-700 font-['Comic_Neue'] font-bold flex items-center gap-2">
                😕 {errors.submit}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 font-['Comic_Neue'] font-bold"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleButtonClick}
              className="flex-1 bg-gradient-to-r from-green-500 to-purple-500 hover:from-green-600 hover:to-purple-600 text-white font-['Comic_Neue'] font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Starting...
                </div>
              ) : (
                '🚀 Start Learning!'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 font-['Comic_Neue']">
            Your progress will be saved locally. Create an account to sync across devices!
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default GuestPopup;