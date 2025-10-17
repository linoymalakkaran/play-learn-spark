import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database-sqlite';

export interface AchievementAttributes {
  id: number;
  name: string;
  description: string;
  icon: string;
  criteria: string; // JSON object with type, value, category
  pointsReward: number;
  badgeLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AchievementCreationAttributes extends Optional<AchievementAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Achievement extends Model<AchievementAttributes, AchievementCreationAttributes> implements AchievementAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public icon!: string;
  public criteria!: string;
  public pointsReward!: number;
  public badgeLevel!: 'bronze' | 'silver' | 'gold' | 'platinum';
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods for JSON fields
  public getCriteria(): {
    type: 'streak' | 'perfect_score' | 'activity_count' | 'category_complete' | 'points_earned';
    value: number;
    category?: string;
  } {
    try {
      return JSON.parse(this.criteria);
    } catch {
      return {
        type: 'activity_count',
        value: 1,
      };
    }
  }

  public setCriteria(value: {
    type: 'streak' | 'perfect_score' | 'activity_count' | 'category_complete' | 'points_earned';
    value: number;
    category?: string;
  }): void {
    this.criteria = JSON.stringify(value);
  }
}

Achievement.init({
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  criteria: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  pointsReward: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
  },
  badgeLevel: {
    type: DataTypes.ENUM('bronze', 'silver', 'gold', 'platinum'),
    allowNull: false,
    defaultValue: 'bronze',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
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
  tableName: 'achievements',
  modelName: 'Achievement',
  timestamps: true,
  indexes: [
    {
      fields: ['badgeLevel'],
    },
    {
      fields: ['pointsReward'],
    },
    {
      fields: ['isActive'],
    },
  ],
});