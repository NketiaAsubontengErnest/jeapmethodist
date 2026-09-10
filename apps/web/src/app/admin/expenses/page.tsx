'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Search, Trash2 } from 'lucide-react';
import {
  fetchTransactions,
  createTransaction,
  deleteTransaction,
  fetchExpenseCategories,
  type TransactionListItem,
} from '@/lib/api/finance';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
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
  date: z.string().min(1, 'Date is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  expenseCategoryId: z.string().min(1, 'Select a category'),
  description: z.string().optional(),
  reference: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

function formatGHS(amount: number | string) {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(Number(amount));
}

export default function ExpensesPage() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const transactionsQuery = useQuery({
    queryKey: ['finance-transactions', 'EXPENSE', page],
    queryFn: () => fetchTransactions({ page, type: 'EXPENSE' }),
  });
  const categoriesQuery = useQuery({ queryKey: ['expense-categories'], queryFn: fetchExpenseCategories });

  const visibleTransactions = useMemo(() => {
    const items = transactionsQuery.data?.items ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((tx) => {
      return (
        (tx.description ?? '').toLowerCase().includes(q) ||
        (tx.reference ?? '').toLowerCase().includes(q) ||
        (tx.expenseCategory?.name ?? '').toLowerCase().includes(q)
      );
    });
  }, [transactionsQuery.data, search]);

  const { register, control, handleSubmit, reset } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => createTransaction({ ...values, type: 'EXPENSE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      setOpen(false);
      reset();
      toast.success('Expense recorded!');
    },
    onError: (e) => {
      const message = e instanceof ApiError ? e.message : 'Failed to record expense';
      setError(message);
      toast.error('Failed to record expense', message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      toast.success('Expense deleted');
    },
    onError: (e) => toast.error('Failed to delete expense', e instanceof ApiError ? e.message : undefined),
  });

  const canCreate = hasPermission('finance.create');
  const canDelete = hasPermission('finance.delete');
  const canExport = hasPermission('finance.report');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const all: TransactionListItem[] = [];
      let currentPage = 1;
      // Export honors the current search filter is not backend-driven here, so pull every page.
      for (;;) {
        const res = await fetchTransactions({ page: currentPage, pageSize: 100, type: 'EXPENSE' });
        all.push(...res.items);
        if (currentPage >= res.totalPages) break;
        currentPage += 1;
      }
      exportToCsv('expenses', all, [
        { header: 'Date', accessor: (t) => new Date(t.date).toLocaleDateString() },
        { header: 'Description', accessor: (t) => t.description ?? '' },
        { header: 'Category', accessor: (t) => t.expenseCategory?.name ?? '' },
        { header: 'Reference', accessor: (t) => t.reference ?? '' },
        { header: 'Amount (GHS)', accessor: (t) => t.amount },
        { header: 'Status', accessor: (t) => t.approvalStatus },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Utilities, maintenance, programmes and other church expenditure</p>
        </div>
        <div className="flex gap-2">
          {canExport && (
            <ListActions
              onExport={handleExport}
              exportDisabled={isExporting}
              exportLabel={isExporting ? 'Exporting…' : 'Export CSV'}
            />
          )}
          {canCreate && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button className="print:hidden">
                  <Plus className="h-4 w-4" />
                  Record expense
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
                    <SheetTitle>Record an expense</SheetTitle>
                    <SheetDescription>Attach a receipt reference where possible.</SheetDescription>
                  </SheetHeader>
                  <SheetBody className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" {...register('date')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (GHS)</Label>
                        <Input id="amount" type="number" step="0.01" min="0" {...register('amount')} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expenseCategoryId">Category</Label>
                      <Controller
                        control={control}
                        name="expenseCategoryId"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="expenseCategoryId">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categoriesQuery.data?.map((c) => (
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
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" {...register('description')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reference">Receipt / reference no.</Label>
                      <Input id="reference" {...register('reference')} />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                  </SheetBody>
                  <SheetFooter>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Saving…' : 'Save expense'}
                    </Button>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">
            {transactionsQuery.data
              ? `${transactionsQuery.data.total} expense${transactionsQuery.data.total === 1 ? '' : 's'}`
              : 'Expenses'}
          </CardTitle>
          <div className="relative w-full max-w-xs print:hidden">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by description, reference or category…"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {transactionsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : visibleTransactions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'No expenses match your search.' : 'No expenses recorded yet.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {canDelete && <TableHead className="text-right print:hidden">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{tx.expenseCategory?.name ?? 'Uncategorized'}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{tx.description ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={tx.approvalStatus === 'APPROVED' ? 'success' : 'secondary'}>
                        {tx.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatGHS(tx.amount)}</TableCell>
                    {canDelete && (
                      <TableCell className="text-right print:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(tx.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {transactionsQuery.data && transactionsQuery.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2 print:hidden">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {transactionsQuery.data.page} of {transactionsQuery.data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= transactionsQuery.data.totalPages}
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
