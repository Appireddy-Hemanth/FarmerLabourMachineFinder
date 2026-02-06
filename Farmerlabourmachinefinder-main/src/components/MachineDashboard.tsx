import { useState, useEffect, useRef } from 'react';
import { User, Machine, MachineRequest } from '../App';
import { LogOut, Tractor, Plus, MapPin, Phone, DollarSign, Check, X, Sparkles, Wrench, Map } from 'lucide-react';
import { NotificationBell, NotificationItem } from './NotificationBell';

interface MachineDashboardProps {
  user: User;
  onLogout: () => void;
}

export function MachineDashboard({ user, onLogout }: MachineDashboardProps) {
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'English');
  const [activeTab, setActiveTab] = useState<'machines' | 'requests' | 'add-machine' | 'maintenance' | 'analytics' | 'profile'>('machines');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [requests, setRequests] = useState<MachineRequest[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    phone: user.phone,
    village: user.village
  });
  const [maintenanceItems, setMaintenanceItems] = useState([
    { id: 'm1', machine: 'Tractor', due: '12 days', lastService: '2026-01-18', fuel: '24L/day' },
    { id: 'm2', machine: 'Harvester', due: '25 days', lastService: '2026-01-02', fuel: '18L/day' }
  ]);
  const [editingMaintenanceId, setEditingMaintenanceId] = useState<string | null>(null);
  const [gpsMessage, setGpsMessage] = useState('Machine Movement History');
  const [aiPrice, setAiPrice] = useState('₹550/hour');
  const [purchasePrice, setPurchasePrice] = useState(450000);
  const [usageHours, setUsageHours] = useState(120);
  const [negotiations, setNegotiations] = useState<Record<string, any>>({});
  const [counterInputs, setCounterInputs] = useState<Record<string, { amount: string; reason: string }>>({});
  const [machinePhotos, setMachinePhotos] = useState<Record<string, string[]>>({});
  const [photoUploads, setPhotoUploads] = useState<string[]>([]);
  const [machineRatings, setMachineRatings] = useState<Record<string, any>>({});
  const [photoError, setPhotoError] = useState('');
  const machinePhotoInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    machineType: 'Tractor',
    price: '',
    priceUnit: 'hour' as 'hour' | 'day',
    description: '',
    operatorAssigned: 'Self',
    documentsUploaded: false
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('negotiations');
    if (stored) {
      setNegotiations(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('machinePhotos');
    if (stored) {
      setMachinePhotos(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(`machineDynamic:${user.id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.gpsMessage) setGpsMessage(parsed.gpsMessage);
      if (parsed.aiPrice) setAiPrice(parsed.aiPrice);
    }
  }, [user.id]);

  const persistDynamic = (next: { gpsMessage?: string; aiPrice?: string }) => {
    const current = JSON.parse(localStorage.getItem(`machineDynamic:${user.id}`) || '{}');
    const merged = { ...current, ...next };
    localStorage.setItem(`machineDynamic:${user.id}`, JSON.stringify(merged));
  };

  useEffect(() => {
    const stored = localStorage.getItem('machineRatings');
    if (stored) {
      setMachineRatings(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    setProfileForm({ name: user.name, phone: user.phone, village: user.village });
  }, [user]);

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const loadData = () => {
    const allMachines: Machine[] = JSON.parse(localStorage.getItem('machines') || '[]');
    const myMachines = allMachines.filter(m => m.ownerId === user.id);
    setMachines(myMachines);

    const allRequests: MachineRequest[] = JSON.parse(localStorage.getItem('machineRequests') || '[]');
    const myRequests = allRequests.filter(r => r.ownerId === user.id);
    setRequests(myRequests);
  };

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (photoUploads.length < 3 || photoUploads.length > 6) {
      setPhotoError('Please upload 3–6 machine photos.');
      return;
    }

    const newMachine: Machine = {
      id: Date.now().toString(),
      ownerId: user.id,
      ownerName: user.name,
      ownerVillage: user.village,
      ownerPhone: user.phone,
      machineType: formData.machineType,
      price: parseFloat(formData.price),
      priceUnit: formData.priceUnit,
      availability: true,
      description: formData.description
    };

    const allMachines: Machine[] = JSON.parse(localStorage.getItem('machines') || '[]');
    allMachines.push(newMachine);
    localStorage.setItem('machines', JSON.stringify(allMachines));

    if (photoUploads.length > 0) {
      const next = { ...machinePhotos, [newMachine.id]: photoUploads };
      setMachinePhotos(next);
      localStorage.setItem('machinePhotos', JSON.stringify(next));
    }

    setMachines([...machines, newMachine]);
    setFormData({
      machineType: 'Tractor',
      price: '',
      priceUnit: 'hour',
      description: '',
      operatorAssigned: 'Self',
      documentsUploaded: false
    });
    setPhotoUploads([]);
    setPhotoError('');
    setActiveTab('machines');
  };

  const toggleAvailability = (machineId: string) => {
    const allMachines: Machine[] = JSON.parse(localStorage.getItem('machines') || '[]');
    const machineIndex = allMachines.findIndex(m => m.id === machineId);
    
    if (machineIndex !== -1) {
      allMachines[machineIndex].availability = !allMachines[machineIndex].availability;
      localStorage.setItem('machines', JSON.stringify(allMachines));
      loadData();
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    const allRequests: MachineRequest[] = JSON.parse(localStorage.getItem('machineRequests') || '[]');
    const requestIndex = allRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex !== -1) {
      allRequests[requestIndex].status = 'accepted';
      localStorage.setItem('machineRequests', JSON.stringify(allRequests));
      loadData();
      pushNotification({
        id: `N-${Date.now()}`,
        userRole: 'Farmer',
        title: 'Machine booking accepted',
        message: 'Your machine request was accepted.',
        type: 'Info',
        read: false,
        timestamp: new Date().toLocaleString()
      });
    }
  };

  const handleRejectRequest = (requestId: string) => {
    const allRequests: MachineRequest[] = JSON.parse(localStorage.getItem('machineRequests') || '[]');
    const filtered = allRequests.filter(r => r.id !== requestId);
    localStorage.setItem('machineRequests', JSON.stringify(filtered));
    loadData();
    pushNotification({
      id: `N-${Date.now()}`,
      userRole: 'Farmer',
      title: 'Machine booking rejected',
      message: 'Your machine request was rejected.',
      type: 'Warning',
      read: false,
      timestamp: new Date().toLocaleString()
    });
  };

  const handleCompleteRequest = (requestId: string) => {
    const allRequests: MachineRequest[] = JSON.parse(localStorage.getItem('machineRequests') || '[]');
    const requestIndex = allRequests.findIndex(r => r.id === requestId);
    
    if (requestIndex !== -1) {
      allRequests[requestIndex].status = 'completed';
      localStorage.setItem('machineRequests', JSON.stringify(allRequests));
      loadData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const earnings = requests
    .filter(r => r.status === 'completed')
    .reduce((sum, request) => {
      const machine = machines.find(m => m.id === request.machineId);
      return sum + (machine ? machine.price : 0);
    }, 0);

  const stats = {
    machines: machines.length,
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    earnings: earnings
  };

  const saveNegotiations = (next: Record<string, any>) => {
    setNegotiations(next);
    localStorage.setItem('negotiations', JSON.stringify(next));
  };

  const getNegotiation = (key: string, basePrice: number) => {
    const existing = negotiations[key];
    if (existing) return existing;
    return {
      id: key,
      basePrice,
      history: [{ by: 'Owner', amount: basePrice, message: 'Initial offer', at: Date.now() }],
      status: 'pending',
      finalPrice: null,
      rounds: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  };

  const isExpired = (neg: any) => {
    const hours = 6;
    return neg.status === 'pending' && (Date.now() - neg.updatedAt) > hours * 60 * 60 * 1000;
  };

  const pushNotification = (n: NotificationItem) => {
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    stored.unshift(n);
    localStorage.setItem('notifications', JSON.stringify(stored));
  };

  const fileListToBase64 = async (files: FileList | null) => {
    if (!files || files.length === 0) return [];
    const readers = Array.from(files).map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    });
    return Promise.all(readers);
  };

  const roi = purchasePrice > 0 ? Math.round((earnings / purchasePrice) * 100) : 0;
  const maintenanceRisk = usageHours > 200 ? 'High' : usageHours > 120 ? 'Medium' : 'Low';
  const nextServiceIn = Math.max(0, 240 - usageHours);

  const t = {
    English: {
      role: 'Machine Owner',
      machines: 'My Machines',
      requests: 'Requests',
      add: 'Add Machine',
      maintenance: 'Maintenance',
      analytics: 'Analytics',
      profile: 'Profile',
      totalMachines: 'Total Machines',
      pending: 'Pending',
      active: 'Active',
      earnings: 'Earnings',
      myMachinesTitle: 'My Machines',
      noMachines: 'No machines added yet',
      addMachine: 'Add Machine',
      machineRequests: 'Machine Requests',
      noRequests: 'No requests yet',
      requestedBy: 'Requested by',
      date: 'Date',
      duration: 'Duration',
      addNewMachine: 'Add New Machine',
      machineType: 'Machine Type',
      price: 'Price (₹)',
      per: 'Per',
      description: 'Description',
      maintenanceTitle: 'Maintenance Schedule (Mock)',
      breakdown: 'Breakdown Reporting',
      gps: 'GPS Tracking (Mock)',
      aiPricing: 'AI Pricing & Demand (Mock)',
      incomeSummary: 'Income Summary',
      profileTitle: 'My Profile',
      name: 'Name',
      roleLabel: 'Role',
      phone: 'Phone',
      village: 'Village',
      editProfile: 'Edit Profile',
      saveProfile: 'Save Profile',
      cancel: 'Cancel'
      ,
      statusPending: 'pending',
      statusAccepted: 'accepted',
      statusCompleted: 'completed',
      available: 'Available',
      unavailable: 'Unavailable',
      accept: 'Accept',
      reject: 'Reject',
      markCompleted: 'Mark as Completed',
      toggled: 'Toggle',
      requestedBy: 'Requested by'
    },
    'తెలుగు': {
      role: 'యంత్ర యజమాని',
      machines: 'నా యంత్రాలు',
      requests: 'అభ్యర్థనలు',
      add: 'యంత్రం జోడించు',
      maintenance: 'మెయింటెనెన్స్',
      analytics: 'విశ్లేషణ',
      profile: 'ప్రొఫైల్',
      totalMachines: 'మొత్తం యంత్రాలు',
      pending: 'పెండింగ్',
      active: 'సక్రియం',
      earnings: 'ఆదాయం',
      myMachinesTitle: 'నా యంత్రాలు',
      noMachines: 'ఇప్పటికీ యంత్రాలు జోడించలేదు',
      addMachine: 'యంత్రం జోడించండి',
      machineRequests: 'యంత్ర అభ్యర్థనలు',
      noRequests: 'అభ్యర్థనలు లేవు',
      requestedBy: 'అభ్యర్థించినవారు',
      date: 'తేదీ',
      duration: 'వ్యవధి',
      addNewMachine: 'కొత్త యంత్రం జోడించండి',
      machineType: 'యంత్ర రకం',
      price: 'ధర (₹)',
      per: 'ప్రతి',
      description: 'వివరణ',
      maintenanceTitle: 'మెయింటెనెన్స్ షెడ్యూల్ (మాక్)',
      breakdown: 'దెబ్బ నివేదిక',
      gps: 'GPS ట్రాకింగ్ (మాక్)',
      aiPricing: 'ఏఐ ధర & డిమాండ్ (మాక్)',
      incomeSummary: 'ఆదాయం సారాంశం',
      profileTitle: 'నా ప్రొఫైల్',
      name: 'పేరు',
      roleLabel: 'పాత్ర',
      phone: 'ఫోన్',
      village: 'గ్రామం',
      editProfile: 'ప్రొఫైల్ మార్చండి',
      saveProfile: 'ప్రొఫైల్ సేవ్ చేయండి',
      cancel: 'రద్దు'
      ,
      statusPending: 'పెండింగ్',
      statusAccepted: 'అంగీకరించబడింది',
      statusCompleted: 'పూర్తయింది',
      available: 'లభ్యం',
      unavailable: 'లభ్యం కాదు',
      accept: 'అంగీకరించండి',
      reject: 'తిరస్కరించండి',
      markCompleted: 'పూర్తయిందిగా గుర్తించండి',
      toggled: 'టాగుల్',
      requestedBy: 'అభ్యర్థించినవారు'
    },
    हिन्दी: {
      role: 'मशीन मालिक',
      machines: 'मेरी मशीनें',
      requests: 'अनुरोध',
      add: 'मशीन जोड़ें',
      maintenance: 'मेंटेनेंस',
      analytics: 'एनालिटिक्स',
      profile: 'प्रोफ़ाइल',
      totalMachines: 'कुल मशीनें',
      pending: 'लंबित',
      active: 'सक्रिय',
      earnings: 'कमाई',
      myMachinesTitle: 'मेरी मशीनें',
      noMachines: 'अभी तक मशीनें नहीं जोड़ी गईं',
      addMachine: 'मशीन जोड़ें',
      machineRequests: 'मशीन अनुरोध',
      noRequests: 'कोई अनुरोध नहीं',
      requestedBy: 'अनुरोधकर्ता',
      date: 'तारीख',
      duration: 'अवधि',
      addNewMachine: 'नई मशीन जोड़ें',
      machineType: 'मशीन प्रकार',
      price: 'कीमत (₹)',
      per: 'प्रति',
      description: 'विवरण',
      maintenanceTitle: 'मेंटेनेंस शेड्यूल (मॉक)',
      breakdown: 'ब्रेकडाउन रिपोर्टिंग',
      gps: 'GPS ट्रैकिंग (मॉक)',
      aiPricing: 'एआई प्राइसिंग व डिमांड (मॉक)',
      incomeSummary: 'आय सारांश',
      profileTitle: 'मेरी प्रोफ़ाइल',
      name: 'नाम',
      roleLabel: 'भूमिका',
      phone: 'फोन',
      village: 'गाँव',
      editProfile: 'प्रोफ़ाइल संपादित करें',
      saveProfile: 'प्रोफ़ाइल सेव करें',
      cancel: 'रद्द करें'
      ,
      statusPending: 'लंबित',
      statusAccepted: 'स्वीकृत',
      statusCompleted: 'पूरा हुआ',
      available: 'उपलब्ध',
      unavailable: 'अनुपलब्ध',
      accept: 'स्वीकारें',
      reject: 'अस्वीकारें',
      markCompleted: 'पूर्ण के रूप में चिन्हित करें',
      toggled: 'टॉगल',
      requestedBy: 'अनुरोधकर्ता'
    }
  };

  const labels = t[language as keyof typeof t] || t.English;

  const getStatusLabel = (status: string) => {
    if (status === 'pending') return labels.statusPending;
    if (status === 'accepted') return labels.statusAccepted;
    if (status === 'completed') return labels.statusCompleted;
    return status;
  };

  const saveProfile = () => {
    const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = allUsers.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      allUsers[idx] = { ...allUsers[idx], name: profileForm.name, phone: profileForm.phone, village: profileForm.village };
      localStorage.setItem('users', JSON.stringify(allUsers));
      localStorage.setItem('currentUser', JSON.stringify(allUsers[idx]));
    }
    setIsEditingProfile(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Tractor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AgriConnect</h1>
              <p className="text-sm text-gray-600">Machine Owner Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell role="machine_owner" />
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
              <p className="font-medium text-gray-900">{profileForm.name}</p>
              <p className="text-sm text-gray-600">🚜 {labels.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('machines')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'machines'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.machines}
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-3 font-medium transition-colors relative ${
                activeTab === 'requests'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.requests}
              {stats.pending > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {stats.pending}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('add-machine')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'add-machine'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.add}
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'maintenance'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.maintenance}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.analytics}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.profile}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'machines' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{labels.totalMachines}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.machines}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Tractor className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{labels.pending}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Tractor className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{labels.active}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.accepted}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Tractor className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{labels.earnings}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">₹{stats.earnings}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* My Machines */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{labels.myMachinesTitle}</h2>
                <button
                  onClick={() => setActiveTab('add-machine')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {labels.addMachine}
                </button>
              </div>

              {machines.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Tractor className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>{labels.noMachines}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {machines.map(machine => (
                    <div key={machine.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{machine.machineType}</h3>
                          <p className="text-sm text-gray-600 mt-1">{machine.description}</p>
                        </div>
                        <Tractor className="w-8 h-8 text-blue-600" />
                      </div>
                      {machinePhotos[machine.id] && (
                        <div className="mb-3 flex gap-2 flex-wrap">
                          {machinePhotos[machine.id].map((src, idx) => (
                            <img key={idx} src={src} alt="machine" className="w-16 h-16 object-cover rounded" />
                          ))}
                        </div>
                      )}

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium text-blue-600">
                            ₹{machine.price}/{machine.priceUnit}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{machine.ownerVillage}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          machine.availability 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {machine.availability ? labels.available : labels.unavailable}
                        </span>
                        <button
                          onClick={() => toggleAvailability(machine.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {labels.toggled}
                        </button>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        Docs: Uploaded (Mock) • Operator: Assigned (Mock)
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{labels.machineRequests}</h2>
              {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Tractor className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>{labels.noRequests}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map(request => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{request.machineType}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {getStatusLabel(request.status)}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-600">
                              {labels.requestedBy}: <span className="font-medium text-gray-900">{request.farmerName}</span>
                            </p>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{request.farmerPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{request.location}</span>
                            </div>
                            <p className="text-gray-600">{labels.date}: {request.date} • {labels.duration}: {request.duration}</p>
                          </div>
                        </div>
                      </div>

                      {(() => {
                        const machine = machines.find(m => m.id === request.machineId);
                        const basePrice = machine ? machine.price : 0;
                        const key = `machine:${request.id}`;
                        const neg = getNegotiation(key, basePrice);
                        const input = counterInputs[key] || { amount: '', reason: '' };
                        const expired = isExpired(neg);
                        const durationNumber = parseInt(request.duration);
                        const discountEligible = request.duration.includes('day') && !Number.isNaN(durationNumber) && durationNumber >= 2;
                        const fuelCost = 150;
                        const finalPrice = neg.finalPrice || basePrice;
                        const profit = finalPrice - fuelCost;
                        return (
                          <div className="mb-3 border border-gray-200 rounded-lg p-3 text-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Negotiation</span>
                              <span className="text-xs text-gray-500">Rounds: {neg.rounds}/3</span>
                            </div>
                            <div className="space-y-1 text-gray-700">
                              <div>Original rent: ₹{neg.basePrice}</div>
                              {neg.finalPrice && <div>Final agreed: ₹{neg.finalPrice}</div>}
                            </div>
                            {discountEligible && (
                              <div className="mt-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-2 py-1">
                                Eligible for multi-day discount.
                              </div>
                            )}
                            <div className="mt-2 space-y-2">
                              {neg.history.map((h: any, idx: number) => (
                                <div key={`${key}-${idx}`} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                  <span className="font-medium">{h.by}</span>: ₹{h.amount} {h.message ? `• ${h.message}` : ''}
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              AI tip: Counter within 10% for higher acceptance chance.
                            </div>
                            {expired && (
                              <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                                Negotiation expired. Offer restored to base price.
                              </div>
                            )}
                            {neg.status === 'agreed' && (
                              <div className="mt-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-2 py-1">
                                Agreement locked. No further bargaining.
                              </div>
                            )}
                            {!expired && neg.status === 'pending' && (
                              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                                <input
                                  type="number"
                                  placeholder="Counter amount"
                                  value={input.amount}
                                  onChange={e =>
                                    setCounterInputs(prev => ({ ...prev, [key]: { ...input, amount: e.target.value } }))
                                  }
                                  className="border border-gray-300 rounded-lg px-2 py-1"
                                />
                                <input
                                  type="text"
                                  placeholder="Reason (fuel, demand)"
                                  value={input.reason}
                                  onChange={e =>
                                    setCounterInputs(prev => ({ ...prev, [key]: { ...input, reason: e.target.value } }))
                                  }
                                  className="border border-gray-300 rounded-lg px-2 py-1"
                                />
                                <button
                                  onClick={() => {
                                    if (!input.amount) return;
                                    const next = { ...negotiations };
                                    const current = getNegotiation(key, basePrice);
                                    if (current.rounds >= 3) return;
                                    const updated = {
                                      ...current,
                                      history: [
                                        ...current.history,
                                        { by: 'Owner', amount: Number(input.amount), message: input.reason, at: Date.now() }
                                      ],
                                      rounds: current.rounds + 1,
                                      updatedAt: Date.now()
                                    };
                                    next[key] = updated;
                                    saveNegotiations(next);
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white rounded-lg"
                                >
                                  Counter
                                </button>
                              </div>
                            )}
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => {
                                  const next = { ...negotiations };
                                  const current = getNegotiation(key, basePrice);
                                  const last = current.history[current.history.length - 1];
                                  const agreed = {
                                    ...current,
                                    finalPrice: last.amount,
                                    status: 'agreed',
                                    updatedAt: Date.now()
                                  };
                                  next[key] = agreed;
                                  saveNegotiations(next);
                                }}
                                className="px-3 py-1 border border-gray-200 rounded-lg"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => {
                                  const next = { ...negotiations };
                                  const current = getNegotiation(key, basePrice);
                                  next[key] = { ...current, status: 'rejected', updatedAt: Date.now() };
                                  saveNegotiations(next);
                                }}
                                className="px-3 py-1 border border-gray-200 rounded-lg"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => alert('Reported unfair bargain (mock).')}
                                className="px-3 py-1 border border-red-200 text-red-700 rounded-lg"
                              >
                                Report Unfair
                              </button>
                            </div>
                            <div className="mt-3 text-xs text-gray-600">
                              Profit preview: ₹{profit} (fuel cost ₹{fuelCost})
                            </div>
                          </div>
                        );
                      })()}

                      {request.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            {labels.accept}
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            {labels.reject}
                          </button>
                        </div>
                      )}

                      {request.status === 'accepted' && (
                        <button
                          onClick={() => handleCompleteRequest(request.id)}
                          className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {labels.markCompleted}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Earnings Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Earnings</h3>
              <p className="text-4xl font-bold text-blue-600">₹{earnings}</p>
              <p className="text-sm text-gray-600 mt-2">From completed rentals</p>
            </div>
          </div>
        )}

        {activeTab === 'add-machine' && (
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{labels.addNewMachine}</h2>
            <form onSubmit={handleAddMachine} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels.machineType}
                </label>
                <select
                  value={formData.machineType}
                  onChange={e => setFormData({ ...formData, machineType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Tractor</option>
                  <option>Harvester</option>
                  <option>Thresher</option>
                  <option>Cultivator</option>
                  <option>Seed Drill</option>
                  <option>Sprayer</option>
                  <option>Plough</option>
                  <option>Drone Sprayer</option>
                  <option>Rotavator</option>
                  <option>Power Tiller</option>
                  <option>Transplanter</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.price}
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.per}
                  </label>
                  <select
                    value={formData.priceUnit}
                    onChange={e => setFormData({ ...formData, priceUnit: e.target.value as 'hour' | 'day' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels.description}
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide details about your machine..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Machine Photos (3–6)</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => machinePhotoInputRef.current?.click()}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    Upload Machine Photos
                  </button>
                  <span className="text-xs text-gray-500">Images only</span>
                </div>
                <input
                  ref={machinePhotoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async e => setPhotoUploads(await fileListToBase64(e.target.files))}
                />
                {photoUploads.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {photoUploads.map((src, idx) => (
                      <img key={idx} src={src} alt="machine" className="w-16 h-16 object-cover rounded" />
                    ))}
                  </div>
                )}
                {photoError && (
                  <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                    {photoError}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operator Link</label>
                  <select
                    value={formData.operatorAssigned}
                    onChange={e => setFormData({ ...formData, operatorAssigned: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option>Self</option>
                    <option>Assigned Driver</option>
                    <option>Farmer Operator</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={formData.documentsUploaded}
                    onChange={e => setFormData({ ...formData, documentsUploaded: e.target.checked })}
                  />
                  RC/Insurance uploaded (Mock)
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Machine
              </button>
            </form>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">{labels.maintenanceTitle}</h2>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                {maintenanceItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    {editingMaintenanceId === item.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          className="border border-gray-300 rounded-lg px-3 py-2"
                          value={item.machine}
                          onChange={e => {
                            setMaintenanceItems(prev => prev.map(m => m.id === item.id ? { ...m, machine: e.target.value } : m));
                          }}
                        />
                        <input
                          className="border border-gray-300 rounded-lg px-3 py-2"
                          value={item.due}
                          onChange={e => {
                            setMaintenanceItems(prev => prev.map(m => m.id === item.id ? { ...m, due: e.target.value } : m));
                          }}
                        />
                        <input
                          className="border border-gray-300 rounded-lg px-3 py-2"
                          value={item.lastService}
                          onChange={e => {
                            setMaintenanceItems(prev => prev.map(m => m.id === item.id ? { ...m, lastService: e.target.value } : m));
                          }}
                        />
                        <input
                          className="border border-gray-300 rounded-lg px-3 py-2"
                          value={item.fuel}
                          onChange={e => {
                            setMaintenanceItems(prev => prev.map(m => m.id === item.id ? { ...m, fuel: e.target.value } : m));
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingMaintenanceId(null)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingMaintenanceId(null)}
                            className="px-3 py-2 border border-gray-200 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">{item.machine} • Service due in {item.due}</p>
                        <p>Last service: {item.lastService} • Fuel log: {item.fuel}</p>
                        <button
                          onClick={() => setEditingMaintenanceId(item.id)}
                          className="mt-2 text-xs text-blue-600"
                        >
                          Edit Schedule
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{labels.breakdown}</h2>
              <p className="text-sm text-gray-700">Capture damage with images and auto-generate reports (mock).</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Predictive Maintenance (Mock AI)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Usage Hours</label>
                  <input
                    type="number"
                    value={usageHours}
                    onChange={e => setUsageHours(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-gray-600">Next service in</p>
                  <p className="text-lg font-bold text-gray-900">{nextServiceIn} hours</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-gray-600">Breakdown risk</p>
                  <p className={`text-lg font-bold ${maintenanceRisk === 'High' ? 'text-red-600' : maintenanceRisk === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {maintenanceRisk}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Machine ROI Dashboard (Mock)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={e => setPurchasePrice(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-gray-600">Total earnings</p>
                  <p className="text-lg font-bold text-gray-900">₹{stats.earnings}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <p className="text-gray-600">ROI %</p>
                  <p className="text-lg font-bold text-green-700">{roi}%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-2">
                <Map className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">{labels.gps}</h2>
              </div>
              <div className="h-40 rounded-lg bg-gradient-to-r from-blue-100 to-sky-100 flex items-center justify-center text-sm text-gray-600">
                {gpsMessage}
              </div>
              <button
                onClick={() => {
                  const next = Math.random() > 0.5
                    ? 'Last ping: 2 mins ago • Route updated (Mock)'
                    : 'Last ping: just now • Machine active near Anantapur (Mock)';
                  setGpsMessage(next);
                  persistDynamic({ gpsMessage: next });
                }}
                className="mt-3 text-sm text-blue-600"
              >
                Refresh GPS
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-bold text-gray-900">{labels.aiPricing}</h2>
              </div>
              <p className="text-sm text-gray-700">Suggested rental price: {aiPrice} (demand peak in 2 weeks).</p>
              <button
                onClick={() => {
                  const next = Math.random() > 0.5 ? '₹600/hour' : '₹520/hour';
                  setAiPrice(next);
                  persistDynamic({ aiPrice: next });
                }}
                className="mt-3 text-sm text-blue-600"
              >
                Recalculate Pricing
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{labels.incomeSummary}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600">Daily</p>
                  <p className="text-2xl font-bold text-gray-900">₹2,500</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600">Monthly</p>
                  <p className="text-2xl font-bold text-gray-900">₹38,400</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600">Tax-ready</p>
                  <p className="text-2xl font-bold text-gray-900">Export PDF</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{labels.profileTitle}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{labels.name}</label>
                {isEditingProfile ? (
                  <input
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {profileForm.name}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{labels.roleLabel}</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  🚜 Machine Owner
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{labels.phone}</label>
                {isEditingProfile ? (
                  <input
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {profileForm.phone}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{labels.village}</label>
                {isEditingProfile ? (
                  <input
                    value={profileForm.village}
                    onChange={e => setProfileForm({ ...profileForm, village: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    {profileForm.village}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => (isEditingProfile ? saveProfile() : setIsEditingProfile(true))}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {isEditingProfile ? labels.saveProfile : labels.editProfile}
                </button>
                {isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    {labels.cancel}
                  </button>
                )}
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Trust Score (Mock)</h3>
                <p className="text-sm text-gray-700">
                  Score: <span className="font-medium">80</span> • Badge: <span className="font-medium text-green-700">Trusted</span>
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Bargain success rate: <span className="font-medium">78%</span>
                </p>
                <p className="text-sm text-gray-700 mt-1">Fair negotiation badge: ✅</p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Machine Ratings (Mock)</h3>
                <div className="text-sm text-gray-700">
                  {machines.map(machine => {
                    const ratings = Object.values(machineRatings).filter((r: any) => r.machineId === machine.id);
                    const avg = ratings.length
                      ? (ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length).toFixed(1)
                      : 'N/A';
                    return (
                      <div key={machine.id} className="border border-gray-200 rounded-lg p-3 mb-2">
                        <p className="font-medium">{machine.machineType}</p>
                        <p>Average rating: {avg}</p>
                        {ratings.slice(0, 2).map((r: any, idx: number) => (
                          <p key={idx} className="text-xs text-gray-600">Rating: {r.rating} ★ • {r.feedback || 'No comment'}</p>
                        ))}
                      </div>
                    );
                  })}
                  {machines.length === 0 && <p>No machines to rate yet.</p>}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Owner Verification (Mock)</h3>
                <p className="text-sm text-gray-700">KYC status: Pending</p>
                <p className="text-sm text-gray-700">Insurance docs: Uploaded</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
