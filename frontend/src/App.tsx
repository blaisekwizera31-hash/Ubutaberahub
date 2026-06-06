import { useState, useEffect } from "react";
import { useLocation, Routes, Route } from "react-router-dom"; // Added useLocation
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";

// Import your refined Loading Screen
import LoadingScreen from "./components/ui/LoadingScreen";
import ProtectedRoute from "./components/ProtectedRoute";

// Page Imports
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
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
import AIAssistant from "./pages/AIAssistant";

const AppContent = () => {
  const location = useLocation(); // Hook to listen for URL changes
  const { language, setLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial Load & Route Change Trigger
  useEffect(() => {
    setIsLoading(true);
    
    // Set a duration that allows your breathing animation to complete at least once
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200); 

    return () => clearTimeout(timer);
  }, [location.pathname]); // This triggers the loader EVERY time the URL changes

  return (
    <>
      {/* 3. Render Loading Screen Overlay */}
      {isLoading && <LoadingScreen />}

      {/* 4. Main App Wrapper */}
      <div className={`${isLoading ? "hidden" : "block animate-fade-in"}`}>
          <Routes>
            <Route 
              path="/" 
              element={<Index currentLang={language} onLanguageChange={setLanguage} />} 
            />
            <Route path="/auth" element={<Auth lang={language} />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Citizen Routes - Protected */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            } />
            <Route path="/my-cases" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <MyCases />
              </ProtectedRoute>
            } />
            <Route path="/submit-case" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <SubmitCase lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/ai-assistant" element={
              <ProtectedRoute>
                <AIAssistant />
              </ProtectedRoute>
            } />
            
            {/* Lawyer Routes - Protected */}
            <Route path="/lawyer-dashboard" element={
              <ProtectedRoute allowedRoles={['lawyer']}>
                <LawyerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/lawyer-cases" element={
              <ProtectedRoute allowedRoles={['lawyer']}>
                <LawyerCases lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/lawyer-clients" element={
              <ProtectedRoute allowedRoles={['lawyer']}>
                <LawyerClients lang={language} />
              </ProtectedRoute>
            } />
            
            {/* Judge Routes - Protected */}
            <Route path="/judge-dashboard" element={
              <ProtectedRoute allowedRoles={['judge']}>
                <JudgeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/judge-cases" element={
              <ProtectedRoute allowedRoles={['judge']}>
                <JudgeCases lang={language} />
              </ProtectedRoute>
            } />
            
            {/* Clerk Routes - Protected */}
            <Route path="/clerk-dashboard" element={
              <ProtectedRoute allowedRoles={['clerk']}>
                <CourtClerkDashboard lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/clerk-cases" element={
              <ProtectedRoute allowedRoles={['clerk']}>
                <ClerkCases lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/clerk-registry" element={
              <ProtectedRoute allowedRoles={['clerk']}>
                <ClerkRegistry lang={language} />
              </ProtectedRoute>
            } />
            
            {/* Shared Protected Routes - All logged-in users */}
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/appointments" element={
              <ProtectedRoute>
                <Appointments lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* Public Routes */}
            <Route path="/legal-resources" element={<LegalResources lang={language} />} />
            <Route path="/find-lawyer" element={<FindLawyer lang={language} />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="*" element={<NotFound />} />
    
          </Routes>
      </div>
    </>
  );
};

// Main App component must wrap everything in QueryClient and Router context
const App = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
