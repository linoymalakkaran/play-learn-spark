import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useContent, ContentItem, ContentFilter, ValidationResult } from '@/hooks/useContent';
import { Plus, Edit, Trash2, Save, Eye, Upload, Download, Search, Filter, Globe, Accessibility, BookOpen, Gamepad2, Music, Video, Image, FileText, Users, BarChart3, CheckCircle, AlertCircle, Clock, Star } from 'lucide-react';

interface ContentManagementSystemProps {
  onClose?: () => void;
}

const ContentManagementSystem: React.FC<ContentManagementSystemProps> = ({ onClose }) => {
  const {
    content,
    loadContent,
    createContent,
    updateContent,
    deleteContent,
    validateContent,
    getContentAnalytics,
    isCreatorMode,
    toggleCreatorMode,
    isLoading,
    error
  } = useContent();

  const [activeTab, setActiveTab] = useState('browse');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [editingContent, setEditingContent] = useState<Partial<ContentItem> | null>(null);
  const [filter, setFilter] = useState<ContentFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [importData, setImportData] = useState('');

  const contentList = Object.values(content);
  const filteredContent = contentList.filter(item => {
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !item.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (filter.type && !filter.type.includes(item.type)) return false;
    if (filter.subject && !filter.subject.includes(item.metadata.subject)) return false;
    if (filter.difficulty && !filter.difficulty.includes(item.metadata.difficulty)) return false;
    if (filter.language && item.metadata.language !== filter.language) return false;
    if (filter.status && !filter.status.includes(item.status)) return false;
    
    return true;
  });

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleCreateContent = async () => {
    if (!editingContent) return;

    try {
      const contentData = {
        ...editingContent,
        translations: editingContent.translations || {},
        adaptations: editingContent.adaptations || [],
        tags: editingContent.tags || [],
        categories: editingContent.categories || [],
        targetAge: editingContent.targetAge || [5],
        estimatedDuration: editingContent.estimatedDuration || 10,
        prerequisites: editingContent.prerequisites || [],
        learningObjectives: editingContent.learningObjectives || [],
        version: '1.0',
        status: 'draft' as const
      } as Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>;

      const validation = validateContent(contentData);
      setValidation(validation);

      if (validation.isValid) {
        await createContent(contentData);
        setShowCreateDialog(false);
        setEditingContent(null);
        setValidation(null);
      }
    } catch (err) {
      console.error('Failed to create content:', err);
    }
  };

  const handleUpdateContent = async () => {
    if (!selectedContent || !editingContent) return;

    try {
      await updateContent(selectedContent.id, editingContent);
      setSelectedContent(null);
      setEditingContent(null);
    } catch (err) {
      console.error('Failed to update content:', err);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      await deleteContent(id);
    }
  };

  const getContentTypeIcon = (type: string) => {
    const icons = {
      activity: <Gamepad2 className="h-4 w-4" />,
      lesson: <BookOpen className="h-4 w-4" />,
      story: <FileText className="h-4 w-4" />,
      quiz: <CheckCircle className="h-4 w-4" />,
      game: <Gamepad2 className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <FileText className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      review: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const exportContent = () => {
    const dataStr = JSON.stringify(content, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `play-learn-spark-content-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importContent = async () => {
    try {
      const importedData = JSON.parse(importData);
      
      if (Array.isArray(importedData)) {
        for (const item of importedData) {
          await createContent(item);
        }
      } else if (typeof importedData === 'object' && importedData.id) {
        await createContent(importedData);
      }
      
      setImportData('');
      alert('Content imported successfully!');
    } catch (err) {
      alert('Failed to import content. Please check the format.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management System</h1>
            <p className="text-gray-600">Create, manage, and organize educational content</p>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={isCreatorMode}
              onCheckedChange={toggleCreatorMode}
              className="data-[state=checked]:bg-purple-600"
            />
            <Label>Creator Mode</Label>
            <Button onClick={exportContent} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="browse">Browse Content</TabsTrigger>
            <TabsTrigger value="create">Create Content</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="translations">Translations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Browse Content Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filter.type?.[0] || ''} onValueChange={(value) => setFilter(prev => ({ ...prev, type: value ? [value] : undefined }))}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Content Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="lesson">Lesson</SelectItem>
                      <SelectItem value="story">Story</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="game">Game</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filter.status?.[0] || ''} onValueChange={(value) => setFilter(prev => ({ ...prev, status: value ? [value] : undefined }))}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getContentTypeIcon(item.type)}
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Difficulty: {item.metadata.difficulty}/5</span>
                        <span>{item.estimatedDuration} min</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{item.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center space-x-1">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {Object.keys(item.translations).length + 1} languages
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedContent(item);
                            setEditingContent(item);
                          }}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteContent(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredContent.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Try adjusting your search terms or filters, or create new content.
                  </p>
                  <Button onClick={() => setActiveTab('create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Content
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Create Content Tab */}
          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Content</CardTitle>
                <CardDescription>
                  Design educational content with adaptive difficulty and multi-language support
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ContentEditor
                  content={editingContent}
                  onChange={setEditingContent}
                  validation={validation}
                  onSave={handleCreateContent}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contentList.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Published</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {contentList.filter(c => c.status === 'published').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Review</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {contentList.filter(c => c.status === 'review').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Languages</CardTitle>
                  <Globe className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {new Set(contentList.flatMap(c => [c.metadata.language, ...Object.keys(c.translations)])).size}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentList.slice(0, 5).map((item) => {
                    const analytics = getContentAnalytics(item.id);
                    return (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getContentTypeIcon(item.type)}
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-sm text-gray-500">{analytics.totalViews} views</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">{analytics.completionRate.toFixed(1)}%</p>
                            <p className="text-xs text-gray-500">completion</p>
                          </div>
                          <div className="w-24">
                            <Progress value={analytics.completionRate} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Translations Tab */}
          <TabsContent value="translations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Translation Management</CardTitle>
                <CardDescription>
                  Manage multi-language versions of your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contentList.map((item) => (
                    <Card key={item.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>
                          Original: {item.metadata.language.toUpperCase()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(item.translations).map(([lang, translation]) => (
                            <div key={lang} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{lang.toUpperCase()}</Badge>
                                <span className="text-sm">{translation.title}</span>
                              </div>
                              <Badge className={translation.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {translation.status}
                              </Badge>
                            </div>
                          ))}
                          <Button size="sm" variant="outline" className="w-full mt-3">
                            <Plus className="h-3 w-3 mr-2" />
                            Add Translation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import/Export Content</CardTitle>
                <CardDescription>
                  Backup and restore your content library
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="import-data">Import Content JSON</Label>
                  <Textarea
                    id="import-data"
                    placeholder="Paste your content JSON here..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={10}
                  />
                  <Button onClick={importContent} className="mt-2" disabled={!importData}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Content Dialog */}
        {selectedContent && editingContent && (
          <Dialog open={!!selectedContent} onOpenChange={() => {
            setSelectedContent(null);
            setEditingContent(null);
          }}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Content</DialogTitle>
                <DialogDescription>
                  Make changes to your content item
                </DialogDescription>
              </DialogHeader>
              <ContentEditor
                content={editingContent}
                onChange={setEditingContent}
                isEdit={true}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setSelectedContent(null);
                  setEditingContent(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateContent}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

// Content Editor Component
interface ContentEditorProps {
  content: Partial<ContentItem> | null;
  onChange: (content: Partial<ContentItem>) => void;
  validation?: ValidationResult | null;
  onSave?: () => void;
  isEdit?: boolean;
  isLoading?: boolean;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  onChange,
  validation,
  onSave,
  isEdit = false,
  isLoading = false
}) => {
  const updateField = (field: string, value: any) => {
    onChange({
      ...content,
      [field]: value
    });
  };

  const updateMetadata = (field: string, value: any) => {
    onChange({
      ...content,
      metadata: {
        ...content?.metadata,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={content?.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Enter content title"
          />
        </div>
        <div>
          <Label htmlFor="type">Content Type *</Label>
          <Select value={content?.type || ''} onValueChange={(value) => updateField('type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activity">Activity</SelectItem>
              <SelectItem value="lesson">Lesson</SelectItem>
              <SelectItem value="story">Story</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="game">Game</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={content?.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Describe what this content teaches"
          rows={3}
        />
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <div className="mt-2">
            <Slider
              value={[content?.metadata?.difficulty || 3]}
              onValueChange={([value]) => updateMetadata('difficulty', value)}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Easy</span>
              <span>Medium</span>
              <span>Hard</span>
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={content?.estimatedDuration || ''}
            onChange={(e) => updateField('estimatedDuration', parseInt(e.target.value) || 0)}
            placeholder="10"
          />
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={content?.metadata?.subject || ''}
            onChange={(e) => updateMetadata('subject', e.target.value)}
            placeholder="Math, Science, etc."
          />
        </div>
      </div>

      {/* Target Age */}
      <div>
        <Label>Target Age Range</Label>
        <div className="flex space-x-2 mt-2">
          {[3, 4, 5, 6, 7, 8].map((age) => (
            <Button
              key={age}
              variant={content?.targetAge?.includes(age) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const current = content?.targetAge || [];
                const updated = current.includes(age)
                  ? current.filter(a => a !== age)
                  : [...current, age];
                updateField('targetAge', updated);
              }}
            >
              {age}
            </Button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={content?.tags?.join(', ') || ''}
          onChange={(e) => updateField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          placeholder="interactive, math, colors"
        />
      </div>

      {/* Learning Objectives */}
      <div>
        <Label htmlFor="objectives">Learning Objectives</Label>
        <Textarea
          id="objectives"
          value={content?.learningObjectives?.join('\n') || ''}
          onChange={(e) => updateField('learningObjectives', e.target.value.split('\n').filter(Boolean))}
          placeholder="Enter each objective on a new line"
          rows={3}
        />
      </div>

      {/* Content Data */}
      <div>
        <Label htmlFor="content-data">Content Data (JSON)</Label>
        <Textarea
          id="content-data"
          value={content?.content ? JSON.stringify(content.content, null, 2) : '{}'}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              updateField('content', parsed);
            } catch {
              // Invalid JSON, don't update
            }
          }}
          placeholder='{"instructions": "Click on the correct answer", "questions": []}'
          rows={6}
          className="font-mono text-sm"
        />
      </div>

      {/* Validation Messages */}
      {validation && (
        <div className="space-y-2">
          {validation.errors.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Errors: {validation.errors.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          {validation.warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Warnings: {validation.warnings.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Save Button */}
      {onSave && (
        <Button onClick={onSave} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Content' : 'Create Content'}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default ContentManagementSystem;