import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StudentInfo } from '@/hooks/useStudent';
import { 
  GraduationCap, 
  User, 
  Star, 
  BookOpen,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface StudentSetupProps {
  onComplete: (studentInfo: StudentInfo) => void;
}

const StudentSetup: React.FC<StudentSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gradeOptions = [
    { value: 'prekinder', label: 'Pre-K (Ages 3-4)', age: 4 },
    { value: 'kindergarten', label: 'Kindergarten (Ages 4-5)', age: 5 },
    { value: 'grade1', label: 'Grade 1 (Ages 5-6)', age: 6 },
    { value: 'grade2', label: 'Grade 2 (Ages 6-7)', age: 7 },
    { value: 'grade3', label: 'Grade 3 (Ages 7-8)', age: 8 },
    { value: 'grade4', label: 'Grade 4 (Ages 8-9)', age: 9 },
    { value: 'grade5', label: 'Grade 5 (Ages 9-10)', age: 10 },
    { value: 'grade6', label: 'Grade 6 (Ages 10-11)', age: 11 },
    { value: 'grade7', label: 'Grade 7 (Ages 11-12)', age: 12 },
    { value: 'grade8', label: 'Grade 8 (Ages 12-13)', age: 13 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !grade) {
      return;
    }

    setIsSubmitting(true);
    
    // Find the selected grade info
    const selectedGrade = gradeOptions.find(g => g.value === grade);
    
    const studentInfo: StudentInfo = {
      name: name.trim(),
      grade,
      age: selectedGrade?.age,
      setupComplete: true
    };

    // Simulate a brief loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onComplete(studentInfo);
  };

  const isFormValid = name.trim().length >= 2 && grade;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 text-white rounded-full mb-4 shadow-lg">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-['Fredoka_One'] text-purple-800 mb-2">
            Welcome to Play & Learn! 🌟
          </h1>
          <p className="text-lg font-['Comic_Neue'] text-purple-600">
            Let's get started with your learning adventure!
          </p>
        </div>

        {/* Setup Form */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-['Comic_Neue'] text-purple-700 flex items-center justify-center gap-2">
              <User className="w-6 h-6" />
              Tell us about yourself!
            </CardTitle>
            <CardDescription className="text-purple-600">
              We'll customize activities just for you
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="studentName" className="text-purple-700 font-['Comic_Neue'] font-semibold">
                  What's your name? 👋
                </Label>
                <Input
                  id="studentName"
                  type="text"
                  placeholder="Enter your name..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                  maxLength={50}
                  required
                />
              </div>

              {/* Grade Selection */}
              <div className="space-y-2">
                <Label htmlFor="studentGrade" className="text-purple-700 font-['Comic_Neue'] font-semibold">
                  What grade are you in? 📚
                </Label>
                <Select value={grade} onValueChange={setGrade} required>
                  <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400">
                    <SelectValue placeholder="Select your grade..." />
                  </SelectTrigger>
                  <SelectContent>
                    {gradeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Preview Message */}
              {name && grade && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-['Comic_Neue'] font-semibold">
                      Hi {name}! Ready for some awesome learning activities?
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-['Comic_Neue'] font-bold text-lg py-6 rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Setting up your adventure...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Start My Learning Adventure!
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            {/* Fun Facts */}
            <div className="mt-6 text-center">
              <div className="flex justify-center items-center gap-4 text-sm text-purple-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Fun Activities</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>Grade-Appropriate</span>
                </div>
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4 text-green-500" />
                  <span>Learn & Play</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-purple-600 text-sm">
          <p>🎯 Activities will be customized for your grade level</p>
        </div>
      </div>
    </div>
  );
};

export default StudentSetup;