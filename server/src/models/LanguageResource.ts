import mongoose, { Document, Schema } from 'mongoose';

// Language configuration and metadata
export interface ILanguageConfiguration {
  code: string; // ISO 639-1 code (en, ar, es, etc.)
  name: string; // English name
  nativeName: string; // Native name
  isRTL: boolean; // Right-to-left language
  region: string; // Geographic region
  country?: string; // Primary country
  script: string; // Writing script (Latin, Arabic, Cyrillic, etc.)
  
  // Typography and display
  typography: {
    fontFamily: string[];
    fallbackFonts: string[];
    fontSize: {
      base: number;
      scale: number; // Scaling factor for this language
    };
    lineHeight: number;
    letterSpacing?: number;
    wordSpacing?: number;
    textDirection: 'ltr' | 'rtl';
    writingMode: 'horizontal-tb' | 'vertical-rl' | 'vertical-lr';
  };
  
  // Cultural and localization settings
  cultural: {
    dateFormat: string; // DD/MM/YYYY, MM/DD/YYYY, etc.
    timeFormat: '12h' | '24h';
    firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
    numberFormat: {
      decimalSeparator: string;
      thousandsSeparator: string;
      currencyPosition: 'before' | 'after';
      currencySymbol: string;
      negativeFormat: string;
    };
    addressFormat: string;
    phoneFormat: string;
    postalCodeFormat?: string;
  };
  
  // Educational considerations
  educational: {
    readingDirection: 'ltr' | 'rtl';
    complexity: 'low' | 'medium' | 'high'; // Language complexity for learners
    recommendedAgeStart: number; // Minimum age to start learning
    commonSecondLanguage?: string; // Common second language in this region
    literacyRate?: number; // Literacy rate percentage
    internetPenetration?: number; // Internet usage percentage
  };
  
  // Technical specifications
  technical: {
    encoding: string; // UTF-8, UTF-16, etc.
    keyboardLayout: string;
    inputMethods: string[]; // Available input methods
    speechRecognition: boolean;
    textToSpeech: boolean;
    hyphenation: boolean;
    collationRules?: string; // Sorting rules
    caseFolding?: boolean; // Case sensitivity rules
  };
}

// Translation rule for specific contexts
export interface ITranslationRule {
  ruleId: string;
  name: string;
  description: string;
  sourcePattern: string; // Regex or pattern to match
  targetPattern: string; // Replacement pattern
  context: string[]; // Contexts where this rule applies
  priority: number; // Rule priority (higher = applied first)
  enabled: boolean;
  examples: Array<{
    source: string;
    target: string;
    explanation: string;
  }>;
  createdBy: string;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

// Cultural adaptation guidelines
export interface ICulturalGuideline {
  guidelineId: string;
  category: 'color' | 'imagery' | 'symbols' | 'gestures' | 'concepts' | 'social' | 'religious';
  title: string;
  description: string;
  recommendations: string[];
  avoidances: string[];
  examples: Array<{
    situation: string;
    inappropriate: string;
    appropriate: string;
    explanation: string;
  }>;
  severity: 'info' | 'warning' | 'critical';
  regions: string[]; // Applicable regions
  contexts: string[]; // Educational contexts
  sources: string[]; // Reference sources
  lastReviewed: Date;
  reviewedBy: string;
}

// Language resource interface
export interface ILanguageResource extends Document {
  resourceId: string;
  language: string; // Language code
  resourceType: 'configuration' | 'glossary' | 'rules' | 'cultural_guide' | 'style_guide' | 'template';
  
  // Configuration data
  configuration?: ILanguageConfiguration;
  
  // Glossary and terminology
  glossary: Array<{
    termId: string;
    term: string;
    definition: string;
    context: string;
    category: string;
    domain: string; // Subject domain
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    translations: Array<{
      language: string;
      term: string;
      definition?: string;
      context?: string;
      verified: boolean;
      verifiedBy?: string;
      verifiedDate?: Date;
    }>;
    pronunciation?: {
      ipa: string; // International Phonetic Alphabet
      audio?: string; // Audio file URL
      region?: string; // Regional variant
    };
    etymology?: string;
    usage: {
      frequency: 'rare' | 'uncommon' | 'common' | 'frequent';
      register: 'formal' | 'informal' | 'technical' | 'colloquial';
      examples: string[];
    };
    relatedTerms: string[];
    synonyms: string[];
    antonyms: string[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  
  // Translation rules and patterns
  translationRules: ITranslationRule[];
  
  // Cultural adaptation guidelines
  culturalGuidelines: ICulturalGuideline[];
  
  // Style guidelines
  styleGuide: {
    tone: {
      formal: {
        description: string;
        examples: string[];
        whenToUse: string[];
      };
      informal: {
        description: string;
        examples: string[];
        whenToUse: string[];
      };
      educational: {
        description: string;
        examples: string[];
        ageSpecific: Array<{
          ageRange: string;
          guidelines: string[];
          examples: string[];
        }>;
      };
    };
    
    voice: {
      active: {
        preferred: boolean;
        explanation: string;
        examples: string[];
      };
      passive: {
        acceptable: boolean;
        explanation: string;
        examples: string[];
      };
    };
    
    punctuation: {
      rules: Array<{
        rule: string;
        explanation: string;
        examples: string[];
        exceptions?: string[];
      }>;
      quotes: {
        primary: string;
        secondary: string;
        examples: string[];
      };
      emphasis: {
        methods: string[];
        examples: string[];
      };
    };
    
    formatting: {
      headers: Array<{
        level: number;
        style: string;
        examples: string[];
      }>;
      lists: {
        bullets: string[];
        numbering: string[];
        examples: string[];
      };
      emphasis: {
        bold: string;
        italic: string;
        underline: string;
      };
    };
  };
  
  // Content templates
  templates: Array<{
    templateId: string;
    name: string;
    description: string;
    category: 'lesson' | 'exercise' | 'assessment' | 'story' | 'instruction';
    structure: Array<{
      section: string;
      required: boolean;
      placeholder: string;
      examples: string[];
      maxLength?: number;
      format?: string;
    }>;
    variables: Array<{
      name: string;
      type: 'text' | 'number' | 'date' | 'list';
      description: string;
      defaultValue?: any;
      validation?: string;
    }>;
    sampleContent: string;
    usageGuidelines: string[];
    lastUsed?: Date;
    usageCount: number;
    createdBy: string;
    createdAt: Date;
  }>;
  
  // Quality assurance rules
  qaRules: Array<{
    ruleId: string;
    name: string;
    description: string;
    category: 'grammar' | 'style' | 'terminology' | 'cultural' | 'technical';
    severity: 'info' | 'warning' | 'error' | 'critical';
    pattern: string; // Regex pattern to check
    message: string; // Error message
    suggestion?: string; // Suggested fix
    enabled: boolean;
    autoFix: boolean;
    examples: Array<{
      incorrect: string;
      correct: string;
      explanation: string;
    }>;
    exceptions: string[]; // Contexts where rule doesn't apply
    lastUpdated: Date;
    updatedBy: string;
  }>;
  
  // Localization assets
  assets: {
    images: Array<{
      assetId: string;
      category: string;
      culturallyAppropriate: boolean;
      replacementFor?: string; // Original asset ID
      url: string;
      alt: string;
      caption?: string;
      usage: string[];
      restrictions?: string[];
      license: string;
      attribution?: string;
    }>;
    
    audio: Array<{
      assetId: string;
      type: 'pronunciation' | 'background' | 'effect' | 'music';
      language: string;
      speaker?: {
        gender: 'male' | 'female' | 'neutral';
        age: 'child' | 'adult' | 'elderly';
        accent: string;
        region: string;
      };
      url: string;
      duration: number; // seconds
      quality: 'low' | 'medium' | 'high';
      license: string;
      attribution?: string;
    }>;
    
    fonts: Array<{
      fontId: string;
      family: string;
      variants: string[];
      url?: string; // Web font URL
      license: string;
      supports: string[]; // Character sets supported
      recommended: boolean;
      fallbacks: string[];
    }>;
  };
  
  // Regional variations
  regionalVariations: Array<{
    region: string;
    country: string;
    differences: {
      vocabulary: Array<{
        standard: string;
        regional: string;
        context?: string;
        frequency: string;
      }>;
      
      grammar: Array<{
        rule: string;
        standardForm: string;
        regionalForm: string;
        examples: string[];
      }>;
      
      cultural: Array<{
        aspect: string;
        consideration: string;
        impact: 'low' | 'medium' | 'high';
        recommendations: string[];
      }>;
    };
    
    preferences: {
      dateFormat: string;
      timeFormat: string;
      currencyFormat: string;
      measurementSystem: 'metric' | 'imperial' | 'mixed';
    };
    
    population: number;
    internetPenetration: number;
    educationLevel: string;
    primaryLearningContext: string[];
  }>;
  
  // Version control and maintenance
  version: string;
  versionHistory: Array<{
    version: string;
    changes: string[];
    changedBy: string;
    changeDate: Date;
    approved: boolean;
    approvedBy?: string;
    approvalDate?: Date;
  }>;
  
  // Usage analytics
  analytics: {
    usage: {
      totalAccesses: number;
      uniqueUsers: number;
      lastAccessed: Date;
      popularSections: Array<{
        section: string;
        accessCount: number;
        lastAccessed: Date;
      }>;
    };
    
    effectiveness: {
      translationAccuracy: number; // Based on QA scores
      userSatisfaction: number; // User feedback scores
      adoptionRate: number; // Usage growth
      errorReduction: number; // Reduction in translation errors
    };
    
    maintenance: {
      lastReview: Date;
      reviewedBy: string;
      nextReviewDue: Date;
      pendingUpdates: number;
      outdatedSections: string[];
    };
  };
  
  // Administrative
  status: 'draft' | 'review' | 'approved' | 'published' | 'deprecated';
  isActive: boolean;
  createdBy: string;
  maintainers: string[];
  reviewers: string[];
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// LanguageResource Schema
const languageResourceSchema = new Schema<ILanguageResource>({
  resourceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  language: {
    type: String,
    required: true,
    index: true
  },
  resourceType: {
    type: String,
    enum: ['configuration', 'glossary', 'rules', 'cultural_guide', 'style_guide', 'template'],
    required: true,
    index: true
  },
  
  configuration: {
    code: String,
    name: String,
    nativeName: String,
    isRTL: Boolean,
    region: String,
    country: String,
    script: String,
    
    typography: {
      fontFamily: [String],
      fallbackFonts: [String],
      fontSize: {
        base: Number,
        scale: Number
      },
      lineHeight: Number,
      letterSpacing: Number,
      wordSpacing: Number,
      textDirection: {
        type: String,
        enum: ['ltr', 'rtl']
      },
      writingMode: {
        type: String,
        enum: ['horizontal-tb', 'vertical-rl', 'vertical-lr']
      }
    },
    
    cultural: {
      dateFormat: String,
      timeFormat: {
        type: String,
        enum: ['12h', '24h']
      },
      firstDayOfWeek: {
        type: Number,
        min: 0,
        max: 6
      },
      numberFormat: {
        decimalSeparator: String,
        thousandsSeparator: String,
        currencyPosition: {
          type: String,
          enum: ['before', 'after']
        },
        currencySymbol: String,
        negativeFormat: String
      },
      addressFormat: String,
      phoneFormat: String,
      postalCodeFormat: String
    },
    
    educational: {
      readingDirection: {
        type: String,
        enum: ['ltr', 'rtl']
      },
      complexity: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      recommendedAgeStart: Number,
      commonSecondLanguage: String,
      literacyRate: Number,
      internetPenetration: Number
    },
    
    technical: {
      encoding: String,
      keyboardLayout: String,
      inputMethods: [String],
      speechRecognition: Boolean,
      textToSpeech: Boolean,
      hyphenation: Boolean,
      collationRules: String,
      caseFolding: Boolean
    }
  },
  
  glossary: [{
    termId: String,
    term: String,
    definition: String,
    context: String,
    category: String,
    domain: String,
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced']
    },
    translations: [{
      language: String,
      term: String,
      definition: String,
      context: String,
      verified: { type: Boolean, default: false },
      verifiedBy: String,
      verifiedDate: Date
    }],
    pronunciation: {
      ipa: String,
      audio: String,
      region: String
    },
    etymology: String,
    usage: {
      frequency: {
        type: String,
        enum: ['rare', 'uncommon', 'common', 'frequent']
      },
      register: {
        type: String,
        enum: ['formal', 'informal', 'technical', 'colloquial']
      },
      examples: [String]
    },
    relatedTerms: [String],
    synonyms: [String],
    antonyms: [String],
    createdBy: String
  }],
  
  translationRules: [{
    ruleId: String,
    name: String,
    description: String,
    sourcePattern: String,
    targetPattern: String,
    context: [String],
    priority: Number,
    enabled: { type: Boolean, default: true },
    examples: [{
      source: String,
      target: String,
      explanation: String
    }],
    createdBy: String,
    createdAt: { type: Date, default: Date.now },
    lastUsed: Date,
    usageCount: { type: Number, default: 0 }
  }],
  
  culturalGuidelines: [{
    guidelineId: String,
    category: {
      type: String,
      enum: ['color', 'imagery', 'symbols', 'gestures', 'concepts', 'social', 'religious']
    },
    title: String,
    description: String,
    recommendations: [String],
    avoidances: [String],
    examples: [{
      situation: String,
      inappropriate: String,
      appropriate: String,
      explanation: String
    }],
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical']
    },
    regions: [String],
    contexts: [String],
    sources: [String],
    lastReviewed: Date,
    reviewedBy: String
  }],
  
  styleGuide: {
    tone: {
      formal: {
        description: String,
        examples: [String],
        whenToUse: [String]
      },
      informal: {
        description: String,
        examples: [String],
        whenToUse: [String]
      },
      educational: {
        description: String,
        examples: [String],
        ageSpecific: [{
          ageRange: String,
          guidelines: [String],
          examples: [String]
        }]
      }
    },
    
    voice: {
      active: {
        preferred: Boolean,
        explanation: String,
        examples: [String]
      },
      passive: {
        acceptable: Boolean,
        explanation: String,
        examples: [String]
      }
    },
    
    punctuation: {
      rules: [{
        rule: String,
        explanation: String,
        examples: [String],
        exceptions: [String]
      }],
      quotes: {
        primary: String,
        secondary: String,
        examples: [String]
      },
      emphasis: {
        methods: [String],
        examples: [String]
      }
    },
    
    formatting: {
      headers: [{
        level: Number,
        style: String,
        examples: [String]
      }],
      lists: {
        bullets: [String],
        numbering: [String],
        examples: [String]
      },
      emphasis: {
        bold: String,
        italic: String,
        underline: String
      }
    }
  },
  
  templates: [{
    templateId: String,
    name: String,
    description: String,
    category: {
      type: String,
      enum: ['lesson', 'exercise', 'assessment', 'story', 'instruction']
    },
    structure: [{
      section: String,
      required: Boolean,
      placeholder: String,
      examples: [String],
      maxLength: Number,
      format: String
    }],
    variables: [{
      name: String,
      type: {
        type: String,
        enum: ['text', 'number', 'date', 'list']
      },
      description: String,
      defaultValue: Schema.Types.Mixed,
      validation: String
    }],
    sampleContent: String,
    usageGuidelines: [String],
    lastUsed: Date,
    usageCount: { type: Number, default: 0 },
    createdBy: String
  }],
  
  qaRules: [{
    ruleId: String,
    name: String,
    description: String,
    category: {
      type: String,
      enum: ['grammar', 'style', 'terminology', 'cultural', 'technical']
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'critical']
    },
    pattern: String,
    message: String,
    suggestion: String,
    enabled: { type: Boolean, default: true },
    autoFix: { type: Boolean, default: false },
    examples: [{
      incorrect: String,
      correct: String,
      explanation: String
    }],
    exceptions: [String],
    lastUpdated: Date,
    updatedBy: String
  }],
  
  assets: {
    images: [{
      assetId: String,
      category: String,
      culturallyAppropriate: Boolean,
      replacementFor: String,
      url: String,
      alt: String,
      caption: String,
      usage: [String],
      restrictions: [String],
      license: String,
      attribution: String
    }],
    
    audio: [{
      assetId: String,
      type: {
        type: String,
        enum: ['pronunciation', 'background', 'effect', 'music']
      },
      language: String,
      speaker: {
        gender: {
          type: String,
          enum: ['male', 'female', 'neutral']
        },
        age: {
          type: String,
          enum: ['child', 'adult', 'elderly']
        },
        accent: String,
        region: String
      },
      url: String,
      duration: Number,
      quality: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      license: String,
      attribution: String
    }],
    
    fonts: [{
      fontId: String,
      family: String,
      variants: [String],
      url: String,
      license: String,
      supports: [String],
      recommended: Boolean,
      fallbacks: [String]
    }]
  },
  
  regionalVariations: [{
    region: String,
    country: String,
    differences: {
      vocabulary: [{
        standard: String,
        regional: String,
        context: String,
        frequency: String
      }],
      
      grammar: [{
        rule: String,
        standardForm: String,
        regionalForm: String,
        examples: [String]
      }],
      
      cultural: [{
        aspect: String,
        consideration: String,
        impact: {
          type: String,
          enum: ['low', 'medium', 'high']
        },
        recommendations: [String]
      }]
    },
    
    preferences: {
      dateFormat: String,
      timeFormat: String,
      currencyFormat: String,
      measurementSystem: {
        type: String,
        enum: ['metric', 'imperial', 'mixed']
      }
    },
    
    population: Number,
    internetPenetration: Number,
    educationLevel: String,
    primaryLearningContext: [String]
  }],
  
  version: { type: String, default: '1.0.0' },
  versionHistory: [{
    version: String,
    changes: [String],
    changedBy: String,
    changeDate: { type: Date, default: Date.now },
    approved: { type: Boolean, default: false },
    approvedBy: String,
    approvalDate: Date
  }],
  
  analytics: {
    usage: {
      totalAccesses: { type: Number, default: 0 },
      uniqueUsers: { type: Number, default: 0 },
      lastAccessed: Date,
      popularSections: [{
        section: String,
        accessCount: Number,
        lastAccessed: Date
      }]
    },
    
    effectiveness: {
      translationAccuracy: Number,
      userSatisfaction: Number,
      adoptionRate: Number,
      errorReduction: Number
    },
    
    maintenance: {
      lastReview: Date,
      reviewedBy: String,
      nextReviewDue: Date,
      pendingUpdates: { type: Number, default: 0 },
      outdatedSections: [String]
    }
  },
  
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'published', 'deprecated'],
    default: 'draft'
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  maintainers: [String],
  reviewers: [String],
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  }
}, {
  timestamps: true,
  collection: 'language_resources'
});

// Indexes
languageResourceSchema.index({ resourceId: 1 });
languageResourceSchema.index({ language: 1, resourceType: 1 });
languageResourceSchema.index({ status: 1 });
languageResourceSchema.index({ 'glossary.term': 'text', 'glossary.definition': 'text' });
languageResourceSchema.index({ tags: 1 });
languageResourceSchema.index({ priority: 1 });
languageResourceSchema.index({ createdAt: -1 });

// Instance methods
languageResourceSchema.methods.findGlossaryTerm = function(term: string) {
  return this.glossary.find((g: any) => g.term.toLowerCase() === term.toLowerCase());
};

languageResourceSchema.methods.addGlossaryTerm = function(termData: any) {
  const existingTerm = this.findGlossaryTerm(termData.term);
  if (existingTerm) {
    throw new Error(`Term "${termData.term}" already exists in glossary`);
  }
  
  termData.termId = new mongoose.Types.ObjectId().toString();
  termData.createdAt = new Date();
  termData.updatedAt = new Date();
  
  this.glossary.push(termData);
  return termData;
};

languageResourceSchema.methods.updateGlossaryTerm = function(termId: string, updates: any) {
  const term = this.glossary.find((g: any) => g.termId === termId);
  if (!term) {
    throw new Error(`Term with ID "${termId}" not found`);
  }
  
  Object.assign(term, updates);
  term.updatedAt = new Date();
  return term;
};

languageResourceSchema.methods.getActiveRules = function() {
  return this.translationRules.filter((rule: any) => rule.enabled);
};

languageResourceSchema.methods.getCulturalGuidelines = function(category?: string, severity?: string) {
  let guidelines = this.culturalGuidelines;
  
  if (category) {
    guidelines = guidelines.filter((g: any) => g.category === category);
  }
  
  if (severity) {
    guidelines = guidelines.filter((g: any) => g.severity === severity);
  }
  
  return guidelines;
};

languageResourceSchema.methods.getTemplatesByCategory = function(category: string) {
  return this.templates.filter((t: any) => t.category === category);
};

languageResourceSchema.methods.incrementTemplateUsage = function(templateId: string) {
  const template = this.templates.find((t: any) => t.templateId === templateId);
  if (template) {
    template.usageCount++;
    template.lastUsed = new Date();
  }
};

languageResourceSchema.methods.getQARule = function(ruleId: string) {
  return this.qaRules.find((r: any) => r.ruleId === ruleId);
};

languageResourceSchema.methods.validateContent = function(content: string) {
  const issues = [];
  const activeRules = this.qaRules.filter((r: any) => r.enabled);
  
  for (const rule of activeRules) {
    try {
      const regex = new RegExp(rule.pattern, 'gi');
      const matches = content.match(regex);
      
      if (matches) {
        issues.push({
          ruleId: rule.ruleId,
          rule: rule.name,
          category: rule.category,
          severity: rule.severity,
          message: rule.message,
          suggestion: rule.suggestion,
          matches: matches.length,
          autoFix: rule.autoFix
        });
      }
    } catch (error) {
      console.error(`Error applying QA rule ${rule.ruleId}:`, error);
    }
  }
  
  return issues;
};

// Static methods
languageResourceSchema.statics.findByLanguage = function(language: string, resourceType?: string) {
  const query: any = { language, isActive: true };
  if (resourceType) {
    query.resourceType = resourceType;
  }
  return this.find(query);
};

languageResourceSchema.statics.searchGlossary = function(searchTerm: string, languages?: string[]) {
  const pipeline: any[] = [
    { $match: { isActive: true } },
    { $unwind: '$glossary' },
    {
      $match: {
        $or: [
          { 'glossary.term': { $regex: searchTerm, $options: 'i' } },
          { 'glossary.definition': { $regex: searchTerm, $options: 'i' } }
        ]
      }
    }
  ];
  
  if (languages && languages.length > 0) {
    pipeline.splice(1, 0, { $match: { language: { $in: languages } } });
  }
  
  return this.aggregate(pipeline);
};

languageResourceSchema.statics.getLanguageConfiguration = function(language: string) {
  return this.findOne({
    language,
    resourceType: 'configuration',
    isActive: true
  });
};

languageResourceSchema.statics.getMaintenanceReport = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$language',
        totalResources: { $sum: 1 },
        outdatedResources: {
          $sum: {
            $cond: [
              { $lt: ['$analytics.maintenance.lastReview', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        },
        averageQuality: { $avg: '$analytics.effectiveness.translationAccuracy' },
        totalUsage: { $sum: '$analytics.usage.totalAccesses' }
      }
    },
    { $sort: { totalUsage: -1 } }
  ]);
};

// Pre-save middleware
languageResourceSchema.pre('save', function(next) {
  // Update analytics
  this.analytics.maintenance.pendingUpdates = this.versionHistory.filter(v => !v.approved).length;
  
  // Set next review date if not set
  if (!this.analytics.maintenance.nextReviewDue) {
    const now = new Date();
    this.analytics.maintenance.nextReviewDue = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days
  }
  
  next();
});

export const LanguageResource = mongoose.model<ILanguageResource>('LanguageResource', languageResourceSchema);