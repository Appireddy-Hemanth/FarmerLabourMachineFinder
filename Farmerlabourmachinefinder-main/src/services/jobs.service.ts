import { apiRequest } from './api';

export interface JobPayload {
  title: string;
  workType: string;
  category: string;
  location: string;
  date: string;
  duration: string;
  payment: number;
  description?: string;
  toolsProvidedBy?: 'Labour' | 'Farmer' | 'Machine Owner';
  toolsRequired?: string[];
  expiryAt?: string;
}

export async function createJob(payload: JobPayload) {
  return apiRequest<{ job: any }>('/jobs', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getMyJobs() {
  return apiRequest<{ jobs: any[] }>('/jobs/my');
}

export async function getJobStats() {
  return apiRequest<{ counts: Record<string, number> }>('/jobs/stats');
}

export async function updateJobStatus(id: string, status: 'OPEN' | 'NEGOTIATION' | 'ASSIGNED' | 'COMPLETED') {
  return apiRequest<{ job: any }>(`/jobs/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}

export async function repostJob(id: string) {
  return apiRequest<{ job: any }>(`/jobs/${id}/repost`, { method: 'POST' });
}
