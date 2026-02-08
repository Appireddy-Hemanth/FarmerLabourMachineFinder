import { apiRequest } from './api';

export async function listMachines(params?: { radiusKm?: number; lat?: number; lng?: number }) {
  const query = new URLSearchParams();
  if (params?.radiusKm) query.set('radiusKm', String(params.radiusKm));
  if (params?.lat != null) query.set('lat', String(params.lat));
  if (params?.lng != null) query.set('lng', String(params.lng));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiRequest<{ machines: any[] }>(`/machines${suffix}`);
}

export async function getMachineCalendar(id: string) {
  return apiRequest<{ bookings: any[] }>(`/machines/${id}/calendar`);
}

export async function bookMachine(id: string, payload: { date: string; duration: string }) {
  return apiRequest<{ message: string }>(`/machines/${id}/book`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
