import { Metadata } from 'next';
import Link from 'next/link';
import { fetchPublicNews, NewsItem } from '@/lib/api/public';
import { Calendar, ArrowRight, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'News & Announcements | Methodist Church Ghana',
  description: 'Official announcements, connexional statements, diocesan news, and community press releases from the Methodist Church Ghana.',
};

export default async function NewsPage() {
  let newsArticles: NewsItem[] = [];
  try {
    newsArticles = await fetchPublicNews();
  } catch (err) {
    console.error('Failed to fetch public news:', err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* 1. HERO SECTION — Royal Blue #14309c Background */}
      <section className="relative overflow-hidden bg-[#14309c] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#FFC72C]/40 bg-[#FFC72C]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#FFC72C]">
              <Sparkles className="h-3.5 w-3.5" /> Official Media &amp; Updates
            </span>

            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              News &amp; Press Releases
            </h1>

            <p className="text-base leading-relaxed text-slate-200 sm:text-lg">
              Read official announcements, synod resolutions, welfare initiatives, and inspiring stories of God&apos;s work across the Methodist Connection.
            </p>
          </div>
        </div>
      </section>

      {/* 2. ARTICLES GRID SECTION — White Background */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">Latest Articles &amp; Notices</h2>
            <div className="mx-4 hidden h-[2px] flex-1 bg-[#FFC72C]/70 sm:block" />
          </div>

          {newsArticles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500">
              No news articles have been published yet. Check back soon, or visit the admin dashboard to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsArticles.map((article) => {
                const pubDate = article.publishedAt ? new Date(article.publishedAt) : new Date();
                return (
                  <div
                    key={article.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#FFC72C]/50 space-y-4"
                  >
                    <div className="space-y-4">
                      {article.featuredImageUrl && (
                        <div className="h-44 -mx-6 -mt-6 overflow-hidden bg-slate-900 mb-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={article.featuredImageUrl}
                            alt={article.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold uppercase tracking-wider text-[#FFC72C]">
                          {pubDate.toLocaleDateString(undefined, {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                          <Share2 className="h-4 w-4" />
                        </div>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {article.excerpt || article.content}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <Button
                        asChild
                        className="w-full rounded-lg bg-[#14309c] px-5 py-3 text-xs font-extrabold text-white shadow transition-all hover:bg-[#0f2478]"
                      >
                        <Link href={`/news/${article.slug}`} className="flex items-center justify-center gap-2">
                          Read Full Story <ArrowRight className="h-4 w-4 text-[#FFC72C]" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. CALLOUT BANNER — Reddish Brown Gradient */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#8B2519]/30 bg-gradient-to-r from-[#2B0B0A] via-[#5C1615] to-[#8B2519] p-8 text-white shadow-xl sm:p-12 md:flex-row md:items-center">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">
              Stay Connected &amp; Informed
            </h2>
            <p className="text-xs leading-relaxed text-slate-200 sm:text-sm">
              Subscribe to weekly announcements or join our WhatsApp announcement channel through the church secretariat.
            </p>
          </div>

          <Button
            asChild
            size="lg"
            className="shrink-0 rounded-lg bg-[#FFC72C] px-8 py-6 text-sm font-extrabold text-[#14309c] shadow-md transition-colors hover:bg-amber-400"
          >
            <Link href="/contact">Contact Us For Updates</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

