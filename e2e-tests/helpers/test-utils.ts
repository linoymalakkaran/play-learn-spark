import { Page, Locator, expect } from '@playwright/test';

/**
 * Test utilities for common operations in Play Learn Spark
 */
export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Wait for page to be ready with loading states
   */
  async waitForPageReady(timeout = 10000) {
    await this.page.waitForLoadState('networkidle', { timeout });
    
    // Wait for any loading spinners to disappear
    const loadingSpinner = this.page.locator('[data-testid="loading-spinner"], .loading, .spinner');
    if (await loadingSpinner.count() > 0) {
      await loadingSpinner.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
        console.warn('Loading spinner did not disappear within 5 seconds');
      });
    }
  }

  /**
   * Wait for element to be visible and stable
   */
  async waitForElement(selector: string, options?: { timeout?: number }): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout: options?.timeout || 5000 });
    return element;
  }

  /**
   * Safe click with wait and retry
   */
  async safeClick(selector: string, options?: { timeout?: number; retries?: number }) {
    const retries = options?.retries || 2;
    const timeout = options?.timeout || 5000;

    for (let i = 0; i <= retries; i++) {
      try {
        const element = await this.waitForElement(selector, { timeout });
        await element.click({ timeout });
        return;
      } catch (error) {
        if (i === retries) throw error;
        await this.page.waitForTimeout(1000); // Wait 1 second before retry
      }
    }
  }

  /**
   * Safe fill input with clear and validation
   */
  async safeFill(selector: string, value: string, options?: { timeout?: number }) {
    const element = await this.waitForElement(selector, options);
    await element.clear();
    await element.fill(value);
    
    // Verify value was filled correctly
    const actualValue = await element.inputValue();
    if (actualValue !== value) {
      throw new Error(`Failed to fill input. Expected: ${value}, Actual: ${actualValue}`);
    }
  }

  /**
   * Wait for navigation with optional URL validation
   */
  async waitForNavigation(expectedUrl?: string | RegExp, timeout = 10000) {
    if (expectedUrl) {
      if (typeof expectedUrl === 'string') {
        await this.page.waitForURL(expectedUrl, { timeout });
      } else {
        await this.page.waitForURL(expectedUrl, { timeout });
      }
    } else {
      await this.page.waitForLoadState('networkidle', { timeout });
    }
    
    await this.waitForPageReady();
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `./reports/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    return errors;
  }

  /**
   * Wait for API response
   */
  async waitForAPIResponse(urlPattern: string | RegExp, timeout = 10000) {
    return await this.page.waitForResponse(
      response => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
  }

  /**
   * Mock API response
   */
  async mockAPIResponse(urlPattern: string | RegExp, response: any) {
    await this.page.route(urlPattern, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  /**
   * Get element text content safely
   */
  async getTextContent(selector: string): Promise<string> {
    const element = await this.waitForElement(selector);
    const text = await element.textContent();
    return text?.trim() || '';
  }

  /**
   * Check if element exists
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      await this.page.locator(selector).waitFor({ state: 'attached', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(selector: string) {
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * Upload file
   */
  async uploadFile(selector: string, filePath: string) {
    const element = await this.waitForElement(selector);
    await element.setInputFiles(filePath);
  }

  /**
   * Handle alert dialogs
   */
  async acceptAlert(expectedMessage?: string) {
    this.page.on('dialog', async dialog => {
      if (expectedMessage) {
        expect(dialog.message()).toContain(expectedMessage);
      }
      await dialog.accept();
    });
  }

  /**
   * Dismiss alert dialogs
   */
  async dismissAlert() {
    this.page.on('dialog', async dialog => {
      await dialog.dismiss();
    });
  }

  /**
   * Check accessibility violations
   */
  async checkAccessibility() {
    // This could integrate with axe-core or other accessibility testing tools
    // For now, check basic keyboard navigation
    const focusableElements = await this.page.locator(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ).count();
    
    return { focusableElementsCount: focusableElements };
  }

  /**
   * Simulate keyboard navigation
   */
  async navigateByKeyboard(key: 'Tab' | 'Enter' | 'Space' | 'Escape' | 'ArrowUp' | 'ArrowDown') {
    await this.page.keyboard.press(key);
  }

  /**
   * Get current viewport size
   */
  getViewportSize() {
    return this.page.viewportSize();
  }

  /**
   * Set viewport size
   */
  async setViewportSize(width: number, height: number) {
    await this.page.setViewportSize({ width, height });
  }
}

/**
 * Data generation utilities
 */
export class DataGenerator {
  static randomEmail(prefix = 'test'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${prefix}_${timestamp}_${random}@example.com`;
  }

  static randomString(length = 8): string {
    return Math.random().toString(36).substring(2, length + 2);
  }

  static randomNumber(min = 1, max = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static randomPhoneNumber(): string {
    const areaCode = this.randomNumber(200, 999);
    const exchange = this.randomNumber(200, 999);
    const number = this.randomNumber(1000, 9999);
    return `(${areaCode}) ${exchange}-${number}`;
  }

  static randomGrade(): string {
    const grades = ['K', '1', '2', '3', '4', '5'];
    return grades[Math.floor(Math.random() * grades.length)];
  }

  static randomChildName(): { firstName: string; lastName: string } {
    const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    
    return {
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)]
    };
  }
}