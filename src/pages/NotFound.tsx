import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-soft to-magic-soft flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6 bounce-in">🤔</div>
        <h1 className="text-4xl font-['Fredoka_One'] text-primary mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-xl font-['Comic_Neue'] text-muted-foreground mb-6">
          Looks like this page went on its own adventure! 
        </p>
        <Button
          onClick={() => window.location.href = '/'}
          className="hero-button font-['Comic_Neue']"
        >
          Back to Learning! 🏠
        </Button>
        
        <div className="mt-8 flex justify-center space-x-4 text-3xl">
          <span className="animate-bounce">🌟</span>
          <span className="animate-bounce delay-100">📚</span>
          <span className="animate-bounce delay-200">🚀</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
