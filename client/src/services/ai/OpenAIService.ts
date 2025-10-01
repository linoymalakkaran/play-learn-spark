/**
 * OpenAI Service for Play & Learn Spark
 * Handles AI-powered content generation using OpenAI's GPT models
 */

export interface ContentGenerationRequest {
  topic: string;
  ageGroup: '3-4' | '4-5' | '5-6';
  language: string;
  activityType: 'counting' | 'shapes' | 'colors' | 'animals' | 'letters' | 'stories';
  difficulty: 'easy' | 'medium' | 'hard';
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
  }>;
  additionalResources?: string[];
}

class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';

  private constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    if (!this.apiKey && import.meta.env.MODE !== 'development') {
      console.warn('OpenAI API key not configured');
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
      return this.generateMockContent(request);
    }

    try {
      const prompt = this.buildPrompt(request);
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert early childhood education specialist creating engaging learning content for children aged 3-6. Always respond in valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      return this.validateAndFormatContent(content);
    } catch (error) {
      console.error('OpenAI content generation failed:', error);
      return this.generateMockContent(request);
    }
  }

  private buildPrompt(request: ContentGenerationRequest): string {
    return `Create an educational activity for children aged ${request.ageGroup} about ${request.topic} in ${request.language}.

Activity Type: ${request.activityType}
Difficulty: ${request.difficulty}

Requirements:
- Age-appropriate content for ${request.ageGroup} year olds
- Interactive and engaging activities
- Clear, simple instructions
- 3-5 questions with multiple choice answers
- Educational explanations for each answer
- Safe, positive learning environment

Response format (JSON):
{
  "title": "Activity title",
  "description": "Brief description of the activity",
  "instructions": ["Step 1", "Step 2", "Step 3"],
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct"
    }
  ],
  "additionalResources": ["Optional additional learning materials"]
}`;
  }

  private validateAndFormatContent(content: any): GeneratedContent {
    return {
      title: content.title || 'Learning Activity',
      description: content.description || 'Fun learning activity for children',
      instructions: Array.isArray(content.instructions) ? content.instructions : ['Follow along and have fun!'],
      questions: Array.isArray(content.questions) ? content.questions.map((q: any) => ({
        question: q.question || 'What do you think?',
        options: Array.isArray(q.options) ? q.options : ['Yes', 'No'],
        correctAnswer: q.correctAnswer || q.options?.[0] || 'Yes',
        explanation: q.explanation || 'Great job learning!'
      })) : [],
      additionalResources: Array.isArray(content.additionalResources) ? content.additionalResources : []
    };
  }

  private generateMockContent(request: ContentGenerationRequest): GeneratedContent {
    const topics = {
      counting: {
        title: `Count the ${request.topic}s`,
        description: `Learn to count with fun ${request.topic} activities`,
        questions: [
          {
            question: 'How many items do you see?',
            options: ['1', '2', '3'],
            correctAnswer: '2',
            explanation: 'Count each item carefully!'
          }
        ]
      },
      shapes: {
        title: `Shape Detective: ${request.topic}`,
        description: `Discover different shapes in everyday objects`,
        questions: [
          {
            question: 'What shape is a ball?',
            options: ['Circle', 'Square', 'Triangle'],
            correctAnswer: 'Circle',
            explanation: 'A ball is round like a circle!'
          }
        ]
      },
      default: {
        title: `Learn About ${request.topic}`,
        description: `Explore and learn about ${request.topic}`,
        questions: [
          {
            question: `What did you learn about ${request.topic}?`,
            options: ['Something new', 'Something fun', 'Something interesting'],
            correctAnswer: 'Something new',
            explanation: 'Learning new things is amazing!'
          }
        ]
      }
    };

    const template = topics[request.activityType as keyof typeof topics] || topics.default;

    return {
      title: template.title,
      description: template.description,
      instructions: [
        'Look at the activity carefully',
        'Think about what you see',
        'Answer the questions',
        'Have fun learning!'
      ],
      questions: template.questions,
      additionalResources: [
        'Practice with real objects',
        'Draw what you learned',
        'Tell someone about it'
      ]
    };
  }

  async generateStory(topic: string, ageGroup: string, language: string): Promise<{
    title: string;
    content: string;
    moral: string;
    vocabulary: string[];
  }> {
    if (!this.apiKey) {
      return {
        title: `The Adventures of ${topic}`,
        content: `Once upon a time, there was a wonderful ${topic} who loved to learn and play. Every day brought new discoveries and friends. The end.`,
        moral: 'Learning and friendship are wonderful adventures.',
        vocabulary: ['adventure', 'friendship', 'discovery', 'wonder']
      };
    }

    const prompt = `Create a short, age-appropriate story for children aged ${ageGroup} about ${topic} in ${language}. Include vocabulary words and a positive moral lesson.`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Create educational stories for young children with positive messages and age-appropriate vocabulary.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      const story = JSON.parse(data.choices[0].message.content);
      
      return {
        title: story.title || `The Adventures of ${topic}`,
        content: story.content || 'A wonderful story about learning and growing.',
        moral: story.moral || 'Always be kind and curious.',
        vocabulary: Array.isArray(story.vocabulary) ? story.vocabulary : ['kind', 'curious', 'brave', 'friendly']
      };
    } catch (error) {
      console.error('Story generation failed:', error);
      return {
        title: `The Adventures of ${topic}`,
        content: `Once upon a time, there was a wonderful ${topic} who loved to learn and play. Every day brought new discoveries and friends. The end.`,
        moral: 'Learning and friendship are wonderful adventures.',
        vocabulary: ['adventure', 'friendship', 'discovery', 'wonder']
      };
    }
  }
}

export default OpenAIService;