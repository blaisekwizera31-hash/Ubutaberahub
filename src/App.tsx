import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CitizenDashboard from "./pages/CitizenDashboard";
import LawyerDashboard from "./pages/LawyerDashboard";
import JudgeDashboard from "./pages/JudgeDashboard";
import CourtClerkDashboard from "./pages/ClerkDashboard";
import NotFound from "./pages/NotFound";
import FindLawyer from "./pages/FindLawyer";
import SubmitCase from "./pages/SubmitCase";
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<CitizenDashboard />} />
          <Route path="/lawyer-dashboard" element={<LawyerDashboard />} />
          <Route path="/judge-dashboard" element={<JudgeDashboard />} />
          <Route path="/clerk-dashboard" element={<CourtClerkDashboard />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/dashboard" element={<CitizenDashboard />} />
          <Route path="/find-lawyer" element={<FindLawyer />} />
          <Route path="/submit-case" element={<SubmitCase />} />
        </Routes>

      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
