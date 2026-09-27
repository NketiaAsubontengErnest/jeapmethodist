import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPublicMinistryBySlug, MinistryPublicDetail } from '@/lib/api/public';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Clock, MapPin, User, Send, Users } from 'lucide-react';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let ministry: MinistryPublicDetail | null = null;
  try {
    ministry = await fetchPublicMinistryBySlug(slug);
  } catch (e) {
    // ministry stays null; page itself will 404
  }

  if (!ministry) {
    return { title: 'Organization Not Found | Methodist Church Ghana' };
  }

  return {
    title: `${ministry.name} | Methodist Church Ghana`,
    description: ministry.description,
  };
}

export default async function MinistryDetailPage({ params }: Props) {
  const { slug } = await params;
  let ministry: MinistryPublicDetail | null = null;
  try {
    ministry = await fetchPublicMinistryBySlug(slug);
  } catch (e) {
    ministry = null;
  }

  if (!ministry) {
    notFound();
  }

  const leaderName = ministry.leaderMember
    ? `${ministry.leaderMember.firstName} ${ministry.leaderMember.lastName}`
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* 1. HERO SECTION — Royal Blue #14309c Background */}
      <section className="relative overflow-hidden bg-[#14309c] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 text-white">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <Link
              href="/ministries"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#FFC72C] hover:underline"
            >
              <ChevronLeft className="w-4 h-4" /> Back to All Organizations
            </Link>
          </div>

          <div className="space-y-3">
            {typeof ministry._count?.members === 'number' && (
              <Badge className="bg-[#FFC72C]/20 border border-[#FFC72C]/40 text-[#FFC72C] font-extrabold uppercase text-[11px] tracking-wider px-3 py-1">
                <Users className="w-3.5 h-3.5 mr-1" /> {ministry._count.members} Registered Member
                {ministry._count.members === 1 ? '' : 's'}
              </Badge>
            )}

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
              {ministry.name}
            </h1>

            {ministry.description && (
              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-3xl">
                {ministry.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 2. DETAILS & JOIN SECTION — White Background */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Information Grid Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              Meeting &amp; Organization Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#14309c]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Meeting Schedule</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {ministry.meetingSchedule || 'Contact us for details'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#14309c]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Meeting Venue</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {ministry.meetingVenue || 'Main Church Hall / Chapel'}
                  </p>
                </div>
              </div>

              {leaderName && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#14309c]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Fellowship Leader</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{leaderName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Join CTA Card */}
          <div className="rounded-2xl border border-slate-200 border-t-4 border-t-[#FFC72C] bg-slate-50 p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-serif text-2xl font-bold text-slate-900">Want to Join This Organization?</h3>
              <p className="text-xs text-slate-600 max-w-md">
                We warmly welcome all new members! Attend any of our weekly meetings or contact the Secretariat to get connected.
              </p>
            </div>

            <Link
              href="/contact"
              className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#14309c] hover:bg-[#0f2478] text-white font-extrabold rounded-xl text-xs transition-all shadow-md hover:scale-105"
            >
              <Send className="w-4 h-4 text-[#FFC72C]" /> Contact Fellowship Leader
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
