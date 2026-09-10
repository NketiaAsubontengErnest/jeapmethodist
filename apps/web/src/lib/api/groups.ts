import { apiClient } from '../api-client';

export interface GroupListItem {
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

export interface GroupDetail extends GroupListItem {
  members: Array<{
    id: string;
    roleInGroup: string;
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

export async function fetchGroups(): Promise<GroupListItem[]> {
  return apiClient.get<GroupListItem[]>('/groups');
}

export async function fetchGroup(id: string): Promise<GroupDetail> {
  return apiClient.get<GroupDetail>(`/groups/${id}`);
}

export async function createGroup(data: {
  name: string;
  description?: string;
  meetingSchedule?: string;
  meetingVenue?: string;
  contactPhone?: string;
  contactEmail?: string;
  leaderMemberId?: string;
  assistantLeaderMemberId?: string;
}): Promise<GroupListItem> {
  return apiClient.post<GroupListItem>('/groups', data);
}

export async function updateGroup(
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
): Promise<GroupListItem> {
  return apiClient.patch<GroupListItem>(`/groups/${id}`, data);
}

export async function addGroupMember(
  groupId: string,
  data: { memberId: string; roleInGroup?: string },
) {
  return apiClient.post(`/groups/${groupId}/members`, data);
}

export async function removeGroupMember(groupId: string, memberId: string) {
  return apiClient.delete(`/groups/${groupId}/members/${memberId}`);
}

export async function deleteGroup(id: string): Promise<void> {
  return apiClient.delete<void>(`/groups/${id}`);
}

