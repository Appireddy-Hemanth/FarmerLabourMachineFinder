import { Link } from 'react-router-dom';
import { useAuth } from '../state/auth';

export function ProfilePage() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const dashboardLink =
    currentUser.role === 'farmer'
      ? '/farmer'
      : currentUser.role === 'labourer'
      ? '/labour/dashboard'
      : currentUser.role === 'machine_owner'
      ? '/machine'
      : '/admin';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
      <p className="text-gray-600">Basic profile details and verification status.</p>
      <div className="mt-4 space-y-2 text-sm text-gray-700">
        <div>Name: {currentUser.name}</div>
        <div>Role: {currentUser.role}</div>
        <div>Phone: {currentUser.phone}</div>
        <div>Village: {currentUser.village}</div>
        {currentUser.email && <div>Email: {currentUser.email}</div>}
        {currentUser.role === 'labourer' && (
          <>
            <div>Daily wage: ₹{currentUser.dailyWage || 0}</div>
            <div>Availability: {currentUser.availability ? 'Available' : 'Unavailable'}</div>
          </>
        )}
      </div>
      <div className="mt-4 text-xs text-green-700">Verified Phone Badge</div>
      <Link to={dashboardLink} className="mt-4 flex px-4 py-2 bg-green-600 text-white rounded-lg">
        Manage Profile in Dashboard
      </Link>
    </div>
  );
}


