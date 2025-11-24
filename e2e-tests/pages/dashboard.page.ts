import { Page, Locator, expect } from '@playwright/test';
import { TestUtils } from '../helpers/test-utils';

/**
 * Page Object Model for Dashboard pages (Parent, Teacher, Student dashboards)
 */
export class DashboardPage {
  private utils: TestUtils;
  public page: Page;

  // Common dashboard elements
  public dashboardContainer: Locator;
  private welcomeMessage: Locator;
  private userAvatar: Locator;
  private navigationMenu: Locator;
  private sidebarMenu: Locator;
  private mobileMenuToggle: Locator;
  private logoutButton: Locator;
  private profileButton: Locator;
  private settingsButton: Locator;
  private notificationBell: Locator;
  private searchInput: Locator;

  // Activity related elements
  private activityGrid: Locator;
  private activityCards: Locator;
  private quickStartSection: Locator;
  private continueActivityButton: Locator;
  private newActivityButton: Locator;
  private activityFilter: Locator;
  private difficultyFilter: Locator;

  // Progress elements
  private progressSection: Locator;
  private progressChart: Locator;
  private statisticsCards: Locator;
  private achievementBadges: Locator;
  private streakCounter: Locator;
  private weeklyProgress: Locator;

  // Role-specific elements
  private childrenSection: Locator; // For parent dashboard
  private addChildButton: Locator;
  private childCards: Locator;
  private classroomSection: Locator; // For teacher dashboard
  private studentsList: Locator;
  private assignActivityButton: Locator;
  private gradeBookButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new TestUtils(page);
    
    // Initialize common locators
    this.dashboardContainer = page.locator('[data-testid="dashboard"], .dashboard-container');
    this.welcomeMessage = page.locator('[data-testid="welcome-message"], .welcome-message');
    this.userAvatar = page.locator('[data-testid="user-avatar"], .user-avatar');
    this.navigationMenu = page.locator('[data-testid="navbar"], .navigation-menu');
    this.sidebarMenu = page.locator('[data-testid="sidebar"], .sidebar-menu');
    this.mobileMenuToggle = page.locator('[data-testid="mobile-menu-toggle"], .hamburger-menu');
    this.logoutButton = page.locator('[data-testid="logout-button"], button:has-text("Logout")');
    this.profileButton = page.locator('[data-testid="profile-button"], button:has-text("Profile")');
    this.settingsButton = page.locator('[data-testid="settings-button"], button:has-text("Settings")');
    this.notificationBell = page.locator('[data-testid="notifications"], .notification-bell');
    this.searchInput = page.locator('[data-testid="search-input"], input[placeholder*="Search"]');

    // Activity elements
    this.activityGrid = page.locator('[data-testid="activity-grid"], .activity-grid');
    this.activityCards = page.locator('[data-testid="activity-card"], .activity-card');
    this.quickStartSection = page.locator('[data-testid="quick-start"], .quick-start-section');
    this.continueActivityButton = page.locator('[data-testid="continue-activity"], button:has-text("Continue")');
    this.newActivityButton = page.locator('[data-testid="new-activity"], button:has-text("Start New")');
    this.activityFilter = page.locator('[data-testid="activity-filter"], .activity-filter');
    this.difficultyFilter = page.locator('[data-testid="difficulty-filter"], .difficulty-filter');

    // Progress elements
    this.progressSection = page.locator('[data-testid="progress-section"], .progress-section');
    this.progressChart = page.locator('[data-testid="progress-chart"], .progress-chart');
    this.statisticsCards = page.locator('[data-testid="stats-card"], .statistics-card');
    this.achievementBadges = page.locator('[data-testid="achievement-badge"], .achievement-badge');
    this.streakCounter = page.locator('[data-testid="streak-counter"], .streak-counter');
    this.weeklyProgress = page.locator('[data-testid="weekly-progress"], .weekly-progress');

    // Role-specific elements
    this.childrenSection = page.locator('[data-testid="children-section"], .children-section');
    this.addChildButton = page.locator('[data-testid="add-child"], button:has-text("Add Child")');
    this.childCards = page.locator('[data-testid="child-card"], .child-card');
    this.classroomSection = page.locator('[data-testid="classroom-section"], .classroom-section');
    this.studentsList = page.locator('[data-testid="students-list"], .students-list');
    this.assignActivityButton = page.locator('[data-testid="assign-activity"], button:has-text("Assign Activity")');
    this.gradeBookButton = page.locator('[data-testid="gradebook"], button:has-text("Grade Book")');
  }

  /**
   * Navigate to dashboard
   */
  async navigateToDashboard() {
    await this.page.goto('/dashboard');
    await this.utils.waitForPageReady();
    await expect(this.page).toHaveURL(/.*\/dashboard/);
  }

  /**
   * Verify dashboard is loaded
   */
  async verifyDashboardLoaded() {
    await expect(this.dashboardContainer).toBeVisible();
    await expect(this.welcomeMessage).toBeVisible();
  }

  /**
   * Get welcome message text
   */
  async getWelcomeMessage(): Promise<string> {
    return await this.utils.getTextContent('[data-testid="welcome-message"], .welcome-message');
  }

  /**
   * Click logout button
   */
  async logout() {
    await this.utils.safeClick('[data-testid="logout-button"], button:has-text("Logout")');
    await this.utils.waitForNavigation('/login');
  }

  /**
   * Open user profile
   */
  async openProfile() {
    await this.profileButton.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Open settings
   */
  async openSettings() {
    await this.settingsButton.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Toggle mobile menu
   */
  async toggleMobileMenu() {
    if (await this.mobileMenuToggle.isVisible()) {
      await this.mobileMenuToggle.click();
      await this.page.waitForTimeout(500); // Wait for animation
    }
  }

  /**
   * Search for activities
   */
  async searchActivities(query: string) {
    await this.utils.safeFill('[data-testid="search-input"], input[placeholder*="Search"]', query);
    await this.page.keyboard.press('Enter');
    await this.utils.waitForPageReady();
  }

  /**
   * Get activity cards count
   */
  async getActivityCardsCount(): Promise<number> {
    await this.activityCards.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    return await this.activityCards.count();
  }

  /**
   * Click on activity card by title
   */
  async clickActivityByTitle(title: string) {
    const activityCard = this.page.locator(`[data-testid="activity-card"]:has-text("${title}"), .activity-card:has-text("${title}")`);
    await activityCard.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Start new activity
   */
  async startNewActivity(activityType?: 'language' | 'math' | 'science' | 'reading') {
    if (activityType) {
      const typeButton = this.page.locator(`button:has-text("${activityType}"), [data-activity-type="${activityType}"]`);
      await typeButton.click();
    } else {
      await this.newActivityButton.click();
    }
    await this.utils.waitForPageReady();
  }

  /**
   * Continue last activity
   */
  async continueActivity() {
    await this.continueActivityButton.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Filter activities by type
   */
  async filterActivitiesByType(type: string) {
    await this.activityFilter.click();
    const option = this.page.locator(`option:has-text("${type}"), [data-filter-value="${type}"]`);
    await option.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Filter activities by difficulty
   */
  async filterActivitiesByDifficulty(difficulty: 'easy' | 'medium' | 'hard') {
    await this.difficultyFilter.click();
    const option = this.page.locator(`option:has-text("${difficulty}"), [data-difficulty="${difficulty}"]`);
    await option.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Get progress statistics
   */
  async getProgressStats() {
    const stats: Record<string, string> = {};
    const statCards = await this.statisticsCards.all();
    
    for (const card of statCards) {
      const label = await card.locator('.stat-label, [data-testid="stat-label"]').textContent();
      const value = await card.locator('.stat-value, [data-testid="stat-value"]').textContent();
      if (label && value) {
        stats[label.trim()] = value.trim();
      }
    }
    
    return stats;
  }

  /**
   * Get current streak count
   */
  async getStreakCount(): Promise<string> {
    return await this.utils.getTextContent('[data-testid="streak-counter"], .streak-counter');
  }

  /**
   * Get achievement badges count
   */
  async getAchievementBadgesCount(): Promise<number> {
    return await this.achievementBadges.count();
  }

  // Parent Dashboard Specific Methods

  /**
   * Add a new child (Parent dashboard)
   */
  async addChild(childData: { firstName: string; lastName: string; grade: string; birthDate: string }) {
    await this.addChildButton.click();
    
    // Fill child form
    await this.utils.safeFill('input[name="firstName"]', childData.firstName);
    await this.utils.safeFill('input[name="lastName"]', childData.lastName);
    await this.page.locator('select[name="grade"]').selectOption(childData.grade);
    await this.utils.safeFill('input[name="birthDate"], input[type="date"]', childData.birthDate);
    
    // Submit form
    await this.page.locator('button:has-text("Add Child"), button[type="submit"]').click();
    await this.utils.waitForPageReady();
  }

  /**
   * Get children cards count
   */
  async getChildrenCount(): Promise<number> {
    return await this.childCards.count();
  }

  /**
   * Click on child card
   */
  async selectChild(childName: string) {
    const childCard = this.page.locator(`[data-testid="child-card"]:has-text("${childName}"), .child-card:has-text("${childName}")`);
    await childCard.click();
    await this.utils.waitForPageReady();
  }

  // Teacher Dashboard Specific Methods

  /**
   * View students list (Teacher dashboard)
   */
  async viewStudentsList() {
    await this.studentsList.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Assign activity to student
   */
  async assignActivityToStudent(studentName: string, activityTitle: string) {
    await this.assignActivityButton.click();
    
    // Select student
    const studentOption = this.page.locator(`option:has-text("${studentName}"), [data-student-name="${studentName}"]`);
    await studentOption.click();
    
    // Select activity
    const activityOption = this.page.locator(`option:has-text("${activityTitle}"), [data-activity-title="${activityTitle}"]`);
    await activityOption.click();
    
    // Submit assignment
    await this.page.locator('button:has-text("Assign"), button[type="submit"]').click();
    await this.utils.waitForPageReady();
  }

  /**
   * Open grade book
   */
  async openGradeBook() {
    await this.gradeBookButton.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Navigate to different dashboard sections
   */
  async navigateToSection(section: string) {
    const sectionLink = this.page.locator(`a:has-text("${section}"), [data-section="${section}"]`);
    await sectionLink.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Check for notifications
   */
  async checkNotifications(): Promise<boolean> {
    const notificationBadge = this.page.locator('[data-testid="notification-badge"], .notification-badge');
    return await notificationBadge.isVisible();
  }

  /**
   * Open notifications panel
   */
  async openNotifications() {
    await this.notificationBell.click();
    await this.page.waitForTimeout(500); // Wait for panel animation
  }

  /**
   * Verify dashboard layout based on user role
   */
  async verifyRoleBasedLayout(role: 'parent' | 'teacher' | 'student') {
    switch (role) {
      case 'parent':
        await expect(this.childrenSection).toBeVisible();
        await expect(this.addChildButton).toBeVisible();
        break;
      case 'teacher':
        await expect(this.classroomSection).toBeVisible();
        await expect(this.assignActivityButton).toBeVisible();
        break;
      case 'student':
        await expect(this.activityGrid).toBeVisible();
        await expect(this.progressChart).toBeVisible();
        break;
    }
  }
}