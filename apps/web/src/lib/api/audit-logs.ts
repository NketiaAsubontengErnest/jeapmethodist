import { apiFetch } from '@/lib/api-client';
import type { PaginatedResult } from './users';

export interface AuditLogItem {
  id: string;
  action: string;
  module: string;
  entityType: string | null;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
}

export function fetchAuditLogs(params: { page?: number; module?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.module) query.set('module', params.module);
  return apiFetch<PaginatedResult<AuditLogItem>>(`/audit-logs?${query.toString()}`);
}
