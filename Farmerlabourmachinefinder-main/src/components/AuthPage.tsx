import { useEffect, useState } from 'react';
import { UserCircle, Phone, MapPin, Lock, Briefcase, Mail, ShieldCheck, Tractor } from 'lucide-react';
import { useAuth } from '../state/auth';

interface AuthPageProps {
  initialRole?: 'farmer' | 'labourer' | 'machine_owner' | 'admin';
}

export function AuthPage({ initialRole }: AuthPageProps) {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'farmer' | 'labourer' | 'machine_owner' | 'admin'>(initialRole || 'farmer');
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'English');
  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    village: '',
    password: '',
    aadhaarKyc: false,
    farmerType: 'Small',
    skills: [] as string[],
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!formData.phone || !formData.password) {
        setError('Please enter phone and password');
        return;
      }
      setIsSubmitting(true);
      try {
        await login({ phone: formData.phone, password: formData.password });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Login failed');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (role === 'admin') {
        setError('Admin signup is disabled');
        return;
      }
      if (!formData.name || !formData.phone || !formData.village || !formData.password) {
        setError('Please fill all required fields');
        return;
      }
      setIsSubmitting(true);
      try {
        await register({
          name: formData.name,
          phone: formData.phone,
          location: formData.village,
          role,
          password: formData.password,
          skills: role === 'labourer' ? formData.skills : undefined
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const availableSkills = ['Ploughing', 'Sowing', 'Harvesting', 'Weeding', 'Irrigation', 'Pesticide Spraying'];

  const t = {
    English: {
      title: 'AgriConnect',
      subtitle: 'Farmer–Labour & Machine Finder',
      login: 'Login',
      signup: 'Sign Up',
      selectRole: 'Select Your Role',
      fullName: 'Full Name',
      phone: 'Phone Number',
      email: 'Email (optional)',
      village: 'Village',
      password: 'Password / OTP',
      passwordNote: 'Use demo password or OTP for now.',
      aadhaar: 'Aadhaar e-KYC (Mock)',
      farmerType: 'Farmer Type',
      skills: 'Your Skills',
      newUser: 'New here? Create an account',
      existing: 'Have an account? Login'
    },
    'తెలుగు': {
      title: 'అగ్రికనెక్ట్',
      subtitle: 'రైతు-కూలీ & యంత్ర శోధకము',
      login: 'లాగిన్',
      signup: 'సైన్ అప్',
      selectRole: 'పాత్రను ఎంచుకోండి',
      fullName: 'పూర్తి పేరు',
      phone: 'ఫోన్ నంబర్',
      email: 'ఇమెయిల్ (ఐచ్ఛికం)',
      village: 'గ్రామం',
      password: 'పాస్‌వర్డ్ / OTP',
      passwordNote: 'డెమో పాస్‌వర్డ్ లేదా OTP వాడండి.',
      aadhaar: 'ఆధార్ e-KYC (మాక్)',
      farmerType: 'రైతు రకం',
      skills: 'మీ నైపుణ్యాలు',
      newUser: 'కొత్తవారా? ఖాతా సృష్టించండి',
      existing: 'ఖాతా ఉందా? లాగిన్'
    },
    हिन्दी: {
      title: 'एग्रीकनेक्ट',
      subtitle: 'किसान-श्रमिक और मशीन खोजक',
      login: 'लॉगिन',
      signup: 'साइन अप',
      selectRole: 'भूमिका चुनें',
      fullName: 'पूरा नाम',
      phone: 'फोन नंबर',
      email: 'ईमेल (वैकल्पिक)',
      village: 'गाँव',
      password: 'पासवर्ड / OTP',
      passwordNote: 'डेमो पासवर्ड या OTP इस्तेमाल करें।',
      aadhaar: 'आधार e-KYC (मॉक)',
      farmerType: 'किसान प्रकार',
      skills: 'आपकी कौशल',
      newUser: 'नया यूज़र? अकाउंट बनाएं',
      existing: 'खाता है? लॉगिन'
    }
  };

  const labels = t[language as keyof typeof t] || t.English;

  return (
    <div className="app-shell auth-shell">
      <div className="auth-grid enter-fade">
        <section className="auth-hero">
          <div className="brand-row">
            <span className="brand-mark">AgriConnect</span>
            <span className="trust-badge">Verified local network</span>
          </div>
          <h1 className="auth-title display-font">Farmer–Labour–Machine Finder</h1>
          <p className="auth-subtitle">
            A simple, fast, and trustworthy marketplace connecting farms, labour, and machines in rural regions.
          </p>
          <div className="hero-cta">
            <span className="cta-pill">Post Job</span>
            <span className="cta-pill">Find Labour</span>
            <span className="cta-pill">Book Machine</span>
          </div>
          <div className="hero-stats">
            <div className="stat-card">
              <p className="text-xs text-gray-600">Average response time</p>
              <p className="text-lg font-semibold text-gray-900">Under 2 hours</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-gray-600">Verified phone badges</p>
              <p className="text-lg font-semibold text-gray-900">Always visible</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-gray-600">Clear pricing</p>
              <p className="text-lg font-semibold text-gray-900">Daily or hourly</p>
            </div>
          </div>
          <div className="feature-grid stagger">
            <div className="feature-card">
              <MapPin className="input-icon" />
              <div>
                <p className="font-semibold text-gray-900">Nearby matching</p>
                <p className="text-xs text-gray-600">Find labour and machines within your village radius.</p>
              </div>
            </div>
            <div className="feature-card">
              <ShieldCheck className="input-icon" />
              <div>
                <p className="font-semibold text-gray-900">Trust & safety</p>
                <p className="text-xs text-gray-600">Ratings, reviews, and verification badges.</p>
              </div>
            </div>
            <div className="feature-card">
              <Tractor className="input-icon" />
              <div>
                <p className="font-semibold text-gray-900">Equipment ready</p>
                <p className="text-xs text-gray-600">Tractors, harvesters, and tools on demand.</p>
              </div>
            </div>
            <div className="feature-card">
              <Briefcase className="input-icon" />
              <div>
                <p className="font-semibold text-gray-900">Work updates</p>
                <p className="text-xs text-gray-600">Track job status from posted to completed.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-panel-top">
            <div className="text-xs text-gray-500">Language (UI only)</div>
            <div className="input-shell select-shell">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                aria-label="Select language"
              >
                <option>English</option>
                <option>తెలుగు</option>
                <option>हिन्दी</option>
              </select>
            </div>
          </div>

          <div className="panel-head">
            <div className="panel-icon">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold display-font text-gray-900">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-sm text-gray-600">{labels.subtitle}</p>
            </div>
          </div>

          <div className="toggle-group">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`toggle-button ${isLogin ? 'active' : ''}`}
            >
              {labels.login}
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`toggle-button ${!isLogin ? 'active' : ''}`}
            >
              {labels.signup}
            </button>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {labels.selectRole}
            </label>
            <div className="role-grid">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`role-option ${role === 'farmer' ? 'active' : ''}`}
              >
                <div className="text-2xl mb-1">👨‍🌾</div>
                <div className="text-xs">Farmer</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('labourer')}
                className={`role-option ${role === 'labourer' ? 'active' : ''}`}
              >
                <div className="text-2xl mb-1">👷</div>
                <div className="text-xs">Labourer</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('machine_owner')}
                className={`role-option ${role === 'machine_owner' ? 'active' : ''}`}
              >
                <div className="text-2xl mb-1">🚜</div>
                <div className="text-xs">Machine</div>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`role-option ${role === 'admin' ? 'active' : ''}`}
              >
                <div className="text-2xl mb-1">🛡️</div>
                <div className="text-xs">Admin</div>
              </button>
            </div>
            {isLogin && role === 'admin' && (
              <p className="mt-2 text-xs text-gray-500">Admin login only (signup disabled).</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            {!isLogin && role !== 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels.fullName}
                </label>
                <div className="input-shell">
                  <UserCircle className="input-icon" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder={labels.fullName}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.phone}
              </label>
              <div className="input-shell">
                <Phone className="input-icon" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9876543210"
                />
              </div>
            </div>

            {!isLogin && role !== 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels.email}
                </label>
                <div className="input-shell">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                  />
                </div>
              </div>
            )}

            {!isLogin && role !== 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels.village}
                </label>
                <div className="input-shell">
                  <MapPin className="input-icon" />
                  <input
                    type="text"
                    value={formData.village}
                    onChange={e => setFormData({ ...formData, village: e.target.value })}
                    placeholder={labels.village}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.password}
              </label>
              <div className="input-shell">
                <Lock className="input-icon" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <p className="helper-text">{labels.passwordNote}</p>
            </div>

            {!isLogin && role === 'farmer' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {labels.farmerType}
                  </label>
                  <div className="input-shell">
                    <select
                      value={formData.farmerType}
                      onChange={e => setFormData({ ...formData, farmerType: e.target.value })}
                    >
                      <option>Small</option>
                      <option>Medium</option>
                      <option>Large</option>
                    </select>
                  </div>
                </div>
                <label className="input-shell checkbox-shell">
                  <input
                    type="checkbox"
                    checked={formData.aadhaarKyc}
                    onChange={e => setFormData({ ...formData, aadhaarKyc: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">{labels.aadhaar}</span>
                </label>
              </div>
            )}

            {!isLogin && role === 'labourer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {labels.skills}
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`skill-chip ${formData.skills.includes(skill) ? 'active' : ''}`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="error-box">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="primary-btn w-full"
              disabled={isSubmitting}
            >
              {isLogin ? labels.login : labels.signup}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-gray-600">
            {isLogin ? (
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}
              >
                {labels.newUser}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                style={{ textDecoration: 'underline', textUnderlineOffset: '4px' }}
              >
                {labels.existing}
              </button>
            )}
          </div>

          {isLogin && (
            <div className="demo-card mt-6">
              <p className="text-sm text-gray-900 font-medium mb-2">Use your registered account to login.</p>
              <p className="text-xs text-gray-600">Demo credentials are removed in production mode.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}




