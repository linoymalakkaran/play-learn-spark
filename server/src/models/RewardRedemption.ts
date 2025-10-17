import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database-sqlite';

export interface RewardRedemptionAttributes {
  id: number;
  userId: number;
  rewardItemId: number;
  pointsUsed: number;
  status: 'pending' | 'approved' | 'denied' | 'fulfilled';
  requestedAt: Date;
  processedAt?: Date;
  fulfilledAt?: Date;
  childMessage?: string;
  parentResponse?: string;
  parentNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardRedemptionCreationAttributes extends Optional<RewardRedemptionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class RewardRedemption extends Model<RewardRedemptionAttributes, RewardRedemptionCreationAttributes> implements RewardRedemptionAttributes {
  public id!: number;
  public userId!: number;
  public rewardItemId!: number;
  public pointsUsed!: number;
  public status!: 'pending' | 'approved' | 'denied' | 'fulfilled';
  public requestedAt!: Date;
  public processedAt?: Date;
  public fulfilledAt?: Date;
  public childMessage?: string;
  public parentResponse?: string;
  public parentNotes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public approve(parentResponse?: string, parentNotes?: string): void {
    this.status = 'approved';
    this.processedAt = new Date();
    this.parentResponse = parentResponse;
    this.parentNotes = parentNotes;
  }

  public deny(parentResponse?: string): void {
    this.status = 'denied';
    this.processedAt = new Date();
    this.parentResponse = parentResponse;
  }

  public fulfill(parentNotes?: string): void {
    this.status = 'fulfilled';
    this.fulfilledAt = new Date();
    this.parentNotes = parentNotes;
  }

  public isPending(): boolean {
    return this.status === 'pending';
  }

  public isApproved(): boolean {
    return this.status === 'approved';
  }

  public isDenied(): boolean {
    return this.status === 'denied';
  }

  public isFulfilled(): boolean {
    return this.status === 'fulfilled';
  }
}

RewardRedemption.init({
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
  rewardItemId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'reward_items',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  pointsUsed: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'denied', 'fulfilled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  requestedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  fulfilledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  childMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  parentResponse: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  parentNotes: {
    type: DataTypes.TEXT,
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
  tableName: 'reward_redemptions',
  modelName: 'RewardRedemption',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['rewardItemId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['requestedAt'],
    },
  ],
});