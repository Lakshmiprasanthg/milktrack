import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingScreen } from './UI';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen title="Warming up your dairy workspace" subtitle="Checking authentication and preparing today’s operations." compact />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
