/**
 * HuggingFace Service for Play & Learn Spark Backend
 * Handles AI-powered content generation using HuggingFace models
 */

import { logger } from '../utils/logger';
import type { ContentGenerationRequest, GeneratedContent } from './OpenAIService';

export interface HuggingFaceConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  ageGroup: string;
  style?: 'cartoon' | 'realistic' | 'watercolor' | 'sketch';
  size?: 'small' | 'medium' | 'large';
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  metadata: {
    model: string;
    timestamp: string;
    ageGroup: string;
    style: string;
  };
}

class HuggingFaceService {
  private static instance: HuggingFaceService;
  private apiKey: string;
  private baseUrl: string = 'https://api-inference.huggingface.co';
  
  // Models for different tasks
  private models = {
    textGeneration: 'microsoft/DialoGPT-large',
    imageGeneration: 'stabilityai/stable-diffusion-2-1',
    classification: 'cardiffnlp/twitter-roberta-base-emotion',
    translation: 'Helsinki-NLP/opus-mt-en-es'
  };

  private constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('HuggingFace API key not configured');
    }
  }

  static getInstance(): HuggingFaceService {
    if (!HuggingFaceService.instance) {
      HuggingFaceService.instance = new HuggingFaceService();
    }
    return HuggingFaceService.instance;
  }

  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    if (!this.apiKey) {
      logger.warn('HuggingFace API key not available, using fallback content');
      return this.generateFallbackContent(request);
    }

    try {
      logger.info(`Generating content with HuggingFace for topic: ${request.topic}`);
      
      // Use text generation model for creating educational content
      const prompt = this.buildEducationalPrompt(request);
      const response = await this.callHuggingFaceAPI(this.models.textGeneration, {
        inputs: prompt,
        parameters: {
          max_length: 1000,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9
        }
      });

      const generatedText = response[0]?.generated_text || '';
      return this.parseEducationalContent(generatedText, request);

    } catch (error) {
      logger.error('HuggingFace content generation failed:', error);
      return this.generateFallbackContent(request);
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<GeneratedImage | null> {
    if (!this.apiKey) {
      logger.warn('HuggingFace API key not available for image generation');
      return null;
    }

    try {
      logger.info(`Generating image with HuggingFace: ${request.prompt}`);
      
      const enhancedPrompt = this.enhanceImagePrompt(request);
      const response = await this.callHuggingFaceAPI(this.models.imageGeneration, {
        inputs: enhancedPrompt,
        parameters: {
          guidance_scale: 7.5,
          num_inference_steps: 50,
          width: this.getSizePixels(request.size),
          height: this.getSizePixels(request.size)
        }
      }, true); // Binary response for images

      if (response instanceof ArrayBuffer) {
        // Convert to base64 for easy handling
        const base64 = Buffer.from(response).toString('base64');
        const imageUrl = `data:image/png;base64,${base64}`;
        
        return {
          url: imageUrl,
          prompt: enhancedPrompt,
          metadata: {
            model: this.models.imageGeneration,
            timestamp: new Date().toISOString(),
            ageGroup: request.ageGroup,
            style: request.style || 'cartoon'
          }
        };
      }

      return null;

    } catch (error) {
      logger.error('HuggingFace image generation failed:', error);
      return null;
    }
  }

  async classifyEmotion(text: string): Promise<{
    emotion: string;
    confidence: number;
    allScores: Array<{label: string; score: number}>;
  }> {
    if (!this.apiKey) {
      return {
        emotion: 'joy',
        confidence: 0.8,
        allScores: [
          { label: 'joy', score: 0.8 },
          { label: 'optimism', score: 0.2 }
        ]
      };
    }

    try {
      const response = await this.callHuggingFaceAPI(this.models.classification, {
        inputs: text
      });

      const scores = Array.isArray(response) ? response : response.scores || [];
      const topEmotion = scores[0] || { label: 'joy', score: 0.8 };

      return {
        emotion: topEmotion.label,
        confidence: topEmotion.score,
        allScores: scores
      };

    } catch (error) {
      logger.error('Emotion classification failed:', error);
      return {
        emotion: 'joy',
        confidence: 0.5,
        allScores: [{ label: 'joy', score: 0.5 }]
      };
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    if (!this.apiKey) {
      return text; // Return original text if no API key
    }

    try {
      // For demo purposes, using EN->ES model
      // In production, you'd have multiple translation models
      const response = await this.callHuggingFaceAPI(this.models.translation, {
        inputs: text
      });

      return response[0]?.translation_text || text;

    } catch (error) {
      logger.error('Translation failed:', error);
      return text;
    }
  }

  async generateEducationalQuestions(topic: string, ageGroup: string, count: number = 3): Promise<Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }>> {
    if (!this.apiKey) {
      return this.getFallbackQuestions(topic, ageGroup, count);
    }

    try {
      const prompt = `Generate ${count} educational questions about ${topic} for children aged ${ageGroup}. Include multiple choice options and explanations.`;
      
      const response = await this.callHuggingFaceAPI(this.models.textGeneration, {
        inputs: prompt,
        parameters: {
          max_length: 800,
          temperature: 0.6
        }
      });

      // Parse the response and extract questions
      // This is a simplified implementation
      return this.parseQuestionsFromText(response[0]?.generated_text || '', topic, ageGroup, count);

    } catch (error) {
      logger.error('Question generation failed:', error);
      return this.getFallbackQuestions(topic, ageGroup, count);
    }
  }

  private async callHuggingFaceAPI(model: string, data: any, binary: boolean = false): Promise<any> {
    const response = await fetch(`${this.baseUrl}/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.status} - ${response.statusText}`);
    }

    if (binary) {
      return await response.arrayBuffer();
    }

    return await response.json();
  }

  private buildEducationalPrompt(request: ContentGenerationRequest): string {
    return `Create an educational ${request.activityType} activity for children aged ${request.ageGroup} about ${request.topic}. 
Difficulty: ${request.difficulty}
Language: ${request.language}

Include:
- A fun title
- Clear instructions (3-4 steps)
- Educational questions with answers
- Learning objectives

Make it engaging and age-appropriate.`;
  }

  private enhanceImagePrompt(request: ImageGenerationRequest): string {
    const styleModifiers = {
      cartoon: 'cute cartoon style, colorful, child-friendly',
      realistic: 'photorealistic but child-appropriate',
      watercolor: 'watercolor painting style, soft colors',
      sketch: 'pencil sketch style, gentle lines'
    };

    const ageModifiers = {
      '3-4': 'very simple, large elements, bright colors',
      '4-5': 'simple but detailed, engaging colors',
      '5-6': 'detailed and educational, vibrant colors'
    };

    const basePrompt = request.prompt;
    const styleText = styleModifiers[request.style || 'cartoon'];
    const ageText = ageModifiers[request.ageGroup as keyof typeof ageModifiers] || 'child-friendly';

    return `${basePrompt}, ${styleText}, ${ageText}, safe for children, educational, high quality`;
  }

  private getSizePixels(size?: string): number {
    switch (size) {
      case 'small': return 256;
      case 'large': return 768;
      default: return 512; // medium
    }
  }

  private parseEducationalContent(text: string, request: ContentGenerationRequest): GeneratedContent {
    // This is a simplified parser - in production you'd use more sophisticated NLP
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
      title: `Learning About ${request.topic}`,
      description: `Educational ${request.activityType} activity about ${request.topic}`,
      instructions: [
        'Read the activity carefully',
        'Look at any pictures or examples',
        'Answer the questions',
        'Think about what you learned'
      ],
      questions: [
        {
          question: `What is interesting about ${request.topic}?`,
          options: ['It\'s colorful', 'It\'s helpful', 'It\'s fun'],
          correctAnswer: 'It\'s helpful',
          explanation: 'Learning about new things helps us understand the world!'
        }
      ],
      additionalResources: [
        'Practice with real examples',
        'Draw what you learned',
        'Share with family'
      ],
      estimatedDuration: 15,
      learningObjectives: [
        `Understand ${request.topic}`,
        'Practice observation skills',
        'Build vocabulary'
      ]
    };
  }

  private parseQuestionsFromText(text: string, topic: string, ageGroup: string, count: number): Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }> {
    // Simplified question parsing - in production use more sophisticated NLP
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      questions.push({
        question: `Question ${i + 1} about ${topic}?`,
        options: ['Option A', 'Option B', 'Option C'],
        correctAnswer: 'Option A',
        explanation: 'This helps us learn more about the topic!'
      });
    }

    return questions;
  }

  private getFallbackQuestions(topic: string, ageGroup: string, count: number): Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }> {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
      questions.push({
        question: `What do you know about ${topic}?`,
        options: ['It\'s interesting', 'It\'s fun', 'It\'s educational'],
        correctAnswer: 'It\'s educational',
        explanation: 'Learning about new topics helps us grow!'
      });
    }

    return questions;
  }

  private generateFallbackContent(request: ContentGenerationRequest): GeneratedContent {
    return {
      title: `Discover ${request.topic}`,
      description: `Learn about ${request.topic} in a fun way`,
      instructions: [
        'Look around you',
        'Think about the topic',
        'Answer the questions',
        'Share what you learned'
      ],
      questions: [
        {
          question: `What makes ${request.topic} special?`,
          options: ['It\'s unique', 'It\'s important', 'It\'s everywhere'],
          correctAnswer: 'It\'s important',
          explanation: 'Every topic we learn about is important in its own way!'
        }
      ],
      additionalResources: [
        'Look for examples in your environment',
        'Ask questions about what you see',
        'Practice with family members'
      ],
      estimatedDuration: 12,
      learningObjectives: [
        `Learn basic concepts about ${request.topic}`,
        'Practice asking questions',
        'Develop curiosity'
      ]
    };
  }

  // Health check method
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      const response = await fetch(`${this.baseUrl}/models/${this.models.textGeneration}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get available models
  getAvailableModels(): typeof this.models {
    return { ...this.models };
  }
}

export default HuggingFaceService;