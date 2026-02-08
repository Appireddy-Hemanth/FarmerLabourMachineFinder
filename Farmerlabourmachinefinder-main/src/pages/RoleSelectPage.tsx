import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../state/auth';

const roles = [
  { id: 'farmer', label: 'Farmer', emoji: '👨‍🌾', desc: 'Post farm work and hire labour or machines.' },
  { id: 'labourer', label: 'Labour', emoji: '👷', desc: 'Find jobs and track earnings.' },
  { id: 'machine_owner', label: 'Machine Owner', emoji: '🚜', desc: 'Rent out tractors and equipment.' },
  { id: 'admin', label: 'Admin', emoji: '🛡️', desc: 'Monitor users, jobs, payments.' }
] as const;

export function RoleSelectPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setSelectedRole } = useAuth();

  useEffect(() => {
    const role = params.get('role');
    if (role) {
      setSelectedRole(role as any);
    }
  }, [params, setSelectedRole]);

  const selectRole = (role: string) => {
    setSelectedRole(role as any);
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold display-font text-gray-900">Choose your role</h1>
        <p className="text-gray-600">Role selection controls your dashboard access.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => selectRole(role.id)}
            className="text-left bg-white border border-gray-200 rounded-lg p-6 hover:border-green-500 transition"
          >
            <div className="text-3xl">{role.emoji}</div>
            <p className="mt-3 font-semibold text-gray-900">{role.label}</p>
            <p className="text-sm text-gray-600 mt-1">{role.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}


