#!/bin/bash

echo "🔄 Resetting database and seeding test users..."

# Kill any running server processes
taskkill //F //IM node.exe 2>/dev/null || true

# Run the seeding script
cd "$(dirname "$0")"
npx ts-node -e "
import { seedTestUsers } from './src/utils/seedTestUsers';
seedTestUsers().then(() => {
  console.log('✅ Database reset and seeding complete!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
"

echo "✅ Database reset complete. You can now start the server with 'npm run dev'"