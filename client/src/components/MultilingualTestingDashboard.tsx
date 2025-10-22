import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Settings,
  Download,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPieChart, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Type definitions
interface TestSuite {
  id: string;
  name: string;
  description: string;
  version: string;
  testCount: number;
  enabled: boolean;
  lastRun?: Date;
  status: 'idle' | 'running' | 'completed' | 'failed';
}

interface TestRun {
  id: string;
  suiteId: string;
  timestamp: number;
  duration: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    errors: number;
  };
  environment: {
    language: string;
    contentIds: string[];
    version: string;
  };
}

interface TestIssue {
  id: string;
  type: 'accuracy' | 'cultural' | 'performance' | 'accessibility' | 'ui' | 'functional';
  severity: 'critical' | 'major' | 'minor' | 'info';
  message: string;
  language: string;
  contentId: string;
  autoFixable: boolean;
  fixed: boolean;
}

interface TestingMetrics {
  totalTests: number;
  passRate: number;
  averageScore: number;
  criticalIssues: number;
  autoFixRate: number;
  averageRuntime: number;
  languageCoverage: number;
  contentCoverage: number;
}

export function MultilingualTestingDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'suites' | 'runs' | 'issues' | 'analytics'>('overview');
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [testIssues, setTestIssues] = useState<TestIssue[]>([]);
  const [metrics, setMetrics] = useState<TestingMetrics>({
    totalTests: 0,
    passRate: 0,
    averageScore: 0,
    criticalIssues: 0,
    autoFixRate: 0,
    averageRuntime: 0,
    languageCoverage: 0,
    contentCoverage: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string>('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en', 'es', 'fr']);
  const [contentFilter, setContentFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockTestSuites: TestSuite[] = [
      {
        id: 'translation-accuracy',
        name: 'Translation Accuracy Tests',
        description: 'Tests for translation quality and accuracy',
        version: '1.0.0',
        testCount: 12,
        enabled: true,
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'completed'
      },
      {
        id: 'cultural-appropriateness',
        name: 'Cultural Appropriateness Tests',
        description: 'Tests for cultural sensitivity',
        version: '1.0.0',
        testCount: 8,
        enabled: true,
        lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'completed'
      },
      {
        id: 'performance',
        name: 'Performance Tests',
        description: 'Tests for rendering and loading performance',
        version: '1.0.0',
        testCount: 6,
        enabled: true,
        lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'running'
      },
      {
        id: 'accessibility',
        name: 'Accessibility Tests',
        description: 'Tests for multilingual accessibility compliance',
        version: '1.0.0',
        testCount: 10,
        enabled: false,
        status: 'idle'
      }
    ];

    const mockTestRuns: TestRun[] = [
      {
        id: 'run_001',
        suiteId: 'translation-accuracy',
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
        duration: 45000,
        status: 'completed',
        summary: { total: 36, passed: 32, failed: 3, skipped: 1, errors: 0 },
        environment: { language: 'es,fr,ar', contentIds: ['act_001', 'act_002', 'act_003'], version: '1.0.0' }
      },
      {
        id: 'run_002',
        suiteId: 'cultural-appropriateness',
        timestamp: Date.now() - 4 * 60 * 60 * 1000,
        duration: 32000,
        status: 'completed',
        summary: { total: 24, passed: 22, failed: 2, skipped: 0, errors: 0 },
        environment: { language: 'ar,zh', contentIds: ['act_001', 'act_002', 'act_003'], version: '1.0.0' }
      },
      {
        id: 'run_003',
        suiteId: 'performance',
        timestamp: Date.now() - 1 * 60 * 60 * 1000,
        duration: 0,
        status: 'running',
        summary: { total: 18, passed: 12, failed: 0, skipped: 0, errors: 0 },
        environment: { language: 'en,es,fr,ar,zh', contentIds: ['act_001', 'act_002', 'act_003'], version: '1.0.0' }
      }
    ];

    const mockTestIssues: TestIssue[] = [
      {
        id: 'issue_001',
        type: 'accuracy',
        severity: 'major',
        message: 'Missing translation for term: "educational"',
        language: 'es',
        contentId: 'act_001',
        autoFixable: true,
        fixed: false
      },
      {
        id: 'issue_002',
        type: 'cultural',
        severity: 'critical',
        message: 'Christmas references may not be appropriate',
        language: 'ar',
        contentId: 'act_002',
        autoFixable: false,
        fixed: false
      },
      {
        id: 'issue_003',
        type: 'accessibility',
        severity: 'major',
        message: 'Missing alt text for image',
        language: 'fr',
        contentId: 'act_003',
        autoFixable: true,
        fixed: true
      }
    ];

    const mockMetrics: TestingMetrics = {
      totalTests: 456,
      passRate: 88.5,
      averageScore: 85.2,
      criticalIssues: 3,
      autoFixRate: 67.8,
      averageRuntime: 38.5,
      languageCoverage: 92.3,
      contentCoverage: 78.9
    };

    setTestSuites(mockTestSuites);
    setTestRuns(mockTestRuns);
    setTestIssues(mockTestIssues);
    setMetrics(mockMetrics);
  }, []);

  const runTestSuite = async (suiteId: string) => {
    setLoading(true);
    
    // Update suite status
    setTestSuites(prev => prev.map(suite => 
      suite.id === suiteId 
        ? { ...suite, status: 'running' as const }
        : suite
    ));

    // Simulate test execution
    setTimeout(() => {
      setTestSuites(prev => prev.map(suite => 
        suite.id === suiteId 
          ? { ...suite, status: 'completed' as const, lastRun: new Date() }
          : suite
      ));
      setLoading(false);
    }, 3000);
  };

  const stopTestSuite = (suiteId: string) => {
    setTestSuites(prev => prev.map(suite => 
      suite.id === suiteId 
        ? { ...suite, status: 'idle' as const }
        : suite
    ));
  };

  const toggleSuite = (suiteId: string) => {
    setTestSuites(prev => prev.map(suite => 
      suite.id === suiteId 
        ? { ...suite, enabled: !suite.enabled }
        : suite
    ));
  };

  const autoFixIssues = async () => {
    setLoading(true);
    
    // Simulate auto-fix
    setTimeout(() => {
      setTestIssues(prev => prev.map(issue => 
        issue.autoFixable && !issue.fixed
          ? { ...issue, fixed: true }
          : issue
      ));
      setLoading(false);
    }, 2000);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pass Rate</p>
              <p className="text-2xl font-bold text-green-600">{metrics.passRate}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.averageScore}</p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">{metrics.criticalIssues}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Auto-Fix Rate</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.autoFixRate}%</p>
            </div>
            <Zap className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Test Runs Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Test Runs</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={testRuns.map(run => ({
            name: run.id.slice(-3),
            passed: run.summary.passed,
            failed: run.summary.failed,
            skipped: run.summary.skipped
          }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="passed" fill="#10b981" name="Passed" />
            <Bar dataKey="failed" fill="#ef4444" name="Failed" />
            <Bar dataKey="skipped" fill="#f59e0b" name="Skipped" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Issue Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Issues by Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPieChart>
              <RechartsPieChart
                data={[
                  { name: 'Accuracy', value: 45, fill: '#3b82f6' },
                  { name: 'Cultural', value: 25, fill: '#ef4444' },
                  { name: 'Performance', value: 20, fill: '#10b981' },
                  { name: 'Accessibility', value: 10, fill: '#f59e0b' }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {[
                  { name: 'Accuracy', value: 45, fill: '#3b82f6' },
                  { name: 'Cultural', value: 25, fill: '#ef4444' },
                  { name: 'Performance', value: 20, fill: '#10b981' },
                  { name: 'Accessibility', value: 10, fill: '#f59e0b' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </RechartsPieChart>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Language Coverage</h3>
          <div className="space-y-3">
            {[
              { lang: 'English', coverage: 100, code: 'en' },
              { lang: 'Spanish', coverage: 95, code: 'es' },
              { lang: 'French', coverage: 87, code: 'fr' },
              { lang: 'Arabic', coverage: 73, code: 'ar' },
              { lang: 'Chinese', coverage: 68, code: 'zh' }
            ].map(item => (
              <div key={item.code} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.lang}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${item.coverage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-10">{item.coverage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTestSuitesTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={selectedSuite}
                onChange={(e) => setSelectedSuite(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="">All Suites</option>
                {testSuites.map(suite => (
                  <option key={suite.id} value={suite.id}>{suite.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Languages:</span>
              <div className="flex space-x-1">
                {['en', 'es', 'fr', 'ar', 'zh'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLanguages(prev => 
                        prev.includes(lang) 
                          ? prev.filter(l => l !== lang)
                          : [...prev, lang]
                      );
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedLanguages.includes(lang)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => runTestSuite('all')}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              <span>Run All</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Test Suites List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Test Suites</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {testSuites.map(suite => (
            <div key={suite.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      suite.status === 'running' ? 'bg-blue-500 animate-pulse' :
                      suite.status === 'completed' ? 'bg-green-500' :
                      suite.status === 'failed' ? 'bg-red-500' :
                      'bg-gray-300'
                    }`}></div>
                    
                    <div>
                      <h4 className="font-medium">{suite.name}</h4>
                      <p className="text-sm text-gray-600">{suite.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>{suite.testCount} tests</span>
                    <span>v{suite.version}</span>
                    {suite.lastRun && (
                      <span>Last run: {suite.lastRun.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={suite.enabled}
                      onChange={() => toggleSuite(suite.id)}
                      className="mr-2"
                    />
                    <span className="text-sm">Enabled</span>
                  </label>

                  {suite.status === 'running' ? (
                    <button
                      onClick={() => stopTestSuite(suite.id)}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      <Square className="w-3 h-3" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => runTestSuite(suite.id)}
                      disabled={loading || !suite.enabled}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                    >
                      <Play className="w-3 h-3" />
                      <span>Run</span>
                    </button>
                  )}

                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIssuesTab = () => (
    <div className="space-y-6">
      {/* Issue Controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            
            <select className="border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="info">Info</option>
            </select>
            
            <select className="border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="">All Types</option>
              <option value="accuracy">Accuracy</option>
              <option value="cultural">Cultural</option>
              <option value="performance">Performance</option>
              <option value="accessibility">Accessibility</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={autoFixIssues}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>Auto-Fix</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Issues ({testIssues.length})</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {testIssues.map(issue => (
            <div key={issue.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      issue.severity === 'critical' ? 'bg-red-500' :
                      issue.severity === 'major' ? 'bg-orange-500' :
                      issue.severity === 'minor' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}></div>
                    
                    <span className={`px-2 py-1 text-xs rounded ${
                      issue.type === 'accuracy' ? 'bg-blue-100 text-blue-800' :
                      issue.type === 'cultural' ? 'bg-red-100 text-red-800' :
                      issue.type === 'performance' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {issue.type}
                    </span>
                    
                    <span className={`px-2 py-1 text-xs rounded ${
                      issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      issue.severity === 'major' ? 'bg-orange-100 text-orange-800' :
                      issue.severity === 'minor' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {issue.severity}
                    </span>

                    {issue.fixed && (
                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                        Fixed
                      </span>
                    )}
                  </div>
                  
                  <p className="mt-2 text-sm">{issue.message}</p>
                  
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Language: {issue.language.toUpperCase()}</span>
                    <span>Content: {issue.contentId}</span>
                    {issue.autoFixable && (
                      <span className="text-purple-600">Auto-fixable</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {issue.autoFixable && !issue.fixed && (
                    <button className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600">
                      Fix
                    </button>
                  )}
                  
                  <button className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Multilingual Testing Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage multilingual content quality testing</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'suites', label: 'Test Suites', icon: Settings },
            { id: 'runs', label: 'Test Runs', icon: Play },
            { id: 'issues', label: 'Issues', icon: AlertTriangle },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'suites' && renderTestSuitesTab()}
      {activeTab === 'issues' && renderIssuesTab()}
      
      {activeTab === 'runs' && (
        <div className="text-center py-12">
          <p className="text-gray-500">Test Runs tab content would be implemented here</p>
        </div>
      )}
      
      {activeTab === 'analytics' && (
        <div className="text-center py-12">
          <p className="text-gray-500">Analytics tab content would be implemented here</p>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <span>Running tests...</span>
          </div>
        </div>
      )}
    </div>
  );
}