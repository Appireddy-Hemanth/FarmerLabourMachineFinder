import { Routes, Route, Navigate } from 'react-router-dom';
import { FarmerDashboard } from './components/FarmerDashboard';
import { LabourerDashboard } from './components/LabourerDashboard';
import { MachineDashboard } from './components/MachineDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LandingPage } from './pages/LandingPage';
import { RoleSelectPage } from './pages/RoleSelectPage';
import { LoginPage } from './pages/LoginPage';
import { JobsPage } from './pages/JobsPage';
import { LabourPage } from './pages/LabourPage';
import { MachinesPage } from './pages/MachinesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ProfilePage } from './pages/ProfilePage';
import { HelpPage } from './pages/HelpPage';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AuthProvider, useAuth } from './state/auth';

export interface User {
  id: string;
  name: string;
  role: 'farmer' | 'labourer' | 'machine_owner' | 'admin';
  phone: string;
  email?: string;
  village: string;
  password: string;
  skills?: string[];
  machines?: Machine[];
  dailyWage?: number;
  availability?: boolean;
}

export type JobStatus =
  | 'posted'
  | 'applied'
  | 'agreement_locked'
  | 'advance_paid'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Job {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerVillage: string;
  farmerPhone: string;
  workType: string;
  location: string;
  date: string;
  duration: string;
  payment: number;
  status: JobStatus;
  acceptedBy?: string;
  acceptedByName?: string;
  appliedBy?: string;
  appliedByName?: string;
  labourDecision?: 'pending' | 'accepted' | 'rejected';
  description?: string;
  postedAt?: number;
  negotiatedPrice?: number;
  workPhotos?: string[];
  toolsRequired?: string[];
  toolsProvidedBy?: 'Labour' | 'Farmer' | 'Machine Owner';
  toolConfirmed?: boolean;
  attachments?: string[];
}

export interface Machine {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerVillage: string;
  ownerPhone: string;
  machineType: string;
  price: number;
  priceUnit: 'hour' | 'day';
  deposit: number;
  availability: boolean;
  description?: string;
}

export interface MachineRequest {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  machineId: string;
  machineType: string;
  ownerId: string;
  location: string;
  date: string;
  duration: string;
  status: 'pending' | 'accepted' | 'completed';
}


function DashboardGate({ role, children }: { role: User['role']; children: React.ReactElement }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return (
    <ProtectedRoute role={role}>
      {children}
    </ProtectedRoute>
  );
}

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function FarmerRoute() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;
  return <FarmerDashboard user={currentUser} />;
}

function LabourRoute() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;
  return <LabourerDashboard user={currentUser} />;
}

function MachineRoute() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;
  return <MachineDashboard user={currentUser} />;
}

function AdminRoute() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;
  return <AdminDashboard user={currentUser} />;
}
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/select-role" element={<RoleSelectPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/jobs"
            element={
              <RequireAuth>
                <JobsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/labour"
            element={
              <RequireAuth>
                <LabourPage />
              </RequireAuth>
            }
          />
          <Route
            path="/machines"
            element={
              <RequireAuth>
                <MachinesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/payments"
            element={
              <RequireAuth>
                <PaymentsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route path="/help" element={<HelpPage />} />
          <Route
            path="/farmer"
            element={
              <DashboardGate role="farmer">
                <FarmerRoute />
              </DashboardGate>
            }
          />
          <Route
            path="/labour/dashboard"
            element={
              <DashboardGate role="labourer">
                <LabourRoute />
              </DashboardGate>
            }
          />
          <Route
            path="/machine"
            element={
              <DashboardGate role="machine_owner">
                <MachineRoute />
              </DashboardGate>
            }
          />
          <Route
            path="/admin"
            element={
              <DashboardGate role="admin">
                <AdminRoute />
              </DashboardGate>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;

