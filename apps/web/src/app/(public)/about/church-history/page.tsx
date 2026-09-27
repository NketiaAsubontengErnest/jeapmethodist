import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, History, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Church History | Methodist Church Ghana',
  description:
    'The inspiring history of Methodism in Ghana from Thomas Birch Freeman in 1838 to Connexional Autonomy in 1961 and present expansion.',
};

export interface HistoryEvent {
  year: string;
  title: string;
  description: string;
  significance: string;
}

const HISTORICAL_TIMELINE: HistoryEvent[] = [
  {
    year: '1835',
    title: 'Arrival of Joseph Rhodes Dunwell',
    description:
      'The first Wesleyan missionary, Rev. Joseph Rhodes Dunwell, arrived at Cape Coast on January 1, 1835, responding to a request by the Society for Promoting Christian Knowledge (a group of Fante Christians).',
    significance: 'Laid the evangelical foundation of Methodism in Gold Coast (Ghana).',
  },
  {
    year: '1838',
    title: 'Pioneering Work of Thomas Birch Freeman',
    description:
      'Rev. Thomas Birch Freeman, son of an African father and English mother, arrived in Cape Coast. He traveled extensively to Kumasi, Badagry, and Dahomey, building chapels and establishing schools.',
    significance: 'Known as the Great Apostle of West Africa and Father of Ghana Methodism.',
  },
  {
    year: '1876',
    title: 'Founding of Mfantsipim School',
    description:
      'The Wesleyan High School (later Mfantsipim School) was established in Cape Coast to provide high-quality secondary education rooted in Christian values.',
    significance: 'Pioneered secondary education in Ghana, producing prominent national and international leaders.',
  },
  {
    year: '1961',
    title: 'Connexional Autonomy Granted',
    description:
      'The Methodist Church Ghana attained autonomy from the British Methodist Conference on July 28, 1961, signing the Deed of Foundation under Rev. Dr. F.C. Fynn as the first President of Conference.',
    significance:
      'Transitioned to an independent national church body governing its own circuits and dioceses.',
  },
  {
    year: '1999',
    title: 'Adoption of the Episcopal System',
    description:
      'The Church adopted the Episcopal structure, replacing the President of Conference with the Presiding Bishop and Chairmen of Districts with Diocesan Bishops.',
    significance: 'Streamlined spiritual shepherdhood and connexional administration across Ghana.',
  },
  {
    year: 'Present Day',
    title: 'Connexional Growth & Social Transformation',
    description:
      'Today, the Methodist Church Ghana comprises over 20 Dioceses, thousands of Societies, hospitals, universities (Methodist University Ghana), agricultural projects, and educational institutions nationwide.',
    significance: 'Spreading scriptural holiness and holistic community development across Ghana.',
  },
];

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── HERO BANNER ── */}
      <section className="bg-[#14309c] px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-5">
          <Badge className="bg-[#FFC72C]/20 border border-[#FFC72C]/40 text-[#FFC72C] font-bold text-xs uppercase tracking-widest hover:bg-[#FFC72C]/20">
            Heritage of Faith
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            History of Methodism in Ghana
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Tracing God&apos;s faithfulness from 1835 at Cape Coast to a vibrant nationwide
            connexion spanning education, healthcare, and evangelism.
          </p>
        </div>
      </section>

      {/* ── INTRO QUOTE ── */}
      <section className="bg-[#FAF8F5] py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm flex items-start gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#14309c] text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <p className="font-serif text-lg font-bold text-slate-900">John Wesley&apos;s Vision</p>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                &ldquo;The world is my parish.&rdquo; — John Wesley, founder of Methodism. That same
                apostolic spirit has propelled Methodist missionaries from England to the Gold Coast,
                and from Cape Coast to every corner of Ghana.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="block text-xs font-extrabold uppercase tracking-widest text-[#FFC72C]">
              Key Milestones
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-900">Historical Timeline</h2>
          </div>

          {/* Vertical Timeline */}
          <div className="relative border-l-2 border-[#14309c]/20 pl-8 sm:pl-12 ml-4 sm:ml-6 space-y-10">
            {HISTORICAL_TIMELINE.map((item, index) => (
              <div key={index} className="relative group">
                {/* Dot marker */}
                <div className="absolute -left-[2.85rem] sm:-left-[3.35rem] top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#14309c] text-white shadow-md border-2 border-white ring-2 ring-[#14309c]/20">
                  <History className="w-3.5 h-3.5" />
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-shadow group-hover:border-[#FFC72C]/40">
                  {/* Year badge */}
                  <span className="inline-flex items-center rounded-full bg-[#14309c] px-3 py-0.5 text-xs font-extrabold text-white mb-3">
                    {item.year}
                  </span>

                  <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{item.description}</p>

                  <div className="border-t border-slate-100 pt-3 flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-[#FFC72C] inline-block" />
                    <p className="text-xs text-slate-500 leading-relaxed">
                      <span className="font-bold text-[#14309c]">Key Impact: </span>
                      {item.significance}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-[#14309c] via-[#1c37ae] to-[#0f2478] border border-[#FFC72C]/20 p-8 shadow-xl text-center sm:p-12 md:flex-row md:text-left">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
              Be Part of the Living Legacy
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              The same spirit of holiness, education, and social service continues today in our local
              Society. Join us and help write the next chapter.
            </p>
          </div>
          <Link
            href="/about/leadership"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-[#FFC72C] px-8 py-4 text-sm font-extrabold text-[#14309c] shadow-md transition-all hover:bg-amber-400 hover:scale-[1.02]"
          >
            Meet Current Church Leaders <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
