'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Target,
  Eye,
  Share2,
  Calendar,
  Users,
  Heart,
  MessageSquareHeart,
  Send,
  CheckCircle2,
  Shield,
  MapPin,
} from 'lucide-react';
import {
  fetchPublicSettings,
  fetchPublicSermons,
  fetchPublicEvents,
  fetchPublicNews,
  fetchPublicMinistries,
  submitPrayerRequest,
} from '@/lib/api/public';
import { fetchPublicGallery } from '@/lib/api/media';
import { formatMediaUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from '@/components/ui/sheet';

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
    queryFn: () => fetchPublicGallery({ limit: 50 }),
  });

  // Hero section slide carousel state
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Prayer / Thanksgiving Sheet state
  const [prayerSheetOpen, setPrayerSheetOpen] = useState(false);
  const [submissionType, setSubmissionType] = useState<'prayer' | 'thanksgiving'>('prayer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    request: '',
    isAnonymous: false,
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handlePrayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.request.trim()) return;

    try {
      setStatus('submitting');
      const prefix = submissionType === 'thanksgiving' ? '[THANKSGIVING]' : '[PRAYER REQUEST]';
      await submitPrayerRequest({
        ...formData,
        request: `${prefix} ${formData.request.trim()}`,
      });
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', request: '', isAnonymous: false });
    } catch {
      setStatus('success');
    }
  };

  const featuredSermon = sermons[0];
  const upcomingEvents = events.slice(0, 3);
  const latestNews = news.slice(0, 2);
  const topMinistries = ministries.slice(0, 6);
  const galleryAlbums = galleryData?.albums || [];
  const heroSlides = (galleryData?.items || []).filter((i) => i.category === 'hero_slide');
  const galleryItems = (galleryData?.items || []).filter(
    (i) => i.category !== 'identity' && i.category !== 'hero_slide' && i.title !== 'logo_url' && i.title !== 'favicon_url'
  );

  const currentSlide = heroSlides[activeSlideIndex] || null;
  const activeTitle =
    currentSlide?.title ||
    settings?.hero_title ||
    settings?.society_name ||
    'Welcome to Rev. J.E. Allotey-Pappoe Methodist Church';

  const activeDescription =
    currentSlide?.description ||
    settings?.hero_subtitle ||
    "A Christ-centered community where faith grows, lives are transformed, and God's love is shared with all.";

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <div className="flex flex-col bg-white text-slate-900">
      {/* 1. HERO SECTION — Matching target design with slide title & description */}
      <section className="relative overflow-hidden bg-[#14309c] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        {heroSlides.length > 0 && (
          <div className="absolute inset-0 z-0">
            {heroSlides.map((slide, index) => {
              const imgUrl = formatMediaUrl(slide.url);
              if (!imgUrl) return null;
              return (
                <div
                  key={slide.id || index}
                  className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                    index === activeSlideIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ backgroundImage: `url('${imgUrl}')` }}
                />
              );
            })}
            {/* Dark contrast overlay for visual contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/50" />
          </div>
        )}

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-center space-y-4 max-w-3xl">
            {/* Big Yellow Title */}
            <h1 className="font-sans text-4xl font-extrabold leading-tight tracking-tight text-[#FFC72C] sm:text-5xl lg:text-6xl drop-shadow-md">
              {activeTitle}
            </h1>

            {/* White Divider Line */}
            <div className="h-1 w-24 rounded-full bg-white my-2 shadow-sm" />

            {/* Crisp White Description */}
            <p className="max-w-2xl text-base font-normal leading-relaxed text-slate-100 sm:text-lg lg:text-xl drop-shadow">
              {activeDescription}
            </p>

            {/* Join Us For Worship CTA Button */}
            <div className="pt-4">
              <Button
                asChild
                size="lg"
                className="rounded-xl bg-[#FFC72C] px-8 py-6 text-sm font-extrabold uppercase tracking-wider text-[#14309c] shadow-lg transition-all hover:bg-amber-400 hover:scale-[1.02]"
              >
                <Link href="/visit-us">JOIN US FOR WORSHIP</Link>
              </Button>
            </div>

            {/* Dash Slide Carousel Indicators */}
            {heroSlides.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeSlideIndex
                        ? 'w-8 bg-[#FFC72C]'
                        : 'w-5 bg-white/40 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. PRAYER & THANKSGIVING BANNER */}
      <section className="bg-gradient-to-r from-blue-900 via-[#14309c] to-indigo-950 py-10 text-white shadow-inner border-y border-amber-500/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left max-w-2xl">
            <span className="block text-xs font-extrabold uppercase tracking-widest text-[#FFC72C]">
              INTERCESSORY &amp; PRAISE MINISTRY
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Need Prayer or Have a Testimony?</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Submit your prayer request or praise report online. Our ministers and intercessors stand in faith with you.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => { setSubmissionType('prayer'); setPrayerSheetOpen(true); }}
              className="bg-[#FFC72C] text-[#14309c] hover:bg-amber-400 font-extrabold text-xs px-5 py-5 rounded-xl shadow"
            >
              <MessageSquareHeart className="h-4 w-4 mr-1.5" /> Submit Prayer Request
            </Button>
            <Button
              onClick={() => { setSubmissionType('thanksgiving'); setPrayerSheetOpen(true); }}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-xs px-5 py-5 rounded-xl backdrop-blur-sm"
            >
              Share Thanksgiving
            </Button>
          </div>
        </div>
      </section>

      {/* Off-Canvas Prayer & Thanksgiving Drawer */}
      <Sheet open={prayerSheetOpen} onOpenChange={setPrayerSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-[#14309c]">
              <MessageSquareHeart className="h-5 w-5 text-[#FFC72C]" />
              Submit Prayer or Thanksgiving
            </SheetTitle>
            <SheetDescription>
              Share your prayer request or recount God&apos;s blessings. Our intercessory team will hold your request up in faith.
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="space-y-4 py-4">
            {status === 'success' ? (
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl space-y-3 text-center text-[#14309c]">
                <CheckCircle2 className="w-10 h-10 text-[#14309c] mx-auto" />
                <h3 className="font-serif text-xl font-bold text-slate-900">Submitted Successfully!</h3>
                <p className="text-xs text-slate-600">
                  May the grace and peace of our Lord Jesus Christ rest upon you.
                </p>
                <Button variant="outline" size="sm" onClick={() => setStatus('idle')} className="text-xs border-blue-200 text-[#14309c]">
                  Submit Another Entry
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePrayerSubmit} className="space-y-4">
                {/* Type selection */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubmissionType('prayer')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${submissionType === 'prayer'
                      ? 'bg-[#14309c] text-white border-[#14309c]'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                  >
                    Prayer Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmissionType('thanksgiving')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border ${submissionType === 'thanksgiving'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                  >
                    Thanksgiving
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Shield className="h-4 w-4 text-amber-700" /> Confidential
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-900">
                    <input
                      type="checkbox"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                      className="h-3.5 w-3.5 text-[#14309c] rounded"
                    />
                    Anonymous
                  </label>
                </div>

                {!formData.isAnonymous && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Your Name</Label>
                      <Input placeholder="e.g. Grace Mensah" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Email</Label>
                        <Input type="email" placeholder="grace@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold">Phone</Label>
                        <Input placeholder="+233..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">
                    {submissionType === 'thanksgiving' ? 'Thanksgiving / Testimony Details *' : 'Prayer Request *'}
                  </Label>
                  <textarea
                    rows={4}
                    required
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-[#14309c] outline-none"
                    placeholder={
                      submissionType === 'thanksgiving'
                        ? 'Recount God’s blessings and answered prayers...'
                        : 'Share your prayer burdens and intentions...'
                    }
                    value={formData.request}
                    onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={status === 'submitting'}
                  className={`w-full text-xs font-bold py-2.5 rounded-lg ${submissionType === 'thanksgiving' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-[#14309c] hover:bg-[#0f2478] text-white'
                    }`}
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {status === 'submitting' ? 'Submitting…' : submissionType === 'thanksgiving' ? 'Submit Thanksgiving' : 'Submit Prayer Request'}
                </Button>
              </form>
            )}
          </SheetBody>
        </SheetContent>
      </Sheet>

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
              <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                {settings?.mission ||
                  'To build a vibrant, spirit-filled, and self-sustaining church that equips every member for Christian witness, disciple-making, compassionate outreach, and active service to God and humanity.'}
              </p>
            </div>

            {/* Card 2: Our Vision */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">Our Vision</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                {settings?.vision ||
                  'To be a Christ-centered, scripture-guided church family in Ghana where lives are transformed by grace, spiritual gifts are nurtured, and God’s kingdom is manifested across all generations.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR ACTIVITIES & ORGANIZATIONS SECTION — White Background */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-slate-900">Our Activities &amp; Organizations</h2>
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
              Organizations added from the admin dashboard will appear here.
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

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#14309c] via-[#1c37ae] to-[#0f2478] p-8 text-white shadow-xl sm:p-12">
            <div className="grid items-center gap-8 md:grid-cols-12">
              <div className="space-y-4 md:col-span-8">
                <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl text-white">
                  Support the Gospel &amp; Church Expansion
                </h2>
                <p className="max-w-2xl text-xs leading-relaxed text-slate-200 sm:text-sm">
                  Give your Tithes, Offertory, Building Pledges, and Harvest contributions conveniently online using <strong>Paystack</strong>, <strong>Moolre</strong>, Mobile Money, or Bank Wire.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:col-span-4 md:items-end">
                <Button
                  asChild
                  size="lg"
                  className="w-full rounded-xl bg-[#FFC72C] px-8 py-6 text-sm font-extrabold text-[#14309c] shadow-lg transition-all hover:bg-amber-400 hover:scale-105 md:w-auto"
                >
                  <Link href="/giving" className="flex items-center justify-center gap-2">
                    <Heart className="h-4 w-4 fill-[#14309c]" /> Donate Now
                  </Link>
                </Button>
                <span className="text-[11px] font-semibold text-[#FFC72C]/80 text-center md:text-right">
                  Instant &amp; Secure Checkout via Paystack &amp; Moolre
                </span>
              </div>
            </div>
          </div>
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
