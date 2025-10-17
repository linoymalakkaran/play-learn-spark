import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Star, PlayCircle, Trophy, Target } from 'lucide-react';
import { SocialActivity } from '@/components/activities/SocialActivity';

const SocialSkills = () => {
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState('beginner');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showActivity, setShowActivity] = useState(false);

  const handleActivityStart = (activityId: string) => {
    // Find the activity from all levels
    const allActivities = [
      ...socialActivities.beginner,
      ...socialActivities.intermediate,
      ...socialActivities.advanced
    ];
    const activity = allActivities.find(act => act.id === activityId);
    
    if (activity) {
      setSelectedActivity(activity);
      setShowActivity(true);
    }
  };

  const handleActivityComplete = (score: number) => {
    console.log('Activity completed with score:', score);
    setShowActivity(false);
    setSelectedActivity(null);
    // Here you could save the score or update progress
  };

  const handleActivityBack = () => {
    setShowActivity(false);
    setSelectedActivity(null);
  };

  const socialActivities = {
    beginner: [
      {
        id: 'emotion-faces',
        title: '😊 Emotion Faces',
        description: 'Learn to recognize and express different emotions',
        duration: '15 mins',
        difficulty: 'Easy',
        category: 'Emotions'
      },
      {
        id: 'family-tree',
        title: '👨‍👩‍👧‍👦 My Family Tree',
        description: 'Explore family relationships and roles',
        duration: '20 mins',
        difficulty: 'Easy',
        category: 'Family'
      },
      {
        id: 'good-manners',
        title: '🙏 Good Manners',
        description: 'Practice saying please, thank you, and excuse me',
        duration: '18 mins',
        difficulty: 'Easy',
        category: 'Manners'
      }
    ],
    intermediate: [
      {
        id: 'friendship-skills',
        title: '👭 Friendship Skills',
        description: 'Learn how to make and keep good friends',
        duration: '25 mins',
        difficulty: 'Medium',
        category: 'Friendship'
      },
      {
        id: 'sharing-caring',
        title: '🤝 Sharing & Caring',
        description: 'Practice sharing toys and caring for others',
        duration: '22 mins',
        difficulty: 'Medium',
        category: 'Empathy'
      },
      {
        id: 'problem-solving',
        title: '🧩 Problem Solving Together',
        description: 'Work together to solve social challenges',
        duration: '30 mins',
        difficulty: 'Medium',
        category: 'Teamwork'
      }
    ],
    advanced: [
      {
        id: 'leadership-skills',
        title: '👑 Young Leaders',
        description: 'Develop leadership and responsibility skills',
        duration: '35 mins',
        difficulty: 'Hard',
        category: 'Leadership'
      },
      {
        id: 'cultural-awareness',
        title: '🌍 Cultural Awareness',
        description: 'Learn about different cultures and traditions',
        duration: '40 mins',
        difficulty: 'Hard',
        category: 'Culture'
      },
      {
        id: 'community-helper',
        title: '🏘️ Community Helper',
        description: 'Understand how to help your community',
        duration: '30 mins',
        difficulty: 'Hard',
        category: 'Community'
      }
    ]
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // If an activity is selected, show the activity component
  if (showActivity && selectedActivity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 p-4">
        <div className="max-w-6xl mx-auto">
          <Button 
            onClick={handleActivityBack}
            className="mb-4 bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Social Skills
          </Button>
          <SocialActivity
            childAge={5}
            onComplete={handleActivityComplete}
            onBack={handleActivityBack}
            activityName={selectedActivity?.title || "Social Activity"}
            activityIcon="👥"
            activityDescription={selectedActivity?.description || "Social skills activity"}
            activityId={selectedActivity?.id || "social-activity"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/activities')}
              variant="outline"
              className="bg-white/80 hover:bg-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Activities
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                <Users className="w-10 h-10 text-blue-600" />
                Social Skills
              </h1>
              <p className="text-gray-600 mt-2">Learn how to connect, communicate, and care for others</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-blue-600">Connect & Care!</span>
          </div>
        </div>

        {/* Level Tabs */}
        <div className="flex space-x-2 mb-8 bg-white/60 p-2 rounded-lg">
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeLevel === level
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                  : 'bg-white/80 text-gray-700 hover:bg-blue-100'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialActivities[activeLevel as keyof typeof socialActivities].map((activity) => (
            <Card 
              key={activity.id} 
              className="bg-white/90 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300"
              onClick={() => handleActivityStart(activity.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-gray-800 flex items-center">
                    {activity.title}
                  </CardTitle>
                  <PlayCircle className="w-6 h-6 text-blue-500" />
                </div>
                <CardDescription className="text-gray-600">
                  {activity.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {activity.category}
                  </Badge>
                  <Badge variant="outline" className="border-cyan-300 text-cyan-700">
                    {activity.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    {activity.duration}
                  </div>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    Social
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white/80 rounded-lg p-6 inline-block">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Together We Grow! 🤝</h3>
            <p className="text-gray-600">
              Good friendships and social skills make life more fun and meaningful!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialSkills;