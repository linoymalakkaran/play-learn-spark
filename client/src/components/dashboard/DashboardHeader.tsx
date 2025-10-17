import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Child } from '@/types/learning';
import { getGradeDisplayName, StudentInfo } from '@/hooks/useStudent';

interface DashboardHeaderProps {
  child: Child;
  student?: StudentInfo;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ child, student }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative mb-6 sm:mb-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute top-4 left-4 text-6xl opacity-10 animate-bounce">⭐</div>
        <div className="absolute top-8 right-8 text-4xl opacity-10 animate-pulse">🚀</div>
        <div className="absolute bottom-4 left-1/4 text-5xl opacity-10 animate-pulse">🎯</div>
        <div className="absolute bottom-8 right-1/3 text-3xl opacity-10 animate-bounce">✨</div>
      </div>
      
      <div className="relative bg-gradient-to-r from-magic/20 via-primary/20 to-success/20 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-primary/20 profile-section">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left flex-1">
            {/* Play Learn Spark Logo/Title */}
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
              <div className="text-4xl sm:text-5xl animate-pulse">🎓</div>
              <h1 className="text-2xl sm:text-4xl font-['Fredoka_One'] bg-gradient-to-r from-primary via-magic to-success bg-clip-text text-transparent">
                Play Learn Spark
              </h1>
            </div>
            
            {/* Welcome Message */}
            <h2 className="text-xl sm:text-3xl font-['Comic_Neue'] font-bold text-primary mb-2 bounce-in">
              Welcome back, {student?.name || child.name}! 🌟
            </h2>
            <p className="text-sm sm:text-lg font-['Comic_Neue'] text-muted-foreground">
              {student?.grade ? 
                `Ready for some amazing ${getGradeDisplayName(student.grade)} learning adventures?` : 
                'Ready for some amazing learning adventures?'
              }
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
              {student?.grade && (
                <div className="px-3 py-1 bg-purple/20 rounded-full text-xs font-bold text-purple">
                  {getGradeDisplayName(student.grade)} Student
                </div>
              )}
              <div className="px-3 py-1 bg-success/20 rounded-full text-xs font-bold text-success">
                Age {student?.age || child.age} Explorer
              </div>
              <div className="px-3 py-1 bg-magic/20 rounded-full text-xs font-bold text-magic">
                {child.progress.totalActivitiesCompleted} Activities Done
              </div>
              <div className="px-3 py-1 bg-primary/20 rounded-full text-xs font-bold text-primary">
                Level {Math.floor((child.progress.averageScore || 0) / 20) + 1}
              </div>
            </div>
          </div>
          
          {/* Score & Actions */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-gradient-to-br from-success via-magic to-primary p-6 rounded-2xl text-center shadow-xl transform hover:scale-105 transition-transform">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                {child.progress.averageScore || 0}%
              </div>
              <div className="text-xs text-white/90 font-['Comic_Neue'] font-bold">
                SUCCESS RATE
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-2 w-full min-w-[120px]">
              <Button
                onClick={() => navigate('/rewards')}
                className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                🎁 View Rewards
              </Button>
              
              {!isAuthenticated && (
                <Button
                  onClick={() => navigate('/register')}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  💾 Save Progress
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;