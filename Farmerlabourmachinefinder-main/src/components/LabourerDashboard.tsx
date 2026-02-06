import { useState, useEffect } from 'react';
import { User, Job } from '../App';
import { LogOut, Briefcase, MapPin, Calendar, Clock, DollarSign, Phone, Filter, Sparkles, Shield, Map, BellRing } from 'lucide-react';
import { NotificationBell, NotificationItem } from './NotificationBell';

interface LabourerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function LabourerDashboard({ user, onLogout }: LabourerDashboardProps) {
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'English');
  const [activeTab, setActiveTab] = useState<'find-work' | 'my-work' | 'skills' | 'team' | 'attendance' | 'earnings' | 'safety' | 'profile'>('find-work');
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [filterWorkType, setFilterWorkType] = useState<string>('All');
  const [filterVillage, setFilterVillage] = useState<string>('All');
  const [sameVillageOnly, setSameVillageOnly] = useState(false);
  const [preferredDistance, setPreferredDistance] = useState('10 km');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [negotiations, setNegotiations] = useState<Record<string, any>>({});
  const [counterInputs, setCounterInputs] = useState<Record<string, { amount: string; reason: string }>>({});
  const [workProofs, setWorkProofs] = useState<Record<string, any>>({});
  const [paymentStates, setPaymentStates] = useState<Record<string, any>>({});
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    phone: user.phone,
    village: user.village,
    language: 'Telugu',
    capacity: 'High',
    preferredDistance: '10 km',
    skills: user.skills || [],
    accessibility: {
      darkMode: false,
      lowData: false,
      voiceAssist: false,
      elderly: false
    }
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
    const stored = localStorage.getItem('workProofs');
    if (stored) {
      setWorkProofs(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('paymentStates');
    if (stored) {
      setPaymentStates(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    setProfileForm({
      name: user.name,
      phone: user.phone,
      village: user.village,
      language: 'Telugu',
      capacity: 'High',
      preferredDistance: '10 km',
      skills: user.skills || [],
      accessibility: {
        darkMode: false,
        lowData: false,
        voiceAssist: false,
        elderly: false
      }
    });
  }, [user]);

  useEffect(() => {
    const storedPrefs = localStorage.getItem(`labourPrefs:${user.id}`);
    if (storedPrefs) {
      setProfileForm(prev => ({ ...prev, ...JSON.parse(storedPrefs) }));
    }
  }, [user.id]);

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const loadData = () => {
    const allJobs: Job[] = JSON.parse(localStorage.getItem('jobs') || '[]');
    
    // Available jobs (not accepted or accepted by me)
    const available = allJobs.filter(
      job => job.status === 'posted' || (job.acceptedBy === user.id && job.status !== 'completed')
    );
    setAvailableJobs(available);

    // My accepted jobs
    const my = allJobs.filter(job => job.acceptedBy === user.id);
    setMyJobs(my);
  };

  const handleAcceptJob = (jobId: string) => {
    const allJobs: Job[] = JSON.parse(localStorage.getItem('jobs') || '[]');
    const jobIndex = allJobs.findIndex(j => j.id === jobId);
    
    if (jobIndex !== -1) {
      if (allJobs[jobIndex].toolsProvidedBy === 'Labour' && !allJobs[jobIndex].toolConfirmed) {
        alert('Please confirm you have the required tools before accepting.');
        return;
      }
      allJobs[jobIndex].status = 'accepted';
      allJobs[jobIndex].acceptedBy = user.id;
      allJobs[jobIndex].acceptedByName = user.name;
      localStorage.setItem('jobs', JSON.stringify(allJobs));
      loadData();
      pushNotification({
        id: `N-${Date.now()}`,
        userRole: 'Farmer',
        title: 'Labour accepted job',
        message: `Job accepted by ${user.name}`,
        type: 'ActionRequired',
        read: false,
        timestamp: new Date().toLocaleString()
      });
    }
  };

  const handleCompleteJob = (jobId: string) => {
    const allJobs: Job[] = JSON.parse(localStorage.getItem('jobs') || '[]');
    const jobIndex = allJobs.findIndex(j => j.id === jobId);
    
    if (jobIndex !== -1) {
      allJobs[jobIndex].status = 'completed';
      localStorage.setItem('jobs', JSON.stringify(allJobs));
      loadData();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredJobs = availableJobs.filter(job => {
    const matchesWorkType = filterWorkType === 'All' || job.workType.includes(filterWorkType);
    const matchesVillage = filterVillage === 'All' || job.location === filterVillage;
    const matchesSameVillage = !sameVillageOnly || job.location === user.village;
    return matchesWorkType && matchesVillage && matchesSameVillage;
  });

  const villages = ['All', ...Array.from(new Set(availableJobs.map(j => j.location)))];
  const workTypes = ['All', 'Ploughing', 'Sowing', 'Harvesting', 'Weeding', 'Irrigation', 'Pesticide Spraying'];

  const earnings = myJobs
    .filter(j => j.status === 'completed')
    .reduce((sum, job) => sum + job.payment, 0);

  const stats = {
    available: availableJobs.filter(j => j.status === 'posted').length,
    accepted: myJobs.filter(j => j.status === 'accepted').length,
    completed: myJobs.filter(j => j.status === 'completed').length,
    earnings: earnings
  };

  const availableSkills = ['Ploughing', 'Sowing', 'Harvesting', 'Weeding', 'Irrigation', 'Pesticide Spraying'];
  const completedJobs = myJobs.filter(j => j.status === 'completed');
  const skillCounts = availableSkills.reduce((acc, skill) => {
    acc[skill] = completedJobs.filter(job => job.workType.includes(skill)).length;
    return acc;
  }, {} as Record<string, number>);

  const getSkillLevel = (count: number) => {
    if (count >= 6) return 'Expert';
    if (count >= 3) return 'Skilled';
    return 'Beginner';
  };

  const t = {
    English: {
      role: 'Labourer',
      find: 'Find Work',
      my: 'My Work',
      attendance: 'Attendance',
      earnings: 'Earnings',
      safety: 'Safety',
      profile: 'Profile',
      available: 'Available',
      accepted: 'Accepted',
      completed: 'Completed',
      workType: 'Work Type',
      village: 'Village',
      sameVillage: 'Same village preference',
      preferredDistance: 'Preferred distance',
      mapView: 'Map View (Mock)',
      nearbyJobs: 'Nearby Jobs & Alerts',
      smartSuggestions: 'Smart Job Suggestions (Mock)',
      availableJobs: 'Available Jobs',
      postedBy: 'Posted by',
      myAccepted: 'My Accepted Work',
      noAccepted: 'No accepted jobs yet',
      findWork: 'Find Work',
      totalEarnings: 'Total Earnings',
      attendanceLog: 'Attendance Log (Mock)',
      earningsSummary: 'Earnings Summary',
      safetyTitle: 'Trust & Safety',
      triggerSOS: 'Trigger SOS',
      raiseDispute: 'Raise Dispute',
      profileTitle: 'My Profile',
      name: 'Name',
      roleLabel: 'Role',
      phone: 'Phone',
      skills: 'Skills',
      editProfile: 'Edit Profile',
      saveProfile: 'Save Profile',
      cancel: 'Cancel',
      trustScore: 'Trust Score (Mock)',
      score: 'Score',
      badge: 'Badge',
      workPrefs: 'Work Preferences (Mock)',
      physicalCapacity: 'Physical capacity',
      accessibility: 'Accessibility & Modes (Mock)',
      darkMode: 'Dark mode',
      lowData: 'Low-data mode',
      voiceAssist: 'Voice assistance',
      elderlyUI: 'Elderly-friendly UI',
      on: 'On',
      off: 'Off'
      ,
      statusPosted: 'posted',
      statusAccepted: 'accepted',
      statusCompleted: 'completed',
      markCompleted: 'Mark as Completed',
      farmerLabel: 'Farmer',
      fromCompleted: 'From {count} completed jobs'
    },
    'తెలుగు': {
      role: 'కూలీ',
      find: 'పని వెతుకు',
      my: 'నా పని',
      attendance: 'హాజరు',
      earnings: 'ఆదాయం',
      safety: 'భద్రత',
      profile: 'ప్రొఫైల్',
      available: 'లభ్యం',
      accepted: 'అంగీకరించినవి',
      completed: 'పూర్తయినవి',
      workType: 'పని రకం',
      village: 'గ్రామం',
      sameVillage: 'అదే గ్రామం ప్రాధాన్యత',
      preferredDistance: 'ఇష్టమైన దూరం',
      mapView: 'మ్యాప్ వీూ (మాక్)',
      nearbyJobs: 'సమీప పనులు & అలర్ట్స్',
      smartSuggestions: 'స్మార్ట్ సూచనలు (మాక్)',
      availableJobs: 'లభ్యమైన పనులు',
      postedBy: 'పోస్ట్ చేసినవారు',
      myAccepted: 'నా అంగీకరించిన పని',
      noAccepted: 'ఇంకా అంగీకరించిన పనులు లేవు',
      findWork: 'పని వెతుకు',
      totalEarnings: 'మొత్తం ఆదాయం',
      attendanceLog: 'హాజరు లాగ్ (మాక్)',
      earningsSummary: 'ఆదాయం సారాంశం',
      safetyTitle: 'భద్రత & నమ్మకం',
      triggerSOS: 'SOS పంపండి',
      raiseDispute: 'వివాదం నమోదు',
      profileTitle: 'నా ప్రొఫైల్',
      name: 'పేరు',
      roleLabel: 'పాత్ర',
      phone: 'ఫోన్',
      skills: 'నైపుణ్యాలు',
      editProfile: 'ప్రొఫైల్ మార్చండి',
      saveProfile: 'ప్రొఫైల్ సేవ్ చేయండి',
      cancel: 'రద్దు',
      trustScore: 'ట్రస్ట్ స్కోర్ (మాక్)',
      score: 'స్కోర్',
      badge: 'బ్యాడ్జ్',
      workPrefs: 'పని అభిరుచులు (మాక్)',
      physicalCapacity: 'శారీరక సామర్థ్యం',
      accessibility: 'అందుబాటు & మోడ్‌లు (మాక్)',
      darkMode: 'డార్క్ మోడ్',
      lowData: 'లో-డేటా మోడ్',
      voiceAssist: 'వాయిస్ సహాయం',
      elderlyUI: 'వృద్ధుల అనుకూల UI',
      on: 'ఆన్',
      off: 'ఆఫ్'
      ,
      statusPosted: 'పోస్ట్ చేసినవి',
      statusAccepted: 'అంగీకరించబడింది',
      statusCompleted: 'పూర్తయింది',
      markCompleted: 'పూర్తయిందిగా గుర్తించండి',
      farmerLabel: 'రైతు',
      fromCompleted: '{count} పూర్తయిన పనుల నుండి'
    },
    हिन्दी: {
      role: 'श्रमिक',
      find: 'काम खोजें',
      my: 'मेरा काम',
      attendance: 'हाज़िरी',
      earnings: 'कमाई',
      safety: 'सुरक्षा',
      profile: 'प्रोफ़ाइल',
      available: 'उपलब्ध',
      accepted: 'स्वीकार किए गए',
      completed: 'पूरा हुआ',
      workType: 'काम का प्रकार',
      village: 'गाँव',
      sameVillage: 'एक ही गाँव प्राथमिकता',
      preferredDistance: 'पसंदीदा दूरी',
      mapView: 'मैप व्यू (मॉक)',
      nearbyJobs: 'पास के काम व अलर्ट',
      smartSuggestions: 'स्मार्ट सुझाव (मॉक)',
      availableJobs: 'उपलब्ध काम',
      postedBy: 'पोस्ट करने वाले',
      myAccepted: 'मेरे स्वीकार किए गए काम',
      noAccepted: 'अभी तक कोई काम स्वीकार नहीं किया',
      findWork: 'काम खोजें',
      totalEarnings: 'कुल कमाई',
      attendanceLog: 'हाज़िरी लॉग (मॉक)',
      earningsSummary: 'कमाई सारांश',
      safetyTitle: 'सुरक्षा और भरोसा',
      triggerSOS: 'SOS भेजें',
      raiseDispute: 'विवाद दर्ज करें',
      profileTitle: 'मेरी प्रोफ़ाइल',
      name: 'नाम',
      roleLabel: 'भूमिका',
      phone: 'फोन',
      skills: 'कौशल',
      editProfile: 'प्रोफ़ाइल संपादित करें',
      saveProfile: 'प्रोफ़ाइल सेव करें',
      cancel: 'रद्द करें',
      trustScore: 'ट्रस्ट स्कोर (मॉक)',
      score: 'स्कोर',
      badge: 'बैज',
      workPrefs: 'काम वरीयताएँ (मॉक)',
      physicalCapacity: 'शारीरिक क्षमता',
      accessibility: 'सुविधाएँ और मोड (मॉक)',
      darkMode: 'डार्क मोड',
      lowData: 'लो-डेटा मोड',
      voiceAssist: 'वॉइस सहायता',
      elderlyUI: 'वरिष्ठों के लिए UI',
      on: 'चालू',
      off: 'बंद'
      ,
      statusPosted: 'पोस्ट किया गया',
      statusAccepted: 'स्वीकृत',
      statusCompleted: 'पूरा हुआ',
      markCompleted: 'पूर्ण के रूप में चिन्हित करें',
      farmerLabel: 'किसान',
      fromCompleted: '{count} पूरे हुए कामों से'
    }
  };

  const labels = t[language as keyof typeof t] || t.English;

  const savePaymentStates = (next: Record<string, any>) => {
    setPaymentStates(next);
    localStorage.setItem('paymentStates', JSON.stringify(next));
  };

  const getPaymentState = (jobId: string, amount: number) => {
    const existing = paymentStates[jobId];
    if (existing) return existing;
    return {
      jobId,
      workCompletedByLabour: false,
      farmerSatisfaction: null,
      finalPayableAmount: amount,
      revisedAmount: null,
      revisedReason: null,
      qrGenerated: false,
      qrRef: `QR-${jobId}`,
      paymentStatus: 'unpaid',
      negotiationStatus: 'pending_labour'
    };
  };

  const pushNotification = (n: NotificationItem) => {
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    stored.unshift(n);
    localStorage.setItem('notifications', JSON.stringify(stored));
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
      history: [{ by: 'Farmer', amount: basePrice, message: 'Initial offer', at: Date.now() }],
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

  const fairBadge = (amount: number) => {
    if (amount < 600) return { label: 'Low', color: 'text-red-700 bg-red-100' };
    if (amount > 800) return { label: 'High', color: 'text-green-700 bg-green-100' };
    return { label: 'Fair', color: 'text-yellow-700 bg-yellow-100' };
  };

  const getStatusLabel = (status: string) => {
    if (status === 'posted') return labels.statusPosted;
    if (status === 'accepted') return labels.statusAccepted;
    if (status === 'completed') return labels.statusCompleted;
    return status;
  };

  const saveProfile = () => {
    const allUsers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = allUsers.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      allUsers[idx] = {
        ...allUsers[idx],
        name: profileForm.name,
        phone: profileForm.phone,
        village: profileForm.village,
        skills: profileForm.skills
      };
      localStorage.setItem('users', JSON.stringify(allUsers));
      localStorage.setItem('currentUser', JSON.stringify(allUsers[idx]));
    }
    localStorage.setItem(
      `labourPrefs:${user.id}`,
      JSON.stringify({
        language: profileForm.language,
        capacity: profileForm.capacity,
        preferredDistance: profileForm.preferredDistance,
        accessibility: profileForm.accessibility
      })
    );
    setIsEditingProfile(false);
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (!trimmed) {
      return;
    }
    if (!profileForm.skills.includes(trimmed)) {
      setProfileForm(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setCustomSkill('');
  };

  const removeSkill = (skill: string) => {
    setProfileForm(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AgriConnect</h1>
              <p className="text-sm text-gray-600">Labourer Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell role="labourer" />
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
              <p className="text-sm text-gray-600">👷 {labels.role}</p>
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
              onClick={() => setActiveTab('find-work')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'find-work'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.find}
            </button>
            <button
              onClick={() => setActiveTab('my-work')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'my-work'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.my}
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'skills'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Skill Tracker
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'team'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Group Mode
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'attendance'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.attendance}
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'earnings'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.earnings}
            </button>
            <button
              onClick={() => setActiveTab('safety')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'safety'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.safety}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-orange-600 border-b-2 border-orange-600'
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
        {activeTab === 'find-work' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{labels.available}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.available}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{labels.accepted}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.accepted}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Briefcase className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{labels.completed}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completed}</p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <Briefcase className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{labels.earnings}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">₹{stats.earnings}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {labels.workType}
                    </label>
                    <select
                      value={filterWorkType}
                      onChange={e => setFilterWorkType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {workTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {labels.village}
                    </label>
                    <select
                      value={filterVillage}
                      onChange={e => setFilterVillage(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {villages.map(village => (
                        <option key={village} value={village}>{village}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-700">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sameVillageOnly}
                    onChange={e => setSameVillageOnly(e.target.checked)}
                  />
                  {labels.sameVillage}
                </label>
                <div className="flex items-center gap-2">
                  <span>{labels.preferredDistance}</span>
                  <select
                    value={preferredDistance}
                    onChange={e => setPreferredDistance(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
                  >
                    <option>5 km</option>
                    <option>10 km</option>
                    <option>20 km</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Map className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">{labels.mapView}</h2>
              </div>
              <div className="h-44 rounded-lg bg-gradient-to-r from-orange-100 to-yellow-100 flex items-center justify-center text-sm text-gray-600">
                {labels.nearbyJobs}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-gray-900">{labels.smartSuggestions}</h2>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  Recommended: Harvesting job in Anantapur (match 88%).
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  Day work available with +10% bonus.
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  Missed job retry alert: New opening for Sowing today.
                </div>
              </div>
            </div>

            {/* Available Jobs */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{labels.availableJobs}</h2>
              {filteredJobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No jobs available matching your filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map(job => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-500 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{job.workType}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                              {getStatusLabel(job.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{job.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{job.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                              <DollarSign className="w-4 h-4" />
                              <span>₹{job.payment}</span>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">{labels.postedBy}: <span className="font-medium">{job.farmerName}</span></p>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Phone className="w-4 h-4" />
                              <span>{job.farmerPhone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {(() => {
                        const key = `job:${job.id}`;
                        const neg = getNegotiation(key, job.payment);
                        const badge = fairBadge(neg.basePrice);
                        const input = counterInputs[key] || { amount: '', reason: '' };
                        const expired = isExpired(neg);
                        return (
                          <div className="mt-4 border border-gray-200 rounded-lg p-3 text-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Negotiation</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${badge.color}`}>{badge.label}</span>
                            </div>
                            <div className="space-y-1 text-gray-700">
                              <div>Base Price: ₹{neg.basePrice}</div>
                              <div>Rounds: {neg.rounds}/3</div>
                              {neg.finalPrice && <div>Final Price: ₹{neg.finalPrice}</div>}
                            </div>
                            <div className="mt-2 space-y-2">
                              {neg.history.map((h: any, idx: number) => (
                                <div key={`${key}-${idx}`} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                  <span className="font-medium">{h.by}</span>: ₹{h.amount} {h.message ? `• ${h.message}` : ''}
                                </div>
                              ))}
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
                            {neg.status === 'rejected' && (
                              <div className="mt-2 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                                Negotiation rejected.
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
                                  placeholder="Reason (distance, experience)"
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
                                    const current = getNegotiation(key, job.payment);
                                    if (current.rounds >= 3) return;
                                    const updated = {
                                      ...current,
                                      history: [
                                        ...current.history,
                                        { by: 'Labour', amount: Number(input.amount), message: input.reason, at: Date.now() }
                                      ],
                                      rounds: current.rounds + 1,
                                      updatedAt: Date.now()
                                    };
                                    next[key] = updated;
                                    saveNegotiations(next);
                                  }}
                                  className="px-3 py-1 bg-orange-600 text-white rounded-lg"
                                >
                                  Counter
                                </button>
                              </div>
                            )}
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => {
                                  const next = { ...negotiations };
                                  const current = getNegotiation(key, job.payment);
                                  const last = current.history[current.history.length - 1];
                                  const agreed = {
                                    ...current,
                                    finalPrice: last.amount,
                                    status: 'agreed',
                                    updatedAt: Date.now()
                                  };
                                  next[key] = agreed;
                                  saveNegotiations(next);
                                  const allJobs: Job[] = JSON.parse(localStorage.getItem('jobs') || '[]');
                                  const idx = allJobs.findIndex(j => j.id === job.id);
                                  if (idx !== -1) {
                                    allJobs[idx].payment = last.amount;
                                    allJobs[idx].negotiatedPrice = last.amount;
                                    localStorage.setItem('jobs', JSON.stringify(allJobs));
                                  }
                                }}
                                className="px-3 py-1 border border-gray-200 rounded-lg"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => {
                                  const next = { ...negotiations };
                                  const current = getNegotiation(key, job.payment);
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
                            <div className="mt-2 text-xs text-gray-500">
                              Tip: Counter within 10% for higher acceptance chance.
                            </div>
                          </div>
                        );
                      })()}
                      {(() => {
                        const payment = getPaymentState(job.id, job.negotiatedPrice || job.payment);
                        return (
                          <div className="mt-3 border border-gray-200 rounded-lg p-3 text-sm">
                            <p className="font-medium mb-1">On-site Completion & QR Payment</p>
                            <p>Status: {payment.workCompletedByLabour ? 'Completed' : 'In Progress'}</p>
                            {payment.workCompletedByLabour && payment.qrGenerated && (
                              <div className="mt-2 text-xs text-gray-700">
                                QR Ref: {payment.qrRef} • Amount: ₹{payment.finalPayableAmount}
                              </div>
                            )}
                            {!payment.workCompletedByLabour && (
                              <button
                                onClick={() => {
                                  const next = { ...paymentStates };
                                  next[job.id] = {
                                    ...payment,
                                    workCompletedByLabour: true,
                                    qrGenerated: true,
                                    qrRef: `QR-${job.id}`,
                                    negotiationStatus: 'pending_farmer'
                                  };
                                  savePaymentStates(next);
                                }}
                                className="mt-2 px-3 py-1 bg-orange-600 text-white rounded-lg"
                              >
                                Mark Work Completed (On-site)
                              </button>
                            )}
                            {payment.revisedAmount && payment.negotiationStatus === 'pending_labour' && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-600">Farmer revised amount: ₹{payment.revisedAmount} • {payment.revisedReason}</p>
                                <div className="mt-2 flex gap-2">
                                  <button
                                    onClick={() => {
                                      const next = { ...paymentStates };
                                      next[job.id] = {
                                        ...payment,
                                        finalPayableAmount: payment.revisedAmount,
                                        negotiationStatus: 'agreed'
                                      };
                                      savePaymentStates(next);
                                    }}
                                    className="px-3 py-1 border border-gray-200 rounded-lg"
                                  >
                                    Accept Revised Amount
                                  </button>
                                  <button
                                    onClick={() => alert('Dispute raised (mock).')}
                                    className="px-3 py-1 border border-red-200 text-red-700 rounded-lg"
                                  >
                                    Reject & Dispute
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      {job.status === 'posted' && (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-700 border border-gray-200 rounded-lg p-3">
                            <p>Tools required: {(job.toolsRequired && job.toolsRequired.length > 0) ? job.toolsRequired.join(', ') : 'None'}</p>
                            <p>Provided by: {job.toolsProvidedBy || 'Farmer'}</p>
                            {job.toolsProvidedBy === 'Labour' ? (
                              <label className="mt-2 flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={!!job.toolConfirmed}
                                  onChange={() => {
                                    const allJobs: Job[] = JSON.parse(localStorage.getItem('jobs') || '[]');
                                    const idx = allJobs.findIndex(j => j.id === job.id);
                                    if (idx !== -1) {
                                      allJobs[idx].toolConfirmed = !allJobs[idx].toolConfirmed;
                                      localStorage.setItem('jobs', JSON.stringify(allJobs));
                                      loadData();
                                    }
                                  }}
                                />
                                I have the required tools
                              </label>
                            ) : (
                              <p className="mt-2 text-xs text-gray-500">Tools will be provided at work location.</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleAcceptJob(job.id)}
                            className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                          >
                            Accept Job
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'my-work' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{labels.myAccepted}</h2>
              {myJobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>{labels.noAccepted}</p>
                  <button
                    onClick={() => setActiveTab('find-work')}
                    className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    {labels.findWork}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myJobs.map(job => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{job.workType}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                              {getStatusLabel(job.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{job.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{job.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                              <DollarSign className="w-4 h-4" />
                              <span>₹{job.payment}</span>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">{labels.farmerLabel}: <span className="font-medium">{job.farmerName}</span></p>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Phone className="w-4 h-4" />
                              <span>{job.farmerPhone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {job.status === 'accepted' && (
                        <button
                          onClick={() => handleCompleteJob(job.id)}
                          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
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
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{labels.totalEarnings}</h3>
              <p className="text-4xl font-bold text-orange-600">₹{earnings}</p>
              <p className="text-sm text-gray-600 mt-2">{labels.fromCompleted.replace('{count}', String(stats.completed))}</p>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Skill Growth Tracker (Mock)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {availableSkills.map(skill => {
                  const count = skillCounts[skill];
                  const level = getSkillLevel(count);
                  return (
                    <div key={skill} className="border border-gray-200 rounded-lg p-4">
                      <p className="font-medium text-gray-900">{skill}</p>
                      <p className="text-gray-600">Jobs done: {count}</p>
                      <p className="text-gray-700">
                        Level: <span className="font-medium">{level}</span>
                      </p>
                      <div className="mt-2 text-xs text-gray-500">Badge: {level}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Group Labour Mode (Mock)</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium">Team Leader: Suresh Reddy</p>
                  <p>Team size: 4 • Skill mix: Harvesting, Weeding</p>
                  <p>Payment split preview: 40% / 20% / 20% / 20%</p>
                  <button
                    onClick={() => alert('Team created (mock).')}
                    className="mt-2 px-3 py-2 bg-orange-600 text-white rounded-lg"
                  >
                    Create Team
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium">Join Team by Code</p>
                  <div className="flex gap-2 mt-2">
                    <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2" placeholder="Enter code" />
                    <button
                      onClick={() => alert('Joined team (mock).')}
                      className="px-3 py-2 border border-gray-200 rounded-lg"
                    >
                      Join
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{labels.attendanceLog}</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium">Harvesting • 2026-02-04</p>
                  <p>Check-in: 07:20 AM (Geo-tagged)</p>
                  <p>Check-out: 04:40 PM • Overtime: 1.5 hrs</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium">Ploughing • 2026-02-02</p>
                  <p>Check-in: 08:00 AM (Geo-tagged)</p>
                  <p>Check-out: 05:00 PM • Overtime: 0 hrs</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">Attendance uses geo-tagging and multi-day logs (mock).</p>
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{labels.earningsSummary}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600">Daily</p>
                  <p className="text-2xl font-bold text-gray-900">₹1,200</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600">Weekly</p>
                  <p className="text-2xl font-bold text-gray-900">₹5,400</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600">Monthly</p>
                  <p className="text-2xl font-bold text-gray-900">₹21,800</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-700">
                <BellRing className="w-4 h-4 text-orange-600" />
                Auto payslip generation and payment reminders enabled (mock).
              </div>
              <div className="mt-3 text-sm text-gray-700">
                Micro-loan eligibility: <span className="font-medium text-green-700">Likely eligible</span> (mock).
              </div>
            </div>
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold text-gray-900">{labels.safetyTitle}</h2>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium">SOS Emergency Button (Mock)</p>
                  <p>Trigger alert and share location with admin.</p>
                  <button
                    onClick={() => alert('SOS sent to admin (mock).')}
                    className="mt-2 px-3 py-2 bg-red-600 text-white rounded-lg"
                  >
                    {labels.triggerSOS}
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="font-medium">Dispute Raise</p>
                  <p>Upload evidence and track resolution status.</p>
                  <button
                    onClick={() => alert('Dispute submitted (mock).')}
                    className="mt-2 px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    {labels.raiseDispute}
                  </button>
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
                    type="text"
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
                  👷 Labourer
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{labels.phone}</label>
                {isEditingProfile ? (
                  <input
                    type="text"
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
                    type="text"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{labels.skills}</label>
                {isEditingProfile ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        value={customSkill}
                        onChange={e => setCustomSkill(e.target.value)}
                        placeholder="Type a new skill"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={addCustomSkill}
                        className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(profileForm.skills || []).map(skill => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                          title="Remove skill"
                        >
                          {skill} ×
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableSkills.map(skill => {
                        const active = profileForm.skills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() =>
                              setProfileForm(prev => ({
                                ...prev,
                                skills: active
                                  ? prev.skills.filter(s => s !== skill)
                                  : [...prev.skills, skill]
                              }))
                            }
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              active ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(profileForm.skills || []).map(skill => (
                      <span key={skill} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {isEditingProfile && (
                <div className="text-xs text-gray-500">
                  Tip: click a skill chip to remove it, or type a new skill and add.
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => (isEditingProfile ? saveProfile() : setIsEditingProfile(true))}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg"
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{labels.trustScore}</h3>
                <p className="text-sm text-gray-700">
                  {labels.score}: <span className="font-medium">78</span> • {labels.badge}:{' '}
                  <span className="font-medium text-yellow-700">Average</span>
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Bargain success rate: <span className="font-medium">78%</span>
                </p>
                <p className="text-sm text-gray-700 mt-1">Fair negotiation badge: ✅</p>
                <p className="text-sm text-gray-700 mt-1">Tool readiness badge: <span className="font-medium">Basic Tools Available</span></p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rating Summary (Mock)</h3>
                {(() => {
                  const ratings = Object.values(workProofs).filter((p: any) => p.labourId === user.id);
                  const avg = ratings.length
                    ? (ratings.reduce((sum: number, r: any) => sum + r.labourRating, 0) / ratings.length).toFixed(1)
                    : 'N/A';
                  return (
                    <div className="text-sm text-gray-700">
                      <p>Average rating: {avg}</p>
                      {ratings.slice(0, 3).map((r: any, idx: number) => (
                        <p key={idx} className="text-xs text-gray-600">
                          {r.workType}: {r.labourRating} ★ • {r.labourFeedback || 'No comment'}
                        </p>
                      ))}
                    </div>
                  );
                })()}
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Work Proof Gallery</h3>
                <div className="space-y-3">
                  {Object.values(workProofs)
                    .filter((p: any) => p.labourId === user.id)
                    .map((p: any) => (
                      <div key={p.jobId} className="border border-gray-200 rounded-lg p-3 text-sm">
                        <p className="font-medium">{p.workType}</p>
                        <p>Rating: {p.labourRating} ★</p>
                        {p.labourFeedback && <p>Feedback: {p.labourFeedback}</p>}
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {p.afterPhotos?.map((src: string, idx: number) => (
                            <img key={idx} src={src} alt="proof" className="w-16 h-16 object-cover rounded" />
                          ))}
                        </div>
                      </div>
                    ))}
                  {Object.values(workProofs).filter((p: any) => p.labourId === user.id).length === 0 && (
                    <p className="text-sm text-gray-500">No work proof uploaded yet.</p>
                  )}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{labels.workPrefs}</h3>
                {isEditingProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">{labels.physicalCapacity}</label>
                      <select
                        value={profileForm.capacity}
                        onChange={e => setProfileForm(prev => ({ ...prev, capacity: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">{labels.preferredDistance}</label>
                      <select
                        value={profileForm.preferredDistance}
                        onChange={e => setProfileForm(prev => ({ ...prev, preferredDistance: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1"
                      >
                        <option>5 km</option>
                        <option>10 km</option>
                        <option>20 km</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Language</label>
                      <select
                        value={profileForm.language}
                        onChange={e => setProfileForm(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1"
                      >
                        <option>Telugu</option>
                        <option>Hindi</option>
                        <option>English</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-700">{labels.physicalCapacity}: {profileForm.capacity}</p>
                    <p className="text-sm text-gray-700">{labels.preferredDistance}: {profileForm.preferredDistance}</p>
                    <p className="text-sm text-gray-700">Language: {profileForm.language}</p>
                  </>
                )}
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{labels.accessibility}</h3>
                {isEditingProfile ? (
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                    <label className="border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={profileForm.accessibility.darkMode}
                        onChange={e =>
                          setProfileForm(prev => ({
                            ...prev,
                            accessibility: { ...prev.accessibility, darkMode: e.target.checked }
                          }))
                        }
                      />
                      {labels.darkMode}
                    </label>
                    <label className="border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={profileForm.accessibility.lowData}
                        onChange={e =>
                          setProfileForm(prev => ({
                            ...prev,
                            accessibility: { ...prev.accessibility, lowData: e.target.checked }
                          }))
                        }
                      />
                      {labels.lowData}
                    </label>
                    <label className="border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={profileForm.accessibility.voiceAssist}
                        onChange={e =>
                          setProfileForm(prev => ({
                            ...prev,
                            accessibility: { ...prev.accessibility, voiceAssist: e.target.checked }
                          }))
                        }
                      />
                      {labels.voiceAssist}
                    </label>
                    <label className="border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={profileForm.accessibility.elderly}
                        onChange={e =>
                          setProfileForm(prev => ({
                            ...prev,
                            accessibility: { ...prev.accessibility, elderly: e.target.checked }
                          }))
                        }
                      />
                      {labels.elderlyUI}
                    </label>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                    <div className="border border-gray-200 rounded-lg p-3">
                      {labels.darkMode}: {profileForm.accessibility.darkMode ? labels.on : labels.off}
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3">
                      {labels.lowData}: {profileForm.accessibility.lowData ? labels.on : labels.off}
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3">
                      {labels.voiceAssist}: {profileForm.accessibility.voiceAssist ? labels.on : labels.off}
                    </div>
                    <div className="border border-gray-200 rounded-lg p-3">
                      {labels.elderlyUI}: {profileForm.accessibility.elderly ? labels.on : labels.off}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
