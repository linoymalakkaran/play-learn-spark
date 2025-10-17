import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database-sqlite';

export interface RewardItemAttributes {
  id: number;
  name: string;
  description: string;
  category: 'treats' | 'gifts' | 'experiences' | 'food' | 'digital' | 'recognition';
  pointsCost: number;
  icon: string;
  imageUrl?: string;
  ageAppropriate: string; // JSON array of ages
  parentApprovalRequired: boolean;
  availability: 'always' | 'seasonal' | 'limited';
  seasonalPeriod?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardItemCreationAttributes extends Optional<RewardItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class RewardItem extends Model<RewardItemAttributes, RewardItemCreationAttributes> implements RewardItemAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public category!: 'treats' | 'gifts' | 'experiences' | 'food' | 'digital' | 'recognition';
  public pointsCost!: number;
  public icon!: string;
  public imageUrl?: string;
  public ageAppropriate!: string;
  public parentApprovalRequired!: boolean;
  public availability!: 'always' | 'seasonal' | 'limited';
  public seasonalPeriod?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods for JSON fields
  public getAgeAppropriate(): number[] {
    try {
      return JSON.parse(this.ageAppropriate);
    } catch {
      return [];
    }
  }

  public setAgeAppropriate(value: number[]): void {
    this.ageAppropriate = JSON.stringify(value);
  }

  public isAppropriateForAge(age: number): boolean {
    const appropriateAges = this.getAgeAppropriate();
    return appropriateAges.includes(age);
  }
}

RewardItem.init({
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
  category: {
    type: DataTypes.ENUM('treats', 'gifts', 'experiences', 'food', 'digital', 'recognition'),
    allowNull: false,
  },
  pointsCost: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  ageAppropriate: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[3,4,5,6,7,8,9,10,11,12]',
  },
  parentApprovalRequired: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  availability: {
    type: DataTypes.ENUM('always', 'seasonal', 'limited'),
    allowNull: false,
    defaultValue: 'always',
  },
  seasonalPeriod: {
    type: DataTypes.STRING(100),
    allowNull: true,
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
  tableName: 'reward_items',
  modelName: 'RewardItem',
  timestamps: true,
  indexes: [
    {
      fields: ['category'],
    },
    {
      fields: ['pointsCost'],
    },
    {
      fields: ['availability'],
    },
    {
      fields: ['isActive'],
    },
  ],
});