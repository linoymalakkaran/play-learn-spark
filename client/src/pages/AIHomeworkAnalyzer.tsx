import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDropzone } from 'react-dropzone';
import { geminiService, GeminiAnalysisResponse, Activity, Question } from '@/services/geminiService';
import { 
  Upload, 
  FileText, 
  Image, 
  Film, 
  Music, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Brain,
  Sparkles,
  Play,
  Award,
  Clock,
  Info
} from 'lucide-react';

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  suggestions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  ageRecommendation: string;
  educationalValue: number;
  activities?: Activity[];
}

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  analysis?: AnalysisResult;
}

interface ActivityState {
  currentQuestion: number;
  answers: Record<string, string>;
  score: number;
  completed: boolean;
}

const AIHomeworkAnalyzer: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isBackendAvailable, setIsBackendAvailable] = useState(true); // Always true since we're using Gemini directly
  const [manualText, setManualText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activityStates, setActivityStates] = useState<Record<string, ActivityState>>({});

  // Remove the old backend check since we're using Gemini directly
  // React.useEffect(() => {
  //   const checkBackend = async () => {
  //     try {
  //       const response = await fetch('/api/health');
  //       setIsBackendAvailable(response.ok);
  //     } catch {
  //       setIsBackendAvailable(false);
  //     }
  //   };
  //   checkBackend();
  // }, []);

  const startActivity = (activityId: string) => {
    setActivityStates(prev => ({
      ...prev,
      [activityId]: {
        currentQuestion: 0,
        answers: {},
        score: 0,
        completed: false
      }
    }));
  };

  const answerQuestion = (activityId: string, questionId: string, answer: string) => {
    setActivityStates(prev => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        answers: {
          ...prev[activityId]?.answers,
          [questionId]: answer
        }
      }
    }));
  };

  const nextQuestion = (activityId: string, activity: Activity) => {
    const state = activityStates[activityId];
    if (!state || !activity.questions) return;

    const currentQuestion = activity.questions[state.currentQuestion];
    const userAnswer = state.answers[currentQuestion.id];
    const isCorrect = userAnswer === currentQuestion.correctAnswer;

    setActivityStates(prev => ({
      ...prev,
      [activityId]: {
        ...state,
        currentQuestion: state.currentQuestion + 1,
        score: state.score + (isCorrect ? 1 : 0),
        completed: state.currentQuestion + 1 >= activity.questions!.length
      }
    }));
  };

  const analyzeSampleDocument = async () => {
    setIsAnalyzing(true);
    
    try {
      // Sample kindergarten homework content
      const sampleText = `
KG2 Week 17 Home Learning Practice

Letter Recognition:
- Circle all the letter 'A's in the picture
- Write the letter 'B' three times: B B B
- Match uppercase letters to lowercase: A-a, B-b, C-c

Number Activities:
- Count the apples and write the number: 🍎🍎🍎 = ___
- Circle groups of 5 objects
- Write numbers 1 to 10: 1 2 3 4 5 6 7 8 9 10

Shape Practice:
- Color all the circles red
- Find and circle the triangles
- Draw a square and a rectangle

Basic Writing:
- Trace the dotted lines
- Write your name: _______________
- Copy the simple words: cat, dog, sun
      `;

      const analysis = await geminiService.analyzeHomework({ 
        text: sampleText,
        fileType: 'text' 
      });

      const sampleId = 'sample-' + Math.random().toString(36).substr(2, 9);
      const sampleFile = new File([sampleText], 'KG2-Week17-Sample.txt', { type: 'text/plain' });
      
      const newFile: UploadedFile = {
        id: sampleId,
        file: sampleFile,
        status: 'completed',
        progress: 100,
        analysis
      };

      setUploadedFiles(prev => [newFile, ...prev]);
    } catch (error) {
      console.error('Error analyzing sample:', error);
      alert('Error analyzing sample document. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Process files with real AI analysis
    newFiles.forEach(uploadedFile => {
      // Set to processing state immediately
      setUploadedFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? { ...f, status: 'processing', progress: 50 } : f
      ));
      
      // Process the file
      simulateFileProcessing(uploadedFile.id);
    });
  }, [uploadedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'text/*': ['.txt', '.doc', '.docx'],
      'audio/*': ['.mp3', '.wav'],
      'video/*': ['.mp4', '.avi']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const simulateFileProcessing = async (fileId: string) => {
    // Get the current file from state
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId)?.file;
      if (!file) return prev;

      // Process the file asynchronously
      (async () => {
        try {
          // Update to processing status
          setUploadedFiles(currentFiles => currentFiles.map(f => 
            f.id === fileId ? { ...f, status: 'processing', progress: 100 } : f
          ));

          let analysis: GeminiAnalysisResponse;

          if (file.type.startsWith('image/')) {
            // Handle image files
            const base64 = await geminiService.fileToBase64(file);
            analysis = await geminiService.analyzeImage(base64, file.type);
          } else if (file.type === 'application/pdf') {
            // For PDF files, show an informative message
            analysis = {
              summary: 'PDF file detected. For best results, please convert to text or image format.',
              keyPoints: ['PDF processing requires text extraction', 'Consider converting to image or text format'],
              suggestions: ['Convert PDF to image format', 'Copy text content and paste manually', 'Use screenshot tool for individual pages'],
              difficulty: 'medium',
              ageRecommendation: '6-12 years',
              educationalValue: 50,
              activities: []
            };
          } else {
            // Handle text files
            const text = await file.text();
            analysis = await geminiService.analyzeHomework({ text, fileType: 'text' });
          }

          // Update with completed analysis
          setUploadedFiles(currentFiles => currentFiles.map(f => 
            f.id === fileId 
              ? { ...f, status: 'completed', analysis }
              : f
          ));

        } catch (error) {
          console.error('Error processing file:', error);
          setUploadedFiles(currentFiles => currentFiles.map(f => 
            f.id === fileId 
              ? { ...f, status: 'error', progress: 0 }
              : f
          ));
        }
      })();

      return prev;
    });
  };

  const analyzeManualText = async () => {
    if (!manualText.trim()) return;

    setIsAnalyzing(true);
    
    try {
      const analysis = await geminiService.analyzeHomework({ 
        text: manualText,
        fileType: 'text' 
      });

      const mockId = Math.random().toString(36).substr(2, 9);
      const mockFile = new File([manualText], 'manual-input.txt', { type: 'text/plain' });
      
      const newFile: UploadedFile = {
        id: mockId,
        file: mockFile,
        status: 'completed',
        progress: 100,
        analysis
      };

      setUploadedFiles(prev => [...prev, newFile]);
      setManualText('');
    } catch (error) {
      console.error('Error analyzing text:', error);
      // Show error to user or fallback to mock data
      alert('Error analyzing text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-8 h-8" />;
    if (file.type.startsWith('video/')) return <Film className="w-8 h-8" />;
    if (file.type.startsWith('audio/')) return <Music className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-purple-600" />
          AI Homework Analyzer
        </h1>
        <p className="text-gray-600">
          Upload your homework documents and get instant AI-powered analysis and suggestions
        </p>
        <p className="text-sm text-purple-600 font-medium">
          ✨ Powered by Google Gemini AI
        </p>
      </div>

      {/* Example Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <FileText className="w-5 h-5" />
            Try Our Example
          </CardTitle>
          <CardDescription className="text-blue-700">
            See how our AI analyzes homework by trying this sample kindergarten worksheet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800">Sample: KG2 Week 17 Home Learning Practice</h4>
              <p className="text-sm text-blue-700">
                This is a real kindergarten homework worksheet that includes:
              </p>
              <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                <li>Letter recognition exercises</li>
                <li>Number counting activities</li>
                <li>Shape identification tasks</li>
                <li>Basic writing practice</li>
              </ul>
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.open('/sample-homework.pdf', '_blank')}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Sample PDF
                </Button>
                <Button 
                  onClick={analyzeSampleDocument}
                  disabled={isAnalyzing}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Try This Example
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h5 className="font-medium mb-2 text-gray-800">What you'll get:</h5>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Detailed content analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Age-appropriate feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Learning suggestions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Interactive practice activities</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Use Instructions */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Info className="w-5 h-5" />
            How to Use
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-700 font-bold text-lg">1</span>
              </div>
              <h4 className="font-medium text-green-800">Upload or Type</h4>
              <p className="text-sm text-green-700">
                Upload homework photos, documents, or type text directly
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-700 font-bold text-lg">2</span>
              </div>
              <h4 className="font-medium text-green-800">AI Analysis</h4>
              <p className="text-sm text-green-700">
                Our AI analyzes content and provides educational insights
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-green-700 font-bold text-lg">3</span>
              </div>
              <h4 className="font-medium text-green-800">Practice & Learn</h4>
              <p className="text-sm text-green-700">
                Complete generated activities to reinforce learning
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Documents
          </CardTitle>
          <CardDescription>
            Drag and drop files here or click to browse. Supports PDF, images, text, audio, and video files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="bg-gray-100 px-2 py-1 rounded">📄 PDF</span>
              <span className="bg-gray-100 px-2 py-1 rounded">🖼️ JPG, PNG, GIF</span>
              <span className="bg-gray-100 px-2 py-1 rounded">📝 TXT, DOC</span>
              <span className="bg-gray-100 px-2 py-1 rounded">🎵 MP3, WAV</span>
              <span className="bg-gray-100 px-2 py-1 rounded">🎬 MP4, AVI</span>
            </div>
          </div>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-purple-400 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-purple-600 font-medium">Drop files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Drag files here or click to upload</p>
                <p className="text-sm text-gray-400">Maximum file size: 50MB</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Text Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Manual Text Input
          </CardTitle>
          <CardDescription>
            Type or paste text directly for instant analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your homework text here..."
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button 
            onClick={analyzeManualText}
            disabled={!manualText.trim() || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Text
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              View the AI analysis for your uploaded documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedFiles.map((uploadedFile) => (
              <div key={uploadedFile.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(uploadedFile.file)}
                    <div>
                      <p className="font-medium">{uploadedFile.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(uploadedFile.status)}
                    <span className="text-sm capitalize text-gray-600">
                      {uploadedFile.status}
                    </span>
                  </div>
                </div>

                {(uploadedFile.status === 'uploading' || uploadedFile.status === 'processing') && (
                  <div className="space-y-1">
                    <Progress value={uploadedFile.progress} className="w-full" />
                    <p className="text-sm text-gray-500">
                      {uploadedFile.status === 'uploading' ? 'Uploading...' : 'Processing with AI...'} {uploadedFile.progress.toFixed(0)}%
                    </p>
                  </div>
                )}

                {uploadedFile.status === 'completed' && uploadedFile.analysis && (
                  <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        AI Analysis
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{uploadedFile.analysis.difficulty}</Badge>
                        <Badge variant="secondary">{uploadedFile.analysis.ageRecommendation}</Badge>
                        <Badge 
                          variant={uploadedFile.analysis.educationalValue > 80 ? "default" : "secondary"}
                        >
                          {uploadedFile.analysis.educationalValue}% Educational Value
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Summary</h5>
                      <p className="text-gray-700">{uploadedFile.analysis.summary}</p>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Key Points</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {uploadedFile.analysis.keyPoints.map((point, index) => (
                          <li key={index} className="text-gray-700">{point}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Suggestions for Improvement</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {uploadedFile.analysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-gray-700">{suggestion}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Interactive Activities */}
                    {uploadedFile.analysis.activities && uploadedFile.analysis.activities.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <Play className="w-4 h-4 text-green-600" />
                          Practice Activities
                        </h5>
                        <div className="space-y-4">
                          {uploadedFile.analysis.activities.map((activity) => (
                            <Card key={activity.id} className="border-green-200">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-lg">{activity.title}</CardTitle>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{activity.difficulty}</Badge>
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {activity.estimatedTime}m
                                    </Badge>
                                  </div>
                                </div>
                                <CardDescription>{activity.description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                {!activityStates[activity.id] ? (
                                  <Button 
                                    onClick={() => startActivity(activity.id)}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Start Activity
                                  </Button>
                                ) : (
                                  <ActivityPlayer 
                                    activity={activity}
                                    state={activityStates[activity.id]}
                                    onAnswer={(questionId, answer) => answerQuestion(activity.id, questionId, answer)}
                                    onNext={() => nextQuestion(activity.id, activity)}
                                  />
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Activity Player Component
interface ActivityPlayerProps {
  activity: Activity;
  state: ActivityState;
  onAnswer: (questionId: string, answer: string) => void;
  onNext: () => void;
}

const ActivityPlayer: React.FC<ActivityPlayerProps> = ({ activity, state, onAnswer, onNext }) => {
  if (!activity.questions || activity.questions.length === 0) {
    return <div className="text-center text-gray-500">No questions available for this activity.</div>;
  }

  if (state.completed) {
    const percentage = Math.round((state.score / activity.questions.length) * 100);
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl mb-2">
          {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
        </div>
        <h3 className="text-xl font-bold">Activity Completed!</h3>
        <p className="text-gray-600">
          You scored {state.score} out of {activity.questions.length} ({percentage}%)
        </p>
        <Progress value={percentage} className="w-full" />
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Award className="w-4 h-4" />
          {percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job!' : 'Keep practicing!'}
        </div>
      </div>
    );
  }

  const currentQuestion = activity.questions[state.currentQuestion];
  const userAnswer = state.answers[currentQuestion.id];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Question {state.currentQuestion + 1} of {activity.questions.length}
        </span>
        <Progress value={((state.currentQuestion) / activity.questions.length) * 100} className="w-32" />
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">{currentQuestion.question}</h4>
        
        {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={userAnswer === option ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => onAnswer(currentQuestion.id, option)}
              >
                {String.fromCharCode(65 + index)}. {option}
              </Button>
            ))}
          </div>
        )}

        {currentQuestion.type === 'true_false' && (
          <div className="flex gap-2">
            <Button
              variant={userAnswer === 'true' ? "default" : "outline"}
              className="flex-1"
              onClick={() => onAnswer(currentQuestion.id, 'true')}
            >
              True
            </Button>
            <Button
              variant={userAnswer === 'false' ? "default" : "outline"}
              className="flex-1"
              onClick={() => onAnswer(currentQuestion.id, 'false')}
            >
              False
            </Button>
          </div>
        )}

        {currentQuestion.type === 'short_answer' && (
          <Textarea
            placeholder="Type your answer here..."
            value={userAnswer || ''}
            onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
            rows={3}
          />
        )}
      </div>

      <Button 
        onClick={onNext}
        disabled={!userAnswer}
        className="w-full"
      >
        {state.currentQuestion + 1 >= activity.questions.length ? 'Finish' : 'Next Question'}
      </Button>
    </div>
  );
};

export default AIHomeworkAnalyzer;