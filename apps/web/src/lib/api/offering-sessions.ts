import { apiFetch } from '@/lib/api-client';
import type { PaginatedResult } from './users';

export interface OfferingSessionListItem {
  id: string;
  sessionDate: string;
  notes: string | null;
  programmeType: { id: string; name: string };
  recordedByUser: { id: string; firstName: string; lastName: string } | null;
  total: number;
}

export interface OfferingLine {
  id: string;
  amount: string;
  notes: string | null;
  incomeCategory: { id: string; name: string };
}

export interface OfferingSessionDetail extends Omit<OfferingSessionListItem, 'total'> {
  transactions: OfferingLine[];
}

export interface CreateOfferingSessionInput {
  programmeTypeId: string;
  sessionDate: string;
  notes?: string;
}

export interface AddOfferingLineInput {
  incomeCategoryId: string;
  amount: number;
  notes?: string;
}

export function fetchOfferingSessions(params: { page?: number } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  return apiFetch<PaginatedResult<OfferingSessionListItem>>(`/offering-sessions?${query.toString()}`);
}

export function fetchOfferingSession(id: string) {
  return apiFetch<OfferingSessionDetail>(`/offering-sessions/${id}`);
}

export function createOfferingSession(input: CreateOfferingSessionInput) {
  return apiFetch<OfferingSessionDetail>('/offering-sessions', { method: 'POST', body: JSON.stringify(input) });
}

export function addOfferingLine(sessionId: string, input: AddOfferingLineInput) {
  return apiFetch<OfferingSessionDetail>(`/offering-sessions/${sessionId}/lines`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function removeOfferingLine(sessionId: string, transactionId: string) {
  return apiFetch<OfferingSessionDetail>(`/offering-sessions/${sessionId}/lines/${transactionId}`, {
    method: 'DELETE',
  });
}
