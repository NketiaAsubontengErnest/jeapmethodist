import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ministries & Organizations | Methodist Church Ghana',
  description: 'Explore the fellowship organizations, choir, youth ministries, and class systems of the Methodist Church Ghana.',
};

export interface Ministry {
  slug: string;
  name: string;
  category: 'Connexional Organization' | 'Music & Worship' | 'Youth & Children' | 'Fellowship & Care';
  summary: string;
  meetingTime: string;
  motto: string;
  icon: string;
}

export const MINISTRIES_DATA: Ministry[] = [
  {
    slug: 'womens-fellowship',
    name: 'Women’s Fellowship',
    category: 'Connexional Organization',
    summary: 'Spiritual development, home management, prayer, and charitable outreach for all women in the church.',
    meetingTime: 'Tuesdays @ 5:00 PM',
    motto: 'For Christ and His Church',
    icon: 'Heart',
  },
  {
    slug: 'mens-fellowship',
    name: 'Men’s Fellowship',
    category: 'Connexional Organization',
    summary: 'Uniting men for spiritual maturity, godly leadership in families, community work, and church building.',
    meetingTime: 'Mondays @ 6:00 PM',
    motto: 'For Christ and His Church',
    icon: 'Users',
  },
  {
    slug: 'methodist-youth-fellowship',
    name: 'Methodist Youth Fellowship (MYF)',
    category: 'Youth & Children',
    summary: 'Empowering young people (ages 12-35) through Bible study, career guidance, evangelism, and social fellowship.',
    meetingTime: 'Sundays @ 4:00 PM',
    motto: 'Remember Now Thy Creator',
    icon: 'Flame',
  },
  {
    slug: 'christs-little-band',
    name: 'Christ’s Little Band',
    category: 'Connexional Organization',
    summary: 'Focusing on evangelism, visiting the sick and bereaved, prayer intercession, and Methodist heritage preservation.',
    meetingTime: 'Thursdays @ 5:30 PM',
    motto: 'Pray Without Ceasing',
    icon: 'Shield',
  },
  {
    slug: 'church-choir-singing-band',
    name: 'Church Choir & Singing Band',
    category: 'Music & Worship',
    summary: 'Leading sacred song, traditional Methodist hymns, anthem performances, and spirit-filled praise in all services.',
    meetingTime: 'Saturdays @ 4:00 PM',
    motto: 'O For a Thousand Tongues to Sing',
    icon: 'Music',
  },
  {
    slug: 'boys-and-girls-brigade',
    name: 'Boys’ & Girls’ Brigade',
    category: 'Youth & Children',
    summary: 'Discipline, physical fitness, Christian character building, and band practice for children and teenagers.',
    meetingTime: 'Saturdays @ 8:30 AM',
    motto: 'Sure and Stedfast',
    icon: 'Users',
  },
  {
    slug: 'sunday-school',
    name: 'Sunday School / Children’s Ministry',
    category: 'Youth & Children',
    summary: 'Nurturing children with biblical foundations, scripture memorization, moral lessons, and creative activities.',
    meetingTime: 'Sundays @ 8:30 AM & 10:30 AM',
    motto: 'Suffer the Little Children to Come',
    icon: 'BookOpen',
  },
  {
    slug: 'class-system-discipleship',
    name: 'Class System & Pastoral Care',
    category: 'Fellowship & Care',
    summary: 'The bedrock of Methodism — small fellowship groups led by Class Leaders for mutual accountability, prayer, and pastoral support.',
    meetingTime: 'Weekly / Bi-Weekly Class Meetings',
    motto: 'Watching Over One Another in Love',
    icon: 'Heart',
  },
];

export default function MinistriesPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MINISTRIES_DATA.map((ministry) => (
            <Card
              key={ministry.slug}
              className="flex flex-col justify-between rounded-2xl border-border border-t-4 border-t-primary bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {ministry.category}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-foreground">{ministry.name}</h3>
                  <p className="text-xs font-bold italic text-gold-700">
                    &ldquo;{ministry.motto}&rdquo;
                  </p>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {ministry.summary}
                </p>

                <div className="pt-2 text-xs text-muted-foreground font-medium border-t border-border">
                  <span className="text-muted-foreground/70">Meeting: </span>
                  <span className="text-foreground font-semibold">{ministry.meetingTime}</span>
                </div>
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
