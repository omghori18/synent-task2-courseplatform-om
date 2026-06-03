import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          Learn<span>Sphere</span>
        </Link>

        {/* Nav Links */}
        {isAuthenticated && (
          <div className="navbar-nav">
            <Link
              to="/dashboard"
              className={`navbar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Courses
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`navbar-link ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                Admin
              </Link>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <div className="user-badge">
                <div className="user-avatar">{initials}</div>
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </span>
                {isAdmin && <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>Admin</span>}
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" id="logout-btn">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
