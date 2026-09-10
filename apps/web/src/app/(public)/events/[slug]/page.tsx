import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPublicEventBySlug, EventItem } from '@/lib/api/public';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Calendar, Clock, MapPin, UserCheck } from 'lucide-react';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let event: EventItem | null = null;
  try {
    event = await fetchPublicEventBySlug(slug);
  } catch (e) {
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
  } catch (e) {
    event = null;
  }

  if (!event) {
    notFound();
  }

  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : null;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Church Events
          </Link>
        </div>

        {/* Hero — the one dark accent block on this page */}
        <div className="rounded-2xl overflow-hidden border border-gold-500/30 bg-gradient-to-br from-blue-900 via-blue-800 to-red-700 shadow-2xl space-y-6 text-white">
          {event.bannerImageUrl && (
            <div className="h-64 sm:h-80 w-full overflow-hidden bg-charcoal-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={event.bannerImageUrl} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6 sm:p-10 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-gold-400 font-extrabold text-blue-950">
                Church Calendar Event
              </Badge>
              {event.isRegistrationRequired ? (
                <Badge variant="outline" className="border-gold-400 text-gold-300">
                  Registration Required
                </Badge>
              ) : (
                <Badge className="bg-cream-100 text-blue-950">Open Admission</Badge>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              {event.title}
            </h1>

            <p className="text-lg text-cream-200 leading-relaxed">
              {event.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-blue-700">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gold-400" />
                <div>
                  <p className="text-xs text-cream-300">Date</p>
                  <p className="text-sm font-semibold text-white">
                    {start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {end && ` - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gold-400" />
                <div>
                  <p className="text-xs text-cream-300">Time</p>
                  <p className="text-sm font-semibold text-white">
                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gold-400" />
                <div>
                  <p className="text-xs text-cream-300">Venue</p>
                  <p className="text-sm font-semibold text-white">
                    {event.location || 'Main Sanctuary'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RSVP Card */}
        {event.isRegistrationRequired && (
          <Card className="rounded-2xl border-border border-t-4 border-t-gold-500 bg-white shadow-sm">
            <CardContent className="p-6 sm:p-8 space-y-4">
              <h3 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-gold-600" /> Event Registration &amp; RSVP
              </h3>
              <p className="text-sm text-muted-foreground">
                Seat allocation is required for this event. Please contact the church secretariat or register via the member portal to confirm attendance.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-primary hover:bg-blue-800 text-primary-foreground font-semibold rounded-lg text-sm transition-colors shadow inline-block"
                >
                  Contact Secretariat to Register
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
