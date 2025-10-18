# Play Learn Spark - API Testing Suite

This repository contains comprehensive API testing scripts to validate the Play Learn Spark backend functionality.

## 🎯 Overview

The testing suite validates all backend endpoints including:
- **Authentication** (register, login, guest login, profile management)
- **Activity Management** (CRUD operations, completion tracking)
- **Reward System** (points, achievements, redemptions)
- **Analytics** (progress tracking, insights, reports)
- **Content Management** (activities, categories, bulk operations)
- **File Upload** (single/multiple files, metadata)
- **Feedback System** (public feedback, admin management)
- **Error Handling** (401, 404, 400, 409 responses)

## 📋 Prerequisites

1. **Backend Server Running**
   ```bash
   cd server
   npm start
   ```
   Server should be accessible at `http://localhost:3002`

2. **For Node.js Script** (Recommended)
   ```bash
   npm install
   ```

3. **For Bash Script** (Linux/Mac/WSL)
   - `curl` command available
   - Bash shell

4. **For Windows Batch Script**
   - `curl` command available (comes with Windows 10+)
   - Command Prompt or PowerShell

## 🚀 Running Tests

### Option 1: Node.js Script (Recommended)
```bash
# Install dependencies first
npm install

# Run comprehensive tests with JSON parsing and token management
npm test

# Or run directly
node test-backend-api.js
```

**Features:**
- ✅ Proper JSON parsing and token extraction
- ✅ Automatic authentication flow
- ✅ Detailed test result tracking
- ✅ Colored console output
- ✅ JSON report generation
- ✅ Error handling and recovery

### Option 2: Bash Script (Linux/Mac/WSL)
```bash
# Make script executable
chmod +x test-backend-api.sh

# Run comprehensive tests
bash test-backend-api.sh

# Or use npm script
npm run test:bash
```

**Features:**
- ✅ Full authentication flow with token extraction
- ✅ All endpoint testing
- ✅ Colored output
- ✅ Text report generation

### Option 3: Windows Batch Script
```cmd
# Run basic connectivity tests
test-backend-api.bat

# Or use npm script
npm run test:windows
```

**Features:**
- ✅ Basic endpoint validation
- ✅ Windows-friendly commands
- ✅ Simple output format
- ❌ Limited authentication testing (JSON parsing challenges)

## 📊 Test Results

### Expected Output
```
🧪 TESTING: User registration
✅ SUCCESS: POST /auth/register - Status: 201
ℹ️  INFO: Extracted ACCESS_TOKEN: eyJhbGciOiJIUzI1NiIsInR5...
ℹ️  INFO: Extracted USER_ID: 12345

🧪 TESTING: Activity completion
✅ SUCCESS: POST /activities/123/complete - Status: 200

========================================
  TEST RESULTS SUMMARY
========================================
Total Tests: 45
Passed: 43
Failed: 2
Success Rate: 96%

🎉 ALL TESTS PASSED! 🎉
```

### Report Files
- **Node.js**: `api_test_report_YYYY-MM-DDTHH-mm-ss.json`
- **Bash**: `api_test_report_YYYYMMDD_HHMM.txt`
- **Windows**: `api_test_windows_YYYYMMDD_HHMM`

## 🔍 Test Coverage

| Category | Endpoints Tested | Auth Required |
|----------|------------------|---------------|
| Health | `/health`, `/api/health` | ❌ |
| Authentication | `/auth/register`, `/auth/login`, `/auth/guest-login`, `/auth/profile` | Mixed |
| Activities | `/activities`, `/activities/:id`, `/activities/:id/complete` | Mixed |
| Rewards | `/rewards/cards/:userId/*`, `/rewards/achievements` | ✅ |
| Analytics | `/analytics/progress/:userId`, `/analytics/trends/:userId` | ✅ |
| Content | `/content/activities`, `/content/categories` | ✅ |
| Files | `/files/upload`, `/files/health` | ✅ |
| Feedback | `/feedback`, `/feedback/public`, `/feedback/stats` | Mixed |

## 🛠️ Troubleshooting

### Server Not Running
```
[FAILED] Server is not running at http://localhost:3002
[INFO] Please start the server with: cd server && npm start
```
**Solution:** Start the backend server first.

### Missing Dependencies
```
Error: Cannot find module 'axios'
```
**Solution:** Run `npm install` in the root directory.

### Authentication Failures
```
[FAILED] POST /auth/register - Expected: 201, Got: 409
```
**Common causes:**
- User already exists (expected for duplicate registration test)
- Database issues
- Validation errors

### Token Extraction Issues (Bash/Windows)
```
[WARNING] No access token found in registration response
```
**Solution:** Use the Node.js script for better JSON handling.

## 📈 Understanding Test Results

### Status Codes
- **200**: Success (GET, PUT requests)
- **201**: Created (POST requests)
- **401**: Unauthorized (missing/invalid token)
- **404**: Not Found (invalid endpoints)
- **409**: Conflict (duplicate registration)

### Test Categories
1. **Health Tests**: Basic connectivity
2. **Auth Tests**: User management and tokens
3. **Functional Tests**: Core business logic
4. **Error Tests**: Edge cases and validation
5. **Security Tests**: Authorization and permissions

## 🔧 Customization

### Adding New Tests
Edit the appropriate script:
- **Node.js**: Add function in `test-backend-api.js`
- **Bash**: Add section in `test-backend-api.sh`
- **Windows**: Add commands in `test-backend-api.bat`

### Changing Base URL
Update the `BASE_URL` variable in each script:
```javascript
const BASE_URL = 'https://your-server.com';
```

### Environment-Specific Testing
Create environment-specific scripts:
```bash
cp test-backend-api.js test-staging-api.js
# Edit BASE_URL for staging environment
```

## 📚 Related Documentation

- [Backend API Documentation](./server/README.md)
- [Authentication Guide](./AUTHENTICATION.md)
- [Activity System](./ACTIVITY_SYSTEM.md)
- [Reward System](./REWARD_SYSTEM.md)

## 🤝 Contributing

1. Add new test cases for new endpoints
2. Update expected status codes when API changes
3. Improve error handling and reporting
4. Add integration tests for complex workflows

## 📄 License

This testing suite is part of the Play Learn Spark project and follows the same license terms.