import { Translation, ITranslation } from '../models/Translation.js';
import { ActivityContent } from '../models/ActivityContent.js';
import { LanguageResource } from '../models/LanguageResource.js';
import { AITranslationEngine } from './AITranslationEngine.js';
import { TranslationService } from './TranslationService.js';
import mongoose from 'mongoose';

// Workflow status types
type WorkflowStatus = 'requested' | 'assigned' | 'in_progress' | 'completed' | 'reviewed' | 'approved' | 'rejected' | 'published';

// Translator assignment criteria
interface TranslatorCriteria {
  languages: string[];
  specializations: string[];
  minRating: number;
  maxWorkload: number;
  certifications?: string[];
  availability?: {
    startDate: Date;
    endDate: Date;
  };
}

// Workflow event
interface WorkflowEvent {
  eventId: string;
  translationId: string;
  eventType: 'status_change' | 'assignment' | 'submission' | 'review' | 'approval' | 'rejection' | 'comment' | 'deadline_change';
  actor: {
    id: string;
    name: string;
    role: 'translator' | 'reviewer' | 'pm' | 'admin' | 'system';
  };
  timestamp: Date;
  details: any;
  metadata?: any;
}

// Translation workflow manager
export class TranslationWorkflowManager {
  private aiEngine: AITranslationEngine;
  private translationService: TranslationService;
  private eventHistory: Map<string, WorkflowEvent[]> = new Map();
  
  constructor() {
    this.aiEngine = new AITranslationEngine();
    this.translationService = new TranslationService();
  }
  
  // Assign translations automatically based on criteria
  async autoAssignTranslations(criteria: {
    languages?: string[];
    priority?: string[];
    maxAssignments?: number;
    workloadDistribution?: 'balanced' | 'performance' | 'random';
  } = {}): Promise<{
    assigned: number;
    failed: number;
    assignments: Array<{
      translationId: string;
      translatorId: string;
      language: string;
      estimatedHours: number;
    }>;
  }> {
    try {
      // Get pending translations
      const query: any = {
        'workflow.status': 'requested',
        isActive: true
      };
      
      if (criteria.languages?.length) {
        query.targetLanguage = { $in: criteria.languages };
      }
      
      if (criteria.priority?.length) {
        query['workflow.priority'] = { $in: criteria.priority };
      }
      
      const pendingTranslations = await Translation.find(query)
        .sort({ 'workflow.priority': -1, createdAt: 1 })
        .limit(criteria.maxAssignments || 50);
      
      // Get available translators
      const availableTranslators = await this.getAvailableTranslators();
      
      const assignments = [];
      const failed = [];
      
      for (const translation of pendingTranslations) {
        try {
          const bestTranslator = this.findBestTranslator(
            translation,
            availableTranslators,
            criteria.workloadDistribution || 'balanced'
          );
          
          if (bestTranslator) {
            await this.translationService.assignTranslator(
              translation.translationId,
              bestTranslator.id,
              {
                name: bestTranslator.name,
                email: bestTranslator.email,
                specializations: bestTranslator.specializations,
                certifications: bestTranslator.certifications,
                ratingAverage: bestTranslator.ratingAverage
              }
            );
            
            assignments.push({
              translationId: translation.translationId,
              translatorId: bestTranslator.id,
              language: translation.targetLanguage,
              estimatedHours: translation.workflow.estimatedHours
            });
            
            // Record event
            await this.recordWorkflowEvent({
              eventId: new mongoose.Types.ObjectId().toString(),
              translationId: translation.translationId,
              eventType: 'assignment',
              actor: {
                id: 'system',
                name: 'Auto Assignment System',
                role: 'system'
              },
              timestamp: new Date(),
              details: {
                translatorId: bestTranslator.id,
                translatorName: bestTranslator.name,
                assignmentMethod: 'auto'
              }
            });
            
          } else {
            failed.push(translation.translationId);
          }
        } catch (error) {
          console.error(`Failed to assign translation ${translation.translationId}:`, error);
          failed.push(translation.translationId);
        }
      }
      
      return {
        assigned: assignments.length,
        failed: failed.length,
        assignments
      };
      
    } catch (error) {
      console.error('Auto assignment error:', error);
      throw error;
    }
  }
  
  // Monitor workflow progress and send notifications
  async monitorWorkflows(): Promise<{
    overdue: any[];
    approaching: any[];
    stalled: any[];
    qualityIssues: any[];
    recommendations: string[];
  }> {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Find overdue translations
      const overdue = await Translation.find({
        'workflow.deadline': { $lt: now },
        'workflow.status': { $nin: ['approved', 'published', 'rejected'] },
        isActive: true
      }).populate('activityContentId', 'sourceContent.title');
      
      // Find translations approaching deadline
      const approaching = await Translation.find({
        'workflow.deadline': { $gt: now, $lt: tomorrow },
        'workflow.status': { $nin: ['approved', 'published', 'rejected'] },
        isActive: true
      }).populate('activityContentId', 'sourceContent.title');
      
      // Find stalled translations (no activity for a week)
      const stalled = await Translation.find({
        updatedAt: { $lt: weekAgo },
        'workflow.status': { $in: ['assigned', 'in_progress'] },
        isActive: true
      }).populate('activityContentId', 'sourceContent.title');
      
      // Find quality issues
      const qualityIssues = await Translation.find({
        'quality.finalScore': { $lt: 70, $gt: 0 },
        'workflow.status': { $in: ['reviewed', 'approved'] },
        isActive: true
      }).populate('activityContentId', 'sourceContent.title');
      
      // Generate recommendations
      const recommendations = [];
      
      if (overdue.length > 0) {
        recommendations.push(`${overdue.length} translations are overdue. Consider reassigning or extending deadlines.`);
      }
      
      if (stalled.length > 0) {
        recommendations.push(`${stalled.length} translations appear stalled. Follow up with translators.`);
      }
      
      if (qualityIssues.length > 0) {
        recommendations.push(`${qualityIssues.length} translations have quality scores below 70. Review and provide feedback.`);
      }
      
      const highPriorityPending = await Translation.countDocuments({
        'workflow.status': 'requested',
        'workflow.priority': 'urgent',
        isActive: true
      });
      
      if (highPriorityPending > 0) {
        recommendations.push(`${highPriorityPending} urgent translations are waiting for assignment.`);
      }
      
      return {
        overdue,
        approaching,
        stalled,
        qualityIssues,
        recommendations
      };
      
    } catch (error) {
      console.error('Workflow monitoring error:', error);
      throw error;
    }
  }
  
  // Process quality feedback and update translator ratings
  async processQualityFeedback(
    translationId: string,
    feedback: {
      qualityScore: number;
      accuracy: number;
      fluency: number;
      culturalAppropriateness: number;
      timeliness: number;
      communication: number;
      issues: Array<{
        type: string;
        severity: string;
        description: string;
      }>;
      strengths: string[];
      improvements: string[];
    },
    reviewerId: string
  ): Promise<void> {
    try {
      const translation = await Translation.findOne({ translationId, isActive: true });
      if (!translation) {
        throw new Error(`Translation not found: ${translationId}`);
      }
      
      // Update translation quality
      const assessment = {
        assessorId: reviewerId,
        assessorType: 'human' as const,
        scores: {
          accuracy: feedback.accuracy,
          fluency: feedback.fluency,
          adequacy: (feedback.accuracy + feedback.fluency) / 2,
          culturalAppropriateness: feedback.culturalAppropriateness,
          terminology: feedback.accuracy,
          overall: feedback.qualityScore
        },
        feedback: {
          strengths: feedback.strengths,
          weaknesses: feedback.issues.map(i => i.description),
          suggestions: feedback.improvements,
          criticalIssues: feedback.issues.filter(i => i.severity === 'critical').map(i => ({
            type: i.type as any,
            description: i.description,
            suggestion: '',
            severity: 'critical' as const
          }))
        },
        assessmentDate: new Date(),
        timeSpent: 30
      };
      
      translation.addQualityAssessment(assessment);
      await translation.save();
      
      // Update translator performance metrics
      await this.updateTranslatorMetrics(translation.workflow.translator.id, {
        qualityScore: feedback.qualityScore,
        timeliness: feedback.timeliness,
        communication: feedback.communication,
        completedWords: translation.sourceContent.metadata.wordCount,
        completedHours: translation.workflow.actualHours || 0
      });
      
      // Record feedback event
      await this.recordWorkflowEvent({
        eventId: new mongoose.Types.ObjectId().toString(),
        translationId,
        eventType: 'review',
        actor: {
          id: reviewerId,
          name: 'Reviewer',
          role: 'reviewer'
        },
        timestamp: new Date(),
        details: {
          qualityScore: feedback.qualityScore,
          issueCount: feedback.issues.length,
          criticalIssues: feedback.issues.filter(i => i.severity === 'critical').length
        }
      });
      
    } catch (error) {
      console.error('Error processing quality feedback:', error);
      throw error;
    }
  }
  
  // Generate workflow analytics and reports
  async generateWorkflowAnalytics(dateRange: { start: Date; end: Date }): Promise<{
    overview: {
      totalTranslations: number;
      completedTranslations: number;
      averageCompletionTime: number;
      averageQualityScore: number;
      onTimeDeliveryRate: number;
    };
    languageBreakdown: Record<string, {
      count: number;
      avgQuality: number;
      avgTime: number;
    }>;
    translatorPerformance: Array<{
      translatorId: string;
      name: string;
      completedCount: number;
      avgQuality: number;
      avgProductivity: number;
      onTimeRate: number;
    }>;
    qualityTrends: Array<{
      date: string;
      avgQuality: number;
      completionCount: number;
    }>;
    bottlenecks: Array<{
      stage: string;
      avgDuration: number;
      count: number;
    }>;
  }> {
    try {
      // Get translations in date range
      const translations = await Translation.find({
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        isActive: true
      }).populate('workflow.translator.id');
      
      // Calculate overview metrics
      const completed = translations.filter(t => 
        ['approved', 'published'].includes(t.workflow.status)
      );
      
      const totalCompletionTime = completed.reduce((sum, t) => 
        sum + (t.workflow.actualHours || 0), 0
      );
      
      const totalQuality = completed.reduce((sum, t) => 
        sum + t.quality.finalScore, 0
      );
      
      const onTimeDeliveries = completed.filter(t => 
        t.workflow.deadline && t.updatedAt <= t.workflow.deadline
      ).length;
      
      const overview = {
        totalTranslations: translations.length,
        completedTranslations: completed.length,
        averageCompletionTime: completed.length > 0 ? totalCompletionTime / completed.length : 0,
        averageQualityScore: completed.length > 0 ? totalQuality / completed.length : 0,
        onTimeDeliveryRate: completed.length > 0 ? (onTimeDeliveries / completed.length) * 100 : 0
      };
      
      // Language breakdown
      const languageBreakdown: Record<string, any> = {};
      translations.forEach(t => {
        if (!languageBreakdown[t.targetLanguage]) {
          languageBreakdown[t.targetLanguage] = {
            count: 0,
            totalQuality: 0,
            totalTime: 0,
            completedCount: 0
          };
        }
        
        languageBreakdown[t.targetLanguage].count++;
        
        if (['approved', 'published'].includes(t.workflow.status)) {
          languageBreakdown[t.targetLanguage].completedCount++;
          languageBreakdown[t.targetLanguage].totalQuality += t.quality.finalScore;
          languageBreakdown[t.targetLanguage].totalTime += (t.workflow.actualHours || 0);
        }
      });
      
      // Process language breakdown
      Object.keys(languageBreakdown).forEach(lang => {
        const data = languageBreakdown[lang];
        languageBreakdown[lang] = {
          count: data.count,
          avgQuality: data.completedCount > 0 ? data.totalQuality / data.completedCount : 0,
          avgTime: data.completedCount > 0 ? data.totalTime / data.completedCount : 0
        };
      });
      
      // Translator performance
      const translatorStats: Record<string, any> = {};
      completed.forEach(t => {
        const translatorId = t.workflow.translator.id;
        if (!translatorStats[translatorId]) {
          translatorStats[translatorId] = {
            name: t.workflow.translator.name,
            count: 0,
            totalQuality: 0,
            totalWords: 0,
            totalHours: 0,
            onTimeCount: 0
          };
        }
        
        translatorStats[translatorId].count++;
        translatorStats[translatorId].totalQuality += t.quality.finalScore;
        translatorStats[translatorId].totalWords += t.sourceContent.metadata.wordCount;
        translatorStats[translatorId].totalHours += (t.workflow.actualHours || 0);
        
        if (t.workflow.deadline && t.updatedAt <= t.workflow.deadline) {
          translatorStats[translatorId].onTimeCount++;
        }
      });
      
      const translatorPerformance = Object.keys(translatorStats).map(translatorId => {
        const stats = translatorStats[translatorId];
        return {
          translatorId,
          name: stats.name,
          completedCount: stats.count,
          avgQuality: stats.totalQuality / stats.count,
          avgProductivity: stats.totalHours > 0 ? stats.totalWords / stats.totalHours : 0,
          onTimeRate: (stats.onTimeCount / stats.count) * 100
        };
      }).sort((a, b) => b.avgQuality - a.avgQuality);
      
      // Quality trends (daily aggregation)
      const dailyStats: Record<string, { quality: number; count: number }> = {};
      completed.forEach(t => {
        const date = t.updatedAt.toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { quality: 0, count: 0 };
        }
        dailyStats[date].quality += t.quality.finalScore;
        dailyStats[date].count++;
      });
      
      const qualityTrends = Object.keys(dailyStats)
        .sort()
        .map(date => ({
          date,
          avgQuality: dailyStats[date].quality / dailyStats[date].count,
          completionCount: dailyStats[date].count
        }));
      
      // Identify bottlenecks
      const stageStats: Record<string, { duration: number; count: number }> = {};
      completed.forEach(t => {
        const events = this.eventHistory.get(t.translationId) || [];
        const statusChanges = events.filter(e => e.eventType === 'status_change');
        
        for (let i = 0; i < statusChanges.length - 1; i++) {
          const current = statusChanges[i];
          const next = statusChanges[i + 1];
          const stage = current.details.newStatus;
          const duration = (next.timestamp.getTime() - current.timestamp.getTime()) / (1000 * 60 * 60); // hours
          
          if (!stageStats[stage]) {
            stageStats[stage] = { duration: 0, count: 0 };
          }
          stageStats[stage].duration += duration;
          stageStats[stage].count++;
        }
      });
      
      const bottlenecks = Object.keys(stageStats).map(stage => ({
        stage,
        avgDuration: stageStats[stage].duration / stageStats[stage].count,
        count: stageStats[stage].count
      })).sort((a, b) => b.avgDuration - a.avgDuration);
      
      return {
        overview,
        languageBreakdown,
        translatorPerformance,
        qualityTrends,
        bottlenecks
      };
      
    } catch (error) {
      console.error('Error generating workflow analytics:', error);
      throw error;
    }
  }
  
  // Optimize workflow based on historical data
  async optimizeWorkflow(): Promise<{
    recommendations: Array<{
      type: 'resource_allocation' | 'process_improvement' | 'quality_enhancement' | 'efficiency';
      priority: 'high' | 'medium' | 'low';
      description: string;
      expectedImpact: string;
      implementation: string[];
    }>;
    metrics: {
      avgCompletionTime: number;
      qualityScore: number;
      utilizationRate: number;
      bottleneckStages: string[];
    };
  }> {
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const analytics = await this.generateWorkflowAnalytics({
        start: lastMonth,
        end: new Date()
      });
      
      const recommendations = [];
      
      // Analyze quality issues
      if (analytics.overview.averageQualityScore < 80) {
        recommendations.push({
          type: 'quality_enhancement' as const,
          priority: 'high' as const,
          description: 'Overall translation quality is below target (80%)',
          expectedImpact: 'Improve quality score by 10-15%',
          implementation: [
            'Implement additional quality checkpoints',
            'Provide targeted training for translators',
            'Review and update glossaries',
            'Enhance AI pre-translation quality'
          ]
        });
      }
      
      // Analyze completion times
      if (analytics.overview.averageCompletionTime > 48) {
        recommendations.push({
          type: 'efficiency' as const,
          priority: 'medium' as const,
          description: 'Average completion time exceeds target (48 hours)',
          expectedImpact: 'Reduce completion time by 20-30%',
          implementation: [
            'Optimize translator workload distribution',
            'Improve translation memory leveraging',
            'Streamline review processes',
            'Implement automated quality checks'
          ]
        });
      }
      
      // Analyze on-time delivery
      if (analytics.overview.onTimeDeliveryRate < 90) {
        recommendations.push({
          type: 'process_improvement' as const,
          priority: 'high' as const,
          description: 'On-time delivery rate is below target (90%)',
          expectedImpact: 'Improve delivery reliability by 15-20%',
          implementation: [
            'Implement better deadline estimation',
            'Add buffer time for complex translations',
            'Improve workload forecasting',
            'Enhance translator communication'
          ]
        });
      }
      
      // Analyze language-specific bottlenecks
      const problemLanguages = Object.entries(analytics.languageBreakdown)
        .filter(([, data]) => data.avgQuality < 75 || data.avgTime > 50)
        .map(([lang]) => lang);
      
      if (problemLanguages.length > 0) {
        recommendations.push({
          type: 'resource_allocation' as const,
          priority: 'medium' as const,
          description: `Quality or efficiency issues in languages: ${problemLanguages.join(', ')}`,
          expectedImpact: 'Improve specific language pair performance',
          implementation: [
            'Recruit specialized translators for problem languages',
            'Develop language-specific quality guidelines',
            'Create targeted training materials',
            'Enhance language-specific translation memory'
          ]
        });
      }
      
      // Analyze translator workload distribution
      const translatorWorkloads = analytics.translatorPerformance.map(t => t.completedCount);
      const maxWorkload = Math.max(...translatorWorkloads);
      const minWorkload = Math.min(...translatorWorkloads);
      
      if (maxWorkload > minWorkload * 3) {
        recommendations.push({
          type: 'resource_allocation' as const,
          priority: 'medium' as const,
          description: 'Uneven workload distribution among translators',
          expectedImpact: 'Better resource utilization and faster delivery',
          implementation: [
            'Implement workload balancing algorithms',
            'Monitor translator availability more closely',
            'Cross-train translators in multiple languages',
            'Optimize auto-assignment criteria'
          ]
        });
      }
      
      return {
        recommendations,
        metrics: {
          avgCompletionTime: analytics.overview.averageCompletionTime,
          qualityScore: analytics.overview.averageQualityScore,
          utilizationRate: analytics.overview.completedTranslations / analytics.overview.totalTranslations * 100,
          bottleneckStages: analytics.bottlenecks.slice(0, 3).map(b => b.stage)
        }
      };
      
    } catch (error) {
      console.error('Error optimizing workflow:', error);
      throw error;
    }
  }
  
  // Helper methods
  private async getAvailableTranslators(): Promise<any[]> {
    // This would typically query a translator database
    // For now, return mock data
    return [
      {
        id: 'translator_1',
        name: 'Maria Garcia',
        email: 'maria@example.com',
        languages: ['en', 'es', 'pt'],
        specializations: ['education', 'children'],
        certifications: ['ATA', 'SDL'],
        ratingAverage: 4.8,
        currentWorkload: 3,
        maxWorkload: 10,
        availability: { startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      },
      {
        id: 'translator_2',
        name: 'Ahmed Hassan',
        email: 'ahmed@example.com',
        languages: ['en', 'ar'],
        specializations: ['education', 'technical'],
        certifications: ['ITI'],
        ratingAverage: 4.6,
        currentWorkload: 7,
        maxWorkload: 12,
        availability: { startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      },
      {
        id: 'translator_3',
        name: 'Wei Chen',
        email: 'wei@example.com',
        languages: ['en', 'zh'],
        specializations: ['education', 'cultural'],
        certifications: ['NAATI'],
        ratingAverage: 4.9,
        currentWorkload: 5,
        maxWorkload: 8,
        availability: { startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      }
    ];
  }
  
  private findBestTranslator(
    translation: ITranslation,
    translators: any[],
    distributionMethod: string
  ): any | null {
    // Filter translators by language capability
    const capableTranslators = translators.filter(t => 
      t.languages.includes(translation.sourceLanguage) &&
      t.languages.includes(translation.targetLanguage) &&
      t.currentWorkload < t.maxWorkload
    );
    
    if (capableTranslators.length === 0) return null;
    
    switch (distributionMethod) {
      case 'performance':
        return capableTranslators.sort((a, b) => b.ratingAverage - a.ratingAverage)[0];
      
      case 'balanced':
        // Consider both performance and workload
        return capableTranslators.sort((a, b) => {
          const scoreA = a.ratingAverage * (1 - a.currentWorkload / a.maxWorkload);
          const scoreB = b.ratingAverage * (1 - b.currentWorkload / b.maxWorkload);
          return scoreB - scoreA;
        })[0];
      
      case 'random':
        return capableTranslators[Math.floor(Math.random() * capableTranslators.length)];
      
      default:
        return capableTranslators[0];
    }
  }
  
  private async updateTranslatorMetrics(translatorId: string, metrics: any): Promise<void> {
    // Update translator performance metrics in database
    console.log(`Updating metrics for translator ${translatorId}:`, metrics);
  }
  
  private async recordWorkflowEvent(event: WorkflowEvent): Promise<void> {
    if (!this.eventHistory.has(event.translationId)) {
      this.eventHistory.set(event.translationId, []);
    }
    
    this.eventHistory.get(event.translationId)?.push(event);
    
    // In production, this would also persist to database
    console.log('Workflow event recorded:', {
      translation: event.translationId,
      type: event.eventType,
      actor: event.actor.name
    });
  }
}