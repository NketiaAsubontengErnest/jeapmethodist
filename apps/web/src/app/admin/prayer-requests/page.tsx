'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Loader2, Search, Sparkles, MessageSquareHeart } from 'lucide-react';
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
      return <Badge className="bg-[#14309c] text-white">New</Badge>;
    case 'CONTACTED':
      return <Badge variant="outline">Contacted</Badge>;
    case 'PRAYED_FOR':
      return <Badge variant="success">Prayed For</Badge>;
    case 'ARCHIVED':
      return <Badge variant="secondary">Archived</Badge>;
  }
}

function CategoryBadge({ requestText }: { requestText: string }) {
  if (requestText.includes('[THANKSGIVING]')) {
    return (
      <Badge className="bg-amber-500 text-white gap-1 font-bold text-[10px]">
        <Sparkles className="w-3 h-3 text-white" /> Thanksgiving
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-100 text-[#14309c] border border-blue-200 gap-1 font-bold text-[10px]">
      <MessageSquareHeart className="w-3 h-3 text-[#14309c]" /> Prayer Request
    </Badge>
  );
}

function cleanRequestText(rawText: string) {
  return rawText.replace(/^\[(THANKSGIVING|PRAYER REQUEST)\]\s*/i, '');
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
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PRAYER' | 'THANKSGIVING'>('ALL');

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
    let items = prayerRequestsQuery.data ?? [];

    // Filter by Category
    if (categoryFilter === 'THANKSGIVING') {
      items = items.filter((r) => r.request.includes('[THANKSGIVING]'));
    } else if (categoryFilter === 'PRAYER') {
      items = items.filter((r) => !r.request.includes('[THANKSGIVING]'));
    }

    // Search query
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((request) => {
      const submitter = request.isAnonymous || !request.name ? 'anonymous' : request.name;
      return submitter.toLowerCase().includes(q) || request.request.toLowerCase().includes(q);
    });
  }, [prayerRequestsQuery.data, search, categoryFilter]);

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
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Prayer Requests &amp; Thanksgivings</h1>
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-slate-900">
            Prayer Requests &amp; Thanksgivings
          </h1>
          <p className="text-sm text-muted-foreground">
            Intercessory requests and testimonies submitted by members and visitors
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              categoryFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Submissions
          </button>
          <button
            onClick={() => setCategoryFilter('PRAYER')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              categoryFilter === 'PRAYER' ? 'bg-white text-[#14309c] shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Prayer Requests
          </button>
          <button
            onClick={() => setCategoryFilter('THANKSGIVING')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              categoryFilter === 'THANKSGIVING' ? 'bg-white text-amber-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Thanksgivings
          </button>
        </div>
      </div>

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base font-bold text-slate-900">
            {visibleRequests.length} {categoryFilter === 'THANKSGIVING' ? 'Thanksgiving' : categoryFilter === 'PRAYER' ? 'Prayer Request' : 'Entry'}{visibleRequests.length === 1 ? '' : 's'}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs print:hidden">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search submitter or content…"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <ListActions
              onExport={() =>
                exportToCsv('prayer-requests-thanksgivings', visibleRequests, [
                  {
                    header: 'Type',
                    accessor: (r) => (r.request.includes('[THANKSGIVING]') ? 'Thanksgiving' : 'Prayer Request'),
                  },
                  {
                    header: 'Submitter',
                    accessor: (r) => (r.isAnonymous || !r.name ? 'Anonymous' : r.name),
                  },
                  { header: 'Details', accessor: (r) => cleanRequestText(r.request) },
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
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading entries…
            </div>
          ) : visibleRequests.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'No entries match your search.' : 'No entries found.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right print:hidden">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRequests.map((request) => (
                  <TableRow key={request.id} className="cursor-pointer hover:bg-slate-50/80" onClick={() => openRequest(request)}>
                    <TableCell>
                      <CategoryBadge requestText={request.request} />
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {request.isAnonymous || !request.name ? (
                        <Badge variant="secondary" className="font-normal text-slate-600">Anonymous</Badge>
                      ) : (
                        request.name
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-slate-700">
                      {cleanRequestText(request.request)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs font-mono">
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

      {/* Detail Off-canvas Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-serif flex items-center gap-2">
              {selected && <CategoryBadge requestText={selected.request} />}
            </SheetTitle>
            <SheetDescription>
              Submitted {selected ? new Date(selected.createdAt).toLocaleDateString() : ''}
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="space-y-4 py-4">
            {selected && (
              <>
                <div className="space-y-1">
                  <Label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Submitter</Label>
                  {selected.isAnonymous || !selected.name ? (
                    <p className="text-sm text-slate-600 italic">Submitted anonymously</p>
                  ) : (
                    <div className="text-sm bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-0.5">
                      <p className="font-bold text-slate-900">{selected.name}</p>
                      {selected.email && <p className="text-xs text-slate-600">{selected.email}</p>}
                      {selected.phone && <p className="text-xs text-slate-600">{selected.phone}</p>}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Message / Details</Label>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="whitespace-pre-wrap text-xs text-slate-800 leading-relaxed">
                      {cleanRequestText(selected.request)}
                    </p>
                  </div>
                </div>

                {canUpdate && (
                  <div className="space-y-2 border-t border-slate-200 pt-4">
                    <Label htmlFor="status" className="text-xs font-semibold">Update Status</Label>
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

                {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
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
                className="bg-[#14309c] text-white hover:bg-[#0f2478] w-full"
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
