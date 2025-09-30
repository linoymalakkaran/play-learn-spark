/**
 * Global Error Handling Service
 * Provides centralized error handling, reporting, and recovery
 */

import { accessibilityService } from './AccessibilityService';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  type: 'javascript' | 'network' | 'runtime' | 'validation' | 'user';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: ErrorContext;
  userAgent: string;
  url: string;
  resolved: boolean;
  retryCount: number;
}

class GlobalErrorHandler {
  private errors: Map<string, ErrorReport> = new Map();
  private errorListeners: ((error: ErrorReport) => void)[] = [];
  private isInitialized = false;

  /**
   * Initialize global error handling
   */
  initialize(): void {
    if (this.isInitialized) return;

    this.setupGlobalErrorHandlers();
    this.setupUnhandledRejectionHandler();
    this.setupNetworkErrorDetection();
    
    this.isInitialized = true;
    console.log('🛡️ Global Error Handler initialized');
  }

  /**
   * Setup global JavaScript error handlers
   */
  private setupGlobalErrorHandlers(): void {
    window.addEventListener('error', (event) => {
      const error = new Error(event.message);
      error.stack = event.error?.stack;
      
      this.handleError(error, {
        component: 'global',
        action: 'javascript_error',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      const error = new Error(`Unhandled Promise Rejection: ${event.reason}`);
      
      this.handleError(error, {
        component: 'global',
        action: 'promise_rejection',
        metadata: {
          reason: event.reason
        }
      });
    });
  }

  /**
   * Setup unhandled promise rejection handler
   */
  private setupUnhandledRejectionHandler(): void {
    window.addEventListener('unhandledrejection', (event) => {
      console.warn('Unhandled promise rejection:', event.reason);
      
      const error = new Error(`Unhandled Promise: ${event.reason}`);
      this.handleError(error, {
        component: 'promise',
        action: 'unhandled_rejection'
      });
    });
  }

  /**
   * Setup network error detection
   */
  private setupNetworkErrorDetection(): void {
    // Monitor fetch failures
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          this.handleNetworkError(args[0], response.status, response.statusText);
        }
        
        return response;
      } catch (error) {
        this.handleNetworkError(args[0], 0, (error as Error).message);
        throw error;
      }
    };

    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.handleRecovery('network', 'Connection restored');
    });

    window.addEventListener('offline', () => {
      this.handleError(new Error('Network connection lost'), {
        component: 'network',
        action: 'offline'
      });
    });
  }

  /**
   * Handle network errors
   */
  private handleNetworkError(url: string | Request | URL, status: number, statusText: string): void {
    let urlString: string;
    
    if (typeof url === 'string') {
      urlString = url;
    } else if (url instanceof URL) {
      urlString = url.toString();
    } else {
      urlString = url.url;
    }
    
    const error = new Error(`Network Error: ${status} ${statusText}`);
    this.handleError(error, {
      component: 'network',
      action: 'fetch_error',
      metadata: {
        url: urlString,
        status,
        statusText
      }
    });
  }

  /**
   * Handle errors with context
   */
  handleError(error: Error, context: ErrorContext = {}): string {
    const errorId = this.generateErrorId();
    const severity = this.determineSeverity(error, context);
    
    const errorReport: ErrorReport = {
      id: errorId,
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      type: this.determineErrorType(error, context),
      severity,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      resolved: false,
      retryCount: 0
    };

    this.errors.set(errorId, errorReport);
    
    // Log error
    console.error(`Error [${errorId}]:`, error);
    console.error('Context:', context);

    // Announce to screen readers for critical errors
    if (severity === 'critical' || severity === 'high') {
      accessibilityService.announce(
        `A ${severity} error occurred. Please check your connection or refresh the page.`,
        'assertive'
      );
    }

    // Notify listeners
    this.errorListeners.forEach(listener => {
      try {
        listener(errorReport);
      } catch (e) {
        console.warn('Error listener failed:', e);
      }
    });

    // Store in localStorage for offline scenarios
    this.persistError(errorReport);

    // Send to error tracking service
    this.reportError(errorReport);

    return errorId;
  }

  /**
   * Handle error recovery
   */
  handleRecovery(type: string, message: string): void {
    console.log(`Recovery: ${type} - ${message}`);
    
    // Mark related errors as resolved
    this.errors.forEach((error) => {
      if (error.context.component === type && !error.resolved) {
        error.resolved = true;
        console.log(`Resolved error: ${error.id}`);
      }
    });

    // Announce recovery
    accessibilityService.announce(message, 'polite');
  }

  /**
   * Retry failed operation
   */
  retry(errorId: string, retryFn: () => Promise<void>): Promise<void> {
    const error = this.errors.get(errorId);
    if (!error) {
      throw new Error(`Error ${errorId} not found`);
    }

    error.retryCount++;
    
    return retryFn()
      .then(() => {
        error.resolved = true;
        console.log(`Successfully retried error: ${errorId}`);
        accessibilityService.announce('Operation completed successfully', 'polite');
      })
      .catch((retryError) => {
        console.warn(`Retry failed for error ${errorId}:`, retryError);
        throw retryError;
      });
  }

  /**
   * Get error by ID
   */
  getError(errorId: string): ErrorReport | undefined {
    return this.errors.get(errorId);
  }

  /**
   * Get all errors
   */
  getAllErrors(): ErrorReport[] {
    return Array.from(this.errors.values());
  }

  /**
   * Get unresolved errors
   */
  getUnresolvedErrors(): ErrorReport[] {
    return Array.from(this.errors.values()).filter(error => !error.resolved);
  }

  /**
   * Clear resolved errors
   */
  clearResolvedErrors(): void {
    this.errors.forEach((error, id) => {
      if (error.resolved) {
        this.errors.delete(id);
      }
    });
  }

  /**
   * Add error listener
   */
  addErrorListener(listener: (error: ErrorReport) => void): () => void {
    this.errorListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error, context: ErrorContext): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();
    
    // Critical errors that break the app
    if (message.includes('chunk') && message.includes('loading')) {
      return 'critical'; // Code splitting failures
    }
    
    if (context.component === 'payment' || context.component === 'auth') {
      return 'critical'; // Security/payment issues
    }

    // High priority errors
    if (message.includes('network') || message.includes('fetch')) {
      return 'medium'; // Network issues are often temporary
    }
    
    if (message.includes('permission') || message.includes('security')) {
      return 'high'; // Security issues
    }
    
    if (context.action === 'data_loss') {
      return 'high'; // Data integrity issues
    }

    // Medium priority
    if (message.includes('validation') || context.action?.includes('validation')) {
      return 'medium'; // User input validation
    }

    // Default to medium for unknown errors
    return 'medium';
  }

  /**
   * Determine error type
   */
  private determineErrorType(error: Error, context: ErrorContext): ErrorReport['type'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || context.component === 'network') {
      return 'network';
    }
    
    if (message.includes('validation') || context.action?.includes('validation')) {
      return 'validation';
    }
    
    if (context.action?.includes('user') || context.component?.includes('user')) {
      return 'user';
    }
    
    if (message.includes('runtime') || message.includes('reference')) {
      return 'runtime';
    }
    
    return 'javascript';
  }

  /**
   * Persist error to localStorage
   */
  private persistError(error: ErrorReport): void {
    try {
      const stored = JSON.parse(localStorage.getItem('errorReports') || '[]');
      stored.push(error);
      
      // Keep only last 20 errors
      if (stored.length > 20) {
        stored.splice(0, stored.length - 20);
      }
      
      localStorage.setItem('errorReports', JSON.stringify(stored));
    } catch (e) {
      console.warn('Failed to persist error:', e);
    }
  }

  /**
   * Report error to external service
   */
  private reportError(error: ErrorReport): void {
    // In a real app, send to error tracking service like Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'development') {
      console.log('Would report error to tracking service:', error);
    }
    
    // Example API call (commented out)
    /*
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error)
    }).catch(e => console.warn('Error reporting failed:', e));
    */
  }

  /**
   * Get error statistics
   */
  getStats(): {
    total: number;
    unresolved: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const errors = Array.from(this.errors.values());
    
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    
    errors.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });
    
    return {
      total: errors.length,
      unresolved: errors.filter(e => !e.resolved).length,
      byType,
      bySeverity
    };
  }
}

// Export singleton instance
export const globalErrorHandler = new GlobalErrorHandler();
export default globalErrorHandler;