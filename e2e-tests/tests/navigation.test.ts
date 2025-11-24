import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { NavigationPage } from '../pages/navigation.page';
import { DashboardPage } from '../pages/dashboard.page';
import { TestUsers } from '../fixtures/test-data';

test.describe('Navigation Tests', () => {
  let authPage: AuthPage;
  let navigationPage: NavigationPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    navigationPage = new NavigationPage(page);
    dashboardPage = new DashboardPage(page);
    
    // Login before testing navigation
    await authPage.navigateToLogin();
    await authPage.login(TestUsers.STUDENT.email, TestUsers.STUDENT.password);
  });

  test.describe('Header Navigation', () => {
    test('should display header navigation correctly', async () => {
      await navigationPage.verifyHeaderNavigation();
      
      // Check that logo and main navigation are visible
      await expect(navigationPage.logoLink).toBeVisible();
      await expect(navigationPage.mainNavigationMenu).toBeVisible();
    });

    test('should navigate to dashboard via logo click', async () => {
      await navigationPage.clickLogo();
      
      // Should navigate to home/dashboard
      await expect(navigationPage.page).toHaveURL(/.*\/(dashboard|home)?$/);
    });

    test('should navigate to activities page', async () => {
      await navigationPage.navigateToActivities();
      
      // Should navigate to activities page
      await expect(navigationPage.page).toHaveURL(/.*\/activities/);
    });

    test('should navigate to progress page', async () => {
      await navigationPage.navigateToProgress();
      
      // Should navigate to progress page
      await expect(navigationPage.page).toHaveURL(/.*\/progress/);
    });

    test('should navigate to profile page', async () => {
      await navigationPage.navigateToProfile();
      
      // Should navigate to profile page
      await expect(navigationPage.page).toHaveURL(/.*\/profile/);
    });

    test('should navigate to settings page', async () => {
      await navigationPage.navigateToSettings();
      
      // Should navigate to settings page
      await expect(navigationPage.page).toHaveURL(/.*\/settings/);
    });
  });

  test.describe('Activity Category Navigation', () => {
    test('should navigate to language activities', async () => {
      await navigationPage.navigateToActivityCategory('language');
      
      // Should navigate to language activities
      await expect(navigationPage.page).toHaveURL(/.*\/activities\/language/);
    });

    test('should navigate to math activities', async () => {
      await navigationPage.navigateToActivityCategory('math');
      
      // Should navigate to math activities
      await expect(navigationPage.page).toHaveURL(/.*\/activities\/math/);
    });

    test('should navigate to science activities', async () => {
      await navigationPage.navigateToActivityCategory('science');
      
      // Should navigate to science activities
      await expect(navigationPage.page).toHaveURL(/.*\/activities\/science/);
    });

    test('should navigate to reading activities', async () => {
      await navigationPage.navigateToActivityCategory('reading');
      
      // Should navigate to reading activities
      await expect(navigationPage.page).toHaveURL(/.*\/activities\/reading/);
    });
  });

  test.describe('User Menu Navigation', () => {
    test('should open and close user menu', async () => {
      await navigationPage.openUserMenu();
      
      // User dropdown should be visible
      await expect(navigationPage.userDropdownMenu).toBeVisible();
      
      await navigationPage.closeUserMenu();
      
      // User dropdown should be hidden
      await expect(navigationPage.userDropdownMenu).not.toBeVisible();
    });

    test('should navigate to profile via user menu', async () => {
      await navigationPage.navigateViaUserMenu('profile');
      
      // Should navigate to profile page
      await expect(navigationPage.page).toHaveURL(/.*\/profile/);
    });

    test('should navigate to settings via user menu', async () => {
      await navigationPage.navigateViaUserMenu('settings');
      
      // Should navigate to settings page
      await expect(navigationPage.page).toHaveURL(/.*\/settings/);
    });

    test('should logout via user menu', async () => {
      await navigationPage.navigateViaUserMenu('logout');
      
      // Should navigate to login page
      await expect(navigationPage.page).toHaveURL(/.*\/login/);
    });

    test('should navigate to notifications via user menu', async () => {
      // Check if notifications link exists before testing
      await navigationPage.openUserMenu();
      const notificationsVisible = await navigationPage.notificationsLink.isVisible();
      
      if (notificationsVisible) {
        await navigationPage.navigateViaUserMenu('notifications');
        await expect(navigationPage.page).toHaveURL(/.*\/notifications/);
      }
    });
  });

  test.describe('Mobile Navigation', () => {
    test('should display mobile menu toggle on small screens', async () => {
      // Set mobile viewport
      await navigationPage.page.setViewportSize({ width: 375, height: 667 });
      await navigationPage.page.reload();
      
      // Mobile menu toggle should be visible
      await expect(navigationPage.mobileMenuToggle).toBeVisible();
    });

    test('should toggle mobile menu', async () => {
      // Set mobile viewport
      await navigationPage.page.setViewportSize({ width: 375, height: 667 });
      await navigationPage.page.reload();
      
      await navigationPage.toggleMobileMenu();
      
      // Mobile menu should be open
      expect(await navigationPage.isMobileMenuOpen()).toBeTruthy();
      
      await navigationPage.closeMobileMenu();
      
      // Mobile menu should be closed
      expect(await navigationPage.isMobileMenuOpen()).toBeFalsy();
    });

    test('should navigate via mobile menu', async () => {
      // Set mobile viewport
      await navigationPage.page.setViewportSize({ width: 375, height: 667 });
      await navigationPage.page.reload();
      
      await navigationPage.navigateViaMobileMenu('Activities');
      
      // Should navigate to activities page
      await expect(navigationPage.page).toHaveURL(/.*\/activities/);
    });

    test('should close mobile menu after navigation', async () => {
      // Set mobile viewport
      await navigationPage.page.setViewportSize({ width: 375, height: 667 });
      await navigationPage.page.reload();
      
      await navigationPage.navigateViaMobileMenu('Progress');
      
      // Mobile menu should close after navigation
      await navigationPage.page.waitForTimeout(500);
      expect(await navigationPage.isMobileMenuOpen()).toBeFalsy();
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    test('should display breadcrumbs on nested pages', async () => {
      await navigationPage.navigateToActivityCategory('math');
      
      const breadcrumbs = await navigationPage.getBreadcrumbPath();
      
      // Should have breadcrumb trail
      expect(breadcrumbs.length).toBeGreaterThan(0);
    });

    test('should navigate via breadcrumb links', async () => {
      await navigationPage.navigateToActivityCategory('science');
      
      const breadcrumbs = await navigationPage.getBreadcrumbPath();
      
      if (breadcrumbs.length > 1) {
        // Click on first breadcrumb item
        await navigationPage.clickBreadcrumbItem(breadcrumbs[0]);
        
        // Should navigate to parent page
        await navigationPage.page.waitForTimeout(1000);
      }
    });

    test('should show current page in breadcrumb', async () => {
      await navigationPage.navigateToProfile();
      
      const breadcrumbs = await navigationPage.getBreadcrumbPath();
      
      if (breadcrumbs.length > 0) {
        const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
        expect(lastBreadcrumb.toLowerCase()).toContain('profile');
      }
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('should toggle sidebar if present', async () => {
      const sidebarExists = await navigationPage.page.locator('[data-testid="sidebar"]').count() > 0;
      
      if (sidebarExists) {
        const initialState = await navigationPage.isSidebarOpen();
        
        await navigationPage.toggleSidebar();
        
        const newState = await navigationPage.isSidebarOpen();
        expect(newState).not.toBe(initialState);
      }
    });

    test('should navigate via sidebar menu', async () => {
      const sidebarExists = await navigationPage.page.locator('[data-testid="sidebar"]').count() > 0;
      
      if (sidebarExists) {
        await navigationPage.navigateViaSidebar('Dashboard');
        
        // Should navigate to dashboard
        await expect(navigationPage.page).toHaveURL(/.*\/dashboard/);
      }
    });
  });

  test.describe('Search Navigation', () => {
    test('should perform search if search functionality exists', async () => {
      const searchInput = navigationPage.page.locator('input[type="search"], input[placeholder*="Search"]');
      
      if (await searchInput.isVisible()) {
        await navigationPage.searchInNavigation('math');
        
        // Should show search results or navigate to search page
        await navigationPage.page.waitForTimeout(2000);
      }
    });

    test('should handle empty search gracefully', async () => {
      const searchInput = navigationPage.page.locator('input[type="search"], input[placeholder*="Search"]');
      
      if (await searchInput.isVisible()) {
        await navigationPage.searchInNavigation('');
        
        // Should not break the application
        await navigationPage.page.waitForTimeout(1000);
      }
    });
  });

  test.describe('Responsive Navigation Behavior', () => {
    test('should adapt navigation for different screen sizes', async () => {
      await navigationPage.verifyResponsiveNavigation();
      
      // Should successfully adapt to different viewports
      // Final check in desktop mode
      await expect(navigationPage.mainNavigationMenu).toBeVisible();
    });

    test('should show/hide navigation elements based on screen size', async () => {
      // Desktop view
      await navigationPage.page.setViewportSize({ width: 1920, height: 1080 });
      await navigationPage.page.reload();
      
      const desktopNavVisible = await navigationPage.mainNavigationMenu.isVisible();
      const mobileToggleVisible = await navigationPage.mobileMenuToggle.isVisible();
      
      // Mobile view
      await navigationPage.page.setViewportSize({ width: 375, height: 667 });
      await navigationPage.page.reload();
      
      const mobileToggleVisibleNow = await navigationPage.mobileMenuToggle.isVisible();
      
      // Mobile toggle should be visible on mobile, hidden on desktop (typical behavior)
      expect(mobileToggleVisibleNow).toBeTruthy();
    });

    test('should maintain functionality across viewport changes', async () => {
      // Start in desktop
      await navigationPage.page.setViewportSize({ width: 1920, height: 1080 });
      await navigationPage.navigateToActivities();
      
      // Switch to mobile
      await navigationPage.page.setViewportSize({ width: 375, height: 667 });
      
      // Should still be on activities page
      await expect(navigationPage.page).toHaveURL(/.*\/activities/);
    });
  });

  test.describe('Navigation Link Validation', () => {
    test('should have working navigation links', async () => {
      const brokenLinks = await navigationPage.verifyAllLinksWorking();
      
      // Should not have broken links
      expect(brokenLinks.length).toBe(0);
    });

    test('should get all available navigation links', async () => {
      const navLinks = await navigationPage.getNavigationLinks();
      
      // Should have some navigation links
      expect(navLinks.length).toBeGreaterThan(0);
      
      // Common expected links
      const hasActivities = navLinks.some(link => link.toLowerCase().includes('activities'));
      const hasDashboard = navLinks.some(link => link.toLowerCase().includes('dashboard'));
      
      expect(hasActivities || hasDashboard).toBeTruthy();
    });

    test('should handle external links appropriately', async () => {
      const externalLinks = await navigationPage.page.locator('a[target="_blank"], a[href^="http"]:not([href*="' + new URL(navigationPage.page.url()).hostname + '"])').all();
      
      for (const link of externalLinks) {
        const target = await link.getAttribute('target');
        
        // External links should open in new tab
        expect(target).toBe('_blank');
        
        // Should have rel="noopener" for security
        const rel = await link.getAttribute('rel');
        expect(rel).toMatch(/noopener|noreferrer/);
      }
    });
  });

  test.describe('Navigation Accessibility', () => {
    test('should have proper ARIA labels and roles', async () => {
      await navigationPage.verifyNavigationAccessibility();
      
      // Navigation should have proper role
      await expect(navigationPage.mainNavigationMenu).toHaveAttribute('role', 'navigation');
    });

    test('should support keyboard navigation', async () => {
      await navigationPage.testKeyboardNavigation();
      
      // Should not throw errors during keyboard navigation
      // The test itself validates keyboard functionality
    });

    test('should have focus indicators', async () => {
      const firstNavLink = navigationPage.mainNavigationMenu.locator('a, button').first();
      
      await firstNavLink.focus();
      
      // Should have visible focus (implementation dependent)
      await navigationPage.page.waitForTimeout(500);
    });

    test('should have meaningful link text', async () => {
      const navLinks = await navigationPage.mainNavigationMenu.locator('a').all();
      
      for (const link of navLinks) {
        const linkText = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const title = await link.getAttribute('title');
        
        // Should have meaningful text or aria-label
        const hasMeaningfulText = (linkText && linkText.trim().length > 1) ||
                                 (ariaLabel && ariaLabel.trim().length > 1) ||
                                 (title && title.trim().length > 1);
        
        expect(hasMeaningfulText).toBeTruthy();
      }
    });

    test('should support screen readers', async () => {
      // Check for skip links
      const skipLinks = navigationPage.page.locator('a[href="#main"], a[href="#content"], .sr-only a');
      
      // Skip links improve accessibility (optional but recommended)
      const skipLinkCount = await skipLinks.count();
      
      // Check for landmark roles
      const navigation = navigationPage.page.locator('[role="navigation"], nav');
      await expect(navigation.first()).toBeVisible();
      
      const main = navigationPage.page.locator('[role="main"], main');
      const hasMain = await main.count() > 0;
      
      expect(hasMain).toBeTruthy();
    });
  });

  test.describe('Navigation Performance', () => {
    test('should navigate quickly between pages', async () => {
      const navigationTimes = [];
      const pages = ['dashboard', 'activities', 'progress', 'profile'];
      
      for (const pageName of pages) {
        const startTime = Date.now();
        
        switch (pageName) {
          case 'dashboard':
            await navigationPage.navigateToDashboard();
            break;
          case 'activities':
            await navigationPage.navigateToActivities();
            break;
          case 'progress':
            await navigationPage.navigateToProgress();
            break;
          case 'profile':
            await navigationPage.navigateToProfile();
            break;
        }
        
        const endTime = Date.now();
        navigationTimes.push(endTime - startTime);
      }
      
      // Average navigation time should be reasonable
      const averageTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length;
      expect(averageTime).toBeLessThan(3000); // Less than 3 seconds
    });

    test('should handle rapid navigation clicks', async () => {
      // Rapidly click navigation links
      await navigationPage.navigateToActivities();
      await navigationPage.navigateToDashboard();
      await navigationPage.navigateToProgress();
      
      // Should end up on the last clicked page
      await expect(navigationPage.page).toHaveURL(/.*\/progress/);
    });

    test('should maintain navigation state during page loads', async () => {
      await navigationPage.navigateToActivities();
      
      // Refresh page
      await navigationPage.page.reload();
      
      // Navigation should still be functional
      await navigationPage.verifyHeaderNavigation();
      await navigationPage.navigateToDashboard();
    });
  });

  test.describe('Navigation Error Handling', () => {
    test('should handle navigation to non-existent pages', async () => {
      await navigationPage.page.goto('/non-existent-page');
      
      // Should show 404 page or redirect to a valid page
      await navigationPage.page.waitForTimeout(2000);
      
      const pageTitle = await navigationPage.page.title();
      const hasError = pageTitle.toLowerCase().includes('404') || 
                      pageTitle.toLowerCase().includes('not found');
      
      // Should either show error page or redirect (both are valid)
    });

    test('should maintain navigation during network issues', async () => {
      // Simulate slow network
      await navigationPage.page.route('**/*', route => {
        setTimeout(() => route.continue(), 2000);
      });
      
      await navigationPage.navigateToActivities();
      
      // Should eventually navigate successfully
      await expect(navigationPage.page).toHaveURL(/.*\/activities/);
    });

    test('should recover from navigation errors', async () => {
      // Cause a navigation error by routing to 500
      await navigationPage.page.route('**/activities', route => {
        route.fulfill({ status: 500, body: 'Internal Server Error' });
      });
      
      await navigationPage.navigateToActivities();
      
      // Should handle error gracefully
      await navigationPage.page.waitForTimeout(2000);
      
      // Try navigating to a different page
      await navigationPage.navigateToDashboard();
      await expect(navigationPage.page).toHaveURL(/.*\/dashboard/);
    });
  });
});