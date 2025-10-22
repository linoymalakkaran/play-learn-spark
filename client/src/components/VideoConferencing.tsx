import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';

import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Users,
  User,
  Calendar,
  Clock,
  Share,
  Share2,
  Monitor,
  MonitorOff,
  Volume2,
  VolumeX,
  MessageCircle,
  FileText,
  Download,
  Upload,
  Camera,
  CameraOff,
  Settings,
  MoreVertical,
  Maximize,
  Minimize,
  RotateCcw,
  RefreshCw,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  Zap,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Send,
  Paperclip,
  Image,
  File,
  FileImage,
  FileVideo,
  FilePdf,
  Folder,
  FolderOpen,
  Star,
  Heart,
  ThumbsUp,
  Smile,
  Frown,
  Meh,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  FastForward,
  Rewind,
  Volume1,
  Volume,
  Headphones,
  Speaker
} from 'lucide-react';

interface VideoConferencingProps {
  userRole: 'teacher' | 'parent' | 'admin';
  userId: string;
  userName: string;
  userAvatar?: string;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  hostName: string;
  participants: Participant[];
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: 'scheduled' | 'in-progress' | 'ended' | 'cancelled';
  type: 'parent-teacher' | 'group' | 'staff' | 'training';
  meetingLink: string;
  recordingEnabled: boolean;
  recordingUrl?: string;
  waitingRoom: boolean;
  password?: string;
  agenda: AgendaItem[];
  attachments: Attachment[];
  notes?: string;
  followUpTasks: FollowUpTask[];
  studentIds?: string[];
  privacy: 'private' | 'public' | 'restricted';
  recurrence?: RecurrenceSettings;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'host' | 'teacher' | 'parent' | 'admin' | 'guest';
  status: 'invited' | 'accepted' | 'declined' | 'pending' | 'joined' | 'left';
  joinedAt?: Date;
  leftAt?: Date;
  deviceInfo?: {
    browser: string;
    os: string;
    camera: boolean;
    microphone: boolean;
    screen: boolean;
  };
  permissions: {
    video: boolean;
    audio: boolean;
    screen: boolean;
    chat: boolean;
    recording: boolean;
  };
}

interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  duration: number; // minutes
  order: number;
  completed: boolean;
  notes?: string;
}

interface Attachment {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'presentation' | 'report';
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
}

interface FollowUpTask {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  dueDate?: Date;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

interface RecurrenceSettings {
  type: 'daily' | 'weekly' | 'monthly';
  interval: number;
  endDate?: Date;
  occurrences?: number;
}

interface CallState {
  isConnected: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isMuted: boolean;
  isRecording: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  bandwidth: number;
  participants: ActiveParticipant[];
  chatMessages: ChatMessage[];
  sharedFiles: Attachment[];
}

interface ActiveParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isSpeaking: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  joinedAt: Date;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
  attachments?: Attachment[];
  replyTo?: string;
}

const VideoConferencing: React.FC<VideoConferencingProps> = ({
  userRole,
  userId,
  userName,
  userAvatar
}) => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'in-progress' | 'recordings' | 'settings'>('upcoming');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isVideoEnabled: true,
    isAudioEnabled: true,
    isScreenSharing: false,
    isMuted: false,
    isRecording: false,
    connectionQuality: 'good',
    bandwidth: 1.2,
    participants: [],
    chatMessages: [],
    sharedFiles: []
  });

  // Form state
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    scheduledStart: new Date(),
    scheduledEnd: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    participants: [] as string[],
    waitingRoom: true,
    recordingEnabled: false,
    password: '',
    agenda: [] as AgendaItem[],
    type: 'parent-teacher' as Meeting['type']
  });

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Sample data
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Emma Johnson - Parent Conference',
      description: 'Quarterly progress review and goal setting discussion',
      hostId: 'teacher1',
      hostName: 'Ms. Sarah Davis',
      participants: [
        {
          id: 'p1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          role: 'parent',
          status: 'accepted',
          permissions: {
            video: true,
            audio: true,
            screen: false,
            chat: true,
            recording: false
          }
        },
        {
          id: 'p2',
          name: 'Mike Johnson',
          email: 'mike.johnson@email.com',
          role: 'parent',
          status: 'pending',
          permissions: {
            video: true,
            audio: true,
            screen: false,
            chat: true,
            recording: false
          }
        }
      ],
      scheduledStart: new Date('2024-01-22T14:00:00'),
      scheduledEnd: new Date('2024-01-22T14:30:00'),
      status: 'scheduled',
      type: 'parent-teacher',
      meetingLink: 'https://meet.eduplatform.com/room/abc123',
      recordingEnabled: true,
      waitingRoom: true,
      password: 'emma2024',
      agenda: [
        {
          id: 'a1',
          title: 'Academic Progress Review',
          description: 'Review Emma\'s performance in all subjects',
          duration: 10,
          order: 1,
          completed: false
        },
        {
          id: 'a2',
          title: 'Strengths and Achievements',
          description: 'Discuss Emma\'s strengths and recent achievements',
          duration: 8,
          order: 2,
          completed: false
        },
        {
          id: 'a3',
          title: 'Areas for Improvement',
          description: 'Identify areas needing attention and support strategies',
          duration: 7,
          order: 3,
          completed: false
        },
        {
          id: 'a4',
          title: 'Goal Setting',
          description: 'Set goals for the next quarter',
          duration: 5,
          order: 4,
          completed: false
        }
      ],
      attachments: [
        {
          id: 'att1',
          name: 'Emma_Progress_Report_Q1.pdf',
          type: 'report',
          url: '/documents/emma_q1.pdf',
          size: 1024000,
          uploadedBy: 'teacher1',
          uploadedAt: new Date('2024-01-20'),
          description: 'Quarterly progress report with detailed analytics'
        }
      ],
      followUpTasks: [],
      studentIds: ['student1'],
      privacy: 'private'
    },
    {
      id: '2',
      title: 'Weekly Staff Meeting',
      description: 'Weekly coordination meeting for 3rd grade teachers',
      hostId: 'admin1',
      hostName: 'Principal Anderson',
      participants: [
        {
          id: 't1',
          name: 'Ms. Sarah Davis',
          email: 'sarah.davis@school.edu',
          role: 'teacher',
          status: 'accepted',
          permissions: {
            video: true,
            audio: true,
            screen: true,
            chat: true,
            recording: false
          }
        },
        {
          id: 't2',
          name: 'Mr. John Smith',
          email: 'john.smith@school.edu',
          role: 'teacher',
          status: 'accepted',
          permissions: {
            video: true,
            audio: true,
            screen: true,
            chat: true,
            recording: false
          }
        }
      ],
      scheduledStart: new Date('2024-01-22T16:00:00'),
      scheduledEnd: new Date('2024-01-22T17:00:00'),
      status: 'scheduled',
      type: 'staff',
      meetingLink: 'https://meet.eduplatform.com/room/staff-weekly',
      recordingEnabled: false,
      waitingRoom: false,
      agenda: [],
      attachments: [],
      followUpTasks: [],
      privacy: 'restricted'
    }
  ]);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoading(false), 1000);
    
    // Initialize media devices
    initializeMediaDevices();
    
    return () => {
      // Cleanup media streams
      cleanupMediaStreams();
    };
  }, []);

  const initializeMediaDevices = async () => {
    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Check available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('Available devices:', devices);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const cleanupMediaStreams = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const joinMeeting = async (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsInCall(true);
    
    // Update call state
    setCallState(prev => ({
      ...prev,
      isConnected: true,
      participants: [
        {
          id: userId,
          name: userName,
          avatar: userAvatar,
          role: userRole,
          isVideoEnabled: true,
          isAudioEnabled: true,
          isSpeaking: false,
          isScreenSharing: false,
          connectionQuality: 'good',
          joinedAt: new Date()
        }
      ]
    }));
    
    // Simulate other participants joining
    setTimeout(() => {
      setCallState(prev => ({
        ...prev,
        participants: [
          ...prev.participants,
          {
            id: 'participant1',
            name: 'Sarah Johnson',
            avatar: '/avatars/sarah.jpg',
            role: 'parent',
            isVideoEnabled: true,
            isAudioEnabled: true,
            isSpeaking: false,
            isScreenSharing: false,
            connectionQuality: 'excellent',
            joinedAt: new Date()
          }
        ]
      }));
    }, 2000);
  };

  const leaveMeeting = () => {
    setIsInCall(false);
    setSelectedMeeting(null);
    setCallState(prev => ({
      ...prev,
      isConnected: false,
      participants: []
    }));
    cleanupMediaStreams();
    initializeMediaDevices();
  };

  const toggleVideo = () => {
    setCallState(prev => ({
      ...prev,
      isVideoEnabled: !prev.isVideoEnabled
    }));
    
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !callState.isVideoEnabled;
      }
    }
  };

  const toggleAudio = () => {
    setCallState(prev => ({
      ...prev,
      isAudioEnabled: !prev.isAudioEnabled,
      isMuted: prev.isAudioEnabled
    }));
    
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !callState.isAudioEnabled;
      }
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      setCallState(prev => ({
        ...prev,
        isScreenSharing: true
      }));
      
      // Handle screen share stream
      stream.getVideoTracks()[0].onended = () => {
        setCallState(prev => ({
          ...prev,
          isScreenSharing: false
        }));
      };
      
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  };

  const stopScreenShare = () => {
    setCallState(prev => ({
      ...prev,
      isScreenSharing: false
    }));
  };

  const sendChatMessage = (content: string) => {
    if (!content.trim()) return;
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      senderName: userName,
      content: content.trim(),
      timestamp: new Date(),
      type: 'text'
    };
    
    setCallState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, newMessage]
    }));
    
    if (chatInputRef.current) {
      chatInputRef.current.value = '';
    }
  };

  const scheduleMeeting = () => {
    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`,
      ...meetingForm,
      hostId: userId,
      hostName: userName,
      participants: [],
      status: 'scheduled',
      meetingLink: `https://meet.eduplatform.com/room/${Date.now()}`,
      agenda: [],
      attachments: [],
      followUpTasks: [],
      privacy: 'private'
    };
    
    setMeetings(prev => [...prev, newMeeting]);
    setShowScheduleDialog(false);
    
    // Reset form
    setMeetingForm({
      title: '',
      description: '',
      scheduledStart: new Date(),
      scheduledEnd: new Date(Date.now() + 60 * 60 * 1000),
      participants: [],
      waitingRoom: true,
      recordingEnabled: false,
      password: '',
      agenda: [],
      type: 'parent-teacher'
    });
  };

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConnectionQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <Signal className="w-4 h-4" />;
      case 'good': return <Wifi className="w-4 h-4" />;
      case 'fair': return <WifiOff className="w-4 h-4" />;
      case 'poor': return <AlertTriangle className="w-4 h-4" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  // In-call interface
  if (isInCall && selectedMeeting) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">{selectedMeeting.title}</h1>
              <Badge variant="secondary" className="bg-green-600">
                <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                Live
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <div className={`flex items-center gap-1 ${getConnectionQualityColor(callState.connectionQuality)}`}>
                {getConnectionQualityIcon(callState.connectionQuality)}
                <span className="capitalize">{callState.connectionQuality}</span>
              </div>
              <span>•</span>
              <span>{callState.participants.length} participants</span>
              <span>•</span>
              <span>{Math.floor((Date.now() - (selectedMeeting.actualStart?.getTime() || Date.now())) / 60000)} min</span>
            </div>
          </div>

          {/* Video Grid */}
          <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {callState.participants.map((participant) => (
              <ParticipantVideo
                key={participant.id}
                participant={participant}
                isLocal={participant.id === userId}
                videoRef={participant.id === userId ? localVideoRef : undefined}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="bg-gray-900 p-4 flex items-center justify-center gap-4">
            <Button
              variant={callState.isAudioEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="rounded-full w-12 h-12"
            >
              {callState.isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            
            <Button
              variant={callState.isVideoEnabled ? "default" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-12 h-12"
            >
              {callState.isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
            
            <Button
              variant={callState.isScreenSharing ? "secondary" : "outline"}
              size="lg"
              onClick={callState.isScreenSharing ? stopScreenShare : startScreenShare}
              className="rounded-full w-12 h-12"
            >
              {callState.isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-12 h-12"
              onClick={() => {/* Toggle chat */}}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={leaveMeeting}
              className="rounded-full w-12 h-12 ml-4"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Chat Sidebar */}
        <ChatSidebar
          messages={callState.chatMessages}
          onSendMessage={sendChatMessage}
          inputRef={chatInputRef}
        />
      </div>
    );
  }

  // Main interface
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Video className="w-8 h-8 text-purple-600" />
            Video Conferencing
          </h1>
          <p className="text-gray-600 mt-1">
            Virtual meetings and parent-teacher conferences
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowJoinDialog(true)}>
            <Users className="w-4 h-4 mr-2" />
            Join Meeting
          </Button>
          <Button onClick={() => setShowScheduleDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="recordings">Recordings</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Upcoming Meetings */}
        <TabsContent value="upcoming" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {meetings.filter(m => m.status === 'scheduled').map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onJoin={() => joinMeeting(meeting)}
                onEdit={() => {/* Edit meeting */}}
                onCancel={() => {/* Cancel meeting */}}
                currentUserId={userId}
              />
            ))}
          </div>
        </TabsContent>

        {/* In Progress Meetings */}
        <TabsContent value="in-progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {meetings.filter(m => m.status === 'in-progress').map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onJoin={() => joinMeeting(meeting)}
                onEdit={() => {}}
                onCancel={() => {}}
                currentUserId={userId}
              />
            ))}
          </div>
          
          {meetings.filter(m => m.status === 'in-progress').length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No meetings in progress</p>
            </div>
          )}
        </TabsContent>

        {/* Recordings */}
        <TabsContent value="recordings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Recordings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meetings.filter(m => m.recordingUrl).map((meeting) => (
                  <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Play className="w-8 h-8 text-purple-600" />
                      <div>
                        <h4 className="font-semibold">{meeting.title}</h4>
                        <p className="text-sm text-gray-600">
                          {meeting.scheduledStart.toLocaleDateString()} • 
                          {Math.floor((meeting.actualEnd!.getTime() - meeting.actualStart!.getTime()) / 60000)} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Watch
                      </Button>
                    </div>
                  </div>
                ))}
                
                {meetings.filter(m => m.recordingUrl).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileVideo className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recordings available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <VideoSettings />
        </TabsContent>
      </Tabs>

      {/* Schedule Meeting Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
          </DialogHeader>
          
          <ScheduleMeetingForm
            formData={meetingForm}
            onUpdate={setMeetingForm}
            onSubmit={scheduleMeeting}
            onCancel={() => setShowScheduleDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Join Meeting Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Meeting</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="meeting-id">Meeting ID or Link</Label>
              <Input
                id="meeting-id"
                placeholder="Enter meeting ID or paste meeting link"
              />
            </div>
            
            <div>
              <Label htmlFor="meeting-password">Password (if required)</Label>
              <Input
                id="meeting-password"
                type="password"
                placeholder="Enter meeting password"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowJoinDialog(false)}>
                Join Meeting
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Meeting Card Component
interface MeetingCardProps {
  meeting: Meeting;
  onJoin: () => void;
  onEdit: () => void;
  onCancel: () => void;
  currentUserId: string;
}

const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  onJoin,
  onEdit,
  onCancel,
  currentUserId
}) => {
  const isHost = meeting.hostId === currentUserId;
  const timeUntilMeeting = meeting.scheduledStart.getTime() - Date.now();
  const canJoin = timeUntilMeeting <= 15 * 60 * 1000; // 15 minutes before

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-50 text-blue-700';
      case 'in-progress': return 'bg-green-50 text-green-700';
      case 'ended': return 'bg-gray-50 text-gray-700';
      case 'cancelled': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{meeting.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{meeting.description}</p>
          </div>
          <Badge className={getStatusColor(meeting.status)}>
            {meeting.status.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{meeting.scheduledStart.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>
              {meeting.scheduledStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {meeting.scheduledEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs">
              {meeting.hostName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">Hosted by {meeting.hostName}</span>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{meeting.participants.length} participants</span>
          </div>
          {meeting.recordingEnabled && (
            <div className="flex items-center gap-1">
              <Video className="w-3 h-3" />
              <span>Recording enabled</span>
            </div>
          )}
          {meeting.waitingRoom && (
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Waiting room</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={onJoin}
            disabled={!canJoin && meeting.status === 'scheduled'}
            className="flex-1"
          >
            <Video className="w-4 h-4 mr-2" />
            {meeting.status === 'in-progress' ? 'Join Meeting' : 'Join'}
          </Button>
          
          {isHost && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {!canJoin && meeting.status === 'scheduled' && (
          <p className="text-xs text-gray-500 text-center">
            Meeting can be joined 15 minutes before start time
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Participant Video Component
interface ParticipantVideoProps {
  participant: ActiveParticipant;
  isLocal: boolean;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({
  participant,
  isLocal,
  videoRef
}) => {
  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
      {participant.isVideoEnabled ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Avatar className="w-20 h-20">
            <AvatarImage src={participant.avatar} />
            <AvatarFallback className="text-2xl">
              {participant.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      {/* Participant Info */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <div className="bg-black bg-opacity-75 rounded px-2 py-1 text-white text-sm">
          {participant.name} {isLocal && '(You)'}
        </div>
        
        <div className="flex items-center gap-1">
          {!participant.isAudioEnabled && (
            <div className="bg-red-500 rounded-full p-1">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
          {participant.isSpeaking && (
            <div className="bg-green-500 rounded-full p-1 animate-pulse">
              <Volume2 className="w-3 h-3 text-white" />
            </div>
          )}
          <div className={`${participant.connectionQuality === 'poor' ? 'text-red-400' : 'text-green-400'}`}>
            {getConnectionQualityIcon(participant.connectionQuality)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Chat Sidebar Component
interface ChatSidebarProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  messages,
  onSendMessage,
  inputRef
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`fixed right-0 top-0 h-full w-80 bg-white border-l transform transition-transform ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Chat</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="text-sm">
                <div className="font-medium text-gray-900">{message.senderName}</div>
                <div className="text-gray-700">{message.content}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && inputRef.current) {
                  onSendMessage(inputRef.current.value);
                }
              }}
            />
            <Button size="sm" onClick={() => {
              if (inputRef.current) {
                onSendMessage(inputRef.current.value);
              }
            }}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Toggle Button */}
      <Button
        variant="default"
        size="sm"
        className="fixed right-4 top-20 z-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle className="w-4 h-4" />
      </Button>
    </div>
  );
};

// Schedule Meeting Form Component
interface ScheduleMeetingFormProps {
  formData: any;
  onUpdate: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const ScheduleMeetingForm: React.FC<ScheduleMeetingFormProps> = ({
  formData,
  onUpdate,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Meeting Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onUpdate({ ...formData, title: e.target.value })}
          placeholder="Enter meeting title"
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onUpdate({ ...formData, description: e.target.value })}
          placeholder="Meeting description (optional)"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date & Time</Label>
          <DatePicker
            selected={formData.scheduledStart}
            onChange={(date) => onUpdate({ ...formData, scheduledStart: date })}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
          />
        </div>
        <div>
          <Label>End Date & Time</Label>
          <DatePicker
            selected={formData.scheduledEnd}
            onChange={(date) => onUpdate({ ...formData, scheduledEnd: date })}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
          />
        </div>
      </div>
      
      <div>
        <Label>Meeting Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => onUpdate({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="parent-teacher">Parent-Teacher Conference</SelectItem>
            <SelectItem value="group">Group Meeting</SelectItem>
            <SelectItem value="staff">Staff Meeting</SelectItem>
            <SelectItem value="training">Training Session</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="waiting-room"
            checked={formData.waitingRoom}
            onCheckedChange={(checked) => onUpdate({ ...formData, waitingRoom: checked })}
          />
          <Label htmlFor="waiting-room">Enable waiting room</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="recording"
            checked={formData.recordingEnabled}
            onCheckedChange={(checked) => onUpdate({ ...formData, recordingEnabled: checked })}
          />
          <Label htmlFor="recording">Enable recording</Label>
        </div>
      </div>
      
      <div>
        <Label htmlFor="password">Meeting Password (optional)</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => onUpdate({ ...formData, password: e.target.value })}
          placeholder="Enter meeting password"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          Schedule Meeting
        </Button>
      </div>
    </div>
  );
};

// Video Settings Component
const VideoSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    camera: 'default',
    microphone: 'default',
    speaker: 'default',
    videoQuality: 'auto',
    enableNoiseCancellation: true,
    enableEchoCancellation: true,
    enableAutoGainControl: true,
    defaultMuted: false,
    defaultVideoOff: false
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video & Audio Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">Camera</Label>
          <Select
            value={settings.camera}
            onValueChange={(value) => setSettings({ ...settings, camera: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Camera</SelectItem>
              <SelectItem value="camera1">Built-in Camera</SelectItem>
              <SelectItem value="camera2">External USB Camera</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-base font-medium">Microphone</Label>
          <Select
            value={settings.microphone}
            onValueChange={(value) => setSettings({ ...settings, microphone: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Microphone</SelectItem>
              <SelectItem value="mic1">Built-in Microphone</SelectItem>
              <SelectItem value="mic2">External Microphone</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-base font-medium">Speaker</Label>
          <Select
            value={settings.speaker}
            onValueChange={(value) => setSettings({ ...settings, speaker: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Speaker</SelectItem>
              <SelectItem value="speaker1">Built-in Speakers</SelectItem>
              <SelectItem value="speaker2">Headphones</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-base font-medium">Video Quality</Label>
          <Select
            value={settings.videoQuality}
            onValueChange={(value) => setSettings({ ...settings, videoQuality: value })}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="high">High (720p)</SelectItem>
              <SelectItem value="medium">Medium (480p)</SelectItem>
              <SelectItem value="low">Low (360p)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h4 className="font-medium">Audio Enhancement</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="noise-cancellation">Noise Cancellation</Label>
            <Switch
              id="noise-cancellation"
              checked={settings.enableNoiseCancellation}
              onCheckedChange={(checked) => setSettings({ ...settings, enableNoiseCancellation: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="echo-cancellation">Echo Cancellation</Label>
            <Switch
              id="echo-cancellation"
              checked={settings.enableEchoCancellation}
              onCheckedChange={(checked) => setSettings({ ...settings, enableEchoCancellation: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-gain">Auto Gain Control</Label>
            <Switch
              id="auto-gain"
              checked={settings.enableAutoGainControl}
              onCheckedChange={(checked) => setSettings({ ...settings, enableAutoGainControl: checked })}
            />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h4 className="font-medium">Default Settings</h4>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="default-muted">Join meetings muted</Label>
            <Switch
              id="default-muted"
              checked={settings.defaultMuted}
              onCheckedChange={(checked) => setSettings({ ...settings, defaultMuted: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="default-video-off">Join meetings with video off</Label>
            <Switch
              id="default-video-off"
              checked={settings.defaultVideoOff}
              onCheckedChange={(checked) => setSettings({ ...settings, defaultVideoOff: checked })}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button>Save Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoConferencing;