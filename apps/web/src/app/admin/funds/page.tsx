'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Search, Trash2, Pencil, Landmark } from 'lucide-react';
import { fetchFunds, createFund, updateFund, deleteFund, type Fund, type FundType } from '@/lib/api/funds';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
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
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['GENERAL', 'RESTRICTED']),
  description: z.string().optional(),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function formatCurrency(amount: string | number) {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value || 0);
}

export default function FundsPage() {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Fund | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const canView = hasPermission('finance.view');
  const canCreate = hasPermission('finance.create');
  const canUpdate = hasPermission('finance.update');
  const canDelete = hasPermission('finance.delete');

  const fundsQuery = useQuery({
    queryKey: ['funds'],
    queryFn: fetchFunds,
    enabled: canView,
  });

  const visibleFunds = useMemo(() => {
    const items = fundsQuery.data ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(
      (fund) => fund.name.toLowerCase().includes(q) || (fund.description ?? '').toLowerCase().includes(q),
    );
  }, [fundsQuery.data, search]);

  const { register, handleSubmit, reset, setValue, watch, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', type: 'GENERAL', description: '', isActive: true },
  });

  const createMutation = useMutation({
    mutationFn: createFund,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      setOpen(false);
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to save fund'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FormValues }) => updateFund(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      setOpen(false);
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to save fund'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFund,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funds'] });
      setDeleteId(null);
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              name: editing.name,
              type: editing.type,
              description: editing.description ?? '',
              isActive: editing.isActive,
            }
          : { name: '', type: 'GENERAL', description: '', isActive: true },
      );
      setError(null);
    }
  }, [open, editing, reset]);

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (fund: Fund) => {
    setEditing(fund);
    setOpen(true);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const type = watch('type');
  const isActive = watch('isActive');

  if (!canView) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Funds</h1>
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
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Funds</h1>
          <p className="text-muted-foreground">
            General and restricted funds used to track designated church resources
          </p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="print:hidden">
            <Plus className="h-4 w-4" />
            New fund
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Landmark className="h-4 w-4 text-primary" />
            {fundsQuery.data
              ? `${fundsQuery.data.length} fund${fundsQuery.data.length === 1 ? '' : 's'}`
              : 'Funds'}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs print:hidden">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or description…"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <ListActions
              onExport={() =>
                exportToCsv('funds', visibleFunds, [
                  { header: 'Name', accessor: (f) => f.name },
                  { header: 'Type', accessor: (f) => (f.type === 'GENERAL' ? 'General' : 'Restricted') },
                  { header: 'Description', accessor: (f) => f.description ?? '' },
                  { header: 'Balance (GHS)', accessor: (f) => f.balance },
                  { header: 'Active', accessor: (f) => (f.isActive ? 'Yes' : 'No') },
                ])
              }
            />
          </div>
        </CardHeader>
        <CardContent>
          {fundsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading funds…
            </div>
          ) : visibleFunds.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'No funds match your search.' : 'No funds set up yet.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  {(canUpdate || canDelete) && <TableHead className="w-24 text-right print:hidden">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleFunds.map((fund) => (
                  <TableRow
                    key={fund.id}
                    className={canUpdate ? 'cursor-pointer' : undefined}
                    onClick={canUpdate ? () => openEdit(fund) : undefined}
                  >
                    <TableCell className="font-medium">
                      {fund.name}
                      {fund.description && (
                        <p className="mt-0.5 max-w-xs truncate text-xs font-normal text-muted-foreground">
                          {fund.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={fund.type === 'GENERAL' ? 'secondary' : 'outline'}>
                        {fund.type === 'GENERAL' ? 'General' : 'Restricted'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(fund.balance)}</TableCell>
                    <TableCell>
                      <Badge variant={fund.isActive ? 'success' : 'secondary'}>
                        {fund.isActive ? 'Active' : 'Inactive'}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(fund);
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
                                setDeleteId(fund.id);
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
              <SheetTitle>{editing ? 'Edit fund' : 'Create a fund'}</SheetTitle>
              <SheetDescription>
                {editing
                  ? 'Update this fund used for restricted or general fund accounting.'
                  : 'Set up a new general or restricted fund, e.g. Building Fund or Missions Fund.'}
              </SheetDescription>
            </SheetHeader>
            <SheetBody className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="e.g. Building Fund" {...register('name')} />
                {formState.errors.name && <p className="text-sm text-destructive">{formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(value: string) => setValue('type', value as FundType)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General</SelectItem>
                    <SelectItem value="RESTRICTED">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea id="description" rows={3} {...register('description')} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={isActive}
                  onChange={(e) => setValue('isActive', e.target.checked)}
                />
                Active
              </label>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </SheetBody>
            <SheetFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Create fund'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={!!deleteId} onOpenChange={(val: boolean) => !val && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Fund</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this fund? This action cannot be undone.
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
