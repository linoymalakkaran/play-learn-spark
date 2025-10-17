import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calculator, Star, PlayCircle, Trophy, Target, X } from 'lucide-react';
import { MathActivity } from '@/components/activities/MathActivity';

const MathNumbers = () => {
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState('beginner');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showActivity, setShowActivity] = useState(false);

  const mathActivities = {
    beginner: [
      {
        id: 'counting-basics',
        title: 'Counting 1-20',
        description: 'Learn to count and recognize numbers',
        icon: '🔢',
        difficulty: 'Easy',
        duration: '15 mins',
        color: 'from-purple-400 to-purple-600'
      },
      {
        id: 'number-recognition',
        title: 'Number Recognition',
        description: 'Identify and match numbers',
        icon: '👁️',
        difficulty: 'Easy',
        duration: '12 mins',
        color: 'from-blue-400 to-blue-600'
      },
      {
        id: 'shape-basics',
        title: 'Basic Shapes',
        description: 'Learn circles, squares, triangles',
        icon: '🔷',
        difficulty: 'Easy',
        duration: '18 mins',
        color: 'from-green-400 to-green-600'
      },
      {
        id: 'size-sorting',
        title: 'Size Sorting',
        description: 'Arrange objects by size',
        icon: '�',
        difficulty: 'Easy',
        duration: '15 mins',
        color: 'from-pink-400 to-pink-600'
      }
    ],
    intermediate: [
      {
        id: 'addition-basics',
        title: 'Addition Fun',
        description: 'Add numbers up to 20',
        icon: '➕',
        difficulty: 'Medium',
        duration: '25 mins',
        color: 'from-orange-400 to-orange-600'
      },
      {
        id: 'subtraction-basics',
        title: 'Subtraction Practice',
        description: 'Subtract numbers within 20',
        icon: '➖',
        difficulty: 'Medium',
        duration: '25 mins',
        color: 'from-red-400 to-red-600'
      },
      {
        id: 'number-patterns',
        title: 'Number Patterns',
        description: 'Complete number sequences',
        icon: '🔢',
        difficulty: 'Medium',
        duration: '30 mins',
        color: 'from-teal-400 to-teal-600'
      },
      {
        id: 'time-basics',
        title: 'Telling Time',
        description: 'Learn to read clocks',
        icon: '🕐',
        difficulty: 'Medium',
        duration: '30 mins',
        color: 'from-indigo-400 to-indigo-600'
      }
    ],
    advanced: [
      {
        id: 'multiplication-tables',
        title: 'Multiplication Tables',
        description: 'Master times tables 1-10',
        icon: '✖️',
        difficulty: 'Hard',
        duration: '35 mins',
        color: 'from-purple-500 to-purple-700'
      },
      {
        id: 'division-basics',
        title: 'Division Concepts',
        description: 'Learn to divide and share',
        icon: '➗',
        difficulty: 'Hard',
        duration: '40 mins',
        color: 'from-pink-500 to-pink-700'
      },
      {
        id: 'word-problems',
        title: 'Math Word Problems',
        description: 'Solve real-world math stories',
        icon: '💭',
        difficulty: 'Hard',
        duration: '45 mins',
        color: 'from-cyan-500 to-cyan-700'
      },
      {
        id: 'geometry-advanced',
        title: 'Geometry Explorer',
        description: 'Discover angles and measurements',
        icon: '📐',
        difficulty: 'Hard',
        duration: '40 mins',
        color: 'from-emerald-500 to-emerald-700'
      }
    ]
  };

  const handleActivityStart = (activityId: string) => {
    // Find the activity from all levels
    const allActivities = [
      ...mathActivities.beginner,
      ...mathActivities.intermediate,
      ...mathActivities.advanced
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {showActivity && selectedActivity ? (
          // Show the selected activity
          <div>
            {/* Activity Header */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={handleActivityBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Math & Numbers
              </Button>
              <Button
                variant="ghost"
                onClick={handleActivityBack}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Activity Title */}
            <div className="text-center mb-6">
              <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${selectedActivity.color} flex items-center justify-center text-3xl text-white shadow-lg mb-4`}>
                {selectedActivity.icon}
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {selectedActivity.title}
              </h1>
              <p className="text-gray-600 max-w-xl mx-auto">
                {selectedActivity.description}
              </p>
            </div>

            {/* Activity Component */}
            <MathActivity
              childAge={5} // Default age, you could make this dynamic
              onComplete={handleActivityComplete}
              onBack={handleActivityBack}
              activityName={selectedActivity.title}
              activityIcon={selectedActivity.icon}
              activityDescription={selectedActivity.description}
              activityId={selectedActivity.id}
            />
          </div>
        ) : (
          // Show the activity list (original content)
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="ghost"
                onClick={() => navigate('/activities')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Activities
              </Button>
            </div>

            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
                <Calculator className="w-10 h-10 text-purple-600" />
                Math & Numbers
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Practice counting, arithmetic, and problem solving with fun, interactive math activities!
              </p>
            </div>

            {/* Level Tabs */}
            <Tabs value={activeLevel} onValueChange={setActiveLevel} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="beginner" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Beginner
                </TabsTrigger>
                <TabsTrigger value="intermediate" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Intermediate
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {Object.entries(mathActivities).map(([level, activities]) => (
                <TabsContent key={level} value={level} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map((activity) => (
                      <Card 
                        key={activity.id}
                        className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                        onClick={() => handleActivityStart(activity.id)}
                      >
                        <CardHeader className="text-center">
                          <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${activity.color} flex items-center justify-center text-2xl text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                            {activity.icon}
                          </div>
                          <CardTitle className="text-xl font-bold text-gray-800 mt-4">
                            {activity.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                          <p className="text-gray-600">{activity.description}</p>
                          
                          <div className="flex justify-center items-center gap-4 text-sm">
                            <span className={`px-2 py-1 rounded-full ${getDifficultyColor(activity.difficulty)}`}>
                              {activity.difficulty}
                            </span>
                            <span className="text-gray-500">⏱️ {activity.duration}</span>
                          </div>
                          
                          <Button 
                            className={`bg-gradient-to-r ${activity.color} text-white hover:shadow-md transition-all duration-300`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivityStart(activity.id);
                            }}
                          >
                            Start Activity
                            <PlayCircle className="w-4 h-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Level Description */}
                  <div className="mt-8 text-center">
                    <Card className="max-w-2xl mx-auto bg-purple-50 border-purple-200">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-purple-800 mb-2">
                          {level.charAt(0).toUpperCase() + level.slice(1)} Level
                        </h3>
                        <p className="text-purple-700">
                          {level === 'beginner' && "Start with basic counting, number recognition, and simple shapes."}
                          {level === 'intermediate' && "Build math skills with addition, subtraction, and pattern recognition."}
                          {level === 'advanced' && "Master multiplication, division, and solve challenging word problems."}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default MathNumbers;