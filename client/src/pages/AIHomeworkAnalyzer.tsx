import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useDropzone } from 'react-dropzone';
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
  Sparkles
} from 'lucide-react';

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  suggestions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  ageRecommendation: string;
  educationalValue: number;
}

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  analysis?: AnalysisResult;
}

const AIHomeworkAnalyzer: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [manualText, setManualText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Check backend availability
  React.useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/health');
        setIsBackendAvailable(response.ok);
      } catch {
        setIsBackendAvailable(false);
      }
    };
    checkBackend();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'uploading',
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate file upload and processing
    newFiles.forEach(uploadedFile => {
      simulateFileProcessing(uploadedFile.id);
    });
  }, []);

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

  const simulateFileProcessing = (fileId: string) => {
    // Simulate upload progress
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(uploadInterval);
        
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, status: 'processing', progress: 100 }
            : file
        ));

        // Simulate AI analysis
        setTimeout(() => {
          const mockAnalysis: AnalysisResult = {
            summary: 'This homework appears to be a math worksheet focusing on basic arithmetic operations.',
            keyPoints: [
              'Contains addition and subtraction problems',
              'Grade level appears to be elementary (2nd-3rd grade)',
              'Some answers are correct, others need review'
            ],
            suggestions: [
              'Practice more with carrying numbers in addition',
              'Review subtraction with borrowing',
              'Use visual aids like counting blocks for better understanding'
            ],
            difficulty: 'medium',
            ageRecommendation: '7-9 years',
            educationalValue: 85
          };

          setUploadedFiles(prev => prev.map(file => 
            file.id === fileId 
              ? { ...file, status: 'completed', analysis: mockAnalysis }
              : file
          ));
        }, 2000);
      } else {
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileId 
            ? { ...file, progress }
            : file
        ));
      }
    }, 100);
  };

  const analyzeManualText = async () => {
    if (!manualText.trim()) return;

    setIsAnalyzing(true);
    
    // Simulate AI analysis of manual text
    setTimeout(() => {
      const mockId = Math.random().toString(36).substr(2, 9);
      const mockFile = new File([manualText], 'manual-input.txt', { type: 'text/plain' });
      
      const mockAnalysis: AnalysisResult = {
        summary: 'This text appears to be a creative writing assignment or story.',
        keyPoints: [
          'Shows good imagination and creativity',
          'Grammar and spelling need some attention',
          'Story structure is developing well'
        ],
        suggestions: [
          'Read more books to expand vocabulary',
          'Practice writing shorter sentences',
          'Ask for help with spelling difficult words'
        ],
        difficulty: 'medium',
        ageRecommendation: '8-12 years',
        educationalValue: 78
      };

      const newFile: UploadedFile = {
        id: mockId,
        file: mockFile,
        status: 'completed',
        progress: 100,
        analysis: mockAnalysis
      };

      setUploadedFiles(prev => [...prev, newFile]);
      setManualText('');
      setIsAnalyzing(false);
    }, 2000);
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-purple-600" />
          AI Homework Analyzer
        </h1>
        <p className="text-gray-600">
          Upload your homework documents and get instant AI-powered analysis and suggestions
        </p>
      </div>

      {!isBackendAvailable && (
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Backend server is not available. File analysis will use simulated data for demonstration purposes.
          </AlertDescription>
        </Alert>
      )}

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

export default AIHomeworkAnalyzer;