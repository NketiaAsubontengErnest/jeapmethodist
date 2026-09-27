import { Metadata } from 'next';
import Link from 'next/link';
import { fetchPublicMinistries, MinistryPublicItem } from '@/lib/api/public';
import { Users, Clock, ArrowRight, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Church Organizations | Methodist Church Ghana',
  description: 'Explore the fellowship organizations, choir, youth organizations, and class systems of the Methodist Church Ghana.',
};

export default async function MinistriesPage() {
  let ministries: MinistryPublicItem[] = [];
  try {
    ministries = await fetchPublicMinistries();
  } catch (err) {
    console.error('Failed to fetch public organizations:', err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      {/* 1. HERO SECTION — Royal Blue #14309c Background */}
      <section className="relative overflow-hidden bg-[#14309c] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#FFC72C]/40 bg-[#FFC72C]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#FFC72C]">
              Fellowship &amp; Service
            </span>

            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Church Organizations
            </h1>

            <p className="text-base leading-relaxed text-slate-200 sm:text-lg">
              Methodism thrives through small groups, choir ministries, and fellowship organizations where every member finds community, grows spiritually, and serves God and humanity with their gifts.
            </p>
          </div>
        </div>
      </section>

      {/* 2. MINISTRIES GRID — White Background */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl">All Active Organizations</h2>
            <div className="mx-4 hidden h-[2px] flex-1 bg-[#FFC72C]/70 sm:block" />
          </div>

          {ministries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500">
              No organizations have been published yet. Check back soon, or visit the admin dashboard to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ministries.map((ministry) => (
                <div
                  key={ministry.id}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#FFC72C]/50"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#14309c] text-[#FFC72C] shadow-sm">
                        <Users className="h-7 w-7" />
                      </div>
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-extrabold uppercase text-[#14309c]">
                        Organization
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-bold text-slate-900 group-hover:text-[#14309c] transition-colors">
                      {ministry.name}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {ministry.description || 'Dedicated to spiritual growth, prayer, discipline, and fellowship in the body of Christ.'}
                    </p>

                    {ministry.meetingSchedule && (
                      <div className="flex items-center gap-2 pt-3 text-xs font-semibold text-slate-500 border-t border-slate-100">
                        <Clock className="h-4 w-4 text-[#FFC72C]" />
                        <span>Meeting: {ministry.meetingSchedule}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-6">
                    <Button
                      asChild
                      className="w-full rounded-lg bg-[#14309c] px-5 py-3 text-xs font-extrabold text-white shadow transition-all hover:bg-[#0f2478]"
                    >
                      <Link href={`/ministries/${ministry.slug}`} className="flex items-center justify-center gap-2">
                        Learn More &amp; Join <ArrowRight className="h-4 w-4 text-[#FFC72C]" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. CALLOUT BANNER — Reddish Brown Gradient */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[#8B2519]/30 bg-gradient-to-r from-[#2B0B0A] via-[#5C1615] to-[#8B2519] p-8 text-white shadow-xl sm:p-12 md:flex-row md:items-center">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">
              Find Your Place in God’s Household
            </h2>
            <p className="text-xs leading-relaxed text-slate-200 sm:text-sm">
              Whether you are a newcomer or a long-time member, joining a fellowship group, choir, or youth organization is the best way to build lifelong friendships.
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

