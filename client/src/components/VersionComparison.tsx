/**
 * Version Comparison Component
 * 
 * Side-by-side comparison of content versions with diff highlighting,
 * merge conflict resolution, and visual comparison tools.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { 
  ArrowLeft, 
  ArrowRight, 
  ArrowLeftRight, 
  Download, 
  Eye, 
  EyeOff,
  FileText,
  GitBranch,
  Settings,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import './VersionComparison.css';

// Types
interface DiffLine {
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
  isHighlighted?: boolean;
}

interface DiffSection {
  title: string;
  type: 'text' | 'metadata' | 'media' | 'structure';
  oldContent: any;
  newContent: any;
  diff: DiffLine[];
  hasChanges: boolean;
}

interface VersionData {
  id: string;
  version: string;
  title: string;
  author: string;
  createdAt: Date;
  status: string;
  content: {
    text: string;
    metadata: any;
    media: any[];
    structure: any;
  };
}

interface VersionComparisonProps {
  contentId: string;
  version1: string;
  version2: string;
  onClose: () => void;
  onMerge?: (mergedContent: any) => void;
  onApplyChanges?: (changes: any) => void;
  mode?: 'view' | 'merge';
}

const VersionComparison: React.FC<VersionComparisonProps> = ({
  contentId,
  version1,
  version2,
  onClose,
  onMerge,
  onApplyChanges,
  mode = 'view'
}) => {
  // State
  const [versionData1, setVersionData1] = useState<VersionData | null>(null);
  const [versionData2, setVersionData2] = useState<VersionData | null>(null);
  const [diffSections, setDiffSections] = useState<DiffSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified' | 'split'>('side-by-side');
  const [showOnlyChanges, setShowOnlyChanges] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showWhitespace, setShowWhitespace] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [mergeResolutions, setMergeResolutions] = useState<Record<string, 'left' | 'right' | 'both'>>({});

  // Load version data
  useEffect(() => {
    loadVersionData();
  }, [contentId, version1, version2]);

  const loadVersionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API calls - replace with actual API
      const [response1, response2] = await Promise.all([
        fetch(`/api/content/${contentId}/versions/${version1}`),
        fetch(`/api/content/${contentId}/versions/${version2}`)
      ]);

      if (!response1.ok || !response2.ok) {
        throw new Error('Failed to load version data');
      }

      const data1 = await response1.json();
      const data2 = await response2.json();

      setVersionData1(data1.version);
      setVersionData2(data2.version);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load version data');
      console.error('Error loading version data:', err);
      
      // Mock data for development
      const mockData1: VersionData = {
        id: version1,
        version: 'v2.0.3',
        title: 'Math Fundamentals - Addition & Subtraction',
        author: 'Mike Chen',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'published',
        content: {
          text: `# Math Fundamentals: Addition & Subtraction

Welcome to our interactive math lesson! Today we'll learn about addition and subtraction.

## Learning Objectives
- Understand basic addition concepts
- Practice single-digit addition
- Learn subtraction as the opposite of addition

## Addition Basics
Addition means putting numbers together to find the total.

When we add 2 + 3, we get 5.

## Interactive Example
Try this problem: 4 + 2 = ?

## Subtraction Basics  
Subtraction means taking away numbers.

When we subtract 5 - 2, we get 3.`,
          metadata: {
            gradeLevel: ['1', '2'],
            subject: 'mathematics',
            difficulty: 'beginner',
            estimatedTime: 15,
            standards: ['CCSS.MATH.CONTENT.1.OA.A.1']
          },
          media: [
            { type: 'image', url: '/images/addition-example.png', alt: 'Addition example' },
            { type: 'video', url: '/videos/counting-tutorial.mp4', title: 'Counting Tutorial' }
          ],
          structure: {
            sections: [
              { id: '1', title: 'Introduction', type: 'text' },
              { id: '2', title: 'Addition Basics', type: 'text' },
              { id: '3', title: 'Interactive Example', type: 'activity' },
              { id: '4', title: 'Subtraction Basics', type: 'text' }
            ]
          }
        }
      };

      const mockData2: VersionData = {
        id: version2,
        version: 'v2.1.0',
        title: 'Math Fundamentals - Addition & Subtraction',
        author: 'Sarah Johnson',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'published',
        content: {
          text: `# Math Fundamentals: Addition & Subtraction

Welcome to our interactive math lesson! Today we'll explore addition and subtraction with fun examples.

## Learning Objectives
- Understand basic addition concepts
- Practice single-digit and double-digit addition
- Learn subtraction as the opposite of addition
- Apply concepts to real-world problems

## Addition Basics
Addition means combining numbers to find the total sum.

When we add 2 + 3, we get 5.
Let's try another: 7 + 4 = 11

## Interactive Examples
Try these problems:
- 4 + 2 = ?
- 8 + 5 = ?
- 6 + 9 = ?

## Subtraction Basics  
Subtraction means removing or taking away numbers.

When we subtract 5 - 2, we get 3.
Another example: 10 - 4 = 6

## Real-World Applications
- If you have 8 apples and eat 3, how many are left?
- If you save $5 this week and $7 next week, how much total?`,
          metadata: {
            gradeLevel: ['1', '2', '3'],
            subject: 'mathematics',
            difficulty: 'beginner',
            estimatedTime: 20,
            standards: ['CCSS.MATH.CONTENT.1.OA.A.1', 'CCSS.MATH.CONTENT.2.OA.A.1']
          },
          media: [
            { type: 'image', url: '/images/addition-example-updated.png', alt: 'Updated addition example' },
            { type: 'video', url: '/videos/counting-tutorial.mp4', title: 'Counting Tutorial' },
            { type: 'interactive', url: '/activities/math-game.html', title: 'Math Practice Game' }
          ],
          structure: {
            sections: [
              { id: '1', title: 'Introduction', type: 'text' },
              { id: '2', title: 'Addition Basics', type: 'text' },
              { id: '3', title: 'Interactive Examples', type: 'activity' },
              { id: '4', title: 'Subtraction Basics', type: 'text' },
              { id: '5', title: 'Real-World Applications', type: 'text' }
            ]
          }
        }
      };

      setVersionData1(mockData1);
      setVersionData2(mockData2);
    } finally {
      setLoading(false);
    }
  };

  // Generate diff sections
  const generateDiffSections = useMemo(() => {
    if (!versionData1 || !versionData2) return [];

    const sections: DiffSection[] = [];

    // Text content diff
    const textDiff = generateTextDiff(versionData1.content.text, versionData2.content.text);
    sections.push({
      title: 'Content Text',
      type: 'text',
      oldContent: versionData1.content.text,
      newContent: versionData2.content.text,
      diff: textDiff,
      hasChanges: textDiff.some(line => line.type !== 'unchanged')
    });

    // Metadata diff
    const metadataDiff = generateMetadataDiff(versionData1.content.metadata, versionData2.content.metadata);
    sections.push({
      title: 'Metadata',
      type: 'metadata',
      oldContent: versionData1.content.metadata,
      newContent: versionData2.content.metadata,
      diff: metadataDiff,
      hasChanges: metadataDiff.some(line => line.type !== 'unchanged')
    });

    // Media diff
    const mediaDiff = generateMediaDiff(versionData1.content.media, versionData2.content.media);
    sections.push({
      title: 'Media Assets',
      type: 'media',
      oldContent: versionData1.content.media,
      newContent: versionData2.content.media,
      diff: mediaDiff,
      hasChanges: mediaDiff.some(line => line.type !== 'unchanged')
    });

    // Structure diff
    const structureDiff = generateStructureDiff(versionData1.content.structure, versionData2.content.structure);
    sections.push({
      title: 'Content Structure',
      type: 'structure',
      oldContent: versionData1.content.structure,
      newContent: versionData2.content.structure,
      diff: structureDiff,
      hasChanges: structureDiff.some(line => line.type !== 'unchanged')
    });

    setDiffSections(sections);
    return sections;
  }, [versionData1, versionData2]);

  // Generate text diff
  const generateTextDiff = (oldText: string, newText: string): DiffLine[] => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const diff: DiffLine[] = [];
    
    // Simple line-by-line diff (in a real implementation, use a proper diff algorithm)
    const maxLines = Math.max(oldLines.length, newLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];
      
      if (oldLine === newLine) {
        if (oldLine !== undefined) {
          diff.push({
            type: 'unchanged',
            oldLineNumber: i + 1,
            newLineNumber: i + 1,
            content: oldLine
          });
        }
      } else if (oldLine === undefined) {
        diff.push({
          type: 'added',
          newLineNumber: i + 1,
          content: newLine
        });
      } else if (newLine === undefined) {
        diff.push({
          type: 'removed',
          oldLineNumber: i + 1,
          content: oldLine
        });
      } else {
        diff.push({
          type: 'removed',
          oldLineNumber: i + 1,
          content: oldLine
        });
        diff.push({
          type: 'added',
          newLineNumber: i + 1,
          content: newLine
        });
      }
    }
    
    return diff;
  };

  // Generate metadata diff
  const generateMetadataDiff = (oldMeta: any, newMeta: any): DiffLine[] => {
    const diff: DiffLine[] = [];
    const allKeys = new Set([...Object.keys(oldMeta), ...Object.keys(newMeta)]);
    
    allKeys.forEach(key => {
      const oldValue = oldMeta[key];
      const newValue = newMeta[key];
      const oldStr = JSON.stringify(oldValue, null, 2);
      const newStr = JSON.stringify(newValue, null, 2);
      
      if (oldStr === newStr) {
        diff.push({
          type: 'unchanged',
          content: `${key}: ${oldStr}`
        });
      } else if (oldValue === undefined) {
        diff.push({
          type: 'added',
          content: `${key}: ${newStr}`
        });
      } else if (newValue === undefined) {
        diff.push({
          type: 'removed',
          content: `${key}: ${oldStr}`
        });
      } else {
        diff.push({
          type: 'removed',
          content: `${key}: ${oldStr}`
        });
        diff.push({
          type: 'added',
          content: `${key}: ${newStr}`
        });
      }
    });
    
    return diff;
  };

  // Generate media diff
  const generateMediaDiff = (oldMedia: any[], newMedia: any[]): DiffLine[] => {
    const diff: DiffLine[] = [];
    
    // Simple comparison by index (in a real implementation, compare by ID or URL)
    const maxLength = Math.max(oldMedia.length, newMedia.length);
    
    for (let i = 0; i < maxLength; i++) {
      const oldItem = oldMedia[i];
      const newItem = newMedia[i];
      
      if (!oldItem && newItem) {
        diff.push({
          type: 'added',
          content: `+ ${newItem.type}: ${newItem.title || newItem.alt || newItem.url}`
        });
      } else if (oldItem && !newItem) {
        diff.push({
          type: 'removed',
          content: `- ${oldItem.type}: ${oldItem.title || oldItem.alt || oldItem.url}`
        });
      } else if (oldItem && newItem) {
        const oldStr = `${oldItem.type}: ${oldItem.title || oldItem.alt || oldItem.url}`;
        const newStr = `${newItem.type}: ${newItem.title || newItem.alt || newItem.url}`;
        
        if (oldStr === newStr) {
          diff.push({
            type: 'unchanged',
            content: oldStr
          });
        } else {
          diff.push({
            type: 'removed',
            content: `- ${oldStr}`
          });
          diff.push({
            type: 'added',
            content: `+ ${newStr}`
          });
        }
      }
    }
    
    return diff;
  };

  // Generate structure diff
  const generateStructureDiff = (oldStructure: any, newStructure: any): DiffLine[] => {
    const oldStr = JSON.stringify(oldStructure, null, 2);
    const newStr = JSON.stringify(newStructure, null, 2);
    
    if (oldStr === newStr) {
      return [{
        type: 'unchanged',
        content: 'Structure unchanged'
      }];
    }
    
    return [
      {
        type: 'removed',
        content: `- ${oldStr}`
      },
      {
        type: 'added',
        content: `+ ${newStr}`
      }
    ];
  };

  // Filter diff sections
  const filteredSections = useMemo(() => {
    let sections = diffSections;
    
    if (selectedSection !== 'all') {
      sections = sections.filter(section => section.type === selectedSection);
    }
    
    if (showOnlyChanges) {
      sections = sections.filter(section => section.hasChanges);
    }
    
    return sections;
  }, [diffSections, selectedSection, showOnlyChanges]);

  // Render diff line
  const renderDiffLine = (line: DiffLine, index: number) => {
    const lineClass = `diff-line diff-line-${line.type}`;
    
    return (
      <div key={index} className={lineClass}>
        {showLineNumbers && (
          <div className="line-numbers">
            {line.oldLineNumber && <span className="old-line-number">{line.oldLineNumber}</span>}
            {line.newLineNumber && <span className="new-line-number">{line.newLineNumber}</span>}
          </div>
        )}
        <div className="line-content">
          {line.type === 'added' && <span className="diff-marker">+</span>}
          {line.type === 'removed' && <span className="diff-marker">-</span>}
          <span className="line-text">{line.content}</span>
        </div>
        {mode === 'merge' && line.type !== 'unchanged' && (
          <div className="merge-actions">
            <Button size="sm" variant="ghost" onClick={() => handleMergeResolution(index, 'left')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => handleMergeResolution(index, 'right')}>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Handle merge resolution
  const handleMergeResolution = (lineIndex: number, side: 'left' | 'right') => {
    setMergeResolutions(prev => ({
      ...prev,
      [lineIndex]: side
    }));
  };

  // Run diff generation effect
  useEffect(() => {
    generateDiffSections;
  }, [generateDiffSections]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading version comparison...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Comparison</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={loadVersionData}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`version-comparison ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="comparison-overlay">
        <div className="comparison-container">
          {/* Header */}
          <div className="comparison-header">
            <div className="header-left">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="mx-2" />
              <h2 className="text-lg font-semibold">Version Comparison</h2>
            </div>
            
            <div className="header-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              {mode === 'merge' && (
                <Button size="sm">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Apply Merge
                </Button>
              )}
            </div>
          </div>

          {/* Version Info */}
          <div className="version-info">
            <div className="version-card">
              <div className="version-header">
                <Badge variant="outline">{versionData1?.version}</Badge>
                <span className="version-title">{versionData1?.title}</span>
              </div>
              <div className="version-meta">
                <span>{versionData1?.author}</span>
                <span>{versionData1 && format(versionData1.createdAt, 'MMM d, yyyy')}</span>
                <Badge className="status-badge">{versionData1?.status}</Badge>
              </div>
            </div>
            
            <div className="comparison-arrow">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            
            <div className="version-card">
              <div className="version-header">
                <Badge variant="outline">{versionData2?.version}</Badge>
                <span className="version-title">{versionData2?.title}</span>
              </div>
              <div className="version-meta">
                <span>{versionData2?.author}</span>
                <span>{versionData2 && format(versionData2.createdAt, 'MMM d, yyyy')}</span>
                <Badge className="status-badge">{versionData2?.status}</Badge>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="comparison-controls">
            <div className="controls-left">
              <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="side-by-side">Side by Side</SelectItem>
                  <SelectItem value="unified">Unified</SelectItem>
                  <SelectItem value="split">Split View</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  <SelectItem value="text">Text Content</SelectItem>
                  <SelectItem value="metadata">Metadata</SelectItem>
                  <SelectItem value="media">Media Assets</SelectItem>
                  <SelectItem value="structure">Structure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="controls-right">
              <div className="switch-group">
                <Switch checked={showOnlyChanges} onCheckedChange={setShowOnlyChanges} />
                <label>Show only changes</label>
              </div>
              <div className="switch-group">
                <Switch checked={showLineNumbers} onCheckedChange={setShowLineNumbers} />
                <label>Line numbers</label>
              </div>
              <div className="switch-group">
                <Switch checked={showWhitespace} onCheckedChange={setShowWhitespace} />
                <label>Whitespace</label>
              </div>
            </div>
          </div>

          {/* Diff Content */}
          <div className="comparison-content">
            <ScrollArea className="h-full">
              {filteredSections.length === 0 ? (
                <div className="no-changes">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Changes Found</h3>
                  <p className="text-gray-500">
                    {showOnlyChanges ? 'No differences between the selected versions.' : 'Try adjusting your filters.'}
                  </p>
                </div>
              ) : (
                <div className="diff-sections">
                  {filteredSections.map((section, sectionIndex) => (
                    <Card key={sectionIndex} className="diff-section">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {section.title}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {section.hasChanges ? (
                              <Badge variant="secondary" className="text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Changes
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <Check className="w-3 h-3 mr-1" />
                                No changes
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className={`diff-view diff-view-${viewMode}`}>
                          {section.diff.map((line, lineIndex) => renderDiffLine(line, lineIndex))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Statistics */}
          <div className="comparison-stats">
            <div className="stat-item">
              <span className="stat-value text-green-600">
                +{diffSections.reduce((acc, section) => 
                  acc + section.diff.filter(line => line.type === 'added').length, 0
                )}
              </span>
              <span className="stat-label">Added</span>
            </div>
            <div className="stat-item">
              <span className="stat-value text-red-600">
                -{diffSections.reduce((acc, section) => 
                  acc + section.diff.filter(line => line.type === 'removed').length, 0
                )}
              </span>
              <span className="stat-label">Removed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value text-blue-600">
                {diffSections.reduce((acc, section) => 
                  acc + section.diff.filter(line => line.type === 'modified').length, 0
                )}
              </span>
              <span className="stat-label">Modified</span>
            </div>
            <div className="stat-item">
              <span className="stat-value text-gray-600">
                {diffSections.filter(section => section.hasChanges).length}
              </span>
              <span className="stat-label">Sections Changed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionComparison;