/**
 * Video Tutorial System for Play & Learn Spark Frontend
 * Interactive video player with progress tracking, adaptive playback, and educational assessments
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  BookOpen,
  Award,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
  ageRange: string;
  category: string;
  tags: string[];
  learningObjectives: string[];
  prerequisites?: string[];
  chapters: VideoChapter[];
  assessments: VideoAssessment[];
  adaptiveSettings: {
    playbackSpeeds: number[];
    pausePoints: number[]; // timestamps where video auto-pauses
    interactiveElements: InteractiveElement[];
  };
}

export interface VideoChapter {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  description: string;
  keyPoints: string[];
  thumbnail?: string;
}

export interface VideoAssessment {
  id: string;
  timestamp: number;
  type: 'quiz' | 'activity' | 'reflection';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  explanation: string;
  points: number;
}

export interface InteractiveElement {
  id: string;
  timestamp: number;
  type: 'note' | 'quiz' | 'activity' | 'pause';
  content: string;
  duration?: number;
}

export interface VideoProgress {
  videoId: string;
  userId: string;
  watchedSeconds: number;
  completionPercentage: number;
  chaptersCompleted: string[];
  assessmentsCompleted: AssessmentResult[];
  lastWatchedAt: Date;
  watchSessions: WatchSession[];
  notes: UserNote[];
}

export interface AssessmentResult {
  assessmentId: string;
  score: number;
  maxScore: number;
  attempts: number;
  completedAt: Date;
  answers: any[];
}

export interface WatchSession {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  watchedDuration: number;
  pauseCount: number;
  rewindCount: number;
  playbackSpeed: number;
}

export interface UserNote {
  id: string;
  timestamp: number;
  content: string;
  createdAt: Date;
}

interface VideoTutorialPlayerProps {
  tutorial: VideoTutorial;
  onProgress?: (progress: VideoProgress) => void;
  onComplete?: (tutorial: VideoTutorial, progress: VideoProgress) => void;
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  adaptiveMode?: boolean;
}

export const VideoTutorialPlayer: React.FC<VideoTutorialPlayerProps> = ({
  tutorial,
  onProgress,
  onComplete,
  className,
  autoPlay = false,
  showControls = true,
  adaptiveMode = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<VideoChapter | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<VideoAssessment | null>(null);
  const [userNotes, setUserNotes] = useState<UserNote[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [watchSession, setWatchSession] = useState<WatchSession | null>(null);

  // Initialize watch session
  useEffect(() => {
    const sessionId = `session_${Date.now()}_${Math.random()}`;
    setWatchSession({
      sessionId,
      startTime: new Date(),
      endTime: new Date(),
      watchedDuration: 0,
      pauseCount: 0,
      rewindCount: 0,
      playbackSpeed: 1
    });
  }, []);

  // Update current chapter based on time
  useEffect(() => {
    const chapter = tutorial.chapters.find(
      ch => currentTime >= ch.startTime && currentTime <= ch.endTime
    );
    setCurrentChapter(chapter || null);
  }, [currentTime, tutorial.chapters]);

  // Check for assessments at current time
  useEffect(() => {
    if (adaptiveMode) {
      const assessment = tutorial.assessments.find(
        a => Math.abs(currentTime - a.timestamp) < 1 && 
        !assessmentResults.some(r => r.assessmentId === a.id)
      );
      
      if (assessment) {
        setIsPlaying(false);
        setActiveAssessment(assessment);
      }
    }
  }, [currentTime, tutorial.assessments, assessmentResults, adaptiveMode]);

  // Auto-pause at designated points
  useEffect(() => {
    if (adaptiveMode && tutorial.adaptiveSettings.pausePoints.includes(Math.floor(currentTime))) {
      setIsPlaying(false);
    }
  }, [currentTime, tutorial.adaptiveSettings.pausePoints, adaptiveMode]);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setWatchSession(prev => prev ? {
          ...prev,
          pauseCount: prev.pauseCount + 1
        } : null);
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      
      // Update watch session
      setWatchSession(prev => prev ? {
        ...prev,
        watchedDuration: current,
        endTime: new Date()
      } : null);

      // Report progress
      if (onProgress) {
        const progress: VideoProgress = {
          videoId: tutorial.id,
          userId: 'current-user', // Replace with actual user ID
          watchedSeconds: current,
          completionPercentage: (current / duration) * 100,
          chaptersCompleted: tutorial.chapters
            .filter(ch => current > ch.endTime)
            .map(ch => ch.id),
          assessmentsCompleted: assessmentResults,
          lastWatchedAt: new Date(),
          watchSessions: watchSession ? [watchSession] : [],
          notes: userNotes
        };
        onProgress(progress);
      }
    }
  }, [duration, onProgress, tutorial, assessmentResults, watchSession, userNotes]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    if (videoRef.current) {
      const newTime = (value[0] / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      // Track rewind
      if (newTime < currentTime) {
        setWatchSession(prev => prev ? {
          ...prev,
          rewindCount: prev.rewindCount + 1
        } : null);
      }
    }
  }, [duration, currentTime]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setWatchSession(prev => prev ? {
      ...prev,
      playbackSpeed: speed
    } : null);
  }, []);

  const handleChapterClick = useCallback((chapter: VideoChapter) => {
    if (videoRef.current) {
      videoRef.current.currentTime = chapter.startTime;
      setCurrentTime(chapter.startTime);
    }
  }, []);

  const handleAssessmentSubmit = useCallback((assessment: VideoAssessment, answers: any[]) => {
    // Calculate score (simplified)
    let score = 0;
    const maxScore = assessment.points;
    
    if (assessment.type === 'quiz' && assessment.correctAnswer) {
      if (Array.isArray(assessment.correctAnswer)) {
        score = answers.filter(a => assessment.correctAnswer!.includes(a)).length;
      } else {
        score = answers[0] === assessment.correctAnswer ? maxScore : 0;
      }
    }

    const result: AssessmentResult = {
      assessmentId: assessment.id,
      score,
      maxScore,
      attempts: 1,
      completedAt: new Date(),
      answers
    };

    setAssessmentResults(prev => [...prev, result]);
    setActiveAssessment(null);
    setIsPlaying(true);
  }, []);

  const handleAddNote = useCallback((content: string) => {
    const note: UserNote = {
      id: `note_${Date.now()}`,
      timestamp: currentTime,
      content,
      createdAt: new Date()
    };
    setUserNotes(prev => [...prev, note]);
  }, [currentTime]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{tutorial.title}</CardTitle>
              <p className="text-sm text-muted-foreground mb-3">{tutorial.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs">
                  {tutorial.category}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs text-white", getDifficultyColor(tutorial.difficulty))}
                >
                  {tutorial.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(tutorial.duration)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  {tutorial.ageRange}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Video Player */}
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full aspect-video bg-black"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => {
                setIsPlaying(false);
                if (onComplete && watchSession) {
                  const finalProgress: VideoProgress = {
                    videoId: tutorial.id,
                    userId: 'current-user',
                    watchedSeconds: duration,
                    completionPercentage: 100,
                    chaptersCompleted: tutorial.chapters.map(ch => ch.id),
                    assessmentsCompleted: assessmentResults,
                    lastWatchedAt: new Date(),
                    watchSessions: [watchSession],
                    notes: userNotes
                  };
                  onComplete(tutorial, finalProgress);
                }
              }}
            >
              <source src={tutorial.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Custom Controls Overlay */}
            {showControls && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                {/* Progress Bar */}
                <div className="mb-4">
                  <Slider
                    value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                    onValueChange={handleSeek}
                    className="w-full"
                    max={100}
                    step={0.1}
                  />
                  <div className="flex justify-between text-xs text-white/70 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSeek([(Math.max(0, currentTime - 10) / duration) * 100])}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSeek([(Math.min(duration, currentTime + 10) / duration) * 100])}
                      className="text-white hover:bg-white/20"
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                      <div className="w-20">
                        <Slider
                          value={[isMuted ? 0 : volume * 100]}
                          onValueChange={handleVolumeChange}
                          max={100}
                          step={1}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={playbackSpeed}
                      onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                      className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-white/20"
                    >
                      {tutorial.adaptiveSettings.playbackSpeeds.map(speed => (
                        <option key={speed} value={speed}>{speed}x</option>
                      ))}
                    </select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Current Chapter Indicator */}
            {currentChapter && (
              <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {currentChapter.title}
              </div>
            )}
          </div>

          {/* Assessment Modal */}
          {activeAssessment && (
            <AssessmentModal
              assessment={activeAssessment}
              onSubmit={(answers) => handleAssessmentSubmit(activeAssessment, answers)}
              onSkip={() => setActiveAssessment(null)}
            />
          )}

          {/* Video Content Sections */}
          <div className="p-4 space-y-4">
            {/* Learning Objectives */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Learning Objectives
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                {tutorial.learningObjectives.map((objective, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary font-medium">•</span>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>

            {/* Chapters */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Chapters
              </h3>
              <div className="space-y-2">
                {tutorial.chapters.map((chapter) => (
                  <ChapterItem
                    key={chapter.id}
                    chapter={chapter}
                    isActive={currentChapter?.id === chapter.id}
                    isCompleted={currentTime > chapter.endTime}
                    onClick={() => handleChapterClick(chapter)}
                  />
                ))}
              </div>
            </div>

            {/* Progress Summary */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Progress Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg">{Math.round((currentTime / duration) * 100)}%</div>
                  <div className="text-muted-foreground">Watched</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">
                    {tutorial.chapters.filter(ch => currentTime > ch.endTime).length}/{tutorial.chapters.length}
                  </div>
                  <div className="text-muted-foreground">Chapters</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{assessmentResults.length}/{tutorial.assessments.length}</div>
                  <div className="text-muted-foreground">Assessments</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{userNotes.length}</div>
                  <div className="text-muted-foreground">Notes</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Chapter Item Component
interface ChapterItemProps {
  chapter: VideoChapter;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

const ChapterItem: React.FC<ChapterItemProps> = ({ chapter, isActive, isCompleted, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-colors",
        isActive && "bg-primary/10 border-primary",
        !isActive && "hover:bg-muted border-border"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isCompleted ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : isActive ? (
              <Play className="w-4 h-4 text-primary" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
            )}
            <span className="font-medium text-sm">{chapter.title}</span>
          </div>
          <p className="text-xs text-muted-foreground">{chapter.description}</p>
        </div>
        <div className="text-xs text-muted-foreground ml-2">
          {Math.floor(chapter.startTime / 60)}:{String(Math.floor(chapter.startTime % 60)).padStart(2, '0')}
        </div>
      </div>
    </button>
  );
};

// Assessment Modal Component
interface AssessmentModalProps {
  assessment: VideoAssessment;
  onSubmit: (answers: any[]) => void;
  onSkip: () => void;
}

const AssessmentModal: React.FC<AssessmentModalProps> = ({ assessment, onSubmit, onSkip }) => {
  const [answers, setAnswers] = useState<any[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSubmit = () => {
    onSubmit(answers);
    setShowExplanation(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-md w-full p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Knowledge Check</h3>
        </div>
        
        <p className="mb-4">{assessment.question}</p>
        
        {assessment.type === 'quiz' && assessment.options && (
          <div className="space-y-2 mb-4">
            {assessment.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => setAnswers([option])}
                className={cn(
                  "w-full text-left p-3 rounded border transition-colors",
                  answers.includes(option) ? "bg-primary/10 border-primary" : "hover:bg-muted border-border"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {showExplanation && (
          <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
            <p className="text-sm">{assessment.explanation}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={answers.length === 0 || showExplanation}>
            Submit
          </Button>
          <Button variant="outline" onClick={onSkip}>
            Skip
          </Button>
          {showExplanation && (
            <Button onClick={() => onSubmit(answers)} className="ml-auto">
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoTutorialPlayer;