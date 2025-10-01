import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Construction, AlertTriangle } from 'lucide-react';
import IntegratedLearningPlatform from '@/components/IntegratedLearningPlatform';
import { useStudent } from '@/hooks/useStudent';

const IntegratedPlatform = () => {
  const navigate = useNavigate();
  const { student } = useStudent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Main App
          </Button>
        </div>

        {/* Integrated Platform */}
        <div className="relative">
          <IntegratedLearningPlatform
            childId={student?.name || 'student'}
            userName={student?.name || 'Student'}
            userAge={student?.age || 8}
          />
        </div>
      </div>
    </div>
  );
};

export default IntegratedPlatform;