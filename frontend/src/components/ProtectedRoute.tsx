import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [emailConfirmed, setEmailConfirmed] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user: userData, error } = await getCurrentUser();

      if (error || !userData) {
        console.log('❌ No active session or user not found');
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.log('✅ User authenticated:', userData.email);

      // Check if email is confirmed
      if (userData.is_verified === false) {
        console.log('❌ Email not confirmed, redirecting to verify-email');
        setEmailConfirmed(false);
        setUserEmail(userData.email || '');
        setIsLoading(false);
        return;
      }

      console.log('✅ User data loaded:', userData);
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userId', userData.id);
      setUser(userData);
      
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-muted border-t-foreground animate-spin" />
      </div>
    );
  }

  // Email not confirmed → bounce to verify-email
  if (!emailConfirmed) {
    return <Navigate to={`/verify-email?email=${encodeURIComponent(userEmail)}`} replace />;
  }

  // Not logged in → redirect to auth
  if (!user) {
    console.log('🔒 Not authenticated, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Wrong role → redirect to their dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`🚫 Wrong role. User is ${user.role}, needs ${allowedRoles.join(' or ')}`);
    const dashboardRoutes: Record<string, string> = {
      citizen: '/dashboard',
      lawyer: '/lawyer-dashboard',
      judge: '/judge-dashboard',
      clerk: '/clerk-dashboard',
      court_admin: '/court-admin-dashboard',
    };
    return <Navigate to={dashboardRoutes[user.role] || '/dashboard'} replace />;
  }

  console.log('✅ Access granted to', user.role);
  return <>{children}</>;
}
