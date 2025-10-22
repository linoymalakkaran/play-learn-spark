import { ActivityContent, IActivityContent } from '../models/ActivityContent.js';
import { Translation, ITranslation } from '../models/Translation.js';
import { LanguageResource, ILanguageResource } from '../models/LanguageResource.js';
import mongoose from 'mongoose';

// Translation service for managing multilingual content
export class TranslationService {
  
  // Create new translation request
  async createTranslationRequest(
    activityContentId: string,
    targetLanguages: string[],
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    deadline?: Date,
    requestedBy?: string
  ): Promise<ITranslation[]> {
    try {
      const activityContent = await ActivityContent.findOne({ activityId: activityContentId });
      if (!activityContent) {
        throw new Error(`Activity content not found: ${activityContentId}`);
      }
      
      const translations: ITranslation[] = [];
      
      for (const targetLanguage of targetLanguages) {
        // Check if translation already exists
        const existingTranslation = await Translation.findOne({
          activityContentId,
          targetLanguage,
          isActive: true
        });
        
        if (existingTranslation) {
          console.warn(`Translation already exists for ${activityContentId} -> ${targetLanguage}`);
          continue;
        }
        
        // Create translation document
        const translationId = `${activityContentId}_${activityContent.baseLanguage}_${targetLanguage}_${Date.now()}`;
        
        const translation = new Translation({
          translationId,
          activityContentId,
          sourceLanguage: activityContent.baseLanguage,
          targetLanguage,
          
          sourceContent: {
            text: activityContent.sourceContent.content.text || '',
            html: activityContent.sourceContent.content.html,
            markdown: activityContent.sourceContent.content.markdown,
            metadata: {
              wordCount: this.countWords(activityContent.sourceContent.content.text || ''),
              characterCount: (activityContent.sourceContent.content.text || '').length,
              complexity: this.assessComplexity(activityContent.sourceContent.content.text || ''),
              domain: activityContent.category,
              context: activityContent.type
            }
          },
          
          workflow: {
            status: 'requested',
            priority,
            deadline: deadline || this.calculateDeadline(priority),
            estimatedHours: this.estimateTranslationTime(activityContent.sourceContent.content.text || '', targetLanguage),
            translator: {
              id: 'unassigned',
              name: 'Unassigned',
              email: '',
              specializations: [],
              certifications: [],
              ratingAverage: 0,
              assignedDate: new Date()
            }
          },
          
          quality: {
            assessments: [],
            finalScore: 0,
            passesQA: false,
            requiresRevision: false,
            revisionNotes: []
          },
          
          leverageData: {
            tmMatches: [],
            glossaryTerms: [],
            repetitions: [],
            fuzzyMatches: []
          },
          
          versions: [],
          
          communication: {
            comments: [],
            queries: [],
            changeRequests: []
          },
          
          billing: {
            rateType: 'per_word',
            rate: this.getStandardRate(targetLanguage),
            currency: 'USD',
            wordCount: this.countWords(activityContent.sourceContent.content.text || ''),
            hourCount: 0,
            totalCost: 0,
            paymentStatus: 'pending'
          },
          
          analytics: {
            productivity: {
              wordsPerHour: 0,
              timeSpentTranslating: 0,
              timeSpentReviewing: 0,
              revisionsCount: 0,
              tmLeveragePercentage: 0,
              repetitionLeveragePercentage: 0
            },
            quality: {
              errorRate: 0,
              revisionRate: 0,
              approvalTime: 0
            },
            engagement: {
              responseTime: 0,
              collaborationScore: 0,
              deadlineAdherence: false,
              proactiveImprovements: 0
            }
          },
          
          metadata: {
            domain: activityContent.category,
            audience: `Age ${activityContent.ageRange.min}-${activityContent.ageRange.max}`,
            style: 'educational',
            tone: 'friendly',
            registerLevel: 'medium',
            culturalAdaptation: true,
            localizationRequired: true,
            confidentiality: 'internal'
          },
          
          createdBy: requestedBy || 'system',
          isActive: true,
          archived: false,
          tags: activityContent.tags
        });
        
        await translation.save();
        translations.push(translation);
        
        // Update activity content workflow
        activityContent.translationWorkflow.requestedLanguages.push(targetLanguage);
        if (activityContent.translationWorkflow.status === 'source_only') {
          activityContent.translationWorkflow.status = 'translation_requested';
        }
      }
      
      await activityContent.save();
      return translations;
      
    } catch (error) {
      console.error('Error creating translation request:', error);
      throw error;
    }
  }
  
  // Assign translator to translation
  async assignTranslator(
    translationId: string,
    translatorId: string,
    translatorInfo: {
      name: string;
      email: string;
      specializations?: string[];
      certifications?: string[];
      ratingAverage?: number;
    }
  ): Promise<ITranslation> {
    try {
      const translation = await Translation.findOne({ translationId, isActive: true });
      if (!translation) {
        throw new Error(`Translation not found: ${translationId}`);
      }
      
      translation.workflow.translator = {
        id: translatorId,
        name: translatorInfo.name,
        email: translatorInfo.email,
        specializations: translatorInfo.specializations || [],
        certifications: translatorInfo.certifications || [],
        ratingAverage: translatorInfo.ratingAverage || 0,
        assignedDate: new Date()
      };
      
      translation.workflow.status = 'assigned';
      
      await translation.save();
      
      // Update activity content workflow
      const activityContent = await ActivityContent.findOne({ activityId: translation.activityContentId });
      if (activityContent) {
        const translatorAssignment = activityContent.translationWorkflow.assignedTranslators.find(
          t => t.language === translation.targetLanguage
        );
        
        if (translatorAssignment) {
          translatorAssignment.translatorId = translatorId;
          translatorAssignment.status = 'assigned';
        } else {
          activityContent.translationWorkflow.assignedTranslators.push({
            language: translation.targetLanguage,
            translatorId,
            assignedDate: new Date(),
            status: 'assigned'
          });
        }
        
        await activityContent.save();
      }
      
      return translation;
      
    } catch (error) {
      console.error('Error assigning translator:', error);
      throw error;
    }
  }
  
  // Submit translation
  async submitTranslation(
    translationId: string,
    translatedContent: {
      text: string;
      html?: string;
      markdown?: string;
    },
    translatorNotes?: string
  ): Promise<ITranslation> {
    try {
      const translation = await Translation.findOne({ translationId, isActive: true });
      if (!translation) {
        throw new Error(`Translation not found: ${translationId}`);
      }
      
      const translationTime = this.calculateTranslationTime(translation.workflow.translator.assignedDate);
      
      translation.translatedContent = {
        text: translatedContent.text,
        html: translatedContent.html,
        markdown: translatedContent.markdown,
        metadata: {
          wordCount: this.countWords(translatedContent.text),
          characterCount: translatedContent.text.length,
          translationTime,
          method: 'human',
          tools: []
        }
      };
      
      translation.workflow.status = 'completed';
      translation.workflow.actualHours = translationTime / 60; // Convert minutes to hours
      
      // Add version
      translation.updateVersion(
        translatedContent.text,
        ['Initial translation submission'],
        translation.workflow.translator.id,
        translatorNotes
      );
      
      // Add comment if notes provided
      if (translatorNotes) {
        translation.addComment(
          translation.workflow.translator.id,
          translation.workflow.translator.name,
          'translator',
          translatorNotes
        );
      }
      
      await translation.save();
      
      // Update activity content workflow
      const activityContent = await ActivityContent.findOne({ activityId: translation.activityContentId });
      if (activityContent) {
        const translatorAssignment = activityContent.translationWorkflow.assignedTranslators.find(
          t => t.language === translation.targetLanguage
        );
        
        if (translatorAssignment) {
          translatorAssignment.status = 'submitted';
        }
        
        await activityContent.save();
      }
      
      return translation;
      
    } catch (error) {
      console.error('Error submitting translation:', error);
      throw error;
    }
  }
  
  // Review and approve/reject translation
  async reviewTranslation(
    translationId: string,
    reviewerId: string,
    reviewerInfo: { name: string; email: string },
    decision: 'approved' | 'rejected',
    feedback?: string,
    qualityScore?: number
  ): Promise<ITranslation> {
    try {
      const translation = await Translation.findOne({ translationId, isActive: true });
      if (!translation) {
        throw new Error(`Translation not found: ${translationId}`);
      }
      
      translation.workflow.reviewer = {
        id: reviewerId,
        name: reviewerInfo.name,
        email: reviewerInfo.email,
        assignedDate: translation.workflow.reviewer?.assignedDate || new Date(),
        reviewDate: new Date(),
        approved: decision === 'approved'
      };
      
      translation.workflow.status = decision === 'approved' ? 'approved' : 'rejected';
      
      if (feedback) {
        translation.addComment(reviewerId, reviewerInfo.name, 'reviewer', feedback);
      }
      
      // Add quality assessment if score provided
      if (qualityScore !== undefined) {
        const assessment = {
          assessorId: reviewerId,
          assessorType: 'human' as const,
          scores: {
            accuracy: qualityScore,
            fluency: qualityScore,
            adequacy: qualityScore,
            culturalAppropriateness: qualityScore,
            terminology: qualityScore,
            overall: qualityScore
          },
          feedback: {
            strengths: [],
            weaknesses: [],
            suggestions: feedback ? [feedback] : [],
            criticalIssues: []
          },
          assessmentDate: new Date(),
          timeSpent: 30 // Default 30 minutes for review
        };
        
        translation.addQualityAssessment(assessment);
      }
      
      if (decision === 'approved') {
        // Update activity content with approved translation
        const activityContent = await ActivityContent.findOne({ activityId: translation.activityContentId });
        if (activityContent) {
          const localizedContent = {
            language: translation.targetLanguage,
            title: translation.translatedContent.text?.substring(0, 100) || 'Translated Content',
            content: {
              text: translation.translatedContent.text,
              html: translation.translatedContent.html,
              markdown: translation.translatedContent.markdown
            },
            media: { images: [], audio: [], video: [] },
            metadata: {
              translatedBy: translation.workflow.translator.name,
              reviewedBy: reviewerInfo.name,
              translationDate: new Date(),
              reviewDate: new Date(),
              translationMethod: 'human',
              qualityScore,
              culturalAdaptation: true,
              sourceVersion: activityContent.publication.version
            },
            status: 'approved',
            version: '1.0.0'
          };
          
          activityContent.addLocalization(translation.targetLanguage, localizedContent);
          await activityContent.save();
        }
      }
      
      await translation.save();
      return translation;
      
    } catch (error) {
      console.error('Error reviewing translation:', error);
      throw error;
    }
  }
  
  // Get translation progress for an activity
  async getTranslationProgress(activityContentId: string) {
    try {
      const translations = await Translation.find({ 
        activityContentId, 
        isActive: true 
      }).select('targetLanguage workflow.status quality.finalScore');
      
      const progress = {
        total: translations.length,
        requested: 0,
        assigned: 0,
        inProgress: 0,
        completed: 0,
        reviewed: 0,
        approved: 0,
        rejected: 0,
        published: 0,
        averageQuality: 0,
        languages: [] as any[]
      };
      
      let qualitySum = 0;
      let qualityCount = 0;
      
      translations.forEach(translation => {
        progress[translation.workflow.status]++;
        
        if (translation.quality.finalScore > 0) {
          qualitySum += translation.quality.finalScore;
          qualityCount++;
        }
        
        progress.languages.push({
          language: translation.targetLanguage,
          status: translation.workflow.status,
          quality: translation.quality.finalScore
        });
      });
      
      progress.averageQuality = qualityCount > 0 ? qualitySum / qualityCount : 0;
      
      return progress;
      
    } catch (error) {
      console.error('Error getting translation progress:', error);
      throw error;
    }
  }
  
  // Search translations by various criteria
  async searchTranslations(criteria: {
    status?: string[];
    sourceLanguage?: string;
    targetLanguage?: string;
    translatorId?: string;
    priority?: string;
    overdue?: boolean;
    dateRange?: { start: Date; end: Date };
    qualityThreshold?: number;
    page?: number;
    limit?: number;
  }) {
    try {
      const query: any = { isActive: true };
      
      if (criteria.status?.length) {
        query['workflow.status'] = { $in: criteria.status };
      }
      
      if (criteria.sourceLanguage) {
        query.sourceLanguage = criteria.sourceLanguage;
      }
      
      if (criteria.targetLanguage) {
        query.targetLanguage = criteria.targetLanguage;
      }
      
      if (criteria.translatorId) {
        query['workflow.translator.id'] = criteria.translatorId;
      }
      
      if (criteria.priority) {
        query['workflow.priority'] = criteria.priority;
      }
      
      if (criteria.overdue) {
        query['workflow.deadline'] = { $lt: new Date() };
        query['workflow.status'] = { $nin: ['approved', 'published', 'rejected'] };
      }
      
      if (criteria.dateRange) {
        query.createdAt = {
          $gte: criteria.dateRange.start,
          $lte: criteria.dateRange.end
        };
      }
      
      if (criteria.qualityThreshold) {
        query['quality.finalScore'] = { $gte: criteria.qualityThreshold };
      }
      
      const page = criteria.page || 1;
      const limit = criteria.limit || 20;
      const skip = (page - 1) * limit;
      
      const [translations, total] = await Promise.all([
        Translation.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('activityContentId', 'sourceContent.title category type'),
        Translation.countDocuments(query)
      ]);
      
      return {
        translations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
      
    } catch (error) {
      console.error('Error searching translations:', error);
      throw error;
    }
  }
  
  // Get translator performance metrics
  async getTranslatorMetrics(translatorId: string, dateRange?: { start: Date; end: Date }) {
    try {
      const query: any = {
        'workflow.translator.id': translatorId,
        isActive: true
      };
      
      if (dateRange) {
        query.createdAt = {
          $gte: dateRange.start,
          $lte: dateRange.end
        };
      }
      
      const translations = await Translation.find(query);
      
      const metrics = {
        totalTranslations: translations.length,
        completedTranslations: 0,
        averageQuality: 0,
        averageProductivity: 0,
        onTimeDeliveries: 0,
        averageRevisions: 0,
        languageBreakdown: {} as Record<string, number>,
        qualityTrend: [] as Array<{ date: string; score: number }>,
        productivityTrend: [] as Array<{ date: string; wph: number }>
      };
      
      let qualitySum = 0;
      let productivitySum = 0;
      let qualityCount = 0;
      let productivityCount = 0;
      let revisionsSum = 0;
      
      translations.forEach(translation => {
        // Count completed translations
        if (['completed', 'reviewed', 'approved', 'published'].includes(translation.workflow.status)) {
          metrics.completedTranslations++;
        }
        
        // Quality metrics
        if (translation.quality.finalScore > 0) {
          qualitySum += translation.quality.finalScore;
          qualityCount++;
          
          metrics.qualityTrend.push({
            date: translation.updatedAt.toISOString().split('T')[0],
            score: translation.quality.finalScore
          });
        }
        
        // Productivity metrics
        if (translation.analytics.productivity.wordsPerHour > 0) {
          productivitySum += translation.analytics.productivity.wordsPerHour;
          productivityCount++;
          
          metrics.productivityTrend.push({
            date: translation.updatedAt.toISOString().split('T')[0],
            wph: translation.analytics.productivity.wordsPerHour
          });
        }
        
        // On-time delivery
        if (translation.workflow.deadline && translation.updatedAt <= translation.workflow.deadline) {
          metrics.onTimeDeliveries++;
        }
        
        // Revisions
        revisionsSum += translation.analytics.productivity.revisionsCount;
        
        // Language breakdown
        if (!metrics.languageBreakdown[translation.targetLanguage]) {
          metrics.languageBreakdown[translation.targetLanguage] = 0;
        }
        metrics.languageBreakdown[translation.targetLanguage]++;
      });
      
      metrics.averageQuality = qualityCount > 0 ? qualitySum / qualityCount : 0;
      metrics.averageProductivity = productivityCount > 0 ? productivitySum / productivityCount : 0;
      metrics.averageRevisions = translations.length > 0 ? revisionsSum / translations.length : 0;
      
      return metrics;
      
    } catch (error) {
      console.error('Error getting translator metrics:', error);
      throw error;
    }
  }
  
  // Helper methods
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
  
  private assessComplexity(text: string): 'simple' | 'medium' | 'complex' {
    const wordCount = this.countWords(text);
    const avgWordLength = text.replace(/\s+/g, '').length / wordCount;
    const sentenceCount = text.split(/[.!?]+/).length;
    const avgSentenceLength = wordCount / sentenceCount;
    
    if (avgWordLength < 5 && avgSentenceLength < 15) return 'simple';
    if (avgWordLength > 7 || avgSentenceLength > 25) return 'complex';
    return 'medium';
  }
  
  private estimateTranslationTime(text: string, targetLanguage: string): number {
    const wordCount = this.countWords(text);
    const baseRate = 300; // words per hour base rate
    
    // Language-specific multipliers
    const languageMultipliers: Record<string, number> = {
      'ar': 0.6, // Arabic - more complex
      'zh': 0.7, // Chinese - character-based
      'ja': 0.7, // Japanese - complex writing system
      'ko': 0.8, // Korean - complex grammar
      'de': 0.8, // German - compound words
      'fi': 0.7, // Finnish - complex grammar
      'hu': 0.7, // Hungarian - complex grammar
      'es': 1.0, // Spanish - standard
      'fr': 1.0, // French - standard
      'it': 1.0, // Italian - standard
      'pt': 1.0, // Portuguese - standard
      'nl': 0.9, // Dutch - moderate complexity
      'sv': 0.9, // Swedish - moderate complexity
      'no': 0.9, // Norwegian - moderate complexity
      'da': 0.9, // Danish - moderate complexity
    };
    
    const multiplier = languageMultipliers[targetLanguage] || 0.9;
    const adjustedRate = baseRate * multiplier;
    
    return Math.ceil((wordCount / adjustedRate) * 60); // Return in minutes
  }
  
  private calculateDeadline(priority: string): Date {
    const now = new Date();
    const deadlineHours = {
      'urgent': 24,
      'high': 72,
      'medium': 168, // 1 week
      'low': 336 // 2 weeks
    };
    
    return new Date(now.getTime() + deadlineHours[priority] * 60 * 60 * 1000);
  }
  
  private getStandardRate(language: string): number {
    // Standard rates per word in USD
    const rates: Record<string, number> = {
      'ar': 0.15, // Arabic
      'zh': 0.12, // Chinese
      'ja': 0.14, // Japanese
      'ko': 0.13, // Korean
      'de': 0.10, // German
      'fr': 0.09, // French
      'es': 0.08, // Spanish
      'it': 0.09, // Italian
      'pt': 0.08, // Portuguese
      'nl': 0.10, // Dutch
      'ru': 0.11, // Russian
      'pl': 0.09, // Polish
      'cs': 0.09, // Czech
      'hu': 0.10, // Hungarian
      'fi': 0.11, // Finnish
      'sv': 0.10, // Swedish
      'no': 0.10, // Norwegian
      'da': 0.10, // Danish
    };
    
    return rates[language] || 0.08; // Default rate
  }
  
  private calculateTranslationTime(startDate: Date): number {
    return Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60)); // Minutes
  }
}