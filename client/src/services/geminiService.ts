/**
 * Google Gemini AI Service
 * Handles integration with Google's Gemini AI for homework analysis and activity generation
 */

import { InteractiveActivity, ACTIVITY_TEMPLATES } from '@/types/ActivityTemplates';
import { activityCacheService } from './ActivityCacheService';

export interface GeminiAnalysisRequest {
  text?: string;
  imageData?: string; // Base64 encoded image
  fileType?: 'text' | 'image' | 'pdf';
  prompt?: string;
  generateActivities?: boolean; // New flag to generate interactive activities
}

export interface GeminiAnalysisResponse {
  summary: string;
  keyPoints: string[];
  suggestions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  ageRecommendation: string;
  educationalValue: number;
  activities?: Activity[];
  interactiveActivities?: InteractiveActivity[]; // New field for interactive activities
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'exercise' | 'practice' | 'game';
  questions?: Question[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in minutes
}

export interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'fill_blank';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

class GeminiService {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('VITE_GEMINI_API_KEY not found in environment variables');
    }
  }

  /**
   * Analyze homework content using Gemini AI (via server endpoint) and generate interactive activities
   */
  async analyzeHomework(request: GeminiAnalysisRequest): Promise<GeminiAnalysisResponse> {
    try {
      const contentKey = request.text || request.imageData || '';
      
      // Check cache first for interactive activities
      if (request.generateActivities && activityCacheService.isCached(contentKey)) {
        const cachedActivities = activityCacheService.getCachedActivities(contentKey);
        if (cachedActivities) {
          console.log('🚀 Using cached interactive activities');
          
          // Still get basic analysis but use cached activities
          const basicAnalysis = await this.getBasicAnalysis(request);
          return {
            ...basicAnalysis,
            interactiveActivities: cachedActivities
          };
        }
      }

      // Use server endpoint for AI analysis
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';
      
      const response = await fetch(`${apiBaseUrl}/ai/analyze-homework`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: request.text,
          imageData: request.imageData,
          fileType: request.fileType || 'text',
          provider: 'google',
          generateActivities: request.generateActivities || false
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('AI homework analysis service is currently unavailable. Please try again later.');
        } else if (response.status === 403) {
          throw new Error('AI service access denied. Please check your permissions.');
        } else {
          throw new Error(`AI service error (${response.status}). Please try again later.`);
        }
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze homework');
      }

      const analysisResult = data.data;

      // Generate interactive activities if requested
      if (request.generateActivities && request.text) {
        const interactiveActivities = this.generateInteractiveActivities(request.text, analysisResult);
        analysisResult.interactiveActivities = interactiveActivities;
        
        // Cache the generated activities
        activityCacheService.cacheActivities(contentKey, interactiveActivities);
      }

      return analysisResult;
    } catch (error) {
      console.error('Error analyzing homework:', error);
      
      // Check if it's a network error and the user is not authenticated
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to AI service. Please check your internet connection and try again.');
      }
      
      // Re-throw specific errors
      if (error instanceof Error && (
        error.message.includes('log in') || 
        error.message.includes('access denied') ||
        error.message.includes('unavailable')
      )) {
        throw error;
      }
      
      // For other errors, provide a fallback analysis
      return this.getFallbackAnalysis(request);
    }
  }

  /**
   * Generate interactive activities based on homework content
   */
  private generateInteractiveActivities(content: string, analysis: GeminiAnalysisResponse): InteractiveActivity[] {
    const activities: InteractiveActivity[] = [];
    const contentLower = content.toLowerCase();
    
    // Determine which templates to use based on content analysis
    const applicableTemplates = ACTIVITY_TEMPLATES.filter(template => {
      switch (template.category) {
        case 'letter_recognition':
          return /[a-z]/i.test(content) || contentLower.includes('letter') || contentLower.includes('alphabet');
        case 'number_practice':
          return /\d/.test(content) || contentLower.includes('number') || contentLower.includes('count');
        case 'shapes':
          return contentLower.includes('shape') || contentLower.includes('circle') || 
                 contentLower.includes('square') || contentLower.includes('triangle');
        case 'vocabulary':
          return contentLower.includes('word') || contentLower.includes('reading') || 
                 analysis.ageRecommendation.includes('elementary');
        default:
          return false;
      }
    });

    // Generate activities from applicable templates
    applicableTemplates.forEach(template => {
      try {
        const activity = template.generateActivity(content);
        activities.push(activity);
      } catch (error) {
        console.warn(`Failed to generate activity from template ${template.id}:`, error);
      }
    });

    // If no templates matched, generate a basic vocabulary activity
    if (activities.length === 0) {
      const basicTemplate = ACTIVITY_TEMPLATES.find(t => t.id === 'vocabulary_builder');
      if (basicTemplate) {
        activities.push(basicTemplate.generateActivity(content));
      }
    }

    return activities.slice(0, 3); // Limit to 3 activities maximum
  }

  /**
   * Get basic analysis without interactive activities (for caching scenarios)
   */
  private async getBasicAnalysis(request: GeminiAnalysisRequest): Promise<GeminiAnalysisResponse> {
    const tempRequest = { ...request, generateActivities: false };
    return this.analyzeHomework(tempRequest);
  }

  /**
   * Analyze image content using Gemini Vision
   */
  async analyzeImage(imageData: string, mimeType: string): Promise<GeminiAnalysisResponse> {
    try {
      const prompt = this.buildImageAnalysisPrompt();
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageData
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0]?.content?.parts[0]?.text;
      
      if (!generatedText) {
        throw new Error('No response from Gemini AI');
      }

      return this.parseGeminiResponse(generatedText);
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  /**
   * Build analysis prompt for text content
   */
  private buildAnalysisPrompt(request: GeminiAnalysisRequest): string {
    return `
As an AI educational assistant, analyze the following homework content and provide a comprehensive analysis.

Content to analyze:
${request.text || request.prompt || ''}

Please provide your response in the following JSON format:
{
  "summary": "Brief summary of the homework content",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "suggestions": ["Improvement suggestion 1", "Suggestion 2", "Suggestion 3"],
  "difficulty": "easy|medium|hard",
  "ageRecommendation": "Age range (e.g., '7-9 years')",
  "educationalValue": 85,
  "activities": [
    {
      "id": "activity1",
      "title": "Practice Activity Title",
      "description": "Description of the activity",
      "type": "quiz|exercise|practice|game",
      "difficulty": "easy|medium|hard",
      "estimatedTime": 15,
      "questions": [
        {
          "id": "q1",
          "question": "Sample question based on the homework",
          "type": "multiple_choice|true_false|short_answer|fill_blank",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A",
          "explanation": "Explanation of why this is correct"
        }
      ]
    }
  ]
}

Focus on:
1. Educational content analysis
2. Age-appropriate suggestions
3. Creating 2-3 interactive activities based on the homework
4. Providing constructive feedback for improvement
5. Generating practice questions that reinforce learning

Make sure the response is valid JSON and educational activities are engaging for children.
    `;
  }

  /**
   * Build analysis prompt for image content
   */
  private buildImageAnalysisPrompt(): string {
    return `
As an AI educational assistant, analyze this homework image and provide a comprehensive analysis.

Please examine the image carefully and identify:
- Subject matter (math, science, language, etc.)
- Grade level indicators
- Types of problems or exercises
- Student work quality
- Areas for improvement

Provide your response in the following JSON format:
{
  "summary": "Brief summary of what you see in the homework",
  "keyPoints": ["Key observation 1", "Key observation 2", "Key observation 3"],
  "suggestions": ["Improvement suggestion 1", "Suggestion 2", "Suggestion 3"],
  "difficulty": "easy|medium|hard",
  "ageRecommendation": "Age range (e.g., '7-9 years')",
  "educationalValue": 85,
  "activities": [
    {
      "id": "activity1",
      "title": "Practice Activity Title",
      "description": "Description of the activity based on the homework content",
      "type": "quiz|exercise|practice|game",
      "difficulty": "easy|medium|hard",
      "estimatedTime": 15,
      "questions": [
        {
          "id": "q1",
          "question": "Sample question based on the homework content",
          "type": "multiple_choice|true_false|short_answer|fill_blank",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A",
          "explanation": "Explanation of why this is correct"
        }
      ]
    }
  ]
}

Make sure to create relevant practice activities based on what you see in the image.
    `;
  }

  /**
   * Parse Gemini response and extract structured data
   */
  private parseGeminiResponse(responseText: string): GeminiAnalysisResponse {
    try {
      // Clean the response text - remove markdown formatting if present
      let cleanText = responseText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }

      const parsed = JSON.parse(cleanText);
      
      // Validate and provide defaults
      return {
        summary: parsed.summary || 'Analysis completed',
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : ['Content analyzed'],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : ['Keep practicing'],
        difficulty: ['easy', 'medium', 'hard'].includes(parsed.difficulty) ? parsed.difficulty : 'medium',
        ageRecommendation: parsed.ageRecommendation || '6-12 years',
        educationalValue: typeof parsed.educationalValue === 'number' ? parsed.educationalValue : 75,
        activities: Array.isArray(parsed.activities) ? parsed.activities : []
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      
      // Fallback analysis based on the raw text
      return {
        summary: 'AI analysis completed successfully',
        keyPoints: [
          'Content has been analyzed',
          'Educational value identified',
          'Recommendations generated'
        ],
        suggestions: [
          'Continue practicing regularly',
          'Ask questions when uncertain',
          'Review concepts thoroughly'
        ],
        difficulty: 'medium',
        ageRecommendation: '6-12 years',
        educationalValue: 75,
        activities: []
      };
    }
  }

  /**
   * Provide fallback analysis when API is unavailable
   */
  private getFallbackAnalysis(request: GeminiAnalysisRequest): GeminiAnalysisResponse {
    return {
      summary: 'Content analysis is temporarily unavailable. The AI service is currently not accessible, but you can still review your content manually.',
      keyPoints: [
        'AI analysis service is temporarily unavailable',
        'Please check your internet connection',
        'Try again later or contact support if the issue persists'
      ],
      suggestions: [
        'Review content manually for now',
        'Save your work and try again later',
        'Contact administrator if issues continue'
      ],
      difficulty: 'medium',
      ageRecommendation: 'All ages',
      educationalValue: 50,
      activities: []
    };
  }

  /**
   * Convert file to base64 for image analysis
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove data URL prefix to get just the base64 data
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const geminiService = new GeminiService();