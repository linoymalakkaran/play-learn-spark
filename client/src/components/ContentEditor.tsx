import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image as ImageIcon,
  Video,
  Headphones,
  Type,
  Palette,
  Eye,
  Save,
  Undo,
  Redo,
  Download,
  Upload,
  Wand2,
  Sparkles,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Edit,
  Trash2,
  Copy,
  Plus,
  Grid,
  Layers,
  FileText,
  Mic,
  StopCircle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Square,
  Circle,
  Triangle,
  Pencil,
  Eraser,
  PaintBucket,
  Camera,
  MonitorPlay,
  MousePointer,
  Hand
} from 'lucide-react';

interface ContentEditorProps {
  initialContent?: any;
  onContentSave?: (content: any) => void;
  mode?: 'full' | 'simple';
  readOnly?: boolean;
}

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  name: string;
  size: number;
  duration?: number;
  thumbnail?: string;
}

interface DrawingTool {
  type: 'pen' | 'eraser' | 'fill' | 'line' | 'rectangle' | 'circle' | 'triangle' | 'text';
  color: string;
  size: number;
  opacity: number;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  initialContent,
  onContentSave,
  mode = 'full',
  readOnly = false
}) => {
  // State
  const [content, setContent] = useState(initialContent || {
    text: '',
    media: [],
    drawings: [],
    interactive: []
  });
  const [activeTab, setActiveTab] = useState<'text' | 'media' | 'interactive' | 'preview'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
  
  // Text Editor State
  const [fontSize, setFontSize] = useState(14);
  const [fontColor, setFontColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [currentFormat, setCurrentFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
    align: 'left'
  });

  // Drawing State
  const [drawingTool, setDrawingTool] = useState<DrawingTool>({
    type: 'pen',
    color: '#000000',
    size: 5,
    opacity: 1
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingContextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Media State
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([
    {
      id: '1',
      type: 'image',
      url: '/images/sample1.jpg',
      name: 'Sample Image 1',
      size: 1024000,
      thumbnail: '/images/thumb1.jpg'
    },
    {
      id: '2',
      type: 'video',
      url: '/videos/sample1.mp4',
      name: 'Educational Video',
      size: 5120000,
      duration: 120,
      thumbnail: '/videos/thumb1.jpg'
    },
    {
      id: '3',
      type: 'audio',
      url: '/audio/sample1.mp3',
      name: 'Nature Sounds',
      size: 2048000,
      duration: 180
    }
  ]);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);

  // Refs
  const textEditorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);

  // Initialize drawing canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        drawingContextRef.current = context;
        context.lineCap = 'round';
        context.lineJoin = 'round';
      }
    }
  }, [showDrawingCanvas]);

  // Text formatting functions
  const formatText = (command: string, value?: string) => {
    if (readOnly) return;
    
    document.execCommand(command, false, value);
    updateFormatState();
  };

  const updateFormatState = () => {
    setCurrentFormat({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      align: document.queryCommandValue('justify') || 'left'
    });
  };

  const insertContent = (type: string, content: any) => {
    if (readOnly) return;

    switch (type) {
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          formatText('createLink', url);
        }
        break;
      case 'image':
        const imgElement = `<img src="${content.url}" alt="${content.name}" style="max-width: 100%; height: auto;" />`;
        formatText('insertHTML', imgElement);
        break;
      case 'video':
        const videoElement = `<video controls style="max-width: 100%; height: auto;"><source src="${content.url}" type="video/mp4"></video>`;
        formatText('insertHTML', videoElement);
        break;
      case 'audio':
        const audioElement = `<audio controls><source src="${content.url}" type="audio/mpeg"></audio>`;
        formatText('insertHTML', audioElement);
        break;
    }
  };

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const context = drawingContextRef.current;
    
    if (canvas && context) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      context.beginPath();
      context.moveTo(x, y);
      context.strokeStyle = drawingTool.color;
      context.lineWidth = drawingTool.size;
      context.globalAlpha = drawingTool.opacity;
      
      if (drawingTool.type === 'eraser') {
        context.globalCompositeOperation = 'destination-out';
      } else {
        context.globalCompositeOperation = 'source-over';
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    
    const canvas = canvasRef.current;
    const context = drawingContextRef.current;
    
    if (canvas && context) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      context.lineTo(x, y);
      context.stroke();
    }
  };

  const stopDrawing = () => {
    if (readOnly) return;
    
    setIsDrawing(false);
    saveCanvasState();
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL();
      setCanvasHistory(prev => [...prev, imageData]);
    }
  };

  const clearCanvas = () => {
    if (readOnly) return;
    
    const canvas = canvasRef.current;
    const context = drawingContextRef.current;
    
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      saveCanvasState();
    }
  };

  const undoDrawing = () => {
    if (readOnly || canvasHistory.length === 0) return;
    
    const canvas = canvasRef.current;
    const context = drawingContextRef.current;
    
    if (canvas && context) {
      const previousState = canvasHistory[canvasHistory.length - 2];
      if (previousState) {
        const img = new Image();
        img.onload = () => {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.drawImage(img, 0, 0);
        };
        img.src = previousState;
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
      setCanvasHistory(prev => prev.slice(0, -1));
    }
  };

  // Audio recording functions
  const startRecording = async () => {
    if (readOnly) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioRecorderRef.current = recorder;
      
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const audioItem: MediaItem = {
          id: Date.now().toString(),
          type: 'audio',
          url,
          name: `Recording ${new Date().toLocaleTimeString()}`,
          size: blob.size
        };
        setMediaLibrary(prev => [...prev, audioItem]);
      };
      
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (audioRecorderRef.current && isRecording) {
      audioRecorderRef.current.stop();
      audioRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // File upload functions
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file);
        const mediaItem: MediaItem = {
          id: Date.now().toString() + Math.random(),
          type: file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('video/') ? 'video' : 
                file.type.startsWith('audio/') ? 'audio' : 'document',
          url,
          name: file.name,
          size: file.size
        };
        setMediaLibrary(prev => [...prev, mediaItem]);
      });
    }
  };

  const saveContent = () => {
    const editorContent = {
      text: textEditorRef.current?.innerHTML || '',
      media: selectedMedia,
      drawings: canvasHistory,
      interactive: content.interactive,
      metadata: {
        fontSize,
        fontColor,
        backgroundColor,
        lastModified: new Date().toISOString()
      }
    };
    
    setContent(editorContent);
    onContentSave?.(editorContent);
  };

  const exportContent = (format: 'html' | 'json' | 'pdf') => {
    const exportData = {
      ...content,
      text: textEditorRef.current?.innerHTML || '',
      exportedAt: new Date().toISOString(),
      format
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Edit className="w-8 h-8 text-purple-600" />
            Content Editor
          </h1>
          <p className="text-gray-600 mt-1">Create rich, interactive content for your activities</p>
        </div>
        
        {!readOnly && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => exportContent('json')}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={saveContent}>
              <Save className="w-4 h-4 mr-2" />
              Save Content
            </Button>
          </div>
        )}
      </div>

      {/* Main Editor */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab as any}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                Text Editor
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Media
              </TabsTrigger>
              <TabsTrigger value="interactive" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Interactive
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab as any}>
            {/* Text Editor Tab */}
            <TabsContent value="text" className="space-y-4">
              {/* Text Formatting Toolbar */}
              {!readOnly && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg flex-wrap">
                  {/* Basic formatting */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant={currentFormat.bold ? "default" : "outline"}
                      size="sm"
                      onClick={() => formatText('bold')}
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={currentFormat.italic ? "default" : "outline"}
                      size="sm"
                      onClick={() => formatText('italic')}
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={currentFormat.underline ? "default" : "outline"}
                      size="sm"
                      onClick={() => formatText('underline')}
                    >
                      <Underline className="w-4 h-4" />
                    </Button>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Alignment */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('justifyLeft')}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('justifyCenter')}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('justifyRight')}
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Lists */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('insertUnorderedList')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => formatText('insertOrderedList')}
                    >
                      <ListOrdered className="w-4 h-4" />
                    </Button>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Insert options */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertContent('link', null)}
                    >
                      <Link className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMediaLibrary(true)}
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDrawingCanvas(true)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Styling */}
                  <div className="flex items-center gap-2">
                    <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(parseInt(value))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 12, 14, 16, 18, 20, 24, 28, 32].map(size => (
                          <SelectItem key={size} value={size.toString()}>{size}px</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <input
                      type="color"
                      value={fontColor}
                      onChange={(e) => setFontColor(e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer"
                      title="Text Color"
                    />
                    
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer"
                      title="Background Color"
                    />
                  </div>
                </div>
              )}

              {/* Text Editor Area */}
              <div className="border rounded-lg">
                <div
                  ref={textEditorRef}
                  contentEditable={!readOnly}
                  className="min-h-96 p-4 focus:outline-none"
                  style={{
                    fontSize: `${fontSize}px`,
                    color: fontColor,
                    backgroundColor: backgroundColor
                  }}
                  onMouseUp={updateFormatState}
                  onKeyUp={updateFormatState}
                  dangerouslySetInnerHTML={{ __html: content.text }}
                />
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-4">
              {/* Media Upload */}
              {!readOnly && (
                <div className="flex items-center gap-2 mb-4">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <>
                        <StopCircle className="w-4 h-4 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Record Audio
                      </>
                    )}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* Media Library */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaLibrary.map((item) => (
                  <MediaCard
                    key={item.id}
                    media={item}
                    onSelect={(media) => {
                      insertContent(media.type, media);
                      setSelectedMedia(prev => [...prev, media]);
                    }}
                    readOnly={readOnly}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Interactive Tab */}
            <TabsContent value="interactive" className="space-y-4">
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Interactive Elements</h3>
                <p className="text-gray-500 mb-4">Add interactive components like quizzes, games, and widgets</p>
                {!readOnly && (
                  <div className="flex justify-center gap-2">
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Quiz
                    </Button>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Game
                    </Button>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Widget
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg p-6 bg-white">
                <div
                  className="prose max-w-none"
                  style={{
                    fontSize: `${fontSize}px`,
                    color: fontColor,
                    backgroundColor: backgroundColor
                  }}
                  dangerouslySetInnerHTML={{ __html: textEditorRef.current?.innerHTML || content.text }}
                />
                
                {selectedMedia.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Attached Media:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedMedia.map((media) => (
                        <div key={media.id} className="border rounded p-3">
                          <div className="flex items-center gap-2">
                            {media.type === 'image' && <ImageIcon className="w-4 h-4" />}
                            {media.type === 'video' && <Video className="w-4 h-4" />}
                            {media.type === 'audio' && <Headphones className="w-4 h-4" />}
                            <span className="text-sm font-medium">{media.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Media Library Dialog */}
      <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Media Library</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {mediaLibrary.map((item) => (
                <MediaCard
                  key={item.id}
                  media={item}
                  onSelect={(media) => {
                    insertContent(media.type, media);
                    setSelectedMedia(prev => [...prev, media]);
                    setShowMediaLibrary(false);
                  }}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Drawing Canvas Dialog */}
      <Dialog open={showDrawingCanvas} onOpenChange={setShowDrawingCanvas}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Drawing Canvas</DialogTitle>
          </DialogHeader>
          
          {!readOnly && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
              {/* Drawing Tools */}
              <div className="flex items-center gap-1">
                <Button
                  variant={drawingTool.type === 'pen' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDrawingTool(prev => ({ ...prev, type: 'pen' }))}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant={drawingTool.type === 'eraser' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDrawingTool(prev => ({ ...prev, type: 'eraser' }))}
                >
                  <Eraser className="w-4 h-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Color and Size */}
              <input
                type="color"
                value={drawingTool.color}
                onChange={(e) => setDrawingTool(prev => ({ ...prev, color: e.target.value }))}
                className="w-8 h-8 rounded border cursor-pointer"
              />
              
              <div className="flex items-center gap-2">
                <span className="text-sm">Size:</span>
                <Slider
                  value={[drawingTool.size]}
                  onValueChange={([value]) => setDrawingTool(prev => ({ ...prev, size: value }))}
                  min={1}
                  max={50}
                  step={1}
                  className="w-20"
                />
                <span className="text-sm w-8">{drawingTool.size}</span>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Actions */}
              <Button variant="outline" size="sm" onClick={undoDrawing}>
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={clearCanvas}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Media Card Component
interface MediaCardProps {
  media: MediaItem;
  onSelect: (media: MediaItem) => void;
  readOnly: boolean;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, onSelect, readOnly }) => {
  const getMediaIcon = () => {
    switch (media.type) {
      case 'image': return <ImageIcon className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      case 'audio': return <Headphones className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(media)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          {getMediaIcon()}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{media.name}</h4>
            <p className="text-sm text-gray-500">{formatFileSize(media.size)}</p>
          </div>
        </div>
        
        {media.thumbnail && (
          <div className="aspect-video bg-gray-100 rounded mb-3 overflow-hidden">
            <img src={media.thumbnail} alt={media.name} className="w-full h-full object-cover" />
          </div>
        )}
        
        {media.duration && (
          <Badge variant="secondary" className="text-xs">
            {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
          </Badge>
        )}
        
        {!readOnly && (
          <Button size="sm" className="w-full mt-3">
            <Plus className="w-4 h-4 mr-2" />
            Insert
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentEditor;