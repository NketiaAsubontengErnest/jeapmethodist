import { apiClient } from '../api-client';

export interface PublicSettings {
  church_name?: string;
  society_name?: string;
  slogan?: string;
  tagline?: string;
  logo_url?: string;
  favicon_url?: string;
  hero_title?: string;
  hero_subtitle?: string;
  address?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  secretariat_hours?: string;
  sunday_service_1?: string;
  sunday_service_2?: string;
  midweek_service?: string;
  sunday_service_times?: string;
  midweek_service_times?: string;
  momo_number?: string;
  bank_name?: string;
  bank_account_number?: string;
  facebook_url?: string;
  youtube_url?: string;
  [key: string]: string | undefined;
}

export interface SermonItem {
  id: string;
  title: string;
  slug: string;
  speaker: string;
  date: string;
  scripture?: string;
  description?: string;
  videoUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  thumbnailUrl?: string;
  tags?: string;
}

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  bannerImageUrl?: string;
  isRegistrationRequired: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImageUrl?: string;
  publishedAt?: string;
}

export async function fetchPublicSettings(): Promise<PublicSettings> {
  return apiClient.get<PublicSettings>('/settings/public');
}

export async function fetchPublicSermons(): Promise<SermonItem[]> {
  return apiClient.get<SermonItem[]>('/sermons');
}

export async function fetchPublicSermonBySlug(slug: string): Promise<SermonItem> {
  return apiClient.get<SermonItem>(`/sermons/${slug}`);
}

export async function fetchPublicEvents(): Promise<EventItem[]> {
  return apiClient.get<EventItem[]>('/events');
}

export async function fetchPublicEventBySlug(slug: string): Promise<EventItem> {
  return apiClient.get<EventItem>(`/events/${slug}`);
}

export async function fetchPublicNews(): Promise<NewsItem[]> {
  return apiClient.get<NewsItem[]>('/news');
}

export async function fetchPublicNewsBySlug(slug: string): Promise<NewsItem> {
  return apiClient.get<NewsItem>(`/news/${slug}`);
}

export async function submitContactMessage(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  return apiClient.post('/contact', data);
}

export async function submitPrayerRequest(data: {
  name?: string;
  email?: string;
  phone?: string;
  request: string;
  isAnonymous?: boolean;
}) {
  return apiClient.post('/prayer-requests', data);
}
