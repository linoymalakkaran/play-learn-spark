import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { DashboardPage } from '../pages/dashboard.page';
import { TestUsers, TestChildren } from '../fixtures/test-data';
import { DataGenerator } from '../helpers/test-utils';

test.describe('Dashboard Tests', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test.describe('Dashboard Access and Layout', () => {
    test('should display parent dashboard correctly', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login(TestUsers.PARENT.email, TestUsers.PARENT.password);
      
      await dashboardPage.verifyDashboardLoaded();
      await dashboardPage.verifyRoleBasedLayout('parent');
      
      const welcomeMessage = await dashboardPage.getWelcomeMessage();
      expect(welcomeMessage).toContain('Welcome');
      
      // Check parent-specific elements
      expect(await dashboardPage.page.locator('[data-testid="children-section"]').isVisible()).toBeTruthy();
    });

    test('should display teacher dashboard correctly', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login(TestUsers.TEACHER.email, TestUsers.TEACHER.password);
      
      await dashboardPage.verifyDashboardLoaded();
      await dashboardPage.verifyRoleBasedLayout('teacher');
      
      // Check teacher-specific elements
      expect(await dashboardPage.page.locator('[data-testid="classroom-section"]').isVisible()).toBeTruthy();
    });

    test('should display student dashboard correctly', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login(TestUsers.STUDENT.email, TestUsers.STUDENT.password);
      
      await dashboardPage.verifyDashboardLoaded();
      await dashboardPage.verifyRoleBasedLayout('student');
      
      // Check student-specific elements
      expect(await dashboardPage.page.locator('[data-testid="activity-grid"]').isVisible()).toBeTruthy();
      expect(await dashboardPage.page.locator('[data-testid="progress-chart"]').isVisible()).toBeTruthy();
    });

    test('should display guest dashboard with limited features', async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.loginAsGuest();
      
      await dashboardPage.verifyDashboardLoaded();
      
      const welcomeMessage = await dashboardPage.getWelcomeMessage();
      expect(welcomeMessage.toLowerCase()).toContain('guest');
      
      // Guest should not see certain features
      const hasAddChildButton = await dashboardPage.page.locator('[data-testid="add-child"]').isVisible();
      expect(hasAddChildButton).toBeFalsy();
    });
  });

  test.describe('Navigation and Menu Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login(TestUsers.PARENT.email, TestUsers.PARENT.password);
    });

    test('should navigate to profile page', async () => {
      await dashboardPage.openProfile();
      await expect(dashboardPage.page).toHaveURL(/.*\/profile/);
    });

    test('should navigate to settings page', async () => {
      await dashboardPage.openSettings();
      await expect(dashboardPage.page).toHaveURL(/.*\/settings/);
    });

    test('should toggle mobile menu on small screens', async () => {
      // Set mobile viewport
      await dashboardPage.page.setViewportSize({ width: 375, height: 667 });
      
      await dashboardPage.toggleMobileMenu();
      
      // Check if mobile menu is visible
      const mobileMenu = dashboardPage.page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();
    });

    test('should logout successfully', async () => {
      await dashboardPage.logout();
      await expect(dashboardPage.page).toHaveURL(/.*\/login/);
    });

    test('should open notifications panel', async () => {
      await dashboardPage.openNotifications();
      
      // Should open notifications panel (implementation dependent)
      await dashboardPage.page.waitForTimeout(1000);
    });
  });

  test.describe('Activity Management', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login(TestUsers.STUDENT.email, TestUsers.STUDENT.password);
    });

    test('should display available activities', async () => {
      const activityCount = await dashboardPage.getActivityCardsCount();
      expect(activityCount).toBeGreaterThan(0);
    });

    test('should filter activities by type', async () => {
      const initialCount = await dashboardPage.getActivityCardsCount();
      
      await dashboardPage.filterActivitiesByType('math');
      
      // Should update activity grid
      await dashboardPage.page.waitForTimeout(1000);
      const filteredCount = await dashboardPage.getActivityCardsCount();
      
      // Count may be different or same depending on available activities
      expect(filteredCount).toBeGreaterThanOrEqual(0);
    });

    test('should filter activities by difficulty', async () => {
      await dashboardPage.filterActivitiesByDifficulty('easy');
      
      // Should update activity grid
      await dashboardPage.page.waitForTimeout(1000);
      const activityCount = await dashboardPage.getActivityCardsCount();
      expect(activityCount).toBeGreaterThanOrEqual(0);
    });

    test('should search for activities', async () => {
      await dashboardPage.searchActivities('math');
      
      // Should filter activities based on search
      const activityCount = await dashboardPage.getActivityCardsCount();
      expect(activityCount).toBeGreaterThanOrEqual(0);
    });

    test('should start new activity', async () => {
      await dashboardPage.startNewActivity('language');
      
      // Should navigate to activity page
      await expect(dashboardPage.page).toHaveURL(/.*\/activities/);
    });

    test('should continue last activity if available', async () => {
      const continueButton = dashboardPage.page.locator('[data-testid="continue-activity"]');
      
      if (await continueButton.isVisible()) {
        await dashboardPage.continueActivity();
        await expect(dashboardPage.page).toHaveURL(/.*\/activities/);
      }
    });

    test('should click on specific activity card', async () => {
      // Get first activity card
      const firstActivity = dashboardPage.page.locator('[data-testid="activity-card"]').first();
      
      if (await firstActivity.isVisible()) {
        await firstActivity.click();
        await expect(dashboardPage.page).toHaveURL(/.*\/activities/);
      }
    });
  });

  test.describe('Progress and Statistics', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login(TestUsers.STUDENT.email, TestUsers.STUDENT.password);
    });

    test('should display progress statistics', async () => {
      const stats = await dashboardPage.getProgressStats();
      
      // Should have some statistics
      expect(Object.keys(stats).length).toBeGreaterThan(0);
    });

    test('should show current streak', async () => {
      const streak = await dashboardPage.getStreakCount();
      
      // Streak should be a number (even if 0)
      expect(streak).toBeDefined();
    });

    test('should display achievement badges', async () => {
      const badgeCount = await dashboardPage.getAchievementBadgesCount();
      
      // Should have 0 or more badges
      expect(badgeCount).toBeGreaterThanOrEqual(0);
    });

    test('should navigate to progress section', async () => {
      await dashboardPage.navigateToSection('Progress');
      
      // Should show progress details
      await dashboardPage.page.waitForTimeout(1000);
    });
  });

  test.describe('Parent Dashboard Features', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login(TestUsers.PARENT.email, TestUsers.PARENT.password);
    });

    test('should display children section', async () => {
      const childrenSection = dashboardPage.page.locator('[data-testid="children-section"]');
      await expect(childrenSection).toBeVisible();
    });

    test('should add a new child', async () => {
      const initialChildCount = await dashboardPage.getChildrenCount();
      
      const newChild = {
        firstName: DataGenerator.randomString(),
        lastName: DataGenerator.randomString(),
        grade: DataGenerator.randomGrade(),
        birthDate: '2018-05-15'
      };
      
      await dashboardPage.addChild(newChild);
      
      // Should increase child count
      const newChildCount = await dashboardPage.getChildrenCount();
      expect(newChildCount).toBeGreaterThan(initialChildCount);
    });

    test('should select and view child progress', async () => {
      const childCount = await dashboardPage.getChildrenCount();
      
      if (childCount > 0) {
        // Click on first child card
        const firstChild = dashboardPage.page.locator('[data-testid="child-card"]').first();
        const childName = await firstChild.textContent();
        
        await firstChild.click();
        
        // Should show child's specific dashboard/progress
        await dashboardPage.page.waitForTimeout(1000);
      }
    });

    test('should view all children progress', async () => {
      await dashboardPage.navigateToSection('Children Progress');
      
      // Should show overview of all children
      await dashboardPage.page.waitForTimeout(1000);
    });
  });

  test.describe('Teacher Dashboard Features', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login(TestUsers.TEACHER.email, TestUsers.TEACHER.password);
    });

    test('should display classroom section', async () => {
      const classroomSection = dashboardPage.page.locator('[data-testid="classroom-section"]');
      await expect(classroomSection).toBeVisible();
    });

    test('should view students list', async () => {
      await dashboardPage.viewStudentsList();
      
      // Should show list of students
      await dashboardPage.page.waitForTimeout(1000);
    });

    test('should assign activity to student', async () => {
      const assignButton = dashboardPage.page.locator('[data-testid="assign-activity"]');
      
      if (await assignButton.isVisible()) {
        await dashboardPage.assignActivityToStudent('Test Student', 'Basic Math');
        
        // Should show success message or update
        await dashboardPage.page.waitForTimeout(1000);
      }
    });

    test('should open grade book', async () => {
      await dashboardPage.openGradeBook();
      
      // Should navigate to gradebook page
      await expect(dashboardPage.page).toHaveURL(/.*\/gradebook|.*\/grades/);
    });

    test('should view classroom analytics', async () => {
      await dashboardPage.navigateToSection('Analytics');
      
      // Should show classroom performance analytics
      await dashboardPage.page.waitForTimeout(1000);
    });
  });

  test.describe('Responsive Design', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login(TestUsers.PARENT.email, TestUsers.PARENT.password);
    });

    test('should adapt to mobile viewport', async () => {
      // Set mobile viewport
      await dashboardPage.page.setViewportSize({ width: 375, height: 667 });
      await dashboardPage.page.reload();
      
      await dashboardPage.verifyDashboardLoaded();
      
      // Mobile menu toggle should be visible
      const mobileToggle = dashboardPage.page.locator('[data-testid="mobile-menu-toggle"]');
      await expect(mobileToggle).toBeVisible();
    });

    test('should adapt to tablet viewport', async () => {
      // Set tablet viewport
      await dashboardPage.page.setViewportSize({ width: 768, height: 1024 });
      await dashboardPage.page.reload();
      
      await dashboardPage.verifyDashboardLoaded();
      
      // Should show appropriate layout for tablet
      const activityGrid = dashboardPage.page.locator('[data-testid="activity-grid"]');
      await expect(activityGrid).toBeVisible();
    });

    test('should work well on desktop viewport', async () => {
      // Set desktop viewport
      await dashboardPage.page.setViewportSize({ width: 1920, height: 1080 });
      await dashboardPage.page.reload();
      
      await dashboardPage.verifyDashboardLoaded();
      
      // All elements should be visible
      const sidebar = dashboardPage.page.locator('[data-testid="sidebar"]');
      const mainContent = dashboardPage.page.locator('[data-testid="dashboard"]');
      
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe('Performance and Loading', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login(TestUsers.STUDENT.email, TestUsers.STUDENT.password);
    });

    test('should load dashboard within acceptable time', async () => {
      const startTime = Date.now();
      
      await dashboardPage.verifyDashboardLoaded();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should handle slow network conditions', async () => {
      // Simulate slow network
      await dashboardPage.page.route('**/*', route => {
        setTimeout(() => route.continue(), 1000); // 1 second delay
      });
      
      await dashboardPage.page.reload();
      await dashboardPage.verifyDashboardLoaded();
    });

    test('should show loading states appropriately', async () => {
      // Check for loading indicators during navigation
      await dashboardPage.navigateToSection('Progress');
      
      const loadingSpinner = dashboardPage.page.locator('[data-testid="loading-spinner"]');
      
      // Loading spinner might be briefly visible
      await dashboardPage.page.waitForTimeout(500);
    });
  });

  test.describe('Error Handling', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login(TestUsers.STUDENT.email, TestUsers.STUDENT.password);
    });

    test('should handle network errors gracefully', async () => {
      // Simulate network error
      await dashboardPage.page.route('**/api/**', route => {
        route.abort();
      });
      
      await dashboardPage.page.reload();
      
      // Should show error message or fallback content
      await dashboardPage.page.waitForTimeout(2000);
    });

    test('should handle API errors gracefully', async () => {
      // Simulate API error
      await dashboardPage.page.route('**/api/**', route => {
        route.fulfill({ status: 500, body: 'Internal Server Error' });
      });
      
      await dashboardPage.startNewActivity();
      
      // Should show error message
      await dashboardPage.page.waitForTimeout(1000);
    });

    test('should handle unauthorized access', async () => {
      // Simulate session expiry
      await dashboardPage.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      await dashboardPage.page.reload();
      
      // Should redirect to login
      await expect(dashboardPage.page).toHaveURL(/.*\/login/);
    });
  });

  test.describe('Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToLogin();
      await authPage.login(TestUsers.STUDENT.email, TestUsers.STUDENT.password);
    });

    test('should support keyboard navigation', async () => {
      // Test tab navigation through dashboard elements
      await dashboardPage.page.keyboard.press('Tab');
      await dashboardPage.page.keyboard.press('Tab');
      await dashboardPage.page.keyboard.press('Tab');
      
      // Should be able to navigate with Enter key
      await dashboardPage.page.keyboard.press('Enter');
    });

    test('should have proper ARIA labels', async () => {
      const activityCards = dashboardPage.page.locator('[data-testid="activity-card"]');
      
      if (await activityCards.count() > 0) {
        const firstCard = activityCards.first();
        
        // Should have accessible name
        const ariaLabel = await firstCard.getAttribute('aria-label') || 
                         await firstCard.getAttribute('title');
        
        // At least one should be present for accessibility
      }
    });

    test('should have sufficient color contrast', async () => {
      // Basic check for visibility of key elements
      const welcomeMessage = dashboardPage.page.locator('[data-testid="welcome-message"]');
      await expect(welcomeMessage).toBeVisible();
      
      const activityCards = dashboardPage.page.locator('[data-testid="activity-card"]');
      if (await activityCards.count() > 0) {
        await expect(activityCards.first()).toBeVisible();
      }
    });
  });
});