'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, CircleDollarSign, Loader2, Plus, RotateCcw, Search, Trash2, Pencil } from 'lucide-react';
import {
  fetchLiabilities,
  createLiability,
  updateLiability,
  deleteLiability,
  type Liability,
} from '@/lib/api/liabilities';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional(),
  amount: z.coerce.number().positive('Enter an amount greater than zero'),
  incurredDate: z.string().min(1, 'Incurred date is required'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function formatCurrency(amount: string | number) {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value || 0);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function LiabilitiesPage() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Liability | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const canView = hasPermission('finance.view');
  const canCreate = hasPermission('finance.create');
  const canUpdate = hasPermission('finance.update');
  const canDelete = hasPermission('finance.delete');

  const liabilitiesQuery = useQuery({
    queryKey: ['liabilities'],
    queryFn: () => fetchLiabilities(),
    enabled: canView,
  });

  const totalOutstanding = useMemo(
    () =>
      liabilitiesQuery.data
        ?.filter((l) => !l.isSettled)
        .reduce((sum, l) => sum + parseFloat(l.amount), 0) ?? 0,
    [liabilitiesQuery.data],
  );

  const visibleLiabilities = useMemo(() => {
    const items = liabilitiesQuery.data ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.category ?? '').toLowerCase().includes(q) ||
        (l.notes ?? '').toLowerCase().includes(q),
    );
  }, [liabilitiesQuery.data, search]);

  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', category: '', amount: 0, incurredDate: todayIso(), dueDate: '', notes: '' },
  });

  const createMutation = useMutation({
    mutationFn: createLiability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      setOpen(false);
      toast.success('Liability created!');
    },
    onError: (e) => {
      const message = e instanceof ApiError ? e.message : 'Failed to save liability';
      setError(message);
      toast.error('Failed to save liability', message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FormValues }) => updateLiability(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      setOpen(false);
      toast.success('Liability updated!');
    },
    onError: (e) => {
      const message = e instanceof ApiError ? e.message : 'Failed to save liability';
      setError(message);
      toast.error('Failed to save liability', message);
    },
  });

  const toggleSettledMutation = useMutation({
    mutationFn: ({ id, isSettled }: { id: string; isSettled: boolean }) => updateLiability(id, { isSettled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
    },
    onError: (e) => toast.error('Failed to update liability status', e instanceof ApiError ? e.message : undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLiability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liabilities'] });
      setDeleteId(null);
      toast.success('Liability deleted');
    },
    onError: (e) => toast.error('Failed to delete liability', e instanceof ApiError ? e.message : undefined),
  });

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              name: editing.name,
              category: editing.category ?? '',
              amount: parseFloat(editing.amount),
              incurredDate: editing.incurredDate.slice(0, 10),
              dueDate: editing.dueDate ? editing.dueDate.slice(0, 10) : '',
              notes: editing.notes ?? '',
            }
          : { name: '', category: '', amount: 0, incurredDate: todayIso(), dueDate: '', notes: '' },
      );
    }
  }, [open, editing, reset]);

  const openCreate = () => {
    setEditing(null);
    setError(null);
    setOpen(true);
  };

  const openEdit = (liability: Liability) => {
    setEditing(liability);
    setError(null);
    setOpen(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (!canView) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Liabilities</h1>
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
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Liabilities</h1>
          <p className="text-muted-foreground">Loans, unpaid bills, and other money owed by the church</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="print:hidden">
            <Plus className="h-4 w-4" />
            New liability
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CircleDollarSign className="h-4 w-4 text-primary" />
              {liabilitiesQuery.data
                ? `${liabilitiesQuery.data.length} liabilit${liabilitiesQuery.data.length === 1 ? 'y' : 'ies'}`
                : 'Liabilities'}
            </CardTitle>
            <CardDescription>Outstanding liabilities are shown first</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total outstanding</p>
            <p className="font-serif text-lg font-bold text-destructive">{formatCurrency(totalOutstanding)}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs print:hidden">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, category, or notes…"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <ListActions
              onExport={() =>
                exportToCsv('liabilities', visibleLiabilities, [
                  { header: 'Name', accessor: (l) => l.name },
                  { header: 'Category', accessor: (l) => l.category ?? '' },
                  { header: 'Amount (GHS)', accessor: (l) => l.amount },
                  { header: 'Incurred Date', accessor: (l) => new Date(l.incurredDate).toLocaleDateString() },
                  { header: 'Due Date', accessor: (l) => (l.dueDate ? new Date(l.dueDate).toLocaleDateString() : '') },
                  { header: 'Status', accessor: (l) => (l.isSettled ? 'Settled' : 'Outstanding') },
                ])
              }
              exportDisabled={visibleLiabilities.length === 0}
            />
          </div>
          {liabilitiesQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading liabilities…
            </div>
          ) : visibleLiabilities.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'No liabilities match your search.' : 'No liabilities recorded yet.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Incurred</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32 text-right print:hidden">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLiabilities.map((liability) => (
                  <TableRow
                    key={liability.id}
                    className={canUpdate ? 'cursor-pointer' : undefined}
                    onClick={canUpdate ? () => openEdit(liability) : undefined}
                  >
                    <TableCell className="font-medium">
                      {liability.name}
                      {liability.notes && (
                        <p className="mt-0.5 max-w-xs truncate text-xs font-normal text-muted-foreground">
                          {liability.notes}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{liability.category ?? '—'}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(liability.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(liability.incurredDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {liability.dueDate ? new Date(liability.dueDate).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={liability.isSettled ? 'success' : 'secondary'}>
                        {liability.isSettled ? 'Settled' : 'Outstanding'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right print:hidden">
                      <div className="flex items-center justify-end gap-1">
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title={liability.isSettled ? 'Mark as outstanding' : 'Mark as settled'}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSettledMutation.mutate({ id: liability.id, isSettled: !liability.isSettled });
                            }}
                          >
                            {liability.isSettled ? (
                              <RotateCcw className="h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                        )}
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(liability);
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
                              setDeleteId(liability.id);
                            }}
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
              <SheetTitle>{editing ? 'Edit liability' : 'Record a liability'}</SheetTitle>
              <SheetDescription>
                {editing
                  ? 'Update the details of this liability.'
                  : 'Record money owed by the church, e.g. a loan or unpaid bill.'}
              </SheetDescription>
            </SheetHeader>
            <SheetBody className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="e.g. Equipment loan" {...register('name')} />
                {formState.errors.name && <p className="text-sm text-destructive">{formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category (optional)</Label>
                <Input id="category" placeholder="e.g. Loan, Utility bill" {...register('category')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (GHS)</Label>
                <Input id="amount" type="number" step="0.01" min="0" {...register('amount')} />
                {formState.errors.amount && (
                  <p className="text-sm text-destructive">{formState.errors.amount.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="incurredDate">Incurred date</Label>
                  <Input id="incurredDate" type="date" {...register('incurredDate')} />
                  {formState.errors.incurredDate && (
                    <p className="text-sm text-destructive">{formState.errors.incurredDate.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due date (optional)</Label>
                  <Input id="dueDate" type="date" {...register('dueDate')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" rows={3} {...register('notes')} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </SheetBody>
            <SheetFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Record liability'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={!!deleteId} onOpenChange={(val: boolean) => !val && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Liability</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this liability? This action cannot be undone.
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
