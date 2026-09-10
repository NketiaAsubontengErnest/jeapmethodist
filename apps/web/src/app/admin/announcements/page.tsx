'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Search, Trash2, Pencil } from 'lucide-react';
import {
  fetchAnnouncementsAdmin,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  type Announcement,
} from '@/lib/api/announcements';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetBody,
  SheetTitle,
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
  message: z.string().min(1, 'Message is required'),
  priority: z.enum(['NORMAL', 'URGENT']),
  isPublished: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export default function AnnouncementsPage() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const canView = hasPermission('announcement.view');
  const canCreate = hasPermission('announcement.create');
  const canUpdate = hasPermission('announcement.update');
  const canDelete = hasPermission('announcement.delete');

  const announcementsQuery = useQuery({
    queryKey: ['announcements-admin', page, search],
    queryFn: () => fetchAnnouncementsAdmin({ page, search: search || undefined }),
    enabled: canView,
  });

  const { register, handleSubmit, reset, setValue, watch, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'NORMAL', isPublished: true },
  });

  const createMutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements-admin'] });
      setOpen(false);
      toast.success('Announcement published!');
    },
    onError: (e) => {
      const message = e instanceof ApiError ? e.message : 'Failed to save announcement';
      setError(message);
      toast.error('Failed to publish announcement', message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FormValues }) => updateAnnouncement(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements-admin'] });
      setOpen(false);
      toast.success('Announcement updated!');
    },
    onError: (e) => {
      const message = e instanceof ApiError ? e.message : 'Failed to save announcement';
      setError(message);
      toast.error('Failed to update announcement', message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements-admin'] });
      setDeleteId(null);
      toast.success('Announcement deleted');
    },
    onError: (e) => toast.error('Failed to delete announcement', e instanceof ApiError ? e.message : undefined),
  });

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              title: editing.title,
              message: editing.message,
              priority: editing.priority,
              isPublished: editing.isPublished,
            }
          : { title: '', message: '', priority: 'NORMAL', isPublished: true },
      );
      setError(null);
    }
  }, [open, editing, reset]);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setOpen(true);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const all: Announcement[] = [];
      let currentPage = 1;
      // Export honors the current search filter, not just the page on screen.
      for (;;) {
        const res = await fetchAnnouncementsAdmin({ page: currentPage, search: search || undefined });
        all.push(...res.items);
        if (currentPage >= res.totalPages) break;
        currentPage += 1;
      }
      exportToCsv('announcements', all, [
        { header: 'Title', accessor: (a) => a.title },
        { header: 'Priority', accessor: (a) => (a.priority === 'URGENT' ? 'Urgent' : 'Normal') },
        { header: 'Status', accessor: (a) => (a.isPublished ? 'Published' : 'Draft') },
        { header: 'Created', accessor: (a) => new Date(a.createdAt).toLocaleDateString() },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const priority = watch('priority');
  const isPublished = watch('isPublished');

  if (!canView) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Announcements</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            You don&apos;t have permission to view this page.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">Notices shown to members and visitors on the public website</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="print:hidden">
            <Plus className="h-4 w-4" />
            New announcement
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">
            {announcementsQuery.data
              ? `${announcementsQuery.data.total} announcement${announcementsQuery.data.total === 1 ? '' : 's'}`
              : 'Announcements'}
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
          {announcementsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading announcements…
            </div>
          ) : announcementsQuery.data && announcementsQuery.data.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No announcements yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  {(canUpdate || canDelete) && <TableHead className="w-24 text-right print:hidden">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcementsQuery.data?.items.map((announcement) => (
                  <TableRow
                    key={announcement.id}
                    className={canUpdate ? 'cursor-pointer' : undefined}
                    onClick={canUpdate ? () => openEdit(announcement) : undefined}
                  >
                    <TableCell className="max-w-xs truncate font-medium">{announcement.title}</TableCell>
                    <TableCell>
                      <Badge variant={announcement.priority === 'URGENT' ? 'destructive' : 'secondary'}>
                        {announcement.priority === 'URGENT' ? 'Urgent' : 'Normal'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={announcement.isPublished ? 'success' : 'secondary'}>
                        {announcement.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </TableCell>
                    {(canUpdate || canDelete) && (
                      <TableCell className="text-right print:hidden">
                        <div className="flex items-center justify-end gap-1">
                          {canUpdate && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(announcement);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(announcement.id);
                              }}
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

          {announcementsQuery.data && announcementsQuery.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2 print:hidden">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {announcementsQuery.data.page} of {announcementsQuery.data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= announcementsQuery.data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <form
            onSubmit={handleSubmit((values) => {
              setError(null);
              if (editing) {
                updateMutation.mutate({ id: editing.id, values });
              } else {
                createMutation.mutate(values);
              }
            })}
            className="flex h-full flex-col"
            noValidate
          >
            <SheetHeader>
              <SheetTitle>{editing ? 'Edit announcement' : 'Create an announcement'}</SheetTitle>
              <SheetDescription>
                {editing
                  ? 'Update the notice shown to members and visitors.'
                  : 'Publish a notice to members and visitors on the public website.'}
              </SheetDescription>
            </SheetHeader>
            <SheetBody className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register('title')} />
                {formState.errors.title && <p className="text-sm text-destructive">{formState.errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={6} {...register('message')} />
                {formState.errors.message && <p className="text-sm text-destructive">{formState.errors.message.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: string) => setValue('priority', value as FormValues['priority'])}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={isPublished}
                  onChange={(e) => setValue('isPublished', e.target.checked)}
                />
                Published (visible on the public website)
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </SheetBody>
            <SheetFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Create announcement'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Delete Announcement Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(val: boolean) => !val && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Announcement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
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

