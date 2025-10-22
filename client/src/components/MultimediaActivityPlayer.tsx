import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { InteractiveActivity, InteractiveQuestion } from '@/types/ActivityTemplates';
import { 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  CheckCircle, 
  XCircle, 
  Star, 
  Trophy, 
  Clock,
  Lightbulb,
  RotateCcw,
  ArrowRight,
  Heart,
  Maximize,
  Minimize,
  SkipForward,
  Rewind,
  Camera,
  Mic,
  Square,
  Download,
  Upload,
  Headphones,
  Video,
  Image as ImageIcon,
  Palette,
  Sparkles,
  Target,
  Award,
  Gamepad2
} from 'lucide-react';

interface MultimediaActivityPlayerProps {
  activity: InteractiveActivity;
  onComplete: (score: number, timeSpent: number, responses: any[]) => void;
  onClose: () => void;
  enableMultimedia?: boolean;
  enableRecording?: boolean;
  enableDrawing?: boolean;
}

interface MediaState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

interface GameState {
  currentQuestionIndex: number;
  answers: Record<string, any>;
  score: number;
  showHint: boolean;
  attempts: number;
  startTime: number;
  questionStartTime: number;
  completed: boolean;
  responses: any[];
  mediaUploads: Record<string, File[]>;
  drawings: Record<string, string>; // base64 encoded images
  recordings: Record<string, Blob[]>;
}

interface DrawingState {
  isDrawing: boolean;
  currentPath: string;
  color: string;
  brushSize: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const MultimediaActivityPlayer: React.FC<MultimediaActivityPlayerProps> = ({
  activity,
  onComplete,
  onClose,
  enableMultimedia = true,
  enableRecording = true,
  enableDrawing = true
}) => {
  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Core state
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    answers: {},
    score: 0,
    showHint: false,
    attempts: 0,
    startTime: Date.now(),
    questionStartTime: Date.now(),
    completed: false,
    responses: [],
    mediaUploads: {},
    drawings: {},
    recordings: {}
  });

  // UI state
  const [selectedAnswer, setSelectedAnswer] = useState<any>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Media state
  const [mediaState, setMediaState] = useState<MediaState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false
  });

  // Drawing state
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    currentPath: '',
    color: '#000000',
    brushSize: 5,
    canvasRef
  });

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasCamera, setHasCamera] = useState(false);
  const [hasMicrophone, setHasMicrophone] = useState(false);

  const currentQuestion = activity.questions[gameState.currentQuestionIndex];
  const progress = ((gameState.currentQuestionIndex + 1) / activity.questions.length) * 100;

  // Initialize media permissions
  useEffect(() => {
    if (enableRecording) {
      checkMediaPermissions();
    }
  }, [enableRecording]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const checkMediaPermissions = async () => {
    try {
      // Check for camera
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCamera(true);
      videoStream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.log('Camera not available');
    }

    try {
      // Check for microphone
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicrophone(true);
      audioStream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.log('Microphone not available');
    }
  };

  // Media Controls
  const handlePlayPause = () => {
    if (currentQuestion?.type === 'video' && videoRef.current) {
      if (mediaState.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    } else if (audioRef.current) {
      if (mediaState.isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const handleVolumeChange = (volume: number[]) => {
    const newVolume = volume[0];
    setMediaState(prev => ({ ...prev, volume: newVolume }));
    
    if (audioRef.current) audioRef.current.volume = newVolume;
    if (videoRef.current) videoRef.current.volume = newVolume;
  };

  const toggleMute = () => {
    setMediaState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    
    if (audioRef.current) audioRef.current.muted = !mediaState.isMuted;
    if (videoRef.current) videoRef.current.muted = !mediaState.isMuted;
  };

  // Drawing Functions
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!enableDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDrawingState(prev => ({ ...prev, isDrawing: true }));
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = drawingState.color;
      ctx.lineWidth = drawingState.brushSize;
      ctx.lineCap = 'round';
    }
  }, [enableDrawing, drawingState.color, drawingState.brushSize]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingState.isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }, [drawingState.isDrawing]);

  const stopDrawing = useCallback(() => {
    if (!canvasRef.current) return;
    
    setDrawingState(prev => ({ ...prev, isDrawing: false }));
    
    // Save drawing
    const canvas = canvasRef.current;
    const drawingData = canvas.toDataURL();
    setGameState(prev => ({
      ...prev,
      drawings: {
        ...prev.drawings,
        [currentQuestion.id]: drawingData
      }
    }));
  }, [currentQuestion?.id]);

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: hasMicrophone,
        video: hasCamera && currentQuestion?.type === 'video'
      });

      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setGameState(prev => ({
          ...prev,
          recordings: {
            ...prev.recordings,
            [currentQuestion.id]: [...(prev.recordings[currentQuestion.id] || []), blob]
          }
        }));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  // File Upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !currentQuestion) return;

    const newFiles = Array.from(files);
    setGameState(prev => ({
      ...prev,
      mediaUploads: {
        ...prev.mediaUploads,
        [currentQuestion.id]: [...(prev.mediaUploads[currentQuestion.id] || []), ...newFiles]
      }
    }));
  };

  // Answer Handling
  const handleAnswerSelect = (answerId: string, answerValue: any) => {
    setSelectedAnswer(answerValue);
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;

    const response = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      drawing: gameState.drawings[currentQuestion.id],
      recordings: gameState.recordings[currentQuestion.id] || [],
      uploads: gameState.mediaUploads[currentQuestion.id] || [],
      timeSpent: Date.now() - gameState.questionStartTime
    };

    const correct = Array.isArray(currentQuestion.correctAnswer) 
      ? currentQuestion.correctAnswer.includes(selectedAnswer)
      : currentQuestion.correctAnswer === selectedAnswer;

    setIsCorrect(correct);
    setShowFeedback(true);

    setGameState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: selectedAnswer },
      score: correct ? prev.score + 1 : prev.score,
      attempts: prev.attempts + 1,
      responses: [...prev.responses, response]
    }));

    // Auto-advance after showing feedback
    setTimeout(() => {
      if (gameState.currentQuestionIndex < activity.questions.length - 1) {
        nextQuestion();
      } else {
        completeActivity();
      }
    }, 2000);
  };

  const nextQuestion = () => {
    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      showHint: false,
      questionStartTime: Date.now()
    }));
    setSelectedAnswer('');
    setShowFeedback(false);
    setIsCorrect(false);
    clearCanvas();
  };

  const completeActivity = () => {
    const timeSpent = Date.now() - gameState.startTime;
    setGameState(prev => ({ ...prev, completed: true }));
    setShowCelebration(true);
    
    setTimeout(() => {
      onComplete(gameState.score, timeSpent, gameState.responses);
    }, 3000);
  };

  const showHint = () => {
    setGameState(prev => ({ ...prev, showHint: true }));
  };

  const restartActivity = () => {
    setGameState({
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      showHint: false,
      attempts: 0,
      startTime: Date.now(),
      questionStartTime: Date.now(),
      completed: false,
      responses: [],
      mediaUploads: {},
      drawings: {},
      recordings: {}
    });
    setSelectedAnswer('');
    setShowFeedback(false);
    setIsCorrect(false);
    setShowCelebration(false);
    clearCanvas();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showCelebration) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center z-50">
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold text-purple-800 mb-2">
              {activity.rewards.celebrationMessage}
            </h2>
            <div className="flex justify-center gap-2 mb-4">
              {activity.rewards.stickers.map((sticker, index) => (
                <span key={index} className="text-3xl animate-pulse" style={{ animationDelay: `${index * 0.2}s` }}>
                  {sticker}
                </span>
              ))}
            </div>
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 rounded-lg mb-4">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                <span className="font-bold">Score: {gameState.score}/{activity.questions.length}</span>
              </div>
              <div className="text-sm mt-1">+{activity.rewards.points} points earned!</div>
            </div>
            <div className="flex gap-2 justify-center">
              {activity.rewards.badges.map((badge, index) => (
                <Badge key={index} className="bg-purple-600 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className={`w-full ${isFullscreen ? 'fixed inset-4 z-50' : 'max-w-6xl mx-auto'}`}>
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Gamepad2 className="w-6 h-6" />
              {activity.title}
            </CardTitle>
            <p className="text-purple-100 mt-1">{activity.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
            <div className="text-right">
              <div className="text-sm text-purple-100">Question {gameState.currentQuestionIndex + 1} of {activity.questions.length}</div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{activity.estimatedTime} min</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full h-3" />
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-blue-800 font-medium">{activity.instructions}</p>
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <div className="space-y-6">
            {/* Question Text */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {currentQuestion.question}
              </h3>
              
              {/* Visual Elements */}
              {currentQuestion.visualElements && (
                <div className="flex justify-center items-center gap-4 mb-6 min-h-[100px]">
                  {currentQuestion.visualElements.map((element, index) => (
                    <div 
                      key={index} 
                      className={`text-${element.size === 'large' ? '6xl' : element.size === 'medium' ? '4xl' : '2xl'}`}
                      style={{ color: element.color }}
                    >
                      {element.content}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Multimedia Content */}
            {enableMultimedia && (
              <div className="space-y-4">
                {/* Audio Player */}
                {currentQuestion.type === 'audio' && (
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePlayPause}
                          className="shrink-0"
                        >
                          {mediaState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        
                        <div className="flex-1">
                          <Progress value={(mediaState.currentTime / mediaState.duration) * 100} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{formatTime(Math.floor(mediaState.currentTime))}</span>
                            <span>{formatTime(Math.floor(mediaState.duration))}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMute}
                          >
                            {mediaState.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </Button>
                          <div className="w-20">
                            <Slider
                              value={[mediaState.volume]}
                              onValueChange={handleVolumeChange}
                              max={1}
                              step={0.1}
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                      <audio ref={audioRef} className="hidden">
                        <source src="/api/placeholder-audio.mp3" type="audio/mpeg" />
                      </audio>
                    </CardContent>
                  </Card>
                )}

                {/* Video Player */}
                {currentQuestion.type === 'video' && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="relative bg-black rounded-lg overflow-hidden">
                        <video
                          ref={videoRef}
                          className="w-full h-64 object-cover"
                          controls
                          onPlay={() => setMediaState(prev => ({ ...prev, isPlaying: true }))}
                          onPause={() => setMediaState(prev => ({ ...prev, isPlaying: false }))}
                        >
                          <source src="/api/placeholder-video.mp4" type="video/mp4" />
                        </video>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Drawing Canvas */}
            {enableDrawing && currentQuestion.type === 'drawing' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Palette className="w-5 h-5" />
                    Drawing Area
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Drawing Tools */}
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Color:</label>
                      <input
                        type="color"
                        value={drawingState.color}
                        onChange={(e) => setDrawingState(prev => ({ ...prev, color: e.target.value }))}
                        className="w-8 h-8 rounded border"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Size:</label>
                      <Slider
                        value={[drawingState.brushSize]}
                        onValueChange={(value) => setDrawingState(prev => ({ ...prev, brushSize: value[0] }))}
                        max={20}
                        min={1}
                        step={1}
                        className="w-20"
                      />
                      <span className="text-sm text-gray-600">{drawingState.brushSize}px</span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearCanvas}
                      className="ml-auto"
                    >
                      Clear
                    </Button>
                  </div>

                  {/* Canvas */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={400}
                      className="border border-gray-200 rounded cursor-crosshair bg-white w-full"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recording Section */}
            {enableRecording && (hasMicrophone || hasCamera) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mic className="w-5 h-5" />
                    Recording
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Start Recording
                      </Button>
                    ) : (
                      <Button
                        onClick={stopRecording}
                        variant="outline"
                        className="border-red-500 text-red-500"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Stop Recording ({formatTime(recordingTime)})
                      </Button>
                    )}
                    
                    {gameState.recordings[currentQuestion.id]?.length > 0 && (
                      <Badge variant="secondary">
                        {gameState.recordings[currentQuestion.id].length} recording(s) saved
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* File Upload */}
            {enableMultimedia && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Upload className="w-5 h-5" />
                    Upload Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*,audio/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click to upload images, audio, or video files</p>
                    </label>
                    
                    {gameState.mediaUploads[currentQuestion.id]?.length > 0 && (
                      <div className="mt-4">
                        <Badge variant="secondary">
                          {gameState.mediaUploads[currentQuestion.id].length} file(s) uploaded
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentQuestion.options?.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(option.id, option.value)}
                  disabled={showFeedback}
                  className={`
                    p-6 rounded-lg border-2 transition-all duration-200 text-center
                    ${selectedAnswer === option.value 
                      ? 'border-purple-500 bg-purple-50 shadow-lg' 
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                    }
                    ${showFeedback ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:shadow-md'}
                  `}
                >
                  {option.visual && (
                    <div className="text-3xl mb-2">{option.visual}</div>
                  )}
                  <div className="font-semibold text-gray-800">{option.value}</div>
                </button>
              ))}
            </div>

            {/* Hint Section */}
            {gameState.showHint && currentQuestion.hints && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Hint:</h4>
                    <p className="text-yellow-700">{currentQuestion.hints[0]}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Section */}
            {showFeedback && (
              <div className={`border rounded-lg p-4 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {isCorrect ? currentQuestion.feedback.correct : currentQuestion.feedback.incorrect}
                    </p>
                    {!isCorrect && (
                      <p className="text-gray-600 mt-1 text-sm">
                        {currentQuestion.feedback.encouragement}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <div className="flex gap-2">
                {!gameState.showHint && !showFeedback && currentQuestion.hints && (
                  <Button
                    onClick={showHint}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Need a Hint?
                  </Button>
                )}
                <Button onClick={restartActivity} variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart
                </Button>
              </div>

              <div className="flex gap-2">
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
                {!showFeedback && (
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={!selectedAnswer && currentQuestion.type !== 'drawing'}
                    className="flex items-center gap-2"
                  >
                    Submit Answer
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Score Display */}
            <div className="flex justify-center">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>Score: {gameState.score}/{activity.questions.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Points: {activity.rewards.points}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span>Attempts: {gameState.attempts}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultimediaActivityPlayer;