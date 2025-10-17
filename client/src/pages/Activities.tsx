import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Languages, BookOpen, Brain, Star, GraduationCap } from 'lucide-react';

const Activities = () => {
  const navigate = useNavigate();

  const activityCategories = [
    {
      title: 'Language Learning',
      description: 'Master new languages with interactive lessons',
      activities: [
        {
          id: 'malayalam',
          title: 'Malayalam Learning',
          description: 'Learn Malayalam alphabet, vocabulary, and culture',
          icon: '🌴',
          path: '/malayalam',
          color: 'from-green-500 to-teal-600'
        },
        {
          id: 'arabic',
          title: 'Arabic Learning', 
          description: 'Discover Arabic alphabet, culture, and stories',
          icon: '🕌',
          path: '/arabic',
          color: 'from-amber-500 to-orange-600'
        }
      ]
    },
    {
      title: 'Core Subjects',
      description: 'Build strong foundations in essential subjects',
      activities: [
        {
          id: 'english',
          title: 'English & Reading',
          description: 'Improve reading, writing, and vocabulary skills',
          icon: '📚',
          path: '/activities/englishreading',
          color: 'from-blue-500 to-indigo-600'
        },
        {
          id: 'math',
          title: 'Math & Numbers',
          description: 'Practice counting, arithmetic, and problem solving',
          icon: '🔢',
          path: '/activities/mathnumbers',
          color: 'from-purple-500 to-pink-600'
        },
        {
          id: 'science',
          title: 'Science Exploration',
          description: 'Discover how the world works through experiments',
          icon: '🔬',
          path: '/activities/science',
          color: 'from-emerald-500 to-green-600'
        }
      ]
    },
    {
      title: 'Logic & Thinking',
      description: 'Develop critical thinking and problem-solving skills',
      activities: [
        {
          id: 'logic',
          title: 'Logic & Problem Solving',
          description: 'Build reasoning skills with patterns and puzzles',
          icon: '🧩',
          path: '/activities/logic',
          color: 'from-purple-500 to-indigo-600'
        }
      ]
    },
    {
      title: 'Creative & Social',
      description: 'Express yourself and learn social skills',
      activities: [
        {
          id: 'art',
          title: 'Art & Creativity',
          description: 'Draw, color, and create beautiful artwork',
          icon: '🎨',
          path: '/activities/art',
          color: 'from-rose-500 to-red-600'
        },
        {
          id: 'social',
          title: 'Social Skills',
          description: 'Learn about friendship, empathy, and communication',
          icon: '🤝',
          path: '/activities/social',
          color: 'from-cyan-500 to-blue-600'
        },
        {
          id: 'physical',
          title: 'Physical Activities',
          description: 'Stay active with fun movement and sports games',
          icon: '🏃‍♂️',
          path: '/activities/physical',
          color: 'from-orange-500 to-red-500'
        }
      ]
    }
  ];

  const handleActivityClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <GraduationCap className="w-10 h-10 text-purple-600" />
            Learning Activities
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Choose from our collection of fun and educational activities designed to help you learn and grow!
          </p>
        </div>

        {/* Activity Categories */}
        <div className="space-y-12">
          {activityCategories.map((category, categoryIndex) => (
            <div key={category.title}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{category.title}</h2>
                <p className="text-gray-600">{category.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.activities.map((activity) => (
                  <Card 
                    key={activity.id}
                    className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                    onClick={() => handleActivityClick(activity.path)}
                  >
                    <CardHeader className="text-center">
                      <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${activity.color} flex items-center justify-center text-2xl text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                        {activity.icon}
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-800 mt-4">
                        {activity.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-600 mb-4">{activity.description}</p>
                      <Button 
                        className={`bg-gradient-to-r ${activity.color} text-white hover:shadow-md transition-all duration-300`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivityClick(activity.path);
                        }}
                      >
                        Start Learning
                        <Star className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* AI Homework Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">AI-Powered Learning</h2>
            <Card className="max-w-md mx-auto cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <Brain className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800 mt-4">
                  AI Homework Helper
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Upload your homework and get instant help with AI-powered analysis and explanations
                </p>
                <Button 
                  onClick={() => navigate('/ai-homework')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-md transition-all duration-300"
                >
                  Try AI Helper
                  <Brain className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activities;