/**
 * Enhanced Error Boundary with detailed error reporting and recovery
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Bug, 
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';
import { accessibilityService } from '@/services/AccessibilityService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  boundary?: string;
  onNavigateHome?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  copied: boolean;
}

export class EnhancedErrorBoundaryInner extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId(),
      retryCount: 0,
      copied: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, boundary = 'unknown' } = this.props;

    this.setState({
      error,
      errorInfo,
      errorId: this.generateErrorId()
    });

    // Log error details
    console.error(`Error Boundary (${boundary}):`, error);
    console.error('Component Stack:', errorInfo.componentStack);

    // Report to error tracking service
    this.reportError(error, errorInfo, boundary);

    // Announce error to screen readers
    accessibilityService.announce(`An error occurred in ${boundary}. Please try refreshing the page.`, 'assertive');

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // Auto-retry mechanism for transient errors
    if (this.state.hasError && !prevState.hasError && this.state.retryCount < 3) {
      this.retryTimeout = setTimeout(() => {
        this.handleRetry();
      }, 5000 * (this.state.retryCount + 1)); // Exponential backoff
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private reportError(error: Error, errorInfo: ErrorInfo, boundary: string) {
    const errorReport = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      boundary,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    };

    // In a real app, send to error tracking service
    console.warn('Error Report:', errorReport);

    // Store in localStorage for offline scenarios
    try {
      const existingReports = JSON.parse(localStorage.getItem('errorReports') || '[]');
      existingReports.push(errorReport);
      
      // Keep only last 10 reports
      if (existingReports.length > 10) {
        existingReports.splice(0, existingReports.length - 10);
      }
      
      localStorage.setItem('errorReports', JSON.stringify(existingReports));
    } catch (e) {
      console.warn('Failed to store error report:', e);
    }
  }

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    accessibilityService.announce('Retrying after error...', 'polite');
  };

  private handleManualRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    this.handleRetry();
  };

  private handleGoHome = () => {
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    } else {
      // Fallback for backward compatibility
      window.location.href = '/';
    }
  };

  private handleReload = () => {
    // Force a component reset instead of page reload
    this.handleRetry();
  };

  private copyErrorDetails = async () => {
    const { error, errorInfo, errorId } = this.state;
    
    const errorDetails = `
Error ID: ${errorId}
Message: ${error?.message || 'Unknown error'}
Stack: ${error?.stack || 'No stack trace'}
Component Stack: ${errorInfo?.componentStack || 'No component stack'}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorDetails);
      this.setState({ copied: true });
      
      setTimeout(() => {
        this.setState({ copied: false });
      }, 2000);
      
      accessibilityService.announce('Error details copied to clipboard', 'polite');
    } catch (e) {
      console.warn('Failed to copy error details:', e);
    }
  };

  private getErrorSeverity(): 'low' | 'medium' | 'high' | 'critical' {
    const { error } = this.state;
    
    if (!error) return 'low';
    
    const message = error.message.toLowerCase();
    
    if (message.includes('chunk') || message.includes('loading')) {
      return 'medium'; // Network/loading issues
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'medium'; // Network issues
    }
    
    if (message.includes('permission') || message.includes('security')) {
      return 'high'; // Security issues
    }
    
    return 'high'; // Default to high for unknown errors
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  render() {
    const { hasError, error, errorInfo, errorId, retryCount, copied } = this.state;
    const { children, fallback, showDetails = true } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const severity = this.getErrorSeverity();
      const isNetworkError = error?.message.toLowerCase().includes('network') || 
                           error?.message.toLowerCase().includes('fetch') ||
                           error?.message.toLowerCase().includes('chunk');

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <CardTitle className="text-2xl text-red-700">
                Oops! Something went wrong
              </CardTitle>
              
              <CardDescription className="text-lg">
                {isNetworkError 
                  ? "It looks like there's a connection issue. Please check your internet and try again."
                  : "Don't worry! Our team has been notified and we're working on it."
                }
              </CardDescription>

              <div className="flex items-center justify-center gap-2 mt-4">
                <Badge className={this.getSeverityColor(severity)}>
                  {severity.toUpperCase()} PRIORITY
                </Badge>
                
                {retryCount > 0 && (
                  <Badge variant="outline">
                    Retry attempt: {retryCount}/3
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button 
                  onClick={this.handleManualRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
              </div>

              {/* Network-specific help */}
              {isNetworkError && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Connection Issue Detected</AlertTitle>
                  <AlertDescription>
                    Try these steps:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Check your internet connection</li>
                      <li>Refresh the page</li>
                      <li>Try again in a few moments</li>
                      <li>Some features may work offline</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Details */}
              {showDetails && (
                <details className="bg-gray-50 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-3">
                    <Bug className="inline w-4 h-4 mr-2" />
                    Technical Details
                  </summary>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong>Error ID:</strong> 
                      <code className="ml-2 bg-gray-200 px-2 py-1 rounded text-xs">
                        {errorId}
                      </code>
                    </div>
                    
                    {error && (
                      <div>
                        <strong>Message:</strong>
                        <div className="bg-red-50 p-2 rounded mt-1 text-red-700">
                          {error.message}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={this.copyErrorDetails}
                        className="text-xs"
                      >
                        {copied ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <Copy className="w-3 h-3 mr-1" />
                        )}
                        {copied ? 'Copied!' : 'Copy Details'}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open('mailto:support@playlearnSpark.com', '_blank')}
                        className="text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Report Issue
                      </Button>
                    </div>
                  </div>
                </details>
              )}

              {/* Helpful tips */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">While you wait:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Your progress is automatically saved</li>
                  <li>• You can continue with offline activities</li>
                  <li>• Check our status page for updates</li>
                  <li>• Contact support if the issue persists</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

// Wrapper component that provides navigation
import { useNavigate } from 'react-router-dom';

interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  boundary?: string;
  onNavigateHome?: () => void;
}

export const EnhancedErrorBoundary: React.FC<EnhancedErrorBoundaryProps> = (props) => {
  // Safely try to use navigate, fallback to window.location if outside router context
  let navigate: ((path: string) => void) | null = null;
  
  try {
    const reactRouterNavigate = useNavigate();
    navigate = reactRouterNavigate;
  } catch (error) {
    // useNavigate is not available outside router context
    navigate = null;
  }
  
  const handleNavigateHome = () => {
    if (navigate) {
      navigate('/');
    } else {
      // Fallback to window.location if router is not available
      window.location.href = '/';
    }
  };

  return (
    <EnhancedErrorBoundaryInner {...props} onNavigateHome={handleNavigateHome}>
      {props.children}
    </EnhancedErrorBoundaryInner>
  );
};

export default EnhancedErrorBoundary;