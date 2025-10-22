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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import {
  MessageCircle,
  Send,
  Paperclip,
  Star,
  Archive,
  Search,
  Filter,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  BellOff,
  Calendar,
  Phone,
  Video,
  Mail,
  FileText,
  Image,
  Download,
  Reply,
  Forward,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  BookOpen,
  Target,
  Award,
  TrendingUp,
  Heart,
  Smile,
  ThumbsUp,
  Eye,
  EyeOff,
  Pin,
  PinOff,
  Plus,
  Minus,
  X,
  Check,
  Info,
  Settings,
  Zap,
  Camera,
  Mic,
  Share,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp
} from 'lucide-react';

interface MessagingPlatformProps {
  userRole: 'teacher' | 'parent' | 'admin';
  userId: string;
  userName?: string;
}

interface Contact {
  id: string;
  name: string;
  role: 'teacher' | 'parent' | 'admin' | 'student';
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  relationshipType?: 'class' | 'child' | 'colleague';
  subjects?: string[];
  grade?: string;
}

interface Message {
  id: string;
  threadId: string;
  senderId: string;
  recipientIds: string[];
  subject?: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'notification' | 'announcement' | 'progress_update' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read';
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  isStarred?: boolean;
  isArchived?: boolean;
  isPinned?: boolean;
  replyTo?: string;
  tags?: string[];
}

interface MessageThread {
  id: string;
  subject: string;
  participants: string[];
  lastMessage: Message;
  messageCount: number;
  unreadCount: number;
  isGroup: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  category?: 'academic' | 'behavioral' | 'administrative' | 'social' | 'urgent';
}

interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'link';
  url: string;
  size: number;
  mimeType: string;
}

interface MessageReaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: Date;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  immediateAlerts: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  urgentOnly: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    academic: boolean;
    behavioral: boolean;
    administrative: boolean;
    social: boolean;
  };
}

const MessagingPlatform: React.FC<MessagingPlatformProps> = ({
  userRole,
  userId,
  userName = 'User'
}) => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'starred' | 'archived'>('inbox');
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Message composition
  const [composeData, setComposeData] = useState({
    recipients: [] as string[],
    subject: '',
    content: '',
    priority: 'medium' as Message['priority'],
    category: 'academic' as MessageThread['category'],
    attachments: [] as File[]
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Ms. Sarah Johnson',
      role: 'teacher',
      email: 'sarah.johnson@school.edu',
      status: 'online',
      relationshipType: 'class',
      subjects: ['Math', 'Science'],
      grade: '3rd Grade'
    },
    {
      id: '2',
      name: 'Emma Thompson',
      role: 'parent',
      email: 'emma.thompson@email.com',
      status: 'offline',
      lastSeen: new Date('2024-01-20T16:30:00'),
      relationshipType: 'child'
    },
    {
      id: '3',
      name: 'Mr. David Chen',
      role: 'teacher',
      email: 'david.chen@school.edu',
      status: 'away',
      relationshipType: 'colleague',
      subjects: ['Reading', 'Writing'],
      grade: '3rd Grade'
    },
    {
      id: '4',
      name: 'Lisa Rodriguez',
      role: 'parent',
      email: 'lisa.rodriguez@email.com',
      status: 'online',
      relationshipType: 'child'
    }
  ]);

  const [threads, setThreads] = useState<MessageThread[]>([
    {
      id: '1',
      subject: 'Emma\'s Math Progress This Week',
      participants: ['1', '2'],
      lastMessage: {
        id: 'm1',
        threadId: '1',
        senderId: '1',
        recipientIds: ['2'],
        content: 'Emma has shown excellent improvement in multiplication this week. She\'s mastered the 5 and 10 times tables!',
        timestamp: new Date('2024-01-20T14:30:00'),
        type: 'progress_update',
        priority: 'medium',
        status: 'read'
      } as Message,
      messageCount: 5,
      unreadCount: 0,
      isGroup: false,
      isPinned: true,
      createdAt: new Date('2024-01-18T09:00:00'),
      updatedAt: new Date('2024-01-20T14:30:00'),
      category: 'academic'
    },
    {
      id: '2',
      subject: 'Parent-Teacher Conference Request',
      participants: ['1', '4'],
      lastMessage: {
        id: 'm2',
        threadId: '2',
        senderId: '4',
        recipientIds: ['1'],
        content: 'I would like to schedule a conference to discuss Sophia\'s reading progress. Are you available next week?',
        timestamp: new Date('2024-01-20T10:15:00'),
        type: 'message',
        priority: 'high',
        status: 'delivered'
      } as Message,
      messageCount: 3,
      unreadCount: 1,
      isGroup: false,
      isPinned: false,
      createdAt: new Date('2024-01-20T10:00:00'),
      updatedAt: new Date('2024-01-20T10:15:00'),
      category: 'administrative'
    },
    {
      id: '3',
      subject: 'Classroom Behavior Update',
      participants: ['1', '2'],
      lastMessage: {
        id: 'm3',
        threadId: '3',
        senderId: '1',
        recipientIds: ['2'],
        content: 'Emma was very helpful today during group work and showed great leadership skills.',
        timestamp: new Date('2024-01-19T15:45:00'),
        type: 'notification',
        priority: 'low',
        status: 'read'
      } as Message,
      messageCount: 2,
      unreadCount: 0,
      isGroup: false,
      isPinned: false,
      createdAt: new Date('2024-01-19T15:30:00'),
      updatedAt: new Date('2024-01-19T15:45:00'),
      category: 'behavioral'
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1-1',
      threadId: '1',
      senderId: '1',
      recipientIds: ['2'],
      content: 'Hi Mrs. Thompson! I wanted to share some exciting news about Emma\'s progress in mathematics.',
      timestamp: new Date('2024-01-18T09:15:00'),
      type: 'message',
      priority: 'medium',
      status: 'read'
    },
    {
      id: 'm1-2',
      threadId: '1',
      senderId: '2',
      recipientIds: ['1'],
      content: 'That\'s wonderful to hear! We\'ve been practicing at home. What specific areas has she improved in?',
      timestamp: new Date('2024-01-18T19:30:00'),
      type: 'message',
      priority: 'medium',
      status: 'read'
    },
    {
      id: 'm1-3',
      threadId: '1',
      senderId: '1',
      recipientIds: ['2'],
      content: 'She\'s really excelled in multiplication tables. Her accuracy has improved from 60% to 85% this week! She seems to enjoy the gamified activities we use.',
      timestamp: new Date('2024-01-19T08:45:00'),
      type: 'progress_update',
      priority: 'medium',
      status: 'read'
    },
    {
      id: 'm1-4',
      threadId: '1',
      senderId: '2',
      recipientIds: ['1'],
      content: 'That\'s amazing! She mentioned the "Number Safari" game. Could you share some tips for continuing this progress at home?',
      timestamp: new Date('2024-01-19T20:15:00'),
      type: 'message',
      priority: 'medium',
      status: 'read',
      reactions: [
        { id: 'r1', userId: '1', emoji: '👍', timestamp: new Date('2024-01-20T08:00:00') }
      ]
    },
    {
      id: 'm1-5',
      threadId: '1',
      senderId: '1',
      recipientIds: ['2'],
      content: 'Emma has shown excellent improvement in multiplication this week. She\'s mastered the 5 and 10 times tables! I\'ll send home some practice materials.',
      timestamp: new Date('2024-01-20T14:30:00'),
      type: 'progress_update',
      priority: 'medium',
      status: 'read',
      attachments: [
        {
          id: 'a1',
          name: 'Math_Practice_Sheets.pdf',
          type: 'document',
          url: '/attachments/math-practice.pdf',
          size: 245760,
          mimeType: 'application/pdf'
        }
      ]
    }
  ]);

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    immediateAlerts: true,
    dailyDigest: false,
    weeklyReport: true,
    urgentOnly: false,
    quietHours: {
      enabled: true,
      start: '20:00',
      end: '08:00'
    },
    categories: {
      academic: true,
      behavioral: true,
      administrative: true,
      social: false
    }
  });

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages, selectedThread]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getContact = (contactId: string): Contact | undefined => {
    return contacts.find(c => c.id === contactId);
  };

  const getThreadMessages = (threadId: string): Message[] => {
    return messages.filter(m => m.threadId === threadId).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const getStatusIcon = (status: Contact['status']) => {
    switch (status) {
      case 'online': return <div className="w-3 h-3 bg-green-500 rounded-full" />;
      case 'away': return <div className="w-3 h-3 bg-yellow-500 rounded-full" />;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const getPriorityColor = (priority: Message['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category?: MessageThread['category']) => {
    switch (category) {
      case 'academic': return <BookOpen className="w-4 h-4" />;
      case 'behavioral': return <Heart className="w-4 h-4" />;
      case 'administrative': return <FileText className="w-4 h-4" />;
      case 'social': return <Users className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const sendMessage = () => {
    if (!selectedThread || !composeData.content.trim()) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      threadId: selectedThread.id,
      senderId: userId,
      recipientIds: selectedThread.participants.filter(p => p !== userId),
      content: composeData.content,
      timestamp: new Date(),
      type: 'message',
      priority: composeData.priority,
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setComposeData(prev => ({ ...prev, content: '' }));

    // Update thread's last message
    setThreads(prev => prev.map(thread => 
      thread.id === selectedThread.id 
        ? { ...thread, lastMessage: newMessage, updatedAt: new Date() }
        : thread
    ));
  };

  const composeNewMessage = () => {
    setComposeData({
      recipients: [],
      subject: '',
      content: '',
      priority: 'medium',
      category: 'academic',
      attachments: []
    });
    setShowCompose(true);
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.userId === userId);
        if (existingReaction) {
          // Remove if same emoji, change if different
          const newReactions = existingReaction.emoji === emoji
            ? msg.reactions?.filter(r => r.userId !== userId) || []
            : msg.reactions?.map(r => r.userId === userId ? { ...r, emoji } : r) || [];
          return { ...msg, reactions: newReactions };
        } else {
          // Add new reaction
          const newReaction: MessageReaction = {
            id: `r${Date.now()}`,
            userId,
            emoji,
            timestamp: new Date()
          };
          return { ...msg, reactions: [...(msg.reactions || []), newReaction] };
        }
      }
      return msg;
    }));
  };

  const toggleStarred = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = !searchQuery || 
      thread.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.participants.some(p => {
        const contact = getContact(p);
        return contact?.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    
    const matchesCategory = filterCategory === 'all' || thread.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-purple-600" />
            Communications Hub
          </h1>
          <p className="text-gray-600 mt-1">
            Connect with parents, teachers, and educational stakeholders
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowContacts(true)}>
            <Users className="w-4 h-4 mr-2" />
            Contacts
          </Button>
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button onClick={composeNewMessage}>
            <Plus className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Sidebar - Thread List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Messages</CardTitle>
              <Button variant="ghost" size="sm" onClick={composeNewMessage}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Search and Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab as any}>
              <TabsList className="grid w-full grid-cols-4 mx-4 mb-4">
                <TabsTrigger value="inbox" className="text-xs">Inbox</TabsTrigger>
                <TabsTrigger value="sent" className="text-xs">Sent</TabsTrigger>
                <TabsTrigger value="starred" className="text-xs">Starred</TabsTrigger>
                <TabsTrigger value="archived" className="text-xs">Archived</TabsTrigger>
              </TabsList>
              
              <ScrollArea className="h-96">
                <div className="space-y-1 px-4 pb-4">
                  {filteredThreads.map((thread) => {
                    const otherParticipant = getContact(
                      thread.participants.find(p => p !== userId) || ''
                    );
                    
                    return (
                      <div
                        key={thread.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedThread?.id === thread.id
                            ? 'bg-purple-50 border-purple-200'
                            : 'hover:bg-gray-50'
                        } ${thread.unreadCount > 0 ? 'border-l-4 border-l-blue-500' : ''}`}
                        onClick={() => setSelectedThread(thread)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={otherParticipant?.avatar} />
                            <AvatarFallback>
                              {otherParticipant?.name.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm truncate">
                                {otherParticipant?.name || 'Unknown'}
                              </h4>
                              <div className="flex items-center gap-1">
                                {thread.isPinned && <Pin className="w-3 h-3 text-orange-500" />}
                                {getCategoryIcon(thread.category)}
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-600 mb-1 truncate">
                              {thread.subject}
                            </p>
                            
                            <p className="text-xs text-gray-500 truncate">
                              {thread.lastMessage.content}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {formatTimestamp(thread.lastMessage.timestamp)}
                              </span>
                              {thread.unreadCount > 0 && (
                                <Badge variant="default" className="text-xs">
                                  {thread.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </Tabs>
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedThread ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={getContact(selectedThread.participants.find(p => p !== userId) || '')?.avatar} />
                      <AvatarFallback>
                        {getContact(selectedThread.participants.find(p => p !== userId) || '')?.name.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {getContact(selectedThread.participants.find(p => p !== userId) || '')?.name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-600">{selectedThread.subject}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {/* Messages */}
              <CardContent className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="space-y-4 pb-4">
                    {getThreadMessages(selectedThread.id).map((message) => {
                      const sender = getContact(message.senderId);
                      const isOwn = message.senderId === userId;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={sender?.avatar} />
                            <AvatarFallback className="text-xs">
                              {sender?.name.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={`max-w-xs lg:max-w-md ${isOwn ? 'text-right' : 'text-left'}`}>
                            <div
                              className={`p-3 rounded-lg ${
                                isOwn 
                                  ? 'bg-purple-600 text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              
                              {message.attachments && message.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.attachments.map((attachment) => (
                                    <div
                                      key={attachment.id}
                                      className="flex items-center gap-2 p-2 bg-white bg-opacity-20 rounded"
                                    >
                                      <FileText className="w-4 h-4" />
                                      <span className="text-xs truncate">{attachment.name}</span>
                                      <Button variant="ghost" size="sm">
                                        <Download className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(message.timestamp)}
                              </span>
                              
                              {message.reactions && message.reactions.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {message.reactions.map((reaction) => (
                                    <span key={reaction.id} className="text-xs">
                                      {reaction.emoji}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              {!isOwn && (
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addReaction(message.id, '👍')}
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleStarred(message.id)}
                                  >
                                    <Star className={`w-3 h-3 ${message.isStarred ? 'fill-current text-yellow-500' : ''}`} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>
              
              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your message..."
                      value={composeData.content}
                      onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                      className="min-h-[60px] resize-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                  </div>
                  
                  <Button onClick={sendMessage} disabled={!composeData.content.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      setComposeData(prev => ({
                        ...prev,
                        attachments: [...prev.attachments, ...Array.from(e.target.files || [])]
                      }));
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Compose New Message Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose New Message</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipients">Recipients</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} ({contact.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={composeData.subject}
                onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={composeData.priority} 
                  onValueChange={(value: any) => setComposeData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={composeData.category} 
                  onValueChange={(value: any) => setComposeData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                value={composeData.content}
                onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Type your message..."
                rows={6}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Handle sending new message
                setShowCompose(false);
              }}>
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contacts Dialog */}
      <Dialog open={showContacts} onOpenChange={setShowContacts}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Contacts</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1">
                      {getStatusIcon(contact.status)}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium">{contact.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{contact.role}</p>
                    {contact.subjects && (
                      <p className="text-xs text-gray-500">{contact.subjects.join(', ')}</p>
                    )}
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Email Notifications</Label>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Push Notifications</Label>
              <Switch
                checked={notificationSettings.pushNotifications}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Immediate Alerts</Label>
              <Switch
                checked={notificationSettings.immediateAlerts}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, immediateAlerts: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Daily Digest</Label>
              <Switch
                checked={notificationSettings.dailyDigest}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, dailyDigest: checked }))
                }
              />
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-3">Category Notifications</h4>
              <div className="space-y-2">
                {Object.entries(notificationSettings.categories).map(([category, enabled]) => (
                  <div key={category} className="flex items-center justify-between">
                    <Label className="capitalize">{category}</Label>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ 
                          ...prev, 
                          categories: { ...prev.categories, [category]: checked }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setShowSettings(false)}>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagingPlatform;