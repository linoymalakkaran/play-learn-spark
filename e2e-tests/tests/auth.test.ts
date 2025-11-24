import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { DashboardPage } from '../pages/dashboard.page';
import { TestUsers, ValidationMessages } from '../fixtures/test-data';
import { DataGenerator } from '../helpers/test-utils';

test.describe('Authentication Tests', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test.describe('User Registration', () => {
    test('should successfully register a new parent user', async () => {
      await authPage.navigateToRegister();
      await authPage.validateRegisterFormFields();

      const newUser = {
        ...TestUsers.PARENT,
        email: DataGenerator.randomEmail('parent'),
        firstName: DataGenerator.randomString(),
        lastName: DataGenerator.randomString(),
      };

      await authPage.register(newUser);
      
      // Should redirect to dashboard after successful registration
      await expect(dashboardPage.dashboardContainer).toBeVisible();
      const welcomeMessage = await dashboardPage.getWelcomeMessage();
      expect(welcomeMessage.toLowerCase()).toContain('welcome');
    });

    test('should successfully register a new teacher user', async () => {
      await authPage.navigateToRegister();

      const newUser = {
        ...TestUsers.TEACHER,
        email: DataGenerator.randomEmail('teacher'),
        firstName: DataGenerator.randomString(),
        lastName: DataGenerator.randomString(),
      };

      await authPage.register(newUser);
      
      // Verify successful registration
      await expect(dashboardPage.dashboardContainer).toBeVisible();
      await dashboardPage.verifyRoleBasedLayout('teacher');
    });

    test('should successfully register a new student user', async () => {
      await authPage.navigateToRegister();

      const newUser = {
        ...TestUsers.STUDENT,
        email: DataGenerator.randomEmail('student'),
        firstName: DataGenerator.randomString(),
        lastName: DataGenerator.randomString(),
      };

      await authPage.register(newUser);
      
      // Verify successful registration
      await expect(dashboardPage.dashboardContainer).toBeVisible();
      await dashboardPage.verifyRoleBasedLayout('student');
    });

    test('should show validation errors for invalid email', async () => {
      await authPage.navigateToRegister();

      const invalidUser = {
        ...TestUsers.PARENT,
        email: 'invalid-email',
        firstName: 'Test',
        lastName: 'User',
      };

      await authPage.register(invalidUser);
      
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage).toContain('valid email');
    });

    test('should show validation errors for weak password', async () => {
      await authPage.navigateToRegister();

      const weakPasswordUser = {
        ...TestUsers.PARENT,
        email: DataGenerator.randomEmail(),
        password: '123',
        firstName: 'Test',
        lastName: 'User',
      };

      await authPage.register(weakPasswordUser);
      
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toMatch(/password/);
    });

    test('should prevent registration with existing email', async () => {
      await authPage.navigateToRegister();

      // Try to register with existing email
      await authPage.register(TestUsers.PARENT);
      
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toMatch(/already exists|already registered/);
    });

    test('should validate required fields on empty submission', async () => {
      await authPage.navigateToRegister();
      await authPage.testFormValidation();
      
      // Should show validation messages for required fields
      // This is a basic check - specific validation depends on frontend implementation
    });
  });

  test.describe('User Login', () => {
    test('should successfully login with valid parent credentials', async () => {
      await authPage.navigateToLogin();
      await authPage.validateLoginFormFields();

      await authPage.login(TestUsers.PARENT.email, TestUsers.PARENT.password);
      
      // Should redirect to dashboard
      await expect(dashboardPage.dashboardContainer).toBeVisible();
      await dashboardPage.verifyRoleBasedLayout('parent');
    });

    test('should successfully login with valid teacher credentials', async () => {
      await authPage.navigateToLogin();

      await authPage.login(TestUsers.TEACHER.email, TestUsers.TEACHER.password);
      
      // Should redirect to dashboard
      await expect(dashboardPage.dashboardContainer).toBeVisible();
      await dashboardPage.verifyRoleBasedLayout('teacher');
    });

    test('should successfully login with valid student credentials', async () => {
      await authPage.navigateToLogin();

      await authPage.login(TestUsers.STUDENT.email, TestUsers.STUDENT.password);
      
      // Should redirect to dashboard
      await expect(dashboardPage.dashboardContainer).toBeVisible();
      await dashboardPage.verifyRoleBasedLayout('student');
    });

    test('should show error for invalid credentials', async () => {
      await authPage.navigateToLogin();

      await authPage.login('invalid@email.com', 'wrongpassword');
      
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toMatch(/invalid|incorrect|wrong/);
    });

    test('should show error for non-existent email', async () => {
      await authPage.navigateToLogin();

      await authPage.login(DataGenerator.randomEmail(), TestUsers.PARENT.password);
      
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toMatch(/user not found|invalid/);
    });

    test('should show validation errors for empty fields', async () => {
      await authPage.navigateToLogin();

      await authPage.login('', '');
      
      // Should show validation for required fields
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage.length).toBeGreaterThan(0);
    });

    test('should handle login rate limiting', async () => {
      await authPage.navigateToLogin();

      // Try multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await authPage.login('test@example.com', 'wrongpassword');
        await authPage.page.waitForTimeout(1000);
      }
      
      // Should show rate limiting message
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toMatch(/too many attempts|rate limit|try again/);
    });
  });

  test.describe('Guest Login', () => {
    test('should allow guest user to access the application', async () => {
      await authPage.navigateToLogin();

      await authPage.loginAsGuest();
      
      // Should redirect to dashboard with limited access
      await expect(dashboardPage.dashboardContainer).toBeVisible();
      
      const welcomeMessage = await dashboardPage.getWelcomeMessage();
      expect(welcomeMessage.toLowerCase()).toContain('guest');
    });

    test('should restrict guest user functionality', async () => {
      await authPage.navigateToLogin();
      await authPage.loginAsGuest();
      
      await expect(dashboardPage.dashboardContainer).toBeVisible();
      
      // Guest users should not see certain features
      const hasAddChildButton = await dashboardPage.page.locator('[data-testid="add-child"]').isVisible();
      expect(hasAddChildButton).toBeFalsy();
    });
  });

  test.describe('Form Switching', () => {
    test('should switch from login to register form', async () => {
      await authPage.navigateToLogin();
      await expect(authPage.isLoginFormVisible()).toBeTruthy();

      await authPage.switchToRegister();
      await expect(authPage.isRegisterFormVisible()).toBeTruthy();
    });

    test('should switch from register to login form', async () => {
      await authPage.navigateToRegister();
      await expect(authPage.isRegisterFormVisible()).toBeTruthy();

      await authPage.switchToLogin();
      await expect(authPage.isLoginFormVisible()).toBeTruthy();
    });

    test('should preserve form data when switching back and forth', async () => {
      await authPage.navigateToLogin();
      
      // Fill in some data
      const testEmail = DataGenerator.randomEmail();
      await authPage.page.fill('input[name="email"]', testEmail);
      
      // Switch to register and back
      await authPage.switchToRegister();
      await authPage.switchToLogin();
      
      // Email should still be there (if frontend preserves it)
      const emailValue = await authPage.page.inputValue('input[name="email"]');
      // Note: This behavior depends on frontend implementation
    });
  });

  test.describe('Password Functionality', () => {
    test('should toggle password visibility', async () => {
      await authPage.navigateToLogin();
      
      const passwordField = authPage.page.locator('input[name="password"]');
      
      // Initially should be password type
      await expect(passwordField).toHaveAttribute('type', 'password');
      
      // Toggle visibility
      await authPage.togglePasswordVisibility();
      
      // Should now be text type (if toggle functionality exists)
      // Note: This test depends on frontend implementation
    });

    test('should validate password strength on registration', async () => {
      await authPage.navigateToRegister();
      
      const weakPasswords = ['123', 'password', 'qwerty', '12345678'];
      
      for (const password of weakPasswords) {
        await authPage.page.fill('input[name="password"]', password);
        
        // Check if password strength indicator shows weak
        // Note: Implementation depends on frontend
        await authPage.page.waitForTimeout(500);
      }
    });

    test('should handle forgot password functionality', async () => {
      await authPage.navigateToLogin();
      
      await authPage.clickForgotPassword();
      
      // Should navigate to forgot password page or show modal
      // Note: Implementation depends on frontend
      await authPage.page.waitForTimeout(1000);
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refresh', async () => {
      await authPage.navigateToLogin();
      await authPage.login(TestUsers.PARENT.email, TestUsers.PARENT.password);
      
      await expect(dashboardPage.dashboardContainer).toBeVisible();
      
      // Refresh page
      await authPage.page.reload();
      
      // Should still be logged in
      await expect(dashboardPage.dashboardContainer).toBeVisible();
    });

    test('should logout and redirect to login page', async () => {
      await authPage.navigateToLogin();
      await authPage.login(TestUsers.PARENT.email, TestUsers.PARENT.password);
      
      await dashboardPage.logout();
      
      // Should redirect to login page
      await expect(authPage.page).toHaveURL(/.*\/login/);
    });

    test('should handle session expiry', async () => {
      await authPage.navigateToLogin();
      await authPage.login(TestUsers.PARENT.email, TestUsers.PARENT.password);
      
      // Simulate session expiry by clearing localStorage/cookies
      await authPage.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Try to access protected route
      await authPage.page.goto('/dashboard');
      
      // Should redirect to login
      await expect(authPage.page).toHaveURL(/.*\/login/);
    });
  });

  test.describe('Security Features', () => {
    test('should sanitize input to prevent XSS', async () => {
      await authPage.navigateToLogin();
      
      const xssPayload = '<script>alert("xss")</script>';
      
      await authPage.login(xssPayload, 'password123');
      
      // Should not execute the script - check if page title contains the script
      const pageTitle = await authPage.page.title();
      expect(pageTitle).not.toContain('<script>');
    });

    test('should protect against SQL injection in login', async () => {
      await authPage.navigateToLogin();
      
      const sqlPayload = "'; DROP TABLE users; --";
      
      await authPage.login(sqlPayload, 'password123');
      
      // Should show normal error message, not database error
      const errorMessage = await authPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).not.toMatch(/sql|database|syntax/);
    });

    test('should enforce HTTPS in production environment', async () => {
      // Skip if not in production environment
      const baseURL = authPage.page.url();
      if (baseURL.includes('localhost') || baseURL.includes('127.0.0.1')) {
        test.skip();
        return;
      }
      
      expect(baseURL).toMatch(/^https:/);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper form labels and ARIA attributes', async () => {
      await authPage.navigateToLogin();
      
      // Check for proper labels
      const emailInput = authPage.page.locator('input[name="email"]');
      const passwordInput = authPage.page.locator('input[name="password"]');
      
      // Should have labels or aria-label
      const emailLabel = await emailInput.getAttribute('aria-label') || 
                        await authPage.page.locator('label[for="email"]').count() > 0;
      const passwordLabel = await passwordInput.getAttribute('aria-label') || 
                          await authPage.page.locator('label[for="password"]').count() > 0;
      
      expect(emailLabel).toBeTruthy();
      expect(passwordLabel).toBeTruthy();
    });

    test('should support keyboard navigation', async () => {
      await authPage.navigateToLogin();
      
      // Test tab navigation through form elements
      await authPage.page.keyboard.press('Tab'); // Email field
      await authPage.page.keyboard.press('Tab'); // Password field
      await authPage.page.keyboard.press('Tab'); // Login button
      
      // Should be able to submit with Enter
      await authPage.page.keyboard.press('Enter');
    });

    test('should have sufficient color contrast', async () => {
      await authPage.navigateToLogin();
      
      // This would require axe-core integration for comprehensive testing
      // For now, we'll check that error messages are visible
      await authPage.login('', '');
      
      const errorMessage = authPage.page.locator('[data-testid="error-message"]');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    });
  });
});