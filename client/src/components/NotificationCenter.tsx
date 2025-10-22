import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

import {
  Bell,
  BellOff,
  Calendar,
  Clock,
  User,
  Users,
  BookOpen,
  Trophy,
  Target,
  Star,
  AlertTriangle,
  CheckCircle,
  Info,
  MessageCircle,
  Mail,
  Phone,
  Video,
  FileText,
  Award,
  TrendingUp,
  Heart,
  Zap,
  Timer,
  Settings,
  Filter,
  Search,
  MoreVertical,
  Check,
  X,
  Archive,
  Trash2,
  Pin,
  PinOff,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  RefreshCw,
  Download,
  Share,
  Flag,
  Play,
  Pause,
  Plus,
  Minus,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface NotificationCenterProps {
  userRole: 'teacher' | 'parent' | 'admin' | 'student';
  userId: string;
}

interface Notification {
  id: string;
  type: 'message' | 'achievement' | 'progress' | 'reminder' | 'announcement' | 'alert' | 'assignment' | 'event' | 'system';
  title: string;
  content: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'academic' | 'behavioral' | 'administrative' | 'social' | 'technical';
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  isPinned: boolean;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  actionRequired?: boolean;
  expiresAt?: Date;
  relatedItems?: {
    type: 'student' | 'class' | 'assignment' | 'activity' | 'message';
    id: string;
    name: string;
  }[];
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
}

interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: () => void;
  icon?: React.ReactNode;
}

interface NotificationSettings {
  enabled: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  types: {
    messages: boolean;
    achievements: boolean;
    progress: boolean;
    reminders: boolean;
    announcements: boolean;
    alerts: boolean;
    assignments: boolean;
    events: boolean;
    system: boolean;
  };
  priorities: {
    low: boolean;
    medium: boolean;
    high: boolean;
    urgent: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    weekendsOnly: boolean;
  };
  grouping: {
    byType: boolean;
    byPriority: boolean;
    bySender: boolean;
  };
  autoActions: {
    markReadAfterDays: number;
    archiveAfterDays: number;
    deleteAfterDays: number;
  };
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userRole,
  userId
}) => {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'starred' | 'archived'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'priority' | 'type'>('timestamp');
  const [groupBy, setGroupBy] = useState<'none' | 'type' | 'priority' | 'date'>('none');

  // Data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'achievement',
      title: 'Emma Earned a New Badge!',
      content: 'Emma has earned the "Math Master" badge for completing 10 consecutive math activities with 90%+ accuracy.',
      timestamp: new Date('2024-01-20T14:30:00'),
      priority: 'medium',
      category: 'academic',
      isRead: false,
      isStarred: false,
      isArchived: false,
      isPinned: true,
      senderId: 'system',
      senderName: 'Learning Platform',
      actionRequired: false,
      relatedItems: [
        { type: 'student', id: 'emma-1', name: 'Emma Johnson' },
        { type: 'activity', id: 'math-1', name: 'Math Master Challenge' }
      ],
      actions: [
        {
          id: 'view-progress',
          label: 'View Progress',
          type: 'primary',
          action: () => console.log('View progress'),
          icon: <TrendingUp className="w-4 h-4" />
        },
        {
          id: 'share-achievement',
          label: 'Share',
          type: 'secondary',
          action: () => console.log('Share achievement'),
          icon: <Share className="w-4 h-4" />
        }
      ]
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message from Ms. Johnson',
      content: 'I wanted to discuss Emma\'s reading progress and schedule a parent-teacher conference.',
      timestamp: new Date('2024-01-20T10:15:00'),
      priority: 'high',
      category: 'social',
      isRead: false,
      isStarred: true,
      isArchived: false,
      isPinned: false,
      senderId: 'teacher-1',
      senderName: 'Ms. Sarah Johnson',
      senderAvatar: '/avatars/teacher-1.jpg',
      actionRequired: true,
      actions: [
        {
          id: 'reply',
          label: 'Reply',
          type: 'primary',
          action: () => console.log('Reply to message'),
          icon: <MessageCircle className="w-4 h-4" />
        },
        {
          id: 'schedule',
          label: 'Schedule Meeting',
          type: 'secondary',
          action: () => console.log('Schedule meeting'),
          icon: <Calendar className="w-4 h-4" />
        }
      ]
    },
    {
      id: '3',
      type: 'reminder',
      title: 'Assignment Due Tomorrow',
      content: 'Reading comprehension worksheet is due tomorrow. Emma has completed 80% of the assignment.',
      timestamp: new Date('2024-01-19T16:00:00'),
      priority: 'high',
      category: 'academic',
      isRead: true,
      isStarred: false,
      isArchived: false,
      isPinned: false,
      senderId: 'system',
      senderName: 'Assignment Tracker',
      actionRequired: true,
      expiresAt: new Date('2024-01-21T23:59:59'),
      relatedItems: [
        { type: 'assignment', id: 'reading-1', name: 'Reading Comprehension Worksheet' }
      ],
      actions: [
        {
          id: 'view-assignment',
          label: 'View Assignment',
          type: 'primary',
          action: () => console.log('View assignment'),
          icon: <FileText className="w-4 h-4" />
        }
      ]
    },
    {
      id: '4',
      type: 'progress',
      title: 'Weekly Progress Report Available',
      content: 'Emma\'s weekly progress report is now available. She completed 12 activities and earned 450 points this week.',
      timestamp: new Date('2024-01-19T09:00:00'),
      priority: 'medium',
      category: 'academic',
      isRead: true,
      isStarred: false,
      isArchived: false,
      isPinned: false,
      senderId: 'system',
      senderName: 'Progress Tracker',
      actionRequired: false,
      relatedItems: [
        { type: 'student', id: 'emma-1', name: 'Emma Johnson' }
      ],
      actions: [
        {
          id: 'view-report',
          label: 'View Report',
          type: 'primary',
          action: () => console.log('View report'),
          icon: <FileText className="w-4 h-4" />
        },
        {
          id: 'download-pdf',
          label: 'Download PDF',
          type: 'secondary',
          action: () => console.log('Download PDF'),
          icon: <Download className="w-4 h-4" />
        }
      ]
    },
    {
      id: '5',
      type: 'announcement',
      title: 'Parent-Teacher Conference Week',
      content: 'Parent-teacher conferences will be held next week. Please schedule your appointment through the parent portal.',
      timestamp: new Date('2024-01-18T12:00:00'),
      priority: 'medium',
      category: 'administrative',
      isRead: true,
      isStarred: false,
      isArchived: false,
      isPinned: false,
      senderId: 'admin-1',
      senderName: 'School Administration',
      actionRequired: true,
      expiresAt: new Date('2024-01-25T17:00:00'),
      actions: [
        {
          id: 'schedule-conference',
          label: 'Schedule Conference',
          type: 'primary',
          action: () => console.log('Schedule conference'),
          icon: <Calendar className="w-4 h-4" />
        }
      ]
    },
    {
      id: '6',
      type: 'alert',
      title: 'Login from New Device',
      content: 'A new login was detected from a Windows device. If this wasn\'t you, please secure your account.',
      timestamp: new Date('2024-01-18T08:30:00'),
      priority: 'urgent',
      category: 'technical',
      isRead: false,
      isStarred: false,
      isArchived: false,
      isPinned: false,
      senderId: 'security',
      senderName: 'Security System',
      actionRequired: true,
      actions: [
        {
          id: 'review-activity',
          label: 'Review Activity',
          type: 'primary',
          action: () => console.log('Review activity'),
          icon: <Eye className="w-4 h-4" />
        },
        {
          id: 'secure-account',
          label: 'Secure Account',
          type: 'danger',
          action: () => console.log('Secure account'),
          icon: <AlertTriangle className="w-4 h-4" />
        }
      ]
    }
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    channels: {
      inApp: true,
      email: true,
      push: true,
      sms: false
    },
    types: {
      messages: true,
      achievements: true,
      progress: true,
      reminders: true,
      announcements: true,
      alerts: true,
      assignments: true,
      events: true,
      system: false
    },
    priorities: {
      low: true,
      medium: true,
      high: true,
      urgent: true
    },
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
      weekendsOnly: false
    },
    grouping: {
      byType: false,
      byPriority: false,
      bySender: false
    },
    autoActions: {
      markReadAfterDays: 7,
      archiveAfterDays: 30,
      deleteAfterDays: 90
    }
  });

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Filter and sort notifications
  const filteredNotifications = notifications.filter(notification => {
    // Tab filtering
    if (activeTab === 'unread' && notification.isRead) return false;
    if (activeTab === 'starred' && !notification.isStarred) return false;
    if (activeTab === 'archived' && !notification.isArchived) return false;
    if (activeTab !== 'archived' && notification.isArchived) return false;

    // Search filtering
    if (searchQuery && !notification.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !notification.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Type filtering
    if (filterType !== 'all' && notification.type !== filterType) return false;

    // Priority filtering
    if (filterPriority !== 'all' && notification.priority !== filterPriority) return false;

    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message': return <MessageCircle className="w-5 h-5" />;
      case 'achievement': return <Trophy className="w-5 h-5" />;
      case 'progress': return <TrendingUp className="w-5 h-5" />;
      case 'reminder': return <Clock className="w-5 h-5" />;
      case 'announcement': return <Bell className="w-5 h-5" />;
      case 'alert': return <AlertTriangle className="w-5 h-5" />;
      case 'assignment': return <FileText className="w-5 h-5" />;
      case 'event': return <Calendar className="w-5 h-5" />;
      case 'system': return <Settings className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    const colors = {
      urgent: 'destructive',
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    };
    return <Badge variant={colors[priority] as any}>{priority.toUpperCase()}</Badge>;
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

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const toggleStar = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isStarred: !n.isStarred } : n
    ));
  };

  const toggleArchive = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isArchived: !n.isArchived } : n
    ));
  };

  const togglePin = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isPinned: !n.isPinned } : n
    ));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const bulkAction = (action: 'read' | 'star' | 'archive' | 'delete') => {
    const ids = Array.from(selectedNotifications);
    
    switch (action) {
      case 'read':
        setNotifications(prev => prev.map(n => 
          ids.includes(n.id) ? { ...n, isRead: true } : n
        ));
        break;
      case 'star':
        setNotifications(prev => prev.map(n => 
          ids.includes(n.id) ? { ...n, isStarred: !n.isStarred } : n
        ));
        break;
      case 'archive':
        setNotifications(prev => prev.map(n => 
          ids.includes(n.id) ? { ...n, isArchived: true } : n
        ));
        break;
      case 'delete':
        setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
        break;
    }
    
    setSelectedNotifications(new Set());
  };

  const toggleSelection = (notificationId: string) => {
    const newSelection = new Set(selectedNotifications);
    if (newSelection.has(notificationId)) {
      newSelection.delete(notificationId);
    } else {
      newSelection.add(notificationId);
    }
    setSelectedNotifications(newSelection);
  };

  const selectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;
  const starredCount = notifications.filter(n => n.isStarred && !n.isArchived).length;
  const archivedCount = notifications.filter(n => n.isArchived).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="w-8 h-8 text-purple-600" />
            Notification Center
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Stay updated with important messages and alerts
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Filters */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="achievement">Achievements</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="reminder">Reminders</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="alert">Alerts</SelectItem>
                <SelectItem value="assignment">Assignments</SelectItem>
                <SelectItem value="event">Events</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy as any}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timestamp">Time</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab as any} orientation="vertical">
              <TabsList className="grid w-full grid-cols-1 h-auto">
                <TabsTrigger value="all" className="justify-between">
                  All
                  <Badge variant="secondary">{notifications.filter(n => !n.isArchived).length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="unread" className="justify-between">
                  Unread
                  <Badge variant="destructive">{unreadCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="starred" className="justify-between">
                  Starred
                  <Badge variant="secondary">{starredCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="archived" className="justify-between">
                  Archived
                  <Badge variant="secondary">{archivedCount}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Notification List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Notifications
              </CardTitle>
              
              {selectedNotifications.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.size} selected
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => bulkAction('read')}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => bulkAction('star')}>
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => bulkAction('archive')}>
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => bulkAction('delete')}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {filteredNotifications.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedNotifications.size === filteredNotifications.length}
                  onCheckedChange={selectAll}
                />
                <span className="text-sm text-gray-600">Select all</span>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No notifications found
                  </h3>
                  <p className="text-gray-600">
                    {activeTab === 'all' ? 'You\'re all caught up!' : `No ${activeTab} notifications`}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      } ${notification.isPinned ? 'border-l-4 border-l-orange-500' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedNotifications.has(notification.id)}
                          onCheckedChange={() => toggleSelection(notification.id)}
                        />
                        
                        <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              {notification.isPinned && <Pin className="w-4 h-4 text-orange-500" />}
                              {notification.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                              {getPriorityBadge(notification.priority)}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {notification.content}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {notification.senderName && (
                                <span>From: {notification.senderName}</span>
                              )}
                              <span>•</span>
                              <span>{formatTimestamp(notification.timestamp)}</span>
                              {notification.expiresAt && (
                                <>
                                  <span>•</span>
                                  <span className="text-orange-600">
                                    Expires: {notification.expiresAt.toLocaleDateString()}
                                  </span>
                                </>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {notification.actions && notification.actions.map((action) => (
                                <Button
                                  key={action.id}
                                  variant={action.type === 'primary' ? 'default' : action.type === 'danger' ? 'destructive' : 'outline'}
                                  size="sm"
                                  onClick={action.action}
                                  className="h-7 px-2 text-xs"
                                >
                                  {action.icon}
                                  <span className="ml-1">{action.label}</span>
                                </Button>
                              ))}
                              
                              <div className="flex items-center gap-1 ml-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-7 w-7 p-0"
                                >
                                  {notification.isRead ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleStar(notification.id)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Star className={`w-3 h-3 ${notification.isStarred ? 'fill-current text-yellow-500' : ''}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => togglePin(notification.id)}
                                  className="h-7 w-7 p-0"
                                >
                                  {notification.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleArchive(notification.id)}
                                  className="h-7 w-7 p-0"
                                >
                                  <Archive className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {notification.relatedItems && notification.relatedItems.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {notification.relatedItems.map((item) => (
                                <Badge key={item.id} variant="outline" className="text-xs">
                                  {item.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Global Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Enable Notifications</h3>
                <p className="text-sm text-gray-600">Turn all notifications on or off</p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, enabled: checked }))
                }
              />
            </div>
            
            <Separator />
            
            {/* Channels */}
            <div className="space-y-4">
              <h3 className="font-medium">Notification Channels</h3>
              {Object.entries(settings.channels).map(([channel, enabled]) => (
                <div key={channel} className="flex items-center justify-between">
                  <Label className="capitalize flex items-center gap-2">
                    {channel === 'inApp' && <Monitor className="w-4 h-4" />}
                    {channel === 'email' && <Mail className="w-4 h-4" />}
                    {channel === 'push' && <Smartphone className="w-4 h-4" />}
                    {channel === 'sms' && <Phone className="w-4 h-4" />}
                    {channel === 'inApp' ? 'In-App' : channel}
                  </Label>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ 
                        ...prev, 
                        channels: { ...prev.channels, [channel]: checked }
                      }))
                    }
                  />
                </div>
              ))}
            </div>
            
            <Separator />
            
            {/* Types */}
            <div className="space-y-4">
              <h3 className="font-medium">Notification Types</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(settings.types).map(([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between">
                    <Label className="capitalize">{type}</Label>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          types: { ...prev.types, [type]: checked }
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            {/* Quiet Hours */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Quiet Hours</h3>
                <Switch
                  checked={settings.quietHours.enabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ 
                      ...prev, 
                      quietHours: { ...prev.quietHours, enabled: checked }
                    }))
                  }
                />
              </div>
              
              {settings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          quietHours: { ...prev.quietHours, start: e.target.value }
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          quietHours: { ...prev.quietHours, end: e.target.value }
                        }))
                      }
                    />
                  </div>
                </div>
              )}
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

export default NotificationCenter;