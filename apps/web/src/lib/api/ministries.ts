import { apiClient } from '../api-client';

export interface MinistryListItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  meetingSchedule?: string;
  meetingVenue?: string;
  contactPhone?: string;
  contactEmail?: string;
  isActive: boolean;
  leaderMember?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
  };
  assistantLeaderMember?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
  };
  _count?: {
    members: number;
  };
}

export interface MinistryDetail extends MinistryListItem {
  members: Array<{
    id: string;
    roleInMinistry: string;
    joinedAt: string;
    member: {
      id: string;
      firstName: string;
      lastName: string;
      membershipNumber: string;
      phone?: string;
      email?: string;
      gender?: string;
    };
  }>;
}

export async function fetchMinistries(): Promise<MinistryListItem[]> {
  return apiClient.get<MinistryListItem[]>('/ministries');
}

export async function fetchMinistry(id: string): Promise<MinistryDetail> {
  return apiClient.get<MinistryDetail>(`/ministries/${id}`);
}

export async function createMinistry(data: {
  name: string;
  description?: string;
  meetingSchedule?: string;
  meetingVenue?: string;
  contactPhone?: string;
  contactEmail?: string;
  leaderMemberId?: string;
  assistantLeaderMemberId?: string;
}): Promise<MinistryListItem> {
  return apiClient.post<MinistryListItem>('/ministries', data);
}

export async function updateMinistry(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    meetingSchedule: string;
    meetingVenue: string;
    contactPhone: string;
    contactEmail: string;
    leaderMemberId: string;
    assistantLeaderMemberId: string;
    isActive: boolean;
  }>,
): Promise<MinistryListItem> {
  return apiClient.patch<MinistryListItem>(`/ministries/${id}`, data);
}

export async function deleteMinistry(id: string) {
  return apiClient.delete<{ message: string }>(`/ministries/${id}`);
}

export async function addMinistryMember(
  ministryId: string,
  data: { memberId: string; roleInMinistry?: string },
) {
  return apiClient.post(`/ministries/${ministryId}/members`, data);
}

export async function removeMinistryMember(ministryId: string, memberId: string) {
  return apiClient.delete(`/ministries/${ministryId}/members/${memberId}`);
}

