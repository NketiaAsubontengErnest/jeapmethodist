import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPublicSermonBySlug, SermonItem } from '@/lib/api/public';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Calendar, User, BookOpen, Headphones, Video, Share2 } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

const FALLBACK_SERMON: SermonItem = {
  id: '1',
  title: 'Walking in Divine Grace & Stewardship',
  slug: 'walking-in-divine-grace',
  speaker: 'Very Rev. Dr. Emmanuel K. Asante',
  date: '2026-09-06',
  scripture: '2 Corinthians 9:8-11',
  description: 'A deep biblical reflection on how God multiplies grace and entrusts resources to believers for kingdom advancement and community transformation.',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  tags: 'Grace, Stewardship, Faith',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let sermon: SermonItem | null = null;
  try {
    sermon = await fetchPublicSermonBySlug(slug);
  } catch (e) {
    // fallback
  }

  if (!sermon) {
    sermon = FALLBACK_SERMON;
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
    sermon = FALLBACK_SERMON;
  }

  if (!sermon) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/sermons"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Sermon Library
          </Link>
        </div>

        {/* Sermon Title Header */}
        <div className="bg-white border border-border rounded-2xl p-6 sm:p-10 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {sermon.scripture && (
              <Badge className="bg-blue-50 text-primary border-transparent">
                <BookOpen className="w-3.5 h-3.5 mr-1 inline" /> {sermon.scripture}
              </Badge>
            )}
            {sermon.tags && (
              <Badge variant="outline" className="border-gold-300 bg-gold-50 text-gold-700">
                {sermon.tags}
              </Badge>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            {sermon.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">{sermon.speaker}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{new Date(sermon.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

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
