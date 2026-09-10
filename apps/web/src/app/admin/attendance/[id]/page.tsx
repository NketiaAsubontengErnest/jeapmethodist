'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Search, UserMinus, UserPlus } from 'lucide-react';
import { fetchSession, addAttendanceRecord, removeAttendanceRecord, type AttendanceStatus } from '@/lib/api/attendance';
import { fetchMembers, type MemberListItem } from '@/lib/api/members';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { exportToCsv } from '@/lib/export-csv';
import { ListActions } from '@/components/admin/list-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  EXCUSED: 'Excused',
  VISITOR: 'Visitor',
};

function statusVariant(status: AttendanceStatus) {
  if (status === 'PRESENT') return 'success' as const;
  if (status === 'ABSENT') return 'destructive' as const;
  return 'secondary' as const;
}

export default function AttendanceSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('PRESENT');
  const [visitorName, setVisitorName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sessionQuery = useQuery({ queryKey: ['attendance-sessions', id], queryFn: () => fetchSession(id) });
  const memberSearchQuery = useQuery({
    queryKey: ['members', 'attendance-search', search],
    queryFn: () => fetchMembers({ search, pageSize: 8 }),
    enabled: search.length > 1,
  });

  const canEdit = hasPermission('attendance.create');

  const addMutation = useMutation({
    mutationFn: (input: { memberId?: string; visitorName?: string }) =>
      addAttendanceRecord(id, { status: input.memberId ? status : 'VISITOR', ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-sessions'] });
      setSearch('');
      setVisitorName('');
    },
    onError: (e) => {
      const message = e instanceof ApiError ? e.message : 'Failed to add record';
      setError(message);
      toast.error('Failed to check in', message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (recordId: string) => removeAttendanceRecord(id, recordId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance-sessions'] }),
    onError: (e) => toast.error('Failed to remove record', e instanceof ApiError ? e.message : undefined),
  });

  const addMember = (member: MemberListItem) => {
    setError(null);
    addMutation.mutate({ memberId: member.id });
  };

  const addVisitor = () => {
    setError(null);
    addMutation.mutate({ visitorName: visitorName || undefined });
  };

  if (sessionQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading session…
      </div>
    );
  }

  if (sessionQuery.isError || !sessionQuery.data) {
    return <p className="py-8 text-center text-sm text-destructive">Session not found.</p>;
  }

  const session = sessionQuery.data;
  const recordedMemberIds = new Set(session.records.map((r) => r.member?.id).filter(Boolean));

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2 print:hidden">
          <Link href="/admin/attendance">
            <ArrowLeft className="h-4 w-4" />
            Back to attendance
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {session.programmeType.name} — {new Date(session.sessionDate).toLocaleDateString()}
          </h1>
          <Badge variant="secondary">{session.records.length} recorded</Badge>
        </div>
        {session.location && <p className="text-muted-foreground">{session.location}</p>}
      </div>

      {canEdit && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="text-base">Check someone in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[240px] flex-1 space-y-2">
                <label className="text-sm font-medium">Search member by name, number or phone</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Start typing…" />
                </div>
              </div>
              <div className="w-40 space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={(v: string) => setStatus(v as AttendanceStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Present</SelectItem>
                    <SelectItem value="ABSENT">Absent</SelectItem>
                    <SelectItem value="EXCUSED">Excused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {search.length > 1 && (
              <div className="space-y-1 rounded-md border border-border p-2">
                {memberSearchQuery.isLoading ? (
                  <p className="p-2 text-sm text-muted-foreground">Searching…</p>
                ) : memberSearchQuery.data && memberSearchQuery.data.items.length === 0 ? (
                  <p className="p-2 text-sm text-muted-foreground">No members match.</p>
                ) : (
                  memberSearchQuery.data?.items.map((member) => {
                    const alreadyAdded = recordedMemberIds.has(member.id);
                    return (
                      <div key={member.id} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted">
                        <div>
                          <p className="text-sm font-medium">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{member.membershipNumber}</p>
                        </div>
                        <Button
                          size="sm"
                          variant={alreadyAdded ? 'ghost' : 'default'}
                          disabled={alreadyAdded || addMutation.isPending}
                          onClick={() => addMember(member)}
                        >
                          <UserPlus className="h-4 w-4" />
                          {alreadyAdded ? 'Added' : `Mark ${STATUS_LABELS[status]}`}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
              <div className="min-w-[240px] flex-1 space-y-2">
                <label className="text-sm font-medium">Visitor headcount (no member record needed)</label>
                <Input
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Name (optional) — leave blank for an anonymous count"
                />
              </div>
              <Button variant="outline" onClick={addVisitor} disabled={addMutation.isPending}>
                <UserPlus className="h-4 w-4" />
                Add visitor
              </Button>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Recorded ({session.records.length})</CardTitle>
          <ListActions
            onExport={() =>
              exportToCsv(`attendance-${session.programmeType.name}-${session.sessionDate.slice(0, 10)}`, session.records, [
                {
                  header: 'Name',
                  accessor: (r) =>
                    r.member
                      ? `${r.member.firstName} ${r.member.lastName}`
                      : r.visitor
                        ? `${r.visitor.firstName} ${r.visitor.lastName}`
                        : r.visitorName || 'Anonymous visitor',
                },
                { header: 'Membership No.', accessor: (r) => r.member?.membershipNumber ?? '' },
                { header: 'Status', accessor: (r) => STATUS_LABELS[r.status] },
                { header: 'Recorded At', accessor: (r) => new Date(r.recordedAt).toLocaleString() },
              ])
            }
          />
        </CardHeader>
        <CardContent>
          {session.records.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No one checked in yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recorded at</TableHead>
                  {canEdit && <TableHead className="text-right print:hidden">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {session.records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.member
                        ? `${record.member.firstName} ${record.member.lastName}`
                        : record.visitor
                          ? `${record.visitor.firstName} ${record.visitor.lastName}`
                          : record.visitorName || 'Anonymous visitor'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(record.status)}>{STATUS_LABELS[record.status]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(record.recordedAt).toLocaleTimeString()}
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right print:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMutation.mutate(record.id)}
                          disabled={removeMutation.isPending}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
