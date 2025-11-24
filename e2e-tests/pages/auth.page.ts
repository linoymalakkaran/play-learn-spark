import { Page, Locator, expect } from '@playwright/test';
import { TestUtils } from '../helpers/test-utils';
import { TestUser } from '../fixtures/test-data';

/**
 * Page Object Model for Authentication pages (Login/Register)
 */
export class AuthPage {
  private utils: TestUtils;
  public page: Page;

  // Locators
  private loginForm: Locator;
  private registerForm: Locator;
  private emailInput: Locator;
  private passwordInput: Locator;
  private confirmPasswordInput: Locator;
  private firstNameInput: Locator;
  private lastNameInput: Locator;
  private phoneInput: Locator;
  private roleSelect: Locator;
  private loginButton: Locator;
  private registerButton: Locator;
  private switchToRegisterLink: Locator;
  private switchToLoginLink: Locator;
  private guestLoginButton: Locator;
  private forgotPasswordLink: Locator;
  private errorMessage: Locator;
  private successMessage: Locator;
  private loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.utils = new TestUtils(page);
    
    // Initialize locators
    this.loginForm = page.locator('[data-testid="login-form"]');
    this.registerForm = page.locator('[data-testid="register-form"]');
    this.emailInput = page.locator('input[name="email"], input[type="email"]');
    this.passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"], input[name="confirm-password"]');
    this.firstNameInput = page.locator('input[name="firstName"], input[name="first-name"]');
    this.lastNameInput = page.locator('input[name="lastName"], input[name="last-name"]');
    this.phoneInput = page.locator('input[name="phone"], input[type="tel"]');
    this.roleSelect = page.locator('select[name="role"], [data-testid="role-select"]');
    this.loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In")');
    this.registerButton = page.locator('button:has-text("Register"), button:has-text("Sign Up")');
    this.switchToRegisterLink = page.locator('a:has-text("Sign up"), a:has-text("Register"), button:has-text("Create account")');
    this.switchToLoginLink = page.locator('a:has-text("Login"), a:has-text("Sign in"), button:has-text("Sign in")');
    this.guestLoginButton = page.locator('button:has-text("Continue as Guest"), [data-testid="guest-login"]');
    this.forgotPasswordLink = page.locator('a:has-text("Forgot password"), [data-testid="forgot-password"]');
    this.errorMessage = page.locator('[data-testid="error-message"], .error, .alert-error');
    this.successMessage = page.locator('[data-testid="success-message"], .success, .alert-success');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"], .loading, .spinner');
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin() {
    await this.page.goto('/login');
    await this.utils.waitForPageReady();
    await expect(this.page).toHaveURL(/.*\/login/);
  }

  /**
   * Navigate to register page
   */
  async navigateToRegister() {
    await this.page.goto('/register');
    await this.utils.waitForPageReady();
    await expect(this.page).toHaveURL(/.*\/register/);
  }

  /**
   * Switch to register form from login page
   */
  async switchToRegister() {
    await this.switchToRegisterLink.click();
    await this.utils.waitForPageReady();
    await expect(this.registerForm).toBeVisible();
  }

  /**
   * Switch to login form from register page
   */
  async switchToLogin() {
    await this.switchToLoginLink.click();
    await this.utils.waitForPageReady();
    await expect(this.loginForm).toBeVisible();
  }

  /**
   * Perform login
   */
  async login(email: string, password: string) {
    await this.utils.safeFill('input[name="email"], input[type="email"]', email);
    await this.utils.safeFill('input[name="password"], input[type="password"]', password);
    await this.loginButton.click();
    
    // Wait for either success (redirect) or error message
    await Promise.race([
      this.page.waitForURL(/.*\/dashboard/, { timeout: 10000 }),
      this.errorMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    ]);
  }

  /**
   * Perform registration
   */
  async register(user: TestUser) {
    if (user.firstName) {
      await this.utils.safeFill('input[name="firstName"], input[name="first-name"]', user.firstName);
    }
    if (user.lastName) {
      await this.utils.safeFill('input[name="lastName"], input[name="last-name"]', user.lastName);
    }
    
    await this.utils.safeFill('input[name="email"], input[type="email"]', user.email);
    await this.utils.safeFill('input[name="password"], input[type="password"]', user.password);
    
    // Fill confirm password if field exists
    if (await this.confirmPasswordInput.count() > 0) {
      await this.utils.safeFill('input[name="confirmPassword"], input[name="confirm-password"]', user.password);
    }
    
    if (user.phone) {
      await this.utils.safeFill('input[name="phone"], input[type="tel"]', user.phone);
    }
    
    // Select role if dropdown exists
    if (await this.roleSelect.count() > 0) {
      await this.roleSelect.selectOption(user.role);
    }
    
    await this.registerButton.click();
    
    // Wait for either success (redirect) or error message
    await Promise.race([
      this.page.waitForURL(/.*\/dashboard/, { timeout: 10000 }),
      this.successMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
      this.errorMessage.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    ]);
  }

  /**
   * Login as guest
   */
  async loginAsGuest() {
    await this.guestLoginButton.click();
    await this.utils.waitForPageReady();
    await expect(this.page).toHaveURL(/.*\/dashboard/);
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
    await this.utils.waitForPageReady();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Get success message text
   */
  async getSuccessMessage(): Promise<string> {
    await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
    return await this.successMessage.textContent() || '';
  }

  /**
   * Check if login form is visible
   */
  async isLoginFormVisible(): Promise<boolean> {
    return await this.loginForm.isVisible();
  }

  /**
   * Check if register form is visible
   */
  async isRegisterFormVisible(): Promise<boolean> {
    return await this.registerForm.isVisible();
  }

  /**
   * Check if loading state is active
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingSpinner.isVisible();
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingToComplete() {
    if (await this.isLoading()) {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
    }
  }

  /**
   * Validate form fields presence
   */
  async validateLoginFormFields() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Validate registration form fields
   */
  async validateRegisterFormFields() {
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.registerButton).toBeVisible();
  }

  /**
   * Clear all form fields
   */
  async clearAllFields() {
    const fields = [
      this.emailInput,
      this.passwordInput,
      this.confirmPasswordInput,
      this.firstNameInput,
      this.lastNameInput,
      this.phoneInput
    ];

    for (const field of fields) {
      if (await field.count() > 0 && await field.isVisible()) {
        await field.clear();
      }
    }
  }

  /**
   * Test form validation by submitting empty form
   */
  async testFormValidation() {
    await this.clearAllFields();
    
    // Try to submit empty form
    if (await this.loginButton.isVisible()) {
      await this.loginButton.click();
    } else if (await this.registerButton.isVisible()) {
      await this.registerButton.click();
    }
    
    // Should show validation errors
    await this.page.waitForTimeout(1000); // Wait for validation messages
  }

  /**
   * Check password visibility toggle
   */
  async togglePasswordVisibility() {
    const toggleButton = this.page.locator('button:has([data-testid="eye-icon"]), button:has([data-testid="password-toggle"])');
    if (await toggleButton.count() > 0) {
      await toggleButton.click();
    }
  }
}