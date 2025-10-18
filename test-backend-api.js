const axios = require('axios');
const fs = require('fs');

// Configuration
const BASE_URL = 'http://localhost:3002';
const API_URL = `${BASE_URL}/api`;

// Global state
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

let authTokens = {
  accessToken: '',
  refreshToken: '',
  userId: '',
  guestUserId: ''
};

// Utility functions
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, prefix, message) {
  console.log(`${color}${prefix}${colors.reset} ${message}`);
}

function logSection(title) {
  console.log(`\n${colors.cyan}========================================`);
  console.log(`${title}`);
  console.log(`========================================${colors.reset}\n`);
}

function logTest(message) {
  log(colors.blue, '🧪 TESTING:', message);
}

function logSuccess(message) {
  log(colors.green, '✅ SUCCESS:', message);
  testResults.passed++;
}

function logFailure(message) {
  log(colors.red, '❌ FAILED:', message);
  testResults.failed++;
}

function logWarning(message) {
  log(colors.yellow, '⚠️  WARNING:', message);
}

function logInfo(message) {
  log(colors.purple, 'ℹ️  INFO:', message);
}

// API request wrapper with error handling
async function makeRequest(method, endpoint, data = null, headers = {}, expectedStatus = 200) {
  testResults.total++;
  
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      validateStatus: () => true // Don't throw on any status code
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    
    const testResult = {
      method,
      endpoint,
      expectedStatus,
      actualStatus: response.status,
      success: response.status === expectedStatus,
      response: response.data,
      timestamp: new Date().toISOString()
    };

    testResults.tests.push(testResult);

    if (response.status === expectedStatus) {
      logSuccess(`${method} ${endpoint} - Status: ${response.status}`);
      return response.data;
    } else {
      logFailure(`${method} ${endpoint} - Expected: ${expectedStatus}, Got: ${response.status}`);
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    logFailure(`${method} ${endpoint} - Request failed: ${error.message}`);
    testResults.tests.push({
      method,
      endpoint,
      expectedStatus,
      actualStatus: 'ERROR',
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return null;
  }
}

// Authenticated request wrapper
async function makeAuthRequest(method, endpoint, data = null, expectedStatus = 200) {
  const headers = {
    'Authorization': `Bearer ${authTokens.accessToken}`
  };
  return await makeRequest(method, endpoint, data, headers, expectedStatus);
}

// Test suites
async function testHealthEndpoints() {
  logSection('TESTING HEALTH ENDPOINTS');
  
  // Test basic health
  logTest('Basic server health check');
  await makeRequest('GET', '/health');
  
  // Test API health
  logTest('API health check');
  await makeRequest('GET', '/api/health');
  
  // Test root endpoint
  logTest('Root endpoint');
  try {
    const response = await axios.get(BASE_URL);
    logSuccess('Root endpoint accessible');
    console.log('Server info:', response.data.name || 'Unknown');
  } catch (error) {
    logFailure('Root endpoint not accessible');
  }
}

async function testAuthentication() {
  logSection('TESTING AUTHENTICATION ENDPOINTS');
  
  // Test user registration
  logTest('User registration');
  const regData = {
    email: 'testuser@example.com',
    password: 'TestPass123',
    username: 'testuser123',
    firstName: 'Test',
    lastName: 'User',
    role: 'parent',
    grade: '5',
    language: 'en'
  };
  
  const regResponse = await makeRequest('POST', '/auth/register', regData, {}, 201);
  if (regResponse && regResponse.data && regResponse.data.tokens) {
    authTokens.accessToken = regResponse.data.tokens.accessToken;
    authTokens.refreshToken = regResponse.data.tokens.refreshToken;
    authTokens.userId = regResponse.data.user.id;
    logInfo(`Extracted ACCESS_TOKEN: ${authTokens.accessToken.substring(0, 20)}...`);
    logInfo(`Extracted USER_ID: ${authTokens.userId}`);
  }
  
  // Test user login
  logTest('User login');
  const loginData = {
    email: 'testuser@example.com',
    password: 'TestPass123'
  };
  
  const loginResponse = await makeRequest('POST', '/auth/login', loginData);
  if (loginResponse && loginResponse.data && loginResponse.data.tokens) {
    authTokens.accessToken = loginResponse.data.tokens.accessToken;
    authTokens.refreshToken = loginResponse.data.tokens.refreshToken;
    logInfo(`Updated ACCESS_TOKEN from login: ${authTokens.accessToken.substring(0, 20)}...`);
  }
  
  // Test guest login
  logTest('Guest login');
  const guestData = {
    name: 'Guest User',
    grade: '3'
  };
  
  const guestResponse = await makeRequest('POST', '/auth/guest-login', guestData);
  if (guestResponse && guestResponse.data && guestResponse.data.user) {
    authTokens.guestUserId = guestResponse.data.user.id;
    logInfo(`Guest USER_ID: ${authTokens.guestUserId}`);
  }
  
  // Test authenticated endpoints
  if (authTokens.accessToken) {
    logTest('Get user profile');
    await makeAuthRequest('GET', '/auth/profile');
    
    logTest('Update user profile');
    const updateData = { firstName: 'Updated', lastName: 'Name' };
    await makeAuthRequest('PUT', '/auth/profile', updateData);
  } else {
    logWarning('Skipping authenticated tests - no access token');
  }
  
  // Test token refresh
  if (authTokens.refreshToken) {
    logTest('Token refresh');
    const refreshData = { refreshToken: authTokens.refreshToken };
    await makeRequest('POST', '/auth/refresh-token', refreshData);
  }
}

async function testActivities() {
  logSection('TESTING ACTIVITY ENDPOINTS');
  
  // Test public endpoints
  logTest('Get all activities (public)');
  await makeRequest('GET', '/activities');
  
  logTest('Get activity by ID (public)');
  await makeRequest('GET', '/activities/sample-1');
  
  // Test authenticated endpoints
  if (authTokens.accessToken) {
    logTest('Create new activity');
    const activityData = {
      title: 'Test Activity',
      description: 'A test activity for API validation',
      content: 'This is test content',
      difficulty: 'easy',
      category: 'english',
      points: 50
    };
    
    const createResponse = await makeAuthRequest('POST', '/activities', activityData, 201);
    let activityId = null;
    if (createResponse && createResponse.data && createResponse.data.id) {
      activityId = createResponse.data.id;
      logInfo(`Created ACTIVITY_ID: ${activityId}`);
    }
    
    // Test activity completion
    if (activityId) {
      logTest('Complete activity');
      await makeAuthRequest('POST', `/activities/${activityId}/complete`);
    }
    
    logTest('Get user progress');
    await makeAuthRequest('GET', '/activities/user/progress');
    
    logTest('Reset user progress');
    await makeAuthRequest('POST', '/activities/user/reset-progress');
  } else {
    logWarning('Skipping authenticated activity tests - no access token');
  }
}

async function testRewards() {
  logSection('TESTING REWARD SYSTEM ENDPOINTS');
  
  if (authTokens.accessToken && authTokens.userId) {
    logTest('Initialize reward card');
    await makeAuthRequest('POST', `/rewards/cards/${authTokens.userId}/initialize`);
    
    logTest('Get reward card');
    await makeAuthRequest('GET', `/rewards/cards/${authTokens.userId}`);
    
    logTest('Award activity completion');
    const completionData = {
      activityId: 'test-activity-123',
      points: 50,
      activityTitle: 'Test Activity'
    };
    await makeAuthRequest('POST', `/rewards/cards/${authTokens.userId}/award-completion`, completionData);
    
    logTest('Get available rewards');
    await makeAuthRequest('GET', `/rewards/items/${authTokens.userId}/available`);
    
    logTest('Get achievements');
    await makeAuthRequest('GET', '/rewards/achievements');
    
    logTest('Get user achievements');
    await makeAuthRequest('GET', `/rewards/achievements/${authTokens.userId}/earned`);
    
    logTest('Request reward redemption');
    const redemptionData = {
      rewardId: 'test-reward-1',
      pointsCost: 100
    };
    await makeAuthRequest('POST', `/rewards/redemptions/${authTokens.userId}/request`, redemptionData);
    
    logTest('Get pending reward requests');
    await makeAuthRequest('GET', `/rewards/redemptions/${authTokens.userId}/pending`);
    
    logTest('Get redemption history');
    await makeAuthRequest('GET', `/rewards/redemptions/${authTokens.userId}/history`);
  } else {
    logWarning('Skipping reward tests - no access token or user ID');
  }
}

async function testAnalytics() {
  logSection('TESTING ANALYTICS ENDPOINTS');
  
  if (authTokens.accessToken && authTokens.userId) {
    logTest('Get progress analytics');
    await makeAuthRequest('GET', `/analytics/progress/${authTokens.userId}`);
    
    logTest('Get learning trends');
    await makeAuthRequest('GET', `/analytics/trends/${authTokens.userId}`);
    
    logTest('Get performance insights');
    await makeAuthRequest('GET', `/analytics/insights/${authTokens.userId}`);
    
    logTest('Get detailed progress report');
    await makeAuthRequest('GET', `/analytics/report/${authTokens.userId}`);
  } else {
    logWarning('Skipping analytics tests - no access token or user ID');
  }
}

async function testFeedback() {
  logSection('TESTING FEEDBACK ENDPOINTS');
  
  // Test public feedback endpoints
  logTest('Create feedback (public)');
  const feedbackData = {
    type: 'bug',
    message: 'Test feedback from Node.js API validation',
    userAgent: 'Node.js Test Script',
    url: '/test'
  };
  await makeRequest('POST', '/feedback', feedbackData, {}, 201);
  
  logTest('Get public feedback');
  await makeRequest('GET', '/feedback/public');
  
  logTest('Get feedback stats');
  await makeRequest('GET', '/feedback/stats');
  
  // Test admin feedback endpoints
  if (authTokens.accessToken) {
    logTest('Get all feedback (admin)');
    await makeAuthRequest('GET', '/feedback/admin/all');
  } else {
    logWarning('Skipping admin feedback tests - no access token');
  }
}

async function testErrorHandling() {
  logSection('TESTING ERROR HANDLING');
  
  logTest('404 - Non-existent endpoint');
  await makeRequest('GET', '/non-existent-endpoint', null, {}, 404);
  
  logTest('401 - Unauthorized access');
  await makeRequest('GET', '/auth/profile', null, {}, 401);
  
  logTest('400 - Invalid registration data');
  const invalidData = { email: 'invalid-email' };
  await makeRequest('POST', '/auth/register', invalidData, {}, 400);
  
  logTest('409 - Duplicate user registration');
  const duplicateData = {
    email: 'testuser@example.com',
    password: 'TestPass123',
    username: 'testuser123',
    firstName: 'Test',
    lastName: 'User'
  };
  await makeRequest('POST', '/auth/register', duplicateData, {}, 409);
}

async function testLogout() {
  logSection('TESTING LOGOUT');
  
  if (authTokens.accessToken) {
    logTest('User logout');
    await makeAuthRequest('POST', '/auth/logout');
    
    // Test that token is invalidated
    logTest('Access after logout (should fail)');
    await makeAuthRequest('GET', '/auth/profile', null, 401);
  } else {
    logWarning('Skipping logout test - no access token');
  }
}

function generateReport() {
  logSection('TEST RESULTS SUMMARY');
  
  const successRate = Math.round((testResults.passed / testResults.total) * 100);
  
  console.log(`${colors.cyan}Total Tests:${colors.reset} ${testResults.total}`);
  console.log(`${colors.green}Passed:${colors.reset} ${testResults.passed}`);
  console.log(`${colors.red}Failed:${colors.reset} ${testResults.failed}`);
  console.log(`${colors.blue}Success Rate:${colors.reset} ${successRate}%`);
  
  if (testResults.failed === 0) {
    console.log(`\n${colors.green}🎉 ALL TESTS PASSED! 🎉${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}⚠️  Some tests failed. Check the output above for details.${colors.reset}`);
  }
  
  // Save detailed report to file
  const reportData = {
    summary: {
      totalTests: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: successRate,
      timestamp: new Date().toISOString()
    },
    tests: testResults.tests,
    authTokens: {
      hasAccessToken: !!authTokens.accessToken,
      hasRefreshToken: !!authTokens.refreshToken,
      hasUserId: !!authTokens.userId,
      hasGuestUserId: !!authTokens.guestUserId
    }
  };
  
  const reportFile = `api_test_report_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  fs.writeFileSync(reportFile, JSON.stringify(reportData, null, 2));
  
  logInfo(`Detailed test report saved to: ${reportFile}`);
}

// Main execution
async function main() {
  console.log(`${colors.purple}
██████╗ ██╗      █████╗ ██╗   ██╗    ██╗     ███████╗ █████╗ ██████╗ ███╗   ██╗
██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝    ██║     ██╔════╝██╔══██╗██╔══██╗████╗  ██║
██████╔╝██║     ███████║ ╚████╔╝     ██║     █████╗  ███████║██████╔╝██╔██╗ ██║
██╔═══╝ ██║     ██╔══██║  ╚██╔╝      ██║     ██╔══╝  ██╔══██║██╔══██╗██║╚██╗██║
██║     ███████╗██║  ██║   ██║       ███████╗███████╗██║  ██║██║  ██║██║ ╚████║
╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝       ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝

███████╗██████╗  █████╗ ██████╗ ██╗  ██╗                                       
██╔════╝██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝                                       
███████╗██████╔╝███████║██████╔╝█████╔╝                                        
╚════██║██╔═══╝ ██╔══██║██╔══██╗██╔═██╗                                        
███████║██║     ██║  ██║██║  ██║██║  ██╗                                       
╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝                                       
${colors.reset}`);
  
  logInfo('Starting comprehensive API testing with Node.js...');
  logInfo(`Testing server at: ${BASE_URL}`);
  
  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/health`);
    logSuccess('Server is running and accessible');
  } catch (error) {
    logFailure(`Server is not running at ${BASE_URL}`);
    logInfo('Please start the server with: cd server && npm start');
    process.exit(1);
  }
  
  // Run all test suites
  try {
    await testHealthEndpoints();
    await testAuthentication();
    await testActivities();
    await testRewards();
    await testAnalytics();
    await testFeedback();
    await testErrorHandling();
    await testLogout();
    
    // Generate final report
    generateReport();
  } catch (error) {
    logFailure(`Test execution failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nTest execution interrupted. Generating partial report...');
  generateReport();
  process.exit(0);
});

// Execute main function
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  main,
  testResults,
  authTokens
};