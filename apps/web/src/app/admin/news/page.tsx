'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Search, Trash2, Pencil } from 'lucide-react';
import { fetchNewsAdmin, deleteNewsArticle } from '@/lib/api/news';
import { useAuth } from '@/lib/auth-context';
import { exportToCsv } from '@/lib/export-csv';
import { ListActions } from '@/components/admin/list-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function NewsPage() {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const newsQuery = useQuery({
    queryKey: ['news-admin', page, search],
    queryFn: () => fetchNewsAdmin({ page, search: search || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNewsArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-admin'] });
      setDeleteId(null);
    },
  });

  const canCreate = hasPermission('news.create');
  const canUpdate = hasPermission('news.update');
  const canDelete = hasPermission('news.delete');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const all: Awaited<ReturnType<typeof fetchNewsAdmin>>['items'] = [];
      let currentPage = 1;
      // Export honors the current search filter, not just the page on screen.
      for (;;) {
        const res = await fetchNewsAdmin({ page: currentPage, search: search || undefined });
        all.push(...res.items);
        if (currentPage >= res.totalPages) break;
        currentPage += 1;
      }
      exportToCsv('news', all, [
        { header: 'Title', accessor: (a) => a.title },
        { header: 'Published', accessor: (a) => (a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : '') },
        { header: 'Status', accessor: (a) => (a.isPublished ? 'Published' : 'Draft') },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">News</h1>
          <p className="text-muted-foreground">Articles and updates published on the public website</p>
        </div>
        {canCreate && (
          <Button asChild className="print:hidden">
            <Link href="/admin/news/new">
              <Plus className="h-4 w-4" />
              New article
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">
            {newsQuery.data ? `${newsQuery.data.total} article${newsQuery.data.total === 1 ? '' : 's'}` : 'Articles'}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs print:hidden">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title…"
                className="pl-8"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <ListActions
              onExport={handleExport}
              exportDisabled={isExporting}
              exportLabel={isExporting ? 'Exporting…' : 'Export CSV'}
            />
          </div>
        </CardHeader>
        <CardContent>
          {newsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading articles…
            </div>
          ) : newsQuery.data && newsQuery.data.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No articles yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Status</TableHead>
                  {(canUpdate || canDelete) && <TableHead className="w-24 text-right print:hidden">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsQuery.data?.items.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      {canUpdate ? (
                        <Link href={`/admin/news/${article.id}`} className="hover:underline">
                          {article.title}
                        </Link>
                      ) : (
                        article.title
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={article.isPublished ? 'success' : 'secondary'}>
                        {article.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    {(canUpdate || canDelete) && (
                      <TableCell className="text-right print:hidden">
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate && (
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <Link href={`/admin/news/${article.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(article.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {newsQuery.data && newsQuery.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2 print:hidden">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {newsQuery.data.page} of {newsQuery.data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= newsQuery.data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Article Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(val: boolean) => !val && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this news article? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

