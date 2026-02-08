import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mapRoleToUi, AuthUser, login as apiLogin, logout as apiLogout, me as apiMe, register as apiRegister } from '../services/auth.service';
import { User } from '../App';

interface AuthContextValue {
  currentUser: User | null;
  login: (payload: { phone: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    phone: string;
    location: string;
    role: 'farmer' | 'labourer' | 'machine_owner' | 'admin';
    password: string;
    skills?: string[];
  }) => Promise<void>;
  logout: () => Promise<void>;
  selectedRole: User['role'] | null;
  setSelectedRole: (role: User['role'] | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRoleState] = useState<User['role'] | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem('selectedRole');
    if (savedRole) setSelectedRoleState(savedRole as User['role']);
    apiMe()
      .then(({ user }) => setCurrentUser(mapUser(user)))
      .catch(() => setCurrentUser(null));
  }, []);

  const login = async (payload: { phone: string; password: string }) => {
    const { user } = await apiLogin(payload.phone, payload.password);
    setCurrentUser(mapUser(user));
  };

  const register = async (payload: {
    name: string;
    phone: string;
    location: string;
    role: 'farmer' | 'labourer' | 'machine_owner' | 'admin';
    password: string;
    skills?: string[];
  }) => {
    const { user } = await apiRegister({
      name: payload.name,
      phone: payload.phone,
      location: payload.location,
      role: mapRoleToBackend(payload.role),
      password: payload.password,
      skills: payload.skills
    });
    setCurrentUser(mapUser(user));
  };

  const logout = async () => {
    await apiLogout();
    setCurrentUser(null);
    // Clear cached UI state (no business data here)
    localStorage.removeItem('selectedRole');
  };

  const setSelectedRole = (role: User['role'] | null) => {
    setSelectedRoleState(role);
    if (role) {
      localStorage.setItem('selectedRole', role);
    } else {
      localStorage.removeItem('selectedRole');
    }
  };

  const value = useMemo(
    () => ({ currentUser, login, register, logout, selectedRole, setSelectedRole }),
    [currentUser, selectedRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

function mapUser(user: AuthUser): User {
  return {
    id: user.id,
    name: user.name,
    role: mapRoleToUi(user.role),
    phone: user.phone,
    village: user.location,
    password: ''
  };
}

function mapRoleToBackend(role: 'farmer' | 'labourer' | 'machine_owner' | 'admin') {
  if (role === 'farmer') return 'Farmer';
  if (role === 'labourer') return 'Labour';
  if (role === 'machine_owner') return 'Machine Owner';
  return 'Admin';
}
