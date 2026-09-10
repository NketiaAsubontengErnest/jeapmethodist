'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Landmark, Loader2, Undo2 } from 'lucide-react';
import {
  fetchFinancialAccounts,
  fetchTransactions,
  reconcileTransaction,
  unreconcileTransaction,
  type TransactionListItem,
} from '@/lib/api/finance';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { ApiError } from '@/lib/api-client';
import { exportToCsv } from '@/lib/export-csv';
import { ListActions } from '@/components/admin/list-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function formatCurrency(amount: string | number) {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value || 0);
}

export default function ReconciliationPage() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const canView = hasPermission('finance.view');
  const canUpdate = hasPermission('finance.update');

  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>(undefined);
  const [showOnlyUnreconciled, setShowOnlyUnreconciled] = useState(true);

  const accountsQuery = useQuery({
    queryKey: ['financial-accounts'],
    queryFn: fetchFinancialAccounts,
    enabled: canView,
  });

  // Drives the KPI totals — always fetched unfiltered by reconciled status so
  // the "X of Y reconciled" counts stay accurate regardless of the toggle below.
  const statsQuery = useQuery({
    queryKey: ['reconciliation-stats', selectedAccountId],
    queryFn: () => fetchTransactions({ financialAccountId: selectedAccountId!, pageSize: 100 }),
    enabled: canView && !!selectedAccountId,
  });

  const transactionsQuery = useQuery({
    queryKey: ['reconciliation-transactions', selectedAccountId, showOnlyUnreconciled],
    queryFn: () =>
      fetchTransactions({
        financialAccountId: selectedAccountId!,
        isReconciled: showOnlyUnreconciled ? false : undefined,
        pageSize: 100,
      }),
    enabled: canView && !!selectedAccountId,
  });

  const invalidateReconciliation = () => {
    queryClient.invalidateQueries({ queryKey: ['reconciliation-transactions'] });
    queryClient.invalidateQueries({ queryKey: ['reconciliation-stats'] });
  };

  const reconcileMutation = useMutation({
    mutationFn: reconcileTransaction,
    onSuccess: () => {
      invalidateReconciliation();
      toast.success('Transaction reconciled!');
    },
    onError: (e) => toast.error('Failed to reconcile transaction', e instanceof ApiError ? e.message : undefined),
  });

  const unreconcileMutation = useMutation({
    mutationFn: unreconcileTransaction,
    onSuccess: () => {
      invalidateReconciliation();
      toast.success('Transaction unreconciled');
    },
    onError: (e) => toast.error('Failed to unreconcile transaction', e instanceof ApiError ? e.message : undefined),
  });

  const stats = useMemo(() => {
    const items = statsQuery.data?.items ?? [];
    const total = statsQuery.data?.total ?? items.length;
    const reconciledCount = items.filter((t) => t.isReconciled).length;
    const unreconciledSum = items
      .filter((t) => !t.isReconciled)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return { total, reconciledCount, unreconciledSum };
  }, [statsQuery.data]);

  if (!canView) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Bank Reconciliation</h1>
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
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Bank Reconciliation</h1>
          <p className="text-muted-foreground">
            Compare recorded transactions against your bank or MoMo statement, one account at a time
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select a financial account…" />
            </SelectTrigger>
            <SelectContent>
              {accountsQuery.data?.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setShowOnlyUnreconciled(true)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                showOnlyUnreconciled
                  ? 'border-primary bg-secondary text-primary'
                  : 'border-input text-muted-foreground hover:bg-secondary'
              }`}
            >
              Unreconciled only
            </button>
            <button
              type="button"
              onClick={() => setShowOnlyUnreconciled(false)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                !showOnlyUnreconciled
                  ? 'border-primary bg-secondary text-primary'
                  : 'border-input text-muted-foreground hover:bg-secondary'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {!selectedAccountId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Landmark className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Select a financial account above to begin reconciling its transactions against your bank or MoMo statement.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Reconciled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-2xl font-bold text-primary">
                  {stats.reconciledCount} of {stats.total} transactions reconciled
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Unreconciled Gap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-serif text-2xl font-bold text-destructive">{formatCurrency(stats.unreconciledSum)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Total amount still to review</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-base">Transactions</CardTitle>
                <CardDescription>
                  {showOnlyUnreconciled ? 'Showing unreconciled transactions only' : 'Showing all transactions'}
                </CardDescription>
              </div>
              <ListActions
                onExport={() =>
                  exportToCsv('reconciliation-transactions', transactionsQuery.data?.items ?? [], [
                    { header: 'Date', accessor: (t) => new Date(t.date).toLocaleDateString() },
                    { header: 'Type', accessor: (t) => (t.type === 'INCOME' ? 'Income' : 'Expense') },
                    {
                      header: 'Description / Category',
                      accessor: (t) => t.incomeCategory?.name ?? t.expenseCategory?.name ?? t.description ?? '',
                    },
                    { header: 'Amount', accessor: (t) => t.amount },
                    { header: 'Reference', accessor: (t) => t.reference ?? '' },
                    { header: 'Reconciled', accessor: (t) => (t.isReconciled ? 'Yes' : 'No') },
                  ])
                }
                exportDisabled={!transactionsQuery.data || transactionsQuery.data.items.length === 0}
              />
            </CardHeader>
            <CardContent>
              {transactionsQuery.isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading transactions…
                </div>
              ) : transactionsQuery.data && transactionsQuery.data.items.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {showOnlyUnreconciled ? 'No unreconciled transactions for this account.' : 'No transactions for this account.'}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description / Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      {canUpdate && <TableHead className="w-28 text-right print:hidden">Action</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsQuery.data?.items.map((t: TransactionListItem) => {
                      const isReconcilingRow = reconcileMutation.isPending && reconcileMutation.variables === t.id;
                      const isUnreconcilingRow = unreconcileMutation.isPending && unreconcileMutation.variables === t.id;
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="text-muted-foreground">{new Date(t.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={t.type === 'INCOME' ? 'success' : 'destructive'}>
                              {t.type === 'INCOME' ? 'Income' : 'Expense'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {t.incomeCategory?.name ?? t.expenseCategory?.name ?? '—'}
                            </div>
                            {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
                          </TableCell>
                          <TableCell className="font-semibold">{formatCurrency(t.amount)}</TableCell>
                          <TableCell className="text-muted-foreground">{t.reference ?? '—'}</TableCell>
                          <TableCell>
                            {t.isReconciled ? (
                              <div>
                                <Badge variant="success">Reconciled</Badge>
                                <p
                                  className="mt-1 text-xs text-muted-foreground"
                                  title={t.reconciledAt ? new Date(t.reconciledAt).toLocaleString() : undefined}
                                >
                                  {t.reconciledByUser ? `${t.reconciledByUser.firstName} ${t.reconciledByUser.lastName}` : ''}
                                  {t.reconciledByUser && t.reconciledAt ? ' · ' : ''}
                                  {t.reconciledAt ? new Date(t.reconciledAt).toLocaleDateString() : ''}
                                </p>
                              </div>
                            ) : (
                              <Badge variant="secondary">Unreconciled</Badge>
                            )}
                          </TableCell>
                          {canUpdate && (
                            <TableCell className="text-right print:hidden">
                              {t.isReconciled ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isUnreconcilingRow}
                                  onClick={() => unreconcileMutation.mutate(t.id)}
                                >
                                  {isUnreconcilingRow ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Undo2 className="h-4 w-4" />
                                  )}
                                  Undo
                                </Button>
                              ) : (
                                <Button size="sm" disabled={isReconcilingRow} onClick={() => reconcileMutation.mutate(t.id)}>
                                  {isReconcilingRow ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                  Reconcile
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
