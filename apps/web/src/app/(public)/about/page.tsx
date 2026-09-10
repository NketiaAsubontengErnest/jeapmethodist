'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicSettings } from '@/lib/api/public';
import { ShieldCheck, Heart, Users, BookOpen, Target, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: fetchPublicSettings,
  });

  const societyTitle = settings?.society_name || 'Trinity Society';
  const fullChurchName = settings?.church_name
    ? `${settings.church_name} — ${societyTitle}`
    : `The Methodist Church Ghana — ${societyTitle}`;

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white text-foreground">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 font-bold text-primary">
          About {societyTitle}
        </Badge>
        <h1 className="font-serif text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          {settings?.slogan ? `"${settings.slogan.replace(/^["']|["']$/g, '')}"` : 'Worshipping God, Serving Humanity'}
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {fullChurchName} is dedicated to proclaiming the Gospel of Jesus Christ, building vibrant believers, and demonstrating God&apos;s love in our society.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="rounded-2xl border-border bg-white border-t-4 border-t-primary shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-3 rounded-lg border border-blue-100 bg-blue-50 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="font-serif text-xl">Our Mission</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            {settings?.mission ||
              'To build a vibrant, spirit-filled, and self-sustaining church that equips every member for Christian witness, disciple-making, compassionate outreach, and active service to God and humanity.'}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-white border-t-4 border-t-gold-500 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-3 rounded-lg border border-gold-200 bg-gold-50 text-gold-700">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="font-serif text-xl">Our Vision</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            {settings?.vision ||
              'To be a Christ-centered, scripture-guided church family in Ghana where lives are transformed by grace, spiritual gifts are nurtured, and God’s kingdom is manifested across all generations.'}
          </CardContent>
        </Card>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">Our Core Values</h2>
          <p className="text-xs text-muted-foreground mt-1">Guiding principles that define our worship and life together.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 rounded-xl bg-white border border-border text-center space-y-3 shadow-sm transition-shadow hover:shadow-md">
            <BookOpen className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-serif font-bold text-base">Scriptural Holiness</h3>
            <p className="text-xs text-muted-foreground">Committed to living pure, holy lives transformed by the Word of God.</p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-border text-center space-y-3 shadow-sm transition-shadow hover:shadow-md">
            <Heart className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-serif font-bold text-base">Love &amp; Compassion</h3>
            <p className="text-xs text-muted-foreground">Extending God&apos;s grace and welfare support to the needy and vulnerable.</p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-border text-center space-y-3 shadow-sm transition-shadow hover:shadow-md">
            <Users className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-serif font-bold text-base">Christian Fellowship</h3>
            <p className="text-xs text-muted-foreground">Fostering deep brotherhood, sisterhood, and unity in prayer and worship.</p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-border text-center space-y-3 shadow-sm transition-shadow hover:shadow-md">
            <ShieldCheck className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-serif font-bold text-base">Faithful Stewardship</h3>
            <p className="text-xs text-muted-foreground">Managing time, talents, and resources with integrity and accountability.</p>
          </div>
        </div>
      </div>

      {/* Sub Navigation CTAs */}
      <div className="rounded-2xl border border-border bg-cream-200/60 p-8 text-center space-y-4">
        <h3 className="font-serif text-xl font-bold text-foreground">Discover More About Our Church</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild variant="outline" className="rounded-xl border-border font-semibold">
            <Link href="/about/church-history">Read Church History &rarr;</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-border font-semibold">
            <Link href="/about/leadership">Meet Our Leadership &rarr;</Link>
          </Button>
          <Button asChild className="rounded-xl font-bold shadow">
            <Link href="/visit-us">Plan Your Visit</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
