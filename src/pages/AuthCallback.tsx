import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import LoadingScreen from '@/components/ui/LoadingScreen';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('OAuth error:', error);
          alert('Authentication failed. Please try again.');
          navigate('/auth');
          return;
        }

        if (!session) {
          navigate('/auth');
          return;
        }

        // Check if user exists in our users table
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        // If user doesn't exist, create them
        if (!userData) {
          const pendingRole = localStorage.getItem('pendingRole') || 'citizen';
          
          const { error: insertError } = await supabase.from('users').insert([
            {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || 
                    session.user.user_metadata?.name || 
                    session.user.email?.split('@')[0] || 
                    'User',
              profile_photo: session.user.user_metadata?.avatar_url || 
                           session.user.user_metadata?.picture,
              role: pendingRole,
            },
          ]);

          if (insertError) {
            console.error('Error creating user:', insertError);
          }

          localStorage.removeItem('pendingRole');

          // Redirect based on role
          const dashboardRoutes: Record<string, string> = {
            citizen: '/dashboard',
            lawyer: '/lawyer-dashboard',
            judge: '/judge-dashboard',
            clerk: '/clerk-dashboard',
          };

          navigate(dashboardRoutes[pendingRole]);
        } else {
          // User exists, redirect to their dashboard
          const dashboardRoutes: Record<string, string> = {
            citizen: '/dashboard',
            lawyer: '/lawyer-dashboard',
            judge: '/judge-dashboard',
            clerk: '/clerk-dashboard',
          };

          navigate(dashboardRoutes[userData.role]);
        }
      } catch (error) {
        console.error('Error in OAuth callback:', error);
        alert('Authentication failed. Please try again.');
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

  return <LoadingScreen />;
};

export default AuthCallback;
