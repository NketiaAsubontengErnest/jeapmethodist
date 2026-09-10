import { apiFetch } from '@/lib/api-client';

export interface UserListItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  role: { id: string; name: string };
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleId: string;
}

export function fetchUsers(params: { page?: number; search?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.search) query.set('search', params.search);
  return apiFetch<PaginatedResult<UserListItem>>(`/users?${query.toString()}`);
}

export function createUser(input: CreateUserInput) {
  return apiFetch<UserListItem>('/users', { method: 'POST', body: JSON.stringify(input) });
}

export function deactivateUser(id: string) {
  return apiFetch<UserListItem>(`/users/${id}`, { method: 'DELETE' });
}

export interface RoleOption {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
}

export function fetchRoles() {
  return apiFetch<RoleOption[]>('/roles');
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export function updateUserProfile(data: UpdateProfileInput) {
  return apiFetch<UserListItem>('/users/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function changeUserPassword(data: { currentPassword: string; newPassword: string }) {
  return apiFetch<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
