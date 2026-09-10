import { apiFetch } from '@/lib/api-client';

export interface PermissionItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
}

export interface RoleItem {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissions: string[];
}

export function fetchRoles() {
  return apiFetch<RoleItem[]>('/roles');
}

export function fetchPermissions() {
  return apiFetch<PermissionItem[]>('/roles/permissions');
}

export function createRole(data: {
  name: string;
  description?: string;
  permissionCodes: string[];
}) {
  return apiFetch<RoleItem>('/roles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateRole(
  id: string,
  data: {
    name?: string;
    description?: string;
    permissionCodes?: string[];
  },
) {
  return apiFetch<RoleItem>(`/roles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteRole(id: string) {
  return apiFetch<{ message: string }>(`/roles/${id}`, { method: 'DELETE' });
}
