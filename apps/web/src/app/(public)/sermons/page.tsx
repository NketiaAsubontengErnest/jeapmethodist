import { Metadata } from 'next';
import Link from 'next/link';
import { fetchPublicSermons, SermonItem } from '@/lib/api/public';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Video, Headphones, Calendar, User, ArrowRight, PlayCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="border-blue-200 bg-blue-50 font-bold text-primary">
            Word of God &amp; Media
          </Badge>
          <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl tracking-tight">
            Sermons &amp; Bible Teaching
          </h1>
          <p className="text-lg text-muted-foreground">
            Be encouraged and transformed by the preaching of the Gospel. Stream or listen to Sunday sermons and mid-week Bible studies anytime.
          </p>
        </div>

        {/* Featured Sermon Hero — deliberate dark accent block, the one exception on this page */}
        {featured && (
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-red-700 rounded-2xl overflow-hidden shadow-xl text-white border border-gold-500/30">
            <div className="p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-gold-400 text-blue-950 font-bold hover:bg-gold-500">
                    Latest Message
                  </Badge>
                  {featured.scripture && (
                    <span className="text-xs text-gold-300 flex items-center gap-1 font-semibold">
                      <BookOpen className="w-3.5 h-3.5" /> {featured.scripture}
                    </span>
                  )}
                </div>

                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
                  {featured.title}
                </h2>

                <p className="text-cream-200 text-sm sm:text-base leading-relaxed line-clamp-3">
                  {featured.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-xs text-cream-300">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gold-400" />
                    <span className="font-semibold text-white">{featured.speaker}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gold-400" />
                    <span>{new Date(featured.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-4">
                  <Link
                    href={`/sermons/${featured.slug}`}
                    className="px-6 py-3 bg-gold-400 hover:bg-gold-500 text-blue-950 font-bold rounded-lg shadow inline-flex items-center gap-2 text-sm transition-colors"
                  >
                    <PlayCircle className="w-5 h-5" /> Watch / Listen Now
                  </Link>
                </div>
              </div>

              <div className="relative aspect-video rounded-xl overflow-hidden bg-charcoal-900 border border-gold-400/20 flex items-center justify-center group cursor-pointer">
                {featured.thumbnailUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={featured.thumbnailUrl}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <Video className="w-12 h-12 text-gold-400 mx-auto" />
                    <p className="text-sm font-semibold text-cream-300">Methodist Church Media</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-blue-900/90 text-gold-400 flex items-center justify-center shadow-lg border border-gold-400 group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-8 h-8 ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sermon Grid */}
        <section className="space-y-6">
          <div className="flex justify-between items-center border-b pb-4 border-border">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              All Sermons &amp; Archives
            </h2>
          </div>

          {sermons.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              No sermons have been published yet. Check back soon, or visit the admin dashboard to add one.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sermons.map((sermon) => (
              <Card
                key={sermon.id}
                className="flex flex-col justify-between rounded-2xl border-border border-t-4 border-t-primary bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(sermon.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {sermon.scripture && (
                      <Badge variant="outline" className="text-xs border-blue-200 bg-blue-50 text-primary font-semibold">
                        {sermon.scripture}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif text-xl font-bold text-foreground line-clamp-2">
                      {sermon.title}
                    </h3>
                    <p className="text-xs font-bold text-gold-700">
                      By {sermon.speaker}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {sermon.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                    {sermon.videoUrl && (
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <Video className="w-3.5 h-3.5" /> Video available
                      </span>
                    )}
                    {sermon.audioUrl && (
                      <span className="flex items-center gap-1 text-gold-700 font-medium">
                        <Headphones className="w-3.5 h-3.5" /> Audio available
                      </span>
                    )}
                  </div>
                </CardContent>

                <div className="px-6 pb-6 pt-0">
                  <Link
                    href={`/sermons/${sermon.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg text-sm transition-colors border border-gold-400/20"
                  >
                    Listen / Watch Sermon <ArrowRight className="w-4 h-4 text-gold-300" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
