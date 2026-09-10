import { Metadata } from 'next';
import Link from 'next/link';
import { fetchPublicNews, NewsItem } from '@/lib/api/public';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="outline" className="border-blue-200 bg-blue-50 font-bold text-primary">
            Official Media &amp; Updates
          </Badge>
          <h1 className="font-serif text-4xl font-bold text-foreground sm:text-5xl tracking-tight">
            News &amp; Press Releases
          </h1>
          <p className="text-lg text-muted-foreground">
            Read official announcements, synod resolutions, welfare initiatives, and stories of God&rsquo;s work across the Methodist Connection.
          </p>
        </div>

        {/* Articles Grid */}
        {newsArticles.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No news articles have been published yet. Check back soon, or visit the admin dashboard to add one.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsArticles.map((article) => {
            const pubDate = article.publishedAt ? new Date(article.publishedAt) : new Date();
            return (
              <Card key={article.id} className="flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl border-border border-t-4 border-t-primary bg-white overflow-hidden">
                <div>
                  {article.featuredImageUrl && (
                    <div className="h-48 overflow-hidden bg-cream-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.featuredImageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>{pubDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-foreground line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {article.excerpt || article.content}
                    </p>
                  </CardContent>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <Link
                    href={`/news/${article.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-blue-800 text-primary-foreground font-semibold rounded-lg text-sm transition-colors shadow"
                  >
                    Read Full Story <ArrowRight className="w-4 h-4 text-gold-300" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
