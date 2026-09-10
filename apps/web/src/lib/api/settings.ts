import { apiFetch } from '@/lib/api-client';

/** Matches apps/api/src/settings/dto/update-settings.dto.ts field-for-field. */
export interface SettingsMap {
  church_name?: string;
  society_name?: string;
  slogan?: string;
  tagline?: string;
  logo_url?: string;
  favicon_url?: string;
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
  about_text?: string;
  mission?: string;
  vision?: string;
  momo_number?: string;
  bank_name?: string;
  bank_account_number?: string;
  facebook_url?: string;
  youtube_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  x_url?: string;
  hero_title?: string;
  hero_subtitle?: string;
  footer_text?: string;
}

export function fetchSettings() {
  return apiFetch<SettingsMap>('/settings/public');
}

export function updateSettings(dto: SettingsMap) {
  return apiFetch<Array<{ key: string; value: string }>>('/settings', {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}
