'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Loader2, Search } from 'lucide-react';
import {
  fetchPrayerRequests,
  updatePrayerRequestStatus,
  type PrayerRequest,
  type PrayerRequestStatus,
} from '@/lib/api/prayer-requests';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/export-csv';
import { ListActions } from '@/components/admin/list-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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

const STATUS_LABELS: Record<PrayerRequestStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  PRAYED_FOR: 'Prayed For',
  ARCHIVED: 'Archived',
};

function StatusBadge({ status }: { status: PrayerRequestStatus }) {
  switch (status) {
    case 'NEW':
      return <Badge>New</Badge>;
    case 'CONTACTED':
      return <Badge variant="outline">Contacted</Badge>;
    case 'PRAYED_FOR':
      return <Badge variant="success">Prayed For</Badge>;
    case 'ARCHIVED':
      return <Badge variant="secondary">Archived</Badge>;
  }
}

export default function PrayerRequestsPage() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<PrayerRequest | null>(null);
  const [open, setOpen] = useState(false);
  const [statusValue, setStatusValue] = useState<PrayerRequestStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const canView = hasPermission('prayer-request.view');
  const canUpdate = hasPermission('prayer-request.update');

  const prayerRequestsQuery = useQuery({
    queryKey: ['prayer-requests'],
    queryFn: fetchPrayerRequests,
    enabled: canView,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PrayerRequestStatus }) => updatePrayerRequestStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prayer-requests'] });
      setOpen(false);
      toast.success('Prayer request updated!');
    },
    onError: (e) => {
      const message = e instanceof ApiError ? e.message : 'Failed to update status';
      setError(message);
      toast.error('Failed to update status', message);
    },
  });

  const visibleRequests = useMemo(() => {
    const items = prayerRequestsQuery.data ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((request) => {
      const submitter = request.isAnonymous || !request.name ? 'anonymous' : request.name;
      return submitter.toLowerCase().includes(q) || request.request.toLowerCase().includes(q);
    });
  }, [prayerRequestsQuery.data, search]);

  const openRequest = (request: PrayerRequest) => {
    setSelected(request);
    setStatusValue(request.status);
    setError(null);
    setOpen(true);
  };

  if (!canView) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Prayer Requests</h1>
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
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight">Prayer Requests</h1>
        <p className="text-muted-foreground">Requests submitted by members and visitors</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">
            {prayerRequestsQuery.data
              ? `${prayerRequestsQuery.data.length} request${prayerRequestsQuery.data.length === 1 ? '' : 's'}`
              : 'Prayer Requests'}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs print:hidden">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by submitter or request…"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <ListActions
              onExport={() =>
                exportToCsv('prayer-requests', visibleRequests, [
                  {
                    header: 'Submitter',
                    accessor: (r) => (r.isAnonymous || !r.name ? 'Anonymous' : r.name),
                  },
                  { header: 'Request', accessor: (r) => r.request },
                  { header: 'Status', accessor: (r) => STATUS_LABELS[r.status] },
                  { header: 'Submitted', accessor: (r) => new Date(r.createdAt).toLocaleDateString() },
                ])
              }
              exportDisabled={visibleRequests.length === 0}
            />
          </div>
        </CardHeader>
        <CardContent>
          {prayerRequestsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading prayer requests…
            </div>
          ) : visibleRequests.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'No prayer requests match your search.' : 'No prayer requests yet.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right print:hidden">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRequests.map((request) => (
                  <TableRow key={request.id} className="cursor-pointer" onClick={() => openRequest(request)}>
                    <TableCell className="font-medium">
                      {request.isAnonymous || !request.name ? (
                        <Badge variant="secondary">Anonymous</Badge>
                      ) : (
                        request.name
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{request.request}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right print:hidden">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRequest(request);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="font-serif">Prayer Request</SheetTitle>
            <SheetDescription>
              Submitted {selected ? new Date(selected.createdAt).toLocaleDateString() : ''}
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="space-y-4">
            {selected && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground">Submitter</Label>
                  {selected.isAnonymous || !selected.name ? (
                    <p className="text-sm text-muted-foreground">Submitted anonymously</p>
                  ) : (
                    <div className="text-sm">
                      <p className="font-medium">{selected.name}</p>
                      {selected.email && <p className="text-muted-foreground">{selected.email}</p>}
                      {selected.phone && <p className="text-muted-foreground">{selected.phone}</p>}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground">Request</Label>
                  <p className="whitespace-pre-wrap text-sm">{selected.request}</p>
                </div>

                {canUpdate && (
                  <div className="space-y-2 border-t border-border pt-4">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={statusValue ?? undefined}
                      onValueChange={(value: string) => setStatusValue(value as PrayerRequestStatus)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(STATUS_LABELS) as PrayerRequestStatus[]).map((status) => (
                          <SelectItem key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {error && <p className="text-sm text-destructive">{error}</p>}
              </>
            )}
          </SheetBody>
          {canUpdate && (
            <SheetFooter>
              <Button
                onClick={() => {
                  if (selected && statusValue) {
                    setError(null);
                    updateMutation.mutate({ id: selected.id, status: statusValue });
                  }
                }}
                disabled={updateMutation.isPending || !statusValue || statusValue === selected?.status}
              >
                {updateMutation.isPending ? 'Saving…' : 'Save Status'}
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
