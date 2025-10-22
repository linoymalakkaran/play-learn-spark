import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IActivityVersion extends Document {
  _id: ObjectId;
  activityId: ObjectId;
  version: {
    major: number;
    minor: number;
    patch: number;
    label?: string;
  };
  changes: {
    type: 'major' | 'minor' | 'patch' | 'hotfix';
    description: string;
    changedFields: string[];
    changelog: Array<{
      field: string;
      oldValue: any;
      newValue: any;
      reason?: string;
    }>;
  };
  snapshot: any; // Complete activity data snapshot
  creator: {
    userId: ObjectId;
    name: string;
  };
  approval: {
    required: boolean;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: ObjectId;
    approvedAt?: Date;
    rejectionReason?: string;
  };
  metadata: {
    size: number; // Size of the snapshot in bytes
    checksum: string; // MD5 hash for integrity
    compressed: boolean;
    migrationRequired: boolean;
  };
  timestamps: {
    createdAt: Date;
    publishedAt?: Date;
    deprecatedAt?: Date;
  };

  // Methods
  generateChecksum(): string;
  restoreVersion(): Promise<any>;
  compareWith(otherVersion: IActivityVersion): any;
  generateDiff(targetVersion?: IActivityVersion): any;
}

const activityVersionSchema = new Schema<IActivityVersion>({
  activityId: {
    type: Schema.Types.ObjectId,
    ref: 'Activity',
    required: true,
    index: true
  },
  version: {
    major: { type: Number, required: true, min: 0 },
    minor: { type: Number, required: true, min: 0 },
    patch: { type: Number, required: true, min: 0 },
    label: { type: String, trim: true }
  },
  changes: {
    type: {
      type: String,
      required: true,
      enum: ['major', 'minor', 'patch', 'hotfix']
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000
    },
    changedFields: {
      type: [String],
      required: true
    },
    changelog: [{
      field: { type: String, required: true },
      oldValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed,
      reason: String
    }]
  },
  snapshot: {
    type: Schema.Types.Mixed,
    required: true
  },
  creator: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  approval: {
    required: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: String
  },
  metadata: {
    size: { type: Number, required: true },
    checksum: { type: String, required: true },
    compressed: { type: Boolean, default: false },
    migrationRequired: { type: Boolean, default: false }
  },
  timestamps: {
    createdAt: { type: Date, default: Date.now },
    publishedAt: Date,
    deprecatedAt: Date
  }
}, {
  timestamps: false
});

// Compound indexes
activityVersionSchema.index({ activityId: 1, 'version.major': -1, 'version.minor': -1, 'version.patch': -1 });
activityVersionSchema.index({ 'creator.userId': 1, 'timestamps.createdAt': -1 });
activityVersionSchema.index({ 'approval.status': 1, 'approval.required': 1 });
activityVersionSchema.index({ 'changes.type': 1, 'timestamps.createdAt': -1 });

// Instance methods
activityVersionSchema.methods.generateChecksum = function(): string {
  const crypto = require('crypto');
  const snapshotString = JSON.stringify(this.snapshot);
  return crypto.createHash('md5').update(snapshotString).digest('hex');
};

activityVersionSchema.methods.restoreVersion = async function(): Promise<any> {
  const ActivityMongo = require('./ActivityMongo').ActivityMongo;
  
  try {
    // Find the current activity
    const currentActivity = await ActivityMongo.findById(this.activityId);
    if (!currentActivity) {
      throw new Error('Activity not found');
    }

    // Create a backup of current version before restoring
    const backupVersion = new ActivityVersion({
      activityId: this.activityId,
      version: currentActivity.version,
      changes: {
        type: 'major',
        description: 'Automatic backup before version restore',
        changedFields: ['all'],
        changelog: [{
          field: 'all',
          oldValue: currentActivity.toObject(),
          newValue: null,
          reason: 'Version restore operation'
        }]
      },
      snapshot: currentActivity.toObject(),
      creator: {
        userId: this.creator.userId,
        name: this.creator.name
      },
      metadata: {
        size: JSON.stringify(currentActivity.toObject()).length,
        checksum: this.generateChecksum(),
        compressed: false,
        migrationRequired: false
      }
    });

    await backupVersion.save();

    // Restore the snapshot data
    const restoredData = { ...this.snapshot };
    restoredData.version = {
      major: this.version.major,
      minor: this.version.minor,
      patch: this.version.patch + 1, // Increment patch for the restore
      label: 'restored'
    };
    restoredData.timestamps.updatedAt = new Date();

    // Update the activity
    await ActivityMongo.findByIdAndUpdate(this.activityId, restoredData);

    return restoredData;
  } catch (error: any) {
    throw new Error(`Failed to restore version: ${error.message}`);
  }
};

activityVersionSchema.methods.compareWith = function(otherVersion: IActivityVersion): any {
  const diff = {
    versionDiff: {
      current: this.version,
      other: otherVersion.version
    },
    changes: [] as any[],
    summary: {
      fieldsChanged: 0,
      majorChanges: 0,
      minorChanges: 0
    }
  };

  // Compare snapshots
  const currentSnapshot = this.snapshot;
  const otherSnapshot = otherVersion.snapshot;

  const compareObjects = (obj1: any, obj2: any, path: string = '') => {
    for (const key in obj1) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!(key in obj2)) {
        diff.changes.push({
          field: currentPath,
          type: 'removed',
          oldValue: obj1[key],
          newValue: undefined
        });
        diff.summary.fieldsChanged++;
      } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
        if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
          compareObjects(obj1[key], obj2[key], currentPath);
        }
      } else if (obj1[key] !== obj2[key]) {
        diff.changes.push({
          field: currentPath,
          type: 'modified',
          oldValue: obj1[key],
          newValue: obj2[key]
        });
        diff.summary.fieldsChanged++;
        
        // Determine if it's a major or minor change
        if (['title', 'category', 'contentType', 'difficulty'].includes(key)) {
          diff.summary.majorChanges++;
        } else {
          diff.summary.minorChanges++;
        }
      }
    }

    // Check for new fields
    for (const key in obj2) {
      if (!(key in obj1)) {
        const currentPath = path ? `${path}.${key}` : key;
        diff.changes.push({
          field: currentPath,
          type: 'added',
          oldValue: undefined,
          newValue: obj2[key]
        });
        diff.summary.fieldsChanged++;
      }
    }
  };

  compareObjects(currentSnapshot, otherSnapshot);

  return diff;
};

activityVersionSchema.methods.generateDiff = function(targetVersion?: IActivityVersion): any {
  if (!targetVersion) {
    // Generate diff against latest version
    return {
      changes: this.changes.changelog,
      summary: {
        version: this.version,
        changeType: this.changes.type,
        description: this.changes.description,
        fieldsChanged: this.changes.changedFields.length
      }
    };
  }

  return this.compareWith(targetVersion);
};

// Static methods
activityVersionSchema.statics.findByActivity = function(activityId: ObjectId, limit?: number) {
  const query = this.find({ activityId })
    .sort({ 'version.major': -1, 'version.minor': -1, 'version.patch': -1 });
  
  if (limit) {
    query.limit(limit);
  }
  
  return query;
};

activityVersionSchema.statics.findLatestVersion = function(activityId: ObjectId) {
  return this.findOne({ activityId })
    .sort({ 'version.major': -1, 'version.minor': -1, 'version.patch': -1 });
};

activityVersionSchema.statics.findByVersionString = function(activityId: ObjectId, versionString: string) {
  const [major, minor, patch] = versionString.split('.').map(Number);
  return this.findOne({
    activityId,
    'version.major': major,
    'version.minor': minor,
    'version.patch': patch
  });
};

activityVersionSchema.statics.getPendingApprovals = function(userId?: ObjectId) {
  const query: any = {
    'approval.required': true,
    'approval.status': 'pending'
  };
  
  if (userId) {
    query['creator.userId'] = userId;
  }
  
  return this.find(query)
    .sort({ 'timestamps.createdAt': -1 })
    .populate('activityId', 'title category')
    .populate('creator.userId', 'profile.firstName profile.lastName');
};

activityVersionSchema.statics.getVersionHistory = function(activityId: ObjectId, includeSnapshots: boolean = false) {
  const projection = includeSnapshots ? {} : { snapshot: 0 };
  
  return this.find({ activityId }, projection)
    .sort({ 'version.major': -1, 'version.minor': -1, 'version.patch': -1 })
    .populate('creator.userId', 'profile.firstName profile.lastName')
    .populate('approval.approvedBy', 'profile.firstName profile.lastName');
};

// Pre-save middleware
activityVersionSchema.pre('save', function(next) {
  // Generate checksum if not provided
  if (!this.metadata.checksum) {
    this.metadata.checksum = this.generateChecksum();
  }
  
  // Calculate size if not provided
  if (!this.metadata.size) {
    this.metadata.size = JSON.stringify(this.snapshot).length;
  }
  
  next();
});

// Post-save middleware for cleanup
activityVersionSchema.post('save', async function(doc) {
  // Keep only the last 10 versions per activity (configurable)
  const MAX_VERSIONS = process.env.MAX_ACTIVITY_VERSIONS ? parseInt(process.env.MAX_ACTIVITY_VERSIONS) : 10;
  
  const versions = await ActivityVersion.find({ activityId: doc.activityId })
    .sort({ 'version.major': -1, 'version.minor': -1, 'version.patch': -1 })
    .select('_id');
  
  if (versions.length > MAX_VERSIONS) {
    const versionsToDelete = versions.slice(MAX_VERSIONS);
    await ActivityVersion.deleteMany({
      _id: { $in: versionsToDelete.map(v => v._id) }
    });
  }
});

export const ActivityVersion = model<IActivityVersion>('ActivityVersion', activityVersionSchema);