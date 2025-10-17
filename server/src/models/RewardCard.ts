import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database-sqlite';

export interface RewardCardAttributes {
  id: number;
  userId: number;
  totalPoints: number;
  availablePoints: number;
  currentLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  achievements: string; // JSON array of achievement IDs
  streakCount: number;
  lastActivityDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardCardCreationAttributes extends Optional<RewardCardAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class RewardCard extends Model<RewardCardAttributes, RewardCardCreationAttributes> implements RewardCardAttributes {
  public id!: number;
  public userId!: number;
  public totalPoints!: number;
  public availablePoints!: number;
  public currentLevel!: 'bronze' | 'silver' | 'gold' | 'platinum';
  public achievements!: string;
  public streakCount!: number;
  public lastActivityDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods for JSON fields
  public getAchievements(): string[] {
    try {
      return JSON.parse(this.achievements);
    } catch {
      return [];
    }
  }

  public setAchievements(value: string[]): void {
    this.achievements = JSON.stringify(value);
  }

  public addAchievement(achievementId: string): void {
    const current = this.getAchievements();
    if (!current.includes(achievementId)) {
      current.push(achievementId);
      this.setAchievements(current);
    }
  }

  // Calculate level based on total points
  public updateLevel(): void {
    if (this.totalPoints >= 600) {
      this.currentLevel = 'platinum';
    } else if (this.totalPoints >= 300) {
      this.currentLevel = 'gold';
    } else if (this.totalPoints >= 100) {
      this.currentLevel = 'silver';
    } else {
      this.currentLevel = 'bronze';
    }
  }
}

RewardCard.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  totalPoints: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  availablePoints: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  currentLevel: {
    type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
    allowNull: false,
    defaultValue: 'bronze',
  },
  achievements: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
  },
  streakCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  lastActivityDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'reward_cards',
  modelName: 'RewardCard',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
      unique: true,
    },
    {
      fields: ['currentLevel'],
    },
    {
      fields: ['totalPoints'],
    },
  ],
});