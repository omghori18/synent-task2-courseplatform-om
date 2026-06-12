import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import LearnPage from './pages/LearnPage';
import AdminPanel from './pages/AdminPanel';
import EmailVerification from './pages/EmailVerification';
import ResetPassword from './pages/ResetPassword';

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner spinner-dark" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !user.isVerified && user.role !== 'admin') return <Navigate to="/verify-email" replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/course/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
        <Route path="/learn/:courseId" element={<ProtectedRoute><LearnPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
