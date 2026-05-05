import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import People from "./pages/People";
import ContactDetail from "./pages/ContactDetail";
import Groups from "./pages/Groups";
import Dates from "./pages/Dates";
import Reminders from "./pages/Reminders";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/app/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
            <Route path="/app/people/:id" element={<ProtectedRoute><ContactDetail /></ProtectedRoute>} />
            <Route path="/app/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
            <Route path="/app/dates" element={<ProtectedRoute><Dates /></ProtectedRoute>} />
            <Route path="/app/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
