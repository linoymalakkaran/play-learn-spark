/**
 * OpenAI Service for Play & Learn Spark Backend
 * Handles AI-powered content generation using OpenAI's GPT models
 */

import { logger } from '../utils/logger';

export interface ContentGenerationRequest {
  topic: string;
  ageGroup: '3-4' | '4-5' | '5-6';
  language: string;
  activityType: 'counting' | 'shapes' | 'colors' | 'animals' | 'letters' | 'stories' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  customPrompt?: string;
}

export interface GeneratedContent {
  title: string;
  description: string;
  instructions: string[];
  questions: Array<{
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    imagePrompt?: string;
  }>;
  additionalResources?: string[];
  estimatedDuration: number; // in minutes
  learningObjectives: string[];
}

export interface StoryGenerationRequest {
  topic: string;
  ageGroup: string;
  language: string;
  length: 'short' | 'medium' | 'long';
  includeImages: boolean;
}

export interface GeneratedStory {
  title: string;
  content: string;
  moral: string;
  vocabulary: string[];
  imagePrompts?: string[];
  readingLevel: string;
}

class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';
  private model: string = 'gpt-4o-mini';

  private constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('OpenAI API key not configured');
    }
  }

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    if (!this.apiKey) {
      logger.warn('OpenAI API key not available, using mock content');
      return this.generateMockContent(request);
    }

    try {
      const prompt = this.buildContentPrompt(request);
      logger.info(`Generating content with OpenAI for topic: ${request.topic}, age: ${request.ageGroup}`);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert early childhood education specialist creating engaging learning content for children aged 3-6. Always respond in valid JSON format matching the specified schema exactly.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json() as any;
      const content = JSON.parse(data.choices[0].message.content);
      logger.info(`Successfully generated content: ${content.title}`);
      return this.validateAndFormatContent(content, request);

    } catch (error) {
      logger.error('OpenAI content generation failed:', error);
      return this.generateMockContent(request);
    }
  }

  async generateStory(request: StoryGenerationRequest): Promise<GeneratedStory> {
    if (!this.apiKey) {
      return this.generateMockStory(request);
    }

    try {
      const prompt = this.buildStoryPrompt(request);
      logger.info(`Generating story with OpenAI for topic: ${request.topic}`);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a creative children\'s story writer specializing in educational content for ages 3-6. Create engaging, age-appropriate stories with positive messages.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000,
        }),
      });

      const data = await response.json() as any;
      const story = JSON.parse(data.choices[0].message.content);
      logger.info(`Successfully generated story: ${story.title}`);
      return this.validateAndFormatStory(story, request);

    } catch (error) {
      logger.error('OpenAI story generation failed:', error);
      return this.generateMockStory(request);
    }
  }

  async generateImagePrompt(description: string, ageGroup: string): Promise<string> {
    if (!this.apiKey) {
      return `Child-friendly illustration of ${description}, colorful and engaging for age ${ageGroup}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: `Create a detailed image prompt for a child-friendly illustration of: ${description}. Make it suitable for children aged ${ageGroup}. The prompt should be descriptive but safe and age-appropriate.`
            }
          ],
          temperature: 0.6,
          max_tokens: 200,
        }),
      });

      const data = await response.json() as any;
      return data.choices[0].message.content.trim();

    } catch (error) {
      logger.error('Image prompt generation failed:', error);
      return `Child-friendly illustration of ${description}, colorful and engaging for age ${ageGroup}`;
    }
  }

  private buildContentPrompt(request: ContentGenerationRequest): string {
    return `Create an educational ${request.activityType} activity for children aged ${request.ageGroup} about "${request.topic}" in ${request.language}.

Requirements:
- Difficulty level: ${request.difficulty}
- Age-appropriate content for ${request.ageGroup} year olds
- Interactive and engaging activities
- Clear, simple instructions (3-5 steps)
- 3-5 questions with multiple choice answers
- Educational explanations for each answer
- Safe, positive learning environment
- Include learning objectives
- Estimate activity duration

${request.customPrompt ? `Additional requirements: ${request.customPrompt}` : ''}

Response format (JSON):
{
  "title": "Activity title",
  "description": "Brief description of the activity (1-2 sentences)",
  "instructions": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"],
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct (child-friendly explanation)",
      "imagePrompt": "Optional description for illustration"
    }
  ],
  "additionalResources": ["Resource 1", "Resource 2"],
  "estimatedDuration": 15,
  "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"]
}`;
  }

  private buildStoryPrompt(request: StoryGenerationRequest): string {
    const lengthGuide = {
      short: '100-200 words',
      medium: '300-500 words', 
      long: '500-800 words'
    };

    return `Create a ${request.length} children's story (${lengthGuide[request.length]}) about "${request.topic}" in ${request.language} for children aged ${request.ageGroup}.

Requirements:
- Age-appropriate vocabulary and concepts
- Positive moral lesson
- Engaging characters and plot
- Educational value
- Safe, nurturing themes
${request.includeImages ? '- Include descriptions for 3-5 illustrations' : ''}

Response format (JSON):
{
  "title": "Story title",
  "content": "Full story text",
  "moral": "Main lesson or moral",
  "vocabulary": ["new", "words", "to", "learn"],
  "readingLevel": "Age-appropriate reading level",
  ${request.includeImages ? '"imagePrompts": ["Scene 1 description", "Scene 2 description"],' : ''}
}`;
  }

  private validateAndFormatContent(content: any, request: ContentGenerationRequest): GeneratedContent {
    return {
      title: content.title || `Learning About ${request.topic}`,
      description: content.description || `Fun ${request.activityType} activity about ${request.topic}`,
      instructions: Array.isArray(content.instructions) ? content.instructions : [
        'Look at the activity carefully',
        'Follow the instructions',
        'Answer the questions',
        'Have fun learning!'
      ],
      questions: Array.isArray(content.questions) ? content.questions.map((q: any) => ({
        question: q.question || 'What do you think?',
        options: Array.isArray(q.options) ? q.options : ['Yes', 'No', 'Maybe'],
        correctAnswer: q.correctAnswer || q.options?.[0] || 'Yes',
        explanation: q.explanation || 'Great job learning!',
        imagePrompt: q.imagePrompt
      })) : [],
      additionalResources: Array.isArray(content.additionalResources) ? content.additionalResources : [],
      estimatedDuration: typeof content.estimatedDuration === 'number' ? content.estimatedDuration : 15,
      learningObjectives: Array.isArray(content.learningObjectives) ? content.learningObjectives : [
        `Learn about ${request.topic}`,
        'Practice thinking skills',
        'Have fun while learning'
      ]
    };
  }

  private validateAndFormatStory(story: any, request: StoryGenerationRequest): GeneratedStory {
    return {
      title: story.title || `The Adventures of ${request.topic}`,
      content: story.content || `Once upon a time, there was a wonderful story about ${request.topic}...`,
      moral: story.moral || 'Always be kind and curious.',
      vocabulary: Array.isArray(story.vocabulary) ? story.vocabulary : ['adventure', 'friendship', 'learning'],
      imagePrompts: request.includeImages && Array.isArray(story.imagePrompts) ? story.imagePrompts : undefined,
      readingLevel: story.readingLevel || `Age ${request.ageGroup}`
    };
  }

  private generateMockContent(request: ContentGenerationRequest): GeneratedContent {
    const activityTemplates = {
      counting: {
        title: `Count the ${request.topic}s!`,
        description: `Practice counting with fun ${request.topic} activities`,
        questions: [
          {
            question: 'How many do you see?',
            options: ['1', '2', '3'],
            correctAnswer: '2',
            explanation: 'Count each one carefully!'
          }
        ]
      },
      shapes: {
        title: `Shape Explorer: ${request.topic}`,
        description: `Discover different shapes in the world around us`,
        questions: [
          {
            question: 'What shape has 3 sides?',
            options: ['Circle', 'Square', 'Triangle'],
            correctAnswer: 'Triangle',
            explanation: 'A triangle always has 3 sides!'
          }
        ]
      },
      colors: {
        title: `Color Adventure: ${request.topic}`,
        description: `Learn about colors through fun exploration`,
        questions: [
          {
            question: 'What color do you get when you mix red and yellow?',
            options: ['Purple', 'Orange', 'Green'],
            correctAnswer: 'Orange',
            explanation: 'Red and yellow make beautiful orange!'
          }
        ]
      },
      animals: {
        title: `Animal Friends: ${request.topic}`,
        description: `Meet amazing animals and learn about their world`,
        questions: [
          {
            question: 'What sound does a cow make?',
            options: ['Meow', 'Moo', 'Woof'],
            correctAnswer: 'Moo',
            explanation: 'Cows say "moo" when they talk!'
          }
        ]
      },
      letters: {
        title: `Letter Learning: ${request.topic}`,
        description: `Practice letters and sounds in a fun way`,
        questions: [
          {
            question: 'What letter does "Apple" start with?',
            options: ['A', 'B', 'C'],
            correctAnswer: 'A',
            explanation: 'Apple starts with the letter A!'
          }
        ]
      },
      default: {
        title: `Discover ${request.topic}`,
        description: `Learn something new about ${request.topic}`,
        questions: [
          {
            question: `What's interesting about ${request.topic}?`,
            options: ['It\'s fun', 'It\'s helpful', 'It\'s amazing'],
            correctAnswer: 'It\'s amazing',
            explanation: 'Everything can be amazing when we learn about it!'
          }
        ]
      }
    };

    const template = activityTemplates[request.activityType as keyof typeof activityTemplates] || activityTemplates.default;

    return {
      title: template.title,
      description: template.description,
      instructions: [
        'Look at the pictures carefully',
        'Think about what you see',
        'Answer the questions by choosing the best answer',
        'Listen to the explanations',
        'Have fun learning!'
      ],
      questions: template.questions,
      additionalResources: [
        'Practice with real objects around you',
        'Draw or color what you learned',
        'Tell a family member about it',
        'Look for examples in your home'
      ],
      estimatedDuration: request.difficulty === 'easy' ? 10 : request.difficulty === 'medium' ? 15 : 20,
      learningObjectives: [
        `Learn about ${request.topic}`,
        'Practice observation skills',
        'Develop critical thinking',
        'Build confidence in learning'
      ]
    };
  }

  private generateMockStory(request: StoryGenerationRequest): GeneratedStory {
    return {
      title: `The Wonderful World of ${request.topic}`,
      content: `Once upon a time, in a magical place where learning was always fun, there lived a curious little explorer who loved discovering new things about ${request.topic}. Every day brought exciting adventures and wonderful discoveries. The little explorer learned that the world is full of amazing things waiting to be discovered. And they all lived happily ever after, always eager to learn more!`,
      moral: 'Curiosity and learning make life a wonderful adventure.',
      vocabulary: ['explorer', 'curious', 'adventure', 'discover', 'amazing', 'wonderful'],
      imagePrompts: request.includeImages ? [
        'A happy child explorer with a backpack and magnifying glass',
        'Magical learning environment with books and discoveries',
        'Child celebrating a new discovery with joy'
      ] : undefined,
      readingLevel: `Perfect for ages ${request.ageGroup}`
    };
  }

  // Health check method
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default OpenAIService;