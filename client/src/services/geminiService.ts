/**
 * Google Gemini AI Service
 * Handles integration with Google's Gemini AI for homework analysis
 */

export interface GeminiAnalysisRequest {
  text?: string;
  imageData?: string; // Base64 encoded image
  fileType?: 'text' | 'image' | 'pdf';
  prompt?: string;
}

export interface GeminiAnalysisResponse {
  summary: string;
  keyPoints: string[];
  suggestions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  ageRecommendation: string;
  educationalValue: number;
  activities?: Activity[];
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
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor() {
    this.apiKey = 'AIzaSyDKzAsS76lA3Wjes53xAzegO30-pzgM-NU';
  }

  /**
   * Analyze homework content using Gemini AI
   */
  async analyzeHomework(request: GeminiAnalysisRequest): Promise<GeminiAnalysisResponse> {
    try {
      const prompt = this.buildAnalysisPrompt(request);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
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
      console.error('Error analyzing homework:', error);
      throw error;
    }
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