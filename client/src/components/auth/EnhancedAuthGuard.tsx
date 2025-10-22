import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContextEnhanced';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  User, 
  Users, 
  GraduationCap, 
  Coffee,
  ArrowLeft,
  Home,
  LogIn
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: Array<{
    permission: string;
    action: 'read' | 'write' | 'delete' | 'create';
  }>;
  allowGuest?: boolean;
  fallbackPath?: string;
  showAccessDenied?: boolean;
}

interface AccessDeniedProps {
  reason: 'not-authenticated' | 'insufficient-role' | 'insufficient-permission' | 'guest-not-allowed';
  requiredRoles?: string[];
  requiredPermissions?: Array<{
    permission: string;
    action: 'read' | 'write' | 'delete' | 'create';
  }>;
  userRole?: string;
  onRetry?: () => void;
}

const roleIcons = {
  admin: Shield,
  educator: GraduationCap,
  parent: Users,
  child: User,
  guest: Coffee
};

const roleColors = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  educator: 'bg-blue-100 text-blue-800 border-blue-200',
  parent: 'bg-green-100 text-green-800 border-green-200',
  child: 'bg-purple-100 text-purple-800 border-purple-200',
  guest: 'bg-gray-100 text-gray-800 border-gray-200'
};

const AccessDeniedComponent: React.FC<AccessDeniedProps> = ({
  reason,
  requiredRoles,
  requiredPermissions,
  userRole,
  onRetry
}) => {
  const location = useLocation();

  const getReasonDetails = () => {
    switch (reason) {
      case 'not-authenticated':
        return {
          title: 'Authentication Required',
          description: 'You need to sign in to access this page.',
          icon: LogIn,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'insufficient-role':
        return {
          title: 'Access Restricted',
          description: 'Your account role does not have access to this page.',
          icon: Lock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'insufficient-permission':
        return {
          title: 'Permission Denied',
          description: 'You do not have the required permissions to access this page.',
          icon: Shield,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'guest-not-allowed':
        return {
          title: 'Account Required',
          description: 'This feature requires a registered account. Guest access is not allowed.',
          icon: User,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      default:
        return {
          title: 'Access Denied',
          description: 'You do not have permission to access this page.',
          icon: AlertTriangle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const details = getReasonDetails();
  const ReasonIcon = details.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className={`w-full max-w-md shadow-lg ${details.borderColor} border-2`}>
        <CardHeader className="text-center space-y-4">
          <div className={`mx-auto w-16 h-16 ${details.bgColor} rounded-full flex items-center justify-center`}>
            <ReasonIcon className={`w-8 h-8 ${details.color}`} />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {details.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {details.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current User Info */}
          {userRole && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">You are currently signed in as:</p>
              <Badge className={`${roleColors[userRole as keyof typeof roleColors] || roleColors.guest} border`}>
                {userRole.toUpperCase()}
              </Badge>
            </div>
          )}

          {/* Required Access Info */}
          {(requiredRoles || requiredPermissions) && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  {requiredRoles && (
                    <div>
                      <p className="font-medium">Required Roles:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {requiredRoles.map(role => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {requiredPermissions && (
                    <div>
                      <p className="font-medium">Required Permissions:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {requiredPermissions.map((perm, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {perm.permission} ({perm.action})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {reason === 'not-authenticated' ? (
              <>
                <Link to={`/login?returnTo=${encodeURIComponent(location.pathname)}`}>
                  <Button className="w-full">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" className="w-full">
                    <User className="mr-2 h-4 w-4" />
                    Create Account
                  </Button>
                </Link>
              </>
            ) : reason === 'guest-not-allowed' ? (
              <>
                <Link to="/register">
                  <Button className="w-full">
                    <User className="mr-2 h-4 w-4" />
                    Create Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In to Existing Account
                  </Button>
                </Link>
              </>
            ) : (
              <>
                {onRetry && (
                  <Button onClick={onRetry} className="w-full">
                    Try Again
                  </Button>
                )}
                <Link to="/dashboard">
                  <Button variant="outline" className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            )}
            
            <Button variant="ghost" onClick={() => window.history.back()} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact your administrator or{' '}
              <Link to="/help" className="text-blue-600 hover:underline">
                visit our help center
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const EnhancedAuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  allowGuest = false,
  fallbackPath = '/login',
  showAccessDenied = true
}) => {
  const { user, isAuthenticated, hasRole, hasPermission, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    if (showAccessDenied) {
      return <AccessDeniedComponent reason="not-authenticated" />;
    }
    return <Navigate to={`${fallbackPath}?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Check if guest access is allowed
  if (user.role === 'guest' && !allowGuest) {
    if (showAccessDenied) {
      return <AccessDeniedComponent reason="guest-not-allowed" userRole={user.role} />;
    }
    return <Navigate to="/register" replace />;
  }

  // Check required roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      if (showAccessDenied) {
        return (
          <AccessDeniedComponent 
            reason="insufficient-role" 
            requiredRoles={requiredRoles}
            userRole={user.role}
          />
        );
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check required permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(
      ({ permission, action }) => hasPermission(permission, action)
    );
    if (!hasRequiredPermissions) {
      if (showAccessDenied) {
        return (
          <AccessDeniedComponent 
            reason="insufficient-permission" 
            requiredPermissions={requiredPermissions}
            userRole={user.role}
          />
        );
      }
      return <Navigate to="/dashboard" replace />;
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

// Higher-order component version
export const withAuthGuard = (
  Component: React.ComponentType,
  options: Omit<AuthGuardProps, 'children'>
) => {
  return (props: any) => (
    <EnhancedAuthGuard {...options}>
      <Component {...props} />
    </EnhancedAuthGuard>
  );
};

// Hook for checking access programmatically
export const useAccessControl = () => {
  const { user, hasRole, hasPermission } = useAuth();

  const checkAccess = (
    requiredRoles: string[] = [],
    requiredPermissions: Array<{
      permission: string;
      action: 'read' | 'write' | 'delete' | 'create';
    }> = [],
    allowGuest = false
  ) => {
    if (!user) return false;
    
    if (user.role === 'guest' && !allowGuest) return false;
    
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => hasRole(role));
      if (!hasRequiredRole) return false;
    }
    
    if (requiredPermissions.length > 0) {
      const hasRequiredPermissions = requiredPermissions.every(
        ({ permission, action }) => hasPermission(permission, action)
      );
      if (!hasRequiredPermissions) return false;
    }
    
    return true;
  };

  return { checkAccess };
};

export default EnhancedAuthGuard;