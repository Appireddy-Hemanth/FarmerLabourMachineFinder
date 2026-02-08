import { Navigate } from 'react-router-dom';
import { User } from '../App';
import { useAuth } from '../state/auth';

interface ProtectedRouteProps {
  role: User['role'];
  children: React.ReactElement;
}

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== role) {
    return <Navigate to="/select-role" replace />;
  }

  return children;
}
