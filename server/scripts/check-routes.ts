import fs from 'fs';
import path from 'path';

// Check if all route files exist and can be imported
const routesDir = path.join(__dirname, '../src/routes');

console.log('🔍 Checking route files...\n');

const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.ts'));

console.log('Route files found:');
routeFiles.forEach(file => {
  console.log(`  ✓ ${file}`);
});

console.log('\n🧪 Testing route imports...\n');

// Test importing each route
for (const file of routeFiles) {
  const routeName = file.replace('.ts', '');
  const routePath = path.join(routesDir, file);
  
  try {
    console.log(`Testing: ${routeName}`);
    const route = require(routePath);
    
    if (route.default) {
      console.log(`  ✅ ${routeName} - Default export found`);
    } else {
      console.log(`  ⚠️  ${routeName} - No default export`);
    }
    
    // Check if it's a router
    if (route.default && typeof route.default.use === 'function') {
      console.log(`  ✅ ${routeName} - Valid Express Router`);
    } else {
      console.log(`  ❌ ${routeName} - Not a valid Express Router`);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`  ❌ ${routeName} - Import failed: ${errorMessage}`);
  }
  
  console.log('');
}

console.log('✅ Route check completed!');