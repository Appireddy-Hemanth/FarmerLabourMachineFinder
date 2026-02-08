import { useMemo } from 'react';
import { useAuth } from '../state/auth';
import { filterPaymentsForUser, getPaymentBadgeTone, getPaymentStatusLabel, PaymentRecord } from '../state/payments';

export function PaymentsPage() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const payments = useMemo(() => {
    const all: PaymentRecord[] = JSON.parse(localStorage.getItem('payments') || '[]');
    return currentUser.role === 'admin' ? all : filterPaymentsForUser(all, currentUser.id);
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payments</h1>
        <p className="text-gray-600">Escrow-style tracking for labour and machine rentals.</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="space-y-3">
          {payments.map(payment => (
            <div key={payment.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900">
                  {payment.flow === 'labour' ? 'Labour Job' : 'Machine Rental'} • {payment.id}
                </p>
                <p className="text-xs text-gray-600">
                  Total: ₹{payment.amountTotal}
                  {payment.depositAmount ? ` • Deposit: ₹${payment.depositAmount}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full ${getPaymentBadgeTone(payment)}`}>
                  {getPaymentStatusLabel(payment)}
                </span>
                <span className="text-xs text-gray-500">{payment.method || 'Method: Pending'}</span>
              </div>
            </div>
          ))}
          {payments.length === 0 && (
            <div className="text-gray-600">No payment records yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
