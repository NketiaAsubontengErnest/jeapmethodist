import { apiFetch } from '@/lib/api-client';
import type { PaginatedResult } from './users';

export interface EventListItem {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  location: string | null;
  organizer: string | null;
  isRegistrationRequired: boolean;
  registrationLimit: number | null;
  isPublished: boolean;
  ministry: { id: string; name: string } | null;
}

export interface EventDetail extends EventListItem {
  description: string | null;
  endTime: string | null;
  bannerImageUrl: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  ministryId: string | null;
}

export interface EventInput {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  organizer?: string;
  bannerImageUrl?: string;
  ministryId?: string;
  isRegistrationRequired?: boolean;
  registrationLimit?: number;
  contactPhone?: string;
  contactEmail?: string;
  isPublished?: boolean;
}

export function fetchEvents(params: { page?: number; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.search) query.set('search', params.search);
  return apiFetch<PaginatedResult<EventListItem>>(`/events/admin?${query.toString()}`);
}

export function fetchEvent(id: string) {
  return apiFetch<EventDetail>(`/events/admin/${id}`);
}

export function createEvent(input: EventInput) {
  return apiFetch<EventDetail>('/events', { method: 'POST', body: JSON.stringify(input) });
}

export function updateEvent(id: string, input: Partial<EventInput>) {
  return apiFetch<EventDetail>(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteEvent(id: string) {
  return apiFetch<{ message: string }>(`/events/${id}`, { method: 'DELETE' });
}
