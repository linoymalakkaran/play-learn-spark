/**
 * Accessibility Service for Play & Learn Spark
 * Provides comprehensive accessibility utilities and monitoring
 */

export interface AccessibilityConfig {
  announceChanges: boolean;
  focusManagement: boolean;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export interface NavigationItem {
  id: string;
  element: HTMLElement;
  priority: number;
  group?: string;
}

class AccessibilityService {
  private config: AccessibilityConfig = {
    announceChanges: true,
    focusManagement: true,
    keyboardNavigation: true,
    screenReaderSupport: true,
    highContrast: false,
    reducedMotion: false,
  };

  private liveRegion: HTMLElement | null = null;
  private navigationItems: Map<string, NavigationItem> = new Map();
  private focusHistory: HTMLElement[] = [];
  private currentFocusGroup: string | null = null;

  /**
   * Initialize accessibility service
   */
  initialize(): void {
    this.createLiveRegion();
    this.setupKeyboardNavigation();
    this.detectUserPreferences();
    this.setupFocusManagement();
    
    console.log('♿ Accessibility Service initialized');
  }

  /**
   * Create ARIA live region for announcements
   */
  private createLiveRegion(): void {
    if (this.liveRegion) return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('class', 'sr-only');
    this.liveRegion.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    
    document.body.appendChild(this.liveRegion);
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.config.announceChanges || !this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }

  /**
   * Setup keyboard navigation
   */
  private setupKeyboardNavigation(): void {
    if (!this.config.keyboardNavigation) return;

    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyboardNavigation(event: KeyboardEvent): void {
    const { key, ctrlKey, altKey, shiftKey } = event;
    
    switch (key) {
      case 'Tab':
        this.handleTabNavigation(event);
        break;
      case 'Escape':
        this.handleEscape(event);
        break;
      case 'Enter':
      case ' ':
        this.handleActivation(event);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.handleArrowNavigation(event);
        break;
      case 'Home':
      case 'End':
        this.handleHomeEnd(event);
        break;
    }

    // Skip navigation (Alt + S)
    if (altKey && key.toLowerCase() === 's') {
      this.skipToMainContent();
      event.preventDefault();
    }
  }

  /**
   * Handle tab navigation within focus groups
   */
  private handleTabNavigation(event: KeyboardEvent): void {
    if (!this.currentFocusGroup) return;

    const groupItems = Array.from(this.navigationItems.values())
      .filter(item => item.group === this.currentFocusGroup)
      .sort((a, b) => a.priority - b.priority);

    if (groupItems.length <= 1) return;

    const currentElement = document.activeElement as HTMLElement;
    const currentIndex = groupItems.findIndex(item => item.element === currentElement);

    if (currentIndex === -1) return;

    event.preventDefault();
    
    const nextIndex = event.shiftKey 
      ? (currentIndex - 1 + groupItems.length) % groupItems.length
      : (currentIndex + 1) % groupItems.length;

    this.focusElement(groupItems[nextIndex].element);
  }

  /**
   * Handle escape key
   */
  private handleEscape(event: KeyboardEvent): void {
    // Close modals, return to previous focus, etc.
    if (this.focusHistory.length > 0) {
      const previousElement = this.focusHistory.pop();
      if (previousElement && document.contains(previousElement)) {
        this.focusElement(previousElement);
      }
    }
  }

  /**
   * Handle activation (Enter/Space)
   */
  private handleActivation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    if (target.hasAttribute('data-keyboard-activatable')) {
      target.click();
      event.preventDefault();
    }
  }

  /**
   * Handle arrow key navigation
   */
  private handleArrowNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const group = target.getAttribute('data-nav-group');
    
    if (!group) return;

    const groupItems = Array.from(this.navigationItems.values())
      .filter(item => item.group === group)
      .sort((a, b) => a.priority - b.priority);

    if (groupItems.length <= 1) return;

    const currentIndex = groupItems.findIndex(item => item.element === target);
    if (currentIndex === -1) return;

    event.preventDefault();

    let nextIndex: number;
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + groupItems.length) % groupItems.length;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % groupItems.length;
        break;
      default:
        return;
    }

    this.focusElement(groupItems[nextIndex].element);
  }

  /**
   * Handle Home/End navigation
   */
  private handleHomeEnd(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const group = target.getAttribute('data-nav-group');
    
    if (!group) return;

    const groupItems = Array.from(this.navigationItems.values())
      .filter(item => item.group === group)
      .sort((a, b) => a.priority - b.priority);

    if (groupItems.length <= 1) return;

    event.preventDefault();

    const targetIndex = event.key === 'Home' ? 0 : groupItems.length - 1;
    this.focusElement(groupItems[targetIndex].element);
  }

  /**
   * Skip to main content
   */
  private skipToMainContent(): void {
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent) {
      this.focusElement(mainContent as HTMLElement);
      this.announce('Skipped to main content');
    }
  }

  /**
   * Focus element with proper management
   */
  focusElement(element: HTMLElement, storePrevious = true): void {
    if (!this.config.focusManagement) return;

    if (storePrevious && document.activeElement && document.activeElement !== element) {
      this.focusHistory.push(document.activeElement as HTMLElement);
    }

    element.focus();
    
    // Ensure element is scrolled into view
    element.scrollIntoView({ 
      behavior: this.config.reducedMotion ? 'auto' : 'smooth',
      block: 'nearest' 
    });
  }

  /**
   * Register navigation item
   */
  registerNavigationItem(item: NavigationItem): void {
    this.navigationItems.set(item.id, item);
    
    // Add accessibility attributes
    item.element.setAttribute('data-nav-group', item.group || 'default');
    item.element.setAttribute('data-nav-priority', item.priority.toString());
    
    if (!item.element.hasAttribute('tabindex')) {
      item.element.setAttribute('tabindex', '0');
    }
  }

  /**
   * Unregister navigation item
   */
  unregisterNavigationItem(id: string): void {
    const item = this.navigationItems.get(id);
    if (item) {
      item.element.removeAttribute('data-nav-group');
      item.element.removeAttribute('data-nav-priority');
      this.navigationItems.delete(id);
    }
  }

  /**
   * Set current focus group
   */
  setFocusGroup(group: string | null): void {
    this.currentFocusGroup = group;
  }

  /**
   * Detect user accessibility preferences
   */
  private detectUserPreferences(): void {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.config.reducedMotion = prefersReducedMotion.matches;

    prefersReducedMotion.addEventListener('change', (e) => {
      this.config.reducedMotion = e.matches;
      this.announce(e.matches ? 'Motion reduced' : 'Motion enabled');
    });

    // Check for high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    this.config.highContrast = prefersHighContrast.matches;

    prefersHighContrast.addEventListener('change', (e) => {
      this.config.highContrast = e.matches;
      document.body.classList.toggle('high-contrast', e.matches);
      this.announce(e.matches ? 'High contrast enabled' : 'High contrast disabled');
    });
  }

  /**
   * Setup focus management
   */
  private setupFocusManagement(): void {
    if (!this.config.focusManagement) return;

    // Track focus changes
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      const group = target.getAttribute('data-nav-group');
      
      if (group && group !== this.currentFocusGroup) {
        this.setFocusGroup(group);
      }
    });

    // Handle focus loss
    document.addEventListener('focusout', (event) => {
      // Delay to check if focus moved to related element
      setTimeout(() => {
        if (!document.activeElement || document.activeElement === document.body) {
          // Focus was lost, restore if needed
          this.restoreFocus();
        }
      }, 100);
    });
  }

  /**
   * Restore focus to appropriate element
   */
  private restoreFocus(): void {
    if (this.focusHistory.length > 0) {
      const lastElement = this.focusHistory[this.focusHistory.length - 1];
      if (lastElement && document.contains(lastElement)) {
        this.focusElement(lastElement, false);
        return;
      }
    }

    // Fallback to first focusable element
    const firstFocusable = document.querySelector('[tabindex="0"], button, input, select, textarea, a[href]') as HTMLElement;
    if (firstFocusable) {
      this.focusElement(firstFocusable, false);
    }
  }

  /**
   * Generate accessible ID
   */
  generateId(prefix: string = 'acc'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add accessible label
   */
  addLabel(element: HTMLElement, label: string, description?: string): void {
    const labelId = this.generateId('label');
    const descId = description ? this.generateId('desc') : null;

    // Create label element
    const labelElement = document.createElement('span');
    labelElement.id = labelId;
    labelElement.className = 'sr-only';
    labelElement.textContent = label;
    element.parentNode?.insertBefore(labelElement, element);

    // Create description element if provided
    if (description && descId) {
      const descElement = document.createElement('span');
      descElement.id = descId;
      descElement.className = 'sr-only';
      descElement.textContent = description;
      element.parentNode?.insertBefore(descElement, element.nextSibling);
    }

    // Set ARIA attributes
    element.setAttribute('aria-labelledby', labelId);
    if (descId) {
      element.setAttribute('aria-describedby', descId);
    }
  }

  /**
   * Check if element is focusable
   */
  isFocusable(element: HTMLElement): boolean {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];

    return focusableSelectors.some(selector => element.matches(selector)) &&
           element.offsetParent !== null &&
           !element.hasAttribute('inert');
  }

  /**
   * Get configuration
   */
  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...updates };
    
    if (updates.announceChanges !== undefined) {
      this.announce('Accessibility settings updated');
    }
  }

  /**
   * Get accessibility report
   */
  getReport(): {
    navigationItems: number;
    focusableElements: number;
    ariaLabels: number;
    config: AccessibilityConfig;
  } {
    const focusableElements = document.querySelectorAll('[tabindex], button, input, select, textarea, a[href]').length;
    const ariaLabels = document.querySelectorAll('[aria-label], [aria-labelledby]').length;

    return {
      navigationItems: this.navigationItems.size,
      focusableElements,
      ariaLabels,
      config: this.getConfig()
    };
  }
}

// Export singleton instance
export const accessibilityService = new AccessibilityService();
export default accessibilityService;