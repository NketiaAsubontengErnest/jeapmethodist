import { apiFetch } from '@/lib/api-client';
import type { PaginatedResult } from './users';

export interface SermonItem {
  id: string;
  title: string;
  slug: string;
  speaker: string;
  date: string;
  scripture: string | null;
  description: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  pdfUrl: string | null;
  thumbnailUrl: string | null;
  tags: string | null;
  isPublished: boolean;
}

export interface SermonInput {
  title: string;
  speaker: string;
  date: string;
  scripture?: string;
  description?: string;
  videoUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  thumbnailUrl?: string;
  tags?: string;
  isPublished?: boolean;
}

export function fetchSermonsAdmin(params: { page?: number; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.search) query.set('search', params.search);
  return apiFetch<PaginatedResult<SermonItem>>(`/sermons/admin?${query.toString()}`);
}

export function createSermon(input: SermonInput) {
  return apiFetch<SermonItem>('/sermons', { method: 'POST', body: JSON.stringify(input) });
}

export function updateSermon(id: string, input: Partial<SermonInput>) {
  return apiFetch<SermonItem>(`/sermons/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteSermon(id: string) {
  return apiFetch<{ message: string }>(`/sermons/${id}`, { method: 'DELETE' });
}
