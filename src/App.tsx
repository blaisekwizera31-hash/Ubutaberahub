import { useState, useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

// Import your new Loading Screen
import LoadingScreen from "./components/ui/LoadingScreen";

// Page Imports
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
  // 1. LOADING STATE
  const [isLoading, setIsLoading] = useState(true);

  // 2. LANGUAGE STATE 
  // Unified key to "appLang" to match your Settings.tsx logic
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem("appLang") || "en"
  );

  useEffect(() => {
    // A. Handle initial loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // B. Listen for language changes from Settings.tsx (via 'storage' event)
    const handleStorageChange = () => {
      const updatedLang = localStorage.getItem("appLang");
      if (updatedLang) setCurrentLang(updatedLang);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // 3. RENDER LOADING SCREEN
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="animate-fade-in"> {/* Smooth entry after loading */}
          <Toaster />
          <Sonner />

          <Routes>
            <Route 
              path="/" 
              element={<Index currentLang={currentLang} onLanguageChange={setCurrentLang} />} 
            />
            
            {/* Note: Ensure these components accept 'lang' as a prop in their definitions */}
            <Route path="/auth" element={<Auth lang={currentLang} />} />
            <Route path="/dashboard" element={<CitizenDashboard lang={currentLang} />} />
            <Route path="/appointments" element={<Appointments lang={currentLang} />} />
            <Route path="/lawyer-dashboard" element={<LawyerDashboard lang={currentLang} />} />
            <Route path="/judge-dashboard" element={<JudgeDashboard lang={currentLang} />} />
            <Route path="/clerk-dashboard" element={<CourtClerkDashboard lang={currentLang}/>} />
            <Route path="/legal-resources" element={<LegalResources lang={currentLang}/>} />
            
            {/* This fixes the red error line by passing the prop correctly */}
            <Route path="/settings" element={<Settings />} /> 
            
            <Route path="/find-lawyer" element={<FindLawyer lang={currentLang} />} />
            <Route path="/submit-case" element={<SubmitCase lang={currentLang}/>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;