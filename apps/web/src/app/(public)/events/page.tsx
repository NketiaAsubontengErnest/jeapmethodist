import { Metadata } from 'next';
import Link from 'next/link';
import { fetchPublicEvents, EventItem } from '@/lib/api/public';
import { MapPin, Clock, ArrowRight, Calendar, Sparkles, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Events & Church Calendar | Methodist Church Ghana',
  description: 'Upcoming conferences, synods, revival meetings, youth camps, and special Sunday services across the Methodist Church Ghana.',
};

export default async function EventsPage() {
  let events: EventItem[] = [];
  try {
    events = await fetchPublicEvents();
  } catch (err) {
    console.error('Failed to fetch public events:', err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* 1. HERO SECTION — Royal Blue #14309c Background */}
      <section className="relative overflow-hidden bg-[#14309c] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#FFC72C]/40 bg-[#FFC72C]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#FFC72C]">
              <Sparkles className="h-3.5 w-3.5" /> Calendar &amp; Programmes
            </span>

            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Church Events &amp; Gatherings
            </h1>

            <p className="text-base leading-relaxed text-slate-200 sm:text-lg">
              Stay updated with upcoming conferences, revival meetings, youth conventions, retreats, and fellowship gatherings across our church community.
            </p>
          </div>
        </div>
      </section>

      {/* 2. EVENTS GRID SECTION — White Background */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Upcoming Calendar Events</h2>
            <div className="mx-4 hidden h-[2px] flex-1 bg-[#FFC72C]/70 sm:block" />
          </div>

          {events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500">
              No upcoming events have been published yet. Check back soon, or visit the admin dashboard to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => {
                const start = new Date(event.startDate);
                return (
                  <div
                    key={event.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#FFC72C]/50"
                  >
                    <div>
                      {/* Banner image or standard Royal Blue placeholder banner */}
                      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[#14309c] text-center">
                        {event.bannerImageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={event.bannerImageUrl}
                            alt={event.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <Calendar className="h-16 w-16 text-white/20" />
                        )}

                        <div className="absolute top-0 left-0 rounded-br-xl bg-[#14309c] border-r border-b border-white/10 px-3.5 py-1.5 text-xs font-extrabold text-[#FFC72C] shadow">
                          {start.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }).toUpperCase()}
                        </div>

                        {event.isRegistrationRequired && (
                          <div className="absolute top-3 right-3 rounded-full bg-[#FFC72C] px-3 py-1 text-[10px] font-extrabold text-[#14309c] shadow">
                            RSVP Required
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 p-6">
                        <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                          {event.title}
                        </h3>

                        <p className="line-clamp-3 text-xs leading-relaxed text-slate-600">
                          {event.description || 'Annual camping, revival, and fellowship event for all members and visitors.'}
                        </p>

                        <div className="space-y-2 pt-3 text-xs font-semibold text-slate-500 border-t border-slate-100">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-[#FFC72C]" />
                            <span>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[#FFC72C]" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-0">
                      <Button
                        asChild
                        className="w-full rounded-lg bg-[#14309c] px-5 py-3 text-xs font-extrabold text-white shadow transition-all hover:bg-[#0f2478]"
                      >
                        <Link href={`/events/${event.slug}`} className="flex items-center justify-center gap-2">
                          View Details &amp; Register <ArrowRight className="h-4 w-4 text-[#FFC72C]" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. CALLOUT BANNER — Reddish Brown Gradient */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#8B2519]/30 bg-gradient-to-r from-[#2B0B0A] via-[#5C1615] to-[#8B2519] p-8 text-white shadow-xl sm:p-12 md:flex-row md:items-center">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">
              Organizing an Event or Conference?
            </h2>
            <p className="text-xs leading-relaxed text-slate-200 sm:text-sm">
              Contact our church secretariat for sanctuary bookings, hall rentals, and publicity across our connexion.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="shrink-0 rounded-lg bg-[#FFC72C] px-8 py-6 text-sm font-extrabold text-[#14309c] shadow-md transition-colors hover:bg-amber-400"
          >
            <Link href="/contact">Contact Secretariat</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

