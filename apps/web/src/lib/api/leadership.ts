import { apiClient } from '../api-client';

export interface ChurchPosition {
  id: string;
  title: string;
  category: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ChurchLeadershipItem {
  id: string;
  positionId: string;
  position: ChurchPosition;
  memberId?: string;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    membershipNumber: string;
    phone?: string;
    email?: string;
    profilePhotoUrl?: string;
  };
  name?: string;
  photoUrl?: string;
  bio?: string;
  phone?: string;
  email?: string;
  displayOrder: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export async function fetchPositions(): Promise<ChurchPosition[]> {
  return apiClient.get<ChurchPosition[]>('/leadership/positions');
}

export async function createPosition(data: {
  title: string;
  category?: string;
  description?: string;
  displayOrder?: number;
}): Promise<ChurchPosition> {
  return apiClient.post<ChurchPosition>('/leadership/positions', data);
}

export async function updatePosition(
  id: string,
  data: Partial<{
    title: string;
    category: string;
    description: string;
    displayOrder: number;
    isActive: boolean;
  }>,
): Promise<ChurchPosition> {
  return apiClient.patch<ChurchPosition>(`/leadership/positions/${id}`, data);
}

export async function deletePosition(id: string): Promise<void> {
  return apiClient.delete<void>(`/leadership/positions/${id}`);
}


export async function fetchLeadership(): Promise<ChurchLeadershipItem[]> {
  return apiClient.get<ChurchLeadershipItem[]>('/leadership');
}

export async function createLeadership(data: {
  positionId: string;
  memberId?: string;
  name?: string;
  photoUrl?: string;
  bio?: string;
  phone?: string;
  email?: string;
  displayOrder?: number;
}): Promise<ChurchLeadershipItem> {
  return apiClient.post<ChurchLeadershipItem>('/leadership', data);
}

export async function updateLeadership(
  id: string,
  data: Partial<{
    positionId: string;
    memberId: string;
    name: string;
    photoUrl: string;
    bio: string;
    phone: string;
    email: string;
    displayOrder: number;
    isActive: boolean;
  }>,
): Promise<ChurchLeadershipItem> {
  return apiClient.patch<ChurchLeadershipItem>(`/leadership/${id}`, data);
}

export async function deleteLeadership(id: string) {
  return apiClient.delete(`/leadership/${id}`);
}
