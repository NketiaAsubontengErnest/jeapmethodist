import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, History } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Church History | Methodist Church Ghana',
  description: 'The inspiring history of Methodism in Ghana from Thomas Birch Freeman in 1838 to Connexional Autonomy in 1961 and present expansion.',
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
    description: 'The first Wesleyan missionary, Rev. Joseph Rhodes Dunwell, arrived at Cape Coast on January 1, 1835, responding to a request by the Society for Promoting Christian Knowledge (a group of Fante Christians).',
    significance: 'Laid the evangelical foundation of Methodism in Gold Coast (Ghana).',
  },
  {
    year: '1838',
    title: 'Pioneering Work of Thomas Birch Freeman',
    description: 'Rev. Thomas Birch Freeman, son of an African father and English mother, arrived in Cape Coast. He traveled extensively to Kumasi, Badagry, and Dahomey, building chapels and establishing schools.',
    significance: 'Known as the Great Apostle of West Africa and Father of Ghana Methodism.',
  },
  {
    year: '1876',
    title: 'Founding of Mfantsipim School',
    description: 'The Wesleyan High School (later Mfantsipim School) was established in Cape Coast to provide high-quality secondary education rooted in Christian values.',
    significance: 'Pioneered secondary education in Ghana, producing prominent national and international leaders.',
  },
  {
    year: '1961',
    title: 'Connexional Autonomy Granted',
    description: 'The Methodist Church Ghana attained autonomy from the British Methodist Conference on July 28, 1961, signing the Deed of Foundation under Rev. Dr. F.C. Fynn as the first President of Conference.',
    significance: 'Transitioned to an independent national church body governing its own circuits and dioceses.',
  },
  {
    year: '1999',
    title: 'Adoption of the Episcopal System',
    description: 'The Church adopted the Episcopal structure, replacing the President of Conference with the Presiding Bishop and Chairmen of Districts with Diocesan Bishops.',
    significance: 'Streamlined spiritual shepherdhood and connexional administration across Ghana.',
  },
  {
    year: 'Present Day',
    title: 'Connexional Growth & Social Transformation',
    description: 'Today, the Methodist Church Ghana comprises over 20 Dioceses, thousands of Societies, hospitals, universities (Methodist University Ghana), agricultural projects, and educational institutions nationwide.',
    significance: 'Spreading scriptural holiness and holistic community development across Ghana.',
  },
];

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="outline" className="rounded-full border-blue-200 bg-blue-50 font-bold text-primary">
            Heritage of Faith
          </Badge>
          <h1 className="font-serif text-4xl font-extrabold text-foreground sm:text-5xl tracking-tight">
            History of Methodism in Ghana
          </h1>
          <p className="text-lg text-muted-foreground">
            Tracing God&apos;s faithfulness from 1835 at Cape Coast to a vibrant nationwide connection spanning education, healthcare, and evangelism.
          </p>
        </div>

        {/* Timeline List */}
        <div className="relative border-l-2 border-blue-200 pl-6 sm:pl-8 ml-4 sm:ml-6 space-y-10">
          {HISTORICAL_TIMELINE.map((item, index) => (
            <div key={index} className="relative group">
              {/* Timeline Marker */}
              <div className="absolute -left-9 sm:-left-11 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs shadow-md border border-gold-400/40">
                <History className="w-3.5 h-3.5" />
              </div>

              <Card className="rounded-2xl border-border hover:shadow-md transition-shadow border-t-4 border-t-gold-500">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-primary text-primary-foreground font-extrabold text-sm px-3 py-0.5">
                      {item.year}
                    </Badge>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>

                  <div className="pt-2 border-t border-border text-xs text-gold-700 font-medium">
                    <span className="font-bold">Key Impact: </span>
                    <span>{item.significance}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom Banner — the one deliberate dark accent block on this page */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-red-700 text-white rounded-2xl p-8 sm:p-10 text-center space-y-4 shadow-xl border border-gold-500/30">
          <h2 className="font-serif text-2xl font-bold">Be Part of the Living Legacy</h2>
          <p className="text-cream-200 text-sm max-w-xl mx-auto">
            The same spirit of holiness, education, and social service continues today in our local Society.
          </p>
          <div className="pt-2">
            <Link
              href="/about/leadership"
              className="px-6 py-3 bg-gold-400 hover:bg-gold-500 text-blue-950 font-bold rounded-lg shadow inline-flex items-center gap-2 text-sm transition-colors"
            >
              Meet Current Church Leaders <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
