import { apiFetch } from '@/lib/api-client';
import type { PaginatedResult } from './users';
import type { MediaItem } from './media';

export interface AlbumItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { photos: number };
  photos?: MediaItem[];
}

export function fetchAlbums(params: { page?: number; pageSize?: number } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  return apiFetch<PaginatedResult<AlbumItem>>(`/albums?${query.toString()}`);
}

export function fetchAlbumById(id: string) {
  return apiFetch<AlbumItem>(`/albums/${id}`);
}

export function createAlbum(data: { title: string; description?: string; coverUrl?: string }) {
  return apiFetch<AlbumItem>('/albums', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateAlbum(id: string, data: { title?: string; description?: string; coverUrl?: string }) {
  return apiFetch<AlbumItem>(`/albums/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteAlbum(id: string) {
  return apiFetch<{ message: string }>(`/albums/${id}`, {
    method: 'DELETE',
  });
}
