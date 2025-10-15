import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database-sqlite';

export interface ActivityAttributes {
  id: number;
  title: string;
  description: string;
  category: 'alphabet' | 'numbers' | 'shapes' | 'colors' | 'animals' | 'nature' | 'music' | 'art' | 'language';
  subcategory?: string;
  language: 'en' | 'ar' | 'ml' | 'es' | 'fr';
  difficulty: 'easy' | 'medium' | 'hard';
  ageMin: number;
  ageMax: number;
  contentType: 'interactive' | 'video' | 'audio' | 'game' | 'quiz' | 'story';
  contentData: string;
  contentAssets: string;
  objectives: string;
  instructions: string;
  duration: number;
  points: number;
  prerequisites: string;
  aiGenerated: boolean;
  aiProvider?: 'openai' | 'anthropic' | 'huggingface';
  version: string;
  tags: string;
  popularity: number;
  rating: number;
  reviewCount: number;
  status: 'draft' | 'review' | 'published' | 'archived';
  creatorType: 'ai' | 'educator' | 'admin';
  creatorId?: number;
  creatorName?: string;
  totalPlays: number;
  averageCompletionTime: number;
  successRate: number;
  lastPlayed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityCreationAttributes extends Optional<ActivityAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Activity extends Model<ActivityAttributes, ActivityCreationAttributes> implements ActivityAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public category!: 'alphabet' | 'numbers' | 'shapes' | 'colors' | 'animals' | 'nature' | 'music' | 'art' | 'language';
  public subcategory?: string;
  public language!: 'en' | 'ar' | 'ml' | 'es' | 'fr';
  public difficulty!: 'easy' | 'medium' | 'hard';
  public ageMin!: number;
  public ageMax!: number;
  public contentType!: 'interactive' | 'video' | 'audio' | 'game' | 'quiz' | 'story';
  public contentData!: string;
  public contentAssets!: string;
  public objectives!: string;
  public instructions!: string;
  public duration!: number;
  public points!: number;
  public prerequisites!: string;
  public aiGenerated!: boolean;
  public aiProvider?: 'openai' | 'anthropic' | 'huggingface';
  public version!: string;
  public tags!: string;
  public popularity!: number;
  public rating!: number;
  public reviewCount!: number;
  public status!: 'draft' | 'review' | 'published' | 'archived';
  public creatorType!: 'ai' | 'educator' | 'admin';
  public creatorId?: number;
  public creatorName?: string;
  public totalPlays!: number;
  public averageCompletionTime!: number;
  public successRate!: number;
  public lastPlayed!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Activity.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('alphabet', 'numbers', 'shapes', 'colors', 'animals', 'nature', 'music', 'art', 'language'),
      allowNull: false,
    },
    subcategory: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    language: {
      type: DataTypes.ENUM('en', 'ar', 'ml', 'es', 'fr'),
      allowNull: false,
      defaultValue: 'en',
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: false,
    },
    ageMin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 3,
        max: 12,
      },
    },
    ageMax: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 3,
        max: 12,
      },
    },
    contentType: {
      type: DataTypes.ENUM('interactive', 'video', 'audio', 'game', 'quiz', 'story'),
      allowNull: false,
    },
    contentData: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const value = this.getDataValue('contentData');
        return value ? JSON.parse(value) : {};
      },
      set(value: any) {
        this.setDataValue('contentData', JSON.stringify(value));
      },
    },
    contentAssets: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{"images":[],"audio":[],"videos":[]}',
      get() {
        const value = this.getDataValue('contentAssets');
        return value ? JSON.parse(value) : { images: [], audio: [], videos: [] };
      },
      set(value: any) {
        this.setDataValue('contentAssets', JSON.stringify(value));
      },
    },
    objectives: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const value = this.getDataValue('objectives');
        return value ? JSON.parse(value) : [];
      },
      set(value: string[]) {
        this.setDataValue('objectives', JSON.stringify(value));
      },
    },
    instructions: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 60,
      },
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 100,
      },
    },
    prerequisites: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const value = this.getDataValue('prerequisites');
        return value ? JSON.parse(value) : [];
      },
      set(value: number[]) {
        this.setDataValue('prerequisites', JSON.stringify(value));
      },
    },
    aiGenerated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    aiProvider: {
      type: DataTypes.ENUM('openai', 'anthropic', 'huggingface'),
      allowNull: true,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '1.0.0',
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const value = this.getDataValue('tags');
        return value ? JSON.parse(value) : [];
      },
      set(value: string[]) {
        this.setDataValue('tags', JSON.stringify(value));
      },
    },
    popularity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('draft', 'review', 'published', 'archived'),
      allowNull: false,
      defaultValue: 'draft',
    },
    creatorType: {
      type: DataTypes.ENUM('ai', 'educator', 'admin'),
      allowNull: false,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    creatorName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    totalPlays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    averageCompletionTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    successRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    lastPlayed: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    modelName: 'Activity',
    tableName: 'activities',
    indexes: [
      { fields: ['category', 'language'] },
      { fields: ['difficulty', 'ageMin', 'ageMax'] },
      { fields: ['status'] },
      { fields: ['aiGenerated'] },
      { fields: ['popularity'] },
      { fields: ['rating'] },
      { fields: ['createdAt'] },
      { 
        fields: ['category', 'language', 'difficulty', 'status'],
        name: 'activity_search_idx'
      },
    ],
    hooks: {
      beforeSave: (activity: Activity) => {
        // Ensure max age is greater than or equal to min age
        if (activity.ageMax < activity.ageMin) {
          throw new Error('Maximum age must be greater than or equal to minimum age');
        }
        
        // Set default points based on difficulty if not provided
        if (!activity.points) {
          switch (activity.difficulty) {
            case 'easy':
              activity.points = 10;
              break;
            case 'medium':
              activity.points = 20;
              break;
            case 'hard':
              activity.points = 30;
              break;
            default:
              activity.points = 10;
          }
        }
      },
    },
  }
);

export default Activity;