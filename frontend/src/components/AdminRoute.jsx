import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();

  if (loading) return <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
    <div className="spinner spinner-dark" />
  </div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !user.isVerified && user.role !== 'admin') return <Navigate to="/verify-email" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
}
