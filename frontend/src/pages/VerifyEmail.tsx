import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentUser, verifyEmail } from '@/lib/auth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'success' | 'error' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  const email = searchParams.get('email');
  const dashboardRoutes: Record<string, string> = {
    citizen: '/dashboard',
    lawyer: '/lawyer-dashboard',
    judge: '/judge-dashboard',
    clerk: '/clerk-dashboard',
  };

  const goToDashboard = async () => {
    const { user } = await getCurrentUser();
    const storedUser = localStorage.getItem('loggedInUser');
    const fallbackUser = storedUser ? JSON.parse(storedUser) : null;
    const currentUser = user || fallbackUser;

    if (!currentUser) {
      navigate('/auth', { replace: true });
      return;
    }

    localStorage.setItem('userRole', currentUser.role);
    localStorage.setItem('userId', currentUser.id);
    navigate(dashboardRoutes[currentUser.role] || '/dashboard', { replace: true });
  };

  useEffect(() => {
    if (email) {
      setStatus('pending');
    } else {
      setStatus('error');
      setMessage('Missing email address for verification.');
    }
  }, [email]);

  const handleVerification = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Missing email address for verification.');
      return;
    }

    if (verificationCode.length !== 6) {
      setStatus('error');
      setMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyEmail(email, verificationCode);
      if (result.error) {
        setStatus('error');
        setMessage(result.error);
      } else {
        setStatus('success');
        setMessage(result.message || 'Email verified successfully!');
        await goToDashboard();
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full"
      >
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-semibold mb-4">Email Verified!</h1>
            <p className="text-muted-foreground mb-8">{message}</p>
            <Button onClick={goToDashboard} variant="hero" className="w-full">
              Go to Dashboard
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-semibold mb-4">Verification Failed</h1>
            <p className="text-muted-foreground mb-8 text-red-600">{message}</p>
            {email ? (
              <Button onClick={() => setStatus('pending')} variant="outline" className="w-full">
                Try again
              </Button>
            ) : (
              <Button onClick={() => navigate('/auth')} variant="outline" className="w-full">
                Back to registration
              </Button>
            )}
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-semibold mb-4">Check Your Email</h1>
            <p className="text-muted-foreground mb-4">
              We've sent a 6-digit verification code to <strong>{email}</strong>.
            </p>
            <div className="space-y-3 mb-6">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="text-center text-2xl tracking-widest font-mono"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, ''))}
              />
              <p className="text-xs text-muted-foreground">
                Code expires in 10 minutes.
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={handleVerification} variant="hero" className="w-full" disabled={isVerifying}>
                {isVerifying ? "..." : "Verify Email"}
              </Button>
              <Button onClick={() => navigate('/auth')} variant="outline" className="w-full">
                Back to Login
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
