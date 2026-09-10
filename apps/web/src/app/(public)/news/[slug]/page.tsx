import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPublicNewsBySlug, NewsItem } from '@/lib/api/public';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Calendar, Share2 } from 'lucide-react';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let article: NewsItem | null = null;
  try {
    article = await fetchPublicNewsBySlug(slug);
  } catch (e) {
    // article stays null; page itself will 404
  }

  if (!article) {
    return { title: 'Article Not Found | Methodist Church Ghana' };
  }

  return {
    title: `${article.title} | Methodist Church Ghana News`,
    description: article.excerpt || article.title,
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  let article: NewsItem | null = null;
  try {
    article = await fetchPublicNewsBySlug(slug);
  } catch (e) {
    article = null;
  }

  if (!article) {
    notFound();
  }

  const pubDate = article.publishedAt ? new Date(article.publishedAt) : new Date();

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to News &amp; Announcements
          </Link>
        </div>

        {/* Article Header & Image */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm space-y-6">
          {article.featuredImageUrl && (
            <div className="h-64 sm:h-96 w-full overflow-hidden bg-cream-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.featuredImageUrl} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6 sm:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <Badge className="bg-blue-50 text-primary font-bold">
                Church Press Release
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>{pubDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-lg text-muted-foreground font-medium italic border-l-4 border-l-gold-500 pl-4 py-1">
                {article.excerpt}
              </p>
            )}

            <div className="prose max-w-none text-foreground/85 whitespace-pre-line leading-relaxed pt-4 border-t border-border">
              {article.content}
            </div>

            <div className="pt-6 flex justify-between items-center border-t border-border text-xs text-muted-foreground">
              <span>Methodist Church Ghana Secretariat</span>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md font-semibold text-foreground hover:bg-secondary transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-primary" /> Share Article
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
