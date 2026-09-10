'use client';

import type { FC } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  TrendingUp,
  TrendingDown,
  CalendarCheck,
  UserCheck,
  Image,
  Video,
  Plus,
  ArrowRight,
  Loader2,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  Sparkles,
  Cake,
  Gift,
} from 'lucide-react';
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
import { fetchDashboardStats } from '@/lib/api/dashboard';
import { fetchUpcomingBirthdays } from '@/lib/api/members';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function formatGHS(amount: number) {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(
    amount,
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const ChartLegend = Legend as unknown as FC<Record<string, unknown>>;

// Refined Royal Blue & Heritage Gold Brand Palette matching the Boys & Girls Brigade design system
const PIE_COLORS = ['#14309c', '#d97706', '#991b1b', '#047857', '#6b21a8', '#0284c7', '#ca8a04', '#475569'];

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });
  const { data: birthdays } = useQuery({
    queryKey: ['dashboard-birthdays'],
    queryFn: fetchUpcomingBirthdays,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium text-muted-foreground">Loading church management analytics…</p>
      </div>
    );
  }

  const overview = stats?.overview;
  const charts = stats?.charts;

  return (
    <div className="space-y-8">
      {/* Top Header Hero Banner — Navy & Gold Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-[#14309c] p-8 text-white shadow-2xl border border-blue-800">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold uppercase text-[11px] tracking-wider">
                <Sparkles className="mr-1 h-3 w-3" /> System Command Center
              </Badge>
            </div>
            <h1 className="font-serif text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              {getGreeting()}, {user?.firstName}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Live membership analytics, financial health, attendance trends, and photo gallery management.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/admin/members">
              <Button size="sm" variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white">
                <Users className="mr-1.5 h-4 w-4 text-amber-400" /> Members
              </Button>
            </Link>
            <Link href="/admin/giving">
              <Button size="sm" variant="outline" className="border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white">
                <DollarSign className="mr-1.5 h-4 w-4 text-emerald-400" /> Giving
              </Button>
            </Link>
            <Link href="/admin/media">
              <Button size="sm" className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-all shadow-lg">
                <Plus className="mr-1.5 h-4 w-4" /> Post Media / Album
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stat Counter Strip — Gold & Navy Typography */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-[#14309c] shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Active Membership
            </CardTitle>
            <div className="rounded-xl bg-[#14309c] p-2.5 text-amber-400 shadow-inner">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">
              {overview?.totalMembers ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="font-semibold text-[#14309c] dark:text-slate-200">{overview?.activeMembers ?? 0} active</span> members registered
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Monthly Income
            </CardTitle>
            <div className="rounded-xl bg-emerald-950 p-2.5 text-emerald-400 shadow-inner">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {formatGHS(overview?.monthlyIncome ?? 0)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Tithes, offerings &amp; donations this month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Monthly Expenses
            </CardTitle>
            <div className="rounded-xl bg-amber-950 p-2.5 text-amber-400 shadow-inner">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-amber-700 dark:text-amber-400">
              {formatGHS(overview?.monthlyExpense ?? 0)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Operational expenditures this month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-700 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Media &amp; Photo Albums
            </CardTitle>
            <div className="rounded-xl bg-purple-950 p-2.5 text-purple-300 shadow-inner">
              <Video className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-purple-700 dark:text-purple-400">
              {overview?.totalMedia ?? 0}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="font-semibold text-slate-900 dark:text-slate-200">{overview?.totalAlbums ?? 0} photo albums</span> &amp; video items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 12-Month Financial Performance Graph */}
      <Card className="shadow-md border border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 font-serif text-lg font-bold text-[#14309c] dark:text-white">
              <BarChart3 className="h-5 w-5 text-amber-500" />
              12-Month Financial Performance (Income vs. Expenses)
            </CardTitle>
            <CardDescription>Monthly church revenue and operational expenditure comparison</CardDescription>
          </div>
          <Link href="/admin/reports">
            <Button size="sm" variant="ghost" className="text-xs font-bold text-amber-600 hover:text-amber-700">
              Detailed Financial Reports <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.monthlyFinancialTrend ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis dataKey="period" fontSize={12} stroke="#64748b" />
                <YAxis fontSize={12} tickFormatter={(v: number) => formatGHS(v)} width={80} stroke="#64748b" />
                <Tooltip formatter={(value: number) => formatGHS(value)} />
                <ChartLegend />
                <Line type="monotone" dataKey="income" name="Income" stroke="#047857" strokeWidth={3} dot={{ r: 4, fill: '#047857' }} />
                <Line type="monotone" dataKey="expense" name="Expenses" stroke="#991b1b" strokeWidth={3} dot={{ r: 4, fill: '#991b1b' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pie Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pie Chart 1: Member Gender Demographics */}
        <Card className="shadow-md border border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] dark:text-white">
              <PieIcon className="h-4 w-4 text-[#14309c] dark:text-amber-400" />
              Member Gender Breakdown
            </CardTitle>
            <CardDescription>Demographic ratio</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {charts?.memberGender && charts.memberGender.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.memberGender}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {charts.memberGender.map((_, index) => (
                        <Cell key={`gender-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => [`${val} Members`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No member data recorded yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart 2: Income by Category */}
        <Card className="shadow-md border border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] dark:text-white">
              <PieIcon className="h-4 w-4 text-amber-500" />
              Income Categories Distribution
            </CardTitle>
            <CardDescription>Giving breakdown by source</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {charts?.incomeCategories && charts.incomeCategories.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.incomeCategories}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                    >
                      {charts.incomeCategories.map((_, index) => (
                        <Cell key={`income-cell-${index}`} fill={PIE_COLORS[(index + 1) % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => [formatGHS(val), 'Total']} />
                    <ChartLegend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No income category data recorded.</p>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart 3: Media Content Breakdown */}
        <Card className="shadow-md border border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] dark:text-white">
              <PieIcon className="h-4 w-4 text-purple-600" />
              Media Content Distribution
            </CardTitle>
            <CardDescription>Photos, Videos &amp; Live Streams</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {charts?.mediaTypes && charts.mediaTypes.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.mediaTypes}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                      label={({ name, value }: { name?: string; value?: number }) => `${name} (${value})`}
                    >
                      {charts.mediaTypes.map((_, index) => (
                        <Cell key={`media-cell-${index}`} fill={PIE_COLORS[(index + 3) % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => [`${val} items`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No media items uploaded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Visitor Status & Quick Actions Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-md border border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] dark:text-white">
              <UserCheck className="h-5 w-5 text-amber-500" />
              Visitor Follow-Up Funnel
            </CardTitle>
            <CardDescription>First-time visitor integration pipeline</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {charts?.visitorStatus && charts.visitorStatus.length > 0 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.visitorStatus}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
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

        {/* Quick Management Action Shortcuts */}
        <Card className="shadow-md border border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] dark:text-white">
              <Layers className="h-5 w-5 text-amber-500" />
              Quick Action Shortcuts
            </CardTitle>
            <CardDescription>Manage core modules with one click</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 pt-6">
            <Link href="/admin/media">
              <div className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-[#14309c] hover:shadow-lg dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-purple-100 p-2.5 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    <Image className="h-5 w-5" />
                  </div>
                  <Badge className="bg-[#14309c] text-amber-400 font-bold text-[10px]">Media &amp; Albums</Badge>
                </div>
                <div className="mt-4">
                  <h4 className="font-serif font-bold text-foreground group-hover:text-amber-600">Photo Albums &amp; Live Videos</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Create photo albums, upload photos or embed YouTube/Facebook live streams.</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/giving">
              <div className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-[#14309c] hover:shadow-lg dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <Badge className="bg-[#14309c] text-emerald-400 font-bold text-[10px]">Finance</Badge>
                </div>
                <div className="mt-4">
                  <h4 className="font-serif font-bold text-foreground group-hover:text-emerald-600">Record Giving &amp; Tithes</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Log income, Sunday offerings, special appeals, and manage financial ledgers.</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/attendance">
              <div className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-[#14309c] hover:shadow-lg dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <CalendarCheck className="h-5 w-5" />
                  </div>
                  <Badge className="bg-[#14309c] text-blue-400 font-bold text-[10px]">Attendance</Badge>
                </div>
                <div className="mt-4">
                  <h4 className="font-serif font-bold text-foreground group-hover:text-blue-600">Record Attendance</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Track headcount for Sunday services, Bible studies, and special programmes.</p>
                </div>
              </div>
            </Link>

            <Link href="/admin/events">
              <div className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-[#14309c] hover:shadow-lg dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-amber-100 p-2.5 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <Badge className="bg-[#14309c] text-amber-400 font-bold text-[10px]">Events</Badge>
                </div>
                <div className="mt-4">
                  <h4 className="font-serif font-bold text-foreground group-hover:text-amber-600">Manage Events &amp; Services</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Schedule conventions, choir performances, and community programmes.</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* New Additional Information Row: Upcoming Events & System Activity Log */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events Widget */}
        <Card className="shadow-md border border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] dark:text-white">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Upcoming Church Events &amp; Programmes
              </CardTitle>
              <CardDescription>Scheduled conventions, services, and activities</CardDescription>
            </div>
            <Link href="/admin/events">
              <Button size="sm" variant="ghost" className="text-xs font-bold text-amber-600 hover:text-amber-700">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {stats?.upcomingEvents && stats.upcomingEvents.length > 0 ? (
              stats.upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between rounded-xl border p-3 bg-card hover:bg-muted/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-serif text-sm font-bold text-foreground truncate">{ev.title}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{new Date(ev.startDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      {ev.location && <span>&bull; {ev.location}</span>}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px] font-mono border-amber-500/50 text-amber-600 dark:text-amber-400">
                    Upcoming
                  </Badge>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-muted-foreground">No upcoming events scheduled. Create new events under Events menu.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Sermons Widget */}
        <Card className="shadow-md border border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] dark:text-white">
                <Video className="h-5 w-5 text-purple-600" />
                Recent Sermon Recordings
              </CardTitle>
              <CardDescription>Recently published spiritual messages</CardDescription>
            </div>
            <Link href="/admin/sermons">
              <Button size="sm" variant="ghost" className="text-xs font-bold text-amber-600 hover:text-amber-700">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {stats?.recentSermons && stats.recentSermons.length > 0 ? (
              stats.recentSermons.map((sermon) => (
                <div
                  key={sermon.id}
                  className="flex items-center justify-between rounded-xl border p-3 bg-card hover:bg-muted/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-serif text-sm font-bold text-foreground truncate">{sermon.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      Speaker: <span className="font-semibold text-foreground">{sermon.speaker}</span> &bull;{' '}
                      {new Date(sermon.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px] font-mono">
                    Recorded
                  </Badge>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-muted-foreground">No sermon recordings uploaded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Birthdays Widget Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-md border border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] dark:text-white">
                <Cake className="h-5 w-5 text-amber-500" />
                Birthdays This Week
              </CardTitle>
              <CardDescription>Members celebrating in the next 7 days</CardDescription>
            </div>
            <Link href="/admin/members">
              <Button size="sm" variant="ghost" className="text-xs font-bold text-amber-600 hover:text-amber-700">
                View Members <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {birthdays?.thisWeek && birthdays.thisWeek.length > 0 ? (
              birthdays.thisWeek.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl border p-3 bg-card hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-500/40 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                      {m.profilePhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.profilePhotoUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Gift className="h-4 w-4" />
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-serif text-sm font-bold text-foreground truncate">
                        {m.firstName} {m.lastName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Turning {m.turningAge} &bull;{' '}
                        {new Date(m.birthday).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 text-[10px] font-mono border-amber-500/50 text-amber-600 dark:text-amber-400"
                  >
                    {m.daysUntil === 0 ? 'Today' : m.daysUntil === 1 ? 'Tomorrow' : `In ${m.daysUntil}d`}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-muted-foreground">No birthdays in the next 7 days.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 font-serif text-base font-bold text-[#14309c] dark:text-white">
                <Cake className="h-5 w-5 text-purple-600" />
                Birthdays This Month
              </CardTitle>
              <CardDescription>Every member celebrating this calendar month</CardDescription>
            </div>
            <Link href="/admin/members">
              <Button size="sm" variant="ghost" className="text-xs font-bold text-amber-600 hover:text-amber-700">
                View Members <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {birthdays?.thisMonth && birthdays.thisMonth.length > 0 ? (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {birthdays.thisMonth.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between rounded-lg border p-2.5 bg-card transition-colors ${m.isPast ? 'opacity-50' : 'hover:bg-muted/40'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#14309c]/10 text-xs font-bold text-[#14309c] dark:bg-[#14309c]/30 dark:text-blue-300">
                        {m.day}
                      </span>
                      <span className="truncate text-sm font-medium text-foreground">
                        {m.firstName} {m.lastName}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">Turning {m.turningAge}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-xs text-muted-foreground">No birthdays recorded this month.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
