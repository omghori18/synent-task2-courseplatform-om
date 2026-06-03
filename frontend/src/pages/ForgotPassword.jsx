import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
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
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                id="reset-submit"
              >
                Send Reset Link
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
              ✅ Reset link sent (demo — no actual email sent)
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
