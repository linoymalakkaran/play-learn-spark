import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for Play Learn Spark E2E tests...');

  const { baseURL } = config.projects[0].use;
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for application to be ready
    console.log(`📡 Checking if application is ready at ${baseURL}...`);
    await page.goto(baseURL || 'http://localhost:4200', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Check if app is loaded properly
    await page.waitForSelector('body', { timeout: 10000 });
    console.log('✅ Application is ready for testing');

    // Optional: Create test data or perform setup operations
    // This could include creating test users, seeding data, etc.
    await setupTestData(page);

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('✅ Global setup completed successfully');
}

async function setupTestData(page: any) {
  // Optional: Add any global setup like creating test users
  console.log('🔧 Setting up test data...');
  
  // Example: Could create test users via API or UI
  // For now, we'll just verify the app loads
  try {
    const title = await page.title();
    console.log(`📄 App title: ${title}`);
  } catch (error) {
    console.warn('⚠️  Could not get app title:', error);
  }
}

export default globalSetup;