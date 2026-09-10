import { apiFetch } from '@/lib/api-client';
import type { PaginatedResult } from './users';

export type FamilyRole = 'HEAD' | 'SPOUSE' | 'CHILD' | 'DEPENDANT' | 'OTHER';

export interface FamilyListItem {
  id: string;
  name: string;
  familyPhone: string | null;
  familyAddress: string | null;
  _count: { members: number };
}

export interface FamilyMemberEntry {
  role: FamilyRole;
  member: { id: string; firstName: string; lastName: string; phone: string | null };
}

export interface FamilyDetail {
  id: string;
  name: string;
  familyPhone: string | null;
  familyAddress: string | null;
  notes: string | null;
  members: FamilyMemberEntry[];
}

export function fetchFamilies(params: { page?: number; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.search) query.set('search', params.search);
  return apiFetch<PaginatedResult<FamilyListItem>>(`/families?${query.toString()}`);
}

export function fetchFamily(id: string) {
  return apiFetch<FamilyDetail>(`/families/${id}`);
}

export function createFamily(input: { name: string; familyPhone?: string; familyAddress?: string }) {
  return apiFetch<FamilyDetail>('/families', { method: 'POST', body: JSON.stringify(input) });
}

export function addFamilyMember(familyId: string, input: { memberId: string; role: FamilyRole }) {
  return apiFetch<FamilyDetail>(`/families/${familyId}/members`, { method: 'POST', body: JSON.stringify(input) });
}

export function removeFamilyMember(familyId: string, memberId: string) {
  return apiFetch<FamilyDetail>(`/families/${familyId}/members/${memberId}`, { method: 'DELETE' });
}
