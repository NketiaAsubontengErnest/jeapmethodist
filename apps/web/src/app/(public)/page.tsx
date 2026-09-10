'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  Target,
  Eye,
  Share2,
  Calendar,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  BookOpen,
  Video,
  Heart,
  Folder,
  ImageIcon,
} from 'lucide-react';
import {
  fetchPublicSettings,
  fetchPublicSermons,
  fetchPublicEvents,
  fetchPublicNews,
  fetchPublicMinistries,
} from '@/lib/api/public';
import { fetchPublicGallery } from '@/lib/api/media';
import { Button } from '@/components/ui/button';

export default function PublicHomePage() {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: fetchPublicSettings,
  });

  const { data: sermons = [] } = useQuery({
    queryKey: ['public-sermons'],
    queryFn: fetchPublicSermons,
  });

  const { data: events = [] } = useQuery({
    queryKey: ['public-events'],
    queryFn: fetchPublicEvents,
  });

  const { data: news = [] } = useQuery({
    queryKey: ['public-news'],
    queryFn: fetchPublicNews,
  });

  const { data: ministries = [] } = useQuery({
    queryKey: ['public-ministries'],
    queryFn: fetchPublicMinistries,
  });

  const { data: galleryData } = useQuery({
    queryKey: ['public-gallery-home'],
    queryFn: () => fetchPublicGallery({ limit: 6 }),
  });

  const featuredSermon = sermons[0];
  const upcomingEvents = events.slice(0, 3);
  const latestNews = news.slice(0, 2);
  const topMinistries = ministries.slice(0, 6);
  const galleryAlbums = galleryData?.albums || [];
  const galleryItems = (galleryData?.items || []).filter(
    (i) => i.category !== 'identity' && i.title !== 'logo_url' && i.title !== 'favicon_url'
  );

  return (
    <div className="flex flex-col bg-white text-slate-900">
      {/* 1. HERO SECTION — Royal Blue #14309c Background */}
      <section className="relative overflow-hidden bg-[#14309c] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <span className="block text-xs font-extrabold uppercase tracking-widest text-[#FFC72C]">
                {settings?.church_name ? `${settings.church_name} • ${settings?.society_name || 'TRINITY SOCIETY'}` : 'METHODIST CHURCH GHANA • TRINITY SOCIETY'}
              </span>

              <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                {settings?.hero_title || settings?.society_name || 'Trinity Society'}
              </h1>

              <p className="text-base font-medium italic text-[#FFC72C]">
                &quot;{(settings?.slogan || 'Sure and Steadfast!').replace(/^["']|["']$/g, '')}&quot;
              </p>

              <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                {settings?.hero_subtitle ||
                  'A vibrant, spirit-filled family worshipping Christ, building lives, and transforming communities in Ghana.'}
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
                  <Link href="/about">Our Story</Link>
                </Button>
              </div>
            </div>

            {/* Right column: Featured Highlight Box */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-[#FFC72C]/30 bg-gradient-to-b from-[#1c37ae] to-[#14309c] p-8 text-white shadow-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FFC72C]/40 bg-[#FFC72C]/10 px-3.5 py-1 text-xs font-bold text-[#FFC72C]">
                  <Sparkles className="h-3.5 w-3.5" /> Featured Word
                </div>

                {featuredSermon ? (
                  <div className="space-y-4">
                    <h3 className="font-serif text-2xl font-bold leading-snug">{featuredSermon.title}</h3>
                    <p className="line-clamp-3 text-xs leading-relaxed text-slate-300">
                      {featuredSermon.description}
                    </p>
                    <div className="border-t border-white/10 pt-3 text-xs font-semibold text-[#FFC72C]">
                      Speaker: {featuredSermon.speaker} &bull; {featuredSermon.scripture}
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-lg border-[#FFC72C]/60 text-xs font-bold text-[#FFC72C] hover:bg-[#FFC72C] hover:text-[#14309c]"
                    >
                      <Link href={`/sermons/${featuredSermon.slug}`}>Watch Full Sermon</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-serif text-2xl font-bold">Walking in Divine Grace</h3>
                    <p className="text-xs leading-relaxed text-slate-300">
                      Join our vibrant services every Sunday. Be refreshed, empowered, and built up in faith through God&apos;s holy word.
                    </p>
                    <div className="border-t border-white/10 pt-3 text-xs font-semibold text-[#FFC72C]">
                      Services: 7:00 AM &amp; 9:45 AM
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-lg border-[#FFC72C]/60 text-xs font-bold text-[#FFC72C] hover:bg-[#FFC72C] hover:text-[#14309c]"
                    >
                      <Link href="/sermons">Browse Sermons</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* 3. MISSION & VISION SECTION — Warm Cream Background #FAF8F5 */}
      <section className="bg-[#FAF8F5] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Card 1: Our Mission */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">Our Mission</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                To develop young people through Christian training, discipline, and service to God and community.
              </p>
            </div>

            {/* Card 2: Our Vision */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">Our Vision</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                To raise a generation of disciplined, God-fearing young people who are responsible citizens and future leaders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR ACTIVITIES & MINISTRIES SECTION — White Background */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-slate-900">Our Activities &amp; Ministries</h2>
            <div className="mx-4 hidden h-[2px] flex-1 bg-[#FFC72C]/70 sm:block" />
            <Link href="/ministries" className="flex items-center gap-1 text-xs font-bold text-[#FFC72C] hover:underline">
              See all &rarr;
            </Link>
          </div>

          {topMinistries.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topMinistries.map((m) => (
                <Link
                  key={m.id}
                  href={`/ministries/${m.slug}`}
                  className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 transition-all hover:shadow-md hover:border-[#FFC72C]/50"
                >
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-[#14309c] text-white">
                    <Users className="h-6 w-6 text-[#FFC72C]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                      {m.description || 'Spiritual growth and fellowship.'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
              Ministries added from the admin dashboard will appear here.
            </div>
          )}
        </div>
      </section>

      {/* 5. UPCOMING EVENTS SECTION — Warm Cream Background #FAF8F5 */}
      <section className="bg-[#FAF8F5] py-16">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-slate-900">Upcoming Events</h2>
            <div className="mx-4 hidden h-[2px] flex-1 bg-[#FFC72C]/70 sm:block" />
            <Link href="/events" className="flex items-center gap-1 text-xs font-bold text-[#FFC72C] hover:underline">
              See all &rarr;
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all hover:shadow-lg"
                >
                  <div className="relative flex h-44 items-center justify-center bg-[#14309c] p-6 text-center">
                    <Calendar className="h-10 w-10 text-white/20" />

                    <div className="absolute top-0 left-0 rounded-br-xl bg-[#14309c] border-r border-b border-white/10 px-3 py-1.5 text-xs font-bold text-[#FFC72C]">
                      {new Date(ev.startDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }).toUpperCase()}
                    </div>

                    <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                      <Share2 className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="space-y-3 p-6">
                    <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      {ev.title}
                    </h3>
                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
                      {ev.description || 'Annual camping and training event for all members and visitors.'}
                    </p>
                    <div className="flex items-center gap-1.5 pt-1 text-xs font-semibold text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-[#FFC72C]" /> {ev.location || 'Brigade Camp Grounds'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
              Events added from the admin dashboard will appear here.
            </div>
          )}
        </div>
      </section>

      {/* 6. PHOTO GALLERY & MEDIA HIGHLIGHTS SECTION — White Background */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-slate-900">Photo Albums &amp; Gallery</h2>
            <div className="mx-4 hidden h-[2px] flex-1 bg-[#FFC72C]/70 sm:block" />
            <Link href="/gallery" className="flex items-center gap-1 text-xs font-bold text-[#FFC72C] hover:underline">
              View Gallery &rarr;
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleryAlbums.length > 0 ? (
              galleryAlbums.slice(0, 3).map((alb) => (
                <Link
                  key={alb.id}
                  href="/gallery"
                  className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={alb.photos?.[0]?.url || alb.coverUrl || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80'}
                      alt={alb.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                      <span className="w-fit bg-[#14309c] text-[#FFC72C] font-mono text-[10px] font-bold px-2 py-0.5 rounded mb-1">
                        {alb._count?.photos ?? 0} PHOTOS
                      </span>
                      <h3 className="font-serif text-base font-bold leading-tight line-clamp-1">{alb.title}</h3>
                    </div>
                  </div>
                </Link>
              ))
            ) : galleryItems.length > 0 ? (
              galleryItems.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href="/gallery"
                  className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.title || item.filename}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                      <h3 className="font-serif text-base font-bold leading-tight line-clamp-1">{item.title || item.filename}</h3>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
                Media uploaded from the admin dashboard will appear here. Visit our{' '}
                <Link href="/gallery" className="font-bold text-[#FFC72C] underline">
                  Photo Gallery
                </Link>{' '}
                page to view all pictures and live streams.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. ANNOUNCEMENTS SECTION — Warm Cream Background #FAF8F5 */}
      <section className="bg-[#FAF8F5] py-16">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-slate-900">Announcements</h2>
            <div className="mx-4 hidden h-[2px] flex-1 bg-[#FFC72C]/70 sm:block" />
            <Link href="/news" className="flex items-center gap-1 text-xs font-bold text-[#FFC72C] hover:underline">
              Read all news &rarr;
            </Link>
          </div>

          {latestNews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {latestNews.map((n) => (
                <Link
                  key={n.id}
                  href={`/news/${n.slug}`}
                  className="group space-y-3 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-[#FFC72C]/50"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold uppercase tracking-wider text-[#FFC72C]">
                      {n.publishedAt
                        ? new Date(n.publishedAt).toLocaleDateString(undefined, {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Recently'}
                    </span>
                    <div className="text-slate-400 group-hover:text-slate-600">
                      <Share2 className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {n.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600">{n.excerpt}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
              News and announcements added from the admin dashboard will appear here.
            </div>
          )}
        </div>
      </section>

      {/* 8. CALLOUT BANNER ("Visit us this week") — Reddish Brown Gradient */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#8B2519]/30 bg-gradient-to-r from-[#2B0B0A] via-[#5C1615] to-[#8B2519] p-8 shadow-xl sm:p-12 md:flex-row md:items-center">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
              Visit us this week
            </h2>
            <p className="text-xs leading-relaxed text-slate-200 sm:text-sm">
              We would love to meet you and your family. Here is how to reach the church office.
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
