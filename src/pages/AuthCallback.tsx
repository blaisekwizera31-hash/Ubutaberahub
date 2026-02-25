import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingScreen from "@/components/ui/LoadingScreen";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Get the authorization code from URL
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        alert('Authentication failed. Please try again.');
        navigate('/auth');
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        navigate('/auth');
        return;
      }

      try {
        // In production, send the code to your backend
        // const response = await fetch('/api/auth/oauth/callback', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ code, provider: 'google' }) // detect provider from state param
        // });
        // const data = await response.json();
        
        // For demo: simulate successful OAuth
        const pendingRole = localStorage.getItem('pendingRole') || 'citizen';
        const mockUser = {
          name: "OAuth User",
          email: "user@oauth.com",
          role: pendingRole,
          phone: "",
          profilePhoto: null,
          provider: "oauth",
          citizenId: "",
          licenseNumber: "",
          specialization: "",
          lawFirm: "",
          employeeId: "",
          courtAssigned: "",
          judgeId: "",
          yearsExperience: ""
        };

        localStorage.setItem("user", JSON.stringify(mockUser));
        localStorage.setItem("loggedInUser", JSON.stringify(mockUser));
        localStorage.removeItem('pendingRole');

        // Redirect to appropriate dashboard
        const dashboardRoutes: Record<string, string> = {
          citizen: "/dashboard",
          lawyer: "/lawyer-dashboard",
          judge: "/judge-dashboard",
          clerk: "/clerk-dashboard",
        };

        navigate(dashboardRoutes[pendingRole]);
      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        alert('Authentication failed. Please try again.');
        navigate('/auth');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return <LoadingScreen />;
};

export default AuthCallback;
