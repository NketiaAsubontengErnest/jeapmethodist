import { Metadata } from 'next';
import Link from 'next/link';
import { fetchPublicMinistries, MinistryPublicItem } from '@/lib/api/public';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Ministries & Organizations | Methodist Church Ghana',
  description: 'Explore the fellowship organizations, choir, youth ministries, and class systems of the Methodist Church Ghana.',
};

export default async function MinistriesPage() {
  let ministries: MinistryPublicItem[] = [];
  try {
    ministries = await fetchPublicMinistries();
  } catch (err) {
    console.error('Failed to fetch public ministries:', err);
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="border-blue-200 bg-blue-50 font-bold text-primary">
            Fellowship &amp; Service
          </Badge>
          <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl tracking-tight">
            Church Ministries &amp; Organizations
          </h1>
          <p className="text-lg text-muted-foreground">
            Methodism thrives through small groups and organizations where every member finds community, grows spiritually, and serves with their God-given gifts.
          </p>
        </div>

        {/* Ministries Grid */}
        {ministries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No ministries have been published yet. Check back soon, or visit the admin dashboard to add one.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ministries.map((ministry) => (
            <Card
              key={ministry.id}
              className="flex flex-col justify-between rounded-2xl border-border border-t-4 border-t-primary bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-foreground">{ministry.name}</h3>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {ministry.description || 'Spiritual growth and fellowship.'}
                </p>

                {ministry.meetingSchedule && (
                  <div className="pt-2 text-xs text-muted-foreground font-medium border-t border-border">
                    <span className="text-muted-foreground/70">Meeting: </span>
                    <span className="text-foreground font-semibold">{ministry.meetingSchedule}</span>
                  </div>
                )}
              </CardContent>

              <div className="px-6 pb-6 pt-0">
                <Link
                  href={`/ministries/${ministry.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-sm transition-colors border border-gold-400/20"
                >
                  Learn More &amp; Join <ArrowRight className="w-4 h-4 text-gold-300" />
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom Banner — deliberate dark accent block, the one exception on this page */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-red-700 text-white rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-xl border border-gold-500/30">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">Find Your Place in God’s Household</h2>
          <p className="text-cream-200 max-w-2xl mx-auto text-sm sm:text-base">
            Whether you are a newcomer or a long-time member, joining a fellowship group or choir is the best way to make friends and deepen your spiritual journey.
          </p>
          <div className="pt-2">
            <Link
              href="/contact"
              className="px-6 py-3 bg-gold-400 hover:bg-gold-500 text-blue-950 font-bold rounded-lg shadow inline-block text-sm"
            >
              Get Connected Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
