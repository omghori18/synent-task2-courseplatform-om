import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function EmailVerification() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (user?.isVerified) {
      setVerified(true);
      setError('');
      return;
    }

    if (token && emailParam) {
      const verifyToken = async () => {
        setVerifying(true);
        setError('');
        try {
          const { data } = await api.post('/api/auth/verify-email', { token, email: emailParam });
          setVerified(true);
          setError('');
          // If user is currently logged in, update their local status
          if (user) {
            updateUser({ ...user, isVerified: true });
          }
          toast.success(data.message || 'Email verified successfully!');
        } catch (err) {
          setError(err.response?.data?.message || 'Verification failed. The link may have expired or is invalid.');
          toast.error(err.response?.data?.message || 'Verification failed.');
        } finally {
          setVerifying(false);
        }
      };
      verifyToken();
    } else if (token) {
      setError('Verification link is missing the email address.');
    }
  }, [token, emailParam, user, updateUser]);

  const handleResend = async () => {
    if (!user?.email) {
      toast.error('Please log in to resend the verification email.');
      return;
    }
    setResending(true);
    try {
      const { data } = await api.post('/api/auth/resend-verification', { email: user.email });
      toast.success(data.message || 'Verification email resent successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
        <div className="auth-logo">LearnSphere</div>

        {verifying && (
          <>
            <div style={{ fontSize: '3rem', margin: '24px 0 16px' }}>
              <div className="spinner spinner-dark" style={{ margin: '0 auto', width: 48, height: 48, borderWidth: 4 }} />
            </div>
            <h2 style={{ marginBottom: 10 }}>Verifying your email...</h2>
            <p className="text-muted">Please wait while we verify your credentials.</p>
          </>
        )}

        {!verifying && verified && (
          <>
            <div style={{ fontSize: '3rem', margin: '24px 0 16px' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2 style={{ marginBottom: 10 }}>Email verified!</h2>
            <p className="text-muted" style={{ marginBottom: 24, fontSize: '0.9rem' }}>
              Your email has been successfully verified. You now have full access to LearnSphere.
            </p>
            <div className="alert alert-success" style={{ justifyContent: 'center' }}>
              Account verified successfully
            </div>
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              style={{ marginTop: 16 }}
              id="go-to-dashboard-btn"
            >
              {user ? 'Go to Dashboard →' : 'Sign In →'}
            </button>
          </>
        )}

        {!verifying && !verified && error && (
          <>
            <div style={{ fontSize: '3rem', margin: '24px 0 16px' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 style={{ marginBottom: 10 }}>Verification Failed</h2>
            <p className="text-muted" style={{ marginBottom: 24, fontSize: '0.9rem' }}>
              {error}
            </p>
            {user && (
              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? 'Resending...' : 'Resend Verification Email'}
              </button>
            )}
          </>
        )}

        {!verifying && !verified && !error && !token && (
          <>
            <div style={{ fontSize: '3rem', margin: '24px 0 16px' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h2 style={{ marginBottom: 10 }}>Verify your email</h2>
            <p className="text-muted" style={{ marginBottom: 24, fontSize: '0.9rem' }}>
              We've sent a verification link to{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {user?.email || 'your email address'}
              </strong>.
              <br />
              Please check your inbox and click the link to verify your account.
            </p>

            {user && (
              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={handleResend}
                disabled={resending}
                id="resend-verification-btn"
              >
                {resending ? 'Resending...' : 'Resend Verification Email'}
              </button>
            )}
          </>
        )}

        <div className="auth-footer">
          {user ? (
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontWeight: 500,
                textDecoration: 'underline',
              }}
            >
              ← Back to Sign In
            </button>
          ) : (
            <Link to="/login">← Back to Sign In</Link>
          )}
        </div>
      </div>
    </div>
  );
}
