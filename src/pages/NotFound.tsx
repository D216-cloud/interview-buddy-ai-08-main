import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background via-background to-secondary/20 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">404</div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Page Not Found</h1>
          <p className="text-base text-muted-foreground leading-relaxed">Sorry, the page you're looking for doesn't exist or has been moved.</p>
        </div>
        <div className="space-y-3">
          <a href="/" className="inline-block w-full">
            <Button className="w-full h-12 gap-2 font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5">
              <Home className="h-5 w-5" /> Go Home
            </Button>
          </a>
          <a href="-1" onClick={(e) => { e.preventDefault(); window.history.back(); }} className="inline-block w-full">
            <Button variant="outline" className="w-full h-12 gap-2 font-semibold border-border/50 hover:bg-secondary/50">
              <ArrowLeft className="h-5 w-5" /> Go Back
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
