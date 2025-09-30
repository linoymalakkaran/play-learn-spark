import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TutorialProvider } from "@/hooks/useTutorial";
import { NavigationProvider } from "@/hooks/useNavigation";
import { ProgressProvider } from "@/hooks/useProgress";
import { ContentProvider } from "@/hooks/useContent";
import { PersonalizationProvider } from "@/hooks/usePersonalization";
import { StudentProvider, useStudent } from "@/hooks/useStudent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RouteTransition } from "@/components/transitions/PageTransition";
import FooterNavigation from "@/components/navigation/FooterNavigation";
import StickyTopMenu from "@/components/navigation/StickyTopMenu";
import ErrorBoundary from "@/components/ErrorBoundary";
import { EnhancedErrorBoundary } from "@/components/error/EnhancedErrorBoundary";
import PerformanceDashboard from "@/components/development/PerformanceDashboard";
import { SkipLinks, AccessibilityTester } from "@/components/accessibility";
import { accessibilityService } from "@/services/AccessibilityService";
import { assetOptimizationService } from "@/services/AssetOptimizationService";
import { globalErrorHandler } from "@/services/GlobalErrorHandler";
import PerformanceMonitoringService from "@/services/PerformanceMonitoringService";
import FocusManagerService from "@/services/FocusManagerService";
import IntegratedLearningPlatform from "@/components/IntegratedLearningPlatform";
import BackendStatus from "@/components/BackendStatus";
import StudentSetup from "@/components/StudentSetup";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MalayalamLearning from "./pages/MalayalamLearning";
import ArabicLearning from "./pages/ArabicLearning";
import AIHomeworkAnalyzer from "./pages/AIHomeworkAnalyzer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Main app content component that shows after student setup
const AppContent = () => {
  const { student, isSetupComplete } = useStudent();
  const [showIntegratedPlatform, setShowIntegratedPlatform] = useState(false);
  const [showAccessibilityTester, setShowAccessibilityTester] = useState(true);

  // Initialize all services including performance monitoring and focus management
  useEffect(() => {
    // Initialize core services
    accessibilityService.initialize();
    assetOptimizationService.initialize();
    globalErrorHandler.initialize();
    
    // Initialize performance monitoring
    const performanceMonitor = PerformanceMonitoringService.getInstance();
    performanceMonitor.initializeMonitoring();
    
    // Initialize focus management with keyboard shortcuts
    const focusManager = FocusManagerService.getInstance();
    
    // Add global keyboard shortcuts
    focusManager.addKeyboardShortcut('alt+1', () => {
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        focusManager.focusElement(mainContent, { announceToScreenReader: true });
      }
    });
    
    focusManager.addKeyboardShortcut('alt+2', () => {
      const navigation = document.querySelector('nav, [role="navigation"]') as HTMLElement;
      if (navigation) {
        focusManager.focusElement(navigation, { announceToScreenReader: true });
      }
    });
    
    // Cleanup on unmount
    return () => {
      performanceMonitor.cleanup && performanceMonitor.cleanup();
      focusManager.cleanup();
    };
  }, []);

  // Toggle between integrated platform and original app
  const togglePlatform = () => {
    setShowIntegratedPlatform(!showIntegratedPlatform);
  };

  // Show integrated platform if enabled
  if (showIntegratedPlatform) {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={togglePlatform}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
          >
            Switch to Original App
          </button>
        </div>
        <IntegratedLearningPlatform
          childId={student?.name || 'student'}
          userName={student?.name || 'Student'}
          userAge={student?.age || 8}
        />
      </div>
    );
  }

  return (
    <EnhancedErrorBoundary boundary="navigation">
      {/* Sticky Top Menu */}
      <StickyTopMenu onTogglePlatform={togglePlatform} />
      
      {/* Simple App Layout */}
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft/20 to-secondary-soft/20 flex flex-col">
        
        {/* Page Content with Transitions */}
        <RouteTransition type="fade">
          <main id="main-content" role="main" aria-label="Main content" tabIndex={-1} className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/malayalam" element={<MalayalamLearning />} />
              <Route path="/arabic" element={<ArabicLearning />} />
              <Route path="/ai-homework" element={<AIHomeworkAnalyzer />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </RouteTransition>
        
        {/* Simple Footer Navigation */}
        <FooterNavigation />
      </div>
    </EnhancedErrorBoundary>
  );
};

// Main App component with Student Setup flow
const App = () => {
  return (
    <EnhancedErrorBoundary boundary="app-root">
      <QueryClientProvider client={queryClient}>
        <StudentProvider>
          <AppWithStudentCheck />
        </StudentProvider>
      </QueryClientProvider>
    </EnhancedErrorBoundary>
  );
};

// Component that checks if student setup is complete
const AppWithStudentCheck = () => {
  const { isSetupComplete, setStudent } = useStudent();

  // If student setup is not complete, show the setup screen
  if (!isSetupComplete) {
    return (
      <StudentSetup
        onComplete={(studentInfo) => {
          setStudent(studentInfo);
        }}
      />
    );
  }

  // If setup is complete, show the main app
  return (
    <ProgressProvider>
      <ContentProvider>
        <PersonalizationProvider>
          <TutorialProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <NavigationProvider>
                  <AppContent />
                </NavigationProvider>
              </BrowserRouter>
            </TooltipProvider>
          </TutorialProvider>
        </PersonalizationProvider>
      </ContentProvider>
    </ProgressProvider>
  );
};

export default App;
