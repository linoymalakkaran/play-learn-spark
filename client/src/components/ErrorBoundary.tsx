import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onNavigateHome?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundaryInner extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    } else {
      // Fallback to window.location for backward compatibility
      window.location.href = '/';
    }
  };

  private handleReload = () => {
    // Force a state reset instead of page reload
    this.handleReset();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
          {/* Fun Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">😅</div>
            <div className="absolute top-20 right-20 text-5xl opacity-20 animate-pulse">🔧</div>
            <div className="absolute bottom-20 left-20 text-4xl opacity-20 animate-bounce delay-300">🚀</div>
            <div className="absolute bottom-10 right-10 text-5xl opacity-20 animate-pulse delay-500">✨</div>
            <div className="absolute top-1/2 left-1/4 text-3xl opacity-20 animate-bounce delay-700">🎯</div>
            <div className="absolute top-1/3 right-1/3 text-4xl opacity-20 animate-pulse delay-200">🌈</div>
          </div>

          <Card className="w-full max-w-lg mx-auto shadow-2xl bg-white/90 backdrop-blur-sm border-0 rounded-3xl relative z-10">
            <CardHeader className="text-center">
              {/* Fun Error Character */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <div className="text-3xl">🤖</div>
              </div>
              
              <div className="space-y-2">
                <CardTitle className="text-2xl font-['Fredoka_One'] bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Oops! Something Got Confused! 🤔
                </CardTitle>
                <CardDescription className="text-purple-600 font-['Comic_Neue'] font-bold text-lg">
                  Don't worry! Even robots make mistakes sometimes! 
                  Let's fix this together and get back to learning! 🌟
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Kid-Friendly Error Message */}
              <Alert className="border-2 border-orange-200 bg-orange-50">
                <div className="text-2xl mb-2">🔍</div>
                <AlertTitle className="font-['Comic_Neue'] font-bold text-orange-800">What Happened?</AlertTitle>
                <AlertDescription className="text-orange-700 font-['Comic_Neue']">
                  The computer got a little mixed up, but that's okay! 
                  Sometimes technology needs a little help to work perfectly.
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={this.handleReset}
                  className="w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-600 hover:via-blue-600 hover:to-purple-600 text-white font-['Comic_Neue'] font-bold py-4 text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  🔄 Try Again (Magic Fix!)
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-['Comic_Neue'] font-bold py-4 text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  <Home className="w-5 h-5 mr-2" />
                  🏠 Go Back Home
                </Button>
              </div>

              {/* Encouraging Message */}
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white p-4 rounded-xl text-center">
                <div className="text-2xl mb-2">💪</div>
                <p className="font-['Comic_Neue'] font-bold">
                  Hey, you're doing AWESOME! 🌟<br/>
                  Every great learner faces little bumps like this!<br/>
                  Let's keep exploring and having fun! 🚀
                </p>
              </div>

              {/* Fun Facts While They Wait */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h4 className="font-['Comic_Neue'] font-bold text-blue-700 mb-2 flex items-center gap-2">
                  🧠 Fun Fact While We Fix This:
                </h4>
                <p className="text-blue-600 font-['Comic_Neue'] text-sm">
                  Did you know that the first computer bug was actually a real bug? 
                  A moth got stuck in a computer in 1947! 🦋 
                  That's why we call computer problems "bugs"!
                </p>
              </div>

              {/* Developer Details (Hidden in Production) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-gray-50 rounded-xl text-xs">
                  <summary className="cursor-pointer font-['Comic_Neue'] font-bold text-gray-700 mb-2">
                    🔧 Developer Details (Click to expand)
                  </summary>
                  <pre className="whitespace-pre-wrap text-gray-600 overflow-x-auto font-mono text-xs">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="whitespace-pre-wrap text-gray-600 mt-2 overflow-x-auto font-mono text-xs">
                      Component Stack: {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component that provides navigation
import { useNavigate } from 'react-router-dom';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
  const navigate = useNavigate();
  
  const handleNavigateHome = () => {
    navigate('/');
  };

  return (
    <ErrorBoundaryInner onNavigateHome={handleNavigateHome} fallback={fallback}>
      {children}
    </ErrorBoundaryInner>
  );
};

export default ErrorBoundary;