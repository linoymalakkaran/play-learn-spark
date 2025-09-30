/**
 * Video Tutorial Management System
 * Administrative interface for managing video tutorials, playlists, and educational content
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Filter, 
  Grid3X3, 
  List, 
  Play,
  Clock,
  Users,
  Star,
  Bookmark,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Upload
} from 'lucide-react';
import { VideoTutorial, VideoTutorialPlayer } from './VideoTutorialPlayer';
import { cn } from '@/lib/utils';

export interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videos: string[]; // video IDs
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
  estimatedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ageRange: string;
}

export interface VideoStats {
  videoId: string;
  totalViews: number;
  totalWatchTime: number;
  averageEngagement: number;
  completionRate: number;
  userRating: number;
  bookmarksCount: number;
  sharesCount: number;
  lastViewed: Date;
}

interface VideoTutorialSystemProps {
  className?: string;
  onVideoSelect?: (video: VideoTutorial) => void;
  onPlaylistSelect?: (playlist: Playlist) => void;
  showAdminFeatures?: boolean;
}

export const VideoTutorialSystem: React.FC<VideoTutorialSystemProps> = ({
  className,
  onVideoSelect,
  onPlaylistSelect,
  showAdminFeatures = false
}) => {
  const [videos, setVideos] = useState<VideoTutorial[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [videoStats, setVideoStats] = useState<VideoStats[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Mock videos
      const mockVideos: VideoTutorial[] = [
        {
          id: 'video-1',
          title: 'Learning Numbers with Animals',
          description: 'Fun counting adventure with farm animals',
          thumbnailUrl: '/api/placeholder/320/180',
          videoUrl: '/videos/numbers-animals.mp4',
          duration: 480, // 8 minutes
          difficulty: 'easy',
          ageRange: '3-5 years',
          category: 'Mathematics',
          tags: ['counting', 'animals', 'numbers'],
          learningObjectives: [
            'Count from 1 to 10',
            'Recognize number symbols',
            'Associate quantities with numbers'
          ],
          chapters: [
            {
              id: 'ch1',
              title: 'Introduction to Counting',
              startTime: 0,
              endTime: 120,
              description: 'Meet our animal friends',
              keyPoints: ['Numbers are everywhere', 'Animals can help us count']
            },
            {
              id: 'ch2',
              title: 'Counting Farm Animals',
              startTime: 120,
              endTime: 300,
              description: 'Count cows, pigs, and chickens',
              keyPoints: ['One-to-one correspondence', 'Number recognition']
            },
            {
              id: 'ch3',
              title: 'Practice Time',
              startTime: 300,
              endTime: 480,
              description: 'Interactive counting exercises',
              keyPoints: ['Practice makes perfect', 'Celebrate learning']
            }
          ],
          assessments: [
            {
              id: 'quiz1',
              timestamp: 240,
              type: 'quiz',
              question: 'How many cows do you see?',
              options: ['2', '3', '4', '5'],
              correctAnswer: '3',
              explanation: 'Great job! There are 3 cows in the field.',
              points: 10
            }
          ],
          adaptiveSettings: {
            playbackSpeeds: [0.5, 0.75, 1, 1.25, 1.5],
            pausePoints: [120, 240, 360],
            interactiveElements: []
          }
        },
        {
          id: 'video-2',
          title: 'Color Mixing Magic',
          description: 'Discover how colors combine to create new ones',
          thumbnailUrl: '/api/placeholder/320/180',
          videoUrl: '/videos/color-mixing.mp4',
          duration: 360, // 6 minutes
          difficulty: 'medium',
          ageRange: '4-6 years',
          category: 'Art & Creativity',
          tags: ['colors', 'art', 'creativity', 'science'],
          learningObjectives: [
            'Understand primary colors',
            'Learn color mixing basics',
            'Create new colors through experimentation'
          ],
          chapters: [
            {
              id: 'ch1',
              title: 'Primary Colors',
              startTime: 0,
              endTime: 120,
              description: 'Red, blue, and yellow',
              keyPoints: ['Primary colors cannot be made', 'They are the building blocks']
            },
            {
              id: 'ch2',
              title: 'Mixing Colors',
              startTime: 120,
              endTime: 240,
              description: 'What happens when we mix?',
              keyPoints: ['Red + Blue = Purple', 'Blue + Yellow = Green']
            },
            {
              id: 'ch3',
              title: 'Your Turn to Mix',
              startTime: 240,
              endTime: 360,
              description: 'Interactive color mixing',
              keyPoints: ['Experiment and discover', 'Art is about exploration']
            }
          ],
          assessments: [
            {
              id: 'quiz2',
              timestamp: 180,
              type: 'quiz',
              question: 'What color do you get when you mix red and yellow?',
              options: ['Purple', 'Orange', 'Green', 'Brown'],
              correctAnswer: 'Orange',
              explanation: 'Excellent! Red and yellow make orange.',
              points: 10
            }
          ],
          adaptiveSettings: {
            playbackSpeeds: [0.5, 0.75, 1, 1.25, 1.5],
            pausePoints: [120, 240],
            interactiveElements: []
          }
        }
      ];

      // Mock playlists
      const mockPlaylists: Playlist[] = [
        {
          id: 'playlist-1',
          title: 'Math Foundations',
          description: 'Essential math skills for early learners',
          thumbnailUrl: '/api/placeholder/320/180',
          videos: ['video-1'],
          createdBy: 'admin',
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2023-12-01'),
          isPublic: true,
          tags: ['mathematics', 'counting', 'numbers'],
          estimatedDuration: 480,
          difficulty: 'easy',
          ageRange: '3-5 years'
        },
        {
          id: 'playlist-2',
          title: 'Creative Arts',
          description: 'Explore creativity through art and colors',
          thumbnailUrl: '/api/placeholder/320/180',
          videos: ['video-2'],
          createdBy: 'admin',
          createdAt: new Date('2023-02-10'),
          updatedAt: new Date('2023-11-15'),
          isPublic: true,
          tags: ['art', 'creativity', 'colors'],
          estimatedDuration: 360,
          difficulty: 'medium',
          ageRange: '4-6 years'
        }
      ];

      // Mock stats
      const mockStats: VideoStats[] = [
        {
          videoId: 'video-1',
          totalViews: 1234,
          totalWatchTime: 15680, // in seconds
          averageEngagement: 78,
          completionRate: 65,
          userRating: 4.5,
          bookmarksCount: 89,
          sharesCount: 23,
          lastViewed: new Date()
        },
        {
          videoId: 'video-2',
          totalViews: 987,
          totalWatchTime: 12340,
          averageEngagement: 82,
          completionRate: 71,
          userRating: 4.7,
          bookmarksCount: 67,
          sharesCount: 31,
          lastViewed: new Date()
        }
      ];

      setVideos(mockVideos);
      setPlaylists(mockPlaylists);
      setVideoStats(mockStats);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || video.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = ['all', ...Array.from(new Set(videos.map(v => v.category)))];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatsForVideo = (videoId: string): VideoStats | undefined => {
    return videoStats.find(stat => stat.videoId === videoId);
  };

  if (selectedVideo) {
    return (
      <div className={className}>
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedVideo(null)}
            className="mb-4"
          >
            ← Back to Videos
          </Button>
        </div>
        <VideoTutorialPlayer 
          tutorial={selectedVideo}
          onProgress={(progress) => console.log('Progress:', progress)}
          onComplete={(tutorial, progress) => {
            console.log('Completed:', tutorial.title);
            // You can implement completion logic here
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Video Tutorials</h1>
          <p className="text-muted-foreground">Interactive learning experiences for young minds</p>
        </div>
        {showAdminFeatures && (
          <Button className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Video
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos, topics, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="videos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="videos">Videos ({filteredVideos.length})</TabsTrigger>
          <TabsTrigger value="playlists">Playlists ({playlists.length})</TabsTrigger>
          {showAdminFeatures && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>

        <TabsContent value="videos">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map(video => {
                const stats = getStatsForVideo(video.id);
                return (
                  <VideoCard
                    key={video.id}
                    video={video}
                    stats={stats}
                    onClick={() => {
                      setSelectedVideo(video);
                      onVideoSelect?.(video);
                    }}
                    showAdminFeatures={showAdminFeatures}
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVideos.map(video => {
                const stats = getStatsForVideo(video.id);
                return (
                  <VideoListItem
                    key={video.id}
                    video={video}
                    stats={stats}
                    onClick={() => {
                      setSelectedVideo(video);
                      onVideoSelect?.(video);
                    }}
                    showAdminFeatures={showAdminFeatures}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="playlists">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map(playlist => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onClick={() => onPlaylistSelect?.(playlist)}
                showAdminFeatures={showAdminFeatures}
              />
            ))}
          </div>
        </TabsContent>

        {showAdminFeatures && (
          <TabsContent value="analytics">
            <AnalyticsOverview videoStats={videoStats} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// Video Card Component
interface VideoCardProps {
  video: VideoTutorial;
  stats?: VideoStats;
  onClick: () => void;
  showAdminFeatures: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, stats, onClick, showAdminFeatures }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative" onClick={onClick}>
        <div className="aspect-video bg-muted flex items-center justify-center">
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge 
            variant="secondary" 
            className={cn("text-xs text-white", getDifficultyColor(video.difficulty))}
          >
            {video.difficulty}
          </Badge>
        </div>
        
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm line-clamp-2 flex-1">{video.title}</h3>
          {showAdminFeatures && (
            <Button variant="ghost" size="sm" className="ml-2">
              <MoreVertical className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{video.description}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {video.ageRange}
          </span>
          {stats && (
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {stats.totalViews.toLocaleString()}
            </span>
          )}
        </div>
        
        {stats && (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="text-xs">{stats.userRating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{stats.completionRate}% completion</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Video List Item Component
interface VideoListItemProps {
  video: VideoTutorial;
  stats?: VideoStats;
  onClick: () => void;
  showAdminFeatures: boolean;
}

const VideoListItem: React.FC<VideoListItemProps> = ({ video, stats, onClick, showAdminFeatures }) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-32 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
            <img 
              src={video.thumbnailUrl} 
              alt={video.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-1 right-1 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
              {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1 line-clamp-1">{video.title}</h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{video.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{video.category}</span>
                  <span>{video.ageRange}</span>
                  <Badge variant="outline" className="text-xs">{video.difficulty}</Badge>
                  {stats && (
                    <>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {stats.totalViews.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {stats.userRating.toFixed(1)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {showAdminFeatures && (
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Playlist Card Component
interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
  showAdminFeatures: boolean;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick, showAdminFeatures }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <div className="aspect-video bg-muted">
        <img 
          src={playlist.thumbnailUrl} 
          alt={playlist.title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm line-clamp-2 flex-1">{playlist.title}</h3>
          {showAdminFeatures && (
            <Button variant="ghost" size="sm" className="ml-2">
              <MoreVertical className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{playlist.description}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{playlist.videos.length} videos</span>
          <span>{Math.floor(playlist.estimatedDuration / 60)} min</span>
        </div>
        
        <div className="mt-2">
          <Badge variant="outline" className="text-xs">{playlist.difficulty}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Analytics Overview Component
interface AnalyticsOverviewProps {
  videoStats: VideoStats[];
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ videoStats }) => {
  const totalViews = videoStats.reduce((sum, stat) => sum + stat.totalViews, 0);
  const totalWatchTime = videoStats.reduce((sum, stat) => sum + stat.totalWatchTime, 0);
  const averageRating = videoStats.reduce((sum, stat) => sum + stat.userRating, 0) / videoStats.length;
  const averageCompletion = videoStats.reduce((sum, stat) => sum + stat.completionRate, 0) / videoStats.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{Math.floor(totalWatchTime / 3600)}h</div>
            <div className="text-sm text-muted-foreground">Watch Time</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{averageCompletion.toFixed(0)}%</div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Video Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {videoStats.map(stat => (
              <div key={stat.videoId} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <div className="font-medium">Video {stat.videoId}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.totalViews} views • {stat.completionRate}% completion
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{stat.userRating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoTutorialSystem;