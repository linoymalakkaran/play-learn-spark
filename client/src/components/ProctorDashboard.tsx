import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Shield, 
  Eye, 
  Monitor, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Camera, 
  Clock, 
  Users, 
  Activity,
  Settings,
  Download,
  RefreshCw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  Zap,
  Brain,
  Lock,
  Unlock,
  User,
  Globe,
  Wifi,
  WifiOff,
  Battery,
  Cpu,
  HardDrive,
  MousePointer,
  Keyboard,
  FileText,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

// Types for proctoring data
interface StudentSession {
  sessionId: string;
  userId: string;
  userName: string;
  assessmentId: string;
  assessmentName: string;
  status: 'active' | 'completed' | 'flagged' | 'disconnected';
  startTime: Date;
  currentQuestion: number;
  totalQuestions: number;
  integrityScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  violations: SecurityViolation[];
  browserLockdown: {
    active: boolean;
    violations: number;
    lastCheck: Date;
  };
  webcamMonitoring: {
    active: boolean;
    faceDetected: boolean;
    eyeTracking: boolean;
    anomalies: number;
  };
  aiIntegrity: {
    plagiarismRisk: number;
    typingAnomalies: number;
    behaviorScore: number;
  };
}

interface SecurityViolation {
  id: string;
  type: 'browser' | 'webcam' | 'ai' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  description: string;
  studentId: string;
  handled: boolean;
  response?: string;
}

interface SystemStatus {
  totalSessions: number;
  activeSessions: number;
  flaggedSessions: number;
  systemLoad: number;
  apiResponseTime: number;
  databaseConnections: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface DashboardMetrics {
  integrityScoreDistribution: { score: number; count: number }[];
  violationsByType: { type: string; count: number }[];
  sessionsOverTime: { time: string; sessions: number }[];
  riskLevelBreakdown: { level: string; count: number; percentage: number }[];
}

const ProctorDashboard: React.FC = () => {
  // State management
  const [studentSessions, setStudentSessions] = useState<StudentSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<StudentSession | null>(null);
  const [violations, setViolations] = useState<SecurityViolation[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    totalSessions: 0,
    activeSessions: 0,
    flaggedSessions: 0,
    systemLoad: 0,
    apiResponseTime: 0,
    databaseConnections: 0,
    memoryUsage: 0,
    cpuUsage: 0
  });
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    integrityScoreDistribution: [],
    violationsByType: [],
    sessionsOverTime: [],
    riskLevelBreakdown: []
  });
  
  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'sessions' | 'violations' | 'analytics'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  
  // Refs
  const websocketRef = useRef<WebSocket | null>(null);
  const alertAudioRef = useRef<HTMLAudioElement | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!isPaused) {
      const connectWebSocket = () => {
        const ws = new WebSocket(`ws://localhost:3001/ws/proctoring-dashboard`);
        
        ws.onopen = () => {
          console.log('Connected to proctoring dashboard WebSocket');
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          handleRealTimeUpdate(data);
        };
        
        ws.onclose = () => {
          console.log('WebSocket connection closed, attempting to reconnect...');
          setTimeout(connectWebSocket, 3000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        websocketRef.current = ws;
      };
      
      connectWebSocket();
    }
    
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, [isPaused]);
  
  // Auto-refresh mechanism
  useEffect(() => {
    if (autoRefresh && !isPaused) {
      refreshTimerRef.current = setInterval(() => {
        fetchDashboardData();
      }, refreshInterval);
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, isPaused, refreshInterval]);
  
  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
    setupAlertAudio();
  }, []);
  
  // Handle real-time updates from WebSocket
  const handleRealTimeUpdate = useCallback((data: any) => {
    switch (data.type) {
      case 'session_update':
        updateStudentSession(data.session);
        break;
      case 'new_violation':
        addViolation(data.violation);
        if (soundEnabled && data.violation.severity === 'critical') {
          playAlertSound();
        }
        break;
      case 'system_status':
        setSystemStatus(data.status);
        break;
      case 'session_ended':
        removeStudentSession(data.sessionId);
        break;
      default:
        console.log('Unknown update type:', data.type);
    }
  }, [soundEnabled]);
  
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const [sessionsRes, violationsRes, statusRes, metricsRes] = await Promise.all([
        fetch('/api/proctoring/sessions'),
        fetch('/api/proctoring/violations'),
        fetch('/api/proctoring/system-status'),
        fetch('/api/proctoring/metrics')
      ]);
      
      const sessions = await sessionsRes.json();
      const violationsData = await violationsRes.json();
      const status = await statusRes.json();
      const metrics = await metricsRes.json();
      
      setStudentSessions(sessions);
      setViolations(violationsData);
      setSystemStatus(status);
      setDashboardMetrics(metrics);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };
  
  // Update student session
  const updateStudentSession = (updatedSession: StudentSession) => {
    setStudentSessions(prev => 
      prev.map(session => 
        session.sessionId === updatedSession.sessionId ? updatedSession : session
      )
    );
  };
  
  // Add new violation
  const addViolation = (violation: SecurityViolation) => {
    setViolations(prev => [violation, ...prev]);
    
    // Update session with new violation
    setStudentSessions(prev => 
      prev.map(session => {
        if (session.userId === violation.studentId) {
          return {
            ...session,
            violations: [violation, ...session.violations],
            riskLevel: calculateRiskLevel([violation, ...session.violations])
          };
        }
        return session;
      })
    );
  };
  
  // Remove student session
  const removeStudentSession = (sessionId: string) => {
    setStudentSessions(prev => prev.filter(session => session.sessionId !== sessionId));
  };
  
  // Setup alert audio
  const setupAlertAudio = () => {
    alertAudioRef.current = new Audio('/sounds/alert.wav');
    alertAudioRef.current.volume = 0.7;
  };
  
  // Play alert sound
  const playAlertSound = () => {
    if (alertAudioRef.current && soundEnabled) {
      alertAudioRef.current.play().catch(console.error);
    }
  };
  
  // Calculate risk level based on violations
  const calculateRiskLevel = (violations: SecurityViolation[]): 'low' | 'medium' | 'high' | 'critical' => {
    const criticalCount = violations.filter(v => v.severity === 'critical').length;
    const highCount = violations.filter(v => v.severity === 'high').length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 1) return 'high';
    if (violations.length > 3) return 'medium';
    return 'low';
  };
  
  // Filter sessions based on criteria
  const filteredSessions = studentSessions.filter(session => {
    const matchesRisk = filterRiskLevel === 'all' || session.riskLevel === filterRiskLevel;
    const matchesSearch = session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.assessmentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRisk && matchesSearch;
  });
  
  // Handle session action
  const handleSessionAction = async (sessionId: string, action: string) => {
    try {
      await fetch(`/api/proctoring/sessions/${sessionId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error performing session action:', error);
    }
  };
  
  // Handle violation response
  const handleViolationResponse = async (violationId: string, response: string) => {
    try {
      await fetch(`/api/proctoring/violations/${violationId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response })
      });
      
      setViolations(prev => 
        prev.map(violation => 
          violation.id === violationId 
            ? { ...violation, handled: true, response }
            : violation
        )
      );
    } catch (error) {
      console.error('Error responding to violation:', error);
    }
  };
  
  // Export data
  const exportData = async (type: 'sessions' | 'violations' | 'report') => {
    try {
      const response = await fetch(`/api/proctoring/export/${type}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proctoring-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };
  
  // Render risk level badge
  const renderRiskBadge = (riskLevel: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[riskLevel as keyof typeof colors]}`}>
        {riskLevel.toUpperCase()}
      </span>
    );
  };
  
  // Render status icon
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'flagged':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };
  
  return (
    <div className={`min-h-screen bg-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Proctoring Dashboard</h1>
                <p className="text-sm text-gray-500">Real-time monitoring & security</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* System Status Indicators */}
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-1 ${systemStatus.systemLoad < 80 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Load: {systemStatus.systemLoad}%</span>
                </div>
                <div className="flex items-center">
                  <Activity className="w-4 h-4 text-blue-500 mr-1" />
                  <span>{systemStatus.activeSessions} Active</span>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-md ${soundEnabled ? 'text-blue-600' : 'text-gray-400'}`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`p-2 rounded-md ${isPaused ? 'text-red-600' : 'text-green-600'}`}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => fetchDashboardData()}
                  className="p-2 rounded-md text-blue-600 hover:bg-blue-50"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-50"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'sessions', label: 'Sessions', icon: Users },
              { id: 'violations', label: 'Violations', icon: AlertTriangle },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center px-3 py-4 border-b-2 text-sm font-medium ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.totalSessions}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Activity className="w-8 h-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Now</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.activeSessions}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Flagged</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.flaggedSessions}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Cpu className="w-8 h-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">System Load</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.systemLoad}%</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Risk Level Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Level Distribution</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardMetrics.riskLevelBreakdown.map(item => (
                  <div key={item.level} className="text-center">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg ${
                      item.level === 'low' ? 'bg-green-500' :
                      item.level === 'medium' ? 'bg-yellow-500' :
                      item.level === 'high' ? 'bg-orange-500' : 'bg-red-500'
                    }`}>
                      {item.count}
                    </div>
                    <p className="text-sm font-medium text-gray-600">{item.level.toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{item.percentage}%</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Violations */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Recent Violations</h3>
                <button
                  onClick={() => setSelectedTab('violations')}
                  className="text-blue-600 text-sm hover:text-blue-800"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {violations.slice(0, 5).map(violation => (
                  <div key={violation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className={`w-5 h-5 mr-3 ${
                        violation.severity === 'critical' ? 'text-red-500' :
                        violation.severity === 'high' ? 'text-orange-500' :
                        violation.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{violation.description}</p>
                        <p className="text-sm text-gray-500">{violation.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderRiskBadge(violation.severity)}
                      {!violation.handled && (
                        <button
                          onClick={() => handleViolationResponse(violation.id, 'acknowledged')}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Handle
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {selectedTab === 'sessions' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students or assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterRiskLevel}
                  onChange={(e) => setFilterRiskLevel(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                  <option value="critical">Critical Risk</option>
                </select>
              </div>
              
              <button
                onClick={() => exportData('sessions')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
            
            {/* Sessions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSessions.map(session => (
                <div key={session.sessionId} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {renderStatusIcon(session.status)}
                      <span className="ml-2 font-medium text-gray-900">{session.userName}</span>
                    </div>
                    {renderRiskBadge(session.riskLevel)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Assessment:</span> {session.assessmentName}</p>
                    <p><span className="font-medium">Progress:</span> {session.currentQuestion}/{session.totalQuestions}</p>
                    <p><span className="font-medium">Integrity Score:</span> {session.integrityScore}%</p>
                    <p><span className="font-medium">Started:</span> {session.startTime.toLocaleTimeString()}</p>
                  </div>
                  
                  {/* Monitoring Status */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div className={`flex items-center justify-center p-2 rounded ${
                      session.browserLockdown.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <Lock className="w-3 h-3 mr-1" />
                      Browser
                    </div>
                    <div className={`flex items-center justify-center p-2 rounded ${
                      session.webcamMonitoring.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <Camera className="w-3 h-3 mr-1" />
                      Webcam
                    </div>
                    <div className={`flex items-center justify-center p-2 rounded ${
                      session.aiIntegrity.behaviorScore > 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      <Brain className="w-3 h-3 mr-1" />
                      AI
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      View Details
                    </button>
                    {session.status === 'flagged' && (
                      <button
                        onClick={() => handleSessionAction(session.sessionId, 'investigate')}
                        className="px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                      >
                        Investigate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {selectedTab === 'violations' && (
          <div className="space-y-6">
            {/* Violations List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Security Violations</h3>
                  <button
                    onClick={() => exportData('violations')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {violations.map(violation => (
                      <tr key={violation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {violation.timestamp.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {studentSessions.find(s => s.userId === violation.studentId)?.userName || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="capitalize">{violation.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {renderRiskBadge(violation.severity)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {violation.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {violation.handled ? (
                            <span className="text-green-600">Handled</span>
                          ) : (
                            <span className="text-yellow-600">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!violation.handled && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViolationResponse(violation.id, 'acknowledged')}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Acknowledge
                              </button>
                              <button
                                onClick={() => handleViolationResponse(violation.id, 'investigate')}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Investigate
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Integrity Score Distribution */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Integrity Score Distribution</h3>
                <div className="h-64 flex items-end justify-center space-x-2">
                  {dashboardMetrics.integrityScoreDistribution.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="bg-blue-500 w-8 rounded-t"
                        style={{ height: `${(item.count / Math.max(...dashboardMetrics.integrityScoreDistribution.map(i => i.count))) * 200}px` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-1">{item.score}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Violations by Type */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Violations by Type</h3>
                <div className="space-y-3">
                  {dashboardMetrics.violationsByType.map(item => (
                    <div key={item.type} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">{item.type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(item.count / Math.max(...dashboardMetrics.violationsByType.map(i => i.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sessions Over Time */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sessions Over Time</h3>
              <div className="h-64 flex items-end justify-center space-x-1">
                {dashboardMetrics.sessionsOverTime.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="bg-green-500 w-4 rounded-t"
                      style={{ height: `${(item.sessions / Math.max(...dashboardMetrics.sessionsOverTime.map(i => i.sessions))) * 200}px` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1 transform -rotate-45">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Session Details - {selectedSession.userName}
                </h2>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Session Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Session Info</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Assessment:</span> {selectedSession.assessmentName}</p>
                    <p><span className="font-medium">Started:</span> {selectedSession.startTime.toLocaleString()}</p>
                    <p><span className="font-medium">Progress:</span> {selectedSession.currentQuestion}/{selectedSession.totalQuestions}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Security Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Browser Lockdown</span>
                      {selectedSession.browserLockdown.active ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Webcam Monitoring</span>
                      {selectedSession.webcamMonitoring.active ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Integrity Scores</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Overall:</span> {selectedSession.integrityScore}%</p>
                    <p><span className="font-medium">Behavior:</span> {selectedSession.aiIntegrity.behaviorScore}%</p>
                    <p><span className="font-medium">Risk Level:</span> {renderRiskBadge(selectedSession.riskLevel)}</p>
                  </div>
                </div>
              </div>
              
              {/* Violations for this session */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Session Violations</h4>
                <div className="space-y-2">
                  {selectedSession.violations.map(violation => (
                    <div key={violation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className={`w-4 h-4 mr-2 ${
                          violation.severity === 'critical' ? 'text-red-500' :
                          violation.severity === 'high' ? 'text-orange-500' :
                          violation.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{violation.description}</p>
                          <p className="text-xs text-gray-500">{violation.timestamp.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {renderRiskBadge(violation.severity)}
                        {violation.handled && (
                          <span className="text-xs text-green-600">Handled</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {selectedSession.violations.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No violations detected</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProctorDashboard;