/**
 * Content Versioning Component
 * 
 * Comprehensive interface for managing content versions, including
 * version history, branching, comparison, rollback, and approval workflows.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Clock, 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  Eye, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User, 
  Calendar, 
  FileText, 
  Download, 
  Upload,
  MoreHorizontal,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Share2,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import VersionComparison from './VersionComparison';
import './ContentVersioning.css';

// Types
interface ContentVersion {
  id: string;
  version: string;
  title: string;
  description: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  changes: {
    summary: string;
    details: string[];
    filesChanged: number;
    linesAdded: number;
    linesRemoved: number;
  };
  parentVersion?: string;
  branchName?: string;
  reviewers?: {
    id: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    reviewedAt?: Date;
  }[];
  tags: string[];
  isMain: boolean;
  isCurrent: boolean;
  size: number;
  downloads: number;
}

interface ContentVersioningProps {
  contentId: string;
  currentVersion?: string;
  onVersionSelect?: (version: ContentVersion) => void;
  onVersionRestore?: (versionId: string) => void;
  onVersionDelete?: (versionId: string) => void;
  onCreateBranch?: (fromVersion: string, branchName: string) => void;
  onMergeBranch?: (sourceVersion: string, targetVersion: string) => void;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowPublish?: boolean;
}

const ContentVersioning: React.FC<ContentVersioningProps> = ({
  contentId,
  currentVersion,
  onVersionSelect,
  onVersionRestore,
  onVersionDelete,
  onCreateBranch,
  onMergeBranch,
  allowEdit = true,
  allowDelete = false,
  allowPublish = false
}) => {
  // State
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null);
  const [comparisonVersions, setComparisonVersions] = useState<[string, string] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'tree'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateBranch, setShowCreateBranch] = useState(false);
  const [showMergeBranch, setShowMergeBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [mergeBranchData, setMergeBranchData] = useState<{
    source: string;
    target: string;
    message: string;
  }>({ source: '', target: '', message: '' });

  // Load versions
  useEffect(() => {
    loadVersions();
  }, [contentId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call - replace with actual API
      const response = await fetch(`/api/content/${contentId}/versions`);
      if (!response.ok) throw new Error('Failed to load versions');
      
      const data = await response.json();
      setVersions(data.versions || []);
      
      // Set current version if provided
      if (currentVersion) {
        const current = data.versions.find((v: ContentVersion) => v.id === currentVersion);
        if (current) setSelectedVersion(current);
      } else if (data.versions.length > 0) {
        setSelectedVersion(data.versions[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load versions');
      console.error('Error loading versions:', err);
      
      // Mock data for development
      const mockVersions: ContentVersion[] = [
        {
          id: '1',
          version: 'v2.1.0',
          title: 'Math Fundamentals - Addition & Subtraction',
          description: 'Updated with new interactive examples and improved explanations',
          author: { id: '1', name: 'Sarah Johnson' },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'published',
          changes: {
            summary: 'Added 5 new interactive examples, improved explanations',
            details: [
              'Added visual number line examples',
              'Updated problem difficulty progression',
              'Fixed typos in instructions',
              'Enhanced accessibility features'
            ],
            filesChanged: 8,
            linesAdded: 156,
            linesRemoved: 23
          },
          parentVersion: '2',
          branchName: 'main',
          reviewers: [
            { id: '2', name: 'Mike Chen', status: 'approved', reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
            { id: '3', name: 'Emily Davis', status: 'approved', reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
          ],
          tags: ['math', 'elementary', 'interactive'],
          isMain: true,
          isCurrent: true,
          size: 2456789,
          downloads: 1234
        },
        {
          id: '2',
          version: 'v2.0.3',
          title: 'Math Fundamentals - Addition & Subtraction',
          description: 'Bug fixes and performance improvements',
          author: { id: '2', name: 'Mike Chen' },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          status: 'archived',
          changes: {
            summary: 'Fixed 3 critical bugs, improved loading performance',
            details: [
              'Fixed calculation errors in advanced problems',
              'Improved image loading performance',
              'Fixed mobile responsiveness issues'
            ],
            filesChanged: 4,
            linesAdded: 67,
            linesRemoved: 45
          },
          parentVersion: '3',
          branchName: 'main',
          tags: ['bugfix', 'performance'],
          isMain: true,
          isCurrent: false,
          size: 2445123,
          downloads: 987
        },
        {
          id: '3',
          version: 'v2.0.2-feature-animations',
          title: 'Math Fundamentals - With Animations',
          description: 'Experimental branch with new animations',
          author: { id: '3', name: 'Emily Davis' },
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          status: 'review',
          changes: {
            summary: 'Added animated number demonstrations',
            details: [
              'Created CSS animations for number counting',
              'Added animated visual aids',
              'Implemented smooth transitions'
            ],
            filesChanged: 12,
            linesAdded: 234,
            linesRemoved: 12
          },
          parentVersion: '4',
          branchName: 'feature/animations',
          reviewers: [
            { id: '1', name: 'Sarah Johnson', status: 'pending' }
          ],
          tags: ['feature', 'animations', 'experimental'],
          isMain: false,
          isCurrent: false,
          size: 2567890,
          downloads: 45
        }
      ];
      setVersions(mockVersions);
      setSelectedVersion(mockVersions[0]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search versions
  const filteredVersions = versions.filter(version => {
    const matchesStatus = filterStatus === 'all' || version.status === filterStatus;
    const matchesBranch = filterBranch === 'all' || version.branchName === filterBranch;
    const matchesSearch = searchTerm === '' || 
      version.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      version.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      version.changes.summary.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesBranch && matchesSearch;
  });

  // Get unique branches
  const branches = Array.from(new Set(versions.map(v => v.branchName).filter(Boolean)));

  // Handlers
  const handleVersionSelect = (version: ContentVersion) => {
    setSelectedVersion(version);
    onVersionSelect?.(version);
  };

  const handleVersionRestore = async (version: ContentVersion) => {
    try {
      await onVersionRestore?.(version.id);
      loadVersions(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  const handleVersionDelete = async (version: ContentVersion) => {
    try {
      await onVersionDelete?.(version.id);
      loadVersions(); // Reload to get updated data
    } catch (error) {
      console.error('Failed to delete version:', error);
    }
  };

  const handleCreateBranch = async () => {
    if (!selectedVersion || !newBranchName.trim()) return;
    
    try {
      await onCreateBranch?.(selectedVersion.id, newBranchName.trim());
      setShowCreateBranch(false);
      setNewBranchName('');
      loadVersions();
    } catch (error) {
      console.error('Failed to create branch:', error);
    }
  };

  const handleMergeBranch = async () => {
    if (!mergeBranchData.source || !mergeBranchData.target) return;
    
    try {
      await onMergeBranch?.(mergeBranchData.source, mergeBranchData.target);
      setShowMergeBranch(false);
      setMergeBranchData({ source: '', target: '', message: '' });
      loadVersions();
    } catch (error) {
      console.error('Failed to merge branch:', error);
    }
  };

  const handleCompareVersions = (version1: string, version2: string) => {
    setComparisonVersions([version1, version2]);
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'archived': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'review': return <AlertCircle className="w-4 h-4" />;
      case 'draft': return <Edit3 className="w-4 h-4" />;
      case 'archived': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading versions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          {error}
        </div>
        <Button onClick={loadVersions} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="content-versioning">
      <div className="versioning-header">
        <div className="header-top">
          <div className="header-info">
            <h2 className="text-2xl font-bold">Version Management</h2>
            <p className="text-gray-600">Manage content versions, branches, and reviews</p>
          </div>
          
          <div className="header-actions">
            <Dialog open={showCreateBranch} onOpenChange={setShowCreateBranch}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Create Branch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Branch</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Branch from:</label>
                    <p className="text-sm text-gray-600">
                      {selectedVersion?.version} ({selectedVersion?.branchName})
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">New branch name:</label>
                    <Input
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      placeholder="feature/new-feature"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateBranch(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateBranch} disabled={!newBranchName.trim()}>
                      Create Branch
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showMergeBranch} onOpenChange={setShowMergeBranch}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <GitMerge className="w-4 h-4 mr-2" />
                  Merge Branch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Merge Branch</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Source branch:</label>
                    <Select value={mergeBranchData.source} onValueChange={(value) => 
                      setMergeBranchData(prev => ({ ...prev, source: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map(branch => (
                          <SelectItem key={branch} value={branch || ''}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Target branch:</label>
                    <Select value={mergeBranchData.target} onValueChange={(value) => 
                      setMergeBranchData(prev => ({ ...prev, target: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map(branch => (
                          <SelectItem key={branch} value={branch || ''}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Merge message:</label>
                    <Textarea
                      value={mergeBranchData.message}
                      onChange={(e) => setMergeBranchData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Describe the merge..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowMergeBranch(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleMergeBranch} 
                      disabled={!mergeBranchData.source || !mergeBranchData.target}
                    >
                      Merge Branch
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="header-filters">
          <div className="filter-group">
            <Input
              placeholder="Search versions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBranch} onValueChange={setFilterBranch}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(branch => (
                  <SelectItem key={branch} value={branch || ''}>{branch}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="view-toggle">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </Button>
            <Button
              variant={viewMode === 'tree' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('tree')}
            >
              Tree
            </Button>
          </div>
        </div>
      </div>

      <div className="versioning-content">
        <div className="versions-panel">
          <ScrollArea className="h-[600px]">
            {viewMode === 'list' && (
              <div className="versions-list">
                {filteredVersions.map((version) => (
                  <Card 
                    key={version.id} 
                    className={`version-card ${selectedVersion?.id === version.id ? 'selected' : ''} ${version.isCurrent ? 'current' : ''}`}
                    onClick={() => handleVersionSelect(version)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{version.version}</CardTitle>
                            {version.isCurrent && (
                              <Badge variant="default" className="text-xs">
                                CURRENT
                              </Badge>
                            )}
                            {version.isMain && (
                              <Badge variant="outline" className="text-xs">
                                <GitBranch className="w-3 h-3 mr-1" />
                                MAIN
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-sm">
                            {version.title}
                          </CardDescription>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getStatusColor(version.status)}`}>
                            {getStatusIcon(version.status)}
                            <span className="ml-1 capitalize">{version.status}</span>
                          </Badge>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleVersionSelect(version)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {allowEdit && (
                                <DropdownMenuItem onClick={() => handleCompareVersions(version.id, selectedVersion?.id || '')}>
                                  <Copy className="w-4 h-4 mr-2" />
                                  Compare
                                </DropdownMenuItem>
                              )}
                              {allowEdit && !version.isCurrent && (
                                <DropdownMenuItem onClick={() => handleVersionRestore(version)}>
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Restore
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              {allowDelete && !version.isCurrent && (
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleVersionDelete(version)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          {version.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {version.author.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDistanceToNow(version.createdAt, { addSuffix: true })}
                          </div>
                          <div className="flex items-center gap-1">
                            <GitCommit className="w-4 h-4" />
                            {version.branchName}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {version.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="changes-summary">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {version.changes.summary}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="text-green-600">+{version.changes.linesAdded}</span>
                            <span className="text-red-600">-{version.changes.linesRemoved}</span>
                            <span>{version.changes.filesChanged} files</span>
                            <span>{version.downloads} downloads</span>
                          </div>
                        </div>

                        {version.reviewers && version.reviewers.length > 0 && (
                          <div className="reviewers">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">Reviewers:</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {version.reviewers.map(reviewer => (
                                <div key={reviewer.id} className="flex items-center gap-1">
                                  <Badge
                                    variant={
                                      reviewer.status === 'approved' ? 'default' :
                                      reviewer.status === 'rejected' ? 'destructive' : 'secondary'
                                    }
                                    className="text-xs"
                                  >
                                    {reviewer.name}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {viewMode === 'timeline' && (
              <div className="versions-timeline">
                {filteredVersions.map((version, index) => (
                  <div key={version.id} className="timeline-item">
                    <div className="timeline-marker">
                      <div className={`timeline-dot ${version.isCurrent ? 'current' : ''}`}>
                        {getStatusIcon(version.status)}
                      </div>
                      {index < filteredVersions.length - 1 && <div className="timeline-line" />}
                    </div>
                    <div className="timeline-content">
                      <Card className={`timeline-card ${selectedVersion?.id === version.id ? 'selected' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{version.version}</h4>
                              <p className="text-sm text-gray-600">{version.changes.summary}</p>
                            </div>
                            <Badge className={`text-xs ${getStatusColor(version.status)}`}>
                              {version.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{version.author.name}</span>
                            <span>{format(version.createdAt, 'MMM d, yyyy')}</span>
                            <span>{version.branchName}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'tree' && (
              <div className="versions-tree">
                {/* Tree view implementation would go here */}
                <div className="text-center py-8 text-gray-500">
                  Tree view coming soon...
                </div>
              </div>
            )}
          </ScrollArea>
        </div>

        {selectedVersion && (
          <div className="version-details">
            <Tabs defaultValue="details" className="w-full">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="changes">Changes</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Version Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Version</label>
                        <p className="text-lg font-semibold">{selectedVersion.version}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Status</label>
                        <Badge className={`${getStatusColor(selectedVersion.status)} mt-1`}>
                          {getStatusIcon(selectedVersion.status)}
                          <span className="ml-1 capitalize">{selectedVersion.status}</span>
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Author</label>
                        <p>{selectedVersion.author.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Branch</label>
                        <p>{selectedVersion.branchName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Created</label>
                        <p>{format(selectedVersion.createdAt, 'PPP')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Size</label>
                        <p>{(selectedVersion.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Description</label>
                      <p className="mt-1">{selectedVersion.description}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-600">Tags</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedVersion.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="changes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Changes Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            +{selectedVersion.changes.linesAdded}
                          </div>
                          <div className="text-sm text-green-600">Lines Added</div>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">
                            -{selectedVersion.changes.linesRemoved}
                          </div>
                          <div className="text-sm text-red-600">Lines Removed</div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedVersion.changes.filesChanged}
                          </div>
                          <div className="text-sm text-blue-600">Files Changed</div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="font-medium mb-2">Change Details</h4>
                        <ul className="space-y-1">
                          {selectedVersion.changes.details.map((detail, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Diff
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Review Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedVersion.reviewers && selectedVersion.reviewers.length > 0 ? (
                      <div className="space-y-4">
                        {selectedVersion.reviewers.map(reviewer => (
                          <div key={reviewer.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{reviewer.name}</span>
                                <Badge
                                  variant={
                                    reviewer.status === 'approved' ? 'default' :
                                    reviewer.status === 'rejected' ? 'destructive' : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {reviewer.status}
                                </Badge>
                              </div>
                              {reviewer.reviewedAt && (
                                <p className="text-sm text-gray-500">
                                  Reviewed {formatDistanceToNow(reviewer.reviewedAt, { addSuffix: true })}
                                </p>
                              )}
                              {reviewer.comments && (
                                <p className="text-sm mt-2 p-2 bg-gray-50 rounded">
                                  {reviewer.comments}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        No reviews yet
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Version History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6 text-gray-500">
                      Version history visualization coming soon...
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Version Comparison Dialog */}
      {comparisonVersions && (
        <VersionComparison
          contentId={contentId}
          version1={comparisonVersions[0]}
          version2={comparisonVersions[1]}
          onClose={() => setComparisonVersions(null)}
        />
      )}
    </div>
  );
};

export default ContentVersioning;