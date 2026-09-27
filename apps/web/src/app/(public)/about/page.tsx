'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicSettings } from '@/lib/api/public';
import { ShieldCheck, Heart, Users, BookOpen, Target, Eye, ChevronRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: fetchPublicSettings,
  });

  const societyTitle = settings?.society_name;
  const fullChurchName = settings?.church_name && societyTitle
    ? `${settings.church_name} — ${societyTitle}`
    : settings?.church_name || societyTitle || 'Methodist Church Ghana';

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* 1. HERO SECTION — Royal Blue #14309c Background */}
      <section className="relative overflow-hidden bg-[#14309c] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-8">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#FFC72C]/40 bg-[#FFC72C]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#FFC72C]">
                About Our Church &amp; Heritage
              </span>

              <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                {settings?.slogan ? `"${settings.slogan.replace(/^["']|["']$/g, '')}"` : 'Worshipping God, Serving Humanity'}
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">
                {fullChurchName} is dedicated to proclaiming the Gospel of Jesus Christ, nurturing vibrant disciples, and demonstrating God&apos;s love in our society through scriptural holiness and active community service.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="rounded-lg bg-[#FFC72C] px-7 py-6 text-sm font-extrabold text-[#14309c] shadow-md transition-all hover:bg-amber-400 hover:scale-[1.02]"
                >
                  <Link href="/visit-us">Join Us This Sunday</Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="rounded-lg border border-[#5C1615] bg-[#3B0E0D] px-7 py-6 text-sm font-bold text-white shadow transition-all hover:bg-[#4A1513]"
                >
                  <Link href="/about/church-history">Explore Church History</Link>
                </Button>
              </div>
            </div>

            {/* Right Column Highlight Box */}
            <div className="lg:col-span-4">
              <div className="relative rounded-2xl border border-[#FFC72C]/30 bg-gradient-to-b from-[#1c37ae] to-[#14309c] p-8 text-white shadow-2xl">
                <h3 className="font-serif text-xl font-bold text-[#FFC72C] mb-2">Methodist Identity</h3>
                <p className="text-xs leading-relaxed text-slate-200 mb-6">
                  Rooted in John Wesley&apos;s evangelical revival of the 18th century, the Methodist Church Ghana combines fervent prayer, scriptural holiness, and social action.
                </p>
                <div className="border-t border-white/10 pt-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Founded in Ghana:</span>
                    <span className="font-bold text-[#FFC72C]">1835 (Cape Coast)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Autonomy Granted:</span>
                    <span className="font-bold text-[#FFC72C]">1961</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Polity Structure:</span>
                    <span className="font-bold text-[#FFC72C]">Connexional &amp; Episcopal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MISSION & VISION SECTION — White Background */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl">Mission &amp; Vision Statement</h2>
            <div className="mx-4 hidden h-[2px] flex-1 bg-[#FFC72C]/70 sm:block" />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Mission Card */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-[#FFC72C]/50 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#14309c] text-[#FFC72C] shadow-sm">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-slate-900">Our Mission</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {settings?.mission ||
                  'To build a vibrant, spirit-filled, and self-sustaining church that equips every member for Christian witness, disciple-making, compassionate outreach, and active service to God and humanity.'}
              </p>
            </div>

            {/* Vision Card */}
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-[#FFC72C]/50 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#14309c] text-[#FFC72C] shadow-sm">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-slate-900">Our Vision</h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {settings?.vision ||
                  'To be a Christ-centered, scripture-guided church family in Ghana where lives are transformed by grace, spiritual gifts are nurtured, and God’s kingdom is manifested across all generations.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE VALUES SECTION — Crisp Light Neutral Accent on White */}
      <section className="bg-white py-16 sm:py-20 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#14309c]">Pillars of Our Faith</span>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Our Core Values</h2>
            <p className="text-sm text-slate-600">Guiding principles that define our worship, fellowship, and life together in Christ.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center space-y-4 shadow-sm transition-all hover:shadow-md hover:border-[#FFC72C]/50">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#14309c] text-[#FFC72C]">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">Scriptural Holiness</h3>
              <p className="text-xs leading-relaxed text-slate-600">Committed to living pure, holy lives transformed daily by the authority of God&apos;s Word.</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center space-y-4 shadow-sm transition-all hover:shadow-md hover:border-[#FFC72C]/50">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#14309c] text-[#FFC72C]">
                <Heart className="h-7 w-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">Love &amp; Compassion</h3>
              <p className="text-xs leading-relaxed text-slate-600">Extending Christ&apos;s love, benevolence, and welfare support to the needy and vulnerable.</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center space-y-4 shadow-sm transition-all hover:shadow-md hover:border-[#FFC72C]/50">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#14309c] text-[#FFC72C]">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">Christian Fellowship</h3>
              <p className="text-xs leading-relaxed text-slate-600">Fostering deep brotherhood, sisterhood, and unity through small groups, prayer, and worship.</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 text-center space-y-4 shadow-sm transition-all hover:shadow-md hover:border-[#FFC72C]/50">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#14309c] text-[#FFC72C]">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900">Faithful Stewardship</h3>
              <p className="text-xs leading-relaxed text-slate-600">Managing time, talents, and church resources with high integrity and accountability.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SUB NAVIGATION CARDS SECTION */}
      <section className="bg-white py-12 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              href="/about/church-history"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-[#FFC72C]"
            >
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FFC72C]">Historical Heritage</span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 group-hover:text-[#14309c] transition-colors">
                  Church History &amp; Foundations &rarr;
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Read about the journey of Methodism in Ghana from Rev. Joseph Dunwell in 1835 and Thomas Birch Freeman to connexional autonomy in 1961.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-[#14309c]">
                Read full historical timeline <ChevronRight className="h-4 w-4" />
              </div>
            </Link>

            <Link
              href="/about/leadership"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all hover:shadow-lg hover:border-[#FFC72C]"
            >
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FFC72C]">Servants &amp; Officers</span>
                <h3 className="font-serif text-2xl font-bold text-slate-900 group-hover:text-[#14309c] transition-colors">
                  Meet Our Leadership &rarr;
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  Discover our ministers, society stewards, class leaders, and executive leaders dedicated to shepherding the flock and managing church affairs.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-[#14309c]">
                View church leadership <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. CALLOUT BANNER — Reddish Brown Gradient */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#8B2519]/30 bg-gradient-to-r from-[#2B0B0A] via-[#5C1615] to-[#8B2519] p-8 text-white shadow-xl sm:p-12 md:flex-row md:items-center">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">
              Become Part of Our Church Family
            </h2>
            <p className="text-xs leading-relaxed text-slate-200 sm:text-sm">
              Whether you are looking for a spiritual home, prayer support, or a place to serve God with your gifts, you are warmly welcome here.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="shrink-0 rounded-lg bg-[#FFC72C] px-8 py-6 text-sm font-extrabold text-[#14309c] shadow-md transition-colors hover:bg-amber-400"
          >
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

