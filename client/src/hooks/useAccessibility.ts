/**
 * React hook for accessibility features
 */

import { useEffect, useRef, useCallback } from 'react';
import { accessibilityService, NavigationItem } from '@/services/AccessibilityService';

export interface UseAccessibilityOptions {
  announceOnMount?: string;
  focusOnMount?: boolean;
  navigationGroup?: string;
  navigationPriority?: number;
  keyboardActivatable?: boolean;
  ariaLabel?: string;
  ariaDescription?: string;
}

export function useAccessibility(options: UseAccessibilityOptions = {}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const navigationId = useRef<string>();

  const {
    announceOnMount,
    focusOnMount = false,
    navigationGroup,
    navigationPriority = 0,
    keyboardActivatable = false,
    ariaLabel,
    ariaDescription
  } = options;

  // Announce function
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    accessibilityService.announce(message, priority);
  }, []);

  // Focus function
  const focus = useCallback(() => {
    if (elementRef.current) {
      accessibilityService.focusElement(elementRef.current);
    }
  }, []);

  // Generate navigation ID
  useEffect(() => {
    if (!navigationId.current) {
      navigationId.current = accessibilityService.generateId('nav');
    }
  }, []);

  // Setup element accessibility
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add ARIA label and description
    if (ariaLabel) {
      accessibilityService.addLabel(element, ariaLabel, ariaDescription);
    }

    // Make keyboard activatable
    if (keyboardActivatable) {
      element.setAttribute('data-keyboard-activatable', 'true');
      if (!element.hasAttribute('role') && element.tagName !== 'BUTTON') {
        element.setAttribute('role', 'button');
      }
    }

    // Register for navigation if in a group
    if (navigationGroup && navigationId.current) {
      const navigationItem: NavigationItem = {
        id: navigationId.current,
        element,
        priority: navigationPriority,
        group: navigationGroup
      };
      accessibilityService.registerNavigationItem(navigationItem);
    }

    // Focus on mount if requested
    if (focusOnMount) {
      accessibilityService.focusElement(element);
    }

    // Announce on mount if requested
    if (announceOnMount) {
      accessibilityService.announce(announceOnMount);
    }

    // Cleanup
    return () => {
      if (navigationGroup && navigationId.current) {
        accessibilityService.unregisterNavigationItem(navigationId.current);
      }
    };
  }, [
    ariaLabel,
    ariaDescription,
    keyboardActivatable,
    navigationGroup,
    navigationPriority,
    focusOnMount,
    announceOnMount
  ]);

  return {
    elementRef,
    announce,
    focus,
    navigationId: navigationId.current
  };
}

export function useKeyboardNavigation(
  keys: string[],
  handler: (key: string, event: KeyboardEvent) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (keys.includes(event.key)) {
        handler(event.key, event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keys, handler, enabled]);
}

export function useFocusManagement() {
  const storeFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    return activeElement;
  }, []);

  const restoreFocus = useCallback((element: HTMLElement) => {
    if (element && document.contains(element)) {
      accessibilityService.focusElement(element);
    }
  }, []);

  const focusFirst = useCallback((container?: HTMLElement) => {
    const root = container || document;
    const firstFocusable = root.querySelector(
      '[tabindex="0"], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
    ) as HTMLElement;
    
    if (firstFocusable) {
      accessibilityService.focusElement(firstFocusable);
    }
  }, []);

  const focusLast = useCallback((container?: HTMLElement) => {
    const root = container || document;
    const focusableElements = root.querySelectorAll(
      '[tabindex="0"], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]'
    );
    
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
    if (lastFocusable) {
      accessibilityService.focusElement(lastFocusable);
    }
  }, []);

  return {
    storeFocus,
    restoreFocus,
    focusFirst,
    focusLast
  };
}

export function useAriaLive() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    accessibilityService.announce(message, priority);
  }, []);

  const announceError = useCallback((error: string) => {
    accessibilityService.announce(`Error: ${error}`, 'assertive');
  }, []);

  const announceSuccess = useCallback((message: string) => {
    accessibilityService.announce(`Success: ${message}`, 'polite');
  }, []);

  const announceLoading = useCallback((message = 'Loading') => {
    accessibilityService.announce(message, 'polite');
  }, []);

  return {
    announce,
    announceError,
    announceSuccess,
    announceLoading
  };
}