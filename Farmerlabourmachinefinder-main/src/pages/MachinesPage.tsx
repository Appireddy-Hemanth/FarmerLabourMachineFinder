import { Link } from 'react-router-dom';
import { Machine } from '../App';
import { useAuth } from '../state/auth';

export function MachinesPage() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const machines: Machine[] = JSON.parse(localStorage.getItem('machines') || '[]');
  const filtered =
    currentUser.role === 'machine_owner'
      ? machines.filter(m => m.ownerId === currentUser.id)
      : machines.filter(m => m.availability);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Machines</h1>
        <p className="text-gray-600">
          {currentUser.role === 'machine_owner'
            ? 'Manage your listed machines and rental requests.'
            : 'Browse machines available for rent with deposit protection.'}
        </p>
        <Link
          to={currentUser.role === 'machine_owner' ? '/machine' : '/farmer'}
          className="mt-4 flex px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Open Dashboard
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(machine => (
          <div key={machine.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900">{machine.machineType}</h2>
            <p className="text-sm text-gray-600 mt-1">{machine.description}</p>
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <div>Owner: {machine.ownerName}</div>
              <div>Village: {machine.ownerVillage}</div>
              <div>Rent: ₹{machine.price}/{machine.priceUnit}</div>
              <div>Deposit: ₹{machine.deposit || 0}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-gray-600">
            No machines available yet.
          </div>
        )}
      </div>
    </div>
  );
}


