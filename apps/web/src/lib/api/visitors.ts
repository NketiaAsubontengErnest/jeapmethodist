import { apiFetch } from '@/lib/api-client';
import type { PaginatedResult } from './users';
import type { Gender } from './members';

export type VisitorFollowUpStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'FOLLOW_UP_SCHEDULED'
  | 'INTERESTED'
  | 'JOINED'
  | 'NOT_INTERESTED'
  | 'COULD_NOT_REACH';

export const FOLLOW_UP_STATUS_LABELS: Record<VisitorFollowUpStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  FOLLOW_UP_SCHEDULED: 'Follow-up scheduled',
  INTERESTED: 'Interested',
  JOINED: 'Joined',
  NOT_INTERESTED: 'Not interested',
  COULD_NOT_REACH: 'Could not reach',
};

export interface VisitorListItem {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  dateVisited: string;
  followUpStatus: VisitorFollowUpStatus;
  interestedInJoining: boolean;
  assignedToUser: { id: string; firstName: string; lastName: string } | null;
}

export interface VisitorDetail extends VisitorListItem {
  whatsappNumber: string | null;
  gender: Gender | null;
  howHeard: string | null;
  programmeAttended: string | null;
  address: string | null;
  notes: string | null;
  convertedMemberId: string | null;
  followUps: Array<{
    id: string;
    status: VisitorFollowUpStatus;
    notes: string | null;
    contactedAt: string;
    user: { id: string; firstName: string; lastName: string } | null;
  }>;
}

export interface CreateVisitorInput {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  dateVisited: string;
  howHeard?: string;
  interestedInJoining?: boolean;
  notes?: string;
}

export function fetchVisitors(params: { page?: number; search?: string; followUpStatus?: VisitorFollowUpStatus } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.search) query.set('search', params.search);
  if (params.followUpStatus) query.set('followUpStatus', params.followUpStatus);
  return apiFetch<PaginatedResult<VisitorListItem>>(`/visitors?${query.toString()}`);
}

export function fetchVisitor(id: string) {
  return apiFetch<VisitorDetail>(`/visitors/${id}`);
}

export function createVisitor(input: CreateVisitorInput) {
  return apiFetch<VisitorDetail>('/visitors', { method: 'POST', body: JSON.stringify(input) });
}

export function addFollowUp(id: string, input: { status: VisitorFollowUpStatus; notes?: string }) {
  return apiFetch<VisitorDetail>(`/visitors/${id}/follow-ups`, { method: 'POST', body: JSON.stringify(input) });
}

export function updateVisitor(id: string, input: Partial<CreateVisitorInput>) {
  return apiFetch<VisitorDetail>(`/visitors/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteVisitor(id: string) {
  return apiFetch<{ message: string }>(`/visitors/${id}`, { method: 'DELETE' });
}

export function convertVisitor(
  id: string,
  input: { gender: Gender; membershipStatusId: string; memberCategoryId: string },
) {
  return apiFetch<VisitorDetail>(`/visitors/${id}/convert`, { method: 'POST', body: JSON.stringify(input) });
}

