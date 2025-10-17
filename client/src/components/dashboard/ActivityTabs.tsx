import React from 'react';
import { Button } from '@/components/ui/button';

interface ActivityTabsProps {
  activeTab: 'all' | 'english' | 'math' | 'science' | 'habits' | 'art' | 'social' | 'problem' | 'physical' | 'world' | 'languages';
  onTabChange: (tab: 'all' | 'english' | 'math' | 'science' | 'habits' | 'art' | 'social' | 'problem' | 'physical' | 'world' | 'languages') => void;
}

export const ActivityTabs: React.FC<ActivityTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'all', label: 'All', icon: '🌟', description: 'All activities' },
    { id: 'english', label: 'English', icon: '📚', description: 'Reading & Writing' },
    { id: 'math', label: 'Math', icon: '🔢', description: 'Numbers & Logic' },
    { id: 'science', label: 'Science', icon: '🔬', description: 'Discovery & Exploration' },
    { id: 'habits', label: 'Habits', icon: '🌱', description: 'Daily Life Skills' },
    { id: 'art', label: 'Art', icon: '🎨', description: 'Creative Expression' },
    { id: 'social', label: 'Social', icon: '👫', description: 'People & Community' },
    { id: 'problem', label: 'Problem', icon: '🧩', description: 'Critical Thinking' },
    { id: 'physical', label: 'Physical', icon: '⚽', description: 'Movement & Sports' },
    { id: 'world', label: 'World', icon: '🌍', description: 'Geography & Culture' },
    { id: 'languages', label: 'Languages', icon: '🗣️', description: 'Multiple Languages' },
  ] as const;

  return (
    <div className="mb-6 sm:mb-8">
      <h3 className="text-lg sm:text-xl font-['Comic_Neue'] font-bold text-center mb-4 text-primary">
        🎯 Choose Your Learning Adventure!
      </h3>
      
      {/* Desktop Tabs */}
      <div className="hidden lg:flex flex-wrap justify-center gap-2 mb-6">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            size="sm"
            onClick={() => onTabChange(tab.id as any)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-full transition-all transform hover:scale-105
              ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-primary via-magic to-success text-white shadow-lg border-0' 
                : 'border-primary/30 text-primary hover:bg-primary/10'
              }
            `}
            title={tab.description}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="font-['Comic_Neue'] font-bold text-xs">
              {tab.label}
            </span>
          </Button>
        ))}
      </div>

      {/* Mobile Tabs - Scrollable */}
      <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 scrollbar-hide">
        <div className="flex gap-2 min-w-max px-4">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => onTabChange(tab.id as any)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-full transition-all transform hover:scale-105 whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-gradient-to-r from-primary via-magic to-success text-white shadow-lg border-0' 
                  : 'border-primary/30 text-primary hover:bg-primary/10'
                }
              `}
              title={tab.description}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="font-['Comic_Neue'] font-bold text-xs">
                {tab.label}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityTabs;