import { useState, useEffect } from "react";
import { useLocation, Routes, Route } from "react-router-dom"; // Added useLocation
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import your refined Loading Screen
import LoadingScreen from "./components/ui/LoadingScreen";

// Page Imports
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import CitizenDashboard from "./pages/CitizenDashboard";
import LawyerDashboard from "./pages/LawyerDashboard";
import LawyerCases from "./pages/LawyerCases";
import LawyerClients from "./pages/LawyerClients";
import JudgeDashboard from "./pages/JudgeDashboard";
import JudgeCases from "./pages/JudgeCases";
import CourtClerkDashboard from "./pages/ClerkDashboard";
import ClerkCases from "./pages/ClerkCases";
import ClerkRegistry from "./pages/ClerkRegistry";
import NotFound from "./pages/NotFound";
import FindLawyer from "./pages/FindLawyer";
import SubmitCase from "./pages/SubmitCase";
import Appointments from "./pages/Appointments";
import LegalResources from "./pages/LegalResources";
import Settings from "./pages/Settings";
import HelpCenter from "./pages/HelpCenter";
import MyCases from "./pages/MyCases";
import Messages from "./pages/Messages";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation(); // Hook to listen for URL changes
  const [isLoading, setIsLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem("appLang") || "en"
  );

  // 1. Initial Load & Route Change Trigger
  useEffect(() => {
    setIsLoading(true);
    
    // Set a duration that allows your breathing animation to complete at least once
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200); 

    return () => clearTimeout(timer);
  }, [location.pathname]); // This triggers the loader EVERY time the URL changes

  // 2. Sync Language State
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedLang = localStorage.getItem("appLang");
      if (updatedLang) setCurrentLang(updatedLang);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <>
      {/* 3. Render Loading Screen Overlay */}
      {isLoading && <LoadingScreen />}

      {/* 4. Main App Wrapper */}
      <div className={`${isLoading ? "hidden" : "block animate-fade-in"}`}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route 
              path="/" 
              element={<Index currentLang={currentLang} onLanguageChange={setCurrentLang} />} 
            />
            <Route path="/auth" element={<Auth lang={currentLang} />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Citizen Routes */}
            <Route path="/dashboard" element={<CitizenDashboard lang={currentLang} />} />
            <Route path="/my-cases" element={<MyCases />} />
            <Route path="/messages" element={<Messages lang={currentLang} />} />
            
            {/* Lawyer Routes */}
            <Route path="/lawyer-dashboard" element={<LawyerDashboard lang={currentLang} />} />
            <Route path="/lawyer-cases" element={<LawyerCases lang={currentLang} />} />
            <Route path="/lawyer-clients" element={<LawyerClients lang={currentLang} />} />
            
            {/* Judge Routes */}
            <Route path="/judge-dashboard" element={<JudgeDashboard lang={currentLang} />} />
            <Route path="/judge-cases" element={<JudgeCases lang={currentLang} />} />
            
            {/* Clerk Routes */}
            <Route path="/clerk-dashboard" element={<CourtClerkDashboard lang={currentLang}/>} />
            <Route path="/clerk-cases" element={<ClerkCases lang={currentLang} />} />
            <Route path="/clerk-registry" element={<ClerkRegistry lang={currentLang} />} />
            
            {/* Shared Routes */}
            <Route path="/appointments" element={<Appointments lang={currentLang} />} />
            <Route path="/legal-resources" element={<LegalResources lang={currentLang}/>} />
            <Route path="/settings" element={<Settings />} /> 
            <Route path="/find-lawyer" element={<FindLawyer lang={currentLang} />} />
            <Route path="/submit-case" element={<SubmitCase lang={currentLang}/>} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="*" element={<NotFound />} />
    
          </Routes>
        </TooltipProvider>
      </div>
    </>
  );
};

// Main App component must wrap everything in QueryClient and Router context
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
        <AppContent />
    </QueryClientProvider>
  );
};

export default App;