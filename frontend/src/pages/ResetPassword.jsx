import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid or missing password reset link.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { token, password });
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">LearnSphere</div>

        {!success ? (
          <>
            <h2 style={{ marginBottom: 10, textAlign: 'center' }}>Reset Password</h2>
            <p className="auth-subtitle">
              Enter and confirm your new password below.
            </p>

            <form onSubmit={handleSubmit} id="reset-password-form">
              <div className="form-group">
                <label className="form-label" htmlFor="new-password">New Password</label>
                <input
                  className="form-input"
                  id="new-password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
                <input
                  className="form-input"
                  id="confirm-password"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                id="reset-submit-btn"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🔑</div>
            <h2 style={{ marginBottom: '10px' }}>Password Reset Complete</h2>
            <p className="text-muted" style={{ marginBottom: '24px' }}>
              Your password has been successfully updated.
            </p>
            <div className="alert alert-success">
              ✅ You can now sign in with your new password.
            </div>
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={() => navigate('/login')}
              style={{ marginTop: 16 }}
            >
              Sign In →
            </button>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login">← Back to Sign in</Link>
        </div>
      </div>
    </div>
  );
}
