'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import { fetchNewsArticle, updateNewsArticle, deleteNewsArticle } from '@/lib/api/news';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FormValues {
  title: string;
  excerpt: string;
  content: string;
  featuredImageUrl: string;
  isPublished: boolean;
}

export default function NewsArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const articleQuery = useQuery({ queryKey: ['news-admin', id], queryFn: () => fetchNewsArticle(id) });
  const { register, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    if (articleQuery.data) {
      const a = articleQuery.data;
      reset({
        title: a.title,
        excerpt: a.excerpt ?? '',
        content: a.content,
        featuredImageUrl: a.featuredImageUrl ?? '',
        isPublished: a.isPublished,
      });
    }
  }, [articleQuery.data, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      updateNewsArticle(id, {
        title: values.title,
        excerpt: values.excerpt || undefined,
        content: values.content,
        featuredImageUrl: values.featuredImageUrl || undefined,
        isPublished: values.isPublished,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-admin'] });
      setSuccess(true);
      setError(null);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to save article'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteNewsArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-admin'] });
      router.push('/admin/news');
    },
  });

  const canUpdate = hasPermission('news.update');
  const canDelete = hasPermission('news.delete');

  if (articleQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading article…
      </div>
    );
  }

  if (articleQuery.isError || !articleQuery.data) {
    return <p className="py-8 text-center text-sm text-destructive">Article not found.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
            <Link href="/admin/news">
              <ArrowLeft className="h-4 w-4" />
              Back to news
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Edit article</h1>
        </div>
        {canDelete && (
          <Button variant="outline" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Article content</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((values) => {
              setError(null);
              updateMutation.mutate(values);
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" disabled={!canUpdate} {...register('title')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea id="excerpt" rows={2} disabled={!canUpdate} {...register('excerpt')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featuredImageUrl">Featured image URL</Label>
              <Input id="featuredImageUrl" disabled={!canUpdate} {...register('featuredImageUrl')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" rows={14} disabled={!canUpdate} {...register('content')} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" disabled={!canUpdate} className="h-4 w-4 rounded border-input" {...register('isPublished')} />
              Published (visible on the public website)
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {canUpdate && (
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4" />
                  {updateMutation.isPending ? 'Saving…' : 'Save changes'}
                </Button>
                {success && <p className="text-sm text-green-700 dark:text-green-400">Saved.</p>}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
