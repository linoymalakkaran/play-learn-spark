/**
 * Enhanced Authentication System Test Suite
 * 
 * Comprehensive tests for MongoDB-based authentication with RBAC
 */

import request from 'supertest';
import { expect } from 'chai';
import { describe, it, before, after, beforeEach } from 'mocha';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserMongo } from '../src/models/UserMongo.js';
import { Permission, RolePermission } from '../src/models/Permission.js';
import { AuthService } from '../src/services/authService.js';
import { connectMongoDB, disconnectMongoDB } from '../src/config/database-mongo.js';
import app from '../src/server-enhanced.js';

describe('Enhanced Authentication System', () => {
  let authService: AuthService;
  let testUsers: any[] = [];
  let adminToken: string;
  let educatorToken: string;
  let parentToken: string;
  let childToken: string;
  let guestToken: string;

  before(async () => {
    // Connect to test database
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/play-learn-spark-test';
    
    await connectMongoDB();
    authService = new AuthService();
    
    // Initialize permissions
    await Permission.deleteMany({});
    await RolePermission.deleteMany({});
    const { initializeDefaultPermissions } = await import('../src/models/Permission.js');
    await initializeDefaultPermissions();
  });

  after(async () => {
    // Cleanup test data
    await UserMongo.deleteMany({});
    await Permission.deleteMany({});
    await RolePermission.deleteMany({});
    await disconnectMongoDB();
  });

  beforeEach(async () => {
    // Clear users before each test
    await UserMongo.deleteMany({});
    testUsers = [];
  });

  describe('User Registration', () => {
    it('should register a new parent user successfully', async () => {
      const userData = {
        email: 'parent@test.com',
        password: 'password123',
        username: 'testparent',
        role: 'parent',
        firstName: 'Test',
        lastName: 'Parent'
      };

      const response = await request(app)
        .post('/api/auth/mongo/register')
        .send(userData)
        .expect(201);

      expect(response.body).to.have.property('message', 'User registered successfully');
      expect(response.body).to.have.property('user');
      expect(response.body.user).to.have.property('email', userData.email);
      expect(response.body.user).to.have.property('role', userData.role);
      expect(response.body.user).to.not.have.property('password');

      // Verify user was created in database
      const user = await UserMongo.findOne({ email: userData.email });
      expect(user).to.exist;
      expect(user?.role).to.equal(userData.role);
      expect(user?.emailVerified).to.be.false;
    });

    it('should register a new educator user successfully', async () => {
      const userData = {
        email: 'educator@test.com',
        password: 'password123',
        username: 'testeducator',
        role: 'educator',
        firstName: 'Test',
        lastName: 'Educator'
      };

      const response = await request(app)
        .post('/api/auth/mongo/register')
        .send(userData)
        .expect(201);

      expect(response.body.user).to.have.property('role', 'educator');
    });

    it('should register a new child user successfully', async () => {
      const userData = {
        email: 'child@test.com',
        password: 'password123',
        username: 'testchild',
        role: 'child',
        firstName: 'Test',
        lastName: 'Child',
        age: 8,
        grade: '3rd Grade'
      };

      const response = await request(app)
        .post('/api/auth/mongo/register')
        .send(userData)
        .expect(201);

      expect(response.body.user).to.have.property('role', 'child');
      expect(response.body.user.profile).to.have.property('age', 8);
      expect(response.body.user.profile).to.have.property('grade', '3rd Grade');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        username: 'testuser',
        role: 'parent',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/mongo/register')
        .send(userData)
        .expect(400);

      expect(response.body).to.have.property('error');
    });

    it('should reject registration with duplicate email', async () => {
      const userData = {
        email: 'duplicate@test.com',
        password: 'password123',
        username: 'testuser1',
        role: 'parent',
        firstName: 'Test',
        lastName: 'User'
      };

      // First registration
      await request(app)
        .post('/api/auth/mongo/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const duplicateData = { ...userData, username: 'testuser2' };
      const response = await request(app)
        .post('/api/auth/mongo/register')
        .send(duplicateData)
        .expect(409);

      expect(response.body).to.have.property('error', 'User already exists');
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@test.com',
        password: '123', // Too short
        username: 'testuser',
        role: 'parent',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/mongo/register')
        .send(userData)
        .expect(400);

      expect(response.body).to.have.property('error');
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Create test users for login tests
      const users = [
        {
          email: 'admin@test.com',
          password: await bcrypt.hash('password123', 10),
          username: 'testadmin',
          role: 'admin',
          profile: { firstName: 'Test', lastName: 'Admin' },
          emailVerified: true
        },
        {
          email: 'educator@test.com',
          password: await bcrypt.hash('password123', 10),
          username: 'testeducator',
          role: 'educator',
          profile: { firstName: 'Test', lastName: 'Educator' },
          emailVerified: true
        },
        {
          email: 'parent@test.com',
          password: await bcrypt.hash('password123', 10),
          username: 'testparent',
          role: 'parent',
          profile: { firstName: 'Test', lastName: 'Parent' },
          emailVerified: true
        },
        {
          email: 'child@test.com',
          password: await bcrypt.hash('password123', 10),
          username: 'testchild',
          role: 'child',
          profile: { firstName: 'Test', lastName: 'Child' },
          emailVerified: true
        }
      ];

      for (const userData of users) {
        const user = new UserMongo(userData);
        await user.save();
        testUsers.push(user);
      }
    });

    it('should login admin user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/mongo/login')
        .send({
          email: 'admin@test.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).to.have.property('message', 'Login successful');
      expect(response.body).to.have.property('user');
      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('refreshToken');
      expect(response.body.user).to.have.property('role', 'admin');

      adminToken = response.body.token;
    });

    it('should login educator user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/mongo/login')
        .send({
          email: 'educator@test.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.user).to.have.property('role', 'educator');
      educatorToken = response.body.token;
    });

    it('should login parent user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/mongo/login')
        .send({
          email: 'parent@test.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.user).to.have.property('role', 'parent');
      parentToken = response.body.token;
    });

    it('should login child user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/mongo/login')
        .send({
          email: 'child@test.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.user).to.have.property('role', 'child');
      childToken = response.body.token;
    });

    it('should allow guest login', async () => {
      const response = await request(app)
        .post('/api/auth/mongo/login-guest')
        .expect(200);

      expect(response.body).to.have.property('message', 'Guest login successful');
      expect(response.body).to.have.property('user');
      expect(response.body).to.have.property('token');
      expect(response.body.user).to.have.property('role', 'guest');

      guestToken = response.body.token;
    });

    it('should reject login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/mongo/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).to.have.property('error', 'Invalid credentials');
    });

    it('should reject login for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/mongo/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).to.have.property('error', 'Invalid credentials');
    });
  });

  describe('Token Refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Create a test user and get tokens
      const user = new UserMongo({
        email: 'refresh@test.com',
        password: await bcrypt.hash('password123', 10),
        username: 'refreshuser',
        role: 'parent',
        profile: { firstName: 'Refresh', lastName: 'User' },
        emailVerified: true
      });
      await user.save();

      const response = await request(app)
        .post('/api/auth/mongo/login')
        .send({
          email: 'refresh@test.com',
          password: 'password123'
        });

      refreshToken = response.body.refreshToken;
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/mongo/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/mongo/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).to.have.property('error', 'Invalid refresh token');
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    beforeEach(async () => {
      // Create test users and get tokens
      const users = [
        { email: 'admin@test.com', role: 'admin' },
        { email: 'educator@test.com', role: 'educator' },
        { email: 'parent@test.com', role: 'parent' },
        { email: 'child@test.com', role: 'child' }
      ];

      for (const userData of users) {
        const user = new UserMongo({
          ...userData,
          password: await bcrypt.hash('password123', 10),
          username: userData.email.split('@')[0],
          profile: { firstName: 'Test', lastName: 'User' },
          emailVerified: true
        });
        await user.save();

        const response = await request(app)
          .post('/api/auth/mongo/login')
          .send({
            email: userData.email,
            password: 'password123'
          });

        switch (userData.role) {
          case 'admin':
            adminToken = response.body.token;
            break;
          case 'educator':
            educatorToken = response.body.token;
            break;
          case 'parent':
            parentToken = response.body.token;
            break;
          case 'child':
            childToken = response.body.token;
            break;
        }
      }

      // Guest login
      const guestResponse = await request(app)
        .post('/api/auth/mongo/login-guest');
      guestToken = guestResponse.body.token;
    });

    it('should allow admin to access protected admin routes', async () => {
      const response = await request(app)
        .get('/api/auth/mongo/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.user).to.have.property('role', 'admin');
    });

    it('should allow educator to access protected routes', async () => {
      const response = await request(app)
        .get('/api/auth/mongo/profile')
        .set('Authorization', `Bearer ${educatorToken}`)
        .expect(200);

      expect(response.body.user).to.have.property('role', 'educator');
    });

    it('should allow parent to access protected routes', async () => {
      const response = await request(app)
        .get('/api/auth/mongo/profile')
        .set('Authorization', `Bearer ${parentToken}`)
        .expect(200);

      expect(response.body.user).to.have.property('role', 'parent');
    });

    it('should allow child to access protected routes', async () => {
      const response = await request(app)
        .get('/api/auth/mongo/profile')
        .set('Authorization', `Bearer ${childToken}`)
        .expect(200);

      expect(response.body.user).to.have.property('role', 'child');
    });

    it('should reject guest access to protected routes', async () => {
      const response = await request(app)
        .get('/api/auth/mongo/profile')
        .set('Authorization', `Bearer ${guestToken}`)
        .expect(403);

      expect(response.body).to.have.property('error');
    });

    it('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/auth/mongo/profile')
        .expect(401);

      expect(response.body).to.have.property('error', 'No token provided');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/mongo/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).to.have.property('error', 'Invalid token');
    });
  });

  describe('Permission System', () => {
    it('should initialize default permissions correctly', async () => {
      const permissions = await Permission.find();
      expect(permissions.length).to.be.greaterThan(0);

      const rolePermissions = await RolePermission.find();
      expect(rolePermissions.length).to.be.greaterThan(0);

      // Check if admin has all permissions
      const adminPermissions = await RolePermission.find({ role: 'admin' });
      expect(adminPermissions.length).to.be.greaterThan(0);
    });

    it('should correctly check user permissions', async () => {
      // Create a test user
      const user = new UserMongo({
        email: 'permission@test.com',
        password: await bcrypt.hash('password123', 10),
        username: 'permissionuser',
        role: 'educator',
        profile: { firstName: 'Permission', lastName: 'User' },
        emailVerified: true
      });
      await user.save();

      // Get role permissions for educator
      const rolePermissions = await RolePermission.find({ role: 'educator' });
      expect(rolePermissions.length).to.be.greaterThan(0);

      // Verify educator has content permissions
      const hasContentPermission = rolePermissions.some(rp => 
        rp.permissions.some(p => p.permission === 'content.create')
      );
      expect(hasContentPermission).to.be.true;
    });
  });

  describe('User Profile Management', () => {
    let userToken: string;

    beforeEach(async () => {
      const user = new UserMongo({
        email: 'profile@test.com',
        password: await bcrypt.hash('password123', 10),
        username: 'profileuser',
        role: 'parent',
        profile: { firstName: 'Profile', lastName: 'User' },
        emailVerified: true
      });
      await user.save();

      const response = await request(app)
        .post('/api/auth/mongo/login')
        .send({
          email: 'profile@test.com',
          password: 'password123'
        });

      userToken = response.body.token;
    });

    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/auth/mongo/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).to.have.property('user');
      expect(response.body.user).to.have.property('email', 'profile@test.com');
      expect(response.body.user).to.have.property('role', 'parent');
      expect(response.body.user).to.not.have.property('password');
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        profile: {
          firstName: 'Updated',
          lastName: 'Name',
          preferences: {
            language: 'es',
            difficulty: 'hard'
          }
        }
      };

      const response = await request(app)
        .put('/api/auth/mongo/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).to.have.property('message', 'Profile updated successfully');
      expect(response.body.user.profile).to.have.property('firstName', 'Updated');
      expect(response.body.user.profile).to.have.property('lastName', 'Name');
    });
  });

  describe('Security Features', () => {
    it('should hash passwords correctly', async () => {
      const user = new UserMongo({
        email: 'security@test.com',
        password: 'plainpassword',
        username: 'securityuser',
        role: 'parent',
        profile: { firstName: 'Security', lastName: 'User' }
      });

      await user.save();
      
      // Password should be hashed
      expect(user.password).to.not.equal('plainpassword');
      expect(user.password.length).to.be.greaterThan(20);

      // Should be able to verify password
      const isValid = await bcrypt.compare('plainpassword', user.password);
      expect(isValid).to.be.true;
    });

    it('should generate secure JWT tokens', async () => {
      const user = await UserMongo.findOne({ email: 'security@test.com' });
      expect(user).to.exist;

      const result = await authService.login('security@test.com', 'plainpassword');
      expect(result).to.have.property('token');
      expect(result).to.have.property('refreshToken');

      // Token should be valid JWT
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET || 'test-secret');
      expect(decoded).to.have.property('userId');
      expect(decoded).to.have.property('role', 'parent');
    });
  });
});

export default {};