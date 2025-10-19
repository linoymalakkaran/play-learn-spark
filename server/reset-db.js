const { seedTestUsers } = require('./src/utils/seedTestUsers');

console.log('🔄 Resetting database and seeding test users...');

seedTestUsers().then(() => {
  console.log('✅ Database reset and seeding complete!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});