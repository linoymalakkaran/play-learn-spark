import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TutorialProvider } from "@/hooks/useTutorial";
import { NavigationProvider } from "@/hooks/useNavigation";
import { ProgressProvider } from "@/hooks/useProgress";
import { ContentProvider } from "@/hooks/useContent";
import { PersonalizationProvider } from "@/hooks/usePersonalization";
import { StudentProvider, useStudent } from "@/hooks/useStudent";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
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
import BackendStatus from "@/components/BackendStatus";
import StudentSetup from "@/components/StudentSetup";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import { ResetPassword } from "@/components/auth/ResetPassword";
import { ContentManagementSystemNew } from "@/components/ContentManagementSystemNew";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Activities from "./pages/Activities";
import IntegratedPlatform from "./pages/IntegratedPlatform";
import MalayalamLearning from "./pages/MalayalamLearning";
import HindiLearning from "./pages/HindiLearning";
import EnglishLearning from "./pages/EnglishLearning";
import ArabicLearning from "./pages/ArabicLearning";
import SpanishLearning from "./pages/SpanishLearning";
import RewardsPage from "./pages/RewardsPage";
import AIHomeworkAnalyzer from "./pages/AIHomeworkAnalyzer";
import AuthDemo from "./pages/AuthDemo";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import FeedbackPage from "./pages/FeedbackPage";
import GamePage from "./pages/GamePage";
import AdminPage from "./pages/AdminPage";
import UserDashboard from "./components/UserDashboard";
import AuthGuard from "./components/auth/AuthGuard";
import EnglishReading from "./pages/activities/EnglishReading";
import MathNumbers from "./pages/activities/MathNumbers";
import ScienceExploration from "./pages/activities/ScienceExploration";
import ArtCreativity from "./pages/activities/ArtCreativity";
import SocialSkills from "./pages/activities/SocialSkills";
import PhysicalActivities from "./pages/activities/PhysicalActivities";

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



  return (
    <EnhancedErrorBoundary boundary="navigation">
      {/* Sticky Top Menu */}
      <StickyTopMenu />
      
      {/* Simple App Layout */}
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft/20 to-secondary-soft/20 flex flex-col">
        
        {/* Page Content with Transitions */}
        <RouteTransition type="fade">
          <main id="main-content" role="main" aria-label="Main content" tabIndex={-1} className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/activities/englishreading" element={<EnglishReading />} />
              <Route path="/activities/mathnumbers" element={<MathNumbers />} />
              <Route path="/activities/science" element={<ScienceExploration />} />
              <Route path="/activities/art" element={<ArtCreativity />} />
              <Route path="/activities/social" element={<SocialSkills />} />
              <Route path="/activities/physical" element={<PhysicalActivities />} />
              <Route path="/content-management" element={<ContentManagementSystemNew />} />
              <Route path="/integratedplatform" element={<IntegratedPlatform />} />
              <Route path="/malayalam" element={<MalayalamLearning />} />
              <Route path="/hindi-learning" element={<HindiLearning />} />
              <Route path="/english-learning" element={<EnglishLearning />} />
              <Route path="/arabic" element={<ArabicLearning />} />
              <Route path="/spanish" element={<SpanishLearning />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/games" element={<GamePage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/ai-homework" element={<AIHomeworkAnalyzer />} />
              <Route path="/auth-demo" element={<AuthDemo />} />
              <Route path="/login" element={
                <AuthGuard requireAuth={false}>
                  <AuthPage mode="login" />
                </AuthGuard>
              } />
              <Route path="/register" element={
                <AuthGuard requireAuth={false}>
                  <AuthPage mode="register" />
                </AuthGuard>
              } />
              <Route path="/auth" element={
                <AuthGuard requireAuth={false}>
                  <AuthPage />
                </AuthGuard>
              } />
              <Route path="/guest" element={
                <AuthGuard requireAuth={false}>
                  <AuthPage mode="guest" />
                </AuthGuard>
              } />
              <Route path="/profile" element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              } />
              <Route path="/dashboard" element={
                <AuthGuard>
                  <UserDashboard />
                </AuthGuard>
              } />
              <Route path="/admin" element={
                <AuthGuard>
                  <AdminPage />
                </AuthGuard>
              } />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
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
    <ThemeProvider>
      <EnhancedErrorBoundary boundary="app-root">
        <QueryClientProvider client={queryClient}>
          <StudentProvider>
            <AppWithStudentCheck />
          </StudentProvider>
        </QueryClientProvider>
      </EnhancedErrorBoundary>
    </ThemeProvider>
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
    <AuthProvider>
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
    </AuthProvider>
  );
};

export default App;
