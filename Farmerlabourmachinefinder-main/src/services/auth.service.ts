import { apiRequest, setAuthToken } from './api';

export type BackendRole = 'Farmer' | 'Labour' | 'Machine Owner' | 'Admin';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  location: string;
  role: BackendRole;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const DEMO_USERS_KEY = 'demoUsers';
const DEMO_CURRENT_KEY = 'demoCurrentUser';
const DEMO_TOKEN = 'demo-token';

function getDemoUsers(): AuthUser[] {
  const raw = localStorage.getItem(DEMO_USERS_KEY);
  if (!raw) {
    const seed: AuthUser[] = [
      { id: 'demo-farmer', name: 'Demo Farmer', phone: '9876543210', location: 'Pulivendula', role: 'Farmer' },
      { id: 'demo-labour', name: 'Demo Labourer', phone: '9876543211', location: 'Pulivendula', role: 'Labour' },
      { id: 'demo-machine', name: 'Demo Owner', phone: '9876543213', location: 'Pulivendula', role: 'Machine Owner' },
      { id: 'demo-admin', name: 'Demo Admin', phone: '9000000000', location: 'Head Office', role: 'Admin' }
    ];
    setDemoUsers(seed);
    return seed;
  }
  try {
    return JSON.parse(raw) as AuthUser[];
  } catch {
    return [];
  }
}

function setDemoUsers(users: AuthUser[]) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function setDemoCurrentUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(DEMO_CURRENT_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(DEMO_CURRENT_KEY);
  }
}

function getDemoCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem(DEMO_CURRENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function mapRoleToUi(role: BackendRole): 'farmer' | 'labourer' | 'machine_owner' | 'admin' {
  if (role === 'Farmer') return 'farmer';
  if (role === 'Labour') return 'labourer';
  if (role === 'Machine Owner') return 'machine_owner';
  return 'admin';
}

export function mapRoleToBackend(role: 'farmer' | 'labourer' | 'machine_owner' | 'admin'): BackendRole {
  if (role === 'farmer') return 'Farmer';
  if (role === 'labourer') return 'Labour';
  if (role === 'machine_owner') return 'Machine Owner';
  return 'Admin';
}

export async function login(phone: string, password: string) {
  try {
    const data = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    });
    setAuthToken(data.token);
    return data;
  } catch (err) {
    const users = getDemoUsers();
    const user = users.find(u => u.phone === phone);
    if (!user) {
      throw err;
    }
    // In demo mode, accept any password/OTP.
    const data = { token: DEMO_TOKEN, user };
    setAuthToken(data.token);
    setDemoCurrentUser(user);
    return data;
  }
}

export async function register(payload: {
  name: string;
  phone: string;
  location: string;
  role: BackendRole;
  password: string;
  skills?: string[];
}) {
  try {
    const data = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setAuthToken(data.token);
    return data;
  } catch (err) {
    const users = getDemoUsers();
    if (users.some(u => u.phone === payload.phone)) {
      throw new Error('Phone number already exists (demo).');
    }
    const user: AuthUser = {
      id: `demo-${Date.now()}`,
      name: payload.name,
      phone: payload.phone,
      location: payload.location,
      role: payload.role
    };
    const nextUsers = [...users, user];
    setDemoUsers(nextUsers);
    setDemoCurrentUser(user);
    const data = { token: DEMO_TOKEN, user };
    setAuthToken(data.token);
    return data;
  }
}

export async function me() {
  try {
    return await apiRequest<{ user: AuthUser }>('/auth/me');
  } catch {
    const user = getDemoCurrentUser();
    if (!user) {
      throw new Error('Not authenticated');
    }
    return { user };
  }
}

export async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch {
    // Demo mode: no-op
  } finally {
    setAuthToken(null);
    setDemoCurrentUser(null);
  }
}
