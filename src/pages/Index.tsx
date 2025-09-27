import { useState, useEffect } from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { Dashboard } from '@/components/Dashboard';
import { Child } from '@/types/learning';

const Index = () => {
  const [currentChild, setCurrentChild] = useState<Child | null>(null);

  // Load saved child data from localStorage
  useEffect(() => {
    const savedChild = localStorage.getItem('little-learners-child');
    if (savedChild) {
      try {
        setCurrentChild(JSON.parse(savedChild));
      } catch (error) {
        console.error('Error loading saved child data:', error);
        localStorage.removeItem('little-learners-child');
      }
    }
  }, []);

  // Save child data to localStorage
  const handleChildUpdate = (child: Child) => {
    setCurrentChild(child);
    localStorage.setItem('little-learners-child', JSON.stringify(child));
  };

  // Reset app (for testing or if child wants to start over)
  const handleReset = () => {
    localStorage.removeItem('little-learners-child');
    setCurrentChild(null);
  };

  if (!currentChild) {
    return <WelcomeScreen onChildSelected={handleChildUpdate} />;
  }

  return <Dashboard child={currentChild} onProgressUpdate={handleChildUpdate} onReset={handleReset} />;
};

export default Index;
