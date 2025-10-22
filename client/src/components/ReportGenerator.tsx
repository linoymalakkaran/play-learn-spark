import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  Users,
  BookOpen,
  Target,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  Award,
  Star,
  Brain,
  Eye,
  Settings,
  Filter,
  RefreshCw,
  Send,
  Save,
  Printer,
  Mail,
  Share,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Check,
  X,
  Info,
  AlertTriangle,
  Lightbulb,
  Zap,
  Activity,
  Grid,
  List,
  Image,
  Table,
  FileSpreadsheet,
  FilePdf
} from 'lucide-react';

interface ReportGeneratorProps {
  userRole?: 'teacher' | 'parent' | 'admin';
  classId?: string;
  studentId?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'progress' | 'engagement' | 'outcomes' | 'activity' | 'parent' | 'admin';
  format: 'pdf' | 'excel' | 'csv' | 'html';
  sections: ReportSection[];
  schedule?: ReportSchedule;
}

interface ReportSection {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'summary' | 'text' | 'image';
  included: boolean;
  configuration?: any;
}

interface ReportSchedule {
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  nextRun?: Date;
}

interface ReportRequest {
  templateId: string;
  title: string;
  description: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: {
    students: string[];
    subjects: string[];
    activities: string[];
    skillAreas: string[];
  };
  format: 'pdf' | 'excel' | 'csv' | 'html';
  sections: string[];
  recipients: string[];
  schedule?: ReportSchedule;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  userRole = 'teacher',
  classId,
  studentId
}) => {
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'templates' | 'history'>('create');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportRequest, setReportRequest] = useState<ReportRequest>({
    templateId: '',
    title: '',
    description: '',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    },
    filters: {
      students: [],
      subjects: [],
      activities: [],
      skillAreas: []
    },
    format: 'pdf',
    sections: [],
    recipients: []
  });

  // Available templates
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([
    {
      id: 'student-progress',
      name: 'Student Progress Report',
      description: 'Comprehensive overview of individual student learning progress',
      category: 'progress',
      format: 'pdf',
      sections: [
        { id: 'overview', title: 'Progress Overview', type: 'summary', included: true },
        { id: 'skills', title: 'Skill Development', type: 'chart', included: true },
        { id: 'activities', title: 'Activity Performance', type: 'table', included: true },
        { id: 'trends', title: 'Learning Trends', type: 'chart', included: true },
        { id: 'goals', title: 'Learning Goals', type: 'summary', included: false },
        { id: 'recommendations', title: 'Recommendations', type: 'text', included: true }
      ]
    },
    {
      id: 'class-overview',
      name: 'Class Overview Report',
      description: 'Summary of class performance and engagement metrics',
      category: 'engagement',
      format: 'pdf',
      sections: [
        { id: 'class-stats', title: 'Class Statistics', type: 'summary', included: true },
        { id: 'engagement', title: 'Engagement Analysis', type: 'chart', included: true },
        { id: 'top-performers', title: 'Top Performers', type: 'table', included: true },
        { id: 'needs-attention', title: 'Students Needing Support', type: 'table', included: true },
        { id: 'activity-popularity', title: 'Popular Activities', type: 'chart', included: false }
      ]
    },
    {
      id: 'learning-outcomes',
      name: 'Learning Outcomes Assessment',
      description: 'Detailed analysis of learning objectives and skill mastery',
      category: 'outcomes',
      format: 'excel',
      sections: [
        { id: 'outcomes-overview', title: 'Outcomes Overview', type: 'summary', included: true },
        { id: 'skill-mastery', title: 'Skill Mastery Levels', type: 'chart', included: true },
        { id: 'standards-alignment', title: 'Standards Alignment', type: 'table', included: true },
        { id: 'achievement-gaps', title: 'Achievement Gaps', type: 'chart', included: false },
        { id: 'intervention-suggestions', title: 'Intervention Suggestions', type: 'text', included: true }
      ]
    },
    {
      id: 'parent-summary',
      name: 'Parent Summary Report',
      description: 'Easy-to-understand progress summary for parents',
      category: 'parent',
      format: 'pdf',
      sections: [
        { id: 'highlights', title: 'Weekly Highlights', type: 'summary', included: true },
        { id: 'progress-chart', title: 'Progress Chart', type: 'chart', included: true },
        { id: 'achievements', title: 'Achievements & Badges', type: 'summary', included: true },
        { id: 'time-spent', title: 'Learning Time', type: 'summary', included: true },
        { id: 'next-steps', title: 'How to Help at Home', type: 'text', included: true }
      ]
    },
    {
      id: 'activity-performance',
      name: 'Activity Performance Analysis',
      description: 'Detailed analysis of individual activity effectiveness',
      category: 'activity',
      format: 'excel',
      sections: [
        { id: 'activity-stats', title: 'Activity Statistics', type: 'table', included: true },
        { id: 'completion-rates', title: 'Completion Rates', type: 'chart', included: true },
        { id: 'difficulty-analysis', title: 'Difficulty Analysis', type: 'chart', included: true },
        { id: 'engagement-metrics', title: 'Engagement Metrics', type: 'table', included: true },
        { id: 'improvement-suggestions', title: 'Improvement Suggestions', type: 'text', included: false }
      ]
    }
  ]);

  // Report history
  const [reportHistory, setReportHistory] = useState([
    {
      id: '1',
      title: 'Weekly Progress Report - Class 3A',
      template: 'Student Progress Report',
      generatedAt: new Date('2024-01-20T10:30:00'),
      format: 'PDF',
      status: 'completed',
      size: '2.3 MB'
    },
    {
      id: '2',
      title: 'Learning Outcomes Assessment - Q1',
      template: 'Learning Outcomes Assessment',
      generatedAt: new Date('2024-01-18T14:15:00'),
      format: 'Excel',
      status: 'completed',
      size: '1.8 MB'
    },
    {
      id: '3',
      title: 'Parent Summary - Emma Johnson',
      template: 'Parent Summary Report',
      generatedAt: new Date('2024-01-15T09:45:00'),
      format: 'PDF',
      status: 'completed',
      size: '896 KB'
    }
  ]);

  // Available data for filters
  const [availableData, setAvailableData] = useState({
    students: [
      { id: '1', name: 'Emma Johnson' },
      { id: '2', name: 'Liam Chen' },
      { id: '3', name: 'Sophia Rodriguez' },
      { id: '4', name: 'Noah Williams' },
      { id: '5', name: 'Ava Davis' }
    ],
    subjects: ['Reading', 'Mathematics', 'Science', 'Writing', 'Social Studies'],
    activities: [
      'Letter Detective Adventure',
      'Number Safari Expedition',
      'Science Lab Explorer',
      'Creative Writing Workshop',
      'Geography Quest'
    ],
    skillAreas: [
      'Reading Comprehension',
      'Math Operations',
      'Scientific Thinking',
      'Creative Writing',
      'Problem Solving'
    ]
  });

  const updateReportRequest = (updates: Partial<ReportRequest>) => {
    setReportRequest(prev => ({ ...prev, ...updates }));
  };

  const updateFilters = (filterType: keyof ReportRequest['filters'], values: string[]) => {
    setReportRequest(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: values
      }
    }));
  };

  const updateSections = (sectionId: string, included: boolean) => {
    if (included && !reportRequest.sections.includes(sectionId)) {
      updateReportRequest({ sections: [...reportRequest.sections, sectionId] });
    } else if (!included) {
      updateReportRequest({ 
        sections: reportRequest.sections.filter(s => s !== sectionId) 
      });
    }
  };

  const selectTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    updateReportRequest({
      templateId: template.id,
      title: template.name,
      format: template.format,
      sections: template.sections.filter(s => s.included).map(s => s.id)
    });
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Add to history
      const newReport = {
        id: Date.now().toString(),
        title: reportRequest.title,
        template: selectedTemplate?.name || 'Custom Report',
        generatedAt: new Date(),
        format: reportRequest.format.toUpperCase(),
        status: 'completed',
        size: '1.5 MB'
      };
      
      setReportHistory(prev => [newReport, ...prev]);
      
      // Simulate download
      console.log('Report generated:', reportRequest);
      
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = (reportId: string) => {
    console.log('Downloading report:', reportId);
  };

  const scheduleReport = (schedule: ReportSchedule) => {
    updateReportRequest({ schedule });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-purple-600" />
            Report Generator
          </h1>
          <p className="text-gray-600 mt-1">
            Create detailed analytics reports for learning progress and outcomes
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Report
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Create Report Tab */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Template Selection */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Choose Template</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {reportTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => selectTemplate(template)}
                      >
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.format.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Report Configuration */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Configure Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Report Title</Label>
                    <Input
                      id="title"
                      value={reportRequest.title}
                      onChange={(e) => updateReportRequest({ title: e.target.value })}
                      placeholder="Enter report title"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={reportRequest.description}
                      onChange={(e) => updateReportRequest({ description: e.target.value })}
                      placeholder="Brief description of this report"
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start mt-1">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {reportRequest.dateRange.start.toLocaleDateString()}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={reportRequest.dateRange.start}
                            onSelect={(date) => date && updateReportRequest({
                              dateRange: { ...reportRequest.dateRange, start: date }
                            })}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div>
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start mt-1">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            {reportRequest.dateRange.end.toLocaleDateString()}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={reportRequest.dateRange.end}
                            onSelect={(date) => date && updateReportRequest({
                              dateRange: { ...reportRequest.dateRange, end: date }
                            })}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label>Output Format</Label>
                    <Select 
                      value={reportRequest.format} 
                      onValueChange={(value: any) => updateReportRequest({ format: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Document</SelectItem>
                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                        <SelectItem value="csv">CSV Data</SelectItem>
                        <SelectItem value="html">HTML Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filters */}
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-medium">Filters</h3>
                  
                  {userRole === 'teacher' && (
                    <div>
                      <Label>Students</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                        {availableData.students.map((student) => (
                          <div key={student.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={student.id}
                              checked={reportRequest.filters.students.includes(student.id)}
                              onCheckedChange={(checked) => {
                                const students = checked
                                  ? [...reportRequest.filters.students, student.id]
                                  : reportRequest.filters.students.filter(s => s !== student.id);
                                updateFilters('students', students);
                              }}
                            />
                            <Label htmlFor={student.id} className="text-sm">{student.name}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Subjects</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableData.subjects.map((subject) => (
                        <div key={subject} className="flex items-center space-x-2">
                          <Checkbox
                            id={subject}
                            checked={reportRequest.filters.subjects.includes(subject)}
                            onCheckedChange={(checked) => {
                              const subjects = checked
                                ? [...reportRequest.filters.subjects, subject]
                                : reportRequest.filters.subjects.filter(s => s !== subject);
                              updateFilters('subjects', subjects);
                            }}
                          />
                          <Label htmlFor={subject} className="text-sm">{subject}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sections */}
                {selectedTemplate && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="font-medium">Report Sections</h3>
                      <div className="space-y-2">
                        {selectedTemplate.sections.map((section) => (
                          <div key={section.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={section.id}
                              checked={reportRequest.sections.includes(section.id)}
                              onCheckedChange={(checked) => updateSections(section.id, !!checked)}
                            />
                            <Label htmlFor={section.id} className="flex-1">{section.title}</Label>
                            <Badge variant="outline" className="text-xs">
                              {section.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Recipients */}
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-medium">Recipients (Optional)</h3>
                  <Input
                    placeholder="Enter email addresses separated by commas"
                    value={reportRequest.recipients.join(', ')}
                    onChange={(e) => {
                      const recipients = e.target.value.split(',').map(r => r.trim()).filter(r => r);
                      updateReportRequest({ recipients });
                    }}
                  />
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={generateReport} 
                  disabled={!selectedTemplate || isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => (
              <ReportTemplateCard 
                key={template.id} 
                template={template} 
                onSelect={() => {
                  selectTemplate(template);
                  setActiveTab('create');
                }}
              />
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportHistory.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{report.title}</h4>
                      <p className="text-sm text-gray-600">{report.template}</p>
                      <p className="text-xs text-gray-500">
                        Generated: {report.generatedAt.toLocaleDateString()} at {report.generatedAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">{report.format}</Badge>
                        <p className="text-xs text-gray-500">{report.size}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(report.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Report Template Card Component
interface ReportTemplateCardProps {
  template: ReportTemplate;
  onSelect: () => void;
}

const ReportTemplateCard: React.FC<ReportTemplateCardProps> = ({ template, onSelect }) => {
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FilePdf className="w-5 h-5 text-red-600" />;
      case 'excel': return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
      case 'csv': return <Table className="w-5 h-5 text-blue-600" />;
      case 'html': return <FileText className="w-5 h-5 text-orange-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'progress': return <TrendingUp className="w-5 h-5" />;
      case 'engagement': return <Activity className="w-5 h-5" />;
      case 'outcomes': return <Target className="w-5 h-5" />;
      case 'activity': return <BookOpen className="w-5 h-5" />;
      case 'parent': return <Users className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
            {getCategoryIcon(template.category)}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{template.name}</h3>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {template.category}
            </Badge>
            <div className="flex items-center gap-1">
              {getFormatIcon(template.format)}
              <span className="text-xs text-gray-600">{template.format.toUpperCase()}</span>
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {template.sections.length} sections
          </span>
        </div>
        
        <Button className="w-full mt-4" size="sm">
          Use Template
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReportGenerator;