import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
//change when backend is back on
const DEV_BYPASS_AUTH = true;

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (DEV_BYPASS_AUTH) {
    return children;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};