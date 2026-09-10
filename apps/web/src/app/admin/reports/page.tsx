'use client';

import { useState, type FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Loader2, BarChart3, PieChart as PieIcon, Users, CalendarCheck, DollarSign, Image } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchFinanceSummary, fetchAnnualSummary, downloadTransactionsCsv } from '@/lib/api/finance';
import { fetchReportsAnalytics } from '@/lib/api/reports-api';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function formatGHS(amount: number) {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(
    amount,
  );
}

const ChartLegend = Legend as unknown as FC<Record<string, unknown>>;
const PIE_COLORS = ['#14309c', '#d97706', '#991b1b', '#047857', '#6b21a8', '#0284c7', '#ca8a04', '#475569'];

export default function ReportsPage() {
  const { hasPermission } = useAuth();
  const [timeRange, setTimeRange] = useState('12m');

  const summaryQuery = useQuery({ queryKey: ['finance-summary'], queryFn: () => fetchFinanceSummary() });
  const annualQuery = useQuery({ queryKey: ['finance-annual-summary'], queryFn: fetchAnnualSummary });
  const analyticsQuery = useQuery({
    queryKey: ['reports-analytics', timeRange],
    queryFn: () => fetchReportsAnalytics(timeRange),
  });

  const canExport = hasPermission('finance.report');

  if (summaryQuery.isLoading || analyticsQuery.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-amber-500" /> Loading analytics &amp; reports…
      </div>
    );
  }

  const summary = summaryQuery.data;
  const analytics = analyticsQuery.data;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-[#14309c] admin-dark:text-white">
            Reports &amp; Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Church performance metrics, financial category charts, attendance trends, and demographics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px] border-slate-300 admin-dark:border-slate-800">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>

          {canExport && (
            <Button variant="outline" className="border-[#14309c] text-[#14309c] hover:bg-[#14309c] hover:text-white admin-dark:border-slate-700 admin-dark:text-slate-200" onClick={() => downloadTransactionsCsv()}>
              <Download className="mr-1.5 h-4 w-4" /> Export CSV Report
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="finance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-4 bg-[#14309c] text-slate-300 p-1.5 rounded-xl">
          <TabsTrigger value="finance" className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold">
            <DollarSign className="h-4 w-4" /> Finance
          </TabsTrigger>
          <TabsTrigger value="attendance" className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold">
            <CalendarCheck className="h-4 w-4" /> Attendance
          </TabsTrigger>
          <TabsTrigger value="demographics" className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold">
            <Users className="h-4 w-4" /> Demographics
          </TabsTrigger>
          <TabsTrigger value="media-visitors" className="flex items-center gap-2 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold">
            <Image className="h-4 w-4" /> Media &amp; Visitors
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Finance Reports */}
        <TabsContent value="finance" className="space-y-6">
          {summary && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-l-4 border-l-emerald-600 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Total Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-extrabold text-emerald-700 admin-dark:text-emerald-400">
                    {formatGHS(summary.totalIncome)}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-600 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Total Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-extrabold text-red-700 admin-dark:text-red-400">{formatGHS(summary.totalExpense)}</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-[#14309c] shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Net Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-extrabold text-amber-600 admin-dark:text-amber-400">{formatGHS(summary.netBalance)}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {summary && summary.monthlyTrend.length > 0 && (
            <Card className="shadow-md border border-slate-200 admin-dark:border-slate-800">
              <CardHeader>
                <CardTitle className="font-serif text-lg font-bold text-[#14309c] admin-dark:text-white">
                  Monthly Income vs. Expenses Comparison
                </CardTitle>
                <CardDescription>Visual financial trajectory over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={summary.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 admin-dark:stroke-slate-800" />
                      <XAxis dataKey="period" fontSize={12} stroke="#64748b" />
                      <YAxis fontSize={12} tickFormatter={(v: number) => formatGHS(v)} width={80} stroke="#64748b" />
                      <Tooltip formatter={(value: number) => formatGHS(value)} />
                      <ChartLegend />
                      <Line type="monotone" dataKey="income" name="Income" stroke="#047857" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="expense" name="Expense" stroke="#991b1b" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Finance Category Pie Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-md border border-slate-200 admin-dark:border-slate-800">
              <CardHeader className="border-b pb-4">
                <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] admin-dark:text-white">
                  <PieIcon className="h-4 w-4 text-emerald-600" />
                  Income Distribution by Category (Pie Chart)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {analytics?.finance.incomeByCategories && analytics.finance.incomeByCategories.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.finance.incomeByCategories}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          paddingAngle={3}
                          label={({ name, percent }: { name?: string; percent?: number }) =>
                            `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                        >
                          {analytics.finance.incomeByCategories.map((_, index) => (
                            <Cell key={`income-pie-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: number) => [formatGHS(val), 'Total']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">No income category data recorded.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md border border-slate-200 admin-dark:border-slate-800">
              <CardHeader className="border-b pb-4">
                <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] admin-dark:text-white">
                  <PieIcon className="h-4 w-4 text-red-600" />
                  Expense Distribution by Category (Pie Chart)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {analytics?.finance.expenseByCategories && analytics.finance.expenseByCategories.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.finance.expenseByCategories}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          paddingAngle={3}
                          label={({ name, percent }: { name?: string; percent?: number }) =>
                            `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                        >
                          {analytics.finance.expenseByCategories.map((_, index) => (
                            <Cell key={`expense-pie-${index}`} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: number) => [formatGHS(val), 'Total']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">No expense category data recorded.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md border border-slate-200 admin-dark:border-slate-800">
            <CardHeader className="border-b pb-4">
              <CardTitle className="font-serif text-base font-bold text-[#14309c] admin-dark:text-white">
                Annual Financial Ledger Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {annualQuery.isLoading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                </div>
              ) : annualQuery.data && annualQuery.data.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No financial history recorded yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#14309c]/5 hover:bg-[#14309c]/5">
                      <TableHead className="font-bold text-[#14309c] admin-dark:text-slate-200">Year</TableHead>
                      <TableHead className="text-right font-bold text-[#14309c] admin-dark:text-slate-200">Income</TableHead>
                      <TableHead className="text-right font-bold text-[#14309c] admin-dark:text-slate-200">Expenses</TableHead>
                      <TableHead className="text-right font-bold text-[#14309c] admin-dark:text-slate-200">Net Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {annualQuery.data?.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell className="font-bold text-[#14309c] admin-dark:text-slate-200">{row.year}</TableCell>
                        <TableCell className="text-right font-semibold text-emerald-700 admin-dark:text-emerald-400">
                          {formatGHS(row.income)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600">{formatGHS(row.expense)}</TableCell>
                        <TableCell className="text-right font-bold text-amber-600">{formatGHS(row.net)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Attendance Analytics */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-l-4 border-l-blue-600 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total Present Headcount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-extrabold text-[#14309c] admin-dark:text-blue-400">{analytics?.attendance.totalRecords ?? 0}</p>
                <p className="mt-1 text-xs text-muted-foreground">Members &amp; visitors recorded in selected period</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-600 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Total Sessions Conducted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-extrabold text-purple-700 admin-dark:text-purple-400">{analytics?.attendance.totalSessions ?? 0}</p>
                <p className="mt-1 text-xs text-muted-foreground">Sunday services, midweek &amp; special programmes</p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-md border border-slate-200 admin-dark:border-slate-800">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] admin-dark:text-white">
                <PieIcon className="h-4 w-4 text-amber-500" />
                Attendance by Programme Type (Pie Chart)
              </CardTitle>
              <CardDescription>Proportion of attendance across church services</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {analytics?.attendance.byProgrammeType && analytics.attendance.byProgrammeType.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.attendance.byProgrammeType}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        paddingAngle={3}
                        label={({ name, value }: { name?: string; value?: number }) => `${name}: ${value}`}
                      >
                        {analytics.attendance.byProgrammeType.map((_, index) => (
                          <Cell key={`att-pie-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => [`${val} Attendees`, 'Count']} />
                      <ChartLegend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">No attendance records logged.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Demographics */}
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-md border border-slate-200 admin-dark:border-slate-800">
              <CardHeader className="border-b pb-4">
                <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] admin-dark:text-white">
                  <PieIcon className="h-4 w-4 text-[#14309c] admin-dark:text-amber-400" />
                  Membership Category Distribution (Pie Chart)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {analytics?.demographics.byCategory && analytics.demographics.byCategory.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.demographics.byCategory}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          paddingAngle={3}
                        >
                          {analytics.demographics.byCategory.map((_, index) => (
                            <Cell key={`cat-pie-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: number) => [`${val} Members`, 'Count']} />
                        <ChartLegend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">No member categories found.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md border border-slate-200 admin-dark:border-slate-800">
              <CardHeader className="border-b pb-4">
                <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] admin-dark:text-white">
                  <PieIcon className="h-4 w-4 text-emerald-600" />
                  Membership Status Breakdown (Pie Chart)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {analytics?.demographics.byStatus && analytics.demographics.byStatus.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.demographics.byStatus}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          paddingAngle={3}
                        >
                          {analytics.demographics.byStatus.map((_, index) => (
                            <Cell key={`stat-pie-${index}`} fill={PIE_COLORS[(index + 3) % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: number) => [`${val} Members`, 'Count']} />
                        <ChartLegend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">No membership status found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 4: Media & Visitors */}
        <TabsContent value="media-visitors" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-md border border-slate-200 admin-dark:border-slate-800">
              <CardHeader className="border-b pb-4">
                <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] admin-dark:text-white">
                  <PieIcon className="h-4 w-4 text-purple-600" />
                  Media Content Type Distribution (Pie Chart)
                </CardTitle>
                <CardDescription>Photos, Videos &amp; Live Streams</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {analytics?.media.byType && analytics.media.byType.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.media.byType}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          paddingAngle={3}
                          label={({ name, value }: { name?: string; value?: number }) => `${name} (${value})`}
                        >
                          {analytics.media.byType.map((_, index) => (
                            <Cell key={`media-pie-${index}`} fill={PIE_COLORS[(index + 4) % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: number) => [`${val} items`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">No media data recorded.</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md border border-slate-200 admin-dark:border-slate-800">
              <CardHeader className="border-b pb-4">
                <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] admin-dark:text-white">
                  <BarChart3 className="h-4 w-4 text-amber-500" />
                  Visitor Integration Funnel
                </CardTitle>
                <CardDescription>First-time visitors conversion pipeline</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {analytics?.visitors.byStatus && analytics.visitors.byStatus.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.visitors.byStatus}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 admin-dark:stroke-slate-800" />
                        <XAxis dataKey="name" fontSize={11} stroke="#64748b" />
                        <YAxis fontSize={11} stroke="#64748b" />
                        <Tooltip />
                        <Bar dataKey="value" name="Visitors" fill="#d97706" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">No visitor records logged.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
