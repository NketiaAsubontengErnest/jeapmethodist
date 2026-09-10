'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicSettings } from '@/lib/api/public';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartHandshake, Smile, BookOpen, ChevronRight } from 'lucide-react';

export default function VisitUsPage() {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: fetchPublicSettings,
  });

  const churchTitle = settings?.church_name
    ? `${settings.church_name} — ${settings?.society_name || 'Trinity Society'}`
    : 'Methodist Church Ghana';

  const service1 = settings?.sunday_service_1 || 'First Service (Vernacular / Fante) at 7:00 AM';
  const service2 = settings?.sunday_service_2 || 'Second Service (English) at 9:30 AM';
  const midweek = settings?.midweek_service || 'Mid-week Bible study Wednesdays at 6:00 PM';

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 font-bold text-primary">
            Welcome Guest!
          </Badge>
          <h1 className="font-serif text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight">
            Plan Your First Visit
          </h1>
          <p className="text-lg text-muted-foreground">
            We are thrilled to welcome you to {churchTitle}. Here is a friendly guide on what to expect when you join us for Sunday divine service.
          </p>
        </div>

        {/* What to Expect Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="rounded-2xl border-border border-t-4 border-t-primary shadow-sm">
            <CardContent className="pt-6 space-y-3">
              <div className="w-12 h-12 rounded-xl border border-blue-100 bg-blue-50 flex items-center justify-center text-primary">
                <Smile className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">Warm Welcome & Ushering</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our welcoming team of stewards and ushers will greet you at the entrance, help you locate a seat, and hand you a service order bulletin.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border border-t-4 border-t-gold-500 shadow-sm">
            <CardContent className="pt-6 space-y-3">
              <div className="w-12 h-12 rounded-xl border border-gold-200 bg-gold-50 flex items-center justify-center text-gold-700">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">Liturgical & Spirit-Filled Worship</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Experience sound Methodist hymnody (from the Methodist Hymn Book / CAN), sacred choir anthems, biblically grounded preaching, and passionate prayer.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border border-t-4 border-t-primary shadow-sm">
            <CardContent className="pt-6 space-y-3">
              <div className="w-12 h-12 rounded-xl border border-blue-100 bg-blue-50 flex items-center justify-center text-primary">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground">Children’s Sunday School</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bring your children! Dedicated Sunday school teachers provide age-appropriate Bible lessons, memory verses, and snacks in a safe environment.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Visitor Info */}
        <div className="bg-white border border-border rounded-2xl p-8 sm:p-12 shadow-sm space-y-8">
          <h2 className="font-serif text-2xl font-bold text-foreground border-b pb-4 border-border">
            Frequently Asked Questions by Visitors
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-foreground text-base">What are your service times?</h3>
              <p className="text-muted-foreground leading-relaxed">
                We hold divine services: {service1}, and {service2}. {midweek}.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif font-bold text-foreground text-base">What should I wear?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Feel free to wear traditional Ghanaian cloth/Kente or formal smart-casual attire. Members of fellowship organizations wear their uniforms on special Sundays.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif font-bold text-foreground text-base">Is there parking on premises?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Yes! Secure parking is available on the church grounds with traffic wardens guiding arrivals.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-serif font-bold text-foreground text-base">Who can take Holy Communion?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Holy Communion is celebrated monthly (usually 1st Sunday). In the Methodist tradition, all baptized and confirmed believers who love the Lord are welcome at Christ&apos;s table.
              </p>
            </div>
          </div>
        </div>

        {/* CTA — the one deliberate dark accent block on this page */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-red-700 text-white rounded-2xl p-8 text-center space-y-4 shadow-xl border border-gold-500/30">
          <h2 className="font-serif text-2xl font-bold">Have Questions Before Coming?</h2>
          <p className="text-cream-200 max-w-xl mx-auto text-sm">
            Reach out to our welcoming stewards or pastoral team. We can arrange someone to meet you at the door!
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="px-6 py-3 bg-gold-400 hover:bg-gold-500 text-blue-950 font-bold rounded-lg shadow inline-flex items-center gap-2 text-sm transition-colors"
            >
              Contact Welcome Secretariat <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
