/**
 * Test data and fixtures for Play Learn Spark E2E tests
 */

export interface TestUser {
  email: string;
  password: string;
  role: 'parent' | 'teacher' | 'student';
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface TestChild {
  firstName: string;
  lastName: string;
  grade: string;
  birthDate: string;
}

export interface TestActivity {
  id: string;
  title: string;
  type: 'language' | 'math' | 'science' | 'reading';
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
}

/**
 * Pre-defined test users for different scenarios
 */
export const TestUsers = {
  PARENT: {
    email: 'parent@example.com',
    password: 'TestPass123!',
    role: 'parent' as const,
    firstName: 'John',
    lastName: 'Doe',
    phone: '(555) 123-4567'
  },
  TEACHER: {
    email: 'teacher@example.com',
    password: 'TestPass123!',
    role: 'teacher' as const,
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '(555) 987-6543'
  },
  STUDENT: {
    email: 'student@example.com',
    password: 'TestPass123!',
    role: 'student' as const,
    firstName: 'Sam',
    lastName: 'Wilson'
  },
  GUEST: {
    email: '',
    password: '',
    role: 'student' as const,
    firstName: 'Guest',
    lastName: 'User'
  }
};

/**
 * Test children data
 */
export const TestChildren = {
  KINDERGARTEN: {
    firstName: 'Emma',
    lastName: 'Johnson',
    grade: 'K',
    birthDate: '2018-05-15'
  },
  FIRST_GRADE: {
    firstName: 'Liam',
    lastName: 'Brown',
    grade: '1',
    birthDate: '2017-09-22'
  },
  THIRD_GRADE: {
    firstName: 'Sophia',
    lastName: 'Davis',
    grade: '3',
    birthDate: '2015-12-03'
  }
};

/**
 * Sample activities for testing
 */
export const TestActivities = {
  LANGUAGE_EASY: {
    id: 'lang_easy_001',
    title: 'Basic Vocabulary',
    type: 'language' as const,
    difficulty: 'easy' as const,
    description: 'Learn basic words and their meanings'
  },
  MATH_MEDIUM: {
    id: 'math_med_001',
    title: 'Addition Practice',
    type: 'math' as const,
    difficulty: 'medium' as const,
    description: 'Practice addition with numbers up to 100'
  },
  SCIENCE_HARD: {
    id: 'sci_hard_001',
    title: 'Solar System',
    type: 'science' as const,
    difficulty: 'hard' as const,
    description: 'Explore planets and space concepts'
  },
  READING_EASY: {
    id: 'read_easy_001',
    title: 'Short Stories',
    type: 'reading' as const,
    difficulty: 'easy' as const,
    description: 'Read and comprehend simple stories'
  }
};

/**
 * API endpoints for testing
 */
export const APIEndpoints = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile'
  },
  USERS: {
    BASE: '/api/users',
    PROFILE: '/api/users/profile',
    CHILDREN: '/api/users/children'
  },
  ACTIVITIES: {
    BASE: '/api/activities',
    LANGUAGE: '/api/activities/language',
    MATH: '/api/activities/math',
    SCIENCE: '/api/activities/science',
    READING: '/api/activities/reading'
  },
  PROGRESS: {
    BASE: '/api/progress',
    USER: '/api/progress/user',
    ACTIVITY: '/api/progress/activity'
  }
};

/**
 * Common form validation messages
 */
export const ValidationMessages = {
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  PASSWORD_COMPLEXITY: 'Password must contain uppercase, lowercase, number, and special character',
  NAME_REQUIRED: 'Name is required',
  PHONE_INVALID: 'Please enter a valid phone number',
  GRADE_REQUIRED: 'Grade is required'
};

/**
 * CSS selectors for common elements
 */
export const Selectors = {
  // Navigation
  NAVBAR: '[data-testid="navbar"]',
  SIDEBAR: '[data-testid="sidebar"]',
  MOBILE_MENU: '[data-testid="mobile-menu"]',
  
  // Auth
  LOGIN_FORM: '[data-testid="login-form"]',
  REGISTER_FORM: '[data-testid="register-form"]',
  LOGOUT_BUTTON: '[data-testid="logout-button"]',
  
  // Dashboard
  DASHBOARD_CONTAINER: '[data-testid="dashboard"]',
  WELCOME_MESSAGE: '[data-testid="welcome-message"]',
  ACTIVITY_GRID: '[data-testid="activity-grid"]',
  PROGRESS_CHART: '[data-testid="progress-chart"]',
  
  // Activities
  ACTIVITY_CARD: '[data-testid="activity-card"]',
  ACTIVITY_START_BUTTON: '[data-testid="start-activity"]',
  ACTIVITY_COMPLETION: '[data-testid="activity-complete"]',
  
  // Forms
  SUBMIT_BUTTON: 'button[type="submit"]',
  CANCEL_BUTTON: '[data-testid="cancel-button"]',
  LOADING_SPINNER: '[data-testid="loading-spinner"]',
  ERROR_MESSAGE: '[data-testid="error-message"]',
  SUCCESS_MESSAGE: '[data-testid="success-message"]'
};

/**
 * Test environment configuration
 */
export const TestConfig = {
  TIMEOUTS: {
    SHORT: 5000,      // 5 seconds
    MEDIUM: 15000,    // 15 seconds
    LONG: 30000,      // 30 seconds
    NAVIGATION: 10000  // 10 seconds
  },
  
  RETRY_ATTEMPTS: 2,
  
  VIEWPORT_SIZES: {
    MOBILE: { width: 375, height: 667 },
    TABLET: { width: 768, height: 1024 },
    DESKTOP: { width: 1920, height: 1080 }
  },
  
  TEST_DATA: {
    MAX_CHILDREN: 5,
    ACTIVITY_TIMEOUT: 60000,  // 1 minute for activity completion
    UPLOAD_TIMEOUT: 30000     // 30 seconds for file uploads
  }
};

/**
 * Mock data for API responses
 */
export const MockData = {
  USER_PROFILE: {
    id: '12345',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'parent',
    createdAt: '2024-01-01T00:00:00Z',
    children: [
      {
        id: 'child1',
        firstName: 'Emma',
        lastName: 'Test',
        grade: 'K',
        birthDate: '2018-05-15'
      }
    ]
  },
  
  ACTIVITIES_RESPONSE: {
    language: [TestActivities.LANGUAGE_EASY],
    math: [TestActivities.MATH_MEDIUM],
    science: [TestActivities.SCIENCE_HARD],
    reading: [TestActivities.READING_EASY]
  },
  
  PROGRESS_RESPONSE: {
    totalActivities: 10,
    completedActivities: 7,
    currentStreak: 5,
    weeklyProgress: [
      { date: '2024-01-01', completed: 2 },
      { date: '2024-01-02', completed: 1 },
      { date: '2024-01-03', completed: 3 }
    ]
  }
};

/**
 * Error scenarios for testing
 */
export const ErrorScenarios = {
  NETWORK_ERROR: {
    status: 500,
    message: 'Internal Server Error'
  },
  
  UNAUTHORIZED: {
    status: 401,
    message: 'Unauthorized access'
  },
  
  VALIDATION_ERROR: {
    status: 400,
    message: 'Validation failed',
    errors: {
      email: ['Invalid email format'],
      password: ['Password too weak']
    }
  },
  
  NOT_FOUND: {
    status: 404,
    message: 'Resource not found'
  }
};