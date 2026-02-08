import { useState } from 'react';
import { User } from '../App';
import { UserCircle, Phone, MapPin, Lock, Briefcase } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'farmer' | 'labourer' | 'machine_owner' | 'admin'>('farmer');
  const [language, setLanguage] = useState('English');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
    password: '',
    aadhaarKyc: false,
    farmerType: 'Small',
    skills: [] as string[],
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');

    if (isLogin) {
      // Login logic
      const user = users.find(
        u => u.phone === formData.phone && u.password === formData.password
      );

      if (user) {
        onLogin(user);
      } else {
        setError('Invalid phone number or password');
      }
    } else {
      // Signup logic
      if (role === 'admin') {
        setError('Admin signup is disabled');
        return;
      }
      if (!formData.name || !formData.phone || !formData.village || !formData.password) {
        setError('Please fill all required fields');
        return;
      }

      const existingUser = users.find(u => u.phone === formData.phone);
      if (existingUser) {
        setError('Phone number already registered');
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        role: role,
        phone: formData.phone,
        village: formData.village,
        password: formData.password,
        skills: role === 'labourer' ? formData.skills : undefined,
        machines: role === 'machine_owner' ? [] : undefined,
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      onLogin(newUser);
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
      subtitle: 'Farmer-Labour & Machine Finder',
      login: 'Login',
      signup: 'Sign Up',
      selectRole: 'Select Your Role',
      fullName: 'Full Name',
      phone: 'Phone Number',
      village: 'Village',
      password: 'Password',
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
      village: 'గ్రామం',
      password: 'పాస్‌వర్డ్',
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
      village: 'गाँव',
      password: 'पासवर्ड',
      aadhaar: 'आधार e-KYC (मॉक)',
      farmerType: 'किसान प्रकार',
      skills: 'आपकी कौशल',
      newUser: 'नया यूज़र? अकाउंट बनाएं',
      existing: 'खाता है? लॉगिन'
    }
  };

  const labels = t[language as keyof typeof t] || t.English;

  const fillDemo = (phone: string, password: string) => {
    setIsLogin(true);
    setFormData(prev => ({ ...prev, phone, password }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs text-gray-500">Language (UI only)</div>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1"
          >
            <option>English</option>
            <option>తెలుగు</option>
            <option>हिन्दी</option>
          </select>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{labels.title}</h1>
          <p className="text-gray-600 mt-2">{labels.subtitle}</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              isLogin ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {labels.login}
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              !isLogin ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {labels.signup}
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {labels.selectRole}
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={`p-3 rounded-lg border-2 transition-all ${
                role === 'farmer'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">👨‍🌾</div>
              <div className="text-xs">Farmer</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('labourer')}
              className={`p-3 rounded-lg border-2 transition-all ${
                role === 'labourer'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">👷</div>
              <div className="text-xs">Labourer</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('machine_owner')}
              className={`p-3 rounded-lg border-2 transition-all ${
                role === 'machine_owner'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">🚜</div>
              <div className="text-xs">Machine</div>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`p-3 rounded-lg border-2 transition-all ${
                role === 'admin'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">🛡️</div>
              <div className="text-xs">Admin</div>
            </button>
          </div>
          {isLogin && role === 'admin' && (
            <p className="mt-2 text-xs text-gray-500">Admin login only (signup disabled).</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && role !== 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.fullName}
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={labels.fullName}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.phone}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="9876543210"
              />
            </div>
          </div>

          {!isLogin && role !== 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {labels.village}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.village}
                  onChange={e => setFormData({ ...formData, village: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={labels.village}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {labels.password}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
          </div>

          {!isLogin && role === 'farmer' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {labels.farmerType}
                </label>
                <select
                  value={formData.farmerType}
                  onChange={e => setFormData({ ...formData, farmerType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option>Small</option>
                  <option>Medium</option>
                  <option>Large</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.aadhaarKyc}
                  onChange={e => setFormData({ ...formData, aadhaarKyc: e.target.checked })}
                />
                <span className="text-sm text-gray-700">{labels.aadhaar}</span>
              </div>
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
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.skills.includes(skill)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            {isLogin ? labels.login : labels.signup}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-gray-600">
          {isLogin ? labels.newUser : labels.existing}
        </div>

        {isLogin && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 font-medium mb-2">Demo Accounts:</p>
            <div className="text-xs text-blue-800 space-y-1">
              <p>Farmer: 9876543210 / farmer123</p>
              <p>Labourer: 9876543211 / labourer123</p>
              <p>Machine: 9876543213 / machine123</p>
              <p>Admin: 9000000000 / admin123</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo('9876543210', 'farmer123')}
                className="px-2 py-1 rounded-lg border border-blue-200 bg-white"
              >
                Quick Farmer Login
              </button>
              <button
                type="button"
                onClick={() => fillDemo('9876543211', 'labourer123')}
                className="px-2 py-1 rounded-lg border border-blue-200 bg-white"
              >
                Quick Labour Login
              </button>
              <button
                type="button"
                onClick={() => fillDemo('9876543213', 'machine123')}
                className="px-2 py-1 rounded-lg border border-blue-200 bg-white"
              >
                Quick Machine Login
              </button>
              <button
                type="button"
                onClick={() => fillDemo('9000000000', 'admin123')}
                className="px-2 py-1 rounded-lg border border-blue-200 bg-white"
              >
                Quick Admin Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
