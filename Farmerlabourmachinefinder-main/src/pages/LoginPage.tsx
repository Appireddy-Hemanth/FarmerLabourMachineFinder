import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthPage } from '../components/AuthPage';
import { useAuth } from '../state/auth';

export function LoginPage() {
  const { currentUser, selectedRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedRole) {
      navigate('/select-role');
    }
  }, [selectedRole, navigate]);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'farmer') navigate('/farmer');
    if (currentUser.role === 'labourer') navigate('/labour/dashboard');
    if (currentUser.role === 'machine_owner') navigate('/machine');
    if (currentUser.role === 'admin') navigate('/admin');
  }, [currentUser, navigate]);

  return <AuthPage initialRole={selectedRole || 'farmer'} />;
}


