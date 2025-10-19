import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDropzone } from 'react-dropzone';
import { geminiService } from '@/services/geminiService';
import { InteractiveActivity } from '@/types/ActivityTemplates';
import { activityCacheService } from '@/services/ActivityCacheService';
import InteractiveActivityPlayer from '@/components/InteractiveActivityPlayer';
import { 
  Upload, 
  FileText, 
  Image, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Brain,
  Sparkles,
  Play,
  Clock,
  Gamepad2,
  Star,
  Database,
  RefreshCw
} from 'lucide-react';

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  suggestions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  ageRecommendation: string;
  educationalValue: number;
  interactiveActivities?: InteractiveActivity[];
}

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  analysis?: AnalysisResult;
  errorMessage?: string;
}

const AIHomeworkAnalyzer: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [manualText, setManualText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<InteractiveActivity | null>(null);
  const [activeTab, setActiveTab] = useState('upload');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'uploading' as const
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    for (const uploadedFile of newFiles) {
      await processFile(uploadedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt']
    },
    maxSize: 10485760
  });

  const processFile = async (uploadedFile: UploadedFile) => {
    try {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'processing' }
            : f
        )
      );

      const analysis = await geminiService.analyzeHomework({
        text: await uploadedFile.file.text(),
        generateActivities: true
      });
      
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { ...f, status: 'completed', analysis }
            : f
        )
      );
    } catch (error) {
      console.error('Analysis error:', error);
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === uploadedFile.id 
            ? { 
                ...f, 
                status: 'error', 
                errorMessage: error instanceof Error ? error.message : 'Analysis failed'
              }
            : f
        )
      );
    }
  };

  const analyzeManualText = async () => {
    if (!manualText.trim()) return;

    setIsAnalyzing(true);
    try {
      const analysis = await geminiService.analyzeHomework({
        text: manualText,
        generateActivities: true
      });
      setAnalysisResult(analysis);
    } catch (error) {
      console.error('Text analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openInteractiveActivity = (activity: InteractiveActivity) => {
    setSelectedActivity(activity);
  };

  const getCacheStats = () => {
    return activityCacheService.getCacheStats();
  };

  const clearCache = () => {
    activityCacheService.clearCache();
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <Image className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader className="pb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-full">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">��� AI Homework Analyzer</CardTitle>
                <CardDescription className="text-blue-100 text-lg">
                  Upload your homework and get interactive learning activities! ���
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Enter Text
            </TabsTrigger>
            <TabsTrigger value="cache" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Cache Manager
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Learning Materials
                </CardTitle>
                <CardDescription>
                  Drop your homework files here or click to browse! ���
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    {isDragActive ? (
                      <p className="text-lg text-blue-600 font-medium">Drop the files here! ���</p>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-gray-700">Drag & drop files here</p>
                        <p className="text-sm text-gray-500 mt-1">or click to select files</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Supports: Images, PDFs, Word docs (max 10MB) 📄
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Example Files Section */}
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    📚 Example Files You Can Upload:
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded p-3 border">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-red-500" />
                        <span className="font-medium text-sm">📄 PDF Homework</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        • Math worksheets with problems<br/>
                        • Reading comprehension passages<br/>
                        • Science diagrams and questions<br/>
                        • History timeline assignments
                      </p>
                    </div>
                    <div className="bg-white rounded p-3 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Image className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-sm">🖼️ Images & Photos</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        • Photos of handwritten homework<br/>
                        • Whiteboard math problems<br/>
                        • Textbook pages and exercises<br/>
                        • Drawing and art assignments
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {uploadedFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Files & Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {uploadedFiles.map((uploadedFile) => (
                    <div key={uploadedFile.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(uploadedFile.file)}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{uploadedFile.file.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(uploadedFile.file.size)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {uploadedFile.status === 'processing' && (
                            <div className="flex items-center gap-2 text-yellow-600">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Analyzing...</span>
                            </div>
                          )}
                          {uploadedFile.status === 'completed' && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm">Complete</span>
                            </div>
                          )}
                          {uploadedFile.status === 'error' && (
                            <div className="flex items-center gap-2 text-red-600">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm">Error</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {uploadedFile.analysis && uploadedFile.analysis.interactiveActivities && (
                        <div className="space-y-4 pt-4 border-t">
                          <h5 className="font-semibold flex items-center gap-2">
                            <Gamepad2 className="w-4 h-4 text-green-600" />
                            ��� Interactive Learning Games
                          </h5>
                          <div className="grid gap-3">
                            {uploadedFile.analysis.interactiveActivities.map((activity) => (
                              <Card key={activity.id} className="border-green-200">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-lg">{activity.title}</CardTitle>
                                  <CardDescription>{activity.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <Button 
                                    onClick={() => openInteractiveActivity(activity)}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    ��� Start Game!
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enter Text for Analysis</CardTitle>
                <CardDescription>Type or paste your homework content here! ✍️</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your homework content here... ���"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  rows={8}
                  className="min-h-[200px]"
                />
                <Button 
                  onClick={analyzeManualText}
                  disabled={!manualText.trim() || isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing... ���
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      ��� Analyze Text
                    </>
                  )}
                </Button>

                {/* Text Examples Section */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    ✨ Try These Example Texts:
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-blue-700">📚 Reading Comprehension</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setManualText("The sun is the closest star to Earth. It provides light and heat that make life possible on our planet. The sun is about 93 million miles away from Earth. It takes about 8 minutes for sunlight to travel from the sun to Earth. Without the sun, Earth would be a cold, dark place where nothing could live.")}
                        >
                          Try This
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 italic">
                        "The sun is the closest star to Earth. It provides light and heat..."
                      </p>
                    </div>
                    
                    <div className="bg-white rounded p-3 border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-green-700">🔢 Math Word Problems</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setManualText("Sarah has 15 apples. She gives 3 apples to her friend Tom and 5 apples to her sister Lisa. How many apples does Sarah have left? Show your work and explain your answer.")}
                        >
                          Try This
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 italic">
                        "Sarah has 15 apples. She gives 3 apples to her friend Tom..."
                      </p>
                    </div>

                    <div className="bg-white rounded p-3 border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-purple-700">🔤 Vocabulary & Spelling</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setManualText("Today's vocabulary words: 1. Adventure - an exciting or unusual experience. 2. Courage - the ability to do something that frightens you. 3. Explore - to investigate or travel through. 4. Discover - to find something for the first time. Use each word in a sentence.")}
                        >
                          Try This
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 italic">
                        "Today's vocabulary words: Adventure, Courage, Explore..."
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {analysisResult && analysisResult.interactiveActivities && (
              <Card>
                <CardHeader>
                  <CardTitle>��� Interactive Learning Games</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {analysisResult.interactiveActivities.map((activity) => (
                      <Card key={activity.id} className="border-green-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{activity.title}</CardTitle>
                          <CardDescription>{activity.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button 
                            onClick={() => openInteractiveActivity(activity)}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            ��� Start Game!
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cache" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Cache Management</CardTitle>
                <CardDescription>Manage cached activities! ⚡</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{getCacheStats().totalEntries}</div>
                    <div className="text-sm text-gray-600">📦 Cached Activities</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {getCacheStats().newestEntry ? getCacheStats().newestEntry.toLocaleDateString() : 'None'}
                    </div>
                    <div className="text-sm text-gray-600">📅 Latest Entry</div>
                  </div>
                </div>

                <Button 
                  onClick={clearCache}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  ���️ Clear All Cache
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">��� {selectedActivity.title}</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedActivity(null)}
                  >
                    ✕
                  </Button>
                </div>
                <InteractiveActivityPlayer 
                  activity={selectedActivity}
                  onComplete={(score, totalQuestions) => {
                    setSelectedActivity(null);
                  }}
                  onClose={() => setSelectedActivity(null)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIHomeworkAnalyzer;
