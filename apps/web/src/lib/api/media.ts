import { apiFetch, API_URL, getAccessToken, ApiError } from '@/lib/api-client';
import type { PaginatedResult } from './users';
import type { AlbumItem } from './albums';

export type MediaType = 'PHOTO' | 'VIDEO' | 'LIVE_VIDEO';

export interface MediaItem {
  id: string;
  filename: string;
  storedName?: string;
  url: string;
  mimeType: string;
  size: number;
  category: string | null;
  type: MediaType;
  title: string | null;
  description: string | null;
  externalUrl: string | null;
  platform: string | null;
  embedId: string | null;
  albumId: string | null;
  album?: { id: string; title: string; slug?: string } | null;
  createdAt: string;
  uploadedBy?: { firstName: string; lastName: string } | null;
}

export function fetchMediaAdmin(params: {
  page?: number;
  pageSize?: number;
  category?: string;
  type?: MediaType;
  albumId?: string;
} = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  if (params.category) query.set('category', params.category);
  if (params.type) query.set('type', params.type);
  if (params.albumId) query.set('albumId', params.albumId);
  return apiFetch<PaginatedResult<MediaItem>>(`/media/admin?${query.toString()}`);
}

export function fetchPublicGallery(params: { type?: MediaType; albumId?: string; limit?: number } = {}) {
  const query = new URLSearchParams();
  if (params.type) query.set('type', params.type);
  if (params.albumId) query.set('albumId', params.albumId);
  if (params.limit) query.set('limit', String(params.limit));
  return apiFetch<{ items: MediaItem[]; albums: AlbumItem[] }>(`/media/public/gallery?${query.toString()}`);
}

export async function uploadMedia(file: File, data?: { category?: string; title?: string; description?: string; albumId?: string }) {
  const formData = new FormData();
  formData.append('file', file);
  if (data?.category) formData.append('category', data.category);
  if (data?.title) formData.append('title', data.title);
  if (data?.description) formData.append('description', data.description);
  if (data?.albumId) formData.append('albumId', data.albumId);

  const accessToken = getAccessToken();
  const response = await fetch(`${API_URL}/media`, {
    method: 'POST',
    credentials: 'include',
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    body: formData,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json() : undefined;

  if (!response.ok) {
    const message = (body && (body.message as string | string[])) || response.statusText;
    throw new ApiError(Array.isArray(message) ? message.join(', ') : message, response.status);
  }

  return body as MediaItem;
}

export function createVideoPost(data: {
  title: string;
  description?: string;
  type: 'VIDEO' | 'LIVE_VIDEO';
  videoUrlOrId: string;
  category?: string;
}) {
  return apiFetch<MediaItem>('/media/video-post', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateMedia(id: string, data: { title?: string; description?: string; category?: string; albumId?: string }) {
  return apiFetch<MediaItem>(`/media/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteMedia(id: string) {
  return apiFetch<{ message: string }>(`/media/${id}`, { method: 'DELETE' });
}

