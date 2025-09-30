import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface StudentInfo {
  name: string;
  grade: string;
  age?: number;
  setupComplete: boolean;
}

interface StudentContextType {
  student: StudentInfo | null;
  setStudent: (student: StudentInfo) => void;
  clearStudent: () => void;
  isSetupComplete: boolean;
  updateStudentInfo: (updates: Partial<StudentInfo>) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const STORAGE_KEY = 'play-learn-spark-student';

interface StudentProviderProps {
  children: ReactNode;
}

export const StudentProvider: React.FC<StudentProviderProps> = ({ children }) => {
  const [student, setStudentState] = useState<StudentInfo | null>(null);

  // Load student info from localStorage on mount
  useEffect(() => {
    try {
      const savedStudent = localStorage.getItem(STORAGE_KEY);
      if (savedStudent) {
        const parsed = JSON.parse(savedStudent);
        setStudentState(parsed);
      }
    } catch (error) {
      console.warn('Failed to load student info from localStorage:', error);
    }
  }, []);

  // Save student info to localStorage whenever it changes
  useEffect(() => {
    if (student) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(student));
      } catch (error) {
        console.warn('Failed to save student info to localStorage:', error);
      }
    }
  }, [student]);

  const setStudent = (newStudent: StudentInfo) => {
    const completeStudent = {
      ...newStudent,
      setupComplete: true
    };
    setStudentState(completeStudent);
  };

  const clearStudent = () => {
    setStudentState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear student info from localStorage:', error);
    }
  };

  const updateStudentInfo = (updates: Partial<StudentInfo>) => {
    if (student) {
      const updatedStudent = { ...student, ...updates };
      setStudentState(updatedStudent);
    }
  };

  const isSetupComplete = student?.setupComplete ?? false;

  const value: StudentContextType = {
    student,
    setStudent,
    clearStudent,
    isSetupComplete,
    updateStudentInfo
  };

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};

// Helper functions for grade-based logic
export const getGradeLevel = (grade: string): 'early' | 'elementary' | 'middle' => {
  switch (grade) {
    case 'prekinder':
    case 'kindergarten':
    case 'grade1':
      return 'early';
    case 'grade2':
    case 'grade3':
    case 'grade4':
    case 'grade5':
      return 'elementary';
    case 'grade6':
    case 'grade7':
    case 'grade8':
      return 'middle';
    default:
      return 'elementary';
  }
};

export const getGradeDisplayName = (grade: string): string => {
  const gradeMap: Record<string, string> = {
    prekinder: 'Pre-K',
    kindergarten: 'Kindergarten',
    grade1: 'Grade 1',
    grade2: 'Grade 2',
    grade3: 'Grade 3',
    grade4: 'Grade 4',
    grade5: 'Grade 5',
    grade6: 'Grade 6',
    grade7: 'Grade 7',
    grade8: 'Grade 8',
  };
  return gradeMap[grade] || grade;
};

export const getRecommendedActivities = (grade: string): string[] => {
  const gradeLevel = getGradeLevel(grade);
  
  switch (gradeLevel) {
    case 'early':
      return [
        'AnimalSafari',
        'ColorRainbow', 
        'CountingTrain',
        'EmotionFaces',
        'BodyParts',
        'ShapeDetective'
      ];
    case 'elementary':
      return [
        'NumberGarden',
        'PizzaFractions',
        'WeatherStation',
        'Transportation',
        'FamilyTree',
        'SizeSorter',
        'AnimalSafari',
        'ColorRainbow'
      ];
    case 'middle':
      return [
        'PizzaFractions',
        'WeatherStation',
        'Transportation',
        'NumberGarden',
        'FamilyTree',
        'EmotionFaces'
      ];
    default:
      return [
        'AnimalSafari',
        'ColorRainbow',
        'CountingTrain',
        'NumberGarden',
        'PizzaFractions',
        'WeatherStation'
      ];
  }
};

export const getDifficultyForGrade = (grade: string): 'easy' | 'medium' | 'hard' => {
  const gradeLevel = getGradeLevel(grade);
  
  switch (gradeLevel) {
    case 'early':
      return 'easy';
    case 'elementary':
      return 'medium';
    case 'middle':
      return 'hard';
    default:
      return 'medium';
  }
};