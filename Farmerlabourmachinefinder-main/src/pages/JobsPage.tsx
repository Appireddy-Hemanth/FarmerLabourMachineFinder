import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../App';
import { useAuth } from '../state/auth';
import { findPaymentByJob, getPaymentBadgeTone, getPaymentStatusLabel } from '../state/payments';

export function JobsPage() {
  const { currentUser } = useAuth();

  const jobs = useMemo(() => {
    const all: Job[] = JSON.parse(localStorage.getItem('jobs') || '[]');
    if (!currentUser) return [];
    if (currentUser.role === 'farmer') {
      return all.filter(job => job.farmerId === currentUser.id);
    }
    if (currentUser.role === 'labourer') {
      return all.filter(
        job => job.status === 'posted' || job.appliedBy === currentUser.id || job.acceptedBy === currentUser.id
      );
    }
    return [];
  }, [currentUser]);

  const statusLabel = (status: Job['status']) => {
    switch (status) {
      case 'posted':
        return 'Posted';
      case 'applied':
        return 'Labour Applied';
      case 'agreement_locked':
        return 'Agreement Locked';
      case 'advance_paid':
        return 'Advance Paid';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (!currentUser) return null;

  if (currentUser.role === 'machine_owner') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Jobs</h1>
        <p className="text-gray-600">Machine owners manage bookings from the Machine dashboard.</p>
        <Link to="/machine" className="mt-4 flex px-4 py-2 bg-green-600 text-white rounded-lg">
          Go to Machine Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Jobs</h1>
        <p className="text-gray-600">
          {currentUser.role === 'farmer'
            ? 'Track job status, payments, and completion.'
            : 'Browse nearby work and track your accepted jobs.'}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map(job => {
          const payment = findPaymentByJob(job.id) || null;
          return (
            <div key={job.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">{job.workType}</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                  {statusLabel(job.status)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{job.description}</p>
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <div>Location: {job.location}</div>
                <div>Date: {job.date} • Duration: {job.duration}</div>
                <div>Budget: ₹{job.payment}</div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs px-3 py-1 rounded-full ${getPaymentBadgeTone(payment)}`}>
                  {getPaymentStatusLabel(payment)}
                </span>
                {currentUser.role === 'farmer' ? (
                  <Link to="/farmer" className="text-sm text-green-700 font-medium">
                    Open Dashboard
                  </Link>
                ) : (
                  <Link to="/labour/dashboard" className="text-sm text-green-700 font-medium">
                    Open Dashboard
                  </Link>
                )}
              </div>
            </div>
          );
        })}
        {jobs.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-gray-600">
            No jobs available yet.
          </div>
        )}
      </div>
    </div>
  );
}


