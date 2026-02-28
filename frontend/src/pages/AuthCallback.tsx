import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { syncOAuthUser, loadSessionUser } from '@/services/backend';

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

        const pendingRole = (localStorage.getItem('pendingRole') || 'citizen') as 'citizen' | 'lawyer' | 'judge' | 'clerk';
        const dashboardRoutes: Record<string, string> = {
          citizen: '/dashboard',
          lawyer: '/lawyer-dashboard',
          judge: '/judge-dashboard',
          clerk: '/clerk-dashboard',
        };

        let finalUser: any = null;

        try {
          const synced = await syncOAuthUser(
            pendingRole,
            session.user.user_metadata?.full_name || session.user.user_metadata?.name
          );
          finalUser = synced.user;
        } catch (syncError) {
          console.warn('Backend sync failed, falling back to Supabase table', syncError);
          const { data: fallbackUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          finalUser = fallbackUser;
        }

        if (!finalUser) {
          try {
            const loaded = await loadSessionUser();
            finalUser = loaded.user;
          } catch (e) {
            finalUser = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              role: pendingRole,
              profilePhoto: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null,
            };
          }
        }

        localStorage.setItem(
          'loggedInUser',
          JSON.stringify({
            id: finalUser.id,
            email: finalUser.email,
            name: finalUser.name,
            role: finalUser.role || pendingRole,
            profilePhoto: finalUser.profile_photo || finalUser.profilePhoto || null,
          }),
        );
        localStorage.setItem('userRole', finalUser.role || pendingRole);
        localStorage.setItem('userId', finalUser.id);
        localStorage.removeItem('pendingRole');

        navigate(dashboardRoutes[finalUser.role || pendingRole] || '/dashboard');
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
