import { Page, Locator, expect } from '@playwright/test';
import { TestUtils } from '../helpers/test-utils';

/**
 * Page Object Model for Navigation components (Header, Sidebar, Mobile menu)
 */
export class NavigationPage {
  private utils: TestUtils;
  public page: Page;

  // Header navigation
  private headerContainer: Locator;
  public logoLink: Locator;
  public mainNavigationMenu: Locator;
  private userMenuToggle: Locator;
  public userDropdownMenu: Locator;
  public mobileMenuToggle: Locator;
  private mobileMenuOverlay: Locator;

  // Navigation links
  private dashboardLink: Locator;
  private activitiesLink: Locator;
  private progressLink: Locator;
  private profileLink: Locator;
  private settingsLink: Locator;
  private helpLink: Locator;
  private aboutLink: Locator;
  private contactLink: Locator;

  // Activity navigation
  private languageActivitiesLink: Locator;
  private mathActivitiesLink: Locator;
  private scienceActivitiesLink: Locator;
  private readingActivitiesLink: Locator;

  // User menu items
  private viewProfileLink: Locator;
  private accountSettingsLink: Locator;
  public notificationsLink: Locator;
  private logoutLink: Locator;

  // Breadcrumb navigation
  private breadcrumbContainer: Locator;
  private breadcrumbItems: Locator;

  // Sidebar navigation (if exists)
  private sidebarContainer: Locator;
  private sidebarToggle: Locator;
  private sidebarMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new TestUtils(page);
    
    // Header elements
    this.headerContainer = page.locator('[data-testid="header"], header, .header-container');
    this.logoLink = page.locator('[data-testid="logo"], .logo, .brand-logo a');
    this.mainNavigationMenu = page.locator('[data-testid="main-nav"], .main-navigation');
    this.userMenuToggle = page.locator('[data-testid="user-menu-toggle"], .user-menu-toggle');
    this.userDropdownMenu = page.locator('[data-testid="user-dropdown"], .user-dropdown-menu');
    this.mobileMenuToggle = page.locator('[data-testid="mobile-menu-toggle"], .mobile-menu-toggle, .hamburger-menu');
    this.mobileMenuOverlay = page.locator('[data-testid="mobile-menu"], .mobile-menu-overlay');

    // Main navigation links
    this.dashboardLink = page.locator('a[href*="/dashboard"], a:has-text("Dashboard")');
    this.activitiesLink = page.locator('a[href*="/activities"], a:has-text("Activities")');
    this.progressLink = page.locator('a[href*="/progress"], a:has-text("Progress")');
    this.profileLink = page.locator('a[href*="/profile"], a:has-text("Profile")');
    this.settingsLink = page.locator('a[href*="/settings"], a:has-text("Settings")');
    this.helpLink = page.locator('a[href*="/help"], a:has-text("Help")');
    this.aboutLink = page.locator('a[href*="/about"], a:has-text("About")');
    this.contactLink = page.locator('a[href*="/contact"], a:has-text("Contact")');

    // Activity category links
    this.languageActivitiesLink = page.locator('a[href*="/activities/language"], a:has-text("Language")');
    this.mathActivitiesLink = page.locator('a[href*="/activities/math"], a:has-text("Math")');
    this.scienceActivitiesLink = page.locator('a[href*="/activities/science"], a:has-text("Science")');
    this.readingActivitiesLink = page.locator('a[href*="/activities/reading"], a:has-text("Reading")');

    // User menu items
    this.viewProfileLink = page.locator('[data-testid="view-profile"], a:has-text("View Profile")');
    this.accountSettingsLink = page.locator('[data-testid="account-settings"], a:has-text("Account Settings")');
    this.notificationsLink = page.locator('[data-testid="notifications"], a:has-text("Notifications")');
    this.logoutLink = page.locator('[data-testid="logout"], a:has-text("Logout"), button:has-text("Logout")');

    // Breadcrumbs
    this.breadcrumbContainer = page.locator('[data-testid="breadcrumb"], .breadcrumb, nav[aria-label="Breadcrumb"]');
    this.breadcrumbItems = page.locator('.breadcrumb-item, [data-testid="breadcrumb-item"]');

    // Sidebar
    this.sidebarContainer = page.locator('[data-testid="sidebar"], .sidebar, aside');
    this.sidebarToggle = page.locator('[data-testid="sidebar-toggle"], .sidebar-toggle');
    this.sidebarMenu = page.locator('[data-testid="sidebar-menu"], .sidebar-menu');
  }

  /**
   * Verify header navigation is visible
   */
  async verifyHeaderNavigation() {
    await expect(this.headerContainer).toBeVisible();
    await expect(this.logoLink).toBeVisible();
    await expect(this.mainNavigationMenu).toBeVisible();
  }

  /**
   * Click on logo to go to home
   */
  async clickLogo() {
    await this.logoLink.click();
    await this.utils.waitForNavigation();
  }

  /**
   * Navigate to dashboard
   */
  async navigateToDashboard() {
    await this.dashboardLink.click();
    await this.utils.waitForNavigation('/dashboard');
  }

  /**
   * Navigate to activities page
   */
  async navigateToActivities() {
    await this.activitiesLink.click();
    await this.utils.waitForNavigation('/activities');
  }

  /**
   * Navigate to progress page
   */
  async navigateToProgress() {
    await this.progressLink.click();
    await this.utils.waitForNavigation('/progress');
  }

  /**
   * Navigate to profile page
   */
  async navigateToProfile() {
    await this.profileLink.click();
    await this.utils.waitForNavigation('/profile');
  }

  /**
   * Navigate to settings page
   */
  async navigateToSettings() {
    await this.settingsLink.click();
    await this.utils.waitForNavigation('/settings');
  }

  /**
   * Navigate to specific activity category
   */
  async navigateToActivityCategory(category: 'language' | 'math' | 'science' | 'reading') {
    switch (category) {
      case 'language':
        await this.languageActivitiesLink.click();
        break;
      case 'math':
        await this.mathActivitiesLink.click();
        break;
      case 'science':
        await this.scienceActivitiesLink.click();
        break;
      case 'reading':
        await this.readingActivitiesLink.click();
        break;
    }
    await this.utils.waitForNavigation(`/activities/${category}`);
  }

  /**
   * Open user menu dropdown
   */
  async openUserMenu() {
    await this.userMenuToggle.click();
    await expect(this.userDropdownMenu).toBeVisible();
  }

  /**
   * Close user menu dropdown
   */
  async closeUserMenu() {
    // Click outside the menu to close it
    await this.headerContainer.click({ position: { x: 50, y: 50 } });
    await expect(this.userDropdownMenu).not.toBeVisible();
  }

  /**
   * Navigate through user menu
   */
  async navigateViaUserMenu(option: 'profile' | 'settings' | 'notifications' | 'logout') {
    await this.openUserMenu();
    
    switch (option) {
      case 'profile':
        await this.viewProfileLink.click();
        await this.utils.waitForNavigation('/profile');
        break;
      case 'settings':
        await this.accountSettingsLink.click();
        await this.utils.waitForNavigation('/settings');
        break;
      case 'notifications':
        await this.notificationsLink.click();
        await this.utils.waitForNavigation('/notifications');
        break;
      case 'logout':
        await this.logoutLink.click();
        await this.utils.waitForNavigation('/login');
        break;
    }
  }

  /**
   * Toggle mobile menu
   */
  async toggleMobileMenu() {
    await this.mobileMenuToggle.click();
    await this.page.waitForTimeout(300); // Wait for animation
  }

  /**
   * Check if mobile menu is open
   */
  async isMobileMenuOpen(): Promise<boolean> {
    return await this.mobileMenuOverlay.isVisible();
  }

  /**
   * Navigate via mobile menu
   */
  async navigateViaMobileMenu(destination: string) {
    if (!await this.isMobileMenuOpen()) {
      await this.toggleMobileMenu();
    }
    
    const mobileLink = this.mobileMenuOverlay.locator(`a:has-text("${destination}")`);
    await mobileLink.click();
    await this.utils.waitForNavigation();
  }

  /**
   * Close mobile menu
   */
  async closeMobileMenu() {
    if (await this.isMobileMenuOpen()) {
      // Click outside menu or on close button
      const closeButton = this.mobileMenuOverlay.locator('[data-testid="close-menu"], .close-button');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        await this.page.keyboard.press('Escape');
      }
      await this.page.waitForTimeout(300); // Wait for animation
    }
  }

  /**
   * Get breadcrumb path
   */
  async getBreadcrumbPath(): Promise<string[]> {
    const breadcrumbs = [];
    const items = await this.breadcrumbItems.all();
    
    for (const item of items) {
      const text = await item.textContent();
      if (text) breadcrumbs.push(text.trim());
    }
    
    return breadcrumbs;
  }

  /**
   * Click on breadcrumb item
   */
  async clickBreadcrumbItem(text: string) {
    const breadcrumbItem = this.breadcrumbContainer.locator(`a:has-text("${text}"), button:has-text("${text}")`);
    await breadcrumbItem.click();
    await this.utils.waitForNavigation();
  }

  /**
   * Toggle sidebar (if exists)
   */
  async toggleSidebar() {
    if (await this.sidebarToggle.isVisible()) {
      await this.sidebarToggle.click();
      await this.page.waitForTimeout(300); // Wait for animation
    }
  }

  /**
   * Check if sidebar is open
   */
  async isSidebarOpen(): Promise<boolean> {
    if (await this.sidebarContainer.count() === 0) return false;
    
    const isVisible = await this.sidebarContainer.isVisible();
    
    // Check for expanded state if sidebar uses CSS classes
    const hasOpenClass = await this.sidebarContainer.evaluate(el => 
      el.classList.contains('open') || 
      el.classList.contains('expanded') || 
      el.classList.contains('visible')
    );
    
    return isVisible && hasOpenClass;
  }

  /**
   * Navigate via sidebar
   */
  async navigateViaSidebar(destination: string) {
    if (!await this.isSidebarOpen()) {
      await this.toggleSidebar();
    }
    
    const sidebarLink = this.sidebarMenu.locator(`a:has-text("${destination}"), button:has-text("${destination}")`);
    await sidebarLink.click();
    await this.utils.waitForNavigation();
  }

  /**
   * Get all navigation links text
   */
  async getNavigationLinks(): Promise<string[]> {
    const links = [];
    const navLinks = await this.mainNavigationMenu.locator('a, button').all();
    
    for (const link of navLinks) {
      const text = await link.textContent();
      if (text && text.trim() !== '') {
        links.push(text.trim());
      }
    }
    
    return links;
  }

  /**
   * Verify navigation accessibility
   */
  async verifyNavigationAccessibility() {
    // Check for proper ARIA labels
    await expect(this.mainNavigationMenu).toHaveAttribute('role', 'navigation');
    
    // Check logo has alt text if it's an image
    const logoImg = this.logoLink.locator('img');
    if (await logoImg.count() > 0) {
      await expect(logoImg).toHaveAttribute('alt');
    }
    
    // Check mobile menu toggle has proper label
    if (await this.mobileMenuToggle.isVisible()) {
      const hasLabel = await this.mobileMenuToggle.getAttribute('aria-label') !== null ||
                     await this.mobileMenuToggle.getAttribute('title') !== null;
      expect(hasLabel).toBeTruthy();
    }
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation() {
    // Focus on first navigation item
    await this.mainNavigationMenu.locator('a, button').first().focus();
    
    // Test Tab navigation
    const navItems = await this.mainNavigationMenu.locator('a, button').count();
    for (let i = 0; i < navItems; i++) {
      await this.page.keyboard.press('Tab');
      await this.page.waitForTimeout(100);
    }
    
    // Test Enter key activation
    await this.page.keyboard.press('Enter');
  }

  /**
   * Search navigation (if search functionality exists)
   */
  async searchInNavigation(query: string) {
    const searchInput = this.headerContainer.locator('input[type="search"], input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await this.utils.safeFill('input[type="search"], input[placeholder*="Search"]', query);
      await this.page.keyboard.press('Enter');
      await this.utils.waitForNavigation();
    }
  }

  /**
   * Verify responsive navigation behavior
   */
  async verifyResponsiveNavigation() {
    // Test desktop view
    await this.utils.setViewportSize(1920, 1080);
    await expect(this.mainNavigationMenu).toBeVisible();
    
    // Test tablet view
    await this.utils.setViewportSize(768, 1024);
    await this.page.waitForTimeout(500); // Wait for responsive changes
    
    // Test mobile view
    await this.utils.setViewportSize(375, 667);
    await this.page.waitForTimeout(500);
    await expect(this.mobileMenuToggle).toBeVisible();
    
    // Reset to desktop
    await this.utils.setViewportSize(1920, 1080);
  }

  /**
   * Verify all navigation links are working
   */
  async verifyAllLinksWorking() {
    const links = await this.mainNavigationMenu.locator('a[href]').all();
    const brokenLinks = [];
    
    for (const link of links) {
      try {
        const href = await link.getAttribute('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
          await link.click();
          await this.utils.waitForPageReady();
          
          // Check if page loaded successfully (not 404)
          const title = await this.page.title();
          if (title.toLowerCase().includes('404') || title.toLowerCase().includes('not found')) {
            brokenLinks.push(href);
          }
          
          // Go back to test next link
          await this.page.goBack();
          await this.utils.waitForPageReady();
        }
      } catch (error) {
        const href = await link.getAttribute('href');
        brokenLinks.push(href);
      }
    }
    
    return brokenLinks;
  }
}