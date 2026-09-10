'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Search, Trash2, Pencil } from 'lucide-react';
import { fetchSermonsAdmin, createSermon, updateSermon, deleteSermon, type SermonItem } from '@/lib/api/sermons';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/export-csv';
import { ListActions } from '@/components/admin/list-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetBody,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  speaker: z.string().min(1, 'Speaker is required'),
  date: z.string().min(1, 'Date is required'),
  scripture: z.string().optional(),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  tags: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function SermonsPage() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SermonItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const sermonsQuery = useQuery({
    queryKey: ['sermons-admin', page, search],
    queryFn: () => fetchSermonsAdmin({ page, search: search || undefined }),
  });

  const { register, handleSubmit, reset, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditing(null);
    reset({ title: '', speaker: '', date: '', scripture: '', description: '', videoUrl: '', audioUrl: '', tags: '' });
    setError(null);
    setOpen(true);
  };

  const openEdit = (sermon: SermonItem) => {
    setEditing(sermon);
    reset({
      title: sermon.title,
      speaker: sermon.speaker,
      date: sermon.date.slice(0, 10),
      scripture: sermon.scripture ?? '',
      description: sermon.description ?? '',
      videoUrl: sermon.videoUrl ?? '',
      audioUrl: sermon.audioUrl ?? '',
      tags: sermon.tags ?? '',
    });
    setError(null);
    setOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => (editing ? updateSermon(editing.id, values) : createSermon(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermons-admin'] });
      setOpen(false);
      toast.success(editing ? 'Sermon updated!' : 'Sermon published!');
    },
    onError: (e) => {
      const message = e instanceof ApiError ? e.message : 'Failed to save sermon';
      setError(message);
      toast.error('Failed to save sermon', message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSermon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sermons-admin'] });
      setDeleteId(null);
      toast.success('Sermon deleted');
    },
    onError: (e) => toast.error('Failed to delete sermon', e instanceof ApiError ? e.message : undefined),
  });

  const canCreate = hasPermission('sermon.create');
  const canUpdate = hasPermission('sermon.update');
  const canDelete = hasPermission('sermon.delete');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const all: SermonItem[] = [];
      let currentPage = 1;
      // Export honors the current search filter, not just the page on screen.
      for (;;) {
        const res = await fetchSermonsAdmin({ page: currentPage, search: search || undefined });
        all.push(...res.items);
        if (currentPage >= res.totalPages) break;
        currentPage += 1;
      }
      exportToCsv('sermons', all, [
        { header: 'Title', accessor: (s) => s.title },
        { header: 'Speaker', accessor: (s) => s.speaker },
        { header: 'Date', accessor: (s) => new Date(s.date).toLocaleDateString() },
        { header: 'Scripture', accessor: (s) => s.scripture ?? '' },
        { header: 'Status', accessor: (s) => (s.isPublished ? 'Published' : 'Draft') },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sermons</h1>
          <p className="text-muted-foreground">Audio, video and notes from church services</p>
        </div>
        {canCreate && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button onClick={openCreate} className="print:hidden">
                <Plus className="h-4 w-4" />
                New sermon
              </Button>
            </SheetTrigger>
            <SheetContent>
              <form
                onSubmit={handleSubmit((values) => {
                  setError(null);
                  saveMutation.mutate(values);
                })}
                className="flex h-full flex-col"
                noValidate
              >
                <SheetHeader>
                  <SheetTitle>{editing ? 'Edit sermon' : 'Add a sermon'}</SheetTitle>
                  <SheetDescription>Link a hosted video/audio file — files aren&apos;t uploaded here.</SheetDescription>
                </SheetHeader>
                <SheetBody className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" {...register('title')} />
                    {formState.errors.title && <p className="text-sm text-destructive">{formState.errors.title.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="speaker">Speaker</Label>
                    <Input id="speaker" {...register('speaker')} />
                    {formState.errors.speaker && <p className="text-sm text-destructive">{formState.errors.speaker.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" {...register('date')} />
                    {formState.errors.date && <p className="text-sm text-destructive">{formState.errors.date.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scripture">Scripture reference</Label>
                  <Input id="scripture" placeholder="John 3:16" {...register('scripture')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" rows={3} {...register('description')} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input id="videoUrl" placeholder="YouTube / Facebook link" {...register('videoUrl')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audioUrl">Audio URL</Label>
                    <Input id="audioUrl" {...register('audioUrl')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" placeholder="faith, hope" {...register('tags')} />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                </SheetBody>
                <SheetFooter>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Saving…' : editing ? 'Save changes' : 'Add sermon'}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">
            {sermonsQuery.data ? `${sermonsQuery.data.total} sermon${sermonsQuery.data.total === 1 ? '' : 's'}` : 'Sermons'}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs print:hidden">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or speaker…"
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
          {sermonsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading sermons…
            </div>
          ) : sermonsQuery.data && sermonsQuery.data.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No sermons yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Speaker</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  {(canUpdate || canDelete) && <TableHead className="w-24 text-right print:hidden">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sermonsQuery.data?.items.map((sermon) => (
                  <TableRow key={sermon.id}>
                    <TableCell className="font-medium">
                      {canUpdate ? (
                        <button className="hover:underline" onClick={() => openEdit(sermon)}>
                          {sermon.title}
                        </button>
                      ) : (
                        sermon.title
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{sermon.speaker}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(sermon.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={sermon.isPublished ? 'success' : 'secondary'}>
                        {sermon.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    {(canUpdate || canDelete) && (
                      <TableCell className="text-right print:hidden">
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEdit(sermon)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(sermon.id)}
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

          {sermonsQuery.data && sermonsQuery.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2 print:hidden">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {sermonsQuery.data.page} of {sermonsQuery.data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= sermonsQuery.data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Sermon Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(val: boolean) => !val && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sermon</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sermon? This action cannot be undone.
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

