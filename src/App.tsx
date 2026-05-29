import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/queryClient";

// App shell pages — likely needed for signed-in users; load eagerly so
// the post-auth navigation feels instant.
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound.tsx";

// Marketing + heavy pages — code-split so they don't bloat the first chunk.
const Landing = lazy(() => import("./pages/Landing"));
const People = lazy(() => import("./pages/People"));
const ContactDetail = lazy(() => import("./pages/ContactDetail"));
const Groups = lazy(() => import("./pages/Groups"));
const Dates = lazy(() => import("./pages/Dates"));
const Reminders = lazy(() => import("./pages/Reminders"));
const ProjectNotes = lazy(() => import("./pages/ProjectNotes"));
const Changelog = lazy(() => import("./pages/Changelog"));
const About = lazy(() => import("./pages/About"));
const UseCase = lazy(() => import("./pages/UseCase"));
const Press = lazy(() => import("./pages/Press"));
const Demo = lazy(() => import("./pages/Demo"));
const Integrations = lazy(() => import("./pages/Integrations"));


const RouteFallback = () => (
  <div className="min-h-screen bg-background" aria-hidden="true" />
);

/** Fades each route in on navigation so transitions don't feel snappy/jarring. */
const AnimatedRoutes = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <div key={location.pathname} className="animate-fade-in motion-reduce:animate-none">
      {children}
    </div>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ErrorBoundary>
              <Suspense fallback={<RouteFallback />}>
                <AnimatedRoutes>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/demo" element={<Demo />} />
                    <Route path="/project-notes" element={<ProjectNotes />} />
                    <Route path="/changelog" element={<Changelog />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/for/:slug" element={<UseCase />} />
                    <Route path="/press" element={<Press />} />
                    <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/app/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
                    <Route path="/app/people/:id" element={<ProtectedRoute><ContactDetail /></ProtectedRoute>} />
                    <Route path="/app/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
                    <Route path="/app/dates" element={<ProtectedRoute><Dates /></ProtectedRoute>} />
                    <Route path="/app/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
                    <Route path="/app/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AnimatedRoutes>
              </Suspense>

            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
