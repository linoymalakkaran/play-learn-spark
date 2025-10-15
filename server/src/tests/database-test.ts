// import { sequelize } from '../config/database'; // Commented out for in-memory DB
import { User, Activity, Progress } from '../models';

async function testDatabaseSetup() {
  try {
    console.log('🔗 Testing SQLite database connection...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync all models (create tables)
    console.log('🔄 Synchronizing database models...');
    await sequelize.sync({ force: false }); // Set to true to drop and recreate tables
    console.log('✅ Database models synchronized successfully');
    
    // Test User model
    console.log('👤 Testing User model...');
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: new Date('2015-01-01'),
      preferredLanguage: 'en',
      role: 'student',
    });
    console.log('✅ User created successfully:', testUser.id);
    
    // Test password comparison
    const isPasswordValid = await testUser.comparePassword('password123');
    console.log('✅ Password validation works:', isPasswordValid);
    
    // Test Activity model
    console.log('🎯 Testing Activity model...');
    const testActivity = await Activity.create({
      title: 'Test Alphabet Activity',
      description: 'A test activity for learning letters',
      category: 'alphabet',
      language: 'en',
      difficulty: 'easy',
      ageMin: 3,
      ageMax: 6,
      contentType: 'interactive',
      contentData: { letters: ['A', 'B', 'C'] },
      objectives: ['Learn letters A, B, C'],
      instructions: 'Click on each letter to hear its sound',
      duration: 5,
      points: 10,
      creatorType: 'ai',
      status: 'published',
    });
    console.log('✅ Activity created successfully:', testActivity.id);
    
    // Test Progress model
    console.log('📊 Testing Progress model...');
    const testProgress = await Progress.create({
      userId: testUser.id,
      activityId: testActivity.id,
      attempts: [],
      currentStreak: 0,
      bestScore: 0,
      totalTimeSpent: 0,
      firstAttemptDate: new Date(),
      lastAttemptDate: new Date(),
      mastery: { level: 'not_started', confidence: 0, lastAssessment: new Date() },
      achievements: [],
      adaptiveData: {
        recommendedDifficulty: 'easy',
        learningStyle: 'mixed',
        preferredPace: 'normal',
        attentionSpan: 10,
      },
    });
    console.log('✅ Progress created successfully:', testProgress.id);
    
    // Test business logic methods
    console.log('🧪 Testing business logic methods...');
    await testProgress.addAttempt({
      score: 85,
      timeSpent: 120,
      hintsUsed: 2,
      mistakes: 1,
      completed: true,
    });
    console.log('✅ Add attempt method works, best score:', testProgress.bestScore);
    
    // Test relationships/associations
    console.log('🔗 Testing model associations...');
    const userWithProgress = await User.findByPk(testUser.id, {
      include: ['progress'],
    });
    console.log('✅ User-Progress association works, progress count:', userWithProgress?.get('progress')?.length || 0);
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await testProgress.destroy();
    await testActivity.destroy();
    await testUser.destroy();
    console.log('✅ Test data cleaned up successfully');
    
    console.log('🎉 All database tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    throw error;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabaseSetup()
    .then(() => {
      console.log('✅ Database setup test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database setup test failed:', error);
      process.exit(1);
    });
}

export default testDatabaseSetup;