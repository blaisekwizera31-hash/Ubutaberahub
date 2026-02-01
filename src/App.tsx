import { useState, useEffect } from "react";
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
import Appointments from "./pages/Appointments";
import LegalResources from "./pages/LegalResources";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => {
  // 1. Initialize language state from localStorage (remembers user choice on refresh)
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem("preferredLang") || "en"
  );

  // 2. Sync state with localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("preferredLang", currentLang);
  }, [currentLang]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <Routes>
          {/* Landing Page: Pass state AND the setter function */}
          <Route 
            path="/" 
            element={<Index currentLang={currentLang} onLanguageChange={setCurrentLang} />} 
          />
          
          {/* Other Pages: Pass ONLY the state for translation */}
          <Route path="/auth" element={<Auth lang={currentLang} />} />
          <Route path="/dashboard" element={<CitizenDashboard lang={currentLang} />} />
          <Route path="/appointments" element={<Appointments  lang={currentLang} />} />
          <Route path="/lawyer-dashboard" element={<LawyerDashboard lang={currentLang} />} />
          <Route path="/judge-dashboard" element={<JudgeDashboard lang={currentLang} />} />
          <Route path="/clerk-dashboard" element={<CourtClerkDashboard lang={currentLang}/>} />
          <Route path="/legal-resources" element={<LegalResources  />} />
          <Route path="/settings" element={<Settings  lang={currentLang}/>} />
          <Route path="/find-lawyer" element={<FindLawyer  lang={currentLang} />} />
          <Route path="/submit-case" element={<SubmitCase  lang={currentLang}/>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>

      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;