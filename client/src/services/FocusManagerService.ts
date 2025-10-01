/**
 * Enhanced Focus Management Service for Play & Learn Spark
 * Provides comprehensive focus management and keyboard navigation
 */

interface FocusableElement extends HTMLElement {
  tabIndex: number;
}

interface FocusOptions {
  preventScroll?: boolean;
  selectText?: boolean;
  announceToScreenReader?: boolean;
}

interface FocusTrap {
  id: string;
  container: HTMLElement;
  active: boolean;
  firstFocusable?: HTMLElement;
  lastFocusable?: HTMLElement;
}

class FocusManagerService {
  private static instance: FocusManagerService;
  private focusTraps: Map<string, FocusTrap> = new Map();
  private focusHistory: HTMLElement[] = [];
  private keyboardHandlers: Map<string, (event: KeyboardEvent) => void> = new Map();
  private lastFocusedElement: HTMLElement | null = null;
  private announcer: HTMLElement | null = null;

  private constructor() {
    this.initializeAnnouncer();
    this.setupGlobalKeyboardHandlers();
  }

  static getInstance(): FocusManagerService {
    if (!FocusManagerService.instance) {
      FocusManagerService.instance = new FocusManagerService();
    }
    return FocusManagerService.instance;
  }

  /**
   * Initialize screen reader announcer
   */
  private initializeAnnouncer(): void {
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';
    this.announcer.id = 'focus-announcer';
    document.body.appendChild(this.announcer);
  }

  /**
   * Setup global keyboard navigation handlers
   */
  private setupGlobalKeyboardHandlers(): void {
    document.addEventListener('keydown', (event) => {
      // Skip navigation (Alt + number keys)
      if (event.altKey && event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        this.handleSkipNavigation(parseInt(event.key));
        return;
      }

      // Focus trap handling
      if (event.key === 'Tab') {
        this.handleTabKeyInTraps(event);
      }

      // Escape key handling
      if (event.key === 'Escape') {
        this.handleEscapeKey(event);
      }

      // Arrow key navigation in grids and lists
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        this.handleArrowKeyNavigation(event);
      }
    });

    // Track focus changes
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      if (target && target !== this.lastFocusedElement) {
        this.addToFocusHistory(target);
        this.lastFocusedElement = target;
      }
    });
  }

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      'audio[controls]',
      'video[controls]',
      'iframe',
      'object',
      'embed',
      'details > summary'
    ].join(', ');

    const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
    
    return elements.filter(element => {
      // Check if element is visible and not hidden
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             element.offsetParent !== null &&
             !element.hasAttribute('inert');
    });
  }

  /**
   * Focus an element with enhanced options
   */
  focusElement(element: HTMLElement | string, options: FocusOptions = {}): boolean {
    const targetElement = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement
      : element;

    if (!targetElement) {
      console.warn('FocusManager: Target element not found');
      return false;
    }

    try {
      // Focus the element
      targetElement.focus({ preventScroll: options.preventScroll });

      // Select text if it's an input field
      if (options.selectText && (targetElement instanceof HTMLInputElement || targetElement instanceof HTMLTextAreaElement)) {
        targetElement.select();
      }

      // Announce to screen reader
      if (options.announceToScreenReader) {
        this.announceToScreenReader(
          `Focused on ${this.getElementDescription(targetElement)}`
        );
      }

      // Scroll into view if not preventing scroll
      if (!options.preventScroll) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }

      return true;
    } catch (error) {
      console.error('FocusManager: Error focusing element:', error);
      return false;
    }
  }

  /**
   * Create a focus trap within a container
   */
  createFocusTrap(id: string, container: HTMLElement | string): string {
    const containerElement = typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container;

    if (!containerElement) {
      throw new Error('FocusManager: Container element not found for focus trap');
    }

    const focusableElements = this.getFocusableElements(containerElement);
    
    const focusTrap: FocusTrap = {
      id,
      container: containerElement,
      active: false,
      firstFocusable: focusableElements[0],
      lastFocusable: focusableElements[focusableElements.length - 1]
    };

    this.focusTraps.set(id, focusTrap);
    return id;
  }

  /**
   * Activate a focus trap
   */
  activateFocusTrap(id: string): boolean {
    const trap = this.focusTraps.get(id);
    if (!trap) {
      console.warn(`FocusManager: Focus trap '${id}' not found`);
      return false;
    }

    // Deactivate other traps
    this.focusTraps.forEach(t => t.active = false);

    trap.active = true;
    
    // Focus the first focusable element
    if (trap.firstFocusable) {
      this.focusElement(trap.firstFocusable);
    }

    return true;
  }

  /**
   * Deactivate a focus trap
   */
  deactivateFocusTrap(id: string): boolean {
    const trap = this.focusTraps.get(id);
    if (!trap) {
      console.warn(`FocusManager: Focus trap '${id}' not found`);
      return false;
    }

    trap.active = false;
    return true;
  }

  /**
   * Remove a focus trap
   */
  removeFocusTrap(id: string): boolean {
    return this.focusTraps.delete(id);
  }

  /**
   * Handle Tab key within focus traps
   */
  private handleTabKeyInTraps(event: KeyboardEvent): void {
    const activeTrap = Array.from(this.focusTraps.values()).find(trap => trap.active);
    if (!activeTrap || !activeTrap.firstFocusable || !activeTrap.lastFocusable) {
      return;
    }

    const isTabbing = !event.shiftKey;
    const isShiftTabbing = event.shiftKey;

    if (isTabbing && document.activeElement === activeTrap.lastFocusable) {
      event.preventDefault();
      this.focusElement(activeTrap.firstFocusable);
    } else if (isShiftTabbing && document.activeElement === activeTrap.firstFocusable) {
      event.preventDefault();
      this.focusElement(activeTrap.lastFocusable);
    }
  }

  /**
   * Handle Escape key to close modals/dialogs
   */
  private handleEscapeKey(event: KeyboardEvent): void {
    // Find active modal or dialog
    const activeModal = document.querySelector('[role="dialog"][aria-modal="true"], .modal[aria-modal="true"]') as HTMLElement;
    if (activeModal) {
      // Look for close button
      const closeButton = activeModal.querySelector('[data-dismiss], [aria-label*="close"], [aria-label*="Close"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }

    // Deactivate focus traps on escape
    const activeTrap = Array.from(this.focusTraps.values()).find(trap => trap.active);
    if (activeTrap) {
      this.deactivateFocusTrap(activeTrap.id);
      this.restoreFocus();
    }
  }

  /**
   * Handle arrow key navigation in grids and lists
   */
  private handleArrowKeyNavigation(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const parent = target.closest('[role="grid"], [role="listbox"], [role="menu"], [role="tablist"]');
    
    if (!parent) return;

    const role = parent.getAttribute('role');
    const focusableElements = this.getFocusableElements(parent);
    const currentIndex = focusableElements.indexOf(target);

    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowUp':
        if (role === 'grid' || role === 'listbox' || role === 'menu') {
          event.preventDefault();
          nextIndex = Math.max(0, currentIndex - 1);
        }
        break;
      case 'ArrowDown':
        if (role === 'grid' || role === 'listbox' || role === 'menu') {
          event.preventDefault();
          nextIndex = Math.min(focusableElements.length - 1, currentIndex + 1);
        }
        break;
      case 'ArrowLeft':
        if (role === 'tablist' || role === 'grid') {
          event.preventDefault();
          nextIndex = Math.max(0, currentIndex - 1);
        }
        break;
      case 'ArrowRight':
        if (role === 'tablist' || role === 'grid') {
          event.preventDefault();
          nextIndex = Math.min(focusableElements.length - 1, currentIndex + 1);
        }
        break;
    }

    if (nextIndex !== currentIndex) {
      this.focusElement(focusableElements[nextIndex]);
    }
  }

  /**
   * Handle skip navigation shortcuts
   */
  private handleSkipNavigation(number: number): void {
    const skipTargets = [
      '#main-content',
      '#navigation', 
      '#sidebar',
      '#footer',
      '#search',
      '#activities',
      '#dashboard',
      '#settings',
      '#help'
    ];

    const targetSelector = skipTargets[number - 1];
    if (targetSelector) {
      const target = document.querySelector(targetSelector) as HTMLElement;
      if (target) {
        this.focusElement(target, { announceToScreenReader: true });
      }
    }
  }

  /**
   * Add element to focus history
   */
  private addToFocusHistory(element: HTMLElement): void {
    // Remove element if it already exists in history
    this.focusHistory = this.focusHistory.filter(el => el !== element);
    
    // Add to beginning of history
    this.focusHistory.unshift(element);
    
    // Keep only last 10 elements
    if (this.focusHistory.length > 10) {
      this.focusHistory = this.focusHistory.slice(0, 10);
    }
  }

  /**
   * Restore focus to previous element
   */
  restoreFocus(): boolean {
    // Try to focus the previous element in history
    for (const element of this.focusHistory) {
      if (document.contains(element) && element.offsetParent !== null) {
        return this.focusElement(element);
      }
    }

    // Fallback to main content or body
    const mainContent = document.querySelector('#main-content, main, [role="main"]') as HTMLElement;
    if (mainContent) {
      return this.focusElement(mainContent);
    }

    return false;
  }

  /**
   * Announce message to screen readers
   */
  announceToScreenReader(message: string): void {
    if (this.announcer) {
      this.announcer.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        if (this.announcer) {
          this.announcer.textContent = '';
        }
      }, 1000);
    }
  }

  /**
   * Get descriptive text for an element
   */
  private getElementDescription(element: HTMLElement): string {
    // Try aria-label first
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // Try aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) return labelElement.textContent || labelElement.innerText || '';
    }

    // Try associated label
    if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
      const label = document.querySelector(`label[for="${element.id}"]`) as HTMLLabelElement;
      if (label) return label.textContent || label.innerText || '';
    }

    // Use text content or placeholder
    const textContent = element.textContent || element.innerText;
    if (textContent) return textContent.trim();

    const placeholder = element.getAttribute('placeholder');
    if (placeholder) return placeholder;

    // Fallback to tag name and role
    const role = element.getAttribute('role') || element.tagName.toLowerCase();
    return `${role} element`;
  }

  /**
   * Add global keyboard shortcut
   */
  addKeyboardShortcut(key: string, handler: (event: KeyboardEvent) => void): void {
    this.keyboardHandlers.set(key, handler);
    
    document.addEventListener('keydown', (event) => {
      const shortcutKey = this.getShortcutKey(event);
      const handler = this.keyboardHandlers.get(shortcutKey);
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    });
  }

  /**
   * Remove keyboard shortcut
   */
  removeKeyboardShortcut(key: string): boolean {
    return this.keyboardHandlers.delete(key);
  }

  /**
   * Get shortcut key string from event
   */
  private getShortcutKey(event: KeyboardEvent): string {
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.altKey) modifiers.push('alt');
    if (event.shiftKey) modifiers.push('shift');
    if (event.metaKey) modifiers.push('meta');
    
    modifiers.push(event.key.toLowerCase());
    return modifiers.join('+');
  }

  /**
   * Check if an element is focusable
   */
  isFocusable(element: HTMLElement): boolean {
    const focusableElements = this.getFocusableElements();
    return focusableElements.includes(element);
  }

  /**
   * Get focus statistics
   */
  getFocusStatistics(): { 
    totalFocusable: number;
    focusHistory: number;
    activeFocusTraps: number;
    keyboardShortcuts: number;
  } {
    return {
      totalFocusable: this.getFocusableElements().length,
      focusHistory: this.focusHistory.length,
      activeFocusTraps: Array.from(this.focusTraps.values()).filter(trap => trap.active).length,
      keyboardShortcuts: this.keyboardHandlers.size
    };
  }

  /**
   * Cleanup - remove all event listeners and references
   */
  cleanup(): void {
    this.focusTraps.clear();
    this.focusHistory = [];
    this.keyboardHandlers.clear();
    
    if (this.announcer && this.announcer.parentNode) {
      this.announcer.parentNode.removeChild(this.announcer);
      this.announcer = null;
    }
  }
}

export default FocusManagerService;