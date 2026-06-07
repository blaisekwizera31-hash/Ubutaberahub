import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { verifyEmail } from '@/lib/auth';
import LoadingScreen from '@/components/ui/LoadingScreen';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [message, setMessage] = useState('');
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      handleVerification(token);
    } else if (email) {
      setStatus('pending');
    } else {
      setStatus('error');
      setMessage('Missing verification information.');
    }
  }, [token, email]);

  const handleVerification = async (verifyToken: string) => {
    setStatus('loading');
    try {
      const result = await verifyEmail(verifyToken);
      if (result.error) {
        setStatus('error');
        setMessage(result.error);
      } else {
        setStatus('success');
        setMessage(result.message || 'Email verified successfully!');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An unexpected error occurred.');
    }
  };

  if (status === 'loading') return <LoadingScreen />;

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
            <h1 className="text-3xl font-bold mb-4">Email Verified!</h1>
            <p className="text-muted-foreground mb-8">{message}</p>
            <Button onClick={() => navigate('/auth')} variant="hero" className="w-full">
              Go to Login
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Verification Failed</h1>
            <p className="text-muted-foreground mb-8 text-red-600">{message}</p>
            <Button onClick={() => navigate('/auth')} variant="outline" className="w-full">
              Back to registration
            </Button>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Check Your Email</h1>
            <p className="text-muted-foreground mb-4">
              We've sent a verification link to <strong>{email}</strong>.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Please click the link in the email to complete your registration.
            </p>
            <Button onClick={() => navigate('/auth')} variant="outline" className="w-full">
              Back to Login
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
