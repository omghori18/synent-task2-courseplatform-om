import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset link sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">LearnSphere</div>

        {!submitted ? (
          <>
            <p className="auth-subtitle">
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} id="forgot-password-form">
              <div className="form-group">
                <label className="form-label" htmlFor="reset-email">Email Address</label>
                <input
                  className="form-input"
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                id="reset-submit"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>📬</div>
            <h2 style={{ marginBottom: '10px' }}>Check your inbox</h2>
            <p className="text-muted" style={{ marginBottom: '24px' }}>
              If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
            </p>
            <div className="alert alert-success">
              ✅ Reset link sent to your registered email address.
            </div>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login">← Back to Sign in</Link>
        </div>
      </div>
    </div>
  );
}
