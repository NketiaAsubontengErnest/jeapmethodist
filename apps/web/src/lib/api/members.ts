import { apiFetch } from '@/lib/api-client';
import type { PaginatedResult } from './users';

export type Gender = 'MALE' | 'FEMALE';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED';

export interface LookupOption {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface GroupMembershipInfo {
  id: string;
  roleInGroup: string;
  group: {
    id: string;
    name: string;
    slug?: string;
  };
}

export interface MinistryMembershipInfo {
  id: string;
  roleInMinistry: string;
  ministry: {
    id: string;
    name: string;
    slug?: string;
  };
}

export interface MemberListItem {
  id: string;
  membershipNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: Gender;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  membershipStatus: LookupOption;
  memberCategory: LookupOption;
  groupMemberships?: GroupMembershipInfo[];
  ministryMemberships?: MinistryMembershipInfo[];
}

export interface MemberDetail extends MemberListItem {
  whatsappNumber: string | null;
  dateOfBirth: string | null;
  residentialAddress: string | null;
  digitalAddress: string | null;
  ghanaRegion: string | null;
  ghanaDistrict: string | null;
  occupation: string | null;
  maritalStatus: MaritalStatus | null;
  marriageDate: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;
  dateJoinedChurch: string | null;
  baptized: boolean;
  baptismDate: string | null;
  confirmed: boolean;
  confirmationDate: string | null;
  localSociety: string | null;
  skills: string | null;
  notes: string | null;
  createdAt: string;
  groupMemberships: GroupMembershipInfo[];
  ministryMemberships: MinistryMembershipInfo[];
  familyMemberships: Array<{
    role: string;
    family: {
      id: string;
      name: string;
      members: Array<{ role: string; member: { id: string; firstName: string; lastName: string } }>;
    };
  }>;
}

export interface CreateMemberInput {
  firstName: string;
  lastName: string;
  gender: Gender;
  phone?: string;
  email?: string;
  membershipStatusId: string;
  memberCategoryId: string;
  residentialAddress?: string;
  ghanaRegion?: string;
  occupation?: string;
  dateOfBirth?: string;
  dateJoinedChurch?: string;
  groupIds?: string[];
  ministryIds?: string[];
}

export function fetchMembers(params: { page?: number; pageSize?: number; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  if (params.search) query.set('search', params.search);
  return apiFetch<PaginatedResult<MemberListItem>>(`/members?${query.toString()}`);
}

export function fetchMember(id: string) {
  return apiFetch<MemberDetail>(`/members/${id}`);
}

export function createMember(input: CreateMemberInput) {
  return apiFetch<MemberDetail>('/members', { method: 'POST', body: JSON.stringify(input) });
}

export function updateMember(id: string, input: Partial<CreateMemberInput>) {
  return apiFetch<MemberDetail>(`/members/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function deactivateMember(id: string) {
  return apiFetch<MemberDetail>(`/members/${id}`, { method: 'DELETE' });
}

export function fetchMemberCategories() {
  return apiFetch<LookupOption[]>('/member-categories');
}

export function fetchMembershipStatuses() {
  return apiFetch<LookupOption[]>('/membership-statuses');
}

export interface UpcomingBirthdayWeek {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  profilePhotoUrl: string | null;
  birthday: string;
  daysUntil: number;
  turningAge: number;
}

export interface UpcomingBirthdayMonth {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  profilePhotoUrl: string | null;
  birthday: string;
  day: number;
  turningAge: number;
  isPast: boolean;
}

export function fetchUpcomingBirthdays() {
  return apiFetch<{ thisWeek: UpcomingBirthdayWeek[]; thisMonth: UpcomingBirthdayMonth[] }>('/members/birthdays');
}
