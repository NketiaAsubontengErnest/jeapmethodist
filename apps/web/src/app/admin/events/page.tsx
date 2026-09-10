'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { fetchEvents, createEvent, deleteEvent } from '@/lib/api/events';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { exportToCsv } from '@/lib/export-csv';
import { ListActions } from '@/components/admin/list-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  startDate: z.string().min(1, 'Start date is required'),
  location: z.string().optional(),
  organizer: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function EventsPage() {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const eventsQuery = useQuery({
    queryKey: ['events-admin', page, search],
    queryFn: () => fetchEvents({ page, search: search || undefined }),
  });

  const { register, handleSubmit, reset, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events-admin'] });
      setOpen(false);
      reset();
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to create event'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events-admin'] });
      setDeleteId(null);
    },
  });

  const canCreate = hasPermission('event.create');
  const canUpdate = hasPermission('event.update');
  const canDelete = hasPermission('event.delete');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const all: Awaited<ReturnType<typeof fetchEvents>>['items'] = [];
      let currentPage = 1;
      // Export honors the current search filter, not just the page on screen.
      for (;;) {
        const res = await fetchEvents({ page: currentPage, search: search || undefined });
        all.push(...res.items);
        if (currentPage >= res.totalPages) break;
        currentPage += 1;
      }
      exportToCsv('events', all, [
        { header: 'Title', accessor: (ev) => ev.title },
        { header: 'Date', accessor: (ev) => new Date(ev.startDate).toLocaleDateString() },
        { header: 'Location', accessor: (ev) => ev.location ?? '' },
        { header: 'Status', accessor: (ev) => (ev.isPublished ? 'Published' : 'Draft') },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Church programmes and calendar events</p>
        </div>
        {canCreate && (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button className="print:hidden">
                <Plus className="h-4 w-4" />
                New event
              </Button>
            </SheetTrigger>
            <SheetContent>
              <form
                onSubmit={handleSubmit((values) => {
                  setError(null);
                  createMutation.mutate(values);
                })}
                className="flex h-full flex-col"
                noValidate
              >
                <SheetHeader>
                  <SheetTitle>Create an event</SheetTitle>
                  <SheetDescription>Add more details (banner, registration, contact) after creating it.</SheetDescription>
                </SheetHeader>
                <SheetBody className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" {...register('title')} />
                    {formState.errors.title && <p className="text-sm text-destructive">{formState.errors.title.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Date</Label>
                      <Input id="startDate" type="date" {...register('startDate')} />
                      {formState.errors.startDate && (
                        <p className="text-sm text-destructive">{formState.errors.startDate.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" {...register('location')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizer">Organizer</Label>
                    <Input id="organizer" {...register('organizer')} />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </SheetBody>
                <SheetFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Creating…' : 'Create event'}
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
            {eventsQuery.data ? `${eventsQuery.data.total} event${eventsQuery.data.total === 1 ? '' : 's'}` : 'Events'}
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
          {eventsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading events…
            </div>
          ) : eventsQuery.data && eventsQuery.data.items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24 text-right print:hidden">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventsQuery.data?.items.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Link href={`/admin/events/${event.id}`} className="font-medium hover:underline">
                        {event.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString()}
                      {event.startTime && ` at ${event.startTime}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{event.location ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={event.isPublished ? 'success' : 'secondary'}>
                        {event.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right print:hidden">
                      <div className="flex items-center justify-end gap-1">
                        {canUpdate && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/admin/events/${event.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {eventsQuery.data && eventsQuery.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2 print:hidden">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {eventsQuery.data.page} of {eventsQuery.data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= eventsQuery.data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Event Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(val: boolean) => !val && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
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

