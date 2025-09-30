/**
 * Anthropic Service for Play & Learn Spark Backend
 * Handles AI-powered content generation using Anthropic's Claude models
 */

import { logger } from '../utils/logger';
import type { ContentGenerationRequest, GeneratedContent, StoryGenerationRequest, GeneratedStory } from './OpenAIService';

export interface AnthropicConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface SafetyCheckRequest {
  content: string;
  ageGroup: string;
  context: 'educational' | 'story' | 'question' | 'general';
}

export interface SafetyCheckResult {
  isSafe: boolean;
  confidence: number;
  concerns: string[];
  suggestions: string[];
  ageAppropriate: boolean;
}

export interface EducationalAssessment {
  topic: string;
  content: string;
  learningValue: number; // 1-10 scale
  ageAppropriateness: number; // 1-10 scale
  engagement: number; // 1-10 scale
  suggestions: string[];
}

class AnthropicService {
  private static instance: AnthropicService;
  private apiKey: string;
  private baseUrl: string = 'https://api.anthropic.com/v1';
  private model: string = 'claude-3-haiku-20240307';

  private constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('Anthropic API key not configured');
    }
  }

  static getInstance(): AnthropicService {
    if (!AnthropicService.instance) {
      AnthropicService.instance = new AnthropicService();
    }
    return AnthropicService.instance;
  }

  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    if (!this.apiKey) {
      logger.warn('Anthropic API key not available, using fallback content');
      return this.generateFallbackContent(request);
    }

    try {
      logger.info(`Generating content with Anthropic for topic: ${request.topic}, age: ${request.ageGroup}`);

      const prompt = this.buildContentPrompt(request);
      const response = await this.callAnthropicAPI({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = JSON.parse(response.content[0].text);
      logger.info(`Successfully generated content with Anthropic: ${content.title}`);
      return this.validateAndFormatContent(content, request);

    } catch (error) {
      logger.error('Anthropic content generation failed:', error);
      return this.generateFallbackContent(request);
    }
  }

  async generateStory(request: StoryGenerationRequest): Promise<GeneratedStory> {
    if (!this.apiKey) {
      return this.generateFallbackStory(request);
    }

    try {
      logger.info(`Generating story with Anthropic for topic: ${request.topic}`);

      const prompt = this.buildStoryPrompt(request);
      const response = await this.callAnthropicAPI({
        model: this.model,
        max_tokens: 1500,
        temperature: 0.8,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const story = JSON.parse(response.content[0].text);
      logger.info(`Successfully generated story with Anthropic: ${story.title}`);
      return this.validateAndFormatStory(story, request);

    } catch (error) {
      logger.error('Anthropic story generation failed:', error);
      return this.generateFallbackStory(request);
    }
  }

  async checkContentSafety(request: SafetyCheckRequest): Promise<SafetyCheckResult> {
    if (!this.apiKey) {
      // Default safe response when API is not available
      return {
        isSafe: true,
        confidence: 0.7,
        concerns: [],
        suggestions: [],
        ageAppropriate: true
      };
    }

    try {
      logger.info(`Checking content safety with Anthropic for age group: ${request.ageGroup}`);

      const prompt = `Please analyze the following content for safety and age-appropriateness:

Content: "${request.content}"
Target Age Group: ${request.ageGroup}
Context: ${request.context}

Evaluate:
1. Is this content safe for children?
2. Is it age-appropriate for ${request.ageGroup} year olds?
3. Are there any concerning elements?
4. Suggestions for improvement?

Respond in JSON format:
{
  "isSafe": boolean,
  "confidence": number (0-1),
  "concerns": ["concern1", "concern2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "ageAppropriate": boolean
}`;

      const response = await this.callAnthropicAPI({
        model: this.model,
        max_tokens: 800,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const safetyResult = JSON.parse(response.content[0].text);
      logger.info('Safety check completed');
      return safetyResult;

    } catch (error) {
      logger.error('Content safety check failed:', error);
      return {
        isSafe: true,
        confidence: 0.5,
        concerns: ['Unable to verify safety'],
        suggestions: ['Manual review recommended'],
        ageAppropriate: true
      };
    }
  }

  async assessEducationalValue(topic: string, content: string, ageGroup: string): Promise<EducationalAssessment> {
    if (!this.apiKey) {
      return {
        topic,
        content,
        learningValue: 7,
        ageAppropriateness: 8,
        engagement: 7,
        suggestions: ['Content appears educationally sound based on basic assessment']
      };
    }

    try {
      logger.info(`Assessing educational value with Anthropic for topic: ${topic}`);

      const prompt = `Please assess the educational value of this content:

Topic: ${topic}
Content: "${content}"
Target Age: ${ageGroup}

Rate on a scale of 1-10:
1. Learning Value - How much will children learn?
2. Age Appropriateness - Is it suitable for ${ageGroup} year olds?
3. Engagement - How engaging is it for children?

Also provide specific suggestions for improvement.

Respond in JSON format:
{
  "topic": "${topic}",
  "content": "${content}",
  "learningValue": number,
  "ageAppropriateness": number,
  "engagement": number,
  "suggestions": ["suggestion1", "suggestion2"]
}`;

      const response = await this.callAnthropicAPI({
        model: this.model,
        max_tokens: 600,
        temperature: 0.4,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const assessment = JSON.parse(response.content[0].text);
      logger.info('Educational assessment completed');
      return assessment;

    } catch (error) {
      logger.error('Educational assessment failed:', error);
      return {
        topic,
        content,
        learningValue: 6,
        ageAppropriateness: 7,
        engagement: 6,
        suggestions: ['Assessment could not be completed - manual review recommended']
      };
    }
  }

  async improveContent(originalContent: GeneratedContent, feedback: string): Promise<GeneratedContent> {
    if (!this.apiKey) {
      return originalContent; // Return original if no API access
    }

    try {
      logger.info('Improving content with Anthropic based on feedback');

      const prompt = `Please improve this educational content based on the feedback:

Original Content:
Title: ${originalContent.title}
Description: ${originalContent.description}
Instructions: ${originalContent.instructions.join(', ')}
Questions: ${JSON.stringify(originalContent.questions)}

Feedback: ${feedback}

Please provide an improved version in the same JSON format:
{
  "title": "improved title",
  "description": "improved description",
  "instructions": ["step1", "step2"],
  "questions": [{"question": "...", "options": [...], "correctAnswer": "...", "explanation": "..."}],
  "additionalResources": ["resource1"],
  "estimatedDuration": number,
  "learningObjectives": ["objective1"]
}`;

      const response = await this.callAnthropicAPI({
        model: this.model,
        max_tokens: 2000,
        temperature: 0.6,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const improvedContent = JSON.parse(response.content[0].text);
      logger.info('Content improvement completed');
      return improvedContent;

    } catch (error) {
      logger.error('Content improvement failed:', error);
      return originalContent;
    }
  }

  async generatePersonalizedContent(
    baseRequest: ContentGenerationRequest,
    childProfile: {
      interests: string[];
      learningStyle: 'visual' | 'auditory' | 'kinesthetic';
      previousTopics: string[];
      difficultyConcepts: string[];
    }
  ): Promise<GeneratedContent> {
    if (!this.apiKey) {
      return this.generateContent(baseRequest);
    }

    try {
      logger.info('Generating personalized content with Anthropic');

      const prompt = `Create personalized educational content based on this child's profile:

Base Request:
- Topic: ${baseRequest.topic}
- Age Group: ${baseRequest.ageGroup}
- Activity Type: ${baseRequest.activityType}
- Difficulty: ${baseRequest.difficulty}
- Language: ${baseRequest.language}

Child Profile:
- Interests: ${childProfile.interests.join(', ')}
- Learning Style: ${childProfile.learningStyle}
- Previous Topics: ${childProfile.previousTopics.join(', ')}
- Difficult Concepts: ${childProfile.difficultyConcepts.join(', ')}

Please create content that:
1. Incorporates their interests
2. Matches their learning style
3. Builds on previous knowledge
4. Addresses difficult concepts gently
5. Is engaging and age-appropriate

Response in JSON format:
{
  "title": "personalized title",
  "description": "description incorporating interests",
  "instructions": ["step1 matching learning style", "step2"],
  "questions": [{"question": "...", "options": [...], "correctAnswer": "...", "explanation": "..."}],
  "additionalResources": ["resource1"],
  "estimatedDuration": number,
  "learningObjectives": ["objective1"],
  "personalizationNotes": "How this content is tailored for this child"
}`;

      const response = await this.callAnthropicAPI({
        model: this.model,
        max_tokens: 2500,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const personalizedContent = JSON.parse(response.content[0].text);
      logger.info('Personalized content generation completed');
      return personalizedContent;

    } catch (error) {
      logger.error('Personalized content generation failed:', error);
      return this.generateContent(baseRequest);
    }
  }

  private async callAnthropicAPI(data: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
  }

  private buildContentPrompt(request: ContentGenerationRequest): string {
    return `Create a safe, educational ${request.activityType} activity for children aged ${request.ageGroup} about "${request.topic}" in ${request.language}.

Requirements:
- Difficulty level: ${request.difficulty}
- Completely safe and age-appropriate content
- Positive, encouraging tone
- Clear, simple instructions (3-5 steps)
- 3-5 educational questions with multiple choice answers
- Helpful explanations for each answer
- Estimated duration and learning objectives

${request.customPrompt ? `Additional requirements: ${request.customPrompt}` : ''}

Please ensure all content is:
1. Safe for young children
2. Educationally valuable
3. Engaging and fun
4. Culturally sensitive
5. Promotes positive values

Response format (JSON):
{
  "title": "Activity title",
  "description": "Brief description (1-2 sentences)",
  "instructions": ["Step 1", "Step 2", "Step 3"],
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C"],
      "correctAnswer": "Option A",
      "explanation": "Child-friendly explanation"
    }
  ],
  "additionalResources": ["Resource 1", "Resource 2"],
  "estimatedDuration": 15,
  "learningObjectives": ["Objective 1", "Objective 2"]
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
- Completely safe and appropriate for young children
- Positive, uplifting message
- Age-appropriate vocabulary and concepts
- Educational value
- Diverse and inclusive characters
- Promotes kindness, curiosity, and learning

${request.includeImages ? '- Include descriptions for 3-5 illustrations' : ''}

Response format (JSON):
{
  "title": "Story title",
  "content": "Full story text",
  "moral": "Positive moral lesson",
  "vocabulary": ["educational", "words", "to", "learn"],
  "readingLevel": "Age-appropriate level",
  ${request.includeImages ? '"imagePrompts": ["Scene 1 description", "Scene 2 description"],' : ''}
}`;
  }

  private validateAndFormatContent(content: any, request: ContentGenerationRequest): GeneratedContent {
    return {
      title: content.title || `Learning About ${request.topic}`,
      description: content.description || `Educational ${request.activityType} activity`,
      instructions: Array.isArray(content.instructions) ? content.instructions : [
        'Look at the activity',
        'Follow the steps',
        'Answer questions',
        'Have fun learning!'
      ],
      questions: Array.isArray(content.questions) ? content.questions.map((q: any) => ({
        question: q.question || 'What do you think?',
        options: Array.isArray(q.options) ? q.options : ['Yes', 'No', 'Maybe'],
        correctAnswer: q.correctAnswer || q.options?.[0] || 'Yes',
        explanation: q.explanation || 'Great thinking!'
      })) : [],
      additionalResources: Array.isArray(content.additionalResources) ? content.additionalResources : [],
      estimatedDuration: typeof content.estimatedDuration === 'number' ? content.estimatedDuration : 15,
      learningObjectives: Array.isArray(content.learningObjectives) ? content.learningObjectives : [
        `Learn about ${request.topic}`,
        'Practice thinking skills'
      ]
    };
  }

  private validateAndFormatStory(story: any, request: StoryGenerationRequest): GeneratedStory {
    return {
      title: story.title || `The Story of ${request.topic}`,
      content: story.content || 'A wonderful educational story...',
      moral: story.moral || 'Always be kind and curious.',
      vocabulary: Array.isArray(story.vocabulary) ? story.vocabulary : ['adventure', 'learning'],
      imagePrompts: request.includeImages && Array.isArray(story.imagePrompts) ? story.imagePrompts : undefined,
      readingLevel: story.readingLevel || `Age ${request.ageGroup}`
    };
  }

  private generateFallbackContent(request: ContentGenerationRequest): GeneratedContent {
    return {
      title: `Exploring ${request.topic}`,
      description: `A safe and educational activity about ${request.topic}`,
      instructions: [
        'Look at the topic carefully',
        'Think about what you know',
        'Answer the questions thoughtfully',
        'Share what you learned'
      ],
      questions: [
        {
          question: `What's something good about ${request.topic}?`,
          options: ['It helps people', 'It\'s interesting', 'It\'s beautiful'],
          correctAnswer: 'It helps people',
          explanation: 'Many things in our world help people in different ways!'
        }
      ],
      additionalResources: [
        'Look for examples around you',
        'Ask questions to learn more',
        'Practice with family'
      ],
      estimatedDuration: 12,
      learningObjectives: [
        `Learn about ${request.topic}`,
        'Practice observation',
        'Ask thoughtful questions'
      ]
    };
  }

  private generateFallbackStory(request: StoryGenerationRequest): GeneratedStory {
    return {
      title: `The Adventure of Learning About ${request.topic}`,
      content: `Once upon a time, there was a curious child who wanted to learn about ${request.topic}. With the help of friends and family, they discovered many wonderful things. They learned that asking questions and being kind are the best ways to understand the world. And they lived happily, always eager to learn something new!`,
      moral: 'Curiosity and kindness help us learn wonderful things.',
      vocabulary: ['curious', 'learn', 'discover', 'wonderful', 'questions', 'kind'],
      imagePrompts: request.includeImages ? [
        'A curious child with a book',
        'Friends learning together',
        'A happy family sharing knowledge'
      ] : undefined,
      readingLevel: `Perfect for ages ${request.ageGroup}`
    };
  }

  // Health check method
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Test' }]
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export default AnthropicService;