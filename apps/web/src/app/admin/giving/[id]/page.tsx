'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { fetchOfferingSession, addOfferingLine, removeOfferingLine } from '@/lib/api/offering-sessions';
import { fetchIncomeCategories } from '@/lib/api/finance';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { exportToCsv } from '@/lib/export-csv';
import { ListActions } from '@/components/admin/list-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const schema = z.object({
  incomeCategoryId: z.string().min(1, 'Select a category'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function formatGHS(amount: number | string) {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(Number(amount));
}

export default function OfferingSessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const sessionQuery = useQuery({ queryKey: ['offering-sessions', id], queryFn: () => fetchOfferingSession(id) });
  const categoriesQuery = useQuery({ queryKey: ['income-categories'], queryFn: fetchIncomeCategories });

  const visibleLines = useMemo(() => {
    const lines = sessionQuery.data?.transactions ?? [];
    if (!search.trim()) return lines;
    const q = search.trim().toLowerCase();
    return lines.filter((line) => line.incomeCategory.name.toLowerCase().includes(q));
  }, [sessionQuery.data, search]);

  const { register, control, handleSubmit, reset } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const addMutation = useMutation({
    mutationFn: (values: FormValues) => addOfferingLine(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offering-sessions'] });
      reset();
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to add line'),
  });

  const removeMutation = useMutation({
    mutationFn: (transactionId: string) => removeOfferingLine(id, transactionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offering-sessions'] }),
  });

  const canEdit = hasPermission('finance.create');

  if (sessionQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading session…
      </div>
    );
  }

  if (sessionQuery.isError || !sessionQuery.data) {
    return <p className="py-8 text-center text-sm text-destructive">Offering session not found.</p>;
  }

  const session = sessionQuery.data;
  const total = session.transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const usedCategoryIds = new Set(session.transactions.map((t) => t.incomeCategory.id));
  const availableCategories = categoriesQuery.data?.filter((c) => !usedCategoryIds.has(c.id)) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
          <Link href="/admin/giving">
            <ArrowLeft className="h-4 w-4" />
            Back to giving
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {session.programmeType.name} — {new Date(session.sessionDate).toLocaleDateString()}
          </h1>
          <Badge variant="secondary">{formatGHS(total)} total</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Category totals</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            {session.transactions.length > 0 && (
              <div className="relative w-full max-w-xs print:hidden">
                <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by category…"
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
            <ListActions
              onExport={() =>
                exportToCsv(`offering-session-${session.id}`, visibleLines, [
                  { header: 'Category', accessor: (l) => l.incomeCategory.name },
                  { header: 'Amount (GHS)', accessor: (l) => l.amount },
                ])
              }
              exportDisabled={visibleLines.length === 0}
            />
          </div>
        </CardHeader>
        <CardContent>
          {session.transactions.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No amounts recorded yet.</p>
          ) : visibleLines.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No categories match your search.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {canEdit && <TableHead className="text-right print:hidden">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.incomeCategory.name}</TableCell>
                    <TableCell className="text-right font-medium">{formatGHS(line.amount)}</TableCell>
                    {canEdit && (
                      <TableCell className="text-right print:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMutation.mutate(line.id)}
                          disabled={removeMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-semibold">{formatGHS(total)}</TableCell>
                  {canEdit && <TableCell />}
                </TableRow>
              </TableFooter>
            </Table>
          )}

          {canEdit && availableCategories.length > 0 && (
            <form
              onSubmit={handleSubmit((values) => {
                setError(null);
                addMutation.mutate(values);
              })}
              className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4 print:hidden"
            >
              <div className="min-w-[180px] flex-1 space-y-2">
                <Label htmlFor="incomeCategoryId">Category</Label>
                <Controller
                  control={control}
                  name="incomeCategoryId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="incomeCategoryId">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="w-36 space-y-2">
                <Label htmlFor="amount">Amount (GHS)</Label>
                <Input id="amount" type="number" step="0.01" min="0" {...register('amount')} />
              </div>
              <Button type="submit" disabled={addMutation.isPending}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </form>
          )}
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
