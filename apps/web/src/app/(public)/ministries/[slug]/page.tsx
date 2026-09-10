import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPublicMinistryBySlug, MinistryPublicDetail } from '@/lib/api/public';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Clock, MapPin, User, Send } from 'lucide-react';

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
    return { title: 'Ministry Not Found | Methodist Church Ghana' };
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
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back link */}
        <div>
          <Link
            href="/ministries"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to All Ministries
          </Link>
        </div>

        {/* Hero Card */}
        <div className="bg-white border border-border rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
          {typeof ministry._count?.members === 'number' && (
            <div className="flex flex-wrap gap-2 items-center">
              <Badge className="bg-blue-50 text-primary border-transparent">
                {ministry._count.members} Member{ministry._count.members === 1 ? '' : 's'}
              </Badge>
            </div>
          )}

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            {ministry.name}
          </h1>

          {ministry.description && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {ministry.description}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
            <div className="flex items-center gap-3 text-foreground">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Meeting Schedule</p>
                <p className="text-sm font-semibold">{ministry.meetingSchedule || 'Contact us for details'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-foreground">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-semibold">{ministry.meetingVenue || 'Main Church Hall / Chapel'}</p>
              </div>
            </div>

            {leaderName && (
              <div className="flex items-center gap-3 text-foreground">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Ministry Leader</p>
                  <p className="text-sm font-semibold">{leaderName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar CTA */}
        <Card className="rounded-2xl border-border border-t-4 border-t-gold-500 bg-white">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-foreground">Want to Join?</h3>
            <p className="text-sm text-muted-foreground">
              We welcome new members! Simply attend one of our upcoming weekly meetings or contact us to get connected.
            </p>
            <Link
              href="/contact"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-sm transition-colors shadow sm:w-auto"
            >
              <Send className="w-4 h-4" /> Contact Fellowship Leader
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
