import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, UserPlus, Eye, Clock, 
  CheckCircle, AlertCircle, TrendingUp, MoreVertical 
} from 'lucide-react';

interface Translation {
  translationId: string;
  activity: {
    id: string;
    title: string;
    category: string;
    type: string;
    difficulty: string;
  };
  sourceLanguage: string;
  targetLanguage: string;
  status: string;
  priority: string;
  progress: number;
  translator: {
    id: string;
    name: string;
    rating: number;
  };
  timeline: {
    createdAt: string;
    assignedDate?: string;
    deadline: string;
    completedDate?: string;
  };
  quality: {
    score: number;
    assessmentCount: number;
    passesQA: boolean;
  };
  wordCount: number;
  estimatedHours: number;
  actualHours?: number;
}

interface TranslationProgressProps {
  onAssignTranslator?: (translationId: string) => void;
  onViewDetails?: (translationId: string) => void;
}

export const TranslationProgress: React.FC<TranslationProgressProps> = ({
  onAssignTranslator,
  onViewDetails
}) => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    language: '',
    priority: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchTranslations();
  }, [currentPage, filters, sortBy, sortOrder, searchTerm]);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.language && { languages: filters.language }),
        ...(filters.priority && { priority: filters.priority }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/language-management/translations/progress?${queryParams}`);
      const data = await response.json();
      
      setTranslations(data.translations);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('Error fetching translations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'requested': 'bg-yellow-100 text-yellow-800',
      'assigned': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'reviewed': 'bg-cyan-100 text-cyan-800',
      'approved': 'bg-emerald-100 text-emerald-800',
      'published': 'bg-green-200 text-green-900',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'urgent': 'text-red-600',
      'high': 'text-orange-600',
      'medium': 'text-yellow-600',
      'low': 'text-green-600'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleBulkAssign = async () => {
    try {
      const response = await fetch('/api/language-management/translations/bulk-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          criteria: {
            languages: filters.language ? [filters.language] : undefined,
            priority: filters.priority ? [filters.priority] : undefined,
            maxAssignments: 10,
            workloadDistribution: 'balanced'
          }
        })
      });
      
      if (response.ok) {
        fetchTranslations();
      }
    } catch (error) {
      console.error('Error in bulk assignment:', error);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/language-management/translations/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'csv',
          filters
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'translations.csv';
        a.click();
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Translation Progress</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleBulkAssign}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Bulk Assign
          </button>
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search translations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="requested">Requested</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="published">Published</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Languages</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="ar">Arabic</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
          </select>
        </div>
      </div>

      {/* Translations Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Translator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {translations.map((translation) => (
                  <tr key={translation.translationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {translation.activity.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {translation.activity.category} • {translation.activity.type}
                        </div>
                        <div className="flex items-center mt-1">
                          <span className={`text-xs font-medium ${getPriorityColor(translation.priority)}`}>
                            {translation.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            {translation.wordCount} words
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {translation.sourceLanguage.toUpperCase()} → {translation.targetLanguage.toUpperCase()}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(translation.status)}`}>
                        {translation.status.replace('_', ' ')}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressBarColor(translation.progress)}`}
                            style={{ width: `${translation.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900">{translation.progress}%</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {translation.translator.name !== 'Unassigned' ? (
                          <>
                            <div>{translation.translator.name}</div>
                            <div className="flex items-center text-xs text-gray-500">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {translation.translator.rating.toFixed(1)}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-500 italic">Unassigned</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-gray-400" />
                          <span className={isOverdue(translation.timeline.deadline) ? 'text-red-600' : ''}>
                            {formatDate(translation.timeline.deadline)}
                          </span>
                          {isOverdue(translation.timeline.deadline) && (
                            <AlertCircle className="w-3 h-3 ml-1 text-red-500" />
                          )}
                        </div>
                        {translation.timeline.completedDate && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {formatDate(translation.timeline.completedDate)}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {translation.quality.score > 0 ? (
                        <div className="text-sm">
                          <div className={`font-medium ${translation.quality.score >= 80 ? 'text-green-600' : translation.quality.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {translation.quality.score.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {translation.quality.assessmentCount} reviews
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not assessed</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {translation.translator.name === 'Unassigned' && (
                          <button
                            onClick={() => onAssignTranslator?.(translation.translationId)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Assign Translator"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onViewDetails?.(translation.translationId)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * pageSize >= total}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, total)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{total}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage * pageSize >= total}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};