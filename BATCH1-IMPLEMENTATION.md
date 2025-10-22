# Enhanced Authentication System - MongoDB Integration

## Overview

This document describes the implementation of **Batch 1: Multi-Role Authentication & Authorization System** from the Educational Platform Enhancement Plan. This batch introduces a robust MongoDB-based authentication system with Role-Based Access Control (RBAC) to replace the existing SQLite-based authentication.

## 🎯 Batch 1 Objectives

### Completed Features

✅ **MongoDB Database Integration**
- Complete MongoDB connection configuration
- Environment-specific database settings
- Connection pooling and error handling
- Graceful shutdown procedures

✅ **Enhanced User Schema**
- Comprehensive user model supporting multiple roles
- Structured profile data with preferences
- Learning progress tracking
- Subscription management
- Security features (email verification, account locking)

✅ **Role-Based Access Control (RBAC)**
- Permission-based authorization system
- Default role assignments (admin, educator, parent, child, guest)
- Fine-grained permission control
- RBAC middleware for API protection

✅ **Enhanced Authentication Service**
- JWT token management with refresh tokens
- Email verification system
- Password security with bcrypt
- Guest authentication support
- Account security features

✅ **API Controllers & Routes**
- MongoDB-based authentication endpoints
- Input validation and sanitization
- Error handling and logging
- Rate limiting protection

✅ **Frontend Integration**
- Enhanced AuthContext with RBAC support
- Role-based navigation components
- Enhanced login/registration forms
- Permission-aware UI components

## 🏗 Architecture

### Database Layer
```
MongoDB Database
├── users (UserMongo collection)
├── permissions (Permission collection)
└── role_permissions (RolePermission collection)
```

### Application Layer
```
Enhanced Authentication System
├── Models (UserMongo, Permission, RolePermission)
├── Services (AuthService, EmailService)
├── Controllers (authMongoController)
├── Middleware (RBAC, validation)
├── Routes (authMongoRoutes)
└── Frontend (AuthContext, Components)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm 9+
- MongoDB 6.0+ (local or Atlas)
- Environment variables configured

### Installation

1. **Install Dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

2. **Environment Configuration**
   
   Create `server/.env.enhanced` (copy from `server/.env.enhanced.example`):
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/play-learn-spark
   MONGODB_TEST_URI=mongodb://localhost:27017/play-learn-spark-test
   
   # Authentication
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Features
   ENABLE_MONGODB=true
   ENABLE_SQLITE_FALLBACK=true
   
   # Email (Optional)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-app-password
   ```

3. **Database Setup**
   ```bash
   # Start MongoDB (if running locally)
   mongod
   
   # Initialize permissions (automatic on first run)
   npm run dev:enhanced
   ```

### Running the Application

#### Development Mode
```bash
# Backend (Enhanced Server)
cd server
npm run dev:enhanced

# Frontend (Enhanced App)
cd client
npm run dev

# Access: http://localhost:5173 (uses AppEnhanced.tsx)
```

#### Production Mode
```bash
# Build and start
cd server
npm run build
npm run start:enhanced

cd client
npm run build
npm run preview
```

## 🔐 Authentication Flow

### User Registration
1. User submits registration form with role selection
2. Input validation and sanitization
3. Password hashing with bcrypt
4. User creation in MongoDB with default permissions
5. Email verification (optional)
6. JWT token generation and response

### User Login
1. Email/password validation
2. User lookup in MongoDB
3. Password verification
4. Permission loading based on role
5. JWT access & refresh token generation
6. User session establishment

### Guest Access
1. Temporary guest user creation
2. Limited permission assignment
3. Session-based tracking
4. Conversion prompts to registered user

### Permission Checking
1. JWT token validation
2. User role and permission loading
3. Route/action permission verification
4. Access granted or denied

## 👥 User Roles & Permissions

### Role Hierarchy

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Admin** | System administrators | All permissions, user management, system settings |
| **Educator** | Teachers and instructors | Content creation, student management, analytics |
| **Parent** | Parents and guardians | Child progress monitoring, family settings |
| **Child** | Student learners | Learning activities, progress tracking |
| **Guest** | Temporary visitors | Limited activity access, no data persistence |

### Default Permissions

#### Admin Permissions
- `users.create`, `users.read`, `users.update`, `users.delete`
- `content.create`, `content.read`, `content.update`, `content.delete`
- `analytics.read`, `system.monitor`, `permissions.manage`

#### Educator Permissions
- `content.create`, `content.read`, `content.update`
- `students.read`, `students.update`, `analytics.read`
- `activities.create`, `activities.manage`

#### Parent Permissions
- `children.read`, `children.update`, `progress.read`
- `activities.read`, `reports.read`

#### Child Permissions
- `activities.read`, `activities.participate`
- `progress.read`, `achievements.read`

#### Guest Permissions
- `activities.read` (limited), `content.browse`

## 🛡 Security Features

### Password Security
- Bcrypt hashing with salt rounds
- Minimum password requirements
- Password change tracking
- Account lockout after failed attempts

### JWT Token Management
- Short-lived access tokens (1 hour)
- Long-lived refresh tokens (7 days)
- Automatic token refresh
- Token blacklisting support

### Input Validation
- Express-validator middleware
- Schema validation with Mongoose
- XSS prevention
- SQL injection protection

### Rate Limiting
- Authentication endpoint protection
- IP-based rate limiting
- Gradual backoff for repeated failures

## 🧪 Testing

### Running Tests
```bash
# All enhanced tests
npm run test:enhanced

# Authentication tests only
npm run test:auth

# Test coverage report
npm run test:coverage
```

### Test Categories
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **RBAC Tests**: Permission system validation
- **Security Tests**: Authentication flow testing

## 🔄 Data Migration

### SQLite to MongoDB Migration

```bash
# Dry run (safe preview)
npm run migrate:dry-run

# Live migration
npm run migrate

# Rollback if needed
npm run migrate:rollback
```

### Migration Features
- User account preservation
- Role mapping and assignment
- Progress data transfer
- Preference migration
- Data integrity validation

## 🖥 Frontend Components

### Enhanced Components
- `EnhancedLoginForm`: Multi-role login with guest access
- `EnhancedRegistrationForm`: Step-by-step registration with role selection
- `RoleBasedNavigation`: Dynamic navigation based on user permissions
- `RoleBasedDashboard`: Customized dashboard per user role
- `EnhancedAuthGuard`: Route protection with permission checking

### Usage Examples

#### Route Protection
```tsx
<EnhancedAuthGuard 
  requiredRoles={['admin', 'educator']}
  requiredPermissions={[{ permission: 'content.create', action: 'write' }]}
>
  <ContentManagement />
</EnhancedAuthGuard>
```

#### Permission Checking
```tsx
const { hasPermission } = useAuth();

if (hasPermission('users.manage', 'write')) {
  return <UserManagementButton />;
}
```

## 📊 API Endpoints

### Authentication Endpoints
```
POST /api/auth/mongo/register     - User registration
POST /api/auth/mongo/login        - User login
POST /api/auth/mongo/login-guest  - Guest login
POST /api/auth/mongo/refresh-token - Token refresh
GET  /api/auth/mongo/profile      - Get user profile
PUT  /api/auth/mongo/profile      - Update user profile
POST /api/auth/mongo/logout       - User logout
```

### Request/Response Examples

#### Registration
```json
// Request
{
  "email": "teacher@school.com",
  "password": "securepassword123",
  "username": "teacher_jane",
  "role": "educator",
  "firstName": "Jane",
  "lastName": "Smith"
}

// Response
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "email": "teacher@school.com",
    "role": "educator",
    "profile": { ... }
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## 🔧 Configuration

### Feature Flags
```env
# Enable MongoDB authentication
ENABLE_MONGODB=true

# Keep SQLite as fallback
ENABLE_SQLITE_FALLBACK=true

# Email verification
ENABLE_EMAIL_VERIFICATION=true

# Guest access
ENABLE_GUEST_ACCESS=true
```

### Database Configuration
```javascript
// MongoDB connection options
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
}
```

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB service
   brew services start mongodb/brew/mongodb-community
   
   # Verify connection string
   echo $MONGODB_URI
   ```

2. **Permission Denied Errors**
   ```bash
   # Reinitialize permissions
   npm run dev:enhanced
   # Permissions are auto-created on startup
   ```

3. **JWT Token Issues**
   ```bash
   # Verify JWT secrets are set
   echo $JWT_SECRET
   echo $JWT_REFRESH_SECRET
   ```

4. **Migration Errors**
   ```bash
   # Run migration dry-run first
   npm run migrate:dry-run
   
   # Check migration logs
   cat migration-report-*.txt
   ```

## 📈 Performance Considerations

### Database Optimization
- MongoDB indexes on email, username, role fields
- Connection pooling for concurrent requests
- Query optimization for permission checking

### Frontend Optimization
- JWT token caching in memory
- Lazy loading of role-based components
- Efficient permission checking hooks

### Security Performance
- Rate limiting to prevent brute force
- Token refresh to minimize re-authentication
- Cached permission lookups

## 🔮 Next Steps (Upcoming Batches)

### Batch 2: Advanced Content Management (Weeks 3-4)
- Content versioning system
- Collaborative editing tools
- Advanced media handling

### Batch 3: Real-time Learning Analytics (Weeks 5-6)
- Live progress tracking
- Real-time dashboards
- Performance metrics

### Batch 4: Multi-tenant Architecture (Weeks 7-8)
- School/organization isolation
- Custom branding per tenant
- Tenant-specific configurations

## 💡 Best Practices

### Development
1. Always use the enhanced server (`npm run dev:enhanced`)
2. Test with different user roles during development
3. Use TypeScript for type safety
4. Follow the permission naming convention

### Security
1. Never expose JWT secrets in client-side code
2. Implement proper input validation
3. Use HTTPS in production
4. Regularly rotate JWT secrets

### Database
1. Use transactions for critical operations
2. Implement proper indexing strategy
3. Monitor database performance
4. Regular backup procedures

## 📚 Additional Resources

- [MongoDB Node.js Driver Documentation](https://docs.mongodb.com/drivers/node/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Security Guidelines](https://snyk.io/blog/10-react-security-best-practices/)

---

**Batch 1 Status**: ✅ **COMPLETED**  
**Next Batch**: Batch 2 - Advanced Content Management System  
**Estimated Completion**: Week 2 of 26-week implementation plan