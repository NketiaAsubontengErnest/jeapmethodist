import { apiFetch } from '@/lib/api-client';
import type { PaginatedResult } from './users';
import type { LookupOption } from './members';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'VISITOR';

export interface SessionListItem {
  id: string;
  name: string | null;
  sessionDate: string;
  location: string | null;
  notes: string | null;
  programmeType: { id: string; name: string };
  recordedByUser: { id: string; firstName: string; lastName: string } | null;
  _count: { records: number };
}

export interface AttendanceRecordItem {
  id: string;
  status: AttendanceStatus;
  notes: string | null;
  recordedAt: string;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    membershipNumber: string;
    gender: 'MALE' | 'FEMALE';
    memberCategory: { name: string };
  } | null;
  visitor: { id: string; firstName: string; lastName: string } | null;
  visitorName: string | null;
}

export interface SessionDetail extends SessionListItem {
  records: AttendanceRecordItem[];
}

export interface CreateSessionInput {
  programmeTypeId: string;
  name?: string;
  sessionDate: string;
  location?: string;
  notes?: string;
}

export interface CreateRecordInput {
  status: AttendanceStatus;
  memberId?: string;
  visitorName?: string;
  notes?: string;
}

export interface AttendanceSummary {
  sessionCount: number;
  totals: {
    total: number;
    male: number;
    female: number;
    children: number;
    youth: number;
    visitors: number;
    returningVisitors: number;
  };
  averageAttendance: number;
  highestAttendance: number;
  lowestAttendance: number;
  trend: Array<{ period: string; total: number }>;
}

export function fetchProgrammeTypes() {
  return apiFetch<LookupOption[]>('/programme-types');
}

export function fetchSessions(params: { page?: number; programmeTypeId?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.programmeTypeId) query.set('programmeTypeId', params.programmeTypeId);
  return apiFetch<PaginatedResult<SessionListItem>>(`/attendance/sessions?${query.toString()}`);
}

export function fetchSession(id: string) {
  return apiFetch<SessionDetail>(`/attendance/sessions/${id}`);
}

export function createSession(input: CreateSessionInput) {
  return apiFetch<SessionListItem>('/attendance/sessions', { method: 'POST', body: JSON.stringify(input) });
}

export function addAttendanceRecord(sessionId: string, input: CreateRecordInput) {
  return apiFetch<SessionDetail>(`/attendance/sessions/${sessionId}/records`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function removeAttendanceRecord(sessionId: string, recordId: string) {
  return apiFetch<SessionDetail>(`/attendance/sessions/${sessionId}/records/${recordId}`, { method: 'DELETE' });
}

export function fetchAttendanceSummary(params: { from?: string; to?: string; groupBy?: string } = {}) {
  const query = new URLSearchParams();
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  if (params.groupBy) query.set('groupBy', params.groupBy);
  return apiFetch<AttendanceSummary>(`/attendance/summary?${query.toString()}`);
}
