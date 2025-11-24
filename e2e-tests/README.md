# Play Learn Spark - E2E Test Automation Suite

This is a comprehensive End-to-End (E2E) test automation suite for the Play Learn Spark educational platform using Playwright with TypeScript. The test suite follows the Page Object Model (POM) pattern and includes tests for authentication, dashboard functionality, activities, and navigation.

## 🏗️ Architecture

### Project Structure
```
e2e-tests/
├── fixtures/                    # Test data and fixtures
│   └── test-data.ts            # User data, activities, API endpoints
├── helpers/                     # Utility functions and helpers
│   ├── global-setup.ts         # Global setup configuration
│   ├── global-teardown.ts      # Global teardown configuration
│   └── test-utils.ts           # Common test utilities and data generators
├── pages/                       # Page Object Models
│   ├── auth.page.ts            # Authentication pages (login/register)
│   ├── activity.page.ts        # Activity interaction pages
│   ├── dashboard.page.ts       # Dashboard pages (parent/teacher/student)
│   └── navigation.page.ts      # Navigation components
├── tests/                       # Test specifications
│   ├── auth.test.ts            # Authentication flow tests
│   ├── activity.test.ts        # Activity interaction tests
│   ├── dashboard.test.ts       # Dashboard functionality tests
│   └── navigation.test.ts      # Navigation and routing tests
├── reports/                     # Test execution reports
│   └── screenshots/            # Screenshots on failure
├── .env.example                # Environment configuration template
├── package.json                # Dependencies and scripts
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- The Play Learn Spark application running locally or accessible via URL

### Installation

1. **Navigate to the e2e-tests directory:**
   ```bash
   cd e2e-tests
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install chromium
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your application URL:
   ```env
   BASE_URL=http://localhost:3000
   # For production testing:
   # BASE_URL=https://your-production-url.com
   ```

### Configuration

The test suite is configured via `playwright.config.ts`:

- **Browser**: Chrome-only for consistency
- **Parallel Execution**: 2 workers by default
- **Retry Logic**: 2 retries on failure
- **Screenshots**: Captured on failure
- **Video**: Recorded on failure
- **Reports**: HTML and JSON formats

## 🧪 Running Tests

### All Tests
```bash
npm test
```

### Specific Test Files
```bash
# Authentication tests only
npm run test:auth

# Dashboard tests only
npm run test:dashboard

# Activity tests only
npm run test:activities

# Navigation tests only
npm run test:navigation
```

### Development Mode (UI)
```bash
npm run test:ui
```

### Debug Mode
```bash
npm run test:debug
```

### Headed Mode
```bash
npm run test:headed
```

## 📋 Test Coverage

### Authentication Tests (`auth.test.ts`)
- ✅ User Registration (Parent, Teacher, Student)
- ✅ User Login (All roles + Guest)
- ✅ Form Validation and Error Handling
- ✅ Session Management
- ✅ Security Features (XSS, SQL Injection protection)
- ✅ Password Functionality
- ✅ Accessibility Compliance

### Dashboard Tests (`dashboard.test.ts`)
- ✅ Role-based Dashboard Layout (Parent/Teacher/Student)
- ✅ Activity Management and Filtering
- ✅ Progress and Statistics Display
- ✅ Parent-specific Features (Child management)
- ✅ Teacher-specific Features (Classroom management)
- ✅ Responsive Design Testing
- ✅ Performance and Error Handling

### Activity Tests (`activity.test.ts`)
- ✅ Activity Navigation and Setup
- ✅ Question Answering (Multiple choice, Text input)
- ✅ Activity Controls (Pause, Resume, Exit)
- ✅ Feedback and Scoring Systems
- ✅ Activity Completion Flow
- ✅ Subject-specific Features:
  - Language Learning (Audio, Pronunciation)
  - Math (Workspace, Calculations)
  - Science (Simulations, Experiments)
  - Reading (Comprehension, Timing)

### Navigation Tests (`navigation.test.ts`)
- ✅ Header Navigation
- ✅ Mobile/Responsive Navigation
- ✅ User Menu Navigation
- ✅ Breadcrumb Navigation
- ✅ Search Functionality
- ✅ Link Validation
- ✅ Accessibility and Keyboard Navigation
- ✅ Performance and Error Handling

## 📄 Page Object Models

### AuthPage (`auth.page.ts`)
Handles login and registration functionality:
- `login(email, password)` - Perform user login
- `register(userData)` - Register new user
- `loginAsGuest()` - Guest login functionality
- `switchToRegister()` / `switchToLogin()` - Form navigation
- Form validation and error handling methods

### DashboardPage (`dashboard.page.ts`)
Manages dashboard interactions:
- `verifyRoleBasedLayout(role)` - Check role-specific elements
- `getActivityCardsCount()` - Count available activities
- `filterActivitiesByType(type)` - Filter activities
- `addChild(childData)` - Parent-specific: Add child
- `assignActivityToStudent()` - Teacher-specific functionality

### ActivityPage (`activity.page.ts`)
Handles activity interaction:
- `startActivity()` - Begin activity
- `answerMultipleChoice(index)` - Answer questions
- `completeActivityEndToEnd()` - Full activity completion
- Subject-specific methods for language, math, science, reading
- Progress tracking and completion handling

### NavigationPage (`navigation.page.ts`)
Manages navigation components:
- `navigateTo*()` methods - Page navigation
- `openUserMenu()` - User menu interaction
- `toggleMobileMenu()` - Mobile navigation
- Breadcrumb and sidebar navigation
- Accessibility testing methods

## 🔧 Utilities and Helpers

### TestUtils (`test-utils.ts`)
Common utilities for all tests:
- `waitForPageReady()` - Wait for page load completion
- `safeClick()` / `safeFill()` - Reliable element interaction
- `takeScreenshot()` - Screenshot capture
- `checkConsoleErrors()` - Error detection
- `mockAPIResponse()` - API mocking

### DataGenerator (`test-utils.ts`)
Test data generation:
- `randomEmail()` - Generate unique emails
- `randomString()` - Random text generation
- `randomChildName()` - Child name generation
- `randomGrade()` - Grade selection

### Test Data (`test-data.ts`)
Pre-defined test data:
- `TestUsers` - User accounts for testing
- `TestChildren` - Child profiles
- `TestActivities` - Sample activities
- `APIEndpoints` - API endpoint definitions
- `MockData` - Mock response data

## 📊 Reporting

### HTML Reports
After test execution, open the HTML report:
```bash
npx playwright show-report
```

### CI/CD Integration
The test suite is configured for CI/CD with:
- JSON report generation for parsing
- Screenshot and video artifacts
- Parallel execution for speed
- Retry logic for stability

## 🎯 Test Strategy

### Environment Support
- **Development**: Full test suite with UI mode
- **Staging**: Automated regression testing
- **Production**: Smoke tests and critical path validation

### Test Execution Levels
1. **Smoke Tests**: Core functionality verification
2. **Regression Tests**: Comprehensive feature testing
3. **Cross-browser**: Chrome focus with multi-browser capability
4. **Accessibility**: ARIA compliance and keyboard navigation

### Data Management
- **Test Isolation**: Each test uses unique data
- **Clean State**: Global setup ensures clean environment
- **Mock Data**: Predictable test scenarios

## 🔍 Debugging

### Debug Failed Tests
```bash
npm run test:debug -- --grep "failing test name"
```

### Inspector Mode
```bash
npx playwright test --debug
```

### Trace Viewer
```bash
npx playwright show-trace trace.zip
```

## 📝 Best Practices

### Test Writing Guidelines

1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Clear test descriptions
3. **Page Object Pattern**: Use page objects for maintainability
4. **Async/Await**: Proper handling of asynchronous operations
5. **Error Handling**: Graceful failure handling

### Element Selection Strategy

1. **Data Test IDs**: Prefer `data-testid` attributes
2. **Semantic Selectors**: Use semantic HTML when available
3. **Stable Selectors**: Avoid CSS classes that may change
4. **Text Content**: Use visible text for user-facing elements

### Performance Considerations

1. **Parallel Execution**: Tests run in parallel for speed
2. **Smart Waits**: Use Playwright's auto-waiting features
3. **Resource Cleanup**: Proper cleanup in teardown
4. **Selective Testing**: Run only necessary test suites

## 🚨 Troubleshooting

### Common Issues

**Tests fail with "element not found":**
- Check if `data-testid` attributes exist
- Verify element visibility timing
- Use `waitFor` methods appropriately

**Network timeout errors:**
- Increase timeout in `playwright.config.ts`
- Check application response times
- Verify BASE_URL configuration

**Authentication failures:**
- Ensure test user accounts exist
- Check session management implementation
- Verify API endpoint accessibility

**Flaky tests:**
- Add appropriate wait conditions
- Check for race conditions
- Use stable element selectors

### Debugging Steps

1. **Run single test**: `npm test -- --grep "test name"`
2. **Use headed mode**: `npm run test:headed`
3. **Check console logs**: Enable console output in config
4. **Review screenshots**: Check `reports/screenshots/`
5. **Use trace viewer**: Analyze execution traces

## 🔄 Maintenance

### Regular Tasks

1. **Update dependencies**: Keep Playwright and packages current
2. **Review test data**: Ensure test users and data are valid
3. **Monitor performance**: Track test execution times
4. **Update selectors**: Maintain element selectors as UI changes

### Extending Tests

1. **New Features**: Add new page objects and tests
2. **Additional Browsers**: Configure multi-browser testing
3. **Mobile Testing**: Add mobile-specific test scenarios
4. **API Integration**: Add API testing capabilities

## 📞 Support

For questions or issues with the E2E test suite:

1. Check this README and configuration files
2. Review Playwright documentation
3. Examine existing test patterns
4. Check application logs and network requests
5. Create detailed bug reports with screenshots and traces

---

## 🏷️ Tags

- E2E Testing
- Playwright
- TypeScript
- Page Object Model
- Educational Platform
- Test Automation
- Quality Assurance
- React Testing
- Node.js Testing
- CI/CD Integration