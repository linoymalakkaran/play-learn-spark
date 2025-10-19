import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    grade: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const grades = [
    { value: 'pre-kg', label: 'Pre-KG' },
    { value: 'kg1', label: 'KG1' },
    { value: 'kg2', label: 'KG2' },
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

  useEffect(() => {
    if (user) {
      console.log('User data in ProfilePage:', user); // Debug log
      setProfileData({
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        grade: user.profile?.grade || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation only if user wants to change password
    if (showPasswordFields) {
      if (!profileData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }

      if (!profileData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (profileData.newPassword.length < 4) {
        newErrors.newPassword = 'New password must be at least 4 characters';
      }

      if (!profileData.confirmNewPassword) {
        newErrors.confirmNewPassword = 'Please confirm your new password';
      } else if (profileData.newPassword !== profileData.confirmNewPassword) {
        newErrors.confirmNewPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsUpdating(true);
    try {
      // Prepare update data
      const updates = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        grade: profileData.grade
      };

      const result = await updateProfile(updates);

      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        
        // Clear password fields if they were used
        if (showPasswordFields) {
          setProfileData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: ''
          }));
          setShowPasswordFields(false);
        }
      } else {
        setErrors({ submit: result.message || 'Failed to update profile' });
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
            <Button onClick={() => navigate('/login')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-['Comic_Neue'] font-bold text-purple-700 flex items-center gap-2">
            <User className="w-8 h-8" />
            My Profile
          </h1>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-['Comic_Neue'] flex items-center gap-2">
              👤 Profile Settings
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            {successMessage && (
              <div className="bg-green-100 border-2 border-green-300 rounded-xl p-3 mb-4">
                <p className="text-green-700 font-['Comic_Neue'] font-bold flex items-center gap-2">
                  ✅ {successMessage}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-['Comic_Neue'] font-bold text-purple-700">
                    👤 First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`mt-1 border-2 rounded-xl font-['Comic_Neue'] ${
                      errors.firstName ? 'border-red-400' : 'border-purple-200 focus:border-purple-500'
                    }`}
                    disabled={isUpdating}
                    autoComplete="given-name"
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 font-['Comic_Neue']">
                      ❌ {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-['Comic_Neue'] font-bold text-purple-700">
                    👨‍👩‍👧‍👦 Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`mt-1 border-2 rounded-xl font-['Comic_Neue'] ${
                      errors.lastName ? 'border-red-400' : 'border-purple-200 focus:border-purple-500'
                    }`}
                    disabled={isUpdating}
                    autoComplete="family-name"
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 font-['Comic_Neue']">
                      ❌ {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-['Comic_Neue'] font-bold text-purple-700">
                  📧 Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`mt-1 border-2 rounded-xl font-['Comic_Neue'] ${
                    errors.email ? 'border-red-400' : 'border-purple-200 focus:border-purple-500'
                  }`}
                  disabled={isUpdating}
                  autoComplete="email"
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 font-['Comic_Neue']">
                    ❌ {errors.email}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="grade" className="text-sm font-['Comic_Neue'] font-bold text-purple-700">
                  🎓 Grade (Optional)
                </Label>
                <select
                  id="grade"
                  value={profileData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  className={`mt-1 w-full border-2 rounded-xl font-['Comic_Neue'] p-3 ${
                    errors.grade ? 'border-red-400' : 'border-purple-200 focus:border-purple-500'
                  }`}
                  disabled={isUpdating}
                  autoComplete="off"
                >
                  <option value="">Choose your grade...</option>
                  {grades.map((grade) => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </select>
                {errors.grade && (
                  <p className="mt-1 text-sm text-red-600 font-['Comic_Neue']">
                    ❌ {errors.grade}
                  </p>
                )}
              </div>

              {/* Password Change Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-['Comic_Neue'] font-bold text-purple-700">
                    🔐 Change Password
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                  >
                    {showPasswordFields ? 'Cancel' : 'Change Password'}
                  </Button>
                </div>

                {showPasswordFields && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword" className="text-sm font-['Comic_Neue'] font-bold text-purple-700">
                        🔑 Current Password
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={profileData.currentPassword}
                          onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                          className={`pr-12 border-2 rounded-xl font-['Comic_Neue'] ${
                            errors.currentPassword ? 'border-red-400' : 'border-purple-200 focus:border-purple-500'
                          }`}
                          disabled={isUpdating}
                          autoComplete="new-password"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600 font-['Comic_Neue']">
                          ❌ {errors.currentPassword}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="newPassword" className="text-sm font-['Comic_Neue'] font-bold text-purple-700">
                        🔐 New Password
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={profileData.newPassword}
                          onChange={(e) => handleInputChange('newPassword', e.target.value)}
                          className={`pr-12 border-2 rounded-xl font-['Comic_Neue'] ${
                            errors.newPassword ? 'border-red-400' : 'border-purple-200 focus:border-purple-500'
                          }`}
                          disabled={isUpdating}
                          autoComplete="new-password"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600 font-['Comic_Neue']">
                          ❌ {errors.newPassword}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmNewPassword" className="text-sm font-['Comic_Neue'] font-bold text-purple-700">
                        🔑 Confirm New Password
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="confirmNewPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={profileData.confirmNewPassword}
                          onChange={(e) => handleInputChange('confirmNewPassword', e.target.value)}
                          className={`pr-12 border-2 rounded-xl font-['Comic_Neue'] ${
                            errors.confirmNewPassword ? 'border-red-400' : 'border-purple-200 focus:border-purple-500'
                          }`}
                          disabled={isUpdating}
                          autoComplete="new-password"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.confirmNewPassword && (
                        <p className="mt-1 text-sm text-red-600 font-['Comic_Neue']">
                          ❌ {errors.confirmNewPassword}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {errors.submit && (
                <div className="bg-red-100 border-2 border-red-300 rounded-xl p-3">
                  <p className="text-red-700 font-['Comic_Neue'] font-bold">
                    😕 {errors.submit}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-['Comic_Neue'] font-bold py-3"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating Profile...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" />
                    Save Changes
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;