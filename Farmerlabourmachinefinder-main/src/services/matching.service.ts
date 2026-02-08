import { apiRequest } from './api';

export async function getMatches(jobId: string) {
  return apiRequest<{ suggestions: any[] }>(`/matching/${jobId}`);
}
