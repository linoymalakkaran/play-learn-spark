/**
 * Backend Status Indicator Component
 * Shows users when the app is running in static mode
 */

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { apiService } from '@/services/apiService';

interface BackendStatusProps {
  showInCorner?: boolean;
  className?: string;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({ 
  showInCorner = false, 
  className = '' 
}) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    checkBackendStatus();
    
    // Check periodically
    const interval = setInterval(checkBackendStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const checkBackendStatus = async () => {
    setIsChecking(true);
    try {
      const status = await apiService.checkBackendAvailability();
      setIsOnline(status);
    } catch (error) {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  if (showInCorner) {
    // Show in bottom right corner with close button when offline
    if (!isOnline && !isDismissed && !isChecking) {
      return (
        <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
          <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm">
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-sm">Offline Mode</div>
              <div className="text-xs opacity-90">Limited functionality available</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="text-white hover:bg-red-700 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      );
    }
    return null; // Don't show when online or dismissed
  }

  if (isOnline === null || isOnline) {
    return null; // Don't show anything if online or still checking
  }

  return (
    <Alert className={`mb-4 ${className}`} variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <strong>Running in Static Mode</strong>
            <p className="text-sm mt-1">
              Backend services are not available. Some features like AI content generation 
              and file uploads will not work, but you can still explore activities and learning content.
            </p>
          </div>
          <button
            onClick={checkBackendStatus}
            disabled={isChecking}
            className="ml-4 px-3 py-1 text-xs bg-white text-red-600 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {isChecking ? 'Checking...' : 'Retry'}
          </button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

// Hook for backend status
export const useBackendStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const status = await apiService.checkBackendAvailability();
      setIsOnline(status);
    } catch (error) {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isOnline,
    isChecking,
    checkStatus
  };
};

export default BackendStatus;