'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Printer, Scale, TrendingUp } from 'lucide-react';
import { fetchBalanceSheet, fetchFinanceSummary } from '@/lib/api/finance';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount || 0);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function yearStart() {
  return `${new Date().getFullYear()}-01-01`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function FinancialStatementsPage() {
  const { hasPermission } = useAuth();
  const [from, setFrom] = useState(yearStart());
  const [to, setTo] = useState(today());

  const canView = hasPermission('finance.report');

  const balanceSheetQuery = useQuery({
    queryKey: ['balance-sheet', to],
    queryFn: () => fetchBalanceSheet(to),
    enabled: canView,
  });

  const summaryQuery = useQuery({
    queryKey: ['income-expenditure', from, to],
    queryFn: () => fetchFinanceSummary({ from, to }),
    enabled: canView,
  });

  if (!canView) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Financial Statements</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            You don&apos;t have permission to view this page.
          </CardContent>
        </Card>
      </div>
    );
  }

  const balanceSheet = balanceSheetQuery.data;
  const summary = summaryQuery.data;
  const isLoading = balanceSheetQuery.isLoading || summaryQuery.isLoading;

  return (
    <div className="space-y-6 p-4 md:p-6 print:space-y-8 print:p-10">
      {/* Controls — hidden entirely when printing */}
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight">Financial Statements</h1>
          <p className="text-muted-foreground">Balance Sheet and Income &amp; Expenditure, combined for printing</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="from" className="text-xs text-muted-foreground">
              Period from
            </Label>
            <Input id="from" type="date" className="w-40" value={from} onChange={(e) => setFrom(e.target.value)} max={to} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to" className="text-xs text-muted-foreground">
              Period to / Balance Sheet as of
            </Label>
            <Input
              id="to"
              type="date"
              className="w-40"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              min={from}
              max={today()}
            />
          </div>
          <Button onClick={() => window.print()} disabled={isLoading}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {/* Print-only letterhead */}
      <div className="hidden print:block print:text-center print:mb-6">
        <h1 className="font-serif text-2xl font-bold">Financial Statements</h1>
        <p className="text-sm text-muted-foreground">
          For the period {formatDate(from)} to {formatDate(to)}
        </p>
      </div>

      {isLoading ? (
        <Card className="print:hidden">
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading financial statements…
          </CardContent>
        </Card>
      ) : !balanceSheet || !summary ? (
        <Card className="print:hidden">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Unable to load the financial statements.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Income & Expenditure Statement ── */}
          <section className="space-y-3 break-inside-avoid">
            <div>
              <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-foreground">
                <TrendingUp className="h-5 w-5 text-primary print:hidden" /> Income &amp; Expenditure Statement
              </h2>
              <p className="text-sm text-muted-foreground">
                For the period {formatDate(from)} to {formatDate(to)}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="print:border print:shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Income</CardTitle>
                  <CardDescription>By category</CardDescription>
                </CardHeader>
                <CardContent>
                  {summary.incomeByCategory.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No income recorded for this period.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.incomeByCategory.map((row) => (
                          <TableRow key={row.category}>
                            <TableCell className="font-medium">{row.category}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell className="font-bold">Total Income</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(summary.totalIncome)}</TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card className="print:border print:shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Expenditure</CardTitle>
                  <CardDescription>By category</CardDescription>
                </CardHeader>
                <CardContent>
                  {summary.expenseByCategory.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No expenditure recorded for this period.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary.expenseByCategory.map((row) => (
                          <TableRow key={row.category}>
                            <TableCell className="font-medium">{row.category}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.total)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell className="font-bold">Total Expenditure</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(summary.totalExpense)}</TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-l-4 border-l-primary shadow-sm print:border print:border-l-4 print:shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Net Surplus / (Deficit)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`font-serif text-3xl font-extrabold ${summary.netBalance >= 0 ? 'text-primary' : 'text-destructive'}`}
                >
                  {formatCurrency(summary.netBalance)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatCurrency(summary.totalIncome)} &minus; {formatCurrency(summary.totalExpense)} ={' '}
                  {formatCurrency(summary.netBalance)}
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Page break between the two statements when printing */}
          <div className="print:break-before-page" />

          {/* ── Balance Sheet ── */}
          <section className="space-y-3 break-inside-avoid">
            <div>
              <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-foreground">
                <Scale className="h-5 w-5 text-primary print:hidden" /> Balance Sheet
              </h2>
              <p className="text-sm text-muted-foreground">As of {formatDate(balanceSheet.asOf)}</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="print:border print:shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Assets</CardTitle>
                  <CardDescription>Financial accounts and unallocated cash on hand</CardDescription>
                </CardHeader>
                <CardContent>
                  {balanceSheet.assets.length === 0 && balanceSheet.unallocatedCash === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No assets recorded.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Account Type</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {balanceSheet.assets.map((asset) => (
                          <TableRow key={asset.id}>
                            <TableCell className="font-medium">{asset.name}</TableCell>
                            <TableCell className="text-muted-foreground">{asset.accountType}</TableCell>
                            <TableCell className="text-right">{formatCurrency(asset.balance)}</TableCell>
                          </TableRow>
                        ))}
                        {balanceSheet.unallocatedCash !== 0 && (
                          <TableRow>
                            <TableCell className="font-medium">Unallocated Cash</TableCell>
                            <TableCell className="text-muted-foreground">—</TableCell>
                            <TableCell className="text-right">{formatCurrency(balanceSheet.unallocatedCash)}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell className="font-bold" colSpan={2}>
                            Total Assets
                          </TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(balanceSheet.totalAssets)}</TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card className="print:border print:shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Liabilities</CardTitle>
                  <CardDescription>Outstanding money owed by the church</CardDescription>
                </CardHeader>
                <CardContent>
                  {balanceSheet.liabilities.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No outstanding liabilities.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {balanceSheet.liabilities.map((liability) => (
                          <TableRow key={liability.id}>
                            <TableCell className="font-medium">{liability.name}</TableCell>
                            <TableCell className="text-muted-foreground">{liability.category ?? '—'}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {liability.dueDate ? new Date(liability.dueDate).toLocaleDateString() : '—'}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(liability.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter>
                        <TableRow>
                          <TableCell className="font-bold" colSpan={3}>
                            Total Liabilities
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {formatCurrency(balanceSheet.totalLiabilities)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-l-4 border-l-primary shadow-sm print:border print:border-l-4 print:shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Scale className="h-4 w-4 text-primary print:hidden" />
                  Fund Balance (Net Assets)
                </CardTitle>
                <CardDescription>Total Assets &minus; Total Liabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <p className="font-serif text-4xl font-extrabold text-primary">{formatCurrency(balanceSheet.fundBalance)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(balanceSheet.totalAssets)} &minus; {formatCurrency(balanceSheet.totalLiabilities)} ={' '}
                    {formatCurrency(balanceSheet.fundBalance)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
