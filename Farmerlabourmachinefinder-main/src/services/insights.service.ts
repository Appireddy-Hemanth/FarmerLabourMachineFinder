import { apiRequest } from './api';

export async function getJobSummary() {
  return apiRequest<{ summary: { _id: string; count: number }[] }>('/insights/job-summary');
}

export async function getCostTrends() {
  return apiRequest<{ trends: { _id: number; total: number; count: number }[] }>('/insights/cost-trends');
}
