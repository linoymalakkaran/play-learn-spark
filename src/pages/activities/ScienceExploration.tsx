import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Beaker, Star, PlayCircle, Trophy, Target } from 'lucide-react';
import { PlaceholderActivity } from '@/components/activities/PlaceholderActivity';

const ScienceExploration = () => {
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState('beginner');
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  const handleActivityStart = (activityId: string) => {
    setSelectedActivity(activityId);
  };

  const handleBackToList = () => {
    setSelectedActivity(null);
  };

  const scienceActivities = {
    beginner: [
      {
        id: 'weather-station',
        title: 'Weather Station',
        description: 'Learn about different weather patterns',
        icon: '🌤️',
        difficulty: 'Easy',
        duration: '20 mins',
        category: 'Weather'
      },
      {
        id: 'animal-habitats',
        title: 'Animal Habitats',
        description: 'Discover where different animals live',
        icon: '🏠',
        difficulty: 'Easy',
        duration: '15 mins',
        category: 'Biology'
      },
      {
        id: 'body-parts',
        title: 'Body Parts',
        description: 'Learn about your amazing body',
        icon: '👤',
        difficulty: 'Easy',
        duration: '18 mins',
        category: 'Human Body'
      }
    ],
    intermediate: [
      {
        id: 'simple-machines',
        title: 'Simple Machines',
        description: 'Explore how machines help us work',
        icon: '⚙️',
        difficulty: 'Medium',
        duration: '25 mins',
        category: 'Physics'
      },
      {
        id: 'plant-life-cycle',
        title: 'Plant Life Cycle',
        description: 'See how plants grow and reproduce',
        icon: '🌱',
        difficulty: 'Medium',
        duration: '22 mins',
        category: 'Biology'
      },
      {
        id: 'matter-states',
        title: 'States of Matter',
        description: 'Solid, liquid, gas - matter everywhere!',
        icon: '💧',
        difficulty: 'Medium',
        duration: '28 mins',
        category: 'Chemistry'
      }
    ],
    advanced: [
      {
        id: 'solar-system',
        title: 'Solar System',
        description: 'Journey through space and planets',
        icon: '🪐',
        difficulty: 'Hard',
        duration: '35 mins',
        category: 'Astronomy'
      },
      {
        id: 'ecosystem-balance',
        title: 'Ecosystem Balance',
        description: 'How living things depend on each other',
        icon: '🌿',
        difficulty: 'Hard',
        duration: '30 mins',
        category: 'Ecology'
      },
      {
        id: 'chemical-reactions',
        title: 'Chemical Reactions',
        description: 'Safe experiments with amazing results',
        icon: '🧪',
        difficulty: 'Hard',
        duration: '40 mins',
        category: 'Chemistry'
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <div className="max-w-6xl mx-auto">
          <Button 
            onClick={handleBackToList}
            className="mb-4 bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Science Exploration
          </Button>
          <PlaceholderActivity 
            activityName={scienceActivities[activeLevel as keyof typeof scienceActivities].find(a => a.id === selectedActivity)?.title || selectedActivity}
            activityIcon={scienceActivities[activeLevel as keyof typeof scienceActivities].find(a => a.id === selectedActivity)?.icon || '🔬'}
            activityDescription={scienceActivities[activeLevel as keyof typeof scienceActivities].find(a => a.id === selectedActivity)?.description || 'Science exploration activity'}
            activityCategory="science"
            childAge={5}
            onComplete={() => handleBackToList()}
            onBack={handleBackToList}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
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
              <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
                <Beaker className="w-10 h-10 text-emerald-600" />
                Science Exploration
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Discover how the world works through fun experiments, observations, and interactive science activities!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-8 h-8 text-emerald-500" />
            <span className="text-2xl font-bold text-emerald-600">Explore & Discover!</span>
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
                  ? 'bg-emerald-500 text-white shadow-lg transform scale-105'
                  : 'bg-white/80 text-gray-700 hover:bg-emerald-100'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scienceActivities[activeLevel as keyof typeof scienceActivities].map((activity) => (
            <Card 
              key={activity.id} 
              className="bg-white/90 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-emerald-300"
              onClick={() => handleActivityStart(activity.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">{activity.icon}</span>
                    {activity.title}
                  </CardTitle>
                  <PlayCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-gray-600 text-sm">
                  {activity.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                    {activity.difficulty}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {activity.category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    {activity.duration}
                  </div>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    Interactive
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white/80 rounded-lg p-6 inline-block">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Keep Exploring! 🔬</h3>
            <p className="text-gray-600">
              Science is all around us - every question leads to an amazing discovery!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScienceExploration;