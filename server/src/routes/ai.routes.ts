import { Router } from 'express';
import { logger } from '../utils/logger';
import { googleAIService } from '../services/GoogleAIService';
import OpenAIService, { ContentGenerationRequest, GeneratedContent } from '../services/OpenAIService';
import HuggingFaceService from '../services/HuggingFaceService';
import AnthropicService from '../services/AnthropicService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Health check endpoint (public)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI service is running',
    timestamp: new Date().toISOString(),
    services: {
      google: !!process.env.GOOGLE_AI_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      huggingface: !!process.env.HUGGINGFACE_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY
    }
  });
});

// Analyze homework content (public endpoint - no auth required)
router.post('/analyze-homework', async (req, res): Promise<void> => {
  try {
    const { 
      text, 
      imageData, 
      fileType = 'text',
      provider = 'google'
    } = req.body;

    if (!text && !imageData) {
      res.status(400).json({
        success: false,
        error: 'Either text or image data is required'
      });
      return;
    }

    logger.info(`AI homework analysis requested, provider: ${provider}`);

    let result;
    
    if (provider === 'google' && process.env.GOOGLE_AI_API_KEY) {
      try {
        // Create a simple content generation request
        const contentRequest: ContentGenerationRequest = {
          topic: 'Homework Analysis',
          ageGroup: '5-6',
          language: 'English',
          activityType: 'general',
          difficulty: 'medium',
          customPrompt: `Analyze this homework content and provide educational insights: ${text || 'Image-based content'}`
        };

        const aiResult = await googleAIService.generateContent(contentRequest);
        
        // Transform the result to match expected homework analysis format
        result = {
          summary: aiResult.description || 'Homework analysis completed',
          keyPoints: aiResult.learningObjectives || ['Content analyzed', 'Educational value identified'],
          suggestions: aiResult.additionalResources || ['Continue practicing', 'Review concepts'],
          difficulty: aiResult.questions?.[0] ? 'medium' : 'easy',
          ageRecommendation: '5-8 years',
          educationalValue: 85,
          activities: [{
            id: 'activity1',
            title: aiResult.title || 'Practice Activity',
            description: aiResult.description || 'Educational practice activity',
            type: 'practice',
            difficulty: 'medium',
            estimatedTime: aiResult.estimatedDuration || 15,
            questions: aiResult.questions?.map((q, index) => ({
              id: `q${index + 1}`,
              question: q.question,
              type: q.options ? 'multiple_choice' : 'short_answer',
              options: q.options || [],
              correctAnswer: q.correctAnswer,
              explanation: q.explanation
            })) || []
          }]
        };
      } catch (error) {
        logger.error('Error with Google AI service:', error);
        throw error;
      }
    } else {
      // Fallback response when no AI service is available
      result = {
        summary: 'Content analysis is temporarily unavailable. The AI service is currently not accessible.',
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

    res.json({
      success: true,
      data: result,
      provider: provider,
      analyzedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error analyzing homework:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze homework'
    });
  }
});

// Apply authentication to all other AI routes
router.use(authenticateToken);

// Generate activity from processed content
router.post('/generate-activity', async (req, res) => {
  try {
    const { 
      topic, 
      ageGroup, 
      language = 'English', 
      activityType = 'general', 
      difficulty = 'medium',
      provider = 'google',
      customPrompt 
    } = req.body;

    if (!topic || !ageGroup) {
      return res.status(400).json({
        success: false,
        error: 'Topic and age group are required'
      });
    }

    logger.info(`AI activity generation requested for topic: ${topic}, age: ${ageGroup}, provider: ${provider}`);

    let content;
    const request = { topic, ageGroup, language, activityType, difficulty, customPrompt };

    switch (provider) {
      case 'google':
        content = await googleAIService.generateContent(request);
        break;
      case 'anthropic':
        content = await AnthropicService.getInstance().generateContent(request);
        break;
      case 'huggingface':
        content = await HuggingFaceService.getInstance().generateContent(request);
        break;
      case 'openai':
        content = await OpenAIService.getInstance().generateContent(request);
        break;
      default:
        // Default to Google AI if available, fallback to OpenAI
        if (googleAIService.isAvailable()) {
          content = await googleAIService.generateContent(request);
        } else {
          content = await OpenAIService.getInstance().generateContent(request);
        }
        break;
    }

    return res.json({
      success: true,
      data: {
        content,
        provider: provider,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in AI activity generation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate activity'
    });
  }
});

// Generate story
router.post('/generate-story', async (req, res) => {
  try {
    const { 
      topic, 
      ageGroup, 
      language = 'English', 
      length = 'medium',
      includeImages = false,
      provider = 'google' 
    } = req.body;

    if (!topic || !ageGroup) {
      return res.status(400).json({
        success: false,
        error: 'Topic and age group are required'
      });
    }

    logger.info(`AI story generation requested for topic: ${topic}, provider: ${provider}`);

    let story;
    const request = { topic, ageGroup, language, length, includeImages };

    switch (provider) {
      case 'google':
        story = await googleAIService.generateStory(request);
        break;
      case 'anthropic':
        story = await AnthropicService.getInstance().generateStory(request);
        break;
      case 'openai':
        story = await OpenAIService.getInstance().generateStory(request);
        break;
      default:
        // Default to Google AI if available, fallback to OpenAI
        if (googleAIService.isAvailable()) {
          story = await googleAIService.generateStory(request);
        } else {
          story = await OpenAIService.getInstance().generateStory(request);
        }
        break;
    }

    return res.json({
      success: true,
      data: {
        story,
        provider: provider,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in AI story generation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate story'
    });
  }
});

// Generate image
router.post('/generate-image', async (req, res) => {
  try {
    const { 
      prompt, 
      ageGroup, 
      style = 'cartoon',
      size = 'medium' 
    } = req.body;

    if (!prompt || !ageGroup) {
      return res.status(400).json({
        success: false,
        error: 'Prompt and age group are required'
      });
    }

    logger.info(`AI image generation requested: ${prompt}`);

    const image = await HuggingFaceService.getInstance().generateImage({
      prompt,
      ageGroup,
      style,
      size
    });

    if (!image) {
      return res.status(503).json({
        success: false,
        error: 'Image generation service temporarily unavailable'
      });
    }

    return res.json({
      success: true,
      data: {
        image,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error in AI image generation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate image'
    });
  }
});

// Check content safety
router.post('/check-safety', async (req, res) => {
  try {
    const { content, ageGroup, context = 'general' } = req.body;

    if (!content || !ageGroup) {
      return res.status(400).json({
        success: false,
        error: 'Content and age group are required'
      });
    }

    logger.info(`Content safety check requested for age group: ${ageGroup}`);

    const safetyResult = await AnthropicService.getInstance().checkContentSafety({
      content,
      ageGroup,
      context
    });

    return res.json({
      success: true,
      data: safetyResult
    });
  } catch (error) {
    logger.error('Error in content safety check:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check content safety'
    });
  }
});

// Assess educational value
router.post('/assess-educational-value', async (req, res) => {
  try {
    const { topic, content, ageGroup } = req.body;

    if (!topic || !content || !ageGroup) {
      return res.status(400).json({
        success: false,
        error: 'Topic, content, and age group are required'
      });
    }

    logger.info(`Educational assessment requested for topic: ${topic}`);

    const assessment = await AnthropicService.getInstance().assessEducationalValue(
      topic,
      content,
      ageGroup
    );

    return res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    logger.error('Error in educational assessment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to assess educational value'
    });
  }
});

// Setup AI provider configuration
router.post('/providers/setup', async (req, res) => {
  try {
    // TODO: Implement AI provider setup and configuration storage
    logger.info('AI provider setup requested');
    
    return res.json({
      success: true,
      message: 'AI provider setup endpoint - configuration storage coming soon'
    });
  } catch (error) {
    logger.error('Error in AI provider setup:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to setup AI provider'
    });
  }
});

// Get available AI providers and their status
router.get('/providers', async (req, res) => {
  try {
    logger.info('AI providers status requested');

    const [openaiAvailable, huggingfaceAvailable, anthropicAvailable] = await Promise.all([
      OpenAIService.getInstance().isAvailable(),
      HuggingFaceService.getInstance().isAvailable(),
      AnthropicService.getInstance().isAvailable()
    ]);

    const providers = {
      openai: {
        name: 'OpenAI',
        available: openaiAvailable,
        capabilities: ['content-generation', 'story-generation', 'image-prompts'],
        models: ['gpt-4o-mini']
      },
      huggingface: {
        name: 'HuggingFace',
        available: huggingfaceAvailable,
        capabilities: ['content-generation', 'image-generation', 'emotion-classification', 'translation'],
        models: HuggingFaceService.getInstance().getAvailableModels()
      },
      anthropic: {
        name: 'Anthropic',
        available: anthropicAvailable,
        capabilities: ['content-generation', 'story-generation', 'safety-checking', 'educational-assessment'],
        models: ['claude-3-haiku-20240307']
      }
    };

    return res.json({
      success: true,
      data: {
        providers,
        recommendedProvider: openaiAvailable ? 'openai' : anthropicAvailable ? 'anthropic' : 'huggingface',
        totalAvailable: Object.values(providers).filter(p => p.available).length
      }
    });
  } catch (error) {
    logger.error('Error fetching AI providers:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch AI providers'
    });
  }
});

// Classify emotion in text
router.post('/classify-emotion', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    logger.info('Emotion classification requested');

    const emotion = await HuggingFaceService.getInstance().classifyEmotion(text);

    return res.json({
      success: true,
      data: emotion
    });
  } catch (error) {
    logger.error('Error in emotion classification:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to classify emotion'
    });
  }
});

// Translate text
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Text and target language are required'
      });
    }

    logger.info(`Translation requested to ${targetLanguage}`);

    const translatedText = await HuggingFaceService.getInstance().translateText(text, targetLanguage);

    return res.json({
      success: true,
      data: {
        originalText: text,
        translatedText,
        targetLanguage
      }
    });
  } catch (error) {
    logger.error('Error in translation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to translate text'
    });
  }
});

// Get available AI providers
router.get('/providers', (req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        providers: [
          { id: 'openai', name: 'OpenAI', available: !!process.env.OPENAI_API_KEY },
          { id: 'huggingface', name: 'Hugging Face', available: !!process.env.HUGGINGFACE_API_KEY },
          { id: 'anthropic', name: 'Anthropic', available: !!process.env.ANTHROPIC_API_KEY }
        ]
      }
    });
  } catch (error) {
    logger.error('Error getting AI providers:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get AI providers'
    });
  }
});

// Generate content (alias for generate-activity)
router.post('/generate-content', async (req, res): Promise<void> => {
  try {
    const { 
      topic, 
      ageGroup, 
      difficulty = 'medium',
      contentType = 'activity',
      aiProvider = 'google'
    } = req.body;

    if (!topic || !ageGroup) {
      res.status(400).json({
        success: false,
        error: 'Topic and age group are required'
      });
      return;
    }

    let result;
    
    if (aiProvider === 'google' && googleAIService) {
      // Use existing generate content method
      result = await googleAIService.generateContent({
        topic,
        ageGroup: (ageGroup as '3-4' | '4-5' | '5-6') || '4-5',
        difficulty: (difficulty as 'easy' | 'medium' | 'hard') || 'medium',
        activityType: 'general',
        language: 'English'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'AI provider not available'
      });
      return;
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error generating content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate content'
    });
  }
});

// Analyze performance
router.post('/analyze-performance', async (req, res): Promise<void> => {
  try {
    const { 
      userId, 
      activityData, 
      timeSpent, 
      correctAnswers, 
      totalQuestions 
    } = req.body;

    if (!userId || !activityData) {
      res.status(400).json({
        success: false,
        error: 'User ID and activity data are required'
      });
      return;
    }

    const performance: {
      userId: string;
      accuracy: number;
      timeSpent: number;
      strengths: string[];
      improvements: string[];
      recommendations: string[];
    } = {
      userId,
      accuracy: totalQuestions ? (correctAnswers / totalQuestions) * 100 : 0,
      timeSpent: timeSpent || 0,
      strengths: [],
      improvements: [],
      recommendations: []
    };

    // Basic performance analysis
    if (performance.accuracy >= 90) {
      performance.strengths.push('Excellent understanding of the material');
      performance.recommendations.push('Try more challenging activities');
    } else if (performance.accuracy >= 70) {
      performance.strengths.push('Good grasp of concepts');
      performance.recommendations.push('Practice similar activities for mastery');
    } else {
      performance.improvements.push('Review fundamental concepts');
      performance.recommendations.push('Start with easier activities');
    }

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    logger.error('Error analyzing performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze performance'
    });
  }
});

export default router;