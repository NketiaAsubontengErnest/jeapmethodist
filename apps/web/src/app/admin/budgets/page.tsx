'use client';

import { useEffect, useMemo, useState, type FC } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Pencil, Search, Trash2, PiggyBank, TrendingUp, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import {
  fetchBudgets,
  fetchBudgetVsActual,
  createBudget,
  updateBudget,
  deleteBudget,
  type Budget,
  type BudgetInput,
  type BudgetVsActualRow,
} from '@/lib/api/budgets';
import { fetchFunds, type Fund } from '@/lib/api/funds';
import { fetchIncomeCategories, fetchExpenseCategories } from '@/lib/api/finance';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const ChartLegend = Legend as unknown as FC<Record<string, unknown>>;

const NO_FUND = '__none__';

const budgetSchema = z.object({
  year: z.coerce.number().int().min(2000, 'Enter a valid year').max(2100, 'Enter a valid year'),
  categoryType: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().min(1, 'Select a category'),
  fundId: z.string().optional(),
  amount: z.coerce.number().positive('Enter an amount greater than zero'),
  notes: z.string().optional(),
});
type BudgetFormValues = z.infer<typeof budgetSchema>;

function formatCurrency(amount: string | number) {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value || 0);
}

function currentYearOptions() {
  const now = new Date().getFullYear();
  return [now - 2, now - 1, now, now + 1, now + 2];
}

/**
 * Derives the "over budget / under budget / on track" label and the good/bad
 * status for a budget-vs-actual row. The API's `variance` is positive when
 * things are going well for BOTH category types (actual exceeded budget for
 * income, actual came in under budget for expenses) — but the label needs to
 * read naturally against the raw budgeted-vs-actual comparison, which flips
 * direction between the two types.
 */
function getVarianceInfo(row: BudgetVsActualRow): {
  label: string;
  badgeVariant: 'success' | 'destructive' | 'secondary';
} {
  if (row.variance === 0) {
    return { label: 'On track', badgeVariant: 'secondary' };
  }
  const isIncome = row.categoryType === 'INCOME';
  const over = isIncome ? row.variance > 0 : row.variance < 0;
  return {
    label: over ? 'Over budget' : 'Under budget',
    badgeVariant: row.variance > 0 ? 'success' : 'destructive',
  };
}

export default function BudgetsPage() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const canView = hasPermission('finance.view');
  const canCreate = hasPermission('finance.create');
  const canUpdate = hasPermission('finance.update');
  const canDelete = hasPermission('finance.delete');
  const canReport = hasPermission('finance.report');

  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const budgetsQuery = useQuery({
    queryKey: ['budgets', selectedYear],
    queryFn: () => fetchBudgets({ year: selectedYear }),
    enabled: canView,
  });

  const vsActualQuery = useQuery({
    queryKey: ['budget-vs-actual', selectedYear],
    queryFn: () => fetchBudgetVsActual(selectedYear),
    enabled: canView && canReport,
  });

  const fundsQuery = useQuery({ queryKey: ['funds'], queryFn: fetchFunds, enabled: canView && open });
  const incomeCategoriesQuery = useQuery({
    queryKey: ['income-categories'],
    queryFn: fetchIncomeCategories,
    enabled: canView && open,
  });
  const expenseCategoriesQuery = useQuery({
    queryKey: ['expense-categories'],
    queryFn: fetchExpenseCategories,
    enabled: canView && open,
  });

  const { register, handleSubmit, watch, setValue, reset, formState } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { year: selectedYear, categoryType: 'INCOME', fundId: NO_FUND },
  });
  const categoryType = watch('categoryType');
  const categoryId = watch('categoryId');
  const fundId = watch('fundId');

  useEffect(() => {
    if (open) {
      if (editing) {
        reset({
          year: editing.year,
          categoryType: editing.incomeCategory ? 'INCOME' : 'EXPENSE',
          categoryId: editing.incomeCategory?.id ?? editing.expenseCategory?.id ?? '',
          fundId: editing.fund?.id ?? NO_FUND,
          amount: parseFloat(editing.amount),
          notes: editing.notes ?? '',
        });
      } else {
        reset({ year: selectedYear, categoryType: 'INCOME', categoryId: '', fundId: NO_FUND, amount: undefined, notes: '' });
      }
      setFormError(null);
    }
  }, [open, editing, selectedYear, reset]);

  const invalidateBudgetQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
    queryClient.invalidateQueries({ queryKey: ['budget-vs-actual'] });
  };

  const buildInput = (values: BudgetFormValues): BudgetInput => ({
    year: values.year,
    incomeCategoryId: values.categoryType === 'INCOME' ? values.categoryId : undefined,
    expenseCategoryId: values.categoryType === 'EXPENSE' ? values.categoryId : undefined,
    fundId: values.fundId && values.fundId !== NO_FUND ? values.fundId : undefined,
    amount: values.amount,
    notes: values.notes || undefined,
  });

  const createMutation = useMutation({
    mutationFn: (values: BudgetFormValues) => createBudget(buildInput(values)),
    onSuccess: () => {
      invalidateBudgetQueries();
      setOpen(false);
      toast.success('Budget line created!');
    },
    onError: (e) => {
      const message = e instanceof ApiError ? e.message : 'Failed to save budget line';
      setFormError(message);
      toast.error('Failed to save budget line', message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: BudgetFormValues }) => updateBudget(id, buildInput(values)),
    onSuccess: () => {
      invalidateBudgetQueries();
      setOpen(false);
      toast.success('Budget line updated!');
    },
    onError: (e) => {
      const message = e instanceof ApiError ? e.message : 'Failed to save budget line';
      setFormError(message);
      toast.error('Failed to save budget line', message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      invalidateBudgetQueries();
      setDeleteId(null);
      toast.success('Budget line deleted');
    },
    onError: (e) => toast.error('Failed to delete budget line', e instanceof ApiError ? e.message : undefined),
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (budget: Budget) => {
    setEditing(budget);
    setOpen(true);
  };

  const visibleBudgets = useMemo(() => {
    const items = budgetsQuery.data ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((budget) => {
      const categoryName = budget.incomeCategory?.name ?? budget.expenseCategory?.name ?? '';
      const fundName = budget.fund?.name ?? '';
      return categoryName.toLowerCase().includes(q) || fundName.toLowerCase().includes(q);
    });
  }, [budgetsQuery.data, search]);

  const chartData = useMemo(
    () =>
      (vsActualQuery.data ?? []).map((row) => ({
        name: `${row.category?.name ?? 'Unassigned'} (${row.categoryType === 'INCOME' ? 'Inc' : 'Exp'})`,
        Budgeted: row.budgeted,
        Actual: row.actual,
      })),
    [vsActualQuery.data],
  );

  if (!canView) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Budgets</h1>
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
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Plan annual income &amp; expense budgets and track them against actuals</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(selectedYear)} onValueChange={(v: string) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {currentYearOptions().map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {canCreate && (
            <Button onClick={openCreate} className="print:hidden">
              <Plus className="h-4 w-4" /> New budget line
            </Button>
          )}
        </div>
      </div>

      {canCreate && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent>
                <form
                  onSubmit={handleSubmit((values) => {
                    setFormError(null);
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
                    <SheetTitle>{editing ? 'Edit budget line' : 'New budget line'}</SheetTitle>
                    <SheetDescription>
                      Set a budgeted amount for one income or expense category for a given year.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetBody className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input id="year" type="number" step="1" {...register('year')} />
                      {formState.errors.year && <p className="text-sm text-destructive">{formState.errors.year.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setValue('categoryType', 'INCOME');
                          setValue('categoryId', '');
                        }}
                        className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                          categoryType === 'INCOME'
                            ? 'border-primary bg-secondary text-primary'
                            : 'border-input text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <ArrowUpCircle className="h-4 w-4" /> Income
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setValue('categoryType', 'EXPENSE');
                          setValue('categoryId', '');
                        }}
                        className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                          categoryType === 'EXPENSE'
                            ? 'border-primary bg-secondary text-primary'
                            : 'border-input text-muted-foreground hover:bg-secondary'
                        }`}
                      >
                        <ArrowDownCircle className="h-4 w-4" /> Expense
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoryId">{categoryType === 'INCOME' ? 'Income category' : 'Expense category'}</Label>
                      <Select value={categoryId} onValueChange={(v: string) => setValue('categoryId', v)}>
                        <SelectTrigger id="categoryId">
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(categoryType === 'INCOME' ? incomeCategoriesQuery.data : expenseCategoriesQuery.data)?.map(
                            (c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      {formState.errors.categoryId && (
                        <p className="text-sm text-destructive">{formState.errors.categoryId.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fundId">Fund (optional)</Label>
                      <Select value={fundId} onValueChange={(v: string) => setValue('fundId', v)}>
                        <SelectTrigger id="fundId">
                          <SelectValue placeholder="General / Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_FUND}>General / Unassigned</SelectItem>
                          {fundsQuery.data?.map((f: Fund) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Budgeted amount (GHS)</Label>
                      <Input id="amount" type="number" step="0.01" min="0" {...register('amount')} />
                      {formState.errors.amount && <p className="text-sm text-destructive">{formState.errors.amount.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea id="notes" rows={3} {...register('notes')} />
                    </div>

                    {formError && <p className="text-sm text-destructive">{formError}</p>}
                  </SheetBody>
                  <SheetFooter>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Create budget line'}
                    </Button>
                  </SheetFooter>
                </form>
          </SheetContent>
        </Sheet>
      )}

      <Tabs defaultValue="line-items" className="space-y-6">
        <TabsList>
          <TabsTrigger value="line-items" className="flex items-center gap-2">
            <PiggyBank className="h-4 w-4" /> Budget Line Items
          </TabsTrigger>
          <TabsTrigger value="vs-actual" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Budget vs. Actual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="line-items">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle className="text-base">Budget lines for {selectedYear}</CardTitle>
                <CardDescription>One row per income or expense category budgeted for this year</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full max-w-xs print:hidden">
                  <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by category or fund…"
                    className="pl-8"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <ListActions
                  onExport={() =>
                    exportToCsv('budgets', visibleBudgets, [
                      { header: 'Year', accessor: (b) => b.year },
                      {
                        header: 'Category',
                        accessor: (b) => b.incomeCategory?.name ?? b.expenseCategory?.name ?? '',
                      },
                      { header: 'Type', accessor: (b) => (b.incomeCategory ? 'Income' : 'Expense') },
                      { header: 'Fund', accessor: (b) => b.fund?.name ?? '' },
                      { header: 'Amount (GHS)', accessor: (b) => b.amount },
                    ])
                  }
                  exportDisabled={visibleBudgets.length === 0}
                />
              </div>
            </CardHeader>
            <CardContent>
              {budgetsQuery.isLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading budgets…
                </div>
              ) : visibleBudgets.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {search ? 'No budget lines match your search.' : `No budget lines set for ${selectedYear} yet.`}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Fund</TableHead>
                      <TableHead>Budgeted Amount</TableHead>
                      {(canUpdate || canDelete) && <TableHead className="w-24 text-right print:hidden">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleBudgets.map((budget) => {
                      const isIncome = !!budget.incomeCategory;
                      const categoryName = budget.incomeCategory?.name ?? budget.expenseCategory?.name ?? '—';
                      return (
                        <TableRow key={budget.id}>
                          <TableCell className="font-medium">
                            <span className="flex items-center gap-2">
                              <Badge variant={isIncome ? 'success' : 'secondary'}>{isIncome ? 'Income' : 'Expense'}</Badge>
                              {categoryName}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{budget.fund?.name ?? 'General / Unassigned'}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(budget.amount)}</TableCell>
                          {(canUpdate || canDelete) && (
                            <TableCell className="text-right print:hidden">
                              <div className="flex items-center justify-end gap-1">
                                {canUpdate && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(budget)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                {canDelete && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteId(budget.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
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
        </TabsContent>

        <TabsContent value="vs-actual" className="space-y-6">
          {!canReport ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                You don&apos;t have permission to view the budget-vs-actual report.
              </CardContent>
            </Card>
          ) : vsActualQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading budget vs. actual…
            </div>
          ) : vsActualQuery.data && vsActualQuery.data.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No budget lines to compare for {selectedYear}.
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Budgeted vs. Actual — {selectedYear}</CardTitle>
                  <CardDescription>Comparing budgeted amounts to recorded transactions for this year</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 admin-dark:stroke-slate-800" />
                        <XAxis dataKey="name" fontSize={11} stroke="#64748b" interval={0} angle={-20} textAnchor="end" height={70} />
                        <YAxis fontSize={12} tickFormatter={(v: number) => formatCurrency(v)} width={90} stroke="#64748b" />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <ChartLegend />
                        <Bar dataKey="Budgeted" fill="#14309c" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Actual" fill="#d97706" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Fund</TableHead>
                        <TableHead>Budgeted</TableHead>
                        <TableHead>Actual</TableHead>
                        <TableHead>Variance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vsActualQuery.data?.map((row) => {
                        const { label, badgeVariant } = getVarianceInfo(row);
                        return (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">
                              <span className="flex items-center gap-2">
                                <Badge variant={row.categoryType === 'INCOME' ? 'success' : 'secondary'}>
                                  {row.categoryType === 'INCOME' ? 'Income' : 'Expense'}
                                </Badge>
                                {row.category?.name ?? 'Unassigned'}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{row.fund?.name ?? 'General / Unassigned'}</TableCell>
                            <TableCell>{formatCurrency(row.budgeted)}</TableCell>
                            <TableCell>{formatCurrency(row.actual)}</TableCell>
                            <TableCell className={row.variance < 0 ? 'text-destructive font-medium' : 'font-medium'}>
                              {row.variance > 0 ? '+' : ''}
                              {formatCurrency(row.variance)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={badgeVariant}>{label}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!deleteId} onOpenChange={(val: boolean) => !val && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Budget Line</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this budget line? This action cannot be undone.
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
