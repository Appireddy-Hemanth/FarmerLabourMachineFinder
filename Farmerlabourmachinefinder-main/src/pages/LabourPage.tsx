import { Link } from 'react-router-dom';
import { User } from '../App';
import { useAuth } from '../state/auth';

export function LabourPage() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  if (currentUser.role === 'labourer') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Labour Profile</h1>
        <p className="text-gray-600">Manage skills, availability, and job requests from your dashboard.</p>
        <div className="mt-4 text-sm text-gray-700 space-y-1">
          <div>Name: {currentUser.name}</div>
          <div>Phone: {currentUser.phone}</div>
          <div>Village: {currentUser.village}</div>
        </div>
        <Link to="/labour/dashboard" className="mt-4 flex px-4 py-2 bg-green-600 text-white rounded-lg">
          Go to Labour Dashboard
        </Link>
      </div>
    );
  }

  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const labourers = users.filter(u => u.role === 'labourer');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Available Labour</h1>
        <p className="text-gray-600">Browse verified labour profiles and request help.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {labourers.map(labourer => (
          <div key={labourer.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900">{labourer.name}</h2>
            <p className="text-sm text-gray-600 mt-1">{labourer.village}</p>
            <div className="mt-3 text-sm text-gray-600">
              Skills: {(labourer.skills || []).join(', ') || 'General farm work'}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Daily wage: ₹{labourer.dailyWage || 0}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Availability: {labourer.availability ? 'Available' : 'Unavailable'}
            </div>
            <div className="mt-3 text-xs text-green-700">Verified Phone</div>
          </div>
        ))}
        {labourers.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-gray-600">
            No labour profiles yet.
          </div>
        )}
      </div>
    </div>
  );
}


