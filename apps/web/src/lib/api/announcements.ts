import { apiFetch } from '@/lib/api-client';
import type { PaginatedResult } from './users';

export type AnnouncementPriority = 'NORMAL' | 'URGENT';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  isPublished: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementInput {
  title: string;
  message: string;
  priority?: AnnouncementPriority;
  isPublished?: boolean;
  expiresAt?: string;
}

export function fetchAnnouncementsAdmin(params: { page?: number; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.search) query.set('search', params.search);
  return apiFetch<PaginatedResult<Announcement>>(`/announcements/admin?${query.toString()}`);
}

export function createAnnouncement(input: AnnouncementInput) {
  return apiFetch<Announcement>('/announcements', { method: 'POST', body: JSON.stringify(input) });
}

export function updateAnnouncement(id: string, input: Partial<AnnouncementInput>) {
  return apiFetch<Announcement>(`/announcements/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteAnnouncement(id: string) {
  return apiFetch<{ message: string }>(`/announcements/${id}`, { method: 'DELETE' });
}
