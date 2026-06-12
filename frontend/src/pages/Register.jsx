import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// SVG Icons
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const AlertIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/api/auth/register', form);
      login(data.token, data.user);
      toast.success(`Welcome to LearnSphere, ${data.user.name}!`);
      toast.info(`Verification email sent to ${form.email}`, { autoClose: 5000 });
      navigate('/verify-email');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      {/* Left — Branding panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-inner">
          <div className="auth-brand-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="rgba(255,255,255,0.15)"/>
              <path d="M8 12l8-4 8 4v8l-8 4-8-4V12z" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M16 8v16M8 12l8 4 8-4" stroke="white" strokeWidth="1.5"/>
            </svg>
            <span>LearnSphere</span>
          </div>
          <h2 className="auth-brand-headline">
            Start your learning journey today.
          </h2>
          <ul className="auth-brand-features">
            {[
              'Join thousands of learners worldwide',
              'Access 500+ hours of video content',
              'Participate in hands-on projects',
              'Lifetime access to enrolled courses',
            ].map((f) => (
              <li key={f}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right — Form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner fade-in">
          <div className="mb-8">
            <h1 className="auth-form-title">Create account</h1>
            <p className="auth-form-subtitle">Enter your details to get started.</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertIcon /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="register-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                className="form-input"
                id="name"
                name="name"
                type="text"
                placeholder="Alex Johnson"
                value={form.name}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                className="form-input"
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  style={{ paddingRight: 44, width: '100%' }}
                />
                <button
                  type="button"
                  id="register-toggle-password"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', padding: 0,
                    color: showPassword ? 'var(--accent)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center',
                    transition: 'color 0.2s',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              id="register-submit"
              style={{ marginTop: 8 }}
            >
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
