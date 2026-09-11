import { Metadata } from 'next';
import Link from 'next/link';
import { fetchPublicEvents, EventItem } from '@/lib/api/public';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 py-12 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="border-blue-200 bg-blue-50 font-bold text-primary">
            Calendar &amp; Programmes
          </Badge>
          <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl tracking-tight">
            Church Events &amp; Gatherings
          </h1>
          <p className="text-lg text-muted-foreground">
            Stay updated with upcoming conferences, revival meetings, youth conventions, and fellowship gatherings.
          </p>
        </div>

        {/* Events Grid */}
        {events.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No upcoming events have been published yet. Check back soon, or visit the admin dashboard to add one.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const start = new Date(event.startDate);
            return (
              <Card key={event.id} className="flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl border-border border-t-4 border-t-primary bg-white overflow-hidden">
                <div>
                  {event.bannerImageUrl && (
                    <div className="h-48 overflow-hidden bg-cream-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.bannerImageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center gap-2">
                      <Badge className="bg-blue-50 text-primary font-extrabold">
                        {start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Badge>
                      {event.isRegistrationRequired ? (
                        <Badge variant="outline" className="border-gold-400 text-gold-700 font-semibold">
                          RSVP Required
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs font-semibold">
                          Free Entrance
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-serif text-xl font-bold text-foreground line-clamp-2">
                      {event.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="space-y-2 pt-2 text-xs text-muted-foreground border-t border-border">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <Link
                    href={`/events/${event.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-blue-800 text-primary-foreground font-semibold rounded-lg text-sm transition-colors shadow"
                  >
                    View Details &amp; Register <ArrowRight className="w-4 h-4 text-gold-300" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
