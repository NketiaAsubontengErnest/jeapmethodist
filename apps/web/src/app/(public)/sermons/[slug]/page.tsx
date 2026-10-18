import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPublicSermonBySlug, SermonItem } from '@/lib/api/public';
import { Card, CardContent } from '@/components/ui/card';
import { HeroBackground } from '@/components/public/hero-background';
import { ChevronLeft, Calendar, User, BookOpen, Headphones, Video, Share2 } from 'lucide-react';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let sermon: SermonItem | null = null;
  try {
    sermon = await fetchPublicSermonBySlug(slug);
  } catch (e) {
    // sermon stays null; page itself will 404
  }

  if (!sermon) {
    return { title: 'Sermon Not Found | Methodist Church Ghana' };
  }

  return {
    title: `${sermon.title} | Methodist Church Ghana Sermons`,
    description: sermon.description || `Sermon preached by ${sermon.speaker}`,
  };
}

export default async function SermonDetailPage({ params }: Props) {
  const { slug } = await params;
  let sermon: SermonItem | null = null;
  try {
    sermon = await fetchPublicSermonBySlug(slug);
  } catch (e) {
    sermon = null;
  }

  if (!sermon) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* HERO SECTION — Royal Blue with first banner image */}
      <section className="relative overflow-hidden bg-[#14309c] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 text-white">
        <HeroBackground />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-6">
            <Link
              href="/sermons"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#FFC72C] hover:underline"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Sermon Library
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              {sermon.scripture && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#FFC72C]/40 bg-[#FFC72C]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#FFC72C]">
                  <BookOpen className="w-3.5 h-3.5" /> {sermon.scripture}
                </span>
              )}
              {sermon.tags && (
                <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-white">
                  {sermon.tags}
                </span>
              )}
            </div>

            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {sermon.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#FFC72C]" />
                <span className="font-semibold text-white">{sermon.speaker}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FFC72C]" />
                <span>{new Date(sermon.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Audio Player Card */}
        {sermon.audioUrl && (
          <Card className="rounded-2xl border-border border-l-4 border-l-gold-500 bg-white shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-gold-600" /> Listen to Audio Recording
                </h3>
              </div>
              <audio controls className="w-full rounded-lg bg-muted p-2">
                <source src={sermon.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </CardContent>
          </Card>
        )}

        {/* Video Embed Section */}
        {sermon.videoUrl && (
          <Card className="rounded-2xl border-border border-t-4 border-t-primary bg-white overflow-hidden shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" /> Sermon Video Stream
              </h3>
              <div className="aspect-video bg-charcoal-900 rounded-xl overflow-hidden flex items-center justify-center relative border border-border">
                <p className="text-cream-300 text-sm">
                  Video stream player loaded ({sermon.videoUrl})
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sermon Overview & Notes */}
        <Card className="rounded-2xl border-border bg-white">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-2xl font-bold text-foreground">Message Notes &amp; Outline</h2>
            <p className="text-foreground/80 leading-relaxed space-y-4">
              {sermon.description}
            </p>

            <div className="pt-6 border-t border-border flex flex-wrap justify-between items-center gap-4">
              <div className="text-xs text-muted-foreground">
                Methodist Church Ghana &bull; Media Ministry
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Sermon
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
