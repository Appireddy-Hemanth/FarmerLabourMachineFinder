import { Job, Machine, MachineRequest } from '../App';

export type PaymentFlow = 'labour' | 'machine';
export type PaymentStatus =
  | 'pending'
  | 'advance_paid'
  | 'held'
  | 'completed'
  | 'released'
  | 'refunded';

export type PaymentMethod = 'UPI' | 'Debit Card' | 'Credit Card' | 'Wallet' | 'Cash';

export interface PaymentRecord {
  id: string;
  flow: PaymentFlow;
  jobId?: string;
  requestId?: string;
  farmerId: string;
  labourerId?: string;
  machineOwnerId?: string;
  amountTotal: number;
  advanceAmount?: number;
  balanceAmount?: number;
  depositAmount?: number;
  method?: PaymentMethod;
  status: PaymentStatus;
  createdAt: number;
  updatedAt: number;
  history: Array<{ at: number; label: string }>;
}

const STORAGE_KEY = 'payments';

const parseDurationQty = (duration: string) => {
  if (!duration) return 1;
  const match = duration.match(/(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : 1;
};

export const getPayments = (): PaymentRecord[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
};

export const savePayments = (payments: PaymentRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
};

export const findPaymentByJob = (jobId: string) => {
  return getPayments().find(p => p.jobId === jobId);
};

export const findPaymentByRequest = (requestId: string) => {
  return getPayments().find(p => p.requestId === requestId);
};

const upsertPayment = (record: PaymentRecord) => {
  const payments = getPayments();
  const idx = payments.findIndex(p => p.id === record.id);
  if (idx === -1) {
    payments.unshift(record);
  } else {
    payments[idx] = record;
  }
  savePayments(payments);
  return record;
};

export const ensureLabourPayment = (job: Job, labourerId: string, advancePct = 0.4) => {
  const existing = findPaymentByJob(job.id);
  if (existing) return existing;
  const total = Number(job.negotiatedPrice || job.payment || 0);
  const advance = Math.round(total * advancePct);
  const balance = Math.max(total - advance, 0);
  const now = Date.now();
  const record: PaymentRecord = {
    id: `PAY-L-${job.id}`,
    flow: 'labour',
    jobId: job.id,
    farmerId: job.farmerId,
    labourerId,
    amountTotal: total,
    advanceAmount: advance,
    balanceAmount: balance,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    history: [{ at: now, label: 'Payment request created' }]
  };
  return upsertPayment(record);
};

export const ensureMachinePayment = (request: MachineRequest, machine: Machine, depositPct = 0.2) => {
  const existing = findPaymentByRequest(request.id);
  if (existing) return existing;
  const qty = parseDurationQty(request.duration);
  const rental = Math.round(machine.price * qty);
  const deposit = Math.round((machine.deposit || rental * depositPct));
  const now = Date.now();
  const record: PaymentRecord = {
    id: `PAY-M-${request.id}`,
    flow: 'machine',
    requestId: request.id,
    farmerId: request.farmerId,
    machineOwnerId: request.ownerId,
    amountTotal: rental,
    depositAmount: deposit,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    history: [{ at: now, label: 'Machine payment request created' }]
  };
  return upsertPayment(record);
};

const updatePayment = (id: string, patch: Partial<PaymentRecord>, label: string) => {
  const payments = getPayments();
  const idx = payments.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const now = Date.now();
  const next = {
    ...payments[idx],
    ...patch,
    updatedAt: now,
    history: [{ at: now, label }, ...payments[idx].history]
  };
  payments[idx] = next;
  savePayments(payments);
  return next;
};

export const markAdvancePaid = (paymentId: string, method: PaymentMethod = 'UPI') =>
  updatePayment(paymentId, { status: 'advance_paid', method }, `Advance paid via ${method}`);

export const markWorkStarted = (paymentId: string) =>
  updatePayment(paymentId, { status: 'held' }, 'Work started. Payment held in escrow.');

export const markWorkCompleted = (paymentId: string) =>
  updatePayment(paymentId, { status: 'completed' }, 'Work marked as completed. Balance pending.');

export const markReleased = (paymentId: string, method?: PaymentMethod) =>
  updatePayment(paymentId, { status: 'released', method }, 'Payment released.');

export const markRefunded = (paymentId: string) =>
  updatePayment(paymentId, { status: 'refunded' }, 'Payment refunded.');

export const markMachinePaid = (paymentId: string, method: PaymentMethod = 'UPI') =>
  updatePayment(paymentId, { status: 'held', method }, `Rental + deposit paid via ${method}.`);

export const getPaymentStatusLabel = (payment: PaymentRecord | null) => {
  if (!payment) return 'Not started';
  if (payment.flow === 'labour') {
    switch (payment.status) {
      case 'pending':
        return 'Pending';
      case 'advance_paid':
        return 'Advance Paid';
      case 'held':
        return 'Work In Progress';
      case 'completed':
        return 'Balance Pending';
      case 'released':
        return 'Payment Completed';
      case 'refunded':
        return 'Refunded';
      default:
        return 'Pending';
    }
  }
  switch (payment.status) {
    case 'pending':
      return 'Pending';
    case 'held':
      return 'Rental Paid • Deposit Held';
    case 'completed':
      return 'Completed';
    case 'released':
      return 'Deposit Refunded';
    case 'refunded':
      return 'Refunded';
    default:
      return 'Pending';
  }
};

export const getPaymentBadgeTone = (payment: PaymentRecord | null) => {
  const status = payment?.status || 'pending';
  switch (status) {
    case 'advance_paid':
      return 'bg-blue-100 text-blue-800';
    case 'held':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-orange-100 text-orange-800';
    case 'released':
      return 'bg-green-100 text-green-800';
    case 'refunded':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const filterPaymentsForUser = (payments: PaymentRecord[], userId: string) => {
  return payments.filter(
    p =>
      p.farmerId === userId ||
      p.labourerId === userId ||
      p.machineOwnerId === userId
  );
};
