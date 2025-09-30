import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TutorialProvider } from "@/hooks/useTutorial";
import { NavigationProvider } from "@/hooks/useNavigation";
import { ProgressProvider } from "@/hooks/useProgress";
import { ContentProvider } from "@/hooks/useContent";
import { PersonalizationProvider } from "@/hooks/usePersonalization";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RouteTransition } from "@/components/transitions/PageTransition";
import EnhancedNavigation from "@/components/navigation/EnhancedNavigation";
import EnhancedBreadcrumb from "@/components/navigation/EnhancedBreadcrumb";
import ErrorBoundary from "@/components/ErrorBoundary";
import { EnhancedErrorBoundary } from "@/components/error/EnhancedErrorBoundary";
import PerformanceDashboard from "@/components/development/PerformanceDashboard";
import { accessibilityService } from "@/services/AccessibilityService";
import { assetOptimizationService } from "@/services/AssetOptimizationService";
import { globalErrorHandler } from "@/services/GlobalErrorHandler";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MalayalamLearning from "./pages/MalayalamLearning";
// import ArabicLearning from "./pages/ArabicLearning";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Initialize accessibility, asset optimization, and error handling services
  useEffect(() => {
    accessibilityService.initialize();
    assetOptimizationService.initialize();
    globalErrorHandler.initialize();
  }, []);

  return (
    <EnhancedErrorBoundary boundary="app-root">
      <QueryClientProvider client={queryClient}>
        <ProgressProvider>
          <ContentProvider>
            <PersonalizationProvider>
              <TutorialProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <NavigationProvider>
                      <EnhancedErrorBoundary boundary="navigation">
                      {/* Skip to main content link */}
                      <a 
                        href="#main-content" 
                        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
                        onFocus={() => accessibilityService.announce('Skip to main content link focused')}
                      >
                        Skip to main content
                      </a>
                      
                      {/* Enhanced Navigation System */}
                      <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft/20 to-secondary-soft/20">
                        {/* Enhanced Navigation Header */}
                        <EnhancedNavigation />
                        
                        {/* Enhanced Breadcrumb Navigation */}
                        <EnhancedBreadcrumb className="px-4 py-2 bg-white/50 backdrop-blur-sm" />
                        
                        {/* Page Content with Transitions */}
                        <RouteTransition type="fade">
                          <main id="main-content" role="main" aria-label="Main content">
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/malayalam" element={<MalayalamLearning />} />
                              {/* <Route path="/arabic" element={<ArabicLearning />} /> */}
                              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </main>
                        </RouteTransition>
                        
                        {/* Performance Dashboard (Development Only) */}
                        <PerformanceDashboard />
                      </div>
                    </EnhancedErrorBoundary>
                  </NavigationProvider>
                </BrowserRouter>
              </TooltipProvider>
            </TutorialProvider>
          </PersonalizationProvider>
        </ContentProvider>
      </ProgressProvider>
    </QueryClientProvider>
  </EnhancedErrorBoundary>
  );
};

export default App;
