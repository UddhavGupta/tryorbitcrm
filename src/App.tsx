import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import People from "./pages/People";
import ContactDetail from "./pages/ContactDetail";
import Groups from "./pages/Groups";
import Dates from "./pages/Dates";
import Reminders from "./pages/Reminders";
import NotFound from "./pages/NotFound.tsx";
import ProjectNotes from "./pages/ProjectNotes";
import Changelog from "./pages/Changelog";
import About from "./pages/About";
import UseCase from "./pages/UseCase";
import Press from "./pages/Press";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
