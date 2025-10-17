import React from 'react';
import { SpanishLearningContainer } from '@/components/spanish/SpanishLearningContainer';
import { useStudent } from '@/hooks/useStudent';

const SpanishLearning: React.FC = () => {
  const { student } = useStudent();
  
  const childAge = (student?.age || 5) as 3 | 4 | 5 | 6;
  
  const handleProgressUpdate = (progress: any) => {
    // TODO: Save progress to backend or local storage
    console.log('Spanish learning progress updated:', progress);
  };

  return (
    <div className="min-h-screen">
      <SpanishLearningContainer 
        childAge={childAge}
        onProgressUpdate={handleProgressUpdate}
      />
    </div>
  );
};

export default SpanishLearning;