/**
 * Enhanced Kid-Friendly Video Tutorial System
 * Fun and engaging interface for kids to explore educational videos
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Play,
  Clock,
  Star,
  Bookmark,
  Grid3X3, 
  List,
  Filter
} from 'lucide-react';
import { VideoTutorial } from './VideoTutorialPlayer';
import { cn } from '@/lib/utils';

interface VideoTutorialSystemKidsProps {
  className?: string;
  onVideoSelect?: (video: VideoTutorial) => void;
  showFavorites?: boolean;
}

export const VideoTutorialSystemKids: React.FC<VideoTutorialSystemKidsProps> = ({
  className,
  onVideoSelect,
  showFavorites = true
}) => {
  const [videos, setVideos] = useState<VideoTutorial[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Kid-friendly categories with emojis
  const categories = [
    { id: 'all', name: 'All Videos', emoji: '🌟', gradient: 'from-purple-400 to-pink-400' },
    { id: 'math', name: 'Math Fun', emoji: '🔢', gradient: 'from-blue-400 to-green-400' },
    { id: 'english', name: 'Reading & Writing', emoji: '📚', gradient: 'from-green-400 to-teal-400' },
    { id: 'science', name: 'Science Adventures', emoji: '🔬', gradient: 'from-orange-400 to-red-400' },
    { id: 'art', name: 'Creative Time', emoji: '🎨', gradient: 'from-pink-400 to-purple-400' },
    { id: 'music', name: 'Musical Journey', emoji: '🎵', gradient: 'from-yellow-400 to-orange-400' },
    { id: 'animals', name: 'Animal Friends', emoji: '🦁', gradient: 'from-green-400 to-blue-400' },
    { id: 'stories', name: 'Story Time', emoji: '📖', gradient: 'from-purple-400 to-blue-400' }
  ];

  // Mock video data
  useEffect(() => {
    const loadVideos = async () => {
      setIsLoading(true);
      
      const mockVideos: VideoTutorial[] = [
        {
          id: 'video-1',
          title: 'Counting with Animal Friends! 🐄',
          description: 'Join our farm animal friends as we learn to count from 1 to 10! Moo, Oink, Cluck!',
          thumbnailUrl: '/api/placeholder/320/180',
          videoUrl: '/videos/counting-animals.mp4',
          duration: 480,
          difficulty: 'easy',
          ageRange: '3-5 years',
          category: 'math',
          tags: ['counting', 'animals', 'numbers', 'farm'],
          learningObjectives: ['Count from 1 to 10', 'Animal sounds', 'Number recognition'],
          chapters: [],
          assessments: [],
          adaptiveSettings: { playbackSpeeds: [1], pausePoints: [], interactiveElements: [] }
        },
        {
          id: 'video-2',
          title: 'Magic Color Mixing! 🌈',
          description: 'Watch colors dance and mix to create beautiful new colors! It\'s like magic!',
          thumbnailUrl: '/api/placeholder/320/180',
          videoUrl: '/videos/color-mixing.mp4',
          duration: 360,
          difficulty: 'easy',
          ageRange: '4-6 years',
          category: 'art',
          tags: ['colors', 'art', 'creativity', 'mixing'],
          learningObjectives: ['Primary colors', 'Color mixing', 'Creative expression'],
          chapters: [],
          assessments: [],
          adaptiveSettings: { playbackSpeeds: [1], pausePoints: [], interactiveElements: [] }
        },
        {
          id: 'video-3',
          title: 'ABC Song Adventure! 🎵',
          description: 'Sing along with the alphabet song and meet letter friends along the way!',
          thumbnailUrl: '/api/placeholder/320/180',
          videoUrl: '/videos/abc-song.mp4',
          duration: 300,
          difficulty: 'easy',
          ageRange: '3-5 years',
          category: 'english',
          tags: ['alphabet', 'letters', 'song', 'music'],
          learningObjectives: ['Letter recognition', 'Alphabet order', 'Phonics'],
          chapters: [],
          assessments: [],
          adaptiveSettings: { playbackSpeeds: [1], pausePoints: [], interactiveElements: [] }
        },
        {
          id: 'video-4',
          title: 'Jungle Animal Safari! 🦁',
          description: 'Explore the jungle and meet amazing animals! Roar like a lion and swing like a monkey!',
          thumbnailUrl: '/api/placeholder/320/180',
          videoUrl: '/videos/jungle-animals.mp4',
          duration: 420,
          difficulty: 'medium',
          ageRange: '4-7 years',
          category: 'animals',
          tags: ['jungle', 'animals', 'nature', 'sounds'],
          learningObjectives: ['Animal habitats', 'Animal sounds', 'Nature appreciation'],
          chapters: [],
          assessments: [],
          adaptiveSettings: { playbackSpeeds: [1], pausePoints: [], interactiveElements: [] }
        },
        {
          id: 'video-5',
          title: 'Fun with Shapes! 🔺',
          description: 'Discover circles, squares, triangles and more! Shapes are everywhere around us!',
          thumbnailUrl: '/api/placeholder/320/180',
          videoUrl: '/videos/shapes-fun.mp4',
          duration: 380,
          difficulty: 'easy',
          ageRange: '3-6 years',
          category: 'math',
          tags: ['shapes', 'geometry', 'recognition', 'patterns'],
          learningObjectives: ['Shape recognition', 'Geometric concepts', 'Pattern identification'],
          chapters: [],
          assessments: [],
          adaptiveSettings: { playbackSpeeds: [1], pausePoints: [], interactiveElements: [] }
        }
      ];

      setVideos(mockVideos);
      setIsLoading(false);
    };

    loadVideos();
  }, []);

  // Filter videos based on category and search
  const filteredVideos = videos.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (videoId: string) => {
    setFavorites(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📺</div>
          <p className="text-xl font-['Comic_Neue'] font-bold text-purple-700">Loading awesome videos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-4",
      className
    )}>
      <div className="max-w-7xl mx-auto">
        {/* Fun Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-5xl animate-bounce">📺</div>
            <h1 className="text-4xl font-['Fredoka_One'] bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Video Fun Zone!
            </h1>
            <div className="text-5xl animate-bounce delay-150">🎬</div>
          </div>
          <p className="text-lg font-['Comic_Neue'] text-purple-600">
            Watch, learn, and have amazing adventures! 🌟
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <Input
              placeholder="🔍 Search for fun videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 border-2 border-purple-200 rounded-xl bg-white/80 backdrop-blur-sm font-['Comic_Neue'] focus:border-purple-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide">
            <div className="flex gap-3 min-w-max px-4">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-xl font-['Comic_Neue'] font-bold transition-all transform hover:scale-105 whitespace-nowrap
                    ${selectedCategory === category.id 
                      ? `bg-gradient-to-r ${category.gradient} text-white shadow-lg border-0` 
                      : 'bg-white/70 border-2 border-purple-200 text-purple-700 hover:bg-purple-50'
                    }
                  `}
                >
                  <span className="text-lg">{category.emoji}</span>
                  <span className="text-sm">{category.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-['Comic_Neue'] font-bold text-purple-700">
            {categories.find(c => c.id === selectedCategory)?.emoji} {' '}
            {categories.find(c => c.id === selectedCategory)?.name} Videos
          </h2>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="font-['Comic_Neue']"
            >
              <Grid3X3 className="w-4 h-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="font-['Comic_Neue']"
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>
        </div>

        {/* Videos Grid/List */}
        <div className={cn(
          "gap-6",
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "flex flex-col"
        )}>
          {filteredVideos.map((video) => (
            <Card 
              key={video.id}
              className={cn(
                "group overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer bg-white/70 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400",
                viewMode === 'list' ? "flex flex-row" : "rounded-2xl"
              )}
              onClick={() => onVideoSelect?.(video)}
            >
              {/* Thumbnail */}
              <div className={cn(
                "relative overflow-hidden",
                viewMode === 'list' ? "w-48 h-32" : "aspect-video"
              )}>
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-purple-600 ml-1" />
                  </div>
                </div>
                {/* Duration Badge */}
                <Badge className="absolute bottom-2 right-2 bg-black/70 text-white font-['Comic_Neue'] font-bold">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDuration(video.duration)}
                </Badge>
                {/* Favorite Button */}
                {showFavorites && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(video.id);
                    }}
                  >
                    <Star
                      className={cn(
                        "w-4 h-4",
                        favorites.includes(video.id)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-400"
                      )}
                    />
                  </Button>
                )}
              </div>

              {/* Content */}
              <CardContent className={cn(
                "p-4",
                viewMode === 'list' ? "flex-1" : ""
              )}>
                <div className="space-y-3">
                  <h3 className="font-['Comic_Neue'] font-bold text-purple-800 text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-purple-600 font-['Comic_Neue'] line-clamp-2">
                    {video.description}
                  </p>
                  
                  {/* Tags and Difficulty */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={cn(
                      "text-xs font-['Comic_Neue'] font-bold border",
                      getDifficultyColor(video.difficulty)
                    )}>
                      {video.difficulty === 'easy' ? '😊 Easy' : 
                       video.difficulty === 'medium' ? '🤔 Medium' : '🤯 Hard'}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-['Comic_Neue'] text-purple-600 border-purple-200">
                      👶 {video.ageRange}
                    </Badge>
                  </div>

                  {/* Play Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-['Comic_Neue'] font-bold py-2 rounded-xl transition-all transform hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      onVideoSelect?.(video);
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    ▶️ Watch Now!
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-['Comic_Neue'] font-bold text-purple-700 mb-2">
              Oops! No videos found
            </h3>
            <p className="text-purple-600 font-['Comic_Neue']">
              Try searching for something different or check out other categories! 
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoTutorialSystemKids;