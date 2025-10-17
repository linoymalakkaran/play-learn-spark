import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Brain, Star, PlayCircle, Trophy, Target, X, Puzzle } from 'lucide-react';
import { LogicActivity } from '@/components/activities/LogicActivity';
import { logicActivities } from '@/data/logicActivities';

const LogicProblemSolving = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('patterns');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [showActivity, setShowActivity] = useState(false);

  // Group activities by subcategory
  const groupedActivities = {
    patterns: logicActivities.filter(activity => activity.subcategory === 'patterns'),
    logic: logicActivities.filter(activity => activity.subcategory === 'logic'),
    'problem-solving': logicActivities.filter(activity => activity.subcategory === 'problem-solving'),
    'critical-thinking': logicActivities.filter(activity => activity.subcategory === 'critical-thinking')
  };

  const handleActivityStart = (activity: any) => {
    setSelectedActivity(activity);
    setShowActivity(true);
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

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'patterns':
        return {
          title: 'Pattern Recognition',
          description: 'Discover and complete sequences, shapes, and number patterns',
          icon: '🔢',
          color: 'from-purple-500 to-indigo-600'
        };
      case 'logic':
        return {
          title: 'Logic Games',
          description: 'Practice reasoning, matching, and logical connections',
          icon: '🧩',
          color: 'from-blue-500 to-cyan-600'
        };
      case 'problem-solving':
        return {
          title: 'Problem Solving',
          description: 'Navigate challenges and find creative solutions',
          icon: '🎯',
          color: 'from-orange-500 to-red-600'
        };
      case 'critical-thinking':
        return {
          title: 'Critical Thinking',
          description: 'Analyze, compare, and make thoughtful decisions',
          icon: '💭',
          color: 'from-emerald-500 to-teal-600'
        };
      default:
        return {
          title: 'Logic Activities',
          description: 'Think and learn',
          icon: '🧠',
          color: 'from-gray-500 to-gray-600'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-4">
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
                Back to Logic & Problem Solving
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
              <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${selectedActivity.backgroundColor} flex items-center justify-center text-3xl text-white shadow-lg mb-4`}>
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
            <LogicActivity
              childAge={5} // Default age, you could make this dynamic
              onComplete={handleActivityComplete}
              onBack={handleActivityBack}
              activityName={selectedActivity.title}
              activityIcon={selectedActivity.icon}
              activityDescription={selectedActivity.description}
              subcategory={selectedActivity.subcategory}
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
                <Brain className="w-10 h-10 text-purple-600" />
                Logic & Problem Solving
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Build critical thinking skills with patterns, logic puzzles, and problem-solving challenges!
              </p>
            </div>

            {/* Category Tabs */}
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="patterns" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Patterns
                </TabsTrigger>
                <TabsTrigger value="logic" className="flex items-center gap-2">
                  <Puzzle className="w-4 h-4" />
                  Logic
                </TabsTrigger>
                <TabsTrigger value="problem-solving" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Problem Solving
                </TabsTrigger>
                <TabsTrigger value="critical-thinking" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Critical Thinking
                </TabsTrigger>
              </TabsList>

              {Object.entries(groupedActivities).map(([category, activities]) => (
                <TabsContent key={category} value={category} className="space-y-6">
                  {/* Category Description */}
                  <div className="text-center mb-8">
                    <Card className={`max-w-2xl mx-auto bg-gradient-to-r ${getCategoryInfo(category).color} text-white border-0`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <div className="text-3xl">{getCategoryInfo(category).icon}</div>
                          <h3 className="text-xl font-bold">{getCategoryInfo(category).title}</h3>
                        </div>
                        <p className="text-white/90">{getCategoryInfo(category).description}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Activities Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activities.map((activity) => (
                      <Card 
                        key={activity.id}
                        className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                        onClick={() => handleActivityStart(activity)}
                      >
                        <CardHeader className="text-center pb-2">
                          <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${activity.backgroundColor} flex items-center justify-center text-2xl text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                            {activity.icon}
                          </div>
                          <CardTitle className="text-lg font-bold text-gray-800 mt-3 leading-tight">
                            {activity.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-3 pt-0">
                          <p className="text-gray-600 text-sm leading-relaxed">{activity.description}</p>
                          
                          <Button 
                            className={`w-full bg-gradient-to-r ${activity.backgroundColor} text-white hover:shadow-md transition-all duration-300 text-sm`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivityStart(activity);
                            }}
                          >
                            Start Activity
                            <PlayCircle className="w-4 h-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Category Stats */}
                  <div className="mt-8 text-center">
                    <div className="inline-flex items-center gap-4 bg-white/80 px-6 py-3 rounded-full shadow-md">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold text-gray-700">
                          {activities.length} Activities
                        </span>
                      </div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold text-gray-700">
                          {getCategoryInfo(category).title}
                        </span>
                      </div>
                    </div>
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

export default LogicProblemSolving;