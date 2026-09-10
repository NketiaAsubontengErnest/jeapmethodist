'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search } from 'lucide-react';
import { fetchAuditLogs, type AuditLogItem } from '@/lib/api/audit-logs';
import { exportToCsv } from '@/lib/export-csv';
import { ListActions } from '@/components/admin/list-actions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const logsQuery = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () => fetchAuditLogs({ page }),
  });

  const visibleLogs = useMemo(() => {
    const items = logsQuery.data?.items ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((log) => {
      const actor = log.user ? `${log.user.firstName} ${log.user.lastName}` : '';
      return (
        log.action.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q) ||
        actor.toLowerCase().includes(q)
      );
    });
  }, [logsQuery.data, search]);

  const filterLogs = (items: AuditLogItem[]) => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((log) => {
      const actor = log.user ? `${log.user.firstName} ${log.user.lastName}` : '';
      return (
        log.action.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q) ||
        actor.toLowerCase().includes(q)
      );
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const all: AuditLogItem[] = [];
      let currentPage = 1;
      for (;;) {
        const res = await fetchAuditLogs({ page: currentPage });
        all.push(...res.items);
        if (currentPage >= res.totalPages) break;
        currentPage += 1;
      }
      exportToCsv('audit-logs', filterLogs(all), [
        { header: 'Date/Time', accessor: (l) => new Date(l.createdAt).toLocaleString() },
        { header: 'Actor', accessor: (l) => (l.user ? `${l.user.firstName} ${l.user.lastName}` : 'System') },
        { header: 'Action', accessor: (l) => l.action },
        { header: 'Module', accessor: (l) => l.module },
        { header: 'Entity Type', accessor: (l) => l.entityType ?? '' },
        { header: 'Entity ID', accessor: (l) => l.entityId ?? '' },
        { header: 'IP Address', accessor: (l) => l.ipAddress ?? '' },
      ]);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">A record of sensitive actions taken across the system</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">
            {logsQuery.data ? `${logsQuery.data.total} event${logsQuery.data.total === 1 ? '' : 's'}` : 'Events'}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-xs print:hidden">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by action, module or actor…"
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
          {logsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading audit logs…
            </div>
          ) : logsQuery.isError ? (
            <p className="py-8 text-center text-sm text-destructive">Failed to load audit logs.</p>
          ) : visibleLogs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? 'No audit logs match your search.' : 'No activity recorded yet.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>IP address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : <em className="text-muted-foreground">System</em>}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.action}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.module}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.ipAddress ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {logsQuery.data && logsQuery.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2 print:hidden">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {logsQuery.data.page} of {logsQuery.data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= logsQuery.data.totalPages}
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
