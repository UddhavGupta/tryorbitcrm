import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen grid place-items-center bg-card-muted px-6">
      <div className="surface-card p-10 max-w-md w-full text-center">
        <div className="h-12 w-12 rounded-2xl gradient-primary mx-auto grid place-items-center mb-5">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page <code className="text-foreground">{location.pathname}</code> doesn't exist or has moved.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" asChild><Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Home</Link></Button>
          <Button asChild className="gradient-primary"><Link to="/app">Go to dashboard</Link></Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
