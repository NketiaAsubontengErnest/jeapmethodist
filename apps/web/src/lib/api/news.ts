import { apiFetch } from '@/lib/api-client';
import type { PaginatedResult } from './users';

export interface NewsListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  publishedAt: string | null;
  isPublished: boolean;
  createdAt: string;
}

export interface NewsDetail extends NewsListItem {
  content: string;
}

export interface NewsInput {
  title: string;
  excerpt?: string;
  content: string;
  featuredImageUrl?: string;
  publishedAt?: string;
  isPublished?: boolean;
}

export function fetchNewsAdmin(params: { page?: number; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.search) query.set('search', params.search);
  return apiFetch<PaginatedResult<NewsListItem>>(`/news/admin?${query.toString()}`);
}

export function fetchNewsArticle(id: string) {
  return apiFetch<NewsDetail>(`/news/admin/${id}`);
}

export function createNewsArticle(input: NewsInput) {
  return apiFetch<NewsDetail>('/news', { method: 'POST', body: JSON.stringify(input) });
}

export function updateNewsArticle(id: string, input: Partial<NewsInput>) {
  return apiFetch<NewsDetail>(`/news/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteNewsArticle(id: string) {
  return apiFetch<{ message: string }>(`/news/${id}`, { method: 'DELETE' });
}
