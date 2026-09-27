import { Metadata } from 'next';
import Link from 'next/link';
import { fetchPublicSermons, SermonItem } from '@/lib/api/public';
import { BookOpen, Video, Headphones, Calendar, User, ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Sermon Library & Messages | Methodist Church Ghana',
  description: 'Listen to and watch spirit-filled sermons, Bible teachings, and Sunday messages from Methodist ministers and guest preachers.',
};

export default async function SermonsPage() {
  let sermons: SermonItem[] = [];
  try {
    sermons = await fetchPublicSermons();
  } catch (err) {
    console.error('Failed to fetch public sermons:', err);
  }

  const featured = sermons[0];

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* 1. HERO SECTION — Royal Blue #14309c Background */}
      <section className="relative overflow-hidden bg-[#14309c] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#FFC72C]/40 bg-[#FFC72C]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#FFC72C]">
              Word of God &amp; Media
            </span>

            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Sermons &amp; Bible Teaching
            </h1>

            <p className="text-base leading-relaxed text-slate-200 sm:text-lg">
              Be encouraged, inspired, and spiritually nourished by the preaching of the Gospel. Stream or listen to Sunday messages and mid-week Bible teachings anytime.
            </p>
          </div>
        </div>
      </section>

      {/* 2. FEATURED SERMON SECTION — White Background */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          {featured && (
            <div className="relative overflow-hidden rounded-2xl border border-[#FFC72C]/30 bg-gradient-to-br from-[#1c37ae] via-[#14309c] to-[#0a1a58] p-8 text-white shadow-2xl sm:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="space-y-6 lg:col-span-7">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFC72C] px-3.5 py-1 text-xs font-extrabold text-[#14309c]">
                      Featured Message
                    </span>
                    {featured.scripture && (
                      <span className="text-xs text-[#FFC72C] flex items-center gap-1 font-bold">
                        <BookOpen className="w-3.5 h-3.5" /> {featured.scripture}
                      </span>
                    )}
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
                    {featured.title}
                  </h2>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3">
                    {featured.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#FFC72C]" />
                      <span className="font-bold text-white">{featured.speaker}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#FFC72C]" />
                      <span>{new Date(featured.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      asChild
                      size="lg"
                      className="rounded-lg bg-[#FFC72C] px-7 py-6 text-sm font-extrabold text-[#14309c] shadow-md transition-all hover:bg-amber-400 hover:scale-[1.02]"
                    >
                      <Link href={`/sermons/${featured.slug}`} className="flex items-center gap-2">
                        <PlayCircle className="w-5 h-5" /> Watch / Listen Full Message
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-[#FFC72C]/30 flex items-center justify-center group cursor-pointer shadow-xl">
                    {featured.thumbnailUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={featured.thumbnailUrl}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-center p-6 space-y-2">
                        <Video className="w-12 h-12 text-[#FFC72C] mx-auto" />
                        <p className="text-xs font-bold text-slate-300">Methodist Media Ministry</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-[#14309c]/90 text-[#FFC72C] flex items-center justify-center shadow-2xl border border-[#FFC72C] group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-8 h-8 ml-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sermon Library Grid */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Sermon Archive &amp; Messages
              </h2>
              <div className="mx-4 hidden h-[2px] flex-1 bg-[#FFC72C]/70 sm:block" />
            </div>

            {sermons.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500">
                No sermons have been published yet. Check back soon, or visit the admin dashboard to add one.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sermons.map((sermon) => (
                  <div
                    key={sermon.id}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#FFC72C]/50"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-[#14309c]" />
                          {new Date(sermon.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {sermon.scripture && (
                          <span className="rounded-full border border-[#FFC72C]/40 bg-[#FFC72C]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#14309c]">
                            {sermon.scripture}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-[#14309c] transition-colors line-clamp-2">
                          {sermon.title}
                        </h3>
                        <p className="text-xs font-bold text-amber-700">
                          Preacher: {sermon.speaker}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {sermon.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-2 border-t border-slate-100">
                        {sermon.videoUrl && (
                          <span className="flex items-center gap-1 text-[#14309c] font-bold">
                            <Video className="w-3.5 h-3.5" /> Video
                          </span>
                        )}
                        {sermon.audioUrl && (
                          <span className="flex items-center gap-1 text-amber-700 font-bold">
                            <Headphones className="w-3.5 h-3.5" /> Audio
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button
                        asChild
                        className="w-full rounded-lg bg-[#14309c] px-5 py-3 text-xs font-extrabold text-white shadow transition-all hover:bg-[#0f2478]"
                      >
                        <Link href={`/sermons/${sermon.slug}`} className="flex items-center justify-center gap-2">
                          Listen / Watch Sermon <ArrowRight className="h-4 w-4 text-[#FFC72C]" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. CALLOUT BANNER — Reddish Brown Gradient */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#8B2519]/30 bg-gradient-to-r from-[#2B0B0A] via-[#5C1615] to-[#8B2519] p-8 text-white shadow-xl sm:p-12 md:flex-row md:items-center">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">
              Hear the Word Live Every Sunday
            </h2>
            <p className="text-xs leading-relaxed text-slate-200 sm:text-sm">
              Join our vibrant physical and online worship services every Sunday at 7:00 AM &amp; 9:30 AM.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="shrink-0 rounded-lg bg-[#FFC72C] px-8 py-6 text-sm font-extrabold text-[#14309c] shadow-md transition-colors hover:bg-amber-400"
          >
            <Link href="/visit-us">Plan Your Visit</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

