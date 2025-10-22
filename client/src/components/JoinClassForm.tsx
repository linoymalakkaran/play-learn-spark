import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Info,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { classService, ClassData, JoinClassData } from '../services/classService';

// Validation schema for join code
const joinCodeSchema = z.object({
  joinCode: z.string()
    .min(6, 'Join code must be at least 6 characters')
    .max(20, 'Join code must be less than 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Join code should only contain uppercase letters and numbers')
});

type JoinFormData = z.infer<typeof joinCodeSchema>;

interface JoinClassFormProps {
  onSuccess: (classData: ClassData) => void;
  onCancel: () => void;
  initialJoinCode?: string;
}

type JoinStep = 'input' | 'preview' | 'joining' | 'success' | 'error';

const JoinClassForm: React.FC<JoinClassFormProps> = ({
  onSuccess,
  onCancel,
  initialJoinCode = ''
}) => {
  const [currentStep, setCurrentStep] = useState<JoinStep>('input');
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const { 
    control, 
    handleSubmit, 
    watch, 
    setValue,
    formState: { errors, isValid } 
  } = useForm<JoinFormData>({
    resolver: zodResolver(joinCodeSchema),
    mode: 'onChange',
    defaultValues: {
      joinCode: initialJoinCode.toUpperCase()
    }
  });

  const watchedJoinCode = watch('joinCode');

  // Auto-format join code to uppercase
  useEffect(() => {
    if (watchedJoinCode) {
      const formattedCode = watchedJoinCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (formattedCode !== watchedJoinCode) {
        setValue('joinCode', formattedCode);
      }
    }
  }, [watchedJoinCode, setValue]);

  // Preview class when valid join code is entered
  const previewClass = async (data: JoinFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const classInfo = await classService.previewClass(data.joinCode);
      setClassData(classInfo);
      setCurrentStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to preview class');
      setCurrentStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Join the class
  const joinClass = async () => {
    if (!classData) return;
    
    setCurrentStep('joining');
    setIsLoading(true);
    
    try {
      const joinedClass = await classService.joinClass({ joinCode: classData.joinCode });
      setClassData(joinedClass);
      setCurrentStep('success');
      
      // Call success callback after a short delay to show success animation
      setTimeout(() => {
        onSuccess(joinedClass);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join class');
      setCurrentStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy join code to clipboard
  const copyJoinCode = async () => {
    if (watchedJoinCode) {
      try {
        await navigator.clipboard.writeText(watchedJoinCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (err) {
        console.error('Failed to copy join code:', err);
      }
    }
  };

  // Reset form to input step
  const resetForm = () => {
    setCurrentStep('input');
    setClassData(null);
    setError('');
    setIsLoading(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'input':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="relative mb-4">
                <BookOpen className="h-16 w-16 text-blue-500 mx-auto" />
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Join a Class</h2>
              <p className="text-gray-600">Enter the join code provided by your teacher</p>
            </div>

            <form onSubmit={handleSubmit(previewClass)} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Class Join Code
                </label>
                <div className="relative">
                  <Controller
                    name="joinCode"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type={showJoinCode ? 'text' : 'password'}
                        placeholder="Enter join code (e.g., ABC123)"
                        className={`w-full px-4 py-3 pr-20 border-2 rounded-lg text-lg font-mono tracking-widest text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.joinCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        style={{ letterSpacing: '0.2em' }}
                      />
                    )}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <button
                      type="button"
                      onClick={() => setShowJoinCode(!showJoinCode)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title={showJoinCode ? 'Hide join code' : 'Show join code'}
                    >
                      {showJoinCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {watchedJoinCode && (
                      <button
                        type="button"
                        onClick={copyJoinCode}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy join code"
                      >
                        {copiedCode ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                </div>
                {errors.joinCode && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.joinCode.message}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-700 space-y-1">
                    <p className="font-medium">Need help finding your join code?</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-600">
                      <li>Ask your teacher for the class join code</li>
                      <li>Check your email for an invitation</li>
                      <li>Look for it on your class materials or syllabus</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid || isLoading}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Preview Class'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        );

      case 'preview':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <div className="relative mb-4">
                <Eye className="h-12 w-12 text-green-500 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Class Preview</h2>
              <p className="text-gray-600">Review the class details before joining</p>
            </div>

            {classData && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
                    style={{ backgroundColor: classData.settings.color }}
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{classData.name}</h3>
                    <p className="text-gray-600">{classData.subject} • {classData.gradeLevel}</p>
                  </div>
                </div>

                {classData.description && (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{classData.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>Teacher: {classData.teacher.name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{(classData as any).studentCount || classData.students.length} students enrolled</span>
                  </div>
                  {classData.settings.maxStudents && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="h-4 w-4 mr-2" />
                      <span>Max capacity: {classData.settings.maxStudents}</span>
                    </div>
                  )}
                </div>                  <div className="space-y-3">
                    {classData.schedule.meetingDays.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{classData.schedule.meetingDays.join(', ')}</span>
                      </div>
                    )}
                    {classData.schedule.startTime && classData.schedule.endTime && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{classData.schedule.startTime} - {classData.schedule.endTime}</span>
                      </div>
                    )}
                    {classData.schedule.classroom && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{classData.schedule.classroom}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-gray-900">Class Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${classData.settings.requireApproval ? 'bg-orange-500' : 'bg-green-500'}`} />
                      {classData.settings.requireApproval ? 'Requires approval' : 'Instant join'}
                    </div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${classData.settings.allowLateSubmissions ? 'bg-green-500' : 'bg-red-500'}`} />
                      {classData.settings.allowLateSubmissions ? 'Late submissions allowed' : 'No late submissions'}
                    </div>
                  </div>
                </div>

                {classData.settings.requireApproval && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 mr-2" />
                      <div className="text-sm text-orange-700">
                        <p className="font-medium">Approval Required</p>
                        <p>Your teacher will need to approve your enrollment before you can access class materials.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Join Code
              </button>
              <button
                type="button"
                onClick={joinClass}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Class'
                )}
              </button>
            </div>
          </motion.div>
        );

      case 'joining':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
              <Users className="h-8 w-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Joining Class...</h2>
            <p className="text-gray-600">Please wait while we add you to the class</p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="relative mb-6">
              <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Successfully Joined!</h2>
            <p className="text-gray-600 mb-4">
              {classData?.settings.requireApproval 
                ? 'Your enrollment request has been sent to your teacher for approval.'
                : 'You have been added to the class and can now access class materials.'
              }
            </p>
            {classData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <h3 className="font-semibold text-green-800">{classData.name}</h3>
                <p className="text-green-600 text-sm">Teacher: {classData.teacher.name}</p>
              </div>
            )}
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="relative mb-6">
              <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Failed</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="flex space-x-3 justify-center">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <AnimatePresence mode="wait">
        {renderStepContent()}
      </AnimatePresence>
    </div>
  );
};

export default JoinClassForm;