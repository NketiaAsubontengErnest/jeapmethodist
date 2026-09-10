'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus, Search, Users } from 'lucide-react';
import { fetchSessions, fetchAttendanceSummary, type SessionListItem } from '@/lib/api/attendance';
import { useAuth } from '@/lib/auth-context';
import { exportToCsv } from '@/lib/export-csv';
import { ListActions } from '@/components/admin/list-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AttendancePage() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const sessionsQuery = useQuery({ queryKey: ['attendance-sessions', page], queryFn: () => fetchSessions({ page }) });
  const summaryQuery = useQuery({
    queryKey: ['attendance-summary'],
    queryFn: () => fetchAttendanceSummary({ groupBy: 'month' }),
  });

  const visibleSessions = useMemo(() => {
    const items = sessionsQuery.data?.items ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((session) => {
      return (
        session.programmeType.name.toLowerCase().includes(q) ||
        (session.location ?? '').toLowerCase().includes(q) ||
        (session.name ?? '').toLowerCase().includes(q)
      );
    });
  }, [sessionsQuery.data, search]);

  const canCreate = hasPermission('attendance.create');

  const filterSessions = (items: SessionListItem[]) => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((session) => {
      return (
        session.programmeType.name.toLowerCase().includes(q) ||
        (session.location ?? '').toLowerCase().includes(q) ||
        (session.name ?? '').toLowerCase().includes(q)
      );
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const all: SessionListItem[] = [];
      let currentPage = 1;
      for (;;) {
        const res = await fetchSessions({ page: currentPage });
        all.push(...res.items);
        if (currentPage >= res.totalPages) break;
        currentPage += 1;
      }
      exportToCsv('attendance-sessions', filterSessions(all), [
        { header: 'Date', accessor: (s) => new Date(s.sessionDate).toLocaleDateString() },
        { header: 'Programme', accessor: (s) => s.programmeType.name },
        { header: 'Session Name', accessor: (s) => s.name ?? '' },
        { header: 'Location', accessor: (s) => s.location ?? '' },
        {
          header: 'Recorded By',
          accessor: (s) => (s.recordedByUser ? `${s.recordedByUser.firstName} ${s.recordedByUser.lastName}` : ''),
        },
        { header: 'Records', accessor: (s) => s._count.records },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">Worship, Bible study and programme attendance records</p>
        </div>
        {canCreate && (
          <Button asChild className="print:hidden">
            <Link href="/admin/attendance/new">
              <Plus className="h-4 w-4" />
              Take attendance
            </Link>
          </Button>
        )}
      </div>

      {summaryQuery.data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total attendance (last 90 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summaryQuery.data.totals.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average per session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summaryQuery.data.averageAttendance}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Highest attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summaryQuery.data.highestAttendance}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Visitors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summaryQuery.data.totals.visitors}</p>
              <p className="text-xs text-muted-foreground">
                {summaryQuery.data.totals.returningVisitors} returning
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">
            {sessionsQuery.data
              ? `${sessionsQuery.data.total} session${sessionsQuery.data.total === 1 ? '' : 's'}`
              : 'Sessions'}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs print:hidden">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by programme or location…"
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
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading sessions…
            </div>
          ) : visibleSessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'No sessions match your search.' : 'No attendance sessions recorded yet.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Recorded</TableHead>
                  <TableHead className="text-right">Records</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <Link href={`/admin/attendance/${session.id}`} className="font-medium hover:underline">
                        {new Date(session.sessionDate).toLocaleDateString()}
                      </Link>
                      {session.name && <p className="text-xs text-muted-foreground">{session.name}</p>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{session.programmeType.name}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{session.location ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {session.recordedByUser ? `${session.recordedByUser.firstName} ${session.recordedByUser.lastName}` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">
                        <Users className="mr-1 h-3 w-3" />
                        {session._count.records}
                      </Badge>
                    </TableCell>
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
