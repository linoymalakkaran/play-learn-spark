/**
 * Google AI Studio Service for Play & Learn Spark Backend
 * Handles AI-powered content generation using Google's Gemini models
 */

import { logger } from '../utils/logger';
import { ContentGenerationRequest, GeneratedContent, StoryGenerationRequest, GeneratedStory } from './OpenAIService';

class GoogleAIService {
  private apiKey: string | null;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY || null;
    if (!this.apiKey) {
      logger.warn('Google AI API key not found. Google AI functionality will be disabled.');
    } else {
      logger.info('Google AI Studio service initialized successfully');
    }
  }

  /**
   * Check if Google AI service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Generate educational content using Google AI
   */
  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    if (!this.apiKey) {
      logger.warn('Google AI API key not available, returning mock content');
      return this.generateMockContent(request);
    }

    try {
      const prompt = this.buildContentPrompt(request);
      
      const response = await fetch(`${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
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
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`Google AI API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json() as any;
      const content = JSON.parse(data.candidates[0].content.parts[0].text);
      logger.info(`Successfully generated content using Google AI: ${content.title}`);
      return this.validateAndFormatContent(content, request);

    } catch (error) {
      logger.error('Google AI content generation failed:', error);
      return this.generateMockContent(request);
    }
  }

  /**
   * Generate story using Google AI
   */
  async generateStory(request: StoryGenerationRequest): Promise<GeneratedStory> {
    if (!this.apiKey) {
      return this.generateMockStory(request);
    }

    try {
      const prompt = this.buildStoryPrompt(request);
      
      const response = await fetch(`${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
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
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      });

      const data = await response.json() as any;
      const story = JSON.parse(data.candidates[0].content.parts[0].text);
      logger.info(`Successfully generated story using Google AI: ${story.title}`);
      return this.validateAndFormatStory(story, request);

    } catch (error) {
      logger.error('Google AI story generation failed:', error);
      return this.generateMockStory(request);
    }
  }

  /**
   * Generate image prompt using Google AI
   */
  async generateImagePrompt(description: string, ageGroup: string): Promise<string> {
    if (!this.apiKey) {
      return `Child-friendly illustration of ${description}, colorful and engaging for age ${ageGroup}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create a detailed image prompt for a child-friendly illustration of: ${description}. Make it suitable for children aged ${ageGroup}. The prompt should be descriptive but safe and age-appropriate.`
            }]
          }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 200,
          }
        }),
      });

      const data = await response.json() as any;
      return data.candidates[0].content.parts[0].text.trim();

    } catch (error) {
      logger.error('Google AI image prompt generation failed:', error);
      return `Child-friendly illustration of ${description}, colorful and engaging for age ${ageGroup}`;
    }
  }

  private buildContentPrompt(request: ContentGenerationRequest): string {
    return `Generate educational content for children aged ${request.ageGroup} about ${request.topic}.
    
Activity Type: ${request.activityType}
Difficulty: ${request.difficulty}
Language: ${request.language}
${request.customPrompt ? `Additional requirements: ${request.customPrompt}` : ''}

Please return a JSON object with the following structure:
{
  "title": "Engaging title for the activity",
  "description": "Brief description of what children will learn",
  "instructions": ["Step 1", "Step 2", "Step 3"],
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Correct option",
      "explanation": "Why this is correct",
      "imagePrompt": "Description for illustration"
    }
  ],
  "additionalResources": ["Resource 1", "Resource 2"],
  "estimatedDuration": 15,
  "learningObjectives": ["Objective 1", "Objective 2"]
}

Make it age-appropriate, engaging, and educational. Include 3-5 questions.`;
  }

  private buildStoryPrompt(request: StoryGenerationRequest): string {
    const lengthGuide = {
      'short': '200-300 words',
      'medium': '400-600 words',
      'long': '700-1000 words'
    };

    return `Create a children's story for age group ${request.ageGroup} about ${request.topic}.
    
Length: ${lengthGuide[request.length]}
Language: ${request.language}
Include images: ${request.includeImages}

Please return a JSON object with this structure:
{
  "title": "Story title",
  "content": "Full story text with paragraphs",
  "moral": "Lesson or moral of the story",
  "vocabulary": ["new", "words", "to", "learn"],
  "imagePrompts": ${request.includeImages ? '["scene 1 description", "scene 2 description"]' : 'null'},
  "readingLevel": "age-appropriate reading level"
}

Make it engaging, educational, and age-appropriate with positive values.`;
  }

  private validateAndFormatContent(content: any, request: ContentGenerationRequest): GeneratedContent {
    // Validate and ensure all required fields are present
    const validated: GeneratedContent = {
      title: content.title || `${request.activityType} Activity: ${request.topic}`,
      description: content.description || `Learn about ${request.topic} through fun activities`,
      instructions: Array.isArray(content.instructions) ? content.instructions : ['Follow the prompts', 'Answer the questions', 'Have fun learning!'],
      questions: Array.isArray(content.questions) ? content.questions : [],
      additionalResources: content.additionalResources || [],
      estimatedDuration: content.estimatedDuration || 15,
      learningObjectives: Array.isArray(content.learningObjectives) ? content.learningObjectives : [`Learn about ${request.topic}`]
    };

    // Ensure we have at least one question
    if (validated.questions.length === 0) {
      validated.questions.push({
        question: `What did you learn about ${request.topic}?`,
        correctAnswer: 'It was fun and educational!',
        explanation: 'Learning is always rewarding!'
      });
    }

    return validated;
  }

  private validateAndFormatStory(story: any, request: StoryGenerationRequest): GeneratedStory {
    return {
      title: story.title || `A Story About ${request.topic}`,
      content: story.content || 'Once upon a time...',
      moral: story.moral || 'Always be kind and curious',
      vocabulary: Array.isArray(story.vocabulary) ? story.vocabulary : [],
      imagePrompts: request.includeImages ? (story.imagePrompts || []) : undefined,
      readingLevel: story.readingLevel || request.ageGroup
    };
  }

  private generateMockContent(request: ContentGenerationRequest): GeneratedContent {
    return {
      title: `Fun ${request.activityType} Activity: ${request.topic}`,
      description: `An engaging ${request.difficulty} level activity about ${request.topic} for children aged ${request.ageGroup}`,
      instructions: [
        'Look at the activity carefully',
        'Think about what you see',
        'Answer the questions',
        'Have fun learning!'
      ],
      questions: [
        {
          question: `What can you tell me about ${request.topic}?`,
          options: ['It\'s interesting', 'It\'s fun to learn about', 'I want to know more', 'All of the above'],
          correctAnswer: 'All of the above',
          explanation: 'Learning is always exciting!',
          imagePrompt: `Colorful illustration showing ${request.topic} in a child-friendly way`
        }
      ],
      additionalResources: [
        'Books about the topic',
        'Educational videos',
        'Hands-on activities'
      ],
      estimatedDuration: 15,
      learningObjectives: [
        `Understand basic concepts about ${request.topic}`,
        'Develop curiosity and interest in learning',
        'Practice observation and thinking skills'
      ]
    };
  }

  private generateMockStory(request: StoryGenerationRequest): GeneratedStory {
    return {
      title: `The Amazing Adventure of ${request.topic}`,
      content: `Once upon a time, there was a wonderful story about ${request.topic}. It was full of adventure, learning, and fun. The characters discovered amazing things and learned valuable lessons along the way. The end.`,
      moral: 'Always be curious and kind',
      vocabulary: ['adventure', 'discovery', 'learning', 'friendship'],
      imagePrompts: request.includeImages ? ['Opening scene', 'Main adventure', 'Happy ending'] : undefined,
      readingLevel: request.ageGroup
    };
  }
}

export const googleAIService = new GoogleAIService();
export default GoogleAIService;