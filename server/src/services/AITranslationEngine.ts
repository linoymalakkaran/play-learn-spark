import { LanguageResource } from '../models/LanguageResource.js';
import { Translation } from '../models/Translation.js';
import mongoose from 'mongoose';

// Interface for translation memory entry
interface TranslationMemoryEntry {
  sourceText: string;
  targetText: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
  domain?: string;
  confidence: number;
  verified: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
}

// Interface for AI translation response
interface AITranslationResponse {
  translatedText: string;
  confidence: number;
  alternatives: Array<{
    text: string;
    confidence: number;
    explanation?: string;
  }>;
  detectedIssues: Array<{
    type: 'grammar' | 'terminology' | 'cultural' | 'context';
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestion?: string;
    position?: { start: number; end: number };
  }>;
  metadata: {
    model: string;
    processingTime: number;
    tokensUsed: number;
    language_detected?: string;
  };
}

// Translation quality metrics
interface QualityMetrics {
  accuracy: number;
  fluency: number;
  adequacy: number;
  culturalAppropriateness: number;
  terminology: number;
  overall: number;
}

// AI-powered translation engine
export class AITranslationEngine {
  private translationMemory: Map<string, TranslationMemoryEntry[]> = new Map();
  private glossaryCache: Map<string, any[]> = new Map();
  
  constructor() {
    this.initializeEngine();
  }
  
  private async initializeEngine() {
    console.log('Initializing AI Translation Engine...');
    await this.loadTranslationMemory();
    await this.loadGlossaries();
    console.log('AI Translation Engine initialized successfully');
  }
  
  // Main translation method
  async translateText(
    sourceText: string,
    sourceLanguage: string,
    targetLanguage: string,
    options: {
      domain?: string;
      context?: string;
      style?: 'formal' | 'informal' | 'technical' | 'creative';
      useAI?: boolean;
      useTranslationMemory?: boolean;
      useGlossary?: boolean;
      qualityThreshold?: number;
    } = {}
  ): Promise<{
    translation: string;
    confidence: number;
    method: 'tm_exact' | 'tm_fuzzy' | 'ai' | 'hybrid';
    suggestions: string[];
    quality: QualityMetrics;
    leverageData: {
      tmMatches: any[];
      glossaryTerms: any[];
      aiSuggestions: any[];
    };
  }> {
    try {
      const startTime = Date.now();
      
      // Step 1: Check translation memory for exact matches
      const tmResult = await this.checkTranslationMemory(
        sourceText,
        sourceLanguage,
        targetLanguage,
        options.domain
      );
      
      if (tmResult.exactMatch && options.useTranslationMemory !== false) {
        return {
          translation: tmResult.exactMatch.targetText,
          confidence: tmResult.exactMatch.confidence,
          method: 'tm_exact',
          suggestions: tmResult.fuzzyMatches.slice(0, 3).map(m => m.targetText),
          quality: await this.assessQuality(tmResult.exactMatch.targetText, targetLanguage),
          leverageData: {
            tmMatches: [tmResult.exactMatch],
            glossaryTerms: [],
            aiSuggestions: []
          }
        };
      }
      
      // Step 2: Get AI translation
      let aiTranslation: AITranslationResponse | null = null;
      if (options.useAI !== false) {
        aiTranslation = await this.performAITranslation(
          sourceText,
          sourceLanguage,
          targetLanguage,
          {
            domain: options.domain,
            context: options.context,
            style: options.style,
            tmMatches: tmResult.fuzzyMatches
          }
        );
      }
      
      // Step 3: Apply glossary terms
      let finalTranslation = aiTranslation?.translatedText || sourceText;
      const glossaryMatches: any[] = [];
      
      if (options.useGlossary !== false) {
        const glossaryResult = await this.applyGlossaryTerms(
          finalTranslation,
          sourceLanguage,
          targetLanguage,
          options.domain
        );
        finalTranslation = glossaryResult.text;
        glossaryMatches.push(...glossaryResult.appliedTerms);
      }
      
      // Step 4: Post-processing and quality checks
      finalTranslation = await this.postProcessTranslation(
        finalTranslation,
        targetLanguage,
        options.style
      );
      
      // Step 5: Quality assessment
      const quality = await this.assessQuality(finalTranslation, targetLanguage);
      
      // Step 6: Determine method and confidence
      let method: 'tm_exact' | 'tm_fuzzy' | 'ai' | 'hybrid' = 'ai';
      let confidence = aiTranslation?.confidence || 0;
      
      if (tmResult.fuzzyMatches.length > 0 && aiTranslation) {
        method = 'hybrid';
        // Weighted confidence based on TM and AI
        const tmConfidence = tmResult.fuzzyMatches[0]?.confidence || 0;
        confidence = (tmConfidence * 0.3) + (aiTranslation.confidence * 0.7);
      } else if (tmResult.fuzzyMatches.length > 0) {
        method = 'tm_fuzzy';
        confidence = tmResult.fuzzyMatches[0]?.confidence || 0;
      }
      
      // Generate suggestions
      const suggestions = this.generateSuggestions(
        tmResult.fuzzyMatches,
        aiTranslation?.alternatives || [],
        glossaryMatches
      );
      
      // Store in translation memory if quality is high enough
      if (quality.overall >= (options.qualityThreshold || 80)) {
        await this.addToTranslationMemory({
          sourceText,
          targetText: finalTranslation,
          sourceLanguage,
          targetLanguage,
          context: options.context,
          domain: options.domain,
          confidence,
          verified: false,
          usageCount: 0,
          createdBy: 'ai_engine',
          createdAt: new Date()
        });
      }
      
      const processingTime = Date.now() - startTime;
      console.log(`Translation completed in ${processingTime}ms`);
      
      return {
        translation: finalTranslation,
        confidence,
        method,
        suggestions,
        quality,
        leverageData: {
          tmMatches: tmResult.fuzzyMatches,
          glossaryTerms: glossaryMatches,
          aiSuggestions: aiTranslation?.alternatives || []
        }
      };
      
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }
  
  // Check translation memory for matches
  private async checkTranslationMemory(
    sourceText: string,
    sourceLanguage: string,
    targetLanguage: string,
    domain?: string
  ): Promise<{
    exactMatch?: TranslationMemoryEntry;
    fuzzyMatches: Array<TranslationMemoryEntry & { similarity: number }>;
  }> {
    const memoryKey = `${sourceLanguage}-${targetLanguage}`;
    const memories = this.translationMemory.get(memoryKey) || [];
    
    // Check for exact match
    const exactMatch = memories.find(
      entry => entry.sourceText.toLowerCase() === sourceText.toLowerCase() &&
               (!domain || entry.domain === domain)
    );
    
    // Find fuzzy matches
    const fuzzyMatches = memories
      .map(entry => ({
        ...entry,
        similarity: this.calculateSimilarity(sourceText, entry.sourceText)
      }))
      .filter(entry => entry.similarity > 0.7 && (!domain || entry.domain === domain))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
    
    return { exactMatch, fuzzyMatches };
  }
  
  // Perform AI translation using multiple models/services
  private async performAITranslation(
    sourceText: string,
    sourceLanguage: string,
    targetLanguage: string,
    context: {
      domain?: string;
      context?: string;
      style?: string;
      tmMatches?: any[];
    }
  ): Promise<AITranslationResponse> {
    // Simulate AI translation response (in real implementation, this would call actual AI services)
    const startTime = Date.now();
    
    // Prepare context for AI
    const prompt = this.buildTranslationPrompt(sourceText, sourceLanguage, targetLanguage, context);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // Generate simulated translation
    const translatedText = this.simulateAITranslation(sourceText, targetLanguage);
    
    // Generate alternatives
    const alternatives = this.generateAlternatives(translatedText, 3);
    
    // Detect potential issues
    const detectedIssues = await this.detectTranslationIssues(
      sourceText,
      translatedText,
      sourceLanguage,
      targetLanguage
    );
    
    const processingTime = Date.now() - startTime;
    const confidence = this.calculateAIConfidence(sourceText, translatedText, detectedIssues);
    
    return {
      translatedText,
      confidence,
      alternatives,
      detectedIssues,
      metadata: {
        model: 'hybrid-ai-v2.1',
        processingTime,
        tokensUsed: sourceText.split(' ').length * 1.2,
        language_detected: sourceLanguage
      }
    };
  }
  
  // Apply glossary terms to translation
  private async applyGlossaryTerms(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    domain?: string
  ): Promise<{ text: string; appliedTerms: any[] }> {
    const glossaryKey = `${sourceLanguage}-${targetLanguage}`;
    const glossaryTerms = this.glossaryCache.get(glossaryKey) || [];
    
    let modifiedText = text;
    const appliedTerms: any[] = [];
    
    for (const term of glossaryTerms) {
      if (domain && term.domain !== domain) continue;
      
      const sourceTerms = [term.term, ...(term.synonyms || [])];
      const targetTerm = term.translations.find(t => t.language === targetLanguage)?.term;
      
      if (!targetTerm) continue;
      
      for (const sourceTerm of sourceTerms) {
        const regex = new RegExp(`\\b${this.escapeRegex(sourceTerm)}\\b`, 'gi');
        if (regex.test(modifiedText)) {
          modifiedText = modifiedText.replace(regex, targetTerm);
          appliedTerms.push({
            source: sourceTerm,
            target: targetTerm,
            context: term.context,
            verified: term.verified || false
          });
        }
      }
    }
    
    return { text: modifiedText, appliedTerms };
  }
  
  // Post-process translation for language-specific rules
  private async postProcessTranslation(
    text: string,
    targetLanguage: string,
    style?: string
  ): Promise<string> {
    let processedText = text;
    
    // Get language-specific rules
    const languageResource = await LanguageResource.findOne({
      language: targetLanguage,
      resourceType: 'rules',
      isActive: true
    });
    
    if (languageResource) {
      const activeRules = languageResource.getActiveRules();
      
      for (const rule of activeRules) {
        try {
          const regex = new RegExp(rule.sourcePattern, 'gi');
          processedText = processedText.replace(regex, rule.targetPattern);
        } catch (error) {
          console.warn(`Error applying rule ${rule.ruleId}:`, error);
        }
      }
    }
    
    // Apply style-specific formatting
    if (style) {
      processedText = this.applyStyleFormatting(processedText, targetLanguage, style);
    }
    
    // Language-specific post-processing
    processedText = this.applyLanguageSpecificRules(processedText, targetLanguage);
    
    return processedText.trim();
  }
  
  // Assess translation quality
  private async assessQuality(text: string, language: string): Promise<QualityMetrics> {
    // Get QA rules for the language
    const languageResource = await LanguageResource.findOne({
      language,
      isActive: true
    });
    
    let scores = {
      accuracy: 85,
      fluency: 80,
      adequacy: 82,
      culturalAppropriateness: 78,
      terminology: 85,
      overall: 82
    };
    
    if (languageResource) {
      const issues = languageResource.validateContent(text);
      
      // Adjust scores based on detected issues
      issues.forEach(issue => {
        const penalty = this.getQualityPenalty(issue.severity);
        scores[issue.category as keyof QualityMetrics] = Math.max(0, scores[issue.category as keyof QualityMetrics] - penalty);
      });
    }
    
    // Calculate overall score
    scores.overall = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
    
    return scores;
  }
  
  // Batch translation for multiple texts
  async batchTranslate(
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string,
    options: any = {}
  ): Promise<Array<{
    index: number;
    sourceText: string;
    translation: string;
    confidence: number;
    method: string;
    processingTime: number;
  }>> {
    const results = [];
    
    for (let i = 0; i < texts.length; i++) {
      const startTime = Date.now();
      
      try {
        const result = await this.translateText(texts[i], sourceLanguage, targetLanguage, options);
        
        results.push({
          index: i,
          sourceText: texts[i],
          translation: result.translation,
          confidence: result.confidence,
          method: result.method,
          processingTime: Date.now() - startTime
        });
        
      } catch (error) {
        results.push({
          index: i,
          sourceText: texts[i],
          translation: texts[i], // Fallback to original
          confidence: 0,
          method: 'error',
          processingTime: Date.now() - startTime
        });
      }
    }
    
    return results;
  }
  
  // Update translation memory with human corrections
  async updateTranslationMemory(
    sourceText: string,
    originalTranslation: string,
    correctedTranslation: string,
    sourceLanguage: string,
    targetLanguage: string,
    feedback: {
      quality: number;
      issues: string[];
      domain?: string;
      context?: string;
    }
  ): Promise<void> {
    try {
      // Add corrected translation to memory
      await this.addToTranslationMemory({
        sourceText,
        targetText: correctedTranslation,
        sourceLanguage,
        targetLanguage,
        context: feedback.context,
        domain: feedback.domain,
        confidence: Math.max(95, feedback.quality), // Human corrections are high confidence
        verified: true,
        usageCount: 1,
        createdBy: 'human_correction',
        createdAt: new Date()
      });
      
      // Update AI model feedback (placeholder for ML pipeline)
      await this.recordAIFeedback({
        sourceText,
        expectedTranslation: correctedTranslation,
        actualTranslation: originalTranslation,
        quality: feedback.quality,
        issues: feedback.issues,
        sourceLanguage,
        targetLanguage
      });
      
    } catch (error) {
      console.error('Error updating translation memory:', error);
      throw error;
    }
  }
  
  // Helper methods
  private async loadTranslationMemory(): Promise<void> {
    try {
      // Load existing translation memories from database
      const translations = await Translation.find({
        'workflow.status': { $in: ['approved', 'published'] },
        isActive: true
      }).select('sourceContent.text translatedContent.text sourceLanguage targetLanguage metadata.domain');
      
      translations.forEach(translation => {
        const memoryKey = `${translation.sourceLanguage}-${translation.targetLanguage}`;
        
        if (!this.translationMemory.has(memoryKey)) {
          this.translationMemory.set(memoryKey, []);
        }
        
        this.translationMemory.get(memoryKey)?.push({
          sourceText: translation.sourceContent.text,
          targetText: translation.translatedContent.text || '',
          sourceLanguage: translation.sourceLanguage,
          targetLanguage: translation.targetLanguage,
          domain: translation.metadata.domain,
          confidence: 95, // Approved translations are high confidence
          verified: true,
          usageCount: 1,
          createdBy: 'approved_translation',
          createdAt: translation.createdAt
        });
      });
      
      console.log(`Loaded ${translations.length} translation memories`);
    } catch (error) {
      console.error('Error loading translation memory:', error);
    }
  }
  
  private async loadGlossaries(): Promise<void> {
    try {
      const languageResources = await LanguageResource.find({
        resourceType: 'glossary',
        isActive: true
      }).select('language glossary');
      
      languageResources.forEach(resource => {
        resource.glossary.forEach(term => {
          term.translations.forEach(translation => {
            const glossaryKey = `${resource.language}-${translation.language}`;
            
            if (!this.glossaryCache.has(glossaryKey)) {
              this.glossaryCache.set(glossaryKey, []);
            }
            
            this.glossaryCache.get(glossaryKey)?.push({
              term: term.term,
              translation: translation.term,
              domain: term.domain,
              context: term.context,
              verified: translation.verified,
              synonyms: term.synonyms || []
            });
          });
        });
      });
      
      console.log(`Loaded glossaries for ${this.glossaryCache.size} language pairs`);
    } catch (error) {
      console.error('Error loading glossaries:', error);
    }
  }
  
  private calculateSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance similarity
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }
  
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  private buildTranslationPrompt(
    sourceText: string,
    sourceLanguage: string,
    targetLanguage: string,
    context: any
  ): string {
    let prompt = `Translate the following ${sourceLanguage} text to ${targetLanguage}:\n\n"${sourceText}"\n\n`;
    
    if (context.domain) {
      prompt += `Domain: ${context.domain}\n`;
    }
    
    if (context.context) {
      prompt += `Context: ${context.context}\n`;
    }
    
    if (context.style) {
      prompt += `Style: ${context.style}\n`;
    }
    
    if (context.tmMatches?.length) {
      prompt += `\nSimilar translations for reference:\n`;
      context.tmMatches.slice(0, 3).forEach((match: any, i: number) => {
        prompt += `${i + 1}. "${match.sourceText}" → "${match.targetText}" (${Math.round(match.similarity * 100)}% match)\n`;
      });
    }
    
    prompt += '\nProvide a natural, accurate translation that maintains the original meaning and tone.';
    
    return prompt;
  }
  
  private simulateAITranslation(sourceText: string, targetLanguage: string): string {
    // This is a placeholder - in a real implementation, this would call actual AI services
    const transformations: Record<string, (text: string) => string> = {
      'es': (text) => `[ES] ${text}`, // Spanish
      'fr': (text) => `[FR] ${text}`, // French
      'de': (text) => `[DE] ${text}`, // German
      'it': (text) => `[IT] ${text}`, // Italian
      'pt': (text) => `[PT] ${text}`, // Portuguese
      'ar': (text) => `[AR] ${text}`, // Arabic
      'zh': (text) => `[ZH] ${text}`, // Chinese
      'ja': (text) => `[JA] ${text}`, // Japanese
      'ko': (text) => `[KO] ${text}`, // Korean
      'ru': (text) => `[RU] ${text}`, // Russian
    };
    
    return transformations[targetLanguage] 
      ? transformations[targetLanguage](sourceText)
      : `[${targetLanguage.toUpperCase()}] ${sourceText}`;
  }
  
  private generateAlternatives(translatedText: string, count: number): Array<{ text: string; confidence: number; explanation?: string }> {
    const alternatives = [];
    
    for (let i = 0; i < count; i++) {
      alternatives.push({
        text: `${translatedText} (Alt ${i + 1})`,
        confidence: 80 - (i * 5),
        explanation: `Alternative translation option ${i + 1}`
      });
    }
    
    return alternatives;
  }
  
  private async detectTranslationIssues(
    sourceText: string,
    translatedText: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<any[]> {
    const issues = [];
    
    // Length ratio check
    const lengthRatio = translatedText.length / sourceText.length;
    if (lengthRatio > 2.5 || lengthRatio < 0.4) {
      issues.push({
        type: 'context',
        severity: 'medium',
        message: 'Translation length seems unusual compared to source',
        suggestion: 'Review for potential over-translation or under-translation'
      });
    }
    
    // Placeholder text detection
    if (translatedText.includes('[') || translatedText.includes('TODO') || translatedText.includes('XXX')) {
      issues.push({
        type: 'grammar',
        severity: 'high',
        message: 'Translation contains placeholder text',
        suggestion: 'Complete the translation'
      });
    }
    
    return issues;
  }
  
  private calculateAIConfidence(sourceText: string, translatedText: string, issues: any[]): number {
    let confidence = 90; // Base confidence
    
    // Reduce confidence based on issues
    issues.forEach(issue => {
      const penalties = { low: 2, medium: 5, high: 10, critical: 20 };
      confidence -= penalties[issue.severity] || 5;
    });
    
    // Reduce confidence for very short or very long texts
    if (sourceText.length < 10 || sourceText.length > 1000) {
      confidence -= 10;
    }
    
    return Math.max(0, Math.min(100, confidence));
  }
  
  private generateSuggestions(tmMatches: any[], aiAlternatives: any[], glossaryMatches: any[]): string[] {
    const suggestions = [];
    
    // Add TM fuzzy matches
    tmMatches.slice(0, 2).forEach(match => {
      suggestions.push(match.targetText);
    });
    
    // Add AI alternatives
    aiAlternatives.slice(0, 2).forEach(alt => {
      suggestions.push(alt.text);
    });
    
    return [...new Set(suggestions)]; // Remove duplicates
  }
  
  private async addToTranslationMemory(entry: TranslationMemoryEntry): Promise<void> {
    const memoryKey = `${entry.sourceLanguage}-${entry.targetLanguage}`;
    
    if (!this.translationMemory.has(memoryKey)) {
      this.translationMemory.set(memoryKey, []);
    }
    
    this.translationMemory.get(memoryKey)?.push(entry);
    
    // Limit memory size to prevent excessive growth
    const memories = this.translationMemory.get(memoryKey);
    if (memories && memories.length > 10000) {
      memories.splice(0, memories.length - 10000);
    }
  }
  
  private async recordAIFeedback(feedback: any): Promise<void> {
    // Placeholder for ML model feedback recording
    console.log('Recording AI feedback for model improvement:', {
      sourceLanguage: feedback.sourceLanguage,
      targetLanguage: feedback.targetLanguage,
      quality: feedback.quality,
      issueCount: feedback.issues.length
    });
  }
  
  private applyStyleFormatting(text: string, language: string, style: string): string {
    // Apply style-specific formatting rules
    switch (style) {
      case 'formal':
        // More formal language structures
        return text.replace(/\bcan't\b/gi, 'cannot')
                  .replace(/\bwon't\b/gi, 'will not')
                  .replace(/\bdon't\b/gi, 'do not');
      
      case 'informal':
        // More casual language
        return text.replace(/\bcannot\b/gi, "can't")
                  .replace(/\bwill not\b/gi, "won't")
                  .replace(/\bdo not\b/gi, "don't");
      
      case 'technical':
        // Preserve technical terminology
        return text;
      
      default:
        return text;
    }
  }
  
  private applyLanguageSpecificRules(text: string, language: string): string {
    switch (language) {
      case 'ar':
        // Arabic-specific rules (RTL handling, etc.)
        return text.trim();
      
      case 'zh':
        // Chinese-specific rules
        return text.replace(/\s+/g, ''); // Remove spaces between Chinese characters
      
      case 'de':
        // German-specific rules (compound words, capitalization)
        return text;
      
      default:
        return text;
    }
  }
  
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  private getQualityPenalty(severity: string): number {
    const penalties = {
      'info': 1,
      'warning': 3,
      'error': 7,
      'critical': 15
    };
    return penalties[severity] || 5;
  }
}