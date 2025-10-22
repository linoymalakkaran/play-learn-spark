/**
 * Data Migration Script - SQLite to MongoDB
 * 
 * This script facilitates the migration of user data and learning progress
 * from the existing SQLite database to the new MongoDB database structure.
 * 
 * Features:
 * - Migrates user accounts with role mapping
 * - Preserves learning progress and achievements
 * - Maintains user preferences and settings
 * - Creates appropriate permission assignments
 * - Provides rollback capabilities
 * - Validates data integrity
 */

import mongoose from 'mongoose';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import bcrypt from 'bcrypt';
import { UserMongo } from '../models/UserMongo.js';
import { Permission, RolePermission } from '../models/Permission.js';
import { connectMongoDB } from '../config/database-mongo.js';

// SQLite database connection
const sqliteDb = new sqlite3.Database(process.env.SQLITE_DB_PATH || './data/app.db');
const sqliteAll = promisify(sqliteDb.all.bind(sqliteDb));
const sqliteGet = promisify(sqliteDb.get.bind(sqliteDb));

interface SQLiteUser {
  id: number;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  createdAt: string;
  lastActive?: string;
  preferences?: string; // JSON string
  progress?: string; // JSON string
}

interface MigrationStats {
  totalUsers: number;
  migratedUsers: number;
  skippedUsers: number;
  errors: Array<{ userId: number; error: string }>;
  startTime: Date;
  endTime?: Date;
}

class DataMigrator {
  private stats: MigrationStats;
  private dryRun: boolean;

  constructor(dryRun = false) {
    this.dryRun = dryRun;
    this.stats = {
      totalUsers: 0,
      migratedUsers: 0,
      skippedUsers: 0,
      errors: [],
      startTime: new Date()
    };
  }

  /**
   * Initialize the migration process
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Starting Data Migration Process...');
      console.log(`Mode: ${this.dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
      
      // Connect to MongoDB
      await connectMongoDB();
      console.log('✅ Connected to MongoDB');

      // Initialize permissions if not exists
      await this.initializePermissions();
      console.log('✅ Permissions initialized');

      // Verify SQLite connection
      await this.verifySQLiteConnection();
      console.log('✅ SQLite connection verified');

    } catch (error) {
      console.error('❌ Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Run the complete migration process
   */
  async migrate(): Promise<MigrationStats> {
    try {
      await this.initialize();

      // Get all users from SQLite
      const sqliteUsers = await this.getSQLiteUsers();
      this.stats.totalUsers = sqliteUsers.length;

      console.log(`\n📊 Found ${sqliteUsers.length} users to migrate`);

      // Migrate each user
      for (const sqliteUser of sqliteUsers) {
        try {
          await this.migrateUser(sqliteUser);
          this.stats.migratedUsers++;
          
          if (this.stats.migratedUsers % 10 === 0) {
            console.log(`✅ Migrated ${this.stats.migratedUsers}/${this.stats.totalUsers} users`);
          }
        } catch (error) {
          console.error(`❌ Error migrating user ${sqliteUser.id} (${sqliteUser.email}):`, error);
          this.stats.errors.push({
            userId: sqliteUser.id,
            error: error instanceof Error ? error.message : String(error)
          });
          this.stats.skippedUsers++;
        }
      }

      this.stats.endTime = new Date();
      await this.generateMigrationReport();

      return this.stats;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  /**
   * Initialize default permissions and roles
   */
  private async initializePermissions(): Promise<void> {
    if (this.dryRun) {
      console.log('🔍 [DRY RUN] Would initialize permissions');
      return;
    }

    try {
      // Check if permissions already exist
      const existingPermissions = await Permission.countDocuments();
      if (existingPermissions > 0) {
        console.log('ℹ️ Permissions already exist, skipping initialization');
        return;
      }

      // Import and initialize permissions
      const permissionModule = await import('../models/Permission.js');
      await permissionModule.initializeDefaultPermissions();
      console.log('✅ Default permissions and roles created');
    } catch (error) {
      console.error('❌ Error initializing permissions:', error);
      throw error;
    }
  }

  /**
   * Verify SQLite database connection and structure
   */
  private async verifySQLiteConnection(): Promise<void> {
    try {
      const result = await sqliteGet("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
      if (!result) {
        throw new Error('Users table not found in SQLite database');
      }
    } catch (error) {
      console.error('❌ SQLite verification failed:', error);
      throw error;
    }
  }

  /**
   * Get all users from SQLite database
   */
  private async getSQLiteUsers(): Promise<SQLiteUser[]> {
    try {
      const users = await sqliteAll('SELECT * FROM users ORDER BY id') as SQLiteUser[];
      return users;
    } catch (error) {
      console.error('❌ Error fetching SQLite users:', error);
      throw error;
    }
  }

  /**
   * Migrate a single user from SQLite to MongoDB
   */
  private async migrateUser(sqliteUser: SQLiteUser): Promise<void> {
    try {
      // Check if user already exists in MongoDB
      const existingUser = await UserMongo.findOne({ email: sqliteUser.email });
      if (existingUser) {
        console.log(`⚠️ User ${sqliteUser.email} already exists in MongoDB, skipping`);
        this.stats.skippedUsers++;
        return;
      }

      if (this.dryRun) {
        console.log(`🔍 [DRY RUN] Would migrate user: ${sqliteUser.email}`);
        return;
      }

      // Parse JSON fields
      const preferences = this.parseJSON(sqliteUser.preferences) || {};
      const progress = this.parseJSON(sqliteUser.progress) || {};

      // Map role (default to 'child' if not specified)
      const role = this.mapRole(sqliteUser.role);

      // Create MongoDB user document
      const mongoUser = new UserMongo({
        username: sqliteUser.username,
        email: sqliteUser.email,
        password: sqliteUser.password, // Keep existing hash
        role: role,
        
        // Profile information
        profile: {
          firstName: sqliteUser.firstName || '',
          lastName: sqliteUser.lastName || '',
          preferences: {
            language: preferences.language || 'en',
            difficulty: preferences.difficulty || 'medium',
            topics: preferences.topics || [],
            notifications: {
              email: preferences.emailNotifications !== false,
              push: preferences.pushNotifications !== false,
              weekly: preferences.weeklyReports !== false
            },
            privacy: {
              profileVisibility: 'private',
              shareProgress: false,
              allowMessages: true
            },
            accessibility: {
              highContrast: preferences.highContrast || false,
              largeText: preferences.largeText || false,
              screenReader: preferences.screenReader || false,
              keyboardNavigation: preferences.keyboardNavigation || false
            }
          }
        },

        // Learning progress
        progress: {
          totalPoints: progress.points || 0,
          level: progress.level || 1,
          completedActivities: progress.completedActivities || [],
          achievements: progress.achievements || [],
          streaks: {
            current: progress.currentStreak || 0,
            longest: progress.longestStreak || 0,
            lastActivity: progress.lastActivity ? new Date(progress.lastActivity) : undefined
          },
          subjects: progress.subjects || {},
          weeklyGoals: {
            target: progress.weeklyTarget || 5,
            current: progress.weeklyProgress || 0,
            week: new Date()
          }
        },

        // Subscription (free for migrated users)
        subscription: {
          plan: 'free',
          status: 'active',
          startDate: new Date(sqliteUser.createdAt),
          features: ['basic_activities', 'progress_tracking']
        },

        // Security settings
        security: {
          emailVerified: true, // Assume migrated users are verified
          lastPasswordChange: new Date(sqliteUser.createdAt),
          loginAttempts: 0,
          lockedUntil: undefined
        },

        // Metadata
        metadata: {
          source: 'sqlite_migration',
          migratedAt: new Date(),
          originalId: sqliteUser.id,
          lastActive: sqliteUser.lastActive ? new Date(sqliteUser.lastActive) : undefined
        }
      });

      // Save the user
      await mongoUser.save();
      console.log(`✅ Migrated user: ${sqliteUser.email} (${role})`);

    } catch (error) {
      console.error(`❌ Error migrating user ${sqliteUser.id}:`, error);
      throw error;
    }
  }

  /**
   * Map SQLite role to MongoDB role
   */
  private mapRole(sqliteRole?: string): string {
    if (!sqliteRole) return 'child';
    
    const roleMapping: { [key: string]: string } = {
      'admin': 'admin',
      'administrator': 'admin',
      'teacher': 'educator',
      'educator': 'educator',
      'instructor': 'educator',
      'parent': 'parent',
      'guardian': 'parent',
      'student': 'child',
      'child': 'child',
      'learner': 'child',
      'guest': 'guest'
    };

    return roleMapping[sqliteRole.toLowerCase()] || 'child';
  }

  /**
   * Safely parse JSON string
   */
  private parseJSON(jsonString?: string): any {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  }

  /**
   * Generate migration report
   */
  private async generateMigrationReport(): Promise<void> {
    const duration = this.stats.endTime 
      ? (this.stats.endTime.getTime() - this.stats.startTime.getTime()) / 1000
      : 0;

    const report = `
╔══════════════════════════════════════════════════════╗
║                 MIGRATION REPORT                     ║
╠══════════════════════════════════════════════════════╣
║ Start Time: ${this.stats.startTime.toISOString()}
║ End Time:   ${this.stats.endTime?.toISOString() || 'In Progress'}
║ Duration:   ${duration}s
║ Mode:       ${this.dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}
║
║ Total Users Found:    ${this.stats.totalUsers}
║ Successfully Migrated: ${this.stats.migratedUsers}
║ Skipped:              ${this.stats.skippedUsers}
║ Errors:               ${this.stats.errors.length}
║
║ Success Rate: ${this.stats.totalUsers > 0 ? ((this.stats.migratedUsers / this.stats.totalUsers) * 100).toFixed(2) : 0}%
╚══════════════════════════════════════════════════════╝
`;

    console.log(report);

    if (this.stats.errors.length > 0) {
      console.log('\n❌ ERRORS ENCOUNTERED:');
      this.stats.errors.forEach((error, index) => {
        console.log(`${index + 1}. User ID ${error.userId}: ${error.error}`);
      });
    }

    // Save report to file if not dry run
    if (!this.dryRun) {
      const fs = await import('fs/promises');
      const reportPath = `./migration-report-${Date.now()}.txt`;
      await fs.writeFile(reportPath, report + '\n\nDetailed Errors:\n' + 
        this.stats.errors.map(e => `User ${e.userId}: ${e.error}`).join('\n'));
      console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      sqliteDb.close();
      await mongoose.disconnect();
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup error:', error);
    }
  }
}

/**
 * Rollback migration (removes migrated users)
 */
export async function rollbackMigration(): Promise<void> {
  try {
    console.log('🔄 Starting migration rollback...');
    
    await connectMongoDB();
    
    // Remove all users that were migrated from SQLite
    const result = await UserMongo.deleteMany({ 'metadata.source': 'sqlite_migration' });
    
    console.log(`✅ Rollback completed. Removed ${result.deletedCount} migrated users.`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

/**
 * Main migration function
 */
export async function runMigration(dryRun = false): Promise<MigrationStats> {
  const migrator = new DataMigrator(dryRun);
  
  try {
    const stats = await migrator.migrate();
    return stats;
  } finally {
    await migrator.cleanup();
  }
}

// CLI execution
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const rollback = args.includes('--rollback');

  if (rollback) {
    rollbackMigration().catch(console.error);
  } else {
    runMigration(dryRun).catch(console.error);
  }
}

export default DataMigrator;