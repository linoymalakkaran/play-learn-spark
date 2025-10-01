import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Zap, Star, PlayCircle, Trophy, Target } from 'lucide-react';
import { PlaceholderActivity } from '@/components/activities/PlaceholderActivity';

const PhysicalActivities = () => {
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState('beginner');
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const handleActivityStart = (activityId: string) => {
    setSelectedActivity(activityId);
  };

  const handleBackToList = () => {
    setSelectedActivity(null);
  };

  const physicalActivities = {
    beginner: [
      {
        id: 'stretching-basics',
        title: '🤸 Basic Stretching',
        description: 'Learn simple stretches to keep your body flexible',
        duration: '10 mins',
        difficulty: 'Easy',
        category: 'Flexibility'
      },
      {
        id: 'walking-adventure',
        title: '� Walking Adventure',
        description: 'Fun walking exercises and outdoor exploration',
        duration: '15 mins',
        difficulty: 'Easy',
        category: 'Cardio'
      },
      {
        id: 'balance-games',
        title: '⚖️ Balance Games',
        description: 'Simple balance exercises to improve coordination',
        duration: '12 mins',
        difficulty: 'Easy',
        category: 'Balance'
      }
    ],
    intermediate: [
      {
        id: 'pattern-designs',
        title: '🔄 Pattern Designer',
        description: 'Create repeating patterns and designs',
        duration: '30 mins',
        difficulty: 'Medium',
        category: 'Design'
      },
      {
        id: 'digital-collage',
        title: '📸 Digital Collage Maker',
        description: 'Combine images to tell visual stories',
        duration: '35 mins',
        difficulty: 'Medium',
        category: 'Collage'
      },
      {
        id: 'music-creation',
        title: '🎵 Music & Art Fusion',
        description: 'Create visual art inspired by music',
        duration: '40 mins',
        difficulty: 'Medium',
        category: 'Mixed Media'
      }
    ],
    advanced: [
      {
        id: 'stop-motion',
        title: '🎬 Stop Motion Animation',
        description: 'Create your own animated short films',
        duration: '45 mins',
        difficulty: 'Hard',
        category: 'Animation'
      },
      {
        id: 'digital-sculpture',
        title: '🗿 3D Digital Sculpture',
        description: 'Sculpt virtual objects in 3D space',
        duration: '50 mins',
        difficulty: 'Hard',
        category: '3D Art'
      },
      {
        id: 'story-illustration',
        title: '📚 Story Illustration',
        description: 'Illustrate your own creative stories',
        duration: '55 mins',
        difficulty: 'Hard',
        category: 'Illustration'
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
  if (selectedActivity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-4">
        <div className="max-w-6xl mx-auto">
          <Button 
            onClick={handleBackToList}
            className="mb-4 bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Physical Activities
          </Button>
          <PlaceholderActivity 
            activityName={physicalActivities[activeLevel as keyof typeof physicalActivities].find(a => a.id === selectedActivity)?.title || selectedActivity}
            activityIcon="🎨"
            activityDescription={physicalActivities[activeLevel as keyof typeof physicalActivities].find(a => a.id === selectedActivity)?.description || 'Physical activity for kids'}
            activityCategory="art"
            childAge={5}
            onComplete={() => handleBackToList()}
            onBack={handleBackToList}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-4">
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
                <Zap className="w-8 h-8 mr-3 text-yellow-600" />
                Physical Activities
              </h1>
              <p className="text-gray-600 mt-2">Get moving with fun exercises and games!</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-8 h-8 text-pink-500" />
            <span className="text-2xl font-bold text-pink-600">Create & Inspire!</span>
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
                  ? 'bg-pink-500 text-white shadow-lg transform scale-105'
                  : 'bg-white/80 text-gray-700 hover:bg-pink-100'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {physicalActivities[activeLevel as keyof typeof physicalActivities].map((activity) => (
            <Card 
              key={activity.id} 
              className="bg-white/90 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-pink-300"
              onClick={() => handleActivityStart(activity.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-gray-800 flex items-center">
                    {activity.title}
                  </CardTitle>
                  <PlayCircle className="w-6 h-6 text-pink-500" />
                </div>
                <CardDescription className="text-gray-600">
                  {activity.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="bg-pink-100 text-pink-800">
                    {activity.category}
                  </Badge>
                  <Badge variant="outline" className="border-orange-300 text-orange-700">
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
                    Creative
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white/80 rounded-lg p-6 inline-block">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Keep Creating! 🌈</h3>
            <p className="text-gray-600">
              Every piece of art tells a story - what will yours say today?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicalActivities;