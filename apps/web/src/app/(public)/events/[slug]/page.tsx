import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPublicEventBySlug, EventItem } from '@/lib/api/public';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Calendar, Clock, MapPin, UserCheck, Share2, Send } from 'lucide-react';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let event: EventItem | null = null;
  try {
    event = await fetchPublicEventBySlug(slug);
  } catch {
    // event stays null; page itself will 404
  }

  if (!event) {
    return { title: 'Event Not Found | Methodist Church Ghana' };
  }

  return {
    title: `${event.title} | Methodist Church Ghana Events`,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  let event: EventItem | null = null;
  try {
    event = await fetchPublicEventBySlug(slug);
  } catch {
    event = null;
  }

  if (!event) {
    notFound();
  }

  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : null;

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* 1. HERO SECTION — Royal Blue #14309c Background */}
      <section className="relative overflow-hidden bg-[#14309c] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 text-white">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Back Link */}
          <div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#FFC72C] hover:underline"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Church Events
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#FFC72C] font-extrabold text-[#14309c] text-xs uppercase px-3 py-1">
                Church Calendar Event
              </Badge>
              {event.isRegistrationRequired ? (
                <Badge variant="outline" className="border-[#FFC72C] text-[#FFC72C] text-xs font-bold">
                  Registration Required
                </Badge>
              ) : (
                <Badge className="bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
                  Open Admission
                </Badge>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
              {event.title}
            </h1>

            {event.description && (
              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-3xl">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 2. DETAILS & CONTENT SECTION — White Background */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Banner Image if present */}
          {event.bannerImageUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md h-64 sm:h-96 w-full bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={event.bannerImageUrl} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Information Grid Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              Event Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#14309c]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Date</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {end && ` - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#14309c]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Time</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#14309c]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Venue</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {event.location || 'Main Sanctuary'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration / RSVP Card */}
          {event.isRegistrationRequired && (
            <div className="rounded-2xl border border-slate-200 border-t-4 border-t-[#FFC72C] bg-slate-50 p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
                  <UserCheck className="w-5 h-5 text-[#14309c]" /> Registration Required
                </h3>
                <p className="text-xs text-slate-600 max-w-md">
                  Seat allocation is required for this event. Please contact the secretariat to confirm your attendance.
                </p>
              </div>

              <Link
                href="/contact"
                className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#14309c] hover:bg-[#0f2478] text-white font-extrabold rounded-xl text-xs transition-all shadow-md hover:scale-105"
              >
                <Send className="w-4 h-4 text-[#FFC72C]" /> Contact Secretariat
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
