import { DataTypes, Model, Optional, Op } from 'sequelize';
import { sequelize } from '../config/database-sqlite';

export interface PasswordResetAttributes {
  id: string;
  userId: number;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PasswordResetCreationAttributes extends Optional<PasswordResetAttributes, 'id' | 'used' | 'createdAt' | 'updatedAt'> {}

export class PasswordReset extends Model<PasswordResetAttributes, PasswordResetCreationAttributes> implements PasswordResetAttributes {
  public id!: string;
  public userId!: number;
  public token!: string;
  public expiresAt!: Date;
  public used!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance methods
  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public markAsUsed(): Promise<this> {
    return this.update({ used: true });
  }

  // Static methods
  public static async findValidToken(token: string): Promise<PasswordReset | null> {
    return this.findOne({
      where: {
        token,
        used: false,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
    });
  }

  public static async cleanupExpired(): Promise<number> {
    const result = await this.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date(),
        },
      },
    });
    return result;
  }

  public static async createPasswordResetToken(userId: number): Promise<string | null> {
    try {
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

      await this.create({
        userId,
        token,
        expiresAt,
      });

      return token;
    } catch (error) {
      console.error('Error creating password reset token:', error);
      return null;
    }
  }

  public static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const bcrypt = require('bcryptjs');
      const { User } = require('./UserSQLite');
      
      // Find valid token
      const resetRecord = await this.findValidToken(token);
      if (!resetRecord) {
        return false;
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      const user = await User.findByPk(resetRecord.userId);
      if (!user) {
        return false;
      }

      await user.update({ password: hashedPassword });

      // Mark token as used
      await resetRecord.markAsUsed();

      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  }

  // Association methods
  public static associate() {
    // Define associations here if needed
  }
}

PasswordReset.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id',
      },
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    modelName: 'PasswordReset',
    tableName: 'password_resets',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['token'],
        unique: true,
      },
      {
        fields: ['expiresAt'],
      },
      {
        fields: ['used'],
      },
    ],
  }
);

export default PasswordReset;