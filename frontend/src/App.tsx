import { Navigate, Routes, Route } from "react-router-dom";
import type React from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";

import ProtectedRoute from "./components/ProtectedRoute";

// Page Imports
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import CitizenDashboard from "./pages/CitizenDashboard";
import CitizenUpdates from "./pages/CitizenUpdates";
import LawyerDashboard from "./pages/LawyerDashboard";
import LawyerCases from "./pages/LawyerCases";
import LawyerClients from "./pages/LawyerClients";
import JudgeDashboard from "./pages/JudgeDashboard";
import JudgeCases from "./pages/JudgeCases";
import CourtClerkDashboard from "./pages/ClerkDashboard";
import ClerkCases from "./pages/ClerkCases";
import ClerkRegistry from "./pages/ClerkRegistry";
import CourtAdminDashboard from "./pages/CourtAdminDashboard";
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

const PortalRedirect = ({ page = "" }: { page?: string }) => {
  const stored = localStorage.getItem("loggedInUser");
  const user = stored ? JSON.parse(stored) : null;
  if (user?.role === "lawyer" && page === "/submit-case") return <Navigate to="/lawyer-dashboard" replace />;
  const base = user?.role === "lawyer" ? "/lawyer-dashboard" : "/dashboard";
  return <Navigate to={`${base}${page}`} replace />;
};

const CitizenLawyerPortalRedirect = ({ page, children }: { page: string; children: React.ReactNode }) => {
  const stored = localStorage.getItem("loggedInUser");
  const user = stored ? JSON.parse(stored) : null;
  if (user?.role === "lawyer") return <Navigate to={`/lawyer-dashboard${page}`} replace />;
  if (user?.role === "citizen") return <Navigate to={`/dashboard${page}`} replace />;
  if (user?.role === "clerk") return <Navigate to={`/clerk-dashboard${page}`} replace />;
  if (user?.role === "court_admin") return <Navigate to={`/court-admin-dashboard${page}`} replace />;
  return <>{children}</>;
};

const AppContent = () => {
  const { language, setLanguage } = useLanguage();

  return (
      <div>
          <Routes>
            <Route 
              path="/" 
              element={<Index currentLang={language} onLanguageChange={setLanguage} />} 
            />
            <Route path="/auth" element={<Auth lang={language} />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Citizen Routes - Protected */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/my-cases" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <MyCases />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/submit-case" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <SubmitCase lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/ai-assistant" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <AIAssistant />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/find-lawyer" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <FindLawyer lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/find-lawyers" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <FindLawyer lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/appointments" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <Appointments lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/messages" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <Messages lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/updates" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenUpdates />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/legal-resources" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <LegalResources lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/help-center" element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <HelpCenter />
              </ProtectedRoute>
            } />
            
            {/* Lawyer Routes - Protected */}
            <Route path="/lawyer-dashboard" element={
              <ProtectedRoute allowedRoles={['lawyer']}>
                <LawyerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/lawyer-dashboard/my-cases" element={
              <ProtectedRoute allowedRoles={['lawyer']}>
                <LawyerCases lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/lawyer-dashboard/ai-assistant" element={
              <ProtectedRoute allowedRoles={['lawyer']}>
                <AIAssistant />
              </ProtectedRoute>
            } />
            <Route path="/lawyer-dashboard/clients" element={
              <ProtectedRoute allowedRoles={['lawyer']}>
                <LawyerClients lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/lawyer-dashboard/appointments" element={
              <ProtectedRoute allowedRoles={['lawyer']}>
                <Appointments lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/lawyer-dashboard/messages" element={
              <ProtectedRoute allowedRoles={['lawyer']}>
                <Messages lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/lawyer-dashboard/settings" element={
              <ProtectedRoute allowedRoles={['lawyer']}>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/lawyer-dashboard/help-center" element={
              <ProtectedRoute allowedRoles={['lawyer']}>
                <HelpCenter />
              </ProtectedRoute>
            } />
            
            {/* Judge Routes - Protected */}
            <Route path="/judge-dashboard" element={
              <ProtectedRoute allowedRoles={['judge']}>
                <JudgeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/judge-dashboard/my-cases" element={
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
            <Route path="/clerk-dashboard/all-cases" element={
              <ProtectedRoute allowedRoles={['clerk']}>
                <ClerkCases lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/clerk-dashboard/my-cases" element={<Navigate to="/clerk-dashboard/all-cases" replace />} />
            <Route path="/clerk-dashboard/registry" element={
              <ProtectedRoute allowedRoles={['clerk']}>
                <ClerkRegistry lang={language} />
              </ProtectedRoute>
            } />
            <Route path="/clerk-dashboard/messages" element={
              <ProtectedRoute allowedRoles={['clerk']}>
                <Messages lang={language} />
              </ProtectedRoute>
            } />

            {/* Court Administration Routes - Protected */}
            <Route path="/court-admin-dashboard" element={
              <ProtectedRoute allowedRoles={['court_admin']}>
                <CourtAdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/court-admin-dashboard/messages" element={
              <ProtectedRoute allowedRoles={['court_admin']}>
                <Messages lang={language} />
              </ProtectedRoute>
            } />
            
            {/* Shared Protected Routes - All logged-in users */}
            <Route path="/messages" element={
              <ProtectedRoute>
                <CitizenLawyerPortalRedirect page="/messages">
                  <Messages lang={language} />
                </CitizenLawyerPortalRedirect>
              </ProtectedRoute>
            } />
            <Route path="/appointments" element={
              <ProtectedRoute>
                <CitizenLawyerPortalRedirect page="/appointments">
                  <Appointments lang={language} />
                </CitizenLawyerPortalRedirect>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <CitizenLawyerPortalRedirect page="/settings">
                  <Settings />
                </CitizenLawyerPortalRedirect>
              </ProtectedRoute>
            } />
            
            {/* Public Routes */}
            <Route path="/legal-resources" element={<LegalResources lang={language} />} />
            <Route path="/find-lawyer" element={<FindLawyer lang={language} />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/my-cases" element={<PortalRedirect page="/my-cases" />} />
            <Route path="/submit-case" element={<PortalRedirect page="/submit-case" />} />
            <Route path="/ai-assistant" element={<PortalRedirect page="/ai-assistant" />} />
            <Route path="/lawyer-cases" element={<Navigate to="/lawyer-dashboard/my-cases" replace />} />
            <Route path="/lawyer-clients" element={<Navigate to="/lawyer-dashboard/clients" replace />} />
            <Route path="/judge-cases" element={<Navigate to="/judge-dashboard/my-cases" replace />} />
            <Route path="/clerk-cases" element={<Navigate to="/clerk-dashboard/all-cases" replace />} />
            <Route path="/clerk-registry" element={<Navigate to="/clerk-dashboard/registry" replace />} />
            <Route path="/clerkdashboard" element={<Navigate to="/clerk-dashboard" replace />} />
            <Route path="/clerkdashboard/all-cases" element={<Navigate to="/clerk-dashboard/all-cases" replace />} />
            <Route path="/clerkdashboard/registry" element={<Navigate to="/clerk-dashboard/registry" replace />} />
            <Route path="/clerkdashboard/messages" element={<Navigate to="/clerk-dashboard/messages" replace />} />
            <Route path="/court-admin" element={<Navigate to="/court-admin-dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
    
          </Routes>
      </div>
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
