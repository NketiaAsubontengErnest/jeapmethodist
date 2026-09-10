'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Search } from 'lucide-react';
import {
  fetchOfferingSessions,
  createOfferingSession,
  type OfferingSessionListItem,
} from '@/lib/api/offering-sessions';
import { fetchProgrammeTypes } from '@/lib/api/attendance';
import { createTransaction, fetchIncomeCategories } from '@/lib/api/finance';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  programmeTypeId: z.string().min(1, 'Select a programme'),
  sessionDate: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const donationSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  incomeCategoryId: z.string().min(1, 'Select a category'),
  donorName: z.string().optional(),
  isAnonymous: z.boolean().optional(),
});
type DonationFormValues = z.infer<typeof donationSchema>;

function formatGHS(amount: number) {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount);
}

export default function GivingPage() {
  const { hasPermission } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [donationError, setDonationError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const sessionsQuery = useQuery({ queryKey: ['offering-sessions', page], queryFn: () => fetchOfferingSessions({ page }) });
  const programmeTypesQuery = useQuery({ queryKey: ['programme-types'], queryFn: fetchProgrammeTypes });
  const incomeCategoriesQuery = useQuery({ queryKey: ['income-categories'], queryFn: fetchIncomeCategories });

  const visibleSessions = useMemo(() => {
    const items = sessionsQuery.data?.items ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((session) => {
      const recordedBy = session.recordedByUser
        ? `${session.recordedByUser.firstName} ${session.recordedByUser.lastName}`
        : '';
      return (
        session.programmeType.name.toLowerCase().includes(q) ||
        (session.notes ?? '').toLowerCase().includes(q) ||
        recordedBy.toLowerCase().includes(q)
      );
    });
  }, [sessionsQuery.data, search]);

  const { register, control, handleSubmit, reset, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const donationForm = useForm<DonationFormValues>({ resolver: zodResolver(donationSchema) });

  const createMutation = useMutation({
    mutationFn: createOfferingSession,
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['offering-sessions'] });
      setOpen(false);
      reset();
      router.push(`/admin/giving/${session.id}`);
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to create offering session'),
  });

  const donationMutation = useMutation({
    mutationFn: (values: DonationFormValues) => createTransaction({ ...values, type: 'INCOME' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      setDonationOpen(false);
      donationForm.reset();
    },
    onError: (e) => setDonationError(e instanceof ApiError ? e.message : 'Failed to record donation'),
  });

  const canCreate = hasPermission('finance.create');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const all: OfferingSessionListItem[] = [];
      let currentPage = 1;
      // Export the full list of offering sessions, not just the page on screen.
      for (;;) {
        const res = await fetchOfferingSessions({ page: currentPage });
        all.push(...res.items);
        if (currentPage >= res.totalPages) break;
        currentPage += 1;
      }
      exportToCsv('offering-sessions', all, [
        { header: 'Date', accessor: (s) => new Date(s.sessionDate).toLocaleDateString() },
        { header: 'Programme', accessor: (s) => s.programmeType.name },
        { header: 'Total (GHS)', accessor: (s) => s.total },
        { header: 'Notes', accessor: (s) => s.notes ?? '' },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Giving</h1>
          <p className="text-muted-foreground">Offering sessions and category totals collected per service</p>
        </div>
        {canCreate && (
          <div className="flex gap-2">
          <Sheet open={donationOpen} onOpenChange={setDonationOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="print:hidden">
                <Plus className="h-4 w-4" />
                Record a donation
              </Button>
            </SheetTrigger>
            <SheetContent>
              <form
                onSubmit={donationForm.handleSubmit((values) => {
                  setDonationError(null);
                  donationMutation.mutate(values);
                })}
                className="flex h-full flex-col"
                noValidate
              >
                <SheetHeader>
                  <SheetTitle>Record a donation</SheetTitle>
                  <SheetDescription>
                    For a named or one-off gift outside a Sunday offering session.
                  </SheetDescription>
                </SheetHeader>
                <SheetBody className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="d-date">Date</Label>
                      <Input id="d-date" type="date" {...donationForm.register('date')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="d-amount">Amount (GHS)</Label>
                      <Input id="d-amount" type="number" step="0.01" min="0" {...donationForm.register('amount')} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="d-category">Category</Label>
                    <Controller
                      control={donationForm.control}
                      name="incomeCategoryId"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="d-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {incomeCategoriesQuery.data?.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="d-donor">Donor name (optional)</Label>
                    <Input id="d-donor" {...donationForm.register('donorName')} />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" {...donationForm.register('isAnonymous')} className="h-4 w-4 rounded border-input" />
                    Keep this donor anonymous
                  </label>
                  {donationError && <p className="text-sm text-destructive">{donationError}</p>}
                </SheetBody>
                <SheetFooter>
                  <Button type="submit" disabled={donationMutation.isPending}>
                    {donationMutation.isPending ? 'Saving…' : 'Save donation'}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button className="print:hidden">
                <Plus className="h-4 w-4" />
                New offering session
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
                  <SheetTitle>Start an offering session</SheetTitle>
                  <SheetDescription>Add category totals (Tithe, Missions, ...) on the next screen.</SheetDescription>
                </SheetHeader>
                <SheetBody className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="programmeTypeId">Programme</Label>
                    <Controller
                      control={control}
                      name="programmeTypeId"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="programmeTypeId">
                            <SelectValue placeholder="Select a programme" />
                          </SelectTrigger>
                          <SelectContent>
                            {programmeTypesQuery.data?.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {formState.errors.programmeTypeId && (
                      <p className="text-sm text-destructive">{formState.errors.programmeTypeId.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionDate">Date</Label>
                    <Input id="sessionDate" type="date" {...register('sessionDate')} />
                    {formState.errors.sessionDate && (
                      <p className="text-sm text-destructive">{formState.errors.sessionDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Input id="notes" {...register('notes')} />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </SheetBody>
                <SheetFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Starting…' : 'Start session'}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">
            {sessionsQuery.data
              ? `${sessionsQuery.data.total} session${sessionsQuery.data.total === 1 ? '' : 's'}`
              : 'Offering sessions'}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs print:hidden">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by programme, notes or recorder…"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
          {sessionsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : visibleSessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'No offering sessions match your search.' : 'No offering sessions recorded yet.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Recorded by</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <Link href={`/admin/giving/${session.id}`} className="font-medium hover:underline">
                        {new Date(session.sessionDate).toLocaleDateString()}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{session.programmeType.name}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {session.recordedByUser ? `${session.recordedByUser.firstName} ${session.recordedByUser.lastName}` : '—'}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatGHS(session.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {sessionsQuery.data && sessionsQuery.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2 print:hidden">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {sessionsQuery.data.page} of {sessionsQuery.data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= sessionsQuery.data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
