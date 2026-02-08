import { useEffect, useMemo, useState } from 'react';
import { User, Job, Machine, MachineRequest } from '../App';
import { ShieldCheck, Users, Briefcase, AlertTriangle, BarChart3, Search, LogOut } from 'lucide-react';
import { NotificationBell, NotificationItem } from './NotificationBell';
import { PaymentRecord, getPaymentBadgeTone, getPaymentStatusLabel, getPayments, markRefunded } from '../state/payments';
import { useAuth } from '../state/auth';
import { useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  user: User;
}

interface Dispute {
  id: string;
  title: string;
  status: 'open' | 'investigating' | 'resolved';
  raisedBy: string;
  date: string;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'English');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'jobs' | 'machines' | 'disputes' | 'payments' | 'analytics'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [requests, setRequests] = useState<MachineRequest[]>([]);
  const [search, setSearch] = useState('');
  const [demoStep, setDemoStep] = useState(0);
  const [deletedUsers, setDeletedUsers] = useState<User[]>([]);
  const [deletedJobs, setDeletedJobs] = useState<Job[]>([]);
  const [deletedMachines, setDeletedMachines] = useState<Machine[]>([]);
  const [adminActions, setAdminActions] = useState<Array<{ action: string; targetId: string; timestamp: string; type: string }>>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [fraudFlags, setFraudFlags] = useState<Record<string, string>>({});

  const [disputes, setDisputes] = useState<Dispute[]>([
    {
      id: 'd1',
      title: 'Payment delayed for Harvesting job',
      status: 'investigating',
      raisedBy: 'Lakshmi Devi',
      date: '2026-02-04'
    },
    {
      id: 'd2',
      title: 'Machine breakdown dispute',
      status: 'open',
      raisedBy: 'Ravi Kumar',
      date: '2026-02-02'
    }
  ]);
  useEffect(() => {
    const stored = localStorage.getItem('disputes');
    if (stored) {
      setDisputes(JSON.parse(stored));
    } else if (disputes.length > 0) {
      localStorage.setItem('disputes', JSON.stringify(disputes));
      pushNotification({
        id: `N-${Date.now()}`,
        userRole: 'Admin',
        title: 'New dispute raised',
        message: disputes[0].title,
        type: 'Warning',
        read: false,
        timestamp: new Date().toLocaleString()
      });
    }
  }, []);

  useEffect(() => {
    const storedUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const storedJobs: Job[] = JSON.parse(localStorage.getItem('jobs') || '[]');
    const storedMachines: Machine[] = JSON.parse(localStorage.getItem('machines') || '[]');
    const storedRequests: MachineRequest[] = JSON.parse(localStorage.getItem('machineRequests') || '[]');
    setUsers(storedUsers);
    setJobs(storedJobs);
    setMachines(storedMachines);
    setRequests(storedRequests);
    setDeletedUsers(JSON.parse(localStorage.getItem('deletedUsers') || '[]'));
    setDeletedJobs(JSON.parse(localStorage.getItem('deletedJobs') || '[]'));
    setDeletedMachines(JSON.parse(localStorage.getItem('deletedMachines') || '[]'));
    setAdminActions(JSON.parse(localStorage.getItem('adminActions') || '[]'));
    setPayments(getPayments());
    setFraudFlags(JSON.parse(localStorage.getItem('fraudFlags') || '{}'));
  }, []);

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const filteredUsers = useMemo(
    () => users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search)),
    [users, search]
  );

  const demoScript = [
    'Step 1: Farmer posts a job',
    'Step 2: Labour accepts the job',
    'Step 3: Machine owner accepts a request',
    'Step 4: Job completed and payment processed',
    'Step 5: Analytics and trust score updated'
  ];

  const simulateCycle = () => {
    const allJobs: Job[] = JSON.parse(localStorage.getItem('jobs') || '[]');
    const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const allRequests: MachineRequest[] = JSON.parse(localStorage.getItem('machineRequests') || '[]');
    const allMachines: Machine[] = JSON.parse(localStorage.getItem('machines') || '[]');

    const farmer = allUsers.find(u => u.role === 'farmer');
    const labour = allUsers.find(u => u.role === 'labourer');
    const machine = allMachines[0];

    if (!farmer || !labour || !machine) {
      alert('Simulation needs a farmer, labourer, and at least one machine.');
      return;
    }

    const newJob: Job = {
      id: Date.now().toString(),
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerVillage: farmer.village,
      farmerPhone: farmer.phone,
      workType: 'Harvesting • Manual labour',
      location: farmer.village,
      date: new Date().toISOString().slice(0, 10),
      duration: '2 days',
      payment: 2800,
      status: 'completed',
      acceptedBy: labour.id,
      acceptedByName: labour.name,
      description: 'Simulation job',
      postedAt: Date.now() - 1000 * 60 * 60
    };

    const newRequest: MachineRequest = {
      id: (Date.now() + 1).toString(),
      farmerId: farmer.id,
      farmerName: farmer.name,
      farmerPhone: farmer.phone,
      machineId: machine.id,
      machineType: machine.machineType,
      ownerId: machine.ownerId,
      location: farmer.village,
      date: new Date().toISOString().slice(0, 10),
      duration: '6 hours',
      status: 'completed'
    };

    allJobs.push(newJob);
    allRequests.push(newRequest);
    localStorage.setItem('jobs', JSON.stringify(allJobs));
    localStorage.setItem('machineRequests', JSON.stringify(allRequests));

    setJobs(allJobs);
    setRequests(allRequests);
    alert('Simulation completed (mock).');
  };

  const stats = {
    users: users.length,
    jobs: jobs.length,
    machines: machines.length,
    disputes: disputes.length,
    activeRequests: requests.filter(r => r.status === 'pending').length
  };

  const leaderboard = useMemo(() => {
    const farmerScores = users
      .filter(u => u.role === 'farmer')
      .map(u => ({
        name: u.name,
        count: jobs.filter(j => j.farmerId === u.id && j.status === 'completed').length
      }))
      .sort((a, b) => b.count - a.count);
    const labourScores = users
      .filter(u => u.role === 'labourer')
      .map(u => ({
        name: u.name,
        count: jobs.filter(j => j.acceptedBy === u.id && j.status === 'completed').length
      }))
      .sort((a, b) => b.count - a.count);
    const machineScores = users
      .filter(u => u.role === 'machine_owner')
      .map(u => ({
        name: u.name,
        count: requests.filter(r => r.ownerId === u.id && r.status === 'completed').length
      }))
      .sort((a, b) => b.count - a.count);

    return { farmerScores, labourScores, machineScores };
  }, [users, jobs, requests]);

  const trustScoreFor = (id: string) => {
    const completedJobs = jobs.filter(j => (j.farmerId === id || j.acceptedBy === id) && j.status === 'completed').length;
    const completedRequests = requests.filter(r => r.ownerId === id && r.status === 'completed').length;
    const score = Math.min(100, 50 + (completedJobs + completedRequests) * 5);
    const badge = score >= 80 ? 'Trusted' : score >= 60 ? 'Average' : 'Risk';
    return { score, badge };
  };

  const pushNotification = (n: NotificationItem) => {
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    stored.unshift(n);
    localStorage.setItem('notifications', JSON.stringify(stored));
  };

  const logAction = (action: string, targetId: string, type: string) => {
    const next = [
      { action, targetId, type, timestamp: new Date().toLocaleString() },
      ...adminActions
    ];
    setAdminActions(next);
    localStorage.setItem('adminActions', JSON.stringify(next));
  };

  const softDeleteUser = (u: User) => {
    const nextUsers = users.filter(x => x.id !== u.id);
    const nextDeleted = [...deletedUsers, u];
    setUsers(nextUsers);
    setDeletedUsers(nextDeleted);
    localStorage.setItem('users', JSON.stringify(nextUsers));
    localStorage.setItem('deletedUsers', JSON.stringify(nextDeleted));
    logAction('DELETE_USER', u.id, 'SOFT_DELETE');
  };

  const restoreUser = (u: User) => {
    const nextDeleted = deletedUsers.filter(x => x.id !== u.id);
    const nextUsers = [...users, u];
    setUsers(nextUsers);
    setDeletedUsers(nextDeleted);
    localStorage.setItem('users', JSON.stringify(nextUsers));
    localStorage.setItem('deletedUsers', JSON.stringify(nextDeleted));
    logAction('RESTORE_USER', u.id, 'RESTORE');
  };

  const softDeleteJob = (j: Job) => {
    const nextJobs = jobs.filter(x => x.id !== j.id);
    const nextDeleted = [...deletedJobs, j];
    setJobs(nextJobs);
    setDeletedJobs(nextDeleted);
    localStorage.setItem('jobs', JSON.stringify(nextJobs));
    localStorage.setItem('deletedJobs', JSON.stringify(nextDeleted));
    logAction('DELETE_JOB', j.id, 'SOFT_DELETE');
  };

  const restoreJob = (j: Job) => {
    const nextDeleted = deletedJobs.filter(x => x.id !== j.id);
    const nextJobs = [...jobs, j];
    setJobs(nextJobs);
    setDeletedJobs(nextDeleted);
    localStorage.setItem('jobs', JSON.stringify(nextJobs));
    localStorage.setItem('deletedJobs', JSON.stringify(nextDeleted));
    logAction('RESTORE_JOB', j.id, 'RESTORE');
  };

  const softDeleteMachine = (m: Machine) => {
    const nextMachines = machines.filter(x => x.id !== m.id);
    const nextDeleted = [...deletedMachines, m];
    setMachines(nextMachines);
    setDeletedMachines(nextDeleted);
    localStorage.setItem('machines', JSON.stringify(nextMachines));
    localStorage.setItem('deletedMachines', JSON.stringify(nextDeleted));
    logAction('DELETE_MACHINE', m.id, 'SOFT_DELETE');
  };

  const restoreMachine = (m: Machine) => {
    const nextDeleted = deletedMachines.filter(x => x.id !== m.id);
    const nextMachines = [...machines, m];
    setMachines(nextMachines);
    setDeletedMachines(nextDeleted);
    localStorage.setItem('machines', JSON.stringify(nextMachines));
    localStorage.setItem('deletedMachines', JSON.stringify(nextDeleted));
    logAction('RESTORE_MACHINE', m.id, 'RESTORE');
  };

  const toggleFraudFlag = (id: string) => {
    const next = { ...fraudFlags };
    if (next[id]) {
      delete next[id];
    } else {
      next[id] = 'Suspicious activity';
    }
    setFraudFlags(next);
    localStorage.setItem('fraudFlags', JSON.stringify(next));
  };

  const exportCSV = (rows: Record<string, any>[], filename: string) => {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const t = {
    English: {
      role: 'Admin',
      overview: 'Overview',
      users: 'Users',
      jobs: 'Jobs',
      disputes: 'Disputes',
      analytics: 'Analytics'
    },
    'తెలుగు': {
      role: 'అడ్మిన్',
      overview: 'సారాంశం',
      users: 'వినియోగదారులు',
      jobs: 'జాబ్స్',
      disputes: 'వివాదాలు',
      analytics: 'విశ్లేషణ'
    },
    हिन्दी: {
      role: 'एडमिन',
      overview: 'ओवरव्यू',
      users: 'यूज़र्स',
      jobs: 'जॉब्स',
      disputes: 'विवाद',
      analytics: 'एनालिटिक्स'
    }
  };

  const labels = t[language as keyof typeof t] || t.English;

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-700';
      case 'investigating':
        return 'bg-yellow-100 text-yellow-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen app-shell dashboard-shell">
        <header className="bg-white shadow-sm relative z-30 overflow-visible">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AgriConnect Admin</h1>
              <p className="text-sm text-gray-600">Platform Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell role="admin" />
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1"
            >
              <option>English</option>
              <option>తెలుగు</option>
              <option>हिन्दी</option>
            </select>
            <div className="text-right">
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-600">🛡️ {labels.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { key: 'overview', label: labels.overview },
              { key: 'users', label: labels.users },
              { key: 'jobs', label: labels.jobs },
              { key: 'machines', label: 'Machines' },
              { key: 'disputes', label: labels.disputes },
              { key: 'payments', label: 'Payments' },
              { key: 'analytics', label: labels.analytics }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
                  </div>
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Jobs</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.jobs}</p>
                  </div>
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Machines</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.machines}</p>
                  </div>
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Disputes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.disputes}</p>
                  </div>
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeRequests}</p>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2">Fraud Detection (Mock)</p>
                  <p>Flagged 3 suspicious profiles this week. Review pending.</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2">Seasonal Demand Insight</p>
                  <p>Harvesting demand trending +18% in Kurnool.</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2">Payments Monitor</p>
                  <p>92% of jobs completed with on-time payments.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">End-to-End Simulation Mode</h2>
                <p className="text-sm text-gray-600 mb-3">
                  Run a full mock cycle: job post → accept → complete → update analytics.
                </p>
                <button
                  onClick={simulateCycle}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Simulate Full Farming Cycle
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Demo Script Mode</h2>
                <p className="text-sm text-gray-700 mb-3">{demoScript[demoStep]}</p>
                <button
                  onClick={() => setDemoStep((prev) => (prev + 1) % demoScript.length)}
                  className="px-4 py-2 border border-gray-200 rounded-lg"
                >
                  Next Step
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Admin Demo & Control Tools</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    localStorage.removeItem('users');
                    localStorage.removeItem('jobs');
                    localStorage.removeItem('machines');
                    localStorage.removeItem('machineRequests');
                    localStorage.removeItem('payments');
                    localStorage.removeItem('notifications');
                    localStorage.removeItem('adminActions');
                    localStorage.removeItem('deletedUsers');
                    localStorage.removeItem('deletedJobs');
                    localStorage.removeItem('fraudFlags');
                    alert('Demo data reset. Reload the page.');
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  Reset Demo Data
                </button>
                <button
                  onClick={() => {
                    const now = Date.now();
                    const samplePayments: PaymentRecord[] = [
                      {
                        id: 'PAY-L-1',
                        flow: 'labour',
                        jobId: '1',
                        farmerId: '1',
                        labourerId: '2',
                        amountTotal: 2000,
                        advanceAmount: 800,
                        balanceAmount: 1200,
                        status: 'released',
                        createdAt: now,
                        updatedAt: now,
                        history: [{ at: now, label: 'Payment released' }]
                      },
                      {
                        id: 'PAY-M-1',
                        flow: 'machine',
                        requestId: '1',
                        farmerId: '1',
                        machineOwnerId: '4',
                        amountTotal: 3000,
                        depositAmount: 8000,
                        status: 'held',
                        createdAt: now,
                        updatedAt: now,
                        history: [{ at: now, label: 'Rental + deposit paid' }]
                      }
                    ];
                    setPayments(samplePayments);
                    localStorage.setItem('payments', JSON.stringify(samplePayments));
                    alert('Sample payment data loaded.');
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  Load Sample Data
                </button>
                <button
                  onClick={() => {
                    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
                    const disputesRows = disputes.map(d => ({
                      id: d.id,
                      title: d.title,
                      status: d.status,
                      raisedBy: d.raisedBy,
                      date: d.date
                    }));
                    const labourRatings = JSON.parse(localStorage.getItem('labourRatings') || '{}');
                    const machineRatings = JSON.parse(localStorage.getItem('machineRatings') || '{}');
                    exportCSV(users, 'users.csv');
                    exportCSV(jobs, 'jobs.csv');
                    exportCSV(machines, 'machines.csv');
                    exportCSV(payments, 'payments.csv');
                    exportCSV(disputesRows, 'disputes.csv');
                    exportCSV(Object.values(labourRatings), 'labour-ratings.csv');
                    exportCSV(Object.values(machineRatings), 'machine-ratings.csv');
                    exportCSV(notifications, 'notifications.csv');
                    exportCSV(deletedUsers, 'deleted-users.csv');
                    exportCSV(deletedJobs, 'deleted-jobs.csv');
                    exportCSV(deletedMachines, 'deleted-machines.csv');
                  }}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  Export All CSV
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">User Directory</h2>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or phone"
                  className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportCSV(users, 'users.csv')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                Export Users CSV
              </button>
              <button
                onClick={() => exportCSV(deletedUsers, 'deleted-users.csv')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                Export Deleted Users CSV
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map(u => (
                <div key={u.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{u.name}</p>
                      <p className="text-sm text-gray-600">{u.phone} • {u.village}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {u.role}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2 text-xs text-gray-600">
                    <span className="px-2 py-1 rounded-full bg-green-50">Verified (Mock)</span>
                    <span className="px-2 py-1 rounded-full bg-blue-50">KYC Pending</span>
                    {fraudFlags[u.id] && <span className="px-2 py-1 rounded-full bg-red-50 text-red-700">Flagged</span>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this user?')) {
                          softDeleteUser(u);
                        }
                      }}
                      className="px-3 py-1 text-xs border border-gray-200 rounded-lg"
                    >
                      Soft Delete
                    </button>
                    <button
                      onClick={() => toggleFraudFlag(u.id)}
                      className="px-3 py-1 text-xs border border-gray-200 rounded-lg"
                    >
                      {fraudFlags[u.id] ? 'Unflag' : 'Flag'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {deletedUsers.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Deleted Users</h3>
                <div className="space-y-2">
                  {deletedUsers.map(u => (
                    <div key={u.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between text-sm">
                      <span>{u.name} • {u.role}</span>
                      <button
                        onClick={() => restoreUser(u)}
                        className="px-3 py-1 text-xs border border-gray-200 rounded-lg"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Jobs Overview</h2>
            <div className="flex gap-2">
              <button
                onClick={() => exportCSV(jobs, 'jobs.csv')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                Export Jobs CSV
              </button>
              <button
                onClick={() => exportCSV(deletedJobs, 'deleted-jobs.csv')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                Export Deleted Jobs CSV
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map(job => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{job.workType}</p>
                      <p className="text-sm text-gray-600">{job.farmerName} • {job.location}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      {job.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{job.description}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this job?')) {
                          softDeleteJob(job);
                        }
                      }}
                      className="px-3 py-1 text-xs border border-gray-200 rounded-lg"
                    >
                      Soft Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {deletedJobs.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Deleted Jobs</h3>
                <div className="space-y-2">
                  {deletedJobs.map(j => (
                    <div key={j.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between text-sm">
                      <span>{j.workType} • {j.location}</span>
                      <button
                        onClick={() => restoreJob(j)}
                        className="px-3 py-1 text-xs border border-gray-200 rounded-lg"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'machines' && (
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Machines (Read-only)</h2>
            <div className="flex gap-2">
              <button
                onClick={() => exportCSV(machines, 'machines.csv')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                Export Machines CSV
              </button>
              <button
                onClick={() => exportCSV(deletedMachines, 'deleted-machines.csv')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                Export Deleted Machines CSV
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {machines.map(m => (
                <div key={m.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{m.machineType}</p>
                      <p className="text-sm text-gray-600">Owner: {m.ownerName} • {m.ownerPhone}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                      {m.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">₹{m.price}/{m.priceUnit}</div>
                  <div className="mt-3 flex gap-2 text-xs text-gray-600">
                    {fraudFlags[m.id] && <span className="px-2 py-1 rounded-full bg-red-50 text-red-700">Flagged</span>}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this machine record?')) {
                          softDeleteMachine(m);
                        }
                      }}
                      className="px-3 py-1 text-xs border border-gray-200 rounded-lg"
                    >
                      Soft Delete
                    </button>
                    <button
                      onClick={() => toggleFraudFlag(m.id)}
                      className="px-3 py-1 text-xs border border-gray-200 rounded-lg"
                    >
                      {fraudFlags[m.id] ? 'Unflag' : 'Flag'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {deletedMachines.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Deleted Machines</h3>
                <div className="space-y-2">
                  {deletedMachines.map(m => (
                    <div key={m.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between text-sm">
                      <span>{m.machineType} • {m.ownerName}</span>
                      <button
                        onClick={() => restoreMachine(m)}
                        className="px-3 py-1 text-xs border border-gray-200 rounded-lg"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Dispute Resolution</h2>
            <div className="space-y-3">
              {disputes.map(d => (
                <div key={d.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{d.title}</p>
                    <p className="text-sm text-gray-600">{d.raisedBy} • {d.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusPill(d.status)}`}>
                      {d.status}
                    </span>
                    <button
                      onClick={() => {
                        const next = disputes.map(x => x.id === d.id ? { ...x, status: 'resolved' } : x);
                        setDisputes(next);
                        localStorage.setItem('disputes', JSON.stringify(next));
                        logAction('DISPUTE_CLOSED', d.id, 'UPDATE');
                      }}
                      className="px-2 py-1 text-xs border border-gray-200 rounded-lg"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Payments & Transactions</h2>
            <div className="flex gap-2">
              <button
                onClick={() => exportCSV(payments, 'payments.csv')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                Export Payments CSV
              </button>
              <button
                onClick={() => exportCSV(adminActions, 'admin-actions.csv')}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                Export Admin Actions CSV
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {payments.length === 0 && <p className="text-gray-500">No payment records yet.</p>}
              {payments.map(p => (
                <div key={p.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.flow === 'labour' ? 'Labour Payment' : 'Machine Rental'} • {p.id}</p>
                    <p className="text-xs text-gray-600">
                      ₹{p.amountTotal}{p.depositAmount ? ` • Deposit ₹${p.depositAmount}` : ''} • {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPaymentBadgeTone(p)}`}>
                      {getPaymentStatusLabel(p)}
                    </span>
                    {p.status !== 'refunded' && (
                      <button
                        onClick={() => {
                          markRefunded(p.id);
                          setPayments(getPayments());
                          logAction('PAYMENT_REFUNDED', p.id, 'UPDATE');
                        }}
                        className="px-2 py-1 text-xs border border-red-200 text-red-700 rounded-lg"
                      >
                        Trigger Refund
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Seasonal Demand</h2>
              <div className="h-40 rounded-lg bg-gradient-to-r from-green-100 to-yellow-100 flex items-center justify-center text-sm text-gray-600">
                Demand Heatmap (Mock)
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Platform Growth</h2>
              <div className="h-40 rounded-lg bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center text-sm text-gray-600">
                User & Revenue Chart (Mock)
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Leaderboards & Recognition</h2>
              <div className="space-y-3 text-sm">
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium">Top Farmer</p>
                  <p>{leaderboard.farmerScores[0]?.name || 'N/A'} • {leaderboard.farmerScores[0]?.count || 0} jobs</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium">Top Labour</p>
                  <p>{leaderboard.labourScores[0]?.name || 'N/A'} • {leaderboard.labourScores[0]?.count || 0} jobs</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium">Top Machine Owner</p>
                  <p>{leaderboard.machineScores[0]?.name || 'N/A'} • {leaderboard.machineScores[0]?.count || 0} rentals</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Trust Scores</h2>
              <div className="space-y-2 text-sm">
                {users.map(u => {
                  const trust = trustScoreFor(u.id);
                  return (
                    <div key={u.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                      <span>{u.name} • {u.role}</span>
                      <span className="font-medium">{trust.score} ({trust.badge})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

