import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ProgressAttributes {
  id: number;
  userId: number;
  activityId: number;
  attempts: string;
  currentStreak: number;
  bestScore: number;
  totalTimeSpent: number;
  firstAttemptDate: Date;
  lastAttemptDate: Date;
  mastery: string;
  achievements: string;
  parentFeedback: string;
  adaptiveData: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressCreationAttributes extends Optional<ProgressAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Progress extends Model<ProgressAttributes, ProgressCreationAttributes> implements ProgressAttributes {
  public id!: number;
  public userId!: number;
  public activityId!: number;
  public attempts!: string;
  public currentStreak!: number;
  public bestScore!: number;
  public totalTimeSpent!: number;
  public firstAttemptDate!: Date;
  public lastAttemptDate!: Date;
  public mastery!: string;
  public achievements!: string;
  public parentFeedback!: string;
  public adaptiveData!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods for JSON fields
  public getAttempts(): any[] {
    try {
      return JSON.parse(this.attempts);
    } catch {
      return [];
    }
  }

  public setAttempts(value: any[]): void {
    this.attempts = JSON.stringify(value);
  }

  public getMastery(): any {
    try {
      return JSON.parse(this.mastery);
    } catch {
      return {
        level: 'not_started',
        confidence: 0,
        lastAssessment: new Date(),
      };
    }
  }

  public setMastery(value: any): void {
    this.mastery = JSON.stringify(value);
  }

  public getAchievements(): any[] {
    try {
      return JSON.parse(this.achievements);
    } catch {
      return [];
    }
  }

  public setAchievements(value: any[]): void {
    this.achievements = JSON.stringify(value);
  }

  public getParentFeedback(): any {
    try {
      return JSON.parse(this.parentFeedback);
    } catch {
      return null;
    }
  }

  public setParentFeedback(value: any): void {
    this.parentFeedback = JSON.stringify(value);
  }

  public getAdaptiveData(): any {
    try {
      return JSON.parse(this.adaptiveData);
    } catch {
      return {
        recommendedDifficulty: 'easy',
        learningStyle: 'mixed',
        preferredPace: 'normal',
        attentionSpan: 10,
        bestTimeOfDay: null,
      };
    }
  }

  public setAdaptiveData(value: any): void {
    this.adaptiveData = JSON.stringify(value);
  }

  // Business logic methods
  public addAttempt(attemptData: any): Promise<Progress> {
    const attempts = this.getAttempts();
    const attemptNumber = attempts.length + 1;
    const attempt = {
      attemptNumber,
      ...attemptData,
      startTime: attemptData.startTime || new Date(),
    };
    
    attempts.push(attempt);
    this.setAttempts(attempts);
    this.lastAttemptDate = new Date();
    
    // Update best score
    if (attempt.score > this.bestScore) {
      this.bestScore = attempt.score;
    }
    
    // Update total time spent
    if (attempt.timeSpent) {
      this.totalTimeSpent += attempt.timeSpent;
    }
    
    // Update mastery level based on recent performance
    this.updateMasteryLevel();
    
    return this.save();
  }

  public updateMasteryLevel(): void {
    const attempts = this.getAttempts();
    const recentAttempts = attempts.slice(-5); // Last 5 attempts
    
    if (recentAttempts.length === 0) return;
    
    const avgScore = recentAttempts.reduce((sum: number, attempt: any) => sum + attempt.score, 0) / recentAttempts.length;
    
    const mastery = this.getMastery();
    let newLevel = mastery.level;
    let confidence = mastery.confidence;
    
    if (avgScore >= 90 && recentAttempts.length >= 3) {
      newLevel = 'mastered';
      confidence = Math.min(100, confidence + 10);
    } else if (avgScore >= 80) {
      newLevel = 'advanced';
      confidence = Math.min(100, confidence + 5);
    } else if (avgScore >= 70) {
      newLevel = 'intermediate';
      confidence = Math.min(100, confidence + 3);
    } else if (avgScore >= 50) {
      newLevel = 'beginner';
      confidence = Math.max(0, confidence - 2);
    } else {
      confidence = Math.max(0, confidence - 5);
    }
    
    this.setMastery({
      level: newLevel,
      confidence: confidence,
      lastAssessment: new Date(),
    });
  }

  public addAchievement(type: string, data?: any): Promise<Progress | boolean> {
    const achievements = this.getAchievements();
    
    // Check if achievement already exists
    const existingAchievement = achievements.find((achievement: any) => achievement.type === type);
    if (existingAchievement) {
      return Promise.resolve(false); // Achievement already earned
    }
    
    achievements.push({
      type,
      earnedAt: new Date(),
      data: data || {},
    });
    
    this.setAchievements(achievements);
    
    return this.save();
  }

  // Static methods
  public static findUserProgress(userId: number): Promise<Progress[]> {
    return this.findAll({
      where: { userId },
      include: ['activity'], // This will be defined when associations are set up
    });
  }

  public static async getProgressSummary(userId: number): Promise<any> {
    const progressRecords = await this.findAll({
      where: { userId },
    });
    
    if (progressRecords.length === 0) {
      return {
        totalActivities: 0,
        completedActivities: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        totalAchievements: 0,
      };
    }
    
    const totalActivities = progressRecords.length;
    const completedActivities = progressRecords.filter(p => p.bestScore > 0).length;
    const totalTimeSpent = progressRecords.reduce((sum, p) => sum + p.totalTimeSpent, 0);
    const averageScore = progressRecords.reduce((sum, p) => sum + p.bestScore, 0) / totalActivities;
    const totalAchievements = progressRecords.reduce((sum, p) => sum + p.getAchievements().length, 0);
    
    return {
      totalActivities,
      completedActivities,
      totalTimeSpent,
      averageScore,
      totalAchievements,
    };
  }
}

Progress.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    activityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'activities',
        key: 'id',
      },
    },
    attempts: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'JSON array of attempt objects',
    },
    currentStreak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    bestScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    totalTimeSpent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
      comment: 'Total time in seconds',
    },
    firstAttemptDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    lastAttemptDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    mastery: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{"level":"not_started","confidence":0,"lastAssessment":"' + new Date().toISOString() + '"}',
      comment: 'JSON object with mastery level data',
    },
    achievements: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      comment: 'JSON array of achievement objects',
    },
    parentFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON object with parent feedback',
    },
    adaptiveData: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{"recommendedDifficulty":"easy","learningStyle":"mixed","preferredPace":"normal","attentionSpan":10,"bestTimeOfDay":null}',
      comment: 'JSON object with adaptive learning data',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Progress',
    tableName: 'progress',
    indexes: [
      { fields: ['userId', 'activityId'], unique: true },
      { fields: ['userId', 'lastAttemptDate'] },
      { fields: ['activityId'] },
      { fields: ['userId'] },
      { fields: ['bestScore'] },
      { fields: ['createdAt'] },
    ],
    hooks: {
      beforeCreate: (progress: Progress) => {
        if (!progress.firstAttemptDate) {
          progress.firstAttemptDate = new Date();
        }
        if (!progress.lastAttemptDate) {
          progress.lastAttemptDate = new Date();
        }
      },
      beforeSave: (progress: Progress) => {
        // Ensure attempts is valid JSON
        try {
          JSON.parse(progress.attempts);
        } catch {
          progress.attempts = '[]';
        }
        
        // Ensure mastery is valid JSON
        try {
          JSON.parse(progress.mastery);
        } catch {
          progress.mastery = '{"level":"not_started","confidence":0,"lastAssessment":"' + new Date().toISOString() + '"}';
        }
        
        // Ensure achievements is valid JSON
        try {
          JSON.parse(progress.achievements);
        } catch {
          progress.achievements = '[]';
        }
        
        // Ensure adaptiveData is valid JSON
        try {
          JSON.parse(progress.adaptiveData);
        } catch {
          progress.adaptiveData = '{"recommendedDifficulty":"easy","learningStyle":"mixed","preferredPace":"normal","attentionSpan":10,"bestTimeOfDay":null}';
        }
      },
    },
  }
);

export default Progress;