import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { 
  Users, Globe, Clock, TrendingUp, AlertTriangle, CheckCircle, 
  FileText, Zap, Activity, Target
} from 'lucide-react';

interface DashboardOverview {
  summary: {
    totalActivities: number;
    totalTranslations: number;
    pendingTranslations: number;
    completedTranslations: number;
    activeTranslators: number;
    supportedLanguages: number;
    completionRate: number;
  };
  quality: {
    averageScore: number;
    minScore: number;
    maxScore: number;
    assessedCount: number;
  };
  productivity: {
    averageWordsPerHour: number;
    totalWordsTranslated: number;
    totalHoursSpent: number;
  };
  languageDistribution: Array<{
    _id: string;
    count: number;
    completed: number;
    avgQuality: number;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    language: string;
    status: string;
    translator: string;
    updatedAt: string;
  }>;
}

export const LanguageManagementDashboard: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/language-management/dashboard/overview?timeRange=${timeRange}`);
      const data = await response.json();
      setOverview(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'requested': '#f59e0b',
      'assigned': '#3b82f6',
      'in_progress': '#8b5cf6',
      'completed': '#10b981',
      'reviewed': '#06b6d4',
      'approved': '#059669',
      'published': '#047857',
      'rejected': '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!overview) {
    return <div className="text-center py-8">No data available</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Language Management Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor translation progress, quality metrics, and team performance
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {range === '7d' && 'Last 7 days'}
              {range === '30d' && 'Last 30 days'}
              {range === '90d' && 'Last 90 days'}
              {range === '1y' && 'Last year'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-white p-1 rounded-lg">
          {['overview', 'progress', 'quality', 'translators'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Activities</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overview.summary.totalActivities.toLocaleString()}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Translations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overview.summary.totalTranslations.toLocaleString()}
                  </p>
                </div>
                <Globe className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Translators</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overview.summary.activeTranslators}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {overview.summary.completionRate.toFixed(1)}%
                  </p>
                </div>
                <Target className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Language Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Language Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={overview.languageDistribution.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, count }) => `${_id}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {overview.languageDistribution.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Quality Metrics */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Quality Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Quality Score</span>
                  <span className="text-2xl font-bold text-green-600">
                    {overview.quality.averageScore.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Assessed Translations</span>
                  <span className="text-lg font-medium">
                    {overview.quality.assessedCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Quality Range</span>
                  <span className="text-lg font-medium">
                    {overview.quality.minScore.toFixed(1)} - {overview.quality.maxScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Productivity Metrics */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Productivity Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-600">Words/Hour</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.productivity.averageWordsPerHour.toFixed(0)}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Total Words</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.productivity.totalWordsTranslated.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-600">Total Hours</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {overview.productivity.totalHoursSpent.toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {overview.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStatusColor(activity.status) }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">
                        {activity.language.toUpperCase()} • {activity.translator}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium capitalize text-gray-700">
                      {activity.status.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Other tabs content would be implemented similarly */}
      {activeTab !== 'overview' && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-600">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tab content will be implemented here
          </p>
        </div>
      )}
    </div>
  );
};