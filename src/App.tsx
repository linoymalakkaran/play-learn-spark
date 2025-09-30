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
import BreadcrumbNav from "@/components/navigation/BreadcrumbNav";
import ErrorBoundary from "@/components/ErrorBoundary";
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

const App = () => (
  <ErrorBoundary>
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
                    <ErrorBoundary>
                      {/* Global Navigation */}
                      <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft/20 to-secondary-soft/20">
                        <BreadcrumbNav className="sticky top-0 z-50 m-4" />
                        
                        {/* Page Content with Transitions */}
                        <RouteTransition type="fade">
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/malayalam" element={<MalayalamLearning />} />
                            {/* <Route path="/arabic" element={<ArabicLearning />} /> */}
                            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </RouteTransition>
                      </div>
                    </ErrorBoundary>
                  </NavigationProvider>
                </BrowserRouter>
              </TooltipProvider>
            </TutorialProvider>
          </PersonalizationProvider>
        </ContentProvider>
      </ProgressProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
