import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Settings, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Info,
  Clock,
  MapPin,
  Palette,
  Shield
} from 'lucide-react';

// Validation schemas for each step
const basicInfoSchema = z.object({
  name: z.string()
    .min(3, 'Class name must be at least 3 characters')
    .max(100, 'Class name must be less than 100 characters'),
  subject: z.string()
    .min(2, 'Subject must be at least 2 characters')
    .max(50, 'Subject must be less than 50 characters'),
  gradeLevel: z.string()
    .min(1, 'Grade level is required'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
});

const settingsSchema = z.object({
  maxStudents: z.number()
    .min(1, 'Must allow at least 1 student')
    .max(1000, 'Maximum 1000 students allowed')
    .optional(),
  requireApproval: z.boolean(),
  allowLateSubmissions: z.boolean(),
  autoGenJoinCode: z.boolean(),
  color: z.string(),
  tags: z.array(z.string()).optional(),
});

const scheduleSchema = z.object({
  meetingDays: z.array(z.string()).min(1, 'Select at least one meeting day'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  classroom: z.string().max(100, 'Classroom name too long').optional(),
  semester: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

const fullSchema = basicInfoSchema.merge(settingsSchema).merge(scheduleSchema);

type FormData = z.infer<typeof fullSchema>;

interface CreateClassFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const STEPS = [
  { id: 1, title: 'Basic Information', icon: BookOpen },
  { id: 2, title: 'Class Settings', icon: Settings },
  { id: 3, title: 'Schedule', icon: Calendar },
  { id: 4, title: 'Review', icon: Check },
];

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const GRADE_LEVELS = [
  'Pre-K', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th', 
  '7th', '8th', '9th', '10th', '11th', '12th', 'College', 'Adult'
];

const CLASS_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
];

const SEMESTERS = ['Fall', 'Spring', 'Summer', 'Year-round'];

const CreateClassForm: React.FC<CreateClassFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({
    color: CLASS_COLORS[0],
    requireApproval: false,
    allowLateSubmissions: true,
    autoGenJoinCode: true,
    meetingDays: [],
    tags: []
  });

  const { 
    control, 
    handleSubmit, 
    watch, 
    setValue, 
    trigger, 
    formState: { errors, isValid } 
  } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: 'onChange',
    defaultValues: formData
  });

  const watchedData = watch();

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['name', 'subject', 'gradeLevel'];
        break;
      case 2:
        fieldsToValidate = ['maxStudents', 'color'];
        break;
      case 3:
        fieldsToValidate = ['meetingDays', 'semester', 'startDate', 'endDate'];
        break;
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid && currentStep < 4) {
      setFormData(prev => ({ ...prev, ...watchedData }));
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onFormSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              <p className="text-gray-600">Let's start with the basics about your class</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class Name *
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Advanced Mathematics"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Mathematics"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.subject ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Level *
                </label>
                <Controller
                  name="gradeLevel"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.gradeLevel ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select grade level</option>
                      {GRADE_LEVELS.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  )}
                />
                {errors.gradeLevel && (
                  <p className="text-red-500 text-sm mt-1">{errors.gradeLevel.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={3}
                      placeholder="Describe what this class is about..."
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Settings className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gray-900">Class Settings</h2>
              <p className="text-gray-600">Configure how your class operates</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Students
                </label>
                <Controller
                  name="maxStudents"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min="1"
                      max="1000"
                      placeholder="30"
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.maxStudents ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                />
                {errors.maxStudents && (
                  <p className="text-red-500 text-sm mt-1">{errors.maxStudents.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Palette className="h-4 w-4 inline mr-1" />
                  Class Color
                </label>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {CLASS_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => field.onChange(color)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            field.value === color ? 'border-gray-900' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-500 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Require Approval</h4>
                      <p className="text-sm text-gray-600">Students need approval to join</p>
                    </div>
                  </div>
                  <Controller
                    name="requireApproval"
                    control={control}
                    render={({ field }) => (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-orange-500 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Allow Late Submissions</h4>
                      <p className="text-sm text-gray-600">Students can submit work after deadlines</p>
                    </div>
                  </div>
                  <Controller
                    name="allowLateSubmissions"
                    control={control}
                    render={({ field }) => (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    )}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Calendar className="h-12 w-12 text-purple-500 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
              <p className="text-gray-600">When and where does your class meet?</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Meeting Days *
                </label>
                <Controller
                  name="meetingDays"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const currentDays = field.value || [];
                            if (currentDays.includes(day)) {
                              field.onChange(currentDays.filter(d => d !== day));
                            } else {
                              field.onChange([...currentDays, day]);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            field.value?.includes(day)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  )}
                />
                {errors.meetingDays && (
                  <p className="text-red-500 text-sm mt-1">{errors.meetingDays.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <Controller
                    name="startTime"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <Controller
                    name="endTime"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="time"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Classroom/Location
                </label>
                <Controller
                  name="classroom"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Room 101, Science Lab"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester *
                </label>
                <Controller
                  name="semester"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.semester ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select semester</option>
                      {SEMESTERS.map(semester => (
                        <option key={semester} value={semester}>{semester}</option>
                      ))}
                    </select>
                  )}
                />
                {errors.semester && (
                  <p className="text-red-500 text-sm mt-1">{errors.semester.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="date"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.startDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    )}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="date"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.endDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    )}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Check className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gray-900">Review & Create</h2>
              <p className="text-gray-600">Review your class details before creating</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: watchedData.color }}
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{watchedData.name}</h3>
                  <p className="text-gray-600">{watchedData.subject} • {watchedData.gradeLevel}</p>
                </div>
              </div>

              {watchedData.description && (
                <p className="text-gray-700">{watchedData.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <h4 className="font-medium text-gray-900">Settings</h4>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    {watchedData.maxStudents && (
                      <li>Max Students: {watchedData.maxStudents}</li>
                    )}
                    <li>Approval: {watchedData.requireApproval ? 'Required' : 'Not Required'}</li>
                    <li>Late Submissions: {watchedData.allowLateSubmissions ? 'Allowed' : 'Not Allowed'}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Schedule</h4>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>Days: {watchedData.meetingDays?.join(', ')}</li>
                    {watchedData.startTime && watchedData.endTime && (
                      <li>Time: {watchedData.startTime} - {watchedData.endTime}</li>
                    )}
                    {watchedData.classroom && <li>Location: {watchedData.classroom}</li>}
                    <li>Semester: {watchedData.semester}</li>
                    <li>Duration: {watchedData.startDate} to {watchedData.endDate}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Ready to create your class!</p>
                  <p>Students will be able to join using the generated join code after creation.</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-2 hidden sm:block">
                  <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={currentStep === 1 ? onCancel : prevStep}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Class'}
              <Check className="h-4 w-4 ml-1" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateClassForm;