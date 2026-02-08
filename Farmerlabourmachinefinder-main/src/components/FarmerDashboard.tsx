import { useState, useEffect } from 'react';
import { useRef } from 'react';
import { User, Job, Machine, MachineRequest } from '../App';
import { Plus, Briefcase, Tractor, User as UserIcon, MapPin, Phone, Calendar, DollarSign, Clock, Sparkles, CloudRain, Filter, LogOut } from 'lucide-react';
import { NotificationBell, NotificationItem } from './NotificationBell';
import { useAuth } from '../state/auth';
import { useNavigate } from 'react-router-dom';
import {
  ensureLabourPayment,
  ensureMachinePayment,
  findPaymentByJob,
  findPaymentByRequest,
  getPaymentBadgeTone,
  getPaymentStatusLabel,
  getPayments,
  markAdvancePaid,
  markMachinePaid,
  markRefunded,
  markReleased,
  PaymentRecord
} from '../state/payments';

interface FarmerDashboardProps {
  user: User;
}

export function FarmerDashboard({ user }: FarmerDashboardProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'English');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'post-job' | 'matching' | 'machines' | 'payments' | 'insights' | 'profile'>('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machineRequests, setMachineRequests] = useState<MachineRequest[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machineRequestForm, setMachineRequestForm] = useState({
    date: '',
    duration: ''
  });
  const [autoSuggestions, setAutoSuggestions] = useState([
    'Post similar job again?',
    'Hire same labour as last time?',
    'Auto-fill job form from previous job?'
  ]);
  const [cropPlan, setCropPlan] = useState('Cotton');
  const [landSize, setLandSize] = useState(5);
  const [alertItems, setAlertItems] = useState([
    { id: 'alert-1', text: 'Labour did not start on time for 1 job.' },
    { id: 'alert-2', text: 'Machine idle too long in last rental.' }
  ]);
  const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [negotiations, setNegotiations] = useState<Record<string, any>>({});
  const [counterInputs, setCounterInputs] = useState<Record<string, { amount: string; reason: string }>>({});
  const [completionJobId, setCompletionJobId] = useState<string | null>(null);
  const [completionRequestId, setCompletionRequestId] = useState<string | null>(null);
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [labourRating, setLabourRating] = useState(0);
  const [labourComment, setLabourComment] = useState('');
  const [machineRating, setMachineRating] = useState(0);
  const [machineComment, setMachineComment] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [postWorkPhotos, setPostWorkPhotos] = useState<string[]>([]);
  const [damageFlags, setDamageFlags] = useState<Record<string, boolean>>({});
  const [paymentStates, setPaymentStates] = useState<Record<string, any>>({});
  const [paymentModal, setPaymentModal] = useState<{ type: 'job' | 'request'; id: string } | null>(null);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [satisfaction, setSatisfaction] = useState<'yes' | 'no' | ''>('');
  const [revisedAmount, setRevisedAmount] = useState('');
  const [revisedReason, setRevisedReason] = useState('');
  const [paymentHistory, setPaymentHistory] = useState<Array<any>>([]);
  const beforeInputRef = useRef<HTMLInputElement | null>(null);
  const afterInputRef = useRef<HTMLInputElement | null>(null);
  const postWorkInputRef = useRef<HTMLInputElement | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    phone: user.phone,
    village: user.village
  });
  const [farmProfiles, setFarmProfiles] = useState([
    { id: 'p1', name: 'Plot A', crop: 'Cotton', soil: 'Black soil', irrigation: 'Borewell' },
    { id: 'p2', name: 'Plot B', crop: 'Paddy', soil: 'Loamy', irrigation: 'Canal' }
  ]);
  const [accessibility, setAccessibility] = useState({
    darkMode: false,
    lowData: false,
    voiceAssist: false,
    elderly: false
  });
  const [isEditingFarm, setIsEditingFarm] = useState(false);
  const [mapItems, setMapItems] = useState([
    { id: 'm1', title: 'Labourers near Anantapur', detail: '8 workers available within 5 km' },
    { id: 'm2', title: 'Machines nearby', detail: '2 tractors, 1 harvester available' }
  ]);
  const [aiRecommendations, setAiRecommendations] = useState([
    'Recommended: Hire 4 labourers for Harvesting in Anantapur (best match score 92%).',
    'Suggested machine: Tractor + operator combo to reduce cost by 12%.',
    'Alert: Labour shortage expected next week — consider pre-booking.'
  ]);
  const [weatherAlert, setWeatherAlert] = useState('Rain expected tomorrow. Consider rescheduling pesticide spraying.');
  const [schemeAlert, setSchemeAlert] = useState('PM-KISAN installment window opens next week for small farmers.');
  const [productivityNote, setProductivityNote] = useState('Estimated yield up 8% if irrigation is advanced by 2 days.');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const stored = localStorage.getItem(`farmerDynamic:${user.id}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.mapItems) setMapItems(parsed.mapItems);
      if (parsed.aiRecommendations) setAiRecommendations(parsed.aiRecommendations);
      if (parsed.weatherAlert) setWeatherAlert(parsed.weatherAlert);
    }
  }, [user.id]);

  const persistDynamic = (next: { mapItems?: typeof mapItems; aiRecommendations?: string[]; weatherAlert?: string }) => {
    const current = JSON.parse(localStorage.getItem(`farmerDynamic:${user.id}`) || '{}');
    const merged = { ...current, ...next };
    localStorage.setItem(`farmerDynamic:${user.id}`, JSON.stringify(merged));
  };
  const [formData, setFormData] = useState({
    workType: 'Ploughing',
    jobCategory: 'Manual labour',
    jobTemplate: 'Custom',
    location: user.village,
    date: '',
    duration: '',
    payment: '',
    description: '',
    emergency: false,
    bulkPosting: false,
    autoSplit: false,
    toolsProvidedBy: 'Labour',
    toolsRequired: [] as string[],
    customTool: '',
    attachments: [] as string[]
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
    const stored = localStorage.getItem('paymentStates');
    if (stored) {
      setPaymentStates(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('machineDamageFlags');
    if (stored) {
      setDamageFlags(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    setPaymentRecords(getPayments());
  }, []);

  useEffect(() => {
    setProfileForm({ name: user.name, phone: user.phone, village: user.village });
  }, [user]);

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  useEffect(() => {
    const storedProfiles = localStorage.getItem(`farmProfiles:${user.id}`);
    const storedAccess = localStorage.getItem(`accessibility:${user.id}`);
    if (storedProfiles) {
      setFarmProfiles(JSON.parse(storedProfiles));
    }
    if (storedAccess) {
      setAccessibility(JSON.parse(storedAccess));
    }
  }, [user.id]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
    const jobKeys = new Set(jobs.map(j => getPaymentKey('job', j.id)));
    const requestKeys = new Set(machineRequests.map(r => getPaymentKey('request', r.id)));
    const filtered = all.filter((p: any) =>
      p.farmerId === user.id || jobKeys.has(p.jobId) || requestKeys.has(p.jobId)
    );
    setPaymentHistory(filtered);
  }, [jobs, machineRequests, user.id]);

  const loadData = () => {
    const allJobs: Job[] = JSON.parse(localStorage.getItem('jobs') || '[]');
    const payments = getPayments();
    let jobsChanged = false;
    const normalizedJobs = allJobs.map(job => {
      if (job.farmerId !== user.id) return job;
      const payment = payments.find(p => p.jobId === job.id);
      if (!payment) return job;
      let nextStatus = job.status;
      if (payment.status === 'advance_paid') nextStatus = 'advance_paid';
      if (payment.status === 'held') nextStatus = 'in_progress';
      if (payment.status === 'completed' || payment.status === 'released') nextStatus = 'completed';
      if (payment.status === 'refunded') nextStatus = 'cancelled';
      if (nextStatus !== job.status) {
        jobsChanged = true;
        return { ...job, status: nextStatus };
      }
      return job;
    });
    if (jobsChanged) {
      localStorage.setItem('jobs', JSON.stringify(normalizedJobs));
    }
    const myJobs = normalizedJobs.filter(job => job.farmerId === user.id);
    setJobs(myJobs);
    myJobs
      .filter(job => job.acceptedBy && ['agreement_locked', 'advance_paid', 'in_progress', 'completed'].includes(job.status))
      .forEach(job => ensureLabourPayment(job, job.acceptedBy || ''));

    const allMachines: Machine[] = JSON.parse(localStorage.getItem('machines') || '[]');
    setMachines(allMachines.filter(m => m.availability));

    const allRequests: MachineRequest[] = JSON.parse(localStorage.getItem('machineRequests') || '[]');
    const myRequests = allRequests.filter(r => r.farmerId === user.id);
    setMachineRequests(myRequests);
    myRequests
      .filter(r => r.status !== 'pending')
      .forEach(r => {
        const machine = allMachines.find(m => m.id === r.machineId);
        if (machine) ensureMachinePayment(r, machine);
      });
    refreshPayments();
  };

  const refreshPayments = () => {
    setPaymentRecords(getPayments());
  };

  const pushFlash = (text: string, type: 'success' | 'error' = 'success') => {
    setFlashMessage({ text, type });
    window.setTimeout(() => {
      setFlashMessage(prev => (prev?.text === text ? null : prev));
    }, 3000);
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newJob: Job = {
      id: Date.now().toString(),
      farmerId: user.id,
      farmerName: user.name,
      farmerVillage: user.village,
      farmerPhone: user.phone,
      workType: `${formData.workType} • ${formData.jobCategory}`,
      location: formData.location,
      date: formData.date,
      duration: formData.duration,
      payment: parseFloat(formData.payment),
      status: 'posted',
      description: formData.description,
      postedAt: Date.now(),
      workPhotos: postWorkPhotos,
      toolsProvidedBy: formData.toolsProvidedBy as 'Labour' | 'Farmer' | 'Machine Owner',
      toolsRequired: formData.toolsRequired,
      attachments: formData.attachments,
      toolConfirmed: false
    };

    const allJobs: Job[] = JSON.parse(localStorage.getItem('jobs') || '[]');
    allJobs.push(newJob);
    localStorage.setItem('jobs', JSON.stringify(allJobs));
    pushNotification({
      id: `N-${Date.now()}`,
      userRole: 'Labour',
      title: 'New job posted near you',
      message: `${formData.workType} in ${formData.location}`,
      type: 'Info',
      read: false,
      timestamp: new Date().toLocaleString()
    });

    setJobs([...jobs, newJob]);
    setFormData({
      workType: 'Ploughing',
      jobCategory: 'Manual labour',
      jobTemplate: 'Custom',
      location: user.village,
      date: '',
      duration: '',
      payment: '',
      description: '',
      emergency: false,
      bulkPosting: false,
      autoSplit: false,
      toolsProvidedBy: 'Labour',
      toolsRequired: [],
      customTool: '',
      attachments: []
    });
    setPostWorkPhotos([]);
    setActiveTab('dashboard');
    pushFlash('Job posted successfully.');
  };

  const updateJobRecord = (jobId: string, patch: Partial<Job>) => {
    const allJobs: Job[] = JSON.parse(localStorage.getItem('jobs') || '[]');
    const idx = allJobs.findIndex(j => j.id === jobId);
    if (idx === -1) return null;
    const next = { ...allJobs[idx], ...patch };
    allJobs[idx] = next;
    localStorage.setItem('jobs', JSON.stringify(allJobs));
    return next;
  };

  const handleApproveApplicant = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job?.appliedBy) return;
    const updated = updateJobRecord(jobId, {
      status: 'agreement_locked',
      acceptedBy: job.appliedBy,
      acceptedByName: job.appliedByName,
      labourDecision: 'pending'
    });
    if (updated?.acceptedBy) {
      ensureLabourPayment(updated, updated.acceptedBy);
    }
    loadData();
    refreshPayments();
    pushFlash('Agreement locked. Pay advance to start work.');
  };

  const handleRejectApplicant = (jobId: string) => {
    updateJobRecord(jobId, {
      status: 'posted',
      appliedBy: undefined,
      appliedByName: undefined,
      acceptedBy: undefined,
      acceptedByName: undefined,
      labourDecision: undefined
    });
    loadData();
    pushFlash('Application rejected.');
  };

  const handleCancelJob = (jobId: string) => {
    const updated = updateJobRecord(jobId, { status: 'cancelled' });
    if (updated) {
      const payment = findPaymentByJob(jobId);
      if (payment && payment.status !== 'pending') {
        markRefunded(payment.id);
        refreshPayments();
        pushFlash('Job cancelled. Refund initiated.');
      } else {
        pushFlash('Job cancelled.');
      }
    }
    loadData();
  };

  const handleRequestMachine = (machine: Machine | null) => {
    if (!machine) {
      alert('Please select a machine first.');
      return;
    }
    if (!machineRequestForm.date || !machineRequestForm.duration) {
      alert('Please enter date and duration for the machine request.');
      return;
    }
    const newRequest: MachineRequest = {
      id: Date.now().toString(),
      farmerId: user.id,
      farmerName: user.name,
      farmerPhone: user.phone,
      machineId: machine.id,
      machineType: machine.machineType,
      ownerId: machine.ownerId,
      location: user.village,
      date: machineRequestForm.date,
      duration: machineRequestForm.duration,
      status: 'pending'
    };

    const allRequests: MachineRequest[] = JSON.parse(localStorage.getItem('machineRequests') || '[]');
    allRequests.push(newRequest);
    localStorage.setItem('machineRequests', JSON.stringify(allRequests));
    setMachineRequests([...machineRequests, newRequest]);
    setSelectedMachine(null);
    setMachineRequestForm({ date: '', duration: '' });
    pushFlash('Machine request sent successfully.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted':
        return 'bg-blue-100 text-blue-800';
      case 'applied':
        return 'bg-purple-100 text-purple-800';
      case 'agreement_locked':
        return 'bg-green-100 text-green-800';
      case 'advance_paid':
        return 'bg-teal-100 text-teal-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    posted: jobs.filter(j => j.status === 'posted' || j.status === 'applied').length,
    accepted: jobs.filter(j => ['agreement_locked', 'advance_paid', 'in_progress'].includes(j.status)).length,
    completed: jobs.filter(j => j.status === 'completed').length,
  };
  const farmerPayments = paymentRecords.filter(p => p.farmerId === user.id);

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

  const pushNotification = (n: NotificationItem) => {
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    stored.unshift(n);
    localStorage.setItem('notifications', JSON.stringify(stored));
  };

  const savePaymentStates = (next: Record<string, any>) => {
    setPaymentStates(next);
    localStorage.setItem('paymentStates', JSON.stringify(next));
  };

  const getPaymentKey = (type: 'job' | 'request', id: string) => `${type}:${id}`;

  const parseDurationQty = (duration: string) => {
    if (!duration) return 1;
    const match = duration.match(/(\d+(\.\d+)?)/);
    return match ? Number(match[1]) : 1;
  };

  const getJobBaseAmount = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    return job?.negotiatedPrice || job?.payment || 0;
  };

  const getRequestBaseAmount = (requestId: string) => {
    const request = machineRequests.find(r => r.id === requestId);
    if (!request) return 0;
    const machine = machines.find(m => m.id === request.machineId);
    if (!machine) return 0;
    const qty = parseDurationQty(request.duration);
    return Math.round(machine.price * qty);
  };

  const addPaymentRecord = (record: any) => {
    const existing = JSON.parse(localStorage.getItem('paymentRecords') || '[]');
    const next = [record, ...existing];
    localStorage.setItem('paymentRecords', JSON.stringify(next));
    const jobKeys = new Set(jobs.map(j => getPaymentKey('job', j.id)));
    const requestKeys = new Set(machineRequests.map(r => getPaymentKey('request', r.id)));
    const filtered = next.filter((p: any) =>
      p.farmerId === user.id || jobKeys.has(p.jobId) || requestKeys.has(p.jobId)
    );
    setPaymentHistory(filtered);
  };

  const getPaymentState = (paymentKey: string, amount: number) => {
    const existing = paymentStates[paymentKey];
    if (existing) return existing;
    return {
      paymentKey,
      entityType: paymentKey.startsWith('job:') ? 'job' : 'request',
      entityId: paymentKey.split(':')[1],
      workCompletedByLabour: false,
      farmerSatisfaction: null,
      finalPayableAmount: amount,
      revisedAmount: null,
      revisedReason: null,
      qrGenerated: false,
      qrRef: `QR-${paymentKey}`,
      paymentStatus: 'unpaid',
      negotiationStatus: 'pending_labour'
    };
  };

  const openPaymentModal = (type: 'job' | 'request', id: string) => {
    setSatisfaction('');
    setRevisedAmount('');
    setRevisedReason('');
    setPaymentModal({ type, id });
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

  const openCompletionModal = (jobId: string) => {
    setCompletionJobId(jobId);
    setCompletionRequestId(null);
    setBeforePhotos([]);
    setAfterPhotos([]);
    setLabourRating(0);
    setLabourComment('');
    setMachineRating(0);
    setMachineComment('');
    setPhotoError('');
  };

  const openMachineCompletionModal = (requestId: string) => {
    setCompletionRequestId(requestId);
    setCompletionJobId(null);
    setBeforePhotos([]);
    setAfterPhotos([]);
    setLabourRating(0);
    setLabourComment('');
    setMachineRating(0);
    setMachineComment('');
    setPhotoError('');
  };

  const saveWorkProof = () => {
    const paymentState = completionJobId
      ? getPaymentState(getPaymentKey('job', completionJobId), getJobBaseAmount(completionJobId))
      : null;
    if (completionJobId && paymentState && paymentState.paymentStatus !== 'paid') {
      alert('Payment must be completed before finalizing the job.');
      return;
    }
    if (afterPhotos.length < 2 || afterPhotos.length > 5) {
      setPhotoError('Please upload 2–5 after-work photos.');
      return;
    }
    if (beforePhotos.length > 0 && beforePhotos.length > 5) {
      setPhotoError('Please upload up to 5 before-work photos.');
      return;
    }
    if (completionJobId && labourRating === 0) {
      alert('Please give a labour rating.');
      return;
    }
    if (completionRequestId && machineRating === 0) {
      alert('Please give a machine rating.');
      return;
    }

    const workProofs = JSON.parse(localStorage.getItem('workProofs') || '{}');
    const labourRatings = JSON.parse(localStorage.getItem('labourRatings') || '{}');
    const machineRatings = JSON.parse(localStorage.getItem('machineRatings') || '{}');
    const nowTs = Date.now();

    if (completionJobId) {
      const allJobs: Job[] = JSON.parse(localStorage.getItem('jobs') || '[]');
      const job = allJobs.find(j => j.id === completionJobId);
      if (!job) return;
      workProofs[completionJobId] = {
        jobId: completionJobId,
        farmerId: user.id,
        labourId: job.acceptedBy,
        workType: job.workType,
        beforePhotos,
        afterPhotos,
        labourRating,
        labourFeedback: labourComment,
        at: nowTs
      };
      labourRatings[completionJobId] = {
        labourId: job.acceptedBy,
        rating: labourRating,
        feedback: labourComment,
        at: nowTs
      };
      const idx = allJobs.findIndex(j => j.id === completionJobId);
      if (idx !== -1) {
        allJobs[idx].status = 'completed';
        localStorage.setItem('jobs', JSON.stringify(allJobs));
        setJobs(allJobs.filter(j => j.farmerId === user.id));
      }
      pushNotification({
        id: `N-${Date.now()}`,
        userRole: 'Labour',
        title: 'Rating received from farmer',
        message: `You received ${labourRating}★ for ${job.workType}`,
        type: 'Info',
        read: false,
        timestamp: new Date().toLocaleString()
      });
    }

    if (completionRequestId) {
      const paymentStateForReq = completionRequestId
        ? getPaymentState(getPaymentKey('request', completionRequestId), getRequestBaseAmount(completionRequestId))
        : null;
      if (paymentStateForReq && paymentStateForReq.paymentStatus !== 'paid') {
        alert('Payment must be completed before finalizing the job.');
        return;
      }
      const allRequests: MachineRequest[] = JSON.parse(localStorage.getItem('machineRequests') || '[]');
      const request = allRequests.find(r => r.id === completionRequestId);
      if (!request) return;
      machineRatings[completionRequestId] = {
        machineId: request.machineId,
        rating: machineRating,
        feedback: machineComment,
        at: nowTs
      };
      const idx = allRequests.findIndex(r => r.id === completionRequestId);
      if (idx !== -1) {
        allRequests[idx].status = 'completed';
        localStorage.setItem('machineRequests', JSON.stringify(allRequests));
        setMachineRequests(allRequests.filter(r => r.farmerId === user.id));
      }
      pushNotification({
        id: `N-${Date.now()}`,
        userRole: 'Machine Owner',
        title: 'Machine rated by farmer',
        message: `New rating submitted`,
        type: 'Info',
        read: false,
        timestamp: new Date().toLocaleString()
      });
    }

    localStorage.setItem('workProofs', JSON.stringify(workProofs));
    localStorage.setItem('labourRatings', JSON.stringify(labourRatings));
    localStorage.setItem('machineRatings', JSON.stringify(machineRatings));

    setCompletionJobId(null);
    setCompletionRequestId(null);
    setPhotoError('');
  };

  const lastJob = jobs[jobs.length - 1];
  const reminderThresholdHours = 6;
  const now = Date.now();

  const cropPlanner = {
    Cotton: [
      { stage: 'Sowing', time: 'Week 1', needs: '2 labour, 1 tractor' },
      { stage: 'Spraying', time: 'Week 6', needs: '1 labour, 1 sprayer' },
      { stage: 'Harvesting', time: 'Week 18', needs: '6 labour, 1 harvester' }
    ],
    Paddy: [
      { stage: 'Transplanting', time: 'Week 2', needs: '5 labour, 1 transplanter' },
      { stage: 'Spraying', time: 'Week 7', needs: '2 labour, 1 sprayer' },
      { stage: 'Harvesting', time: 'Week 16', needs: '8 labour, 1 harvester' }
    ],
    Groundnut: [
      { stage: 'Sowing', time: 'Week 1', needs: '2 labour, 1 seed drill' },
      { stage: 'Weeding', time: 'Week 5', needs: '4 labour' },
      { stage: 'Harvesting', time: 'Week 14', needs: '6 labour, 1 digger' }
    ]
  };

  const yieldModel = {
    Cotton: { cost: 3000, yield: 450 },
    Paddy: { cost: 2500, yield: 600 },
    Groundnut: { cost: 2200, yield: 380 }
  };
  const selectedModel = yieldModel[cropPlan as keyof typeof yieldModel];
  const estimatedCost = Math.round(selectedModel.cost * landSize);
  const expectedYield = Math.round(selectedModel.yield * landSize);
  const profitLow = Math.round(estimatedCost * 0.15);
  const profitHigh = Math.round(estimatedCost * 0.35);

  const toolOptions = ['Spade', 'Sickle', 'Sprayer', 'Cutter', 'Rope'];
  const attachmentOptions = ['Plough', 'Harrow', 'Seeder', 'Sprayer'];


  const expenseByCrop = [
    { crop: 'Cotton', amount: 14500 },
    { crop: 'Paddy', amount: 9800 },
    { crop: 'Groundnut', amount: 7200 }
  ];

  const t = {
    English: {
      role: 'Farmer',
      dashboard: 'Dashboard',
      post: 'Post Work',
      matching: 'Smart Matching',
      machines: 'Find Machines',
      payments: 'Payments',
      insights: 'Insights',
      profile: 'Profile',
      postedJobs: 'Posted Jobs',
      acceptedJobs: 'Accepted Jobs',
      completed: 'Completed',
      myPostedJobs: 'My Posted Jobs',
      noJobs: 'No jobs posted yet',
      postFirst: 'Post Your First Job',
      myRequests: 'My Machine Requests',
      location: 'Location',
      date: 'Date',
      duration: 'Duration',
      postNewWork: 'Post New Work',
      workType: 'Work Type',
      description: 'Description',
      payment: 'Payment (₹)',
      jobCategory: 'Job Category',
      smartTemplate: 'Smart Template',
      emergency: 'Emergency (Day Only)',
      bulk: 'Bulk Job Posting',
      autosplit: 'Auto-split Tasks',
      availableMachines: 'Available Machines',
      requestDetails: 'Request Details',
      selected: 'Selected',
      sendRequest: 'Send Request',
      select: 'Select',
      request: 'Request',
      profileTitle: 'My Profile',
      name: 'Name',
      roleLabel: 'Role',
      phone: 'Phone',
      village: 'Village',
      farmProfiles: 'Farm Profiles (Mock)',
      soil: 'Soil',
      irrigation: 'Irrigation',
      accessibility: 'Accessibility & Modes (Mock)',
      editFarm: 'Edit Farm Settings',
      saveFarm: 'Save Farm Settings',
      cancel: 'Cancel',
      paymentsHistory: 'Payment History (Mock)',
      expenseTracking: 'Expense Tracking by Crop',
      subsidyNote: 'Subsidy-linked payments are planned for future scope.',
      productivity: 'Farm Productivity Dashboard (Mock)',
      govtSchemes: 'Government Scheme Alerts',
      weatherAlert: 'Weather Alert (Mock)',
      aiMatch: 'AI Best Match (Mock)',
      refreshMap: 'Refresh Map Data',
      runAI: 'Run Mock AI',
      updateWeather: 'Update Weather',
      refreshInsights: 'Refresh Insights',
      refreshSchemes: 'Refresh Schemes',
      filters: 'Filters',
      mapTitle: 'Real-time Map (Mock)',
      statusPosted: 'Posted',
      statusApplied: 'Labour Applied',
      statusAgreement: 'Agreement Locked',
      statusAdvancePaid: 'Advance Paid',
      statusInProgress: 'In Progress',
      statusCompleted: 'Completed',
      statusCancelled: 'Cancelled',
      acceptedBy: 'Accepted by',
      completedJobsText: '{count} completed',
      noMachines: 'No machines available at the moment'
    },
    'తెలుగు': {
      role: 'రైతు',
      dashboard: 'డాష్‌బోర్డ్',
      post: 'పని పోస్ట్',
      matching: 'స్మార్ట్ మ్యాచ్',
      machines: 'యంత్రాలు',
      payments: 'చెల్లింపులు',
      insights: 'ఇన్సైట్స్',
      profile: 'ప్రొఫైల్',
      postedJobs: 'పోస్ట్ చేసిన పనులు',
      acceptedJobs: 'అంగీకరించిన పనులు',
      completed: 'పూర్తయినవి',
      myPostedJobs: 'నా పోస్ట్ చేసిన పనులు',
      noJobs: 'ఇంకా పనులు పోస్ట్ చేయలేదు',
      postFirst: 'మొదటి పని పోస్ట్ చేయండి',
      myRequests: 'నా యంత్ర అభ్యర్థనలు',
      location: 'స్థానం',
      date: 'తేదీ',
      duration: 'వ్యవధి',
      postNewWork: 'కొత్త పని పోస్ట్',
      workType: 'పని రకం',
      description: 'వివరణ',
      payment: 'చెల్లింపు (₹)',
      jobCategory: 'ఉద్యోగ వర్గం',
      smartTemplate: 'స్మార్ట్ టెంప్లేట్',
      emergency: 'ఎమర్జెన్సీ (రోజు మాత్రమే)',
      bulk: 'బల్క్ పోస్టింగ్',
      autosplit: 'ఆటో విడగొట్టు',
      availableMachines: 'లభ్యమైన యంత్రాలు',
      requestDetails: 'అభ్యర్థన వివరాలు',
      selected: 'ఎంచుకున్నది',
      sendRequest: 'అభ్యర్థన పంపండి',
      select: 'ఎంచుకోండి',
      request: 'అభ్యర్థన',
      profileTitle: 'నా ప్రొఫైల్',
      name: 'పేరు',
      roleLabel: 'పాత్ర',
      phone: 'ఫోన్',
      village: 'గ్రామం',
      farmProfiles: 'పొలం ప్రొఫైళ్లు (మాక్)',
      soil: 'మట్టి',
      irrigation: 'పారుదల',
      accessibility: 'అందుబాటు & మోడ్‌లు (మాక్)',
      editFarm: 'పొలం సెట్టింగ్స్ మార్చండి',
      saveFarm: 'పొలం సెట్టింగ్స్ సేవ్ చేయండి',
      cancel: 'రద్దు',
      paymentsHistory: 'చెల్లింపు చరిత్ర (మాక్)',
      expenseTracking: 'పంటల ప్రకారం ఖర్చులు',
      subsidyNote: 'సబ్సిడీ లింక్‌డ్ చెల్లింపులు భవిష్యత్తు పరిధిలో ఉన్నాయి.',
      productivity: 'ఉత్పాదకత డ్యాష్‌బోర్డ్ (మాక్)',
      govtSchemes: 'ప్రభుత్వ పథక అలర్ట్స్',
      weatherAlert: 'వాతావరణ అలర్ట్ (మాక్)',
      aiMatch: 'ఏఐ ఉత్తమ మ్యాచ్ (మాక్)',
      refreshMap: 'మ్యాప్ డేటా రిఫ్రెష్',
      runAI: 'మాక్ ఏఐ నడపండి',
      updateWeather: 'వాతావరణం అప్డేట్',
      refreshInsights: 'ఇన్సైట్స్ రిఫ్రెష్',
      refreshSchemes: 'పథకాలు రిఫ్రెష్',
      filters: 'ఫిల్టర్లు',
      mapTitle: 'రియల్-టైం మ్యాప్ (మాక్)',
      statusPosted: 'పోస్ట్ చేసినవి',
      statusApplied: 'కూలీ దరఖాస్తు చేశారు',
      statusAgreement: 'అంగీకారం లాక్ అయింది',
      statusAdvancePaid: 'అడ్వాన్స్ చెల్లించారు',
      statusInProgress: 'పని జరుగుతోంది',
      statusCompleted: 'పూర్తయింది',
      statusCancelled: 'రద్దు చేయబడింది',
      acceptedBy: 'అంగీకరించినవారు',
      completedJobsText: '{count} పూర్తయినవి',
      noMachines: 'ప్రస్తుతం యంత్రాలు లభ్యం కావు'
    },
    हिन्दी: {
      role: 'किसान',
      dashboard: 'डैशबोर्ड',
      post: 'काम पोस्ट',
      matching: 'स्मार्ट मैच',
      machines: 'मशीनें',
      payments: 'भुगतान',
      insights: 'इनसाइट्स',
      profile: 'प्रोफ़ाइल',
      postedJobs: 'पोस्ट किए गए काम',
      acceptedJobs: 'स्वीकार किए गए काम',
      completed: 'पूरा हुआ',
      myPostedJobs: 'मेरे पोस्ट किए गए काम',
      noJobs: 'अभी तक कोई काम पोस्ट नहीं किया',
      postFirst: 'पहला काम पोस्ट करें',
      myRequests: 'मेरी मशीन अनुरोध',
      location: 'स्थान',
      date: 'तारीख',
      duration: 'अवधि',
      postNewWork: 'नया काम पोस्ट करें',
      workType: 'काम का प्रकार',
      description: 'विवरण',
      payment: 'भुगतान (₹)',
      jobCategory: 'काम श्रेणी',
      smartTemplate: 'स्मार्ट टेम्पलेट',
      emergency: 'इमरजेंसी (केवल दिन)',
      bulk: 'बल्क पोस्टिंग',
      autosplit: 'ऑटो स्प्लिट',
      availableMachines: 'उपलब्ध मशीनें',
      requestDetails: 'अनुरोध विवरण',
      selected: 'चुना हुआ',
      sendRequest: 'अनुरोध भेजें',
      select: 'चुनें',
      request: 'अनुरोध',
      profileTitle: 'मेरी प्रोफ़ाइल',
      name: 'नाम',
      roleLabel: 'भूमिका',
      phone: 'फोन',
      village: 'गाँव',
      farmProfiles: 'खेत प्रोफ़ाइल (मॉक)',
      soil: 'मिट्टी',
      irrigation: 'सिंचाई',
      accessibility: 'सुविधाएँ और मोड (मॉक)',
      editFarm: 'खेत सेटिंग्स बदलें',
      saveFarm: 'खेत सेटिंग्स सेव करें',
      cancel: 'रद्द करें',
      paymentsHistory: 'भुगतान इतिहास (मॉक)',
      expenseTracking: 'फसल अनुसार खर्च',
      subsidyNote: 'सब्सिडी-लिंक्ड भुगतान भविष्य के दायरे में हैं।',
      productivity: 'उत्पादकता डैशबोर्ड (मॉक)',
      govtSchemes: 'सरकारी योजना अलर्ट',
      weatherAlert: 'मौसम अलर्ट (मॉक)',
      aiMatch: 'एआई बेस्ट मैच (मॉक)',
      refreshMap: 'मैप डेटा रिफ्रेश',
      runAI: 'मॉक एआई चलाएं',
      updateWeather: 'मौसम अपडेट',
      refreshInsights: 'इनसाइट्स रिफ्रेश',
      refreshSchemes: 'योजनाएँ रिफ्रेश',
      filters: 'फ़िल्टर',
      mapTitle: 'रियल-टाइम मैप (मॉक)',
      statusPosted: 'पोस्ट किया गया',
      statusApplied: 'श्रमिक ने आवेदन किया',
      statusAgreement: 'समझौता लॉक',
      statusAdvancePaid: 'अग्रिम भुगतान',
      statusInProgress: 'कार्य प्रगति पर',
      statusCompleted: 'पूरा हुआ',
      statusCancelled: 'रद्द किया गया',
      acceptedBy: 'स्वीकार किया',
      completedJobsText: '{count} पूरे हुए',
      noMachines: 'फिलहाल कोई मशीन उपलब्ध नहीं है'
    }
  };

  const labels = t[language as keyof typeof t] || t.English;

  const getStatusLabel = (status: string) => {
    if (status === 'posted') return labels.statusPosted;
    if (status === 'applied') return labels.statusApplied;
    if (status === 'agreement_locked' || status === 'accepted') return labels.statusAgreement;
    if (status === 'advance_paid') return labels.statusAdvancePaid;
    if (status === 'in_progress') return labels.statusInProgress;
    if (status === 'completed') return labels.statusCompleted;
    if (status === 'cancelled') return labels.statusCancelled;
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

  const saveFarmSection = () => {
    localStorage.setItem(`farmProfiles:${user.id}`, JSON.stringify(farmProfiles));
    localStorage.setItem(`accessibility:${user.id}`, JSON.stringify(accessibility));
    setIsEditingFarm(false);
  };

  return (
    <div className="min-h-screen app-shell dashboard-shell">
      {(completionJobId || completionRequestId) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Job Completion & Rating</h2>
            <p className="text-sm text-gray-600 mb-4">Upload proof photos and submit ratings to complete the job.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Before Work Photos (optional, up to 5)</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => beforeInputRef.current?.click()}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    Upload Before Photos
                  </button>
                  <span className="text-xs text-gray-500">Images only</span>
                </div>
                <input
                  ref={beforeInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={async e => setBeforePhotos(await fileListToBase64(e.target.files))}
                />
                {beforePhotos.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {beforePhotos.map((src, idx) => (
                      <img key={idx} src={src} alt="before" className="w-16 h-16 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">After Work Photos (required, 2–5)</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => afterInputRef.current?.click()}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    Upload After Photos
                  </button>
                  <span className="text-xs text-gray-500">Images only</span>
                </div>
                <input
                  ref={afterInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={async e => setAfterPhotos(await fileListToBase64(e.target.files))}
                />
                {afterPhotos.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {afterPhotos.map((src, idx) => (
                      <img key={idx} src={src} alt="after" className="w-16 h-16 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
              {completionJobId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Labour Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setLabourRating(star)}
                        className={`px-2 py-1 rounded ${labourRating >= star ? 'bg-yellow-400' : 'bg-gray-200'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={labourComment}
                    onChange={e => setLabourComment(e.target.value)}
                    className="mt-2 w-full border border-gray-300 rounded-lg p-2"
                    placeholder="Feedback (optional)"
                  />
                </div>
              )}
              {completionRequestId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Machine Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setMachineRating(star)}
                        className={`px-2 py-1 rounded ${machineRating >= star ? 'bg-yellow-400' : 'bg-gray-200'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={machineComment}
                    onChange={e => setMachineComment(e.target.value)}
                    className="mt-2 w-full border border-gray-300 rounded-lg p-2"
                    placeholder="Feedback (optional)"
                  />
                </div>
              )}
              <div className="text-xs text-gray-500">
                Tips: Upload clear photos for better records. Ratings help good workers get more jobs.
              </div>
              {photoError && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {photoError}
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setCompletionJobId(null);
                  setCompletionRequestId(null);
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveWorkProof}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Submit & Complete
              </button>
            </div>
          </div>
        </div>
      )}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Satisfaction & QR Payment</h2>
            {(() => {
              const isJob = paymentModal.type === 'job';
              const job = isJob ? jobs.find(j => j.id === paymentModal.id) : null;
              const request = !isJob ? machineRequests.find(r => r.id === paymentModal.id) : null;
              const baseAmount = isJob ? (job?.negotiatedPrice || job?.payment || 0) : getRequestBaseAmount(paymentModal.id);
              const paymentKey = getPaymentKey(paymentModal.type, paymentModal.id);
              const state = getPaymentState(paymentKey, baseAmount);
              const nextStates = { ...paymentStates, [paymentKey]: state };
              if (!paymentStates[paymentKey]) {
                savePaymentStates(nextStates);
              }
              return (
                <div className="space-y-4 text-sm">
                  <div className="border border-gray-200 rounded-lg p-3">
                    {isJob ? (
                      <p>Job: {job?.workType}</p>
                    ) : (
                      <>
                        <p>Machine: {request?.machineType}</p>
                        <p>Duration: {request?.duration}</p>
                      </>
                    )}
                    <p>Base Amount: ₹{baseAmount}</p>
                    <p>QR Ref: {state.qrRef}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Are you satisfied?</label>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={satisfaction === 'yes'}
                          onChange={() => setSatisfaction('yes')}
                        />
                        Yes, fully satisfied
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={satisfaction === 'no'}
                          onChange={() => setSatisfaction('no')}
                        />
                        No, I want to negotiate
                      </label>
                    </div>
                  </div>
                  {satisfaction === 'no' && (
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="number"
                        placeholder="Revised amount"
                        value={revisedAmount}
                        onChange={e => setRevisedAmount(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Reason (work incomplete, quality)"
                        value={revisedReason}
                        onChange={e => setRevisedReason(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Fair Payment Helper: Partial payment should be reasonable and justified.
                  </div>
                  <div className="border border-gray-200 rounded-lg p-3">
                    <p>Status: {state.negotiationStatus}</p>
                    {state.finalPayableAmount && <p>Final Payable: ₹{state.finalPayableAmount}</p>}
                    <p>Payment: {state.paymentStatus}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const next = { ...paymentStates };
                        const updated = {
                          ...state,
                          farmerSatisfaction: satisfaction === 'yes' ? 'Satisfied' : 'Not Satisfied',
                          finalPayableAmount: satisfaction === 'yes' ? baseAmount : state.finalPayableAmount,
                          revisedAmount: satisfaction === 'no' ? Number(revisedAmount || baseAmount) : null,
                          revisedReason: satisfaction === 'no' ? revisedReason : null,
                          negotiationStatus: satisfaction === 'no' ? 'pending_labour' : 'agreed'
                        };
                        next[paymentKey] = updated;
                        savePaymentStates(next);
                      }}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg"
                    >
                      Submit Decision
                    </button>
                    <button
                      onClick={() => {
                        const current = getPaymentState(paymentKey, baseAmount);
                        if (current.negotiationStatus !== 'agreed') {
                          alert('Waiting for labour acceptance of revised amount.');
                          return;
                        }
                        if (current.paymentStatus === 'paid') {
                          alert('Payment already marked as paid.');
                          return;
                        }
                        const next = { ...paymentStates };
                        next[paymentKey] = {
                          ...current,
                          paymentStatus: 'paid',
                          paidAt: Date.now()
                        };
                        savePaymentStates(next);
                        const finalAmount = current.finalPayableAmount ?? baseAmount;
                        addPaymentRecord({
                          id: `PAY-${Date.now()}`,
                          jobId: paymentKey,
                          amount: finalAmount,
                          status: 'Paid',
                          timestamp: new Date().toLocaleString(),
                          farmerId: user.id,
                          label: isJob ? job?.workType : `${request?.machineType} rental`
                        });
                      }}
                      className="px-3 py-2 border border-gray-200 rounded-lg"
                    >
                      Scan QR & Mark Paid
                    </button>
                    <button
                      onClick={() => setPaymentModal(null)}
                      className="px-3 py-2 border border-gray-200 rounded-lg"
                    >
                      Close
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
      {/* Header */}
        <header className="bg-white shadow-sm relative z-30 overflow-visible">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AgriConnect</h1>
              <p className="text-sm text-gray-600">{labels.role} Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell role="farmer" />
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
              <p className="text-sm text-gray-600">👨‍🌾 {labels.role}</p>
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

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.dashboard}
            </button>
            <button
              onClick={() => setActiveTab('post-job')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'post-job'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.post}
            </button>
            <button
              onClick={() => setActiveTab('matching')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'matching'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.matching}
            </button>
            <button
              onClick={() => setActiveTab('machines')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'machines'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.machines}
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'payments'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.payments}
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'insights'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {labels.insights}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-green-600 border-b-2 border-green-600'
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
        {flashMessage && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm ${
              flashMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {flashMessage.text}
          </div>
        )}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{labels.postedJobs}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.posted}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{labels.acceptedJobs}</p>
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
            </div>

            {/* My Jobs */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{labels.myPostedJobs}</h2>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                {autoSuggestions.map(item => (
                  <div key={item} className="border border-gray-200 rounded-lg p-3">
                    {item}
                  </div>
                ))}
              </div>
              {lastJob && (
                <button
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      workType: lastJob.workType.split(' • ')[0] || 'Ploughing',
                      jobCategory: lastJob.workType.split(' • ')[1] || 'Manual labour',
                      location: lastJob.location,
                      duration: lastJob.duration,
                      payment: String(lastJob.payment),
                      description: lastJob.description || ''
                    }));
                    setActiveTab('post-job');
                  }}
                  className="mb-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Auto-fill from last job
                </button>
              )}
              {jobs.filter(job => !['completed', 'cancelled'].includes(job.status)).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>{labels.noJobs}</p>
                  <button
                    onClick={() => setActiveTab('post-job')}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {labels.postFirst}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs
                    .filter(job => !['completed', 'cancelled'].includes(job.status))
                    .map(job => {
                    const rawPayment = paymentRecords.find(p => p.jobId === job.id) || null;
                    const payment = job.status === 'posted' || job.status === 'applied' ? null : rawPayment;
                    const agreedPrice = job.negotiatedPrice || job.payment;
                    const expectedAdvance = Math.round(agreedPrice * 0.4);
                    const advancePaid =
                      payment && ['advance_paid', 'held', 'completed', 'released'].includes(payment.status)
                        ? payment.advanceAmount || expectedAdvance
                        : 0;
                    const balancePending = payment
                      ? payment.balanceAmount ?? Math.max(agreedPrice - advancePaid, 0)
                      : Math.max(agreedPrice - expectedAdvance, 0);
                    return (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.workType}</h3>
                          <p className="text-sm text-gray-600">{job.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {getStatusLabel(job.status)}
                        </span>
                      </div>
                      <div className="mb-3 flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            payment ? getPaymentBadgeTone(payment) : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {getPaymentStatusLabel(payment)}
                        </span>
                        {payment?.status === 'completed' && (
                          <span className="text-gray-500">Balance pending — confirm completion to release</span>
                        )}
                        {!payment && <span className="text-gray-500">Payment not started</span>}
                      </div>
                      {(() => {
                        const key = `job:${job.id}`;
                        const neg = getNegotiation(key, job.payment);
                        const input = counterInputs[key] || { amount: '', reason: '' };
                        const expired = isExpired(neg);
                        return (
                          <div className="mb-3 border border-gray-200 rounded-lg p-3 text-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">Negotiation</span>
                              <span className="text-xs text-gray-500">Rounds: {neg.rounds}/3</span>
                            </div>
                            <div className="space-y-1 text-gray-700">
                              <div>Original price: ₹{neg.basePrice}</div>
                              {neg.finalPrice && <div>Final agreed: ₹{neg.finalPrice}</div>}
                            </div>
                            <div className="mt-2 space-y-2">
                              {neg.history.map((h: any, idx: number) => (
                                <div key={`${key}-${idx}`} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                  <span className="font-medium">{h.by}</span>: ₹{h.amount} {h.message ? `• ${h.message}` : ''}
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Smart tips: Similar jobs accepted at ₹650/day. High demand today – negotiation may fail.
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
                                  placeholder="Message (3 days, nearby field)"
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
                                        { by: 'Farmer', amount: Number(input.amount), message: input.reason, at: Date.now() }
                                      ],
                                      rounds: current.rounds + 1,
                                      updatedAt: Date.now()
                                    };
                                    next[key] = updated;
                                    saveNegotiations(next);
                                  }}
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg"
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
                                Lock Offer
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
                                Decline Offer
                              </button>
                              <button
                                onClick={() => alert('Reported unfair bargain (mock).')}
                                className="px-3 py-1 border border-red-200 text-red-700 rounded-lg"
                              >
                                Report Unfair
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                      {job.status === 'posted' && job.postedAt && (now - job.postedAt) > reminderThresholdHours * 60 * 60 * 1000 && (
                        <div className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                          Reminder: Job not assigned within {reminderThresholdHours} hours.
                        </div>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
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
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>₹{agreedPrice}</span>
                        </div>
                      </div>
                      {job.status === 'posted' && !job.appliedBy && (
                        <div className="mt-3 text-xs text-gray-500">
                          Waiting for labour response.
                        </div>
                      )}
                      {job.status === 'applied' && (
                        <div className="mt-3 border border-gray-200 rounded-lg p-3 text-sm">
                          <p className="text-gray-700">
                            Labour applied: <span className="font-medium">{job.appliedByName || 'Interested labour'}</span>
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              onClick={() => handleApproveApplicant(job.id)}
                              className="px-4 py-3 bg-green-600 text-white rounded-lg"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectApplicant(job.id)}
                              className="px-4 py-3 border border-gray-200 rounded-lg"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                      {job.acceptedByName && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-green-700">
                            {labels.acceptedBy}: <span className="font-medium">{job.acceptedByName}</span>
                          </p>
                          {job.labourDecision === 'pending' && job.status === 'agreement_locked' && (
                            <p className="text-xs text-gray-500 mt-1">Waiting for labour confirmation.</p>
                          )}
                        </div>
                      )}
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-700">
                        <div className="border border-gray-200 rounded-lg px-3 py-2">
                          <div className="text-gray-500">Agreed price</div>
                          <div className="font-medium">₹{agreedPrice}</div>
                        </div>
                        <div className="border border-gray-200 rounded-lg px-3 py-2">
                          <div className="text-gray-500">{advancePaid > 0 ? 'Advance paid' : 'Advance due'}</div>
                          <div className="font-medium">₹{advancePaid > 0 ? advancePaid : expectedAdvance}</div>
                        </div>
                        <div className="border border-gray-200 rounded-lg px-3 py-2">
                          <div className="text-gray-500">Balance pending</div>
                          <div className="font-medium">₹{balancePending}</div>
                        </div>
                        <div className="border border-gray-200 rounded-lg px-3 py-2">
                          <div className="text-gray-500">Payment status</div>
                          <div className="font-medium">{getPaymentStatusLabel(payment)}</div>
                        </div>
                      </div>
                      {job.status === 'agreement_locked' && payment?.status === 'pending' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              const updated = markAdvancePaid(payment.id, 'UPI');
                              if (updated) {
                                updateJobRecord(job.id, { status: 'advance_paid' });
                                refreshPayments();
                                loadData();
                                pushFlash('Advance paid successfully.');
                              }
                            }}
                            className="px-4 py-3 bg-green-600 text-white rounded-lg"
                          >
                            Pay Advance (UPI)
                          </button>
                          <button
                            onClick={() => {
                              const updated = markAdvancePaid(payment.id, 'Debit Card');
                              if (updated) {
                                updateJobRecord(job.id, { status: 'advance_paid' });
                                refreshPayments();
                                loadData();
                                pushFlash('Advance paid successfully.');
                              }
                            }}
                            className="px-4 py-3 border border-gray-200 rounded-lg"
                          >
                            Pay Advance (Card)
                          </button>
                        </div>
                      )}
                      {job.status === 'advance_paid' && (
                        <div className="mt-3 text-xs text-gray-500">
                          Advance paid. Waiting for labour to start work.
                        </div>
                      )}
                      {job.status === 'in_progress' && (
                        <div className="mt-3 text-xs text-gray-500">
                          Work in progress. Balance will be due after completion.
                        </div>
                      )}
                      {job.status === 'completed' && payment?.status === 'completed' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              const updated = markReleased(payment.id, 'UPI');
                              if (updated) {
                                refreshPayments();
                                pushFlash('Payment released to labour.');
                              }
                            }}
                            className="px-4 py-3 bg-green-600 text-white rounded-lg"
                          >
                            Pay Balance & Release
                          </button>
                        </div>
                      )}
                      {payment?.status === 'released' && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => openCompletionModal(job.id)}
                            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Complete & Rate
                          </button>
                        </div>
                      )}
                      {job.status !== 'completed' && job.status !== 'cancelled' && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleCancelJob(job.id)}
                            className="px-4 py-3 border border-red-200 text-red-700 rounded-lg"
                          >
                            Cancel Job
                          </button>
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              )}
            </div>

            {/* Machine Requests */}
            {machineRequests.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{labels.myRequests}</h2>
                <div className="space-y-3">
                  {machineRequests.map(request => {
                    const payment = paymentRecords.find(p => p.requestId === request.id) || null;
                    const machine = machines.find(m => m.id === request.machineId);
                    const qty = parseDurationQty(request.duration);
                    const rentalAmount = machine ? Math.round(machine.price * qty) : payment?.amountTotal || 0;
                    const depositAmount = payment?.depositAmount ?? machine?.deposit ?? 0;
                    const depositStatus = payment
                      ? payment.status === 'held'
                        ? 'Held'
                        : payment.status === 'completed'
                        ? 'Awaiting Refund'
                        : payment.status === 'released'
                        ? 'Refunded'
                        : payment.status === 'refunded'
                        ? 'Refunded'
                        : 'Not Paid'
                      : 'Not Paid';
                    const damageFlag = damageFlags[request.id];
                    return (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.machineType}</h3>
                          <p className="text-sm text-gray-600">{labels.location}: {request.location}</p>
                          <p className="text-sm text-gray-600">{labels.date}: {request.date} • {labels.duration}: {request.duration}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            payment ? getPaymentBadgeTone(payment) : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {getPaymentStatusLabel(payment)}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-700">
                        <div className="border border-gray-200 rounded-lg px-3 py-2">
                          <div className="text-gray-500">Rental</div>
                          <div className="font-medium">₹{rentalAmount}</div>
                        </div>
                        <div className="border border-gray-200 rounded-lg px-3 py-2">
                          <div className="text-gray-500">Deposit</div>
                          <div className="font-medium">₹{depositAmount}</div>
                        </div>
                        <div className="border border-gray-200 rounded-lg px-3 py-2">
                          <div className="text-gray-500">Deposit status</div>
                          <div className="font-medium">{depositStatus}</div>
                        </div>
                        <div className="border border-gray-200 rounded-lg px-3 py-2">
                          <div className="text-gray-500">Damage</div>
                          <div className="font-medium">{damageFlag ? 'Reported' : 'None'}</div>
                        </div>
                      </div>
                      {request.status === 'accepted' && payment?.status === 'pending' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              const updated = markMachinePaid(payment.id, 'UPI');
                              if (updated) {
                                refreshPayments();
                                pushFlash('Rental + deposit paid successfully.');
                              }
                            }}
                            className="px-4 py-3 bg-green-600 text-white rounded-lg"
                          >
                            Pay Rental + Deposit (UPI)
                          </button>
                          <button
                            onClick={() => {
                              const updated = markMachinePaid(payment.id, 'Debit Card');
                              if (updated) {
                                refreshPayments();
                                pushFlash('Rental + deposit paid successfully.');
                              }
                            }}
                            className="px-4 py-3 border border-gray-200 rounded-lg"
                          >
                            Pay via Card
                          </button>
                        </div>
                      )}
                      {request.status === 'accepted' && payment?.status === 'held' && (
                        <div className="mt-3 text-xs text-gray-500">
                          Payment held. Waiting for machine owner to complete rental.
                        </div>
                      )}
                      {request.status === 'completed' && payment?.status === 'completed' && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              const updated = markReleased(payment.id, 'UPI');
                              if (updated) {
                                refreshPayments();
                                pushFlash('Deposit refunded successfully.');
                              }
                            }}
                            className="px-4 py-3 bg-green-600 text-white rounded-lg"
                          >
                            Confirm & Refund Deposit
                          </button>
                        </div>
                      )}
                      {payment?.status === 'released' && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => openMachineCompletionModal(request.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Rate Machine
                          </button>
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Smart Alerts (Mock)</h2>
              <div className="space-y-2 text-sm text-gray-700">
                {alertItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-700">{item.text}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => setActiveTab('dashboard')}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg"
                      >
                        View Job
                      </button>
                      <button
                        onClick={() => pushFlash('Issue reported to admin.')}
                        className="px-3 py-2 border border-gray-200 rounded-lg"
                      >
                        Report Issue
                      </button>
                      <button
                        onClick={() => alert('Support: +91 90000 00000')}
                        className="px-3 py-2 border border-gray-200 rounded-lg"
                      >
                        Contact Support
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'post-job' && (
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{labels.postNewWork}</h2>
            {lastJob && (
              <button
                type="button"
                onClick={() =>
                  setFormData(prev => ({
                    ...prev,
                    workType: lastJob.workType.split(' • ')[0] || 'Ploughing',
                    jobCategory: lastJob.workType.split(' • ')[1] || 'Manual labour',
                    location: lastJob.location,
                    duration: lastJob.duration,
                    payment: String(lastJob.payment),
                    description: lastJob.description || ''
                  }))
                }
                className="mb-4 px-4 py-2 border border-green-300 text-green-700 rounded-lg"
              >
                Auto-fill from last job
              </button>
            )}
            <form onSubmit={handlePostJob} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.jobCategory}
                  </label>
                  <select
                    value={formData.jobCategory}
                    onChange={e => setFormData({ ...formData, jobCategory: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option>Manual labour</option>
                    <option>Machine only</option>
                    <option>Machine + operator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.smartTemplate}
                  </label>
                  <select
                    value={formData.jobTemplate}
                    onChange={e => setFormData({ ...formData, jobTemplate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option>Custom</option>
                    <option>Harvesting - 3 days</option>
                    <option>Ploughing - 2 days</option>
                    <option>Weeding - 1 day</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels.workType}
                </label>
                <select
                  value={formData.workType}
                  onChange={e => setFormData({ ...formData, workType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option>Ploughing</option>
                  <option>Sowing</option>
                  <option>Harvesting</option>
                  <option>Weeding</option>
                  <option>Irrigation</option>
                  <option>Pesticide Spraying</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2 days"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment (₹)
                </label>
                <input
                  type="number"
                  value={formData.payment}
                  onChange={e => setFormData({ ...formData, payment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels.description}
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Provide additional details about the work..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Photos (optional)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => postWorkInputRef.current?.click()}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    Upload Photos
                  </button>
                  <span className="text-xs text-gray-500">Images only</span>
                </div>
                <input
                  ref={postWorkInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async e => setPostWorkPhotos(await fileListToBase64(e.target.files))}
                />
                {postWorkPhotos.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {postWorkPhotos.map((src, idx) => (
                      <img key={idx} src={src} alt="work" className="w-16 h-16 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Tools Requirement</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="toolsProvidedBy"
                      checked={formData.toolsProvidedBy === 'Labour'}
                      onChange={() => setFormData({ ...formData, toolsProvidedBy: 'Labour' })}
                    />
                    Labour will bring tools
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="toolsProvidedBy"
                      checked={formData.toolsProvidedBy === 'Farmer'}
                      onChange={() => setFormData({ ...formData, toolsProvidedBy: 'Farmer' })}
                    />
                    Farmer will provide tools
                  </label>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  {formData.toolsProvidedBy === 'Labour'
                    ? 'Higher wage may be expected'
                    : 'Standard wage applicable'}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {toolOptions.map(tool => {
                    const active = formData.toolsRequired.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            toolsRequired: active
                              ? prev.toolsRequired.filter(t => t !== tool)
                              : [...prev.toolsRequired, tool]
                          }))
                        }
                        className={`px-3 py-1 rounded-full text-sm ${
                          active ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {tool}
                      </button>
                    );
                  })}
                  <input
                    type="text"
                    value={formData.customTool}
                    onChange={e => setFormData({ ...formData, customTool: e.target.value })}
                    placeholder="Other (custom)"
                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const tool = formData.customTool.trim();
                      if (!tool) return;
                      setFormData(prev => ({
                        ...prev,
                        toolsRequired: prev.toolsRequired.includes(tool)
                          ? prev.toolsRequired
                          : [...prev.toolsRequired, tool],
                        customTool: ''
                      }));
                    }}
                    className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
                  >
                    Add
                  </button>
                </div>
                {formData.jobCategory.includes('Machine') && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Machine Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {attachmentOptions.map(att => {
                        const active = formData.attachments.includes(att);
                        return (
                          <button
                            key={att}
                            type="button"
                            onClick={() =>
                              setFormData(prev => ({
                                ...prev,
                                attachments: active
                                  ? prev.attachments.filter(a => a !== att)
                                  : [...prev.attachments, att]
                              }))
                            }
                            className={`px-3 py-1 rounded-full text-sm ${
                              active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {att}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Attachment provider can be selected during negotiation (mock).</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.emergency}
                    onChange={e => setFormData({ ...formData, emergency: e.target.checked })}
                  />
                  {labels.emergency}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.bulkPosting}
                    onChange={e => setFormData({ ...formData, bulkPosting: e.target.checked })}
                  />
                  {labels.bulk}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.autoSplit}
                    onChange={e => setFormData({ ...formData, autoSplit: e.target.checked })}
                  />
                  {labels.autosplit}
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Post Job
              </button>
            </form>
          </div>
        )}

        {activeTab === 'matching' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{labels.mapTitle}</h2>
                <button
                  onClick={() => setShowFilters(prev => !prev)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"
                >
                  <Filter className="w-4 h-4" />
                  {labels.filters}
                </button>
              </div>
              {showFilters && (
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <select className="border border-gray-200 rounded-lg px-3 py-2">
                    <option>Skill level: Any</option>
                    <option>Skilled only</option>
                    <option>Verified only</option>
                  </select>
                  <select className="border border-gray-200 rounded-lg px-3 py-2">
                    <option>Price range: Any</option>
                    <option>Below ₹500/day</option>
                    <option>₹500-₹1000/day</option>
                  </select>
                  <select className="border border-gray-200 rounded-lg px-3 py-2">
                    <option>Distance: 5 km</option>
                    <option>Distance: 10 km</option>
                    <option>Distance: 20 km</option>
                  </select>
                </div>
              )}
              <div className="h-56 rounded-lg bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center text-sm text-gray-600">
                Map Placeholder + Nearby Labour & Machines
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {mapItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-gray-600">{item.detail}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  const next = Math.random() > 0.5
                    ? [
                        { id: 'm1', title: 'Labourers near Kurnool', detail: '5 workers available within 8 km' },
                        { id: 'm2', title: 'Machines nearby', detail: '1 drone sprayer available' }
                      ]
                    : [
                        { id: 'm1', title: 'Labourers near Anantapur', detail: '10 workers available within 3 km' },
                        { id: 'm2', title: 'Machines nearby', detail: '2 tractors, 2 sprayers available' }
                      ];
                  setMapItems(next);
                  persistDynamic({ mapItems: next });
                }}
                className="mt-3 text-sm text-green-700"
              >
                {labels.refreshMap}
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-gray-900">{labels.aiMatch}</h2>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {aiRecommendations.map(item => (
                  <li key={item} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  const next = Math.random() > 0.5
                    ? [
                        'Recommended: Book drone sprayer for cotton (match score 90%).',
                        'Suggested labour: 3 skilled harvesters available this weekend.',
                        'Alert: Day rates are lower tomorrow.'
                      ]
                    : [
                        'Recommended: Hire 5 labourers for paddy (match score 88%).',
                        'Suggested machine: Harvester with operator for faster completion.',
                        'Alert: Demand spike expected this weekend.'
                      ];
                  setAiRecommendations(next);
                  persistDynamic({ aiRecommendations: next });
                }}
                className="mt-3 text-sm text-green-700"
              >
                {labels.runAI}
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-2">
                <CloudRain className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">{labels.weatherAlert}</h2>
              </div>
              <p className="text-sm text-gray-700">{weatherAlert}</p>
              <button
                onClick={() => {
                  const next = Math.random() > 0.5
                    ? 'Clear skies for 3 days. Ideal window for irrigation.'
                    : 'Light rain expected tomorrow. Consider postponing spraying.';
                  setWeatherAlert(next);
                  persistDynamic({ weatherAlert: next });
                }}
                className="mt-3 text-sm text-blue-700"
              >
                {labels.updateWeather}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'machines' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{labels.availableMachines}</h2>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{labels.requestDetails}</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{labels.date}</label>
                  <input
                    type="date"
                    value={machineRequestForm.date}
                    onChange={e => setMachineRequestForm({ ...machineRequestForm, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{labels.duration}</label>
                  <input
                    type="text"
                    value={machineRequestForm.duration}
                    onChange={e => setMachineRequestForm({ ...machineRequestForm, duration: e.target.value })}
                    placeholder="e.g., 6 hours"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    {labels.selected}: <span className="font-medium">{selectedMachine ? selectedMachine.machineType : 'None'}</span>
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => handleRequestMachine(selectedMachine)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {labels.sendRequest}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">Requests are mock and use localStorage only.</p>
            </div>

            {machines.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Tractor className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">{labels.noMachines}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {machines.map(machine => (
                  <div key={machine.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-green-500 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{machine.machineType}</h3>
                        <p className="text-sm text-gray-600 mt-1">{machine.description}</p>
                      </div>
                      <Tractor className="w-8 h-8 text-green-600" />
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserIcon className="w-4 h-4" />
                        <span>{machine.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{machine.ownerVillage}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{machine.ownerPhone}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{machine.price}
                          <span className="text-sm text-gray-600 font-normal">/{machine.priceUnit}</span>
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Deposit: ₹{machine.deposit || 0}</p>
                      </div>
                      <button
                        onClick={() => setSelectedMachine(machine)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {labels.select}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{labels.paymentsHistory}</h2>
              <div className="space-y-3">
                {farmerPayments.length === 0 && (
                  <p className="text-gray-500">No payment records yet.</p>
                )}
                {farmerPayments.map(payment => (
                  <div key={payment.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {payment.flow === 'labour' ? 'Labour Payment' : 'Machine Rental'} • {payment.id}
                      </p>
                      <p className="text-sm text-gray-600">Total: ₹{payment.amountTotal}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-3 py-1 rounded-full ${getPaymentBadgeTone(payment)}`}>
                        {getPaymentStatusLabel(payment)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{labels.expenseTracking}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {expenseByCrop.map(item => (
                  <div key={item.crop} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-600">{item.crop}</p>
                    <p className="text-2xl font-bold text-gray-900">₹{item.amount}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-500">{labels.subsidyNote}</p>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Crop Planning Assistant (Mock)</h2>
              <div className="flex items-center gap-3 mb-4">
                <select
                  value={cropPlan}
                  onChange={e => setCropPlan(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option>Cotton</option>
                  <option>Paddy</option>
                  <option>Groundnut</option>
                </select>
                <span className="text-sm text-gray-600">Timeline view</span>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                {cropPlanner[cropPlan as keyof typeof cropPlanner].map(item => (
                  <div key={item.stage} className="border border-gray-200 rounded-lg p-3">
                    <p className="font-medium">{item.stage} • {item.time}</p>
                    <p>Needs: {item.needs}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Yield & Cost Simulator (Mock)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Crop</label>
                  <select
                    value={cropPlan}
                    onChange={e => setCropPlan(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option>Cotton</option>
                    <option>Paddy</option>
                    <option>Groundnut</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Land Size (acres)</label>
                  <input
                    type="number"
                    min={1}
                    value={landSize}
                    onChange={e => setLandSize(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600">Estimated Cost</p>
                  <p className="text-2xl font-bold text-gray-900">₹{estimatedCost}</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600">Expected Yield</p>
                  <p className="text-2xl font-bold text-gray-900">{expectedYield} kg</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-600">Profit Range</p>
                  <p className="text-2xl font-bold text-gray-900">₹{profitLow} - ₹{profitHigh}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{labels.productivity}</h2>
              <div className="h-40 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center text-sm text-gray-600">
                {productivityNote}
              </div>
              <button
                onClick={() => setProductivityNote('Cost vs Yield updated: 12% savings with drip irrigation.')}
                className="mt-3 text-sm text-green-700"
              >
                {labels.refreshInsights}
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{labels.govtSchemes}</h2>
              <p className="text-sm text-gray-700">{schemeAlert}</p>
              <button
                onClick={() => setSchemeAlert('Subsidy alert: 40% off for solar pump installation this month.')}
                className="mt-3 text-sm text-green-700"
              >
                {labels.refreshSchemes}
              </button>
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
                  👨‍🌾 Farmer
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  {isEditingProfile ? 'Save Profile' : 'Edit Profile'}
                </button>
                {isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 border border-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Trust Score (Mock)</h3>
                <p className="text-sm text-gray-700">
                  Score: <span className="font-medium">82</span> • Badge: <span className="font-medium text-green-700">Trusted</span>
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Bargain success rate: <span className="font-medium">78%</span>
                </p>
                <p className="text-sm text-gray-700 mt-1">Fair negotiation badge: ✅</p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{labels.farmProfiles}</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  {farmProfiles.map(profile => (
                    <div key={profile.id} className="border border-gray-200 rounded-lg p-3">
                      {isEditingFarm ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            value={profile.name}
                            onChange={e => setFarmProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, name: e.target.value } : p))}
                            className="border border-gray-300 rounded-lg px-2 py-1"
                            placeholder="Plot name"
                          />
                          <input
                            value={profile.crop}
                            onChange={e => setFarmProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, crop: e.target.value } : p))}
                            className="border border-gray-300 rounded-lg px-2 py-1"
                            placeholder="Crop type"
                          />
                          <input
                            value={profile.soil}
                            onChange={e => setFarmProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, soil: e.target.value } : p))}
                            className="border border-gray-300 rounded-lg px-2 py-1"
                            placeholder="Soil type (optional)"
                          />
                          <input
                            value={profile.irrigation}
                            onChange={e => setFarmProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, irrigation: e.target.value } : p))}
                            className="border border-gray-300 rounded-lg px-2 py-1"
                            placeholder="Irrigation type"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="font-medium">{profile.name} • {profile.crop}</p>
                          <p>{labels.soil}: {profile.soil} (optional)</p>
                          <p>{labels.irrigation}: {profile.irrigation}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {isEditingFarm && (
                  <button
                    onClick={() => setFarmProfiles(prev => ([
                      ...prev,
                      { id: Date.now().toString(), name: 'New Plot', crop: 'Crop', soil: 'Soil', irrigation: 'Irrigation' }
                    ]))}
                    className="mt-2 text-sm text-green-700"
                  >
                    + Add Farm Profile
                  </button>
                )}
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{labels.accessibility}</h3>
                {isEditingFarm ? (
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                    <label className="border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={accessibility.darkMode}
                        onChange={e => setAccessibility({ ...accessibility, darkMode: e.target.checked })}
                      />
                      Dark mode
                    </label>
                    <label className="border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={accessibility.lowData}
                        onChange={e => setAccessibility({ ...accessibility, lowData: e.target.checked })}
                      />
                      Low-data mode
                    </label>
                    <label className="border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={accessibility.voiceAssist}
                        onChange={e => setAccessibility({ ...accessibility, voiceAssist: e.target.checked })}
                      />
                      Voice assistance
                    </label>
                    <label className="border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={accessibility.elderly}
                        onChange={e => setAccessibility({ ...accessibility, elderly: e.target.checked })}
                      />
                      Elderly-friendly UI
                    </label>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                    <div className="border border-gray-200 rounded-lg p-3">Dark mode: {accessibility.darkMode ? 'On' : 'Off'}</div>
                    <div className="border border-gray-200 rounded-lg p-3">Low-data mode: {accessibility.lowData ? 'On' : 'Off'}</div>
                    <div className="border border-gray-200 rounded-lg p-3">Voice assistance: {accessibility.voiceAssist ? 'On' : 'Off'}</div>
                    <div className="border border-gray-200 rounded-lg p-3">Elderly-friendly UI: {accessibility.elderly ? 'On' : 'Off'}</div>
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => (isEditingFarm ? saveFarmSection() : setIsEditingFarm(true))}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                  >
                    {isEditingFarm ? labels.saveFarm : labels.editFarm}
                  </button>
                  {isEditingFarm && (
                    <button
                      onClick={() => setIsEditingFarm(false)}
                      className="px-4 py-2 border border-gray-200 rounded-lg"
                    >
                      {labels.cancel}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

