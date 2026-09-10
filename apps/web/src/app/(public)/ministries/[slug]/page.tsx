import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MINISTRIES_DATA } from '../page';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Clock, MapPin, User, CheckCircle2, Send } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ministry = MINISTRIES_DATA.find((m) => m.slug === slug);

  if (!ministry) {
    return { title: 'Ministry Not Found | Methodist Church Ghana' };
  }

  return {
    title: `${ministry.name} | Methodist Church Ghana`,
    description: ministry.summary,
  };
}

export default async function MinistryDetailPage({ params }: Props) {
  const { slug } = await params;
  const ministry = MINISTRIES_DATA.find((m) => m.slug === slug);

  if (!ministry) {
    notFound();
  }

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
          <div className="flex flex-wrap gap-2 items-center">
            <Badge className="bg-blue-50 text-primary border-transparent">
              {ministry.category}
            </Badge>
            <Badge variant="outline" className="border-gold-300 bg-gold-50 text-gold-700">
              Motto: {ministry.motto}
            </Badge>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
            {ministry.name}
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {ministry.summary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
            <div className="flex items-center gap-3 text-foreground">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Meeting Schedule</p>
                <p className="text-sm font-semibold">{ministry.meetingTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-foreground">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-semibold">Main Church Hall / Chapel</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-foreground">
              <User className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Open To</p>
                <p className="text-sm font-semibold">All Members &amp; Visitors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="rounded-2xl border-border border-t-4 border-t-primary bg-white">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-serif text-xl font-bold text-foreground">
                  About {ministry.name}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  In accordance with the Constitution and Standing Orders of the Methodist Church Ghana, {ministry.name} serves as a pillar for spiritual nourishment, practical evangelism, and community brotherhood/sisterhood. Members participate in regular prayer sessions, Bible studies, annual retreat conventions, and social welfare programs.
                </p>

                <h3 className="text-md font-semibold text-foreground pt-2">Key Objectives &amp; Activities</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Weekly Bible study, hymn singing, and intercessory prayer.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Evangelistic outreach to hospitals, prisons, and local communities.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Welfare support for members during celebrations, illness, or bereavement.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Participation in Connexional, Diocesan, and Circuit annual conferences.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar CTA */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-border border-t-4 border-t-gold-500 bg-white">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-serif text-lg font-bold text-foreground">Want to Join?</h3>
                <p className="text-xs text-muted-foreground">
                  We welcome new members! Simply attend one of our upcoming weekly meetings or contact the executive leaders.
                </p>
                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-sm transition-colors shadow"
                >
                  <Send className="w-4 h-4" /> Contact Fellowship Leader
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
