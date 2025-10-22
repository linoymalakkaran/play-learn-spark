import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IChallenge extends Document {
  _id: ObjectId;
  title: string;
  description: string;
  shortDescription: string;
  type: 'individual' | 'team' | 'class' | 'school' | 'global';
  category: 'academic' | 'creative' | 'social' | 'physical' | 'mental' | 'collaborative' | 'technical';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'legendary';
  format: 'quiz' | 'project' | 'competition' | 'puzzle' | 'creative_task' | 'research' | 'presentation' | 'game';
  duration: {
    type: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
    value: number;
    isFlexible: boolean; // can participants take longer?
  };
  schedule: {
    startDate: Date;
    endDate: Date;
    registrationDeadline?: Date;
    timeZone: string;
    recurring?: {
      pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
      interval: number; // every X days/weeks/months/years
      endAfter?: number; // number of occurrences
      endDate?: Date;
    };
  };
  participation: {
    minParticipants: number;
    maxParticipants?: number;
    currentParticipants: number;
    teamSize?: {
      min: number;
      max: number;
    };
    eligibility: {
      gradeLevel?: string[];
      subjects?: string[];
      prerequisites?: ObjectId[]; // required achievements/badges
      excludeUsers?: ObjectId[];
      inviteOnly?: boolean;
      regions?: string[];
    };
    registrationRequired: boolean;
    waitlistEnabled: boolean;
  };
  objectives: Array<{
    id: string;
    title: string;
    description: string;
    type: 'primary' | 'secondary' | 'bonus';
    measurable: boolean;
    metrics?: {
      field: string;
      target: number;
      unit: string;
    };
    weight: number; // for scoring
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    type: 'question' | 'upload' | 'text' | 'choice' | 'code' | 'drawing' | 'video' | 'presentation';
    order: number;
    isRequired: boolean;
    timeLimit?: number; // minutes
    points: number;
    rubric?: {
      criteria: Array<{
        name: string;
        description: string;
        levels: Array<{
          level: number;
          description: string;
          points: number;
        }>;
        weight: number;
      }>;
    };
    resources?: Array<{
      type: 'link' | 'file' | 'video' | 'document';
      url: string;
      title: string;
      description?: string;
    }>;
    hints?: Array<{
      text: string;
      unlockAfter: number; // minutes into task
      pointsDeducted: number;
    }>;
  }>;
  scoring: {
    type: 'points' | 'time' | 'accuracy' | 'creativity' | 'collaboration' | 'custom';
    maxPoints: number;
    bonusPoints?: Array<{
      condition: string;
      points: number;
      description: string;
    }>;
    penalties?: Array<{
      condition: string;
      points: number;
      description: string;
    }>;
    tiebreaker: 'time' | 'accuracy' | 'creativity' | 'random';
    autoGrading: boolean;
    peerGrading?: {
      enabled: boolean;
      reviewsPerSubmission: number;
      reviewerPoints: number;
    };
  };
  rewards: {
    participation: {
      points: number;
      badges: ObjectId[];
      certificates: string[];
    };
    completion: {
      points: number;
      badges: ObjectId[];
      certificates: string[];
      titles: string[];
    };
    ranking: Array<{
      position: 'winner' | 'runner_up' | 'top_3' | 'top_10' | 'top_25';
      points: number;
      badges: ObjectId[];
      certificates: string[];
      titles: string[];
      specialRewards?: Array<{
        type: 'item' | 'privilege' | 'unlock' | 'experience';
        value: any;
        description: string;
      }>;
    }>;
  };
  content: {
    instructions: string;
    resources: Array<{
      type: 'video' | 'document' | 'link' | 'image' | 'audio';
      url: string;
      title: string;
      description?: string;
      duration?: number; // for video/audio
      isRequired: boolean;
    }>;
    examples: Array<{
      type: 'text' | 'image' | 'video' | 'file';
      content: string;
      caption?: string;
    }>;
    faqs: Array<{
      question: string;
      answer: string;
      category: string;
    }>;
  };
  submission: {
    types: Array<'text' | 'file' | 'url' | 'code' | 'multiple_files' | 'presentation' | 'video'>;
    fileTypes?: string[]; // allowed file extensions
    maxFileSize?: number; // in MB
    maxFiles?: number;
    allowEditing: boolean;
    submissionDeadline?: Date;
    lateSubmission: {
      allowed: boolean;
      penalty?: number; // points deducted per day/hour
      maxDaysLate?: number;
    };
  };
  tracking: {
    totalParticipants: number;
    completedParticipants: number;
    averageScore: number;
    averageCompletionTime: number; // in minutes
    dropoutRate: number; // percentage who started but didn't finish
    satisfactionRating: number; // average rating from participants
    difficultyRating: number; // perceived difficulty from participants
    popularityScore: number;
    views: number;
    shares: number;
    participantsByDay: Array<{
      date: Date;
      registrations: number;
      completions: number;
    }>;
  };
  leaderboard: {
    enabled: boolean;
    public: boolean;
    updateFrequency: 'realtime' | 'hourly' | 'daily';
    categories: Array<{
      name: string;
      type: 'individual' | 'team';
      sortBy: 'score' | 'time' | 'accuracy';
      entries: Array<{
        participantId: ObjectId;
        teamId?: ObjectId;
        rank: number;
        score: number;
        completionTime?: number;
        accuracy?: number;
        submittedAt: Date;
        metadata?: any;
      }>;
    }>;
  };
  feedback: {
    allowComments: boolean;
    allowRatings: boolean;
    moderateComments: boolean;
    comments: Array<{
      userId: ObjectId;
      teamId?: ObjectId;
      message: string;
      rating?: number; // 1-5 stars
      helpful: number; // helpful votes
      flagged: boolean;
      createdAt: Date;
    }>;
    ratings: Array<{
      userId: ObjectId;
      overall: number; // 1-5
      difficulty: number; // 1-5
      engagement: number; // 1-5
      clarity: number; // 1-5
      fairness: number; // 1-5
      createdAt: Date;
    }>;
  };
  collaboration: {
    allowTeams: boolean;
    teamFormation: 'self_select' | 'random' | 'instructor_assigned' | 'algorithm_matched';
    communicationTools: Array<'chat' | 'video_call' | 'shared_workspace' | 'file_sharing'>;
    sharedWorkspace: {
      enabled: boolean;
      features: Array<'documents' | 'whiteboard' | 'code_editor' | 'presentation'>;
    };
    peerReview: {
      enabled: boolean;
      anonymous: boolean;
      reviewsPerParticipant: number;
      reviewDeadline?: Date;
    };
  };
  moderation: {
    autoModeration: {
      enabled: boolean;
      flaggedKeywords: string[];
      contentFilters: string[];
    };
    moderators: ObjectId[];
    reports: Array<{
      reportedBy: ObjectId;
      reason: string;
      description: string;
      status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
      createdAt: Date;
      resolvedAt?: Date;
      resolvedBy?: ObjectId;
    }>;
  };
  analytics: {
    engagementMetrics: {
      averageTimeSpent: number;
      pageViews: number;
      interactionRate: number;
      returnRate: number; // participants who come back
    };
    performanceMetrics: {
      averageAttempts: number;
      taskCompletionRates: Array<{
        taskId: string;
        completionRate: number;
        averageScore: number;
        averageTime: number;
      }>;
      commonMistakes: Array<{
        taskId: string;
        mistake: string;
        frequency: number;
      }>;
    };
    learningOutcomes: {
      skillsAssessed: string[];
      improvementMeasured: boolean;
      preAssessmentScores?: number[];
      postAssessmentScores?: number[];
      knowledgeRetention: number; // percentage
    };
    socialMetrics: {
      teamCollaboration: number; // collaboration effectiveness score
      peerInteractions: number;
      helpRequests: number;
      mentoringSessions: number;
    };
  };
  customization: {
    branding: {
      logo?: string;
      colors: {
        primary: string;
        secondary: string;
        accent: string;
      };
      theme: string;
    };
    localization: {
      defaultLanguage: string;
      supportedLanguages: string[];
      translations: Array<{
        language: string;
        title: string;
        description: string;
        instructions: string;
        taskTitles: string[];
        taskDescriptions: string[];
      }>;
    };
    adaptiveContent: {
      enabled: boolean;
      difficultyAdjustment: boolean;
      personalizedHints: boolean;
      contentRecommendations: boolean;
    };
  };
  metadata: {
    version: string;
    createdBy: ObjectId;
    moderatedBy?: ObjectId[];
    isActive: boolean;
    isPublic: boolean;
    isFeatured: boolean;
    isPremium: boolean;
    tags: string[];
    subjects: string[];
    skills: string[];
    ageGroups: string[];
    changelog: Array<{
      version: string;
      changes: string[];
      date: Date;
      author: ObjectId;
    }>;
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    archivedAt?: Date;
  };
}

const ChallengeSchema = new Schema<IChallenge>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  type: {
    type: String,
    enum: ['individual', 'team', 'class', 'school', 'global'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['academic', 'creative', 'social', 'physical', 'mental', 'collaborative', 'technical'],
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert', 'legendary'],
    required: true,
    index: true
  },
  format: {
    type: String,
    enum: ['quiz', 'project', 'competition', 'puzzle', 'creative_task', 'research', 'presentation', 'game'],
    required: true,
    index: true
  },
  duration: {
    type: {
      type: String,
      enum: ['minutes', 'hours', 'days', 'weeks', 'months'],
      required: true
    },
    value: { type: Number, required: true, min: 1 },
    isFlexible: { type: Boolean, default: false }
  },
  schedule: {
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    registrationDeadline: { type: Date },
    timeZone: { type: String, default: 'UTC' },
    recurring: {
      pattern: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly']
      },
      interval: { type: Number, min: 1 },
      endAfter: { type: Number },
      endDate: { type: Date }
    }
  },
  participation: {
    minParticipants: { type: Number, default: 1, min: 1 },
    maxParticipants: { type: Number },
    currentParticipants: { type: Number, default: 0 },
    teamSize: {
      min: { type: Number, default: 2 },
      max: { type: Number, default: 6 }
    },
    eligibility: {
      gradeLevel: [{ type: String }],
      subjects: [{ type: String }],
      prerequisites: [{ type: Schema.Types.ObjectId, ref: 'GameAchievement' }],
      excludeUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      inviteOnly: { type: Boolean, default: false },
      regions: [{ type: String }]
    },
    registrationRequired: { type: Boolean, default: true },
    waitlistEnabled: { type: Boolean, default: false }
  },
  objectives: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['primary', 'secondary', 'bonus'],
      required: true
    },
    measurable: { type: Boolean, default: false },
    metrics: {
      field: { type: String },
      target: { type: Number },
      unit: { type: String }
    },
    weight: { type: Number, default: 1 }
  }],
  tasks: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['question', 'upload', 'text', 'choice', 'code', 'drawing', 'video', 'presentation'],
      required: true
    },
    order: { type: Number, required: true },
    isRequired: { type: Boolean, default: true },
    timeLimit: { type: Number }, // minutes
    points: { type: Number, default: 0 },
    rubric: {
      criteria: [{
        name: { type: String, required: true },
        description: { type: String, required: true },
        levels: [{
          level: { type: Number, required: true },
          description: { type: String, required: true },
          points: { type: Number, required: true }
        }],
        weight: { type: Number, default: 1 }
      }]
    },
    resources: [{
      type: {
        type: String,
        enum: ['link', 'file', 'video', 'document'],
        required: true
      },
      url: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String }
    }],
    hints: [{
      text: { type: String, required: true },
      unlockAfter: { type: Number, required: true }, // minutes
      pointsDeducted: { type: Number, default: 0 }
    }]
  }],
  scoring: {
    type: {
      type: String,
      enum: ['points', 'time', 'accuracy', 'creativity', 'collaboration', 'custom'],
      required: true
    },
    maxPoints: { type: Number, required: true },
    bonusPoints: [{
      condition: { type: String, required: true },
      points: { type: Number, required: true },
      description: { type: String, required: true }
    }],
    penalties: [{
      condition: { type: String, required: true },
      points: { type: Number, required: true },
      description: { type: String, required: true }
    }],
    tiebreaker: {
      type: String,
      enum: ['time', 'accuracy', 'creativity', 'random'],
      default: 'time'
    },
    autoGrading: { type: Boolean, default: true },
    peerGrading: {
      enabled: { type: Boolean, default: false },
      reviewsPerSubmission: { type: Number, default: 3 },
      reviewerPoints: { type: Number, default: 5 }
    }
  },
  rewards: {
    participation: {
      points: { type: Number, default: 0 },
      badges: [{ type: Schema.Types.ObjectId, ref: 'Badge' }],
      certificates: [{ type: String }]
    },
    completion: {
      points: { type: Number, default: 0 },
      badges: [{ type: Schema.Types.ObjectId, ref: 'Badge' }],
      certificates: [{ type: String }],
      titles: [{ type: String }]
    },
    ranking: [{
      position: {
        type: String,
        enum: ['winner', 'runner_up', 'top_3', 'top_10', 'top_25'],
        required: true
      },
      points: { type: Number, required: true },
      badges: [{ type: Schema.Types.ObjectId, ref: 'Badge' }],
      certificates: [{ type: String }],
      titles: [{ type: String }],
      specialRewards: [{
        type: {
          type: String,
          enum: ['item', 'privilege', 'unlock', 'experience'],
          required: true
        },
        value: { type: Schema.Types.Mixed, required: true },
        description: { type: String, required: true }
      }]
    }]
  },
  content: {
    instructions: { type: String, required: true },
    resources: [{
      type: {
        type: String,
        enum: ['video', 'document', 'link', 'image', 'audio'],
        required: true
      },
      url: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String },
      duration: { type: Number }, // for video/audio
      isRequired: { type: Boolean, default: false }
    }],
    examples: [{
      type: {
        type: String,
        enum: ['text', 'image', 'video', 'file'],
        required: true
      },
      content: { type: String, required: true },
      caption: { type: String }
    }],
    faqs: [{
      question: { type: String, required: true },
      answer: { type: String, required: true },
      category: { type: String, required: true }
    }]
  },
  submission: {
    types: [{
      type: String,
      enum: ['text', 'file', 'url', 'code', 'multiple_files', 'presentation', 'video'],
      required: true
    }],
    fileTypes: [{ type: String }], // e.g., ['pdf', 'docx', 'jpg']
    maxFileSize: { type: Number, default: 10 }, // MB
    maxFiles: { type: Number, default: 5 },
    allowEditing: { type: Boolean, default: true },
    submissionDeadline: { type: Date },
    lateSubmission: {
      allowed: { type: Boolean, default: false },
      penalty: { type: Number }, // points deducted
      maxDaysLate: { type: Number }
    }
  },
  tracking: {
    totalParticipants: { type: Number, default: 0 },
    completedParticipants: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageCompletionTime: { type: Number, default: 0 },
    dropoutRate: { type: Number, default: 0 },
    satisfactionRating: { type: Number, default: 0 },
    difficultyRating: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    participantsByDay: [{
      date: { type: Date, required: true },
      registrations: { type: Number, default: 0 },
      completions: { type: Number, default: 0 }
    }]
  },
  leaderboard: {
    enabled: { type: Boolean, default: true },
    public: { type: Boolean, default: true },
    updateFrequency: {
      type: String,
      enum: ['realtime', 'hourly', 'daily'],
      default: 'realtime'
    },
    categories: [{
      name: { type: String, required: true },
      type: {
        type: String,
        enum: ['individual', 'team'],
        required: true
      },
      sortBy: {
        type: String,
        enum: ['score', 'time', 'accuracy'],
        required: true
      },
      entries: [{
        participantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
        rank: { type: Number, required: true },
        score: { type: Number, required: true },
        completionTime: { type: Number },
        accuracy: { type: Number },
        submittedAt: { type: Date, required: true },
        metadata: { type: Schema.Types.Mixed }
      }]
    }]
  },
  feedback: {
    allowComments: { type: Boolean, default: true },
    allowRatings: { type: Boolean, default: true },
    moderateComments: { type: Boolean, default: false },
    comments: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
      message: { type: String, required: true, maxlength: 1000 },
      rating: { type: Number, min: 1, max: 5 },
      helpful: { type: Number, default: 0 },
      flagged: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }],
    ratings: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      overall: { type: Number, min: 1, max: 5, required: true },
      difficulty: { type: Number, min: 1, max: 5, required: true },
      engagement: { type: Number, min: 1, max: 5, required: true },
      clarity: { type: Number, min: 1, max: 5, required: true },
      fairness: { type: Number, min: 1, max: 5, required: true },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  collaboration: {
    allowTeams: { type: Boolean, default: false },
    teamFormation: {
      type: String,
      enum: ['self_select', 'random', 'instructor_assigned', 'algorithm_matched'],
      default: 'self_select'
    },
    communicationTools: [{
      type: String,
      enum: ['chat', 'video_call', 'shared_workspace', 'file_sharing']
    }],
    sharedWorkspace: {
      enabled: { type: Boolean, default: false },
      features: [{
        type: String,
        enum: ['documents', 'whiteboard', 'code_editor', 'presentation']
      }]
    },
    peerReview: {
      enabled: { type: Boolean, default: false },
      anonymous: { type: Boolean, default: true },
      reviewsPerParticipant: { type: Number, default: 2 },
      reviewDeadline: { type: Date }
    }
  },
  moderation: {
    autoModeration: {
      enabled: { type: Boolean, default: true },
      flaggedKeywords: [{ type: String }],
      contentFilters: [{ type: String }]
    },
    moderators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reports: [{
      reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      reason: { type: String, required: true },
      description: { type: String, required: true },
      status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
      },
      createdAt: { type: Date, default: Date.now },
      resolvedAt: { type: Date },
      resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    }]
  },
  analytics: {
    engagementMetrics: {
      averageTimeSpent: { type: Number, default: 0 },
      pageViews: { type: Number, default: 0 },
      interactionRate: { type: Number, default: 0 },
      returnRate: { type: Number, default: 0 }
    },
    performanceMetrics: {
      averageAttempts: { type: Number, default: 0 },
      taskCompletionRates: [{
        taskId: { type: String, required: true },
        completionRate: { type: Number, required: true },
        averageScore: { type: Number, required: true },
        averageTime: { type: Number, required: true }
      }],
      commonMistakes: [{
        taskId: { type: String, required: true },
        mistake: { type: String, required: true },
        frequency: { type: Number, required: true }
      }]
    },
    learningOutcomes: {
      skillsAssessed: [{ type: String }],
      improvementMeasured: { type: Boolean, default: false },
      preAssessmentScores: [{ type: Number }],
      postAssessmentScores: [{ type: Number }],
      knowledgeRetention: { type: Number, default: 0 }
    },
    socialMetrics: {
      teamCollaboration: { type: Number, default: 0 },
      peerInteractions: { type: Number, default: 0 },
      helpRequests: { type: Number, default: 0 },
      mentoringSessions: { type: Number, default: 0 }
    }
  },
  customization: {
    branding: {
      logo: { type: String },
      colors: {
        primary: { type: String, default: '#007bff' },
        secondary: { type: String, default: '#6c757d' },
        accent: { type: String, default: '#28a745' }
      },
      theme: { type: String, default: 'default' }
    },
    localization: {
      defaultLanguage: { type: String, default: 'en' },
      supportedLanguages: [{ type: String }],
      translations: [{
        language: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        instructions: { type: String, required: true },
        taskTitles: [{ type: String }],
        taskDescriptions: [{ type: String }]
      }]
    },
    adaptiveContent: {
      enabled: { type: Boolean, default: false },
      difficultyAdjustment: { type: Boolean, default: false },
      personalizedHints: { type: Boolean, default: false },
      contentRecommendations: { type: Boolean, default: false }
    }
  },
  metadata: {
    version: { type: String, default: '1.0.0' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    moderatedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true, index: true },
    isPublic: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isPremium: { type: Boolean, default: false },
    tags: [{ type: String, index: true }],
    subjects: [{ type: String }],
    skills: [{ type: String }],
    ageGroups: [{ type: String }],
    changelog: [{
      version: { type: String, required: true },
      changes: [{ type: String }],
      date: { type: Date, default: Date.now },
      author: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    }]
  },
  timestamps: {
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    publishedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    archivedAt: { type: Date }
  }
}, {
  timestamps: false // We handle timestamps manually
});

// Indexes for efficient queries
ChallengeSchema.index({ type: 1, category: 1 });
ChallengeSchema.index({ difficulty: 1, format: 1 });
ChallengeSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
ChallengeSchema.index({ 'metadata.isActive': 1, 'metadata.isPublic': 1 });
ChallengeSchema.index({ 'tracking.popularityScore': -1 });
ChallengeSchema.index({ 'metadata.tags': 1 });
ChallengeSchema.index({ 'participation.currentParticipants': 1 });

// Instance methods
ChallengeSchema.methods.canParticipate = function(userId: ObjectId, gameProfile: any): { 
  canParticipate: boolean; 
  reason?: string;
  requirements?: string[];
} {
  const now = new Date();
  const requirements: string[] = [];

  // Check if challenge is active
  if (!this.metadata.isActive) {
    return { canParticipate: false, reason: 'Challenge is not active' };
  }

  // Check if it's within the registration period
  if (this.schedule.registrationDeadline && now > this.schedule.registrationDeadline) {
    return { canParticipate: false, reason: 'Registration deadline has passed' };
  }

  // Check if challenge has started
  if (now < this.schedule.startDate) {
    return { canParticipate: false, reason: 'Challenge has not started yet' };
  }

  // Check if challenge has ended
  if (now > this.schedule.endDate) {
    return { canParticipate: false, reason: 'Challenge has ended' };
  }

  // Check if user is excluded
  if (this.participation.eligibility.excludeUsers?.includes(userId)) {
    return { canParticipate: false, reason: 'User is excluded from this challenge' };
  }

  // Check prerequisites
  if (this.participation.eligibility.prerequisites) {
    for (const prereqId of this.participation.eligibility.prerequisites) {
      const hasPrereq = gameProfile.achievements.some(
        (achievement: any) => achievement.achievementId.toString() === prereqId.toString() && achievement.completed
      );
      if (!hasPrereq) {
        requirements.push('Missing prerequisite achievements');
      }
    }
  }

  // Check capacity
  if (this.participation.maxParticipants && 
      this.participation.currentParticipants >= this.participation.maxParticipants) {
    if (!this.participation.waitlistEnabled) {
      return { canParticipate: false, reason: 'Challenge is at full capacity' };
    } else {
      return { canParticipate: true, reason: 'Can join waitlist' };
    }
  }

  if (requirements.length > 0) {
    return { canParticipate: false, reason: 'Requirements not met', requirements };
  }

  return { canParticipate: true };
};

ChallengeSchema.methods.addParticipant = function(userId: ObjectId, teamId?: ObjectId): Promise<IChallenge> {
  this.participation.currentParticipants += 1;

  // Update daily participation tracking
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let dailyTrack = this.tracking.participantsByDay.find(
    (entry: any) => entry.date.getTime() === today.getTime()
  );
  
  if (!dailyTrack) {
    dailyTrack = { date: today, registrations: 0, completions: 0 };
    this.tracking.participantsByDay.push(dailyTrack);
  }
  
  dailyTrack.registrations += 1;

  this.tracking.totalParticipants += 1;
  this.timestamps.updatedAt = new Date();
  return this.save();
};

ChallengeSchema.methods.recordCompletion = function(userId: ObjectId, score: number, completionTime: number): Promise<IChallenge> {
  this.tracking.completedParticipants += 1;

  // Update averages
  const totalCompleted = this.tracking.completedParticipants;
  this.tracking.averageScore = ((this.tracking.averageScore * (totalCompleted - 1)) + score) / totalCompleted;
  this.tracking.averageCompletionTime = ((this.tracking.averageCompletionTime * (totalCompleted - 1)) + completionTime) / totalCompleted;

  // Update daily completion tracking
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let dailyTrack = this.tracking.participantsByDay.find(
    (entry: any) => entry.date.getTime() === today.getTime()
  );
  
  if (dailyTrack) {
    dailyTrack.completions += 1;
  }

  // Update dropout rate
  this.tracking.dropoutRate = ((this.tracking.totalParticipants - this.tracking.completedParticipants) / this.tracking.totalParticipants) * 100;

  this.timestamps.updatedAt = new Date();
  return this.save();
};

ChallengeSchema.methods.updateLeaderboard = function(userId: ObjectId, teamId: ObjectId | undefined, score: number, completionTime: number, accuracy?: number): Promise<IChallenge> {
  for (const category of this.leaderboard.categories) {
    // Remove existing entry if exists
    category.entries = category.entries.filter(
      (entry: any) => entry.participantId.toString() !== userId.toString()
    );

    // Add new entry
    const newEntry = {
      participantId: userId,
      teamId,
      rank: 0, // Will be calculated when sorting
      score,
      completionTime,
      accuracy,
      submittedAt: new Date(),
      metadata: {}
    };

    category.entries.push(newEntry);

    // Sort and update ranks
    const sortField = category.sortBy === 'score' ? 'score' : 
                     category.sortBy === 'time' ? 'completionTime' : 'accuracy';
    
    category.entries.sort((a: any, b: any) => {
      if (category.sortBy === 'time') {
        return a[sortField] - b[sortField]; // Faster time is better
      }
      return b[sortField] - a[sortField]; // Higher score/accuracy is better
    });

    // Update ranks
    category.entries.forEach((entry: any, index: number) => {
      entry.rank = index + 1;
    });

    // Keep only top 100
    if (category.entries.length > 100) {
      category.entries = category.entries.slice(0, 100);
    }
  }

  this.timestamps.updatedAt = new Date();
  return this.save();
};

ChallengeSchema.methods.addComment = function(userId: ObjectId, message: string, rating?: number, teamId?: ObjectId): Promise<IChallenge> {
  this.feedback.comments.push({
    userId,
    teamId,
    message,
    rating,
    helpful: 0,
    flagged: false,
    createdAt: new Date()
  });

  // Keep only last 1000 comments
  if (this.feedback.comments.length > 1000) {
    this.feedback.comments = this.feedback.comments.slice(-1000);
  }

  this.timestamps.updatedAt = new Date();
  return this.save();
};

ChallengeSchema.methods.addRating = function(userId: ObjectId, ratings: {
  overall: number;
  difficulty: number;
  engagement: number;
  clarity: number;
  fairness: number;
}): Promise<IChallenge> {
  // Remove existing rating if exists
  this.feedback.ratings = this.feedback.ratings.filter(
    (rating: any) => rating.userId.toString() !== userId.toString()
  );

  this.feedback.ratings.push({
    userId,
    ...ratings,
    createdAt: new Date()
  });

  // Recalculate average ratings
  if (this.feedback.ratings.length > 0) {
    const totals = this.feedback.ratings.reduce((acc: any, rating: any) => ({
      overall: acc.overall + rating.overall,
      difficulty: acc.difficulty + rating.difficulty,
      engagement: acc.engagement + rating.engagement,
      clarity: acc.clarity + rating.clarity,
      fairness: acc.fairness + rating.fairness
    }), { overall: 0, difficulty: 0, engagement: 0, clarity: 0, fairness: 0 });

    const count = this.feedback.ratings.length;
    this.tracking.satisfactionRating = totals.overall / count;
    this.tracking.difficultyRating = totals.difficulty / count;
  }

  this.timestamps.updatedAt = new Date();
  return this.save();
};

ChallengeSchema.methods.incrementViews = function(): Promise<IChallenge> {
  this.tracking.views += 1;
  this.timestamps.updatedAt = new Date();
  return this.save();
};

ChallengeSchema.methods.incrementShares = function(): Promise<IChallenge> {
  this.tracking.shares += 1;
  this.timestamps.updatedAt = new Date();
  return this.save();
};

ChallengeSchema.methods.updateAnalytics = function(analyticsData: any): Promise<IChallenge> {
  Object.assign(this.analytics, analyticsData);
  this.timestamps.updatedAt = new Date();
  return this.save();
};

// Static methods
ChallengeSchema.statics.getActive = function(includePrivate: boolean = false) {
  const query: any = { 
    'metadata.isActive': true,
    'schedule.startDate': { $lte: new Date() },
    'schedule.endDate': { $gte: new Date() }
  };
  
  if (!includePrivate) {
    query['metadata.isPublic'] = true;
  }
  
  return this.find(query)
    .sort({ 'tracking.popularityScore': -1 })
    .populate('metadata.createdBy', 'username firstName lastName');
};

ChallengeSchema.statics.getUpcoming = function(includePrivate: boolean = false) {
  const query: any = { 
    'metadata.isActive': true,
    'schedule.startDate': { $gt: new Date() }
  };
  
  if (!includePrivate) {
    query['metadata.isPublic'] = true;
  }
  
  return this.find(query)
    .sort({ 'schedule.startDate': 1 })
    .populate('metadata.createdBy', 'username firstName lastName');
};

ChallengeSchema.statics.getFeatured = function() {
  return this.find({ 
    'metadata.isFeatured': true, 
    'metadata.isActive': true,
    'metadata.isPublic': true
  })
    .sort({ 'tracking.popularityScore': -1 })
    .limit(10)
    .populate('metadata.createdBy', 'username firstName lastName');
};

ChallengeSchema.statics.getByCategory = function(category: string, includeInactive: boolean = false) {
  const query: any = { category };
  
  if (!includeInactive) {
    query['metadata.isActive'] = true;
    query['metadata.isPublic'] = true;
  }
  
  return this.find(query)
    .sort({ 'tracking.popularityScore': -1 })
    .populate('metadata.createdBy', 'username firstName lastName');
};

ChallengeSchema.statics.searchChallenges = function(searchTerm: string, filters: any = {}) {
  const query: any = {
    'metadata.isActive': true,
    'metadata.isPublic': true,
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { shortDescription: { $regex: searchTerm, $options: 'i' } },
      { 'metadata.tags': { $regex: searchTerm, $options: 'i' } },
      { 'metadata.subjects': { $regex: searchTerm, $options: 'i' } }
    ]
  };

  if (filters.category) query.category = filters.category;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.format) query.format = filters.format;
  if (filters.type) query.type = filters.type;

  return this.find(query)
    .sort({ 'tracking.popularityScore': -1 })
    .populate('metadata.createdBy', 'username firstName lastName');
};

// Pre-save middleware
ChallengeSchema.pre('save', function(next) {
  this.timestamps.updatedAt = new Date();
  
  // Sort tasks by order
  this.tasks.sort((a: any, b: any) => a.order - b.order);
  
  // Calculate popularity score
  this.tracking.popularityScore = (
    this.tracking.views * 0.1 +
    this.tracking.totalParticipants * 2 +
    this.tracking.completedParticipants * 5 +
    this.tracking.shares * 3 +
    this.tracking.satisfactionRating * 10
  );
  
  next();
});

export const Challenge = mongoose.model<IChallenge>('Challenge', ChallengeSchema);