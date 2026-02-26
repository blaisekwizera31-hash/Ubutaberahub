import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // First check if user is authenticated in Supabase Auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('❌ No active session');
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.log('✅ Session found:', session.user.email);

      // Try to get user data from users table with retry logic
      let retries = 3;
      let userData = null;
      let dbError = null;

      while (retries > 0 && !userData) {
        const result = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        userData = result.data;
        dbError = result.error;

        if (userData) break;
        
        // Wait a bit before retrying (user might have just been created)
        if (retries > 1) {
          console.log(`⏳ Waiting for user data... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        retries--;
      }

      if (dbError) {
        console.error('⚠️ Error fetching user data:', dbError);
        console.log('📦 Using localStorage fallback...');
        
        // Try to get role from localStorage (set during login)
        const storedRole = localStorage.getItem('userRole');
        const storedUserId = localStorage.getItem('userId');
        
        if (storedRole && storedUserId === session.user.id) {
          console.log('✅ Using stored role:', storedRole);
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            role: storedRole,
          });
        } else {
          console.log('⚠️ No stored role found, using default');
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            role: 'citizen', // default role
          });
        }
      } else if (userData) {
        console.log('✅ User data loaded:', userData);
        // Store role in localStorage for future fallback
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userId', userData.id);
        setUser(userData);
      } else {
        console.log('⚠️ No user data found in database after retries');
        
        // Check localStorage as last resort
        const storedRole = localStorage.getItem('userRole');
        const storedUserId = localStorage.getItem('userId');
        
        if (storedRole && storedUserId === session.user.id) {
          console.log('✅ Using stored role from localStorage:', storedRole);
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            role: storedRole,
          });
        } else {
          console.log('❌ No user data available anywhere');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Not logged in - redirect to auth page
  if (!user) {
    console.log('🔒 Not authenticated, redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // Check if user has the required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`🚫 Wrong role. User is ${user.role}, needs ${allowedRoles.join(' or ')}`);
    // User doesn't have permission - redirect to their own dashboard
    const dashboardRoutes: Record<string, string> = {
      citizen: '/dashboard',
      lawyer: '/lawyer-dashboard',
      judge: '/judge-dashboard',
      clerk: '/clerk-dashboard',
    };
    return <Navigate to={dashboardRoutes[user.role] || '/dashboard'} replace />;
  }

  console.log('✅ Access granted to', user.role);
  // User is authenticated and has correct role
  return <>{children}</>;
}
