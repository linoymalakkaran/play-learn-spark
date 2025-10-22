import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IReport extends Document {
  _id: ObjectId;
  title: string;
  description: string;
  type: 'dashboard' | 'summary' | 'detailed' | 'comparative' | 'predictive' | 'custom';
  category: 'academic' | 'engagement' | 'performance' | 'behavioral' | 'administrative' | 'financial';
  scope: {
    entityType: 'user' | 'class' | 'course' | 'department' | 'institution' | 'system';
    entityIds: ObjectId[];
    includeSubEntities: boolean;
    filters: {
      dateRange: {
        start: Date;
        end: Date;
        timezone: string;
      };
      userRoles: string[];
      departments: string[];
      grades: string[];
      subjects: string[];
      customFilters: Array<{
        field: string;
        operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';
        value: any;
      }>;
    };
  };
  structure: {
    sections: Array<{
      id: string;
      title: string;
      type: 'summary' | 'chart' | 'table' | 'text' | 'metric' | 'insight' | 'recommendation';
      order: number;
      config: {
        chartType?: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'radar' | 'funnel' | 'gauge';
        metrics?: string[];
        groupBy?: string[];
        sortBy?: string;
        limit?: number;
        includeComparisons?: boolean;
        includeTrends?: boolean;
        customQuery?: any;
      };
      visibility: {
        roles: string[];
        departments: string[];
        users: ObjectId[];
      };
    }>;
    layout: {
      template: 'single-column' | 'two-column' | 'grid' | 'dashboard' | 'custom';
      responsive: boolean;
      printFriendly: boolean;
      exportFormats: Array<'pdf' | 'excel' | 'csv' | 'json' | 'html'>;
    };
  };
  data: {
    summary: {
      totalRecords: number;
      dateRange: {
        start: Date;
        end: Date;
      };
      keyMetrics: Array<{
        name: string;
        value: number;
        unit: string;
        change: number;
        changeDirection: 'up' | 'down' | 'stable';
        benchmark: number;
        status: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
      }>;
      highlights: string[];
      concerns: string[];
    };
    sections: Array<{
      sectionId: string;
      title: string;
      data: any;
      insights: Array<{
        type: 'achievement' | 'concern' | 'opportunity' | 'trend' | 'anomaly';
        priority: 'low' | 'medium' | 'high' | 'critical';
        message: string;
        evidence: any[];
        recommendations: string[];
      }>;
      visualizations: Array<{
        type: string;
        title: string;
        data: any;
        config: any;
      }>;
      tables: Array<{
        title: string;
        headers: string[];
        rows: any[][];
        totals?: any[];
        formatting?: any;
      }>;
    }>;
    comparisons: Array<{
      type: 'period' | 'cohort' | 'benchmark' | 'target';
      baseline: {
        label: string;
        data: any;
        period?: string;
      };
      comparison: {
        label: string;
        data: any;
        period?: string;
      };
      analysis: {
        significant: boolean;
        percentChange: number;
        direction: 'improvement' | 'decline' | 'stable';
        factors: string[];
        recommendations: string[];
      };
    }>;
    predictions: Array<{
      metric: string;
      timeframe: string;
      value: number;
      confidence: number;
      factors: string[];
      scenarios: Array<{
        name: string;
        probability: number;
        outcome: any;
      }>;
    }>;
  };
  generation: {
    frequency: 'on-demand' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    schedule: {
      time?: string; // HH:mm format
      dayOfWeek?: number; // 0-6
      dayOfMonth?: number; // 1-31
      timezone: string;
    };
    automation: {
      enabled: boolean;
      conditions: Array<{
        type: 'metric_threshold' | 'date_trigger' | 'event_based' | 'request_based';
        config: any;
      }>;
      notifications: Array<{
        recipients: ObjectId[];
        channels: Array<'email' | 'in-app' | 'sms' | 'webhook'>;
        conditions: string[];
      }>;
    };
    processing: {
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
      startedAt?: Date;
      completedAt?: Date;
      progress: number; // percentage
      errors: Array<{
        section: string;
        message: string;
        details: any;
        timestamp: Date;
      }>;
      performance: {
        executionTime: number; // milliseconds
        dataPointsProcessed: number;
        queriesExecuted: number;
        memoryUsed: number; // bytes
      };
    };
  };
  access: {
    visibility: 'public' | 'private' | 'restricted' | 'confidential';
    owner: ObjectId;
    collaborators: Array<{
      userId: ObjectId;
      role: 'viewer' | 'editor' | 'admin';
      permissions: string[];
      addedAt: Date;
      addedBy: ObjectId;
    }>;
    sharing: {
      enabled: boolean;
      publicLink?: string;
      linkExpiry?: Date;
      allowComments: boolean;
      allowDownload: boolean;
      passwordProtected: boolean;
      downloadCount: number;
      viewCount: number;
    };
    departments: string[];
    roles: string[];
    securityLevel: 'low' | 'medium' | 'high' | 'restricted';
  };
  versions: Array<{
    version: string;
    createdAt: Date;
    createdBy: ObjectId;
    changes: string[];
    dataSnapshot: any;
    archived: boolean;
  }>;
  metadata: {
    tags: string[];
    customFields: Array<{
      name: string;
      value: any;
      type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
    }>;
    source: {
      system: string;
      version: string;
      dataQuality: {
        completeness: number;
        accuracy: number;
        timeliness: number;
        consistency: number;
      };
    };
    compliance: {
      regulations: string[];
      retentionPeriod: number; // days
      sensitiveData: boolean;
      encryptionRequired: boolean;
      auditTrail: Array<{
        action: string;
        userId: ObjectId;
        timestamp: Date;
        details: any;
      }>;
    };
  };
  feedback: Array<{
    userId: ObjectId;
    rating: number; // 1-5 stars
    comment: string;
    helpful: boolean;
    suggestions: string[];
    submittedAt: Date;
  }>;
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    lastGenerated: Date;
    nextGeneration?: Date;
    archivedAt?: Date;
    deletedAt?: Date;
  };
}

const ReportSchema = new Schema<IReport>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['dashboard', 'summary', 'detailed', 'comparative', 'predictive', 'custom'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['academic', 'engagement', 'performance', 'behavioral', 'administrative', 'financial'],
    required: true,
    index: true
  },
  scope: {
    entityType: {
      type: String,
      enum: ['user', 'class', 'course', 'department', 'institution', 'system'],
      required: true
    },
    entityIds: [{ type: Schema.Types.ObjectId }],
    includeSubEntities: { type: Boolean, default: false },
    filters: {
      dateRange: {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        timezone: { type: String, default: 'UTC' }
      },
      userRoles: [{ type: String }],
      departments: [{ type: String }],
      grades: [{ type: String }],
      subjects: [{ type: String }],
      customFilters: [{
        field: { type: String, required: true },
        operator: {
          type: String,
          enum: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'in', 'nin', 'contains'],
          required: true
        },
        value: { type: Schema.Types.Mixed, required: true }
      }]
    }
  },
  structure: {
    sections: [{
      id: { type: String, required: true },
      title: { type: String, required: true },
      type: {
        type: String,
        enum: ['summary', 'chart', 'table', 'text', 'metric', 'insight', 'recommendation'],
        required: true
      },
      order: { type: Number, required: true },
      config: {
        chartType: {
          type: String,
          enum: ['line', 'bar', 'pie', 'scatter', 'heatmap', 'radar', 'funnel', 'gauge']
        },
        metrics: [{ type: String }],
        groupBy: [{ type: String }],
        sortBy: { type: String },
        limit: { type: Number },
        includeComparisons: { type: Boolean, default: false },
        includeTrends: { type: Boolean, default: false },
        customQuery: { type: Schema.Types.Mixed }
      },
      visibility: {
        roles: [{ type: String }],
        departments: [{ type: String }],
        users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
      }
    }],
    layout: {
      template: {
        type: String,
        enum: ['single-column', 'two-column', 'grid', 'dashboard', 'custom'],
        default: 'single-column'
      },
      responsive: { type: Boolean, default: true },
      printFriendly: { type: Boolean, default: true },
      exportFormats: [{
        type: String,
        enum: ['pdf', 'excel', 'csv', 'json', 'html']
      }]
    }
  },
  data: {
    summary: {
      totalRecords: { type: Number, default: 0 },
      dateRange: {
        start: { type: Date },
        end: { type: Date }
      },
      keyMetrics: [{
        name: { type: String, required: true },
        value: { type: Number, required: true },
        unit: { type: String, required: true },
        change: { type: Number, default: 0 },
        changeDirection: {
          type: String,
          enum: ['up', 'down', 'stable'],
          default: 'stable'
        },
        benchmark: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ['excellent', 'good', 'average', 'poor', 'critical'],
          default: 'average'
        }
      }],
      highlights: [{ type: String }],
      concerns: [{ type: String }]
    },
    sections: [{
      sectionId: { type: String, required: true },
      title: { type: String, required: true },
      data: { type: Schema.Types.Mixed },
      insights: [{
        type: {
          type: String,
          enum: ['achievement', 'concern', 'opportunity', 'trend', 'anomaly'],
          required: true
        },
        priority: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical'],
          required: true
        },
        message: { type: String, required: true },
        evidence: [{ type: Schema.Types.Mixed }],
        recommendations: [{ type: String }]
      }],
      visualizations: [{
        type: { type: String, required: true },
        title: { type: String, required: true },
        data: { type: Schema.Types.Mixed },
        config: { type: Schema.Types.Mixed }
      }],
      tables: [{
        title: { type: String, required: true },
        headers: [{ type: String }],
        rows: [[{ type: Schema.Types.Mixed }]],
        totals: [{ type: Schema.Types.Mixed }],
        formatting: { type: Schema.Types.Mixed }
      }]
    }],
    comparisons: [{
      type: {
        type: String,
        enum: ['period', 'cohort', 'benchmark', 'target'],
        required: true
      },
      baseline: {
        label: { type: String, required: true },
        data: { type: Schema.Types.Mixed, required: true },
        period: { type: String }
      },
      comparison: {
        label: { type: String, required: true },
        data: { type: Schema.Types.Mixed, required: true },
        period: { type: String }
      },
      analysis: {
        significant: { type: Boolean, required: true },
        percentChange: { type: Number, required: true },
        direction: {
          type: String,
          enum: ['improvement', 'decline', 'stable'],
          required: true
        },
        factors: [{ type: String }],
        recommendations: [{ type: String }]
      }
    }],
    predictions: [{
      metric: { type: String, required: true },
      timeframe: { type: String, required: true },
      value: { type: Number, required: true },
      confidence: { type: Number, required: true },
      factors: [{ type: String }],
      scenarios: [{
        name: { type: String, required: true },
        probability: { type: Number, required: true },
        outcome: { type: Schema.Types.Mixed, required: true }
      }]
    }]
  },
  generation: {
    frequency: {
      type: String,
      enum: ['on-demand', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'on-demand'
    },
    schedule: {
      time: { type: String }, // HH:mm format
      dayOfWeek: { type: Number, min: 0, max: 6 },
      dayOfMonth: { type: Number, min: 1, max: 31 },
      timezone: { type: String, default: 'UTC' }
    },
    automation: {
      enabled: { type: Boolean, default: false },
      conditions: [{
        type: {
          type: String,
          enum: ['metric_threshold', 'date_trigger', 'event_based', 'request_based'],
          required: true
        },
        config: { type: Schema.Types.Mixed, required: true }
      }],
      notifications: [{
        recipients: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
        channels: [{
          type: String,
          enum: ['email', 'in-app', 'sms', 'webhook'],
          required: true
        }],
        conditions: [{ type: String }]
      }]
    },
    processing: {
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending',
        index: true
      },
      startedAt: { type: Date },
      completedAt: { type: Date },
      progress: { type: Number, default: 0, min: 0, max: 100 },
      errors: [{
        section: { type: String, required: true },
        message: { type: String, required: true },
        details: { type: Schema.Types.Mixed },
        timestamp: { type: Date, default: Date.now }
      }],
      performance: {
        executionTime: { type: Number, default: 0 },
        dataPointsProcessed: { type: Number, default: 0 },
        queriesExecuted: { type: Number, default: 0 },
        memoryUsed: { type: Number, default: 0 }
      }
    }
  },
  access: {
    visibility: {
      type: String,
      enum: ['public', 'private', 'restricted', 'confidential'],
      default: 'private',
      index: true
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    collaborators: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      role: {
        type: String,
        enum: ['viewer', 'editor', 'admin'],
        required: true
      },
      permissions: [{ type: String }],
      addedAt: { type: Date, default: Date.now },
      addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    }],
    sharing: {
      enabled: { type: Boolean, default: false },
      publicLink: { type: String },
      linkExpiry: { type: Date },
      allowComments: { type: Boolean, default: false },
      allowDownload: { type: Boolean, default: false },
      passwordProtected: { type: Boolean, default: false },
      downloadCount: { type: Number, default: 0 },
      viewCount: { type: Number, default: 0 }
    },
    departments: [{ type: String }],
    roles: [{ type: String }],
    securityLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'restricted'],
      default: 'medium'
    }
  },
  versions: [{
    version: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changes: [{ type: String }],
    dataSnapshot: { type: Schema.Types.Mixed },
    archived: { type: Boolean, default: false }
  }],
  metadata: {
    tags: [{ type: String }],
    customFields: [{
      name: { type: String, required: true },
      value: { type: Schema.Types.Mixed, required: true },
      type: {
        type: String,
        enum: ['string', 'number', 'boolean', 'date', 'array', 'object'],
        required: true
      }
    }],
    source: {
      system: { type: String, required: true },
      version: { type: String, required: true },
      dataQuality: {
        completeness: { type: Number, default: 100 },
        accuracy: { type: Number, default: 100 },
        timeliness: { type: Number, default: 100 },
        consistency: { type: Number, default: 100 }
      }
    },
    compliance: {
      regulations: [{ type: String }],
      retentionPeriod: { type: Number, default: 2555 }, // 7 years in days
      sensitiveData: { type: Boolean, default: false },
      encryptionRequired: { type: Boolean, default: false },
      auditTrail: [{
        action: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        timestamp: { type: Date, default: Date.now },
        details: { type: Schema.Types.Mixed }
      }]
    }
  },
  feedback: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
    helpful: { type: Boolean, default: false },
    suggestions: [{ type: String }],
    submittedAt: { type: Date, default: Date.now }
  }],
  timestamps: {
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    lastGenerated: { type: Date },
    nextGeneration: { type: Date, index: true },
    archivedAt: { type: Date },
    deletedAt: { type: Date }
  }
}, {
  timestamps: false // We handle timestamps manually
});

// Compound indexes
ReportSchema.index({ type: 1, category: 1, 'timestamps.createdAt': -1 });
ReportSchema.index({ 'access.owner': 1, 'access.visibility': 1 });
ReportSchema.index({ 'scope.entityType': 1, 'scope.entityIds': 1 });
ReportSchema.index({ 'generation.frequency': 1, 'timestamps.nextGeneration': 1 });
ReportSchema.index({ 'metadata.tags': 1 });

// Instance methods
ReportSchema.methods.addCollaborator = function(
  userId: ObjectId,
  role: 'viewer' | 'editor' | 'admin',
  addedBy: ObjectId,
  permissions: string[] = []
): Promise<IReport> {
  // Remove existing collaborator
  this.access.collaborators = this.access.collaborators.filter(
    (collab: any) => collab.userId.toString() !== userId.toString()
  );
  
  // Add new collaborator
  this.access.collaborators.push({
    userId,
    role,
    permissions,
    addedAt: new Date(),
    addedBy
  });
  
  // Add audit trail entry
  this.metadata.compliance.auditTrail.push({
    action: `Added collaborator with role: ${role}`,
    userId: addedBy,
    timestamp: new Date(),
    details: { collaboratorId: userId, role, permissions }
  });
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

ReportSchema.methods.generateData = async function(): Promise<void> {
  this.generation.processing.status = 'processing';
  this.generation.processing.startedAt = new Date();
  this.generation.processing.progress = 0;
  
  try {
    // Mock data generation - in real implementation, this would query actual data
    const startTime = Date.now();
    
    // Update progress
    this.generation.processing.progress = 25;
    await this.save();
    
    // Generate summary data
    this.data.summary = {
      totalRecords: Math.floor(Math.random() * 1000) + 100,
      dateRange: {
        start: this.scope.filters.dateRange.start,
        end: this.scope.filters.dateRange.end
      },
      keyMetrics: [
        {
          name: 'Average Score',
          value: 85.6,
          unit: '%',
          change: 2.3,
          changeDirection: 'up',
          benchmark: 83.0,
          status: 'good'
        },
        {
          name: 'Completion Rate',
          value: 92.1,
          unit: '%',
          change: -1.2,
          changeDirection: 'down',
          benchmark: 95.0,
          status: 'average'
        }
      ],
      highlights: [
        'Student engagement increased by 15% this quarter',
        'Assignment completion rates remain consistently high'
      ],
      concerns: [
        'Science subject scores showing decline trend',
        'Weekend activity participation is low'
      ]
    };
    
    this.generation.processing.progress = 75;
    await this.save();
    
    // Generate section data for each configured section
    this.data.sections = this.structure.sections.map((section: any) => ({
      sectionId: section.id,
      title: section.title,
      data: { mockData: 'Generated based on section configuration' },
      insights: [],
      visualizations: [],
      tables: []
    }));
    
    this.generation.processing.progress = 100;
    this.generation.processing.status = 'completed';
    this.generation.processing.completedAt = new Date();
    this.generation.processing.performance = {
      executionTime: Date.now() - startTime,
      dataPointsProcessed: this.data.summary.totalRecords,
      queriesExecuted: this.structure.sections.length + 2,
      memoryUsed: 1024 * 1024 // 1MB mock
    };
    
    this.timestamps.lastGenerated = new Date();
    
    // Schedule next generation if automated
    if (this.generation.automation.enabled && this.generation.frequency !== 'on-demand') {
      this.scheduleNextGeneration();
    }
    
    await this.save();
    
  } catch (error) {
    this.generation.processing.status = 'failed';
    this.generation.processing.errors.push({
      section: 'general',
      message: (error as Error).message,
      details: error,
      timestamp: new Date()
    });
    await this.save();
    throw error;
  }
};

ReportSchema.methods.scheduleNextGeneration = function(): void {
  const now = new Date();
  let nextGeneration = new Date(now);
  
  switch (this.generation.frequency) {
    case 'daily':
      nextGeneration.setDate(now.getDate() + 1);
      if (this.generation.schedule.time) {
        const [hours, minutes] = this.generation.schedule.time.split(':');
        nextGeneration.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      break;
      
    case 'weekly':
      const daysUntilNext = (7 - now.getDay() + (this.generation.schedule.dayOfWeek || 0)) % 7 || 7;
      nextGeneration.setDate(now.getDate() + daysUntilNext);
      if (this.generation.schedule.time) {
        const [hours, minutes] = this.generation.schedule.time.split(':');
        nextGeneration.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      break;
      
    case 'monthly':
      const targetDay = this.generation.schedule.dayOfMonth || 1;
      nextGeneration.setMonth(now.getMonth() + 1, targetDay);
      if (this.generation.schedule.time) {
        const [hours, minutes] = this.generation.schedule.time.split(':');
        nextGeneration.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      break;
      
    case 'quarterly':
      nextGeneration.setMonth(now.getMonth() + 3, 1);
      break;
      
    case 'yearly':
      nextGeneration.setFullYear(now.getFullYear() + 1, 0, 1);
      break;
  }
  
  this.timestamps.nextGeneration = nextGeneration;
};

ReportSchema.methods.addFeedback = function(
  userId: ObjectId,
  rating: number,
  comment: string,
  helpful: boolean = false,
  suggestions: string[] = []
): Promise<IReport> {
  // Remove existing feedback from this user
  this.feedback = this.feedback.filter(
    (fb: any) => fb.userId.toString() !== userId.toString()
  );
  
  // Add new feedback
  this.feedback.push({
    userId,
    rating,
    comment,
    helpful,
    suggestions,
    submittedAt: new Date()
  });
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

ReportSchema.methods.exportData = function(format: 'pdf' | 'excel' | 'csv' | 'json' | 'html'): any {
  // Increment download count
  this.access.sharing.downloadCount += 1;
  
  // Add audit trail
  this.metadata.compliance.auditTrail.push({
    action: `Exported report in ${format} format`,
    userId: this.access.owner,
    timestamp: new Date(),
    details: { format }
  });
  
  // Return formatted data based on format
  switch (format) {
    case 'json':
      return JSON.stringify(this.toObject(), null, 2);
    case 'csv':
      return this.convertToCSV();
    case 'html':
      return this.generateHTML();
    default:
      return this.data;
  }
};

ReportSchema.methods.convertToCSV = function(): string {
  const csvRows: string[] = [];
  
  // Add summary metrics
  csvRows.push('Metric,Value,Unit,Change,Status');
  this.data.summary.keyMetrics.forEach((metric: any) => {
    csvRows.push(`${metric.name},${metric.value},${metric.unit},${metric.change},${metric.status}`);
  });
  
  return csvRows.join('\n');
};

ReportSchema.methods.generateHTML = function(): string {
  return `
    <html>
      <head>
        <title>${this.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { border-bottom: 2px solid #333; padding-bottom: 10px; }
          .metric { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
          .good { background-color: #d4edda; }
          .average { background-color: #fff3cd; }
          .poor { background-color: #f8d7da; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${this.title}</h1>
          <p>${this.description}</p>
        </div>
        <div class="content">
          <h2>Key Metrics</h2>
          ${this.data.summary.keyMetrics.map((metric: any) => `
            <div class="metric ${metric.status}">
              <strong>${metric.name}:</strong> ${metric.value}${metric.unit}
              <span style="color: ${metric.changeDirection === 'up' ? 'green' : metric.changeDirection === 'down' ? 'red' : 'gray'}">
                (${metric.change > 0 ? '+' : ''}${metric.change}%)
              </span>
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `;
};

ReportSchema.methods.createVersion = function(changes: string[], createdBy: ObjectId): Promise<IReport> {
  const currentVersion = this.versions.length > 0 ? 
    parseFloat(this.versions[this.versions.length - 1].version) + 0.1 :
    1.0;
  
  this.versions.push({
    version: currentVersion.toFixed(1),
    createdAt: new Date(),
    createdBy,
    changes,
    dataSnapshot: JSON.parse(JSON.stringify(this.data)),
    archived: false
  });
  
  // Keep only last 10 versions
  if (this.versions.length > 10) {
    this.versions = this.versions.slice(-10);
  }
  
  this.timestamps.updatedAt = new Date();
  return this.save();
};

// Static methods
ReportSchema.statics.getByCategory = function(
  category: string,
  userId?: ObjectId,
  departments?: string[]
) {
  const query: any = { category };
  
  if (userId) {
    query.$or = [
      { 'access.owner': userId },
      { 'access.collaborators.userId': userId },
      { 'access.visibility': 'public' }
    ];
  }
  
  if (departments && departments.length > 0) {
    query['access.departments'] = { $in: departments };
  }
  
  return this.find(query)
    .sort({ 'timestamps.updatedAt': -1 })
    .populate('access.owner', 'username firstName lastName')
    .populate('access.collaborators.userId', 'username firstName lastName');
};

ReportSchema.statics.getScheduledReports = function(date: Date = new Date()) {
  return this.find({
    'generation.automation.enabled': true,
    'timestamps.nextGeneration': { $lte: date },
    'generation.processing.status': { $ne: 'processing' }
  });
};

ReportSchema.statics.getUserReports = function(userId: ObjectId, includeShared: boolean = true) {
  const query: any = {
    $or: [
      { 'access.owner': userId }
    ]
  };
  
  if (includeShared) {
    query.$or.push(
      { 'access.collaborators.userId': userId },
      { 'access.visibility': 'public' }
    );
  }
  
  return this.find(query)
    .sort({ 'timestamps.updatedAt': -1 })
    .populate('access.owner', 'username firstName lastName');
};

ReportSchema.statics.searchReports = function(
  searchTerm: string,
  filters: any = {},
  userId?: ObjectId
) {
  const query: any = {
    $and: [
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { 'metadata.tags': { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  };
  
  // Apply filters
  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.dateRange) {
    query['timestamps.createdAt'] = {
      $gte: filters.dateRange.start,
      $lte: filters.dateRange.end
    };
  }
  
  // Apply access control
  if (userId) {
    query.$and.push({
      $or: [
        { 'access.owner': userId },
        { 'access.collaborators.userId': userId },
        { 'access.visibility': 'public' }
      ]
    });
  }
  
  return this.find(query)
    .sort({ 'timestamps.updatedAt': -1 })
    .populate('access.owner', 'username firstName lastName');
};

ReportSchema.statics.cleanupExpiredReports = function() {
  const now = new Date();
  
  return this.deleteMany({
    'timestamps.deletedAt': { $lt: now },
    'metadata.compliance.retentionPeriod': { 
      $lt: Math.floor((now.getTime() - this.timestamps.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    }
  });
};

// Pre-save middleware
ReportSchema.pre('save', function(next) {
  this.timestamps.updatedAt = new Date();
  
  // Generate public link if sharing is enabled and no link exists
  if (this.access.sharing.enabled && !this.access.sharing.publicLink) {
    this.access.sharing.publicLink = `report_${this._id}_${Date.now()}`;
  }
  
  next();
});

export const Report = mongoose.model<IReport>('Report', ReportSchema);