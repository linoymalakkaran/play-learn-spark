import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database-sqlite';

export interface FeedbackAttributes {
  id: string;
  name: string;
  email: string;
  rating: number; // 1-5 stars
  feedbackType: 'review' | 'suggestion' | 'complaint' | 'general';
  subject: string;
  message: string;
  isPublic: boolean; // Whether to display on public feedback page
  isApproved: boolean; // Admin approval for public display
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackCreationAttributes extends Optional<FeedbackAttributes, 'id' | 'isApproved' | 'createdAt' | 'updatedAt'> {}

export class Feedback extends Model<FeedbackAttributes, FeedbackCreationAttributes> implements FeedbackAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public rating!: number;
  public feedbackType!: 'review' | 'suggestion' | 'complaint' | 'general';
  public subject!: string;
  public message!: string;
  public isPublic!: boolean;
  public isApproved!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Feedback.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    feedbackType: {
      type: DataTypes.ENUM('review', 'suggestion', 'complaint', 'general'),
      allowNull: false,
      defaultValue: 'general',
    },
    subject: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 200],
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 2000],
      },
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Requires admin approval by default
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Feedback',
    tableName: 'feedbacks',
    timestamps: true,
    indexes: [
      {
        fields: ['feedbackType'],
      },
      {
        fields: ['rating'],
      },
      {
        fields: ['isPublic', 'isApproved'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default Feedback;