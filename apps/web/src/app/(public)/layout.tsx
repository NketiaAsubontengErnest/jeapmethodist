'use client';

import { type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicSettings } from '@/lib/api/public';
import { PublicHeader } from '@/components/public/public-header';
import { PublicFooter } from '@/components/public/public-footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: fetchPublicSettings,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      {settings?.favicon_url && (
        <link rel="icon" href={settings.favicon_url} />
      )}
      <PublicHeader
        churchName={settings?.church_name}
        societyName={settings?.society_name}
        phone={settings?.phone}
        sundayServiceTimes={settings?.sunday_service_times}
        logoUrl={settings?.logo_url}
      />
      <main className="flex-1">{children}</main>
      <PublicFooter
        churchName={settings?.church_name}
        societyName={settings?.society_name}
        slogan={settings?.slogan}
        heroSubtitle={settings?.hero_subtitle}
        address={settings?.address}
        phone={settings?.phone}
        email={settings?.email}
        secretariatHours={settings?.secretariat_hours}
        sundayServiceTimes={settings?.sunday_service_times}
        midweekServiceTimes={settings?.midweek_service_times}
        logoUrl={settings?.logo_url}
      />
    </div>
  );
}
