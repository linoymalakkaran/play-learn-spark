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
import { AuthProvider as EnhancedAuthProvider } from "@/contexts/AuthContextEnhanced";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RouteTransition } from "@/components/transitions/PageTransition";
import FooterNavigation from "@/components/navigation/FooterNavigation";
import RoleBasedNavigation from "@/components/navigation/RoleBasedNavigation";
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
import EnhancedLoginForm from "@/components/auth/EnhancedLoginForm";
import EnhancedRegistrationForm from "@/components/auth/EnhancedRegistrationForm";
import EnhancedAuthGuard from "@/components/auth/EnhancedAuthGuard";
import RoleBasedDashboard from "@/components/dashboard/RoleBasedDashboard";
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

// Layout component that includes role-based navigation
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Role-based Sidebar Navigation */}
      <div className="w-64 bg-white shadow-lg">
        <RoleBasedNavigation />
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sticky Top Menu */}
        <StickyTopMenu />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

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
      <div className="min-h-screen">
        {/* Skip Links for Accessibility */}
        <SkipLinks />
        
        {/* Page Content with Transitions */}
        <RouteTransition type="fade">
          <main id="main-content" role="main" aria-label="Main content" tabIndex={-1}>
            <Routes>
              {/* Public Routes (no authentication required) */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<EnhancedLoginForm />} />
              <Route path="/register" element={<EnhancedRegistrationForm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Legacy Auth Routes (maintaining compatibility) */}
              <Route path="/auth-demo" element={<AuthDemo />} />
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

              {/* Protected Routes with Role-Based Access */}
              <Route path="/dashboard" element={
                <EnhancedAuthGuard allowGuest={true}>
                  <AppLayout>
                    <RoleBasedDashboard />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />

              {/* Learning Routes (accessible to all authenticated users and guests) */}
              <Route path="/activities" element={
                <EnhancedAuthGuard allowGuest={true}>
                  <AppLayout>
                    <Activities />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />
              <Route path="/activities/englishreading" element={
                <EnhancedAuthGuard allowGuest={true}>
                  <AppLayout>
                    <EnglishReading />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />
              <Route path="/activities/mathnumbers" element={
                <EnhancedAuthGuard allowGuest={true}>
                  <AppLayout>
                    <MathNumbers />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />
              <Route path="/activities/science" element={
                <EnhancedAuthGuard allowGuest={true}>
                  <AppLayout>
                    <ScienceExploration />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />
              <Route path="/activities/art" element={
                <EnhancedAuthGuard allowGuest={true}>
                  <AppLayout>
                    <ArtCreativity />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />
              <Route path="/activities/social" element={
                <EnhancedAuthGuard allowGuest={true}>
                  <AppLayout>
                    <SocialSkills />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />
              <Route path="/activities/physical" element={
                <EnhancedAuthGuard allowGuest={true}>
                  <AppLayout>
                    <PhysicalActivities />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />

              {/* Language Learning Routes */}
              <Route path="/malayalam" element={
                <EnhancedAuthGuard allowGuest={true}>
                  <AppLayout>
                    <MalayalamLearning />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />
              <Route path="/hindi-learning" element={
                <EnhancedAuthGuard allowGuest={true}>
                  <AppLayout>
                    <HindiLearning />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />
              <Route path="/english-learning" element={
                <EnhancedAuthGuard allowGuest={true}>
                  <AppLayout>
                    <EnglishLearning />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />
              <Route path="/arabic" element={
                <EnhancedAuthGuard allowGuest={true}>
                  <AppLayout>
                    <ArabicLearning />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />
              <Route path="/spanish" element={
                <EnhancedAuthGuard allowGuest={true}>
                  <AppLayout>
                    <SpanishLearning />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />

              {/* Educator/Admin Routes */}
              <Route path="/content-management" element={
                <EnhancedAuthGuard 
                  requiredRoles={['admin', 'educator']}
                  requiredPermissions={[{ permission: 'content.manage', action: 'write' }]}
                >
                  <AppLayout>
                    <ContentManagementSystemNew />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />

              {/* Admin Only Routes */}
              <Route path="/admin" element={
                <EnhancedAuthGuard requiredRoles={['admin']}>
                  <AppLayout>
                    <AdminPage />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />

              {/* User Profile and Settings */}
              <Route path="/profile" element={
                <EnhancedAuthGuard>
                  <AppLayout>
                    <ProfilePage />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />

              {/* General Protected Routes */}
              <Route path="/integratedplatform" element={
                <EnhancedAuthGuard>
                  <AppLayout>
                    <IntegratedPlatform />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />
              <Route path="/rewards" element={
                <EnhancedAuthGuard allowGuest={true}>
                  <AppLayout>
                    <RewardsPage />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />
              <Route path="/games" element={
                <EnhancedAuthGuard allowGuest={true}>
                  <AppLayout>
                    <GamePage />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />
              <Route path="/feedback" element={
                <EnhancedAuthGuard>
                  <AppLayout>
                    <FeedbackPage />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />
              <Route path="/ai-homework" element={
                <EnhancedAuthGuard requiredRoles={['educator', 'parent']}>
                  <AppLayout>
                    <AIHomeworkAnalyzer />
                  </AppLayout>
                </EnhancedAuthGuard>
              } />

              {/* Legacy Dashboard Route */}
              <Route path="/legacy-dashboard" element={
                <AuthGuard>
                  <UserDashboard />
                </AuthGuard>
              } />

              {/* 404 Catch-all Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </RouteTransition>
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

  // If setup is complete, show the main app with enhanced auth
  return (
    <EnhancedAuthProvider>
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
    </EnhancedAuthProvider>
  );
};

export default App;