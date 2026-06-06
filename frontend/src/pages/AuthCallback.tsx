import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { syncOAuthUser, loadSessionUser } from '@/services/backend';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const authCode = params.get('code');
        const tokenHash = params.get('token_hash');
        const type = params.get('type');

        if (authCode) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);
          if (exchangeError) throw exchangeError;
        } else if (tokenHash && type) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });
          if (verifyError) throw verifyError;
        }

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('OAuth error:', error);
          toast({ title: 'Authentication failed', description: 'Please try again.', variant: 'destructive' });
          navigate('/auth');
          return;
        }

        if (!session) {
          navigate('/auth');
          return;
        }

        const pendingRole = (localStorage.getItem('pendingRole') || 'citizen') as 'citizen' | 'lawyer' | 'judge' | 'clerk';
        const pendingOAuthProvider = localStorage.getItem('pendingOAuthProvider');
        const dashboardRoutes: Record<string, string> = {
          citizen: '/dashboard',
          lawyer: '/lawyer-dashboard',
          judge: '/judge-dashboard',
          clerk: '/clerk-dashboard',
        };

        let finalUser: any = null;

        if (pendingOAuthProvider) {
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
        } else {
          const { data: signupUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          finalUser = signupUser;
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
        localStorage.removeItem('pendingOAuthProvider');

        navigate(dashboardRoutes[finalUser.role || pendingRole] || '/dashboard');
      } catch (error) {
        console.error('Error in OAuth callback:', error);
        toast({ title: 'Authentication failed', description: 'Please try again.', variant: 'destructive' });
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

  return <LoadingScreen />;
};

export default AuthCallback;
