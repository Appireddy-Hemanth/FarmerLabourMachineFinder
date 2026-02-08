import { apiRequest } from './api';

export async function initiatePayment(payload: {
  amountBase: number;
  platformFee: number;
  tax: number;
  jobId?: string;
  requestId?: string;
}) {
  return apiRequest<{ payment: any }>('/payments/initiate', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getPaymentHistory() {
  return apiRequest<{ payments: any[] }>('/payments/history');
}

export async function getPayment(id: string) {
  return apiRequest<{ payment: any }>(`/payments/${id}`);
}

export async function updatePaymentStatus(id: string, status: 'PENDING' | 'ESCROW' | 'PAID' | 'FAILED' | 'REFUNDED') {
  return apiRequest<{ payment: any }>(`/payments/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}

export function getInvoiceUrl(id: string) {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${base}/payments/${id}/invoice`;
}
