'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicSettings } from '@/lib/api/public';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HeartHandshake,
  Smile,
  BookOpen,
  ChevronRight,
  MapPin,
  Clock,
  Shirt,
  Car,
  Cross,
  Coffee,
} from 'lucide-react';

const WHAT_TO_EXPECT = [
  {
    icon: Smile,
    title: 'Warm Welcome & Ushering',
    description:
      'Our welcoming team of stewards and ushers will greet you at the entrance, help you locate a seat, and hand you a service order bulletin.',
    accentColor: 'bg-[#14309c]',
  },
  {
    icon: BookOpen,
    title: 'Liturgical & Spirit-Filled Worship',
    description:
      'Experience sound Methodist hymnody (from the Methodist Hymn Book / CAN), sacred choir anthems, biblically grounded preaching, and passionate prayer.',
    accentColor: 'bg-[#FFC72C]',
  },
  {
    icon: HeartHandshake,
    title: "Children's Sunday School",
    description:
      'Bring your children! Dedicated Sunday school teachers provide age-appropriate Bible lessons, memory verses, and snacks in a safe environment.',
    accentColor: 'bg-[#14309c]',
  },
];

const FAQ = [
  {
    icon: Clock,
    question: 'What are your service times?',
    settingsKey: 'serviceSchedule' as const,
    fallback: 'Service times will be posted here once configured.',
  },
  {
    icon: Shirt,
    question: 'What should I wear?',
    answer:
      'Feel free to wear traditional Ghanaian cloth/Kente or formal smart-casual attire. Members of fellowship organizations wear their uniforms on special Sundays.',
  },
  {
    icon: Car,
    question: 'Is there parking on premises?',
    answer:
      'Yes! Secure parking is available on the church grounds with traffic wardens guiding arrivals.',
  },
  {
    icon: Cross,
    question: 'Who can take Holy Communion?',
    answer:
      'Holy Communion is celebrated monthly (usually 1st Sunday). In the Methodist tradition, all baptized and confirmed believers who love the Lord are welcome at Christ\u2019s table.',
  },
  {
    icon: Coffee,
    question: 'Is there fellowship after service?',
    answer:
      'Yes! After the main service there is a period of fellowship where newcomers can meet class leaders and members over refreshments.',
  },
  {
    icon: HeartHandshake,
    question: 'How do I join a Class?',
    answer:
      'Speak with any of our stewards or pastoral team. Every Methodist is assigned to a Class led by a Class Leader for discipleship and pastoral care.',
  },
];

export default function VisitUsPage() {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: fetchPublicSettings,
  });

  const churchTitle =
    settings?.church_name && settings?.society_name
      ? `${settings.church_name} — ${settings.society_name}`
      : settings?.church_name || settings?.society_name;

  const serviceSchedule =
    [settings?.sunday_service_1, settings?.sunday_service_2, settings?.midweek_service]
      .filter(Boolean)
      .join(' | ') || settings?.sunday_service_times;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── HERO BANNER ── */}
      <section className="bg-[#14309c] px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-5">
          <Badge className="bg-[#FFC72C]/20 border border-[#FFC72C]/40 text-[#FFC72C] font-bold text-xs uppercase tracking-widest hover:bg-[#FFC72C]/20">
            Welcome Guest!
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Plan Your First Visit
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {churchTitle
              ? `We are thrilled to welcome you to ${churchTitle}. `
              : 'We are thrilled to welcome you. '}
            Here is a friendly guide on what to expect when you join us for Sunday divine service.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="rounded-lg bg-[#FFC72C] px-7 py-6 text-sm font-extrabold text-[#14309c] shadow-md hover:bg-amber-400 transition-all hover:scale-[1.02]"
            >
              <Link href="/contact">Contact Secretariat</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-lg border-white/30 bg-white/10 px-7 py-6 text-sm font-bold text-white hover:bg-white/20 transition-all"
            >
              <Link href="/about">Learn About Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── WHAT TO EXPECT ── */}
      <section className="bg-[#FAF8F5] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl font-bold text-slate-900">What to Expect on Sunday</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              From the moment you arrive, you will experience warmth, reverence, and authentic community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHAT_TO_EXPECT.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm flex flex-col gap-5 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${item.accentColor} flex items-center justify-center text-white flex-shrink-0`}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE SCHEDULE QUICK-VIEW ── */}
      {serviceSchedule && (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-[#14309c]/20 bg-[#14309c]/5 p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#14309c] text-white">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-center sm:text-left flex-1">
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#14309c]">
                  Service Schedule
                </p>
                <p className="text-sm font-semibold text-slate-900">{serviceSchedule}</p>
              </div>
              <Button asChild className="rounded-lg bg-[#14309c] text-white font-bold hover:bg-[#0f2478] transition-colors">
                <Link href="/contact" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Get Directions
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── VISITOR FAQ ── */}
      <section className="bg-[#FAF8F5] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="block text-xs font-extrabold uppercase tracking-widest text-[#FFC72C]">
              Common Questions
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              Frequently Asked Questions by Visitors
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FAQ.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#14309c]/10 text-[#14309c]">
                    <item.icon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-serif font-bold text-slate-900 text-base">{item.question}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-12">
                  {item.settingsKey === 'serviceSchedule'
                    ? serviceSchedule || item.fallback
                    : item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER — Royal Blue gradient ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-[#14309c] via-[#1c37ae] to-[#0f2478] border border-[#FFC72C]/20 p-8 shadow-xl text-center sm:p-12 md:flex-row md:text-left">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
              Have Questions Before Coming?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Reach out to our welcoming stewards or pastoral team. We can arrange someone to meet you at the door!
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="shrink-0 rounded-lg bg-[#FFC72C] px-8 py-6 text-sm font-extrabold text-[#14309c] shadow-md transition-all hover:bg-amber-400 hover:scale-[1.02]"
          >
            <Link href="/contact" className="flex items-center gap-2">
              Contact Welcome Secretariat <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
