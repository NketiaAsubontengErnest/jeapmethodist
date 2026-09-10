import { apiFetch } from '@/lib/api-client';

export type PrayerRequestStatus = 'NEW' | 'CONTACTED' | 'PRAYED_FOR' | 'ARCHIVED';

export interface PrayerRequest {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  request: string;
  isAnonymous: boolean;
  status: PrayerRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export function fetchPrayerRequests() {
  return apiFetch<PrayerRequest[]>('/prayer-requests');
}

export function updatePrayerRequestStatus(id: string, status: PrayerRequestStatus) {
  return apiFetch<PrayerRequest>(`/prayer-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
