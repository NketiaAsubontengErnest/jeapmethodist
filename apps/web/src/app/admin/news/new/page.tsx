'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { createNewsArticle } from '@/lib/api/news';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  featuredImageUrl: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function NewNewsArticlePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: createNewsArticle,
    onSuccess: (article) => router.push(`/admin/news/${article.id}`),
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to create article'),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
          <Link href="/admin/news">
            <ArrowLeft className="h-4 w-4" />
            Back to news
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">New article</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Article content</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((values) => {
              setError(null);
              createMutation.mutate(values);
            })}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {formState.errors.title && <p className="text-sm text-destructive">{formState.errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt (optional)</Label>
              <Textarea id="excerpt" rows={2} placeholder="Short summary shown on the news listing" {...register('excerpt')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="featuredImageUrl">Featured image URL (optional)</Label>
              <Input id="featuredImageUrl" {...register('featuredImageUrl')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" rows={14} {...register('content')} />
              {formState.errors.content && <p className="text-sm text-destructive">{formState.errors.content.message}</p>}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create article'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
