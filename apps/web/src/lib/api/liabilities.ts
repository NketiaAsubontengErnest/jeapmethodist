import { apiFetch } from '@/lib/api-client';

export interface Liability {
  id: string;
  name: string;
  category: string | null;
  amount: string;
  incurredDate: string;
  dueDate: string | null;
  isSettled: boolean;
  settledDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LiabilityInput {
  name: string;
  category?: string;
  amount: number;
  incurredDate?: string;
  dueDate?: string;
  isSettled?: boolean;
  notes?: string;
}

export function fetchLiabilities(params: { isSettled?: boolean } = {}) {
  const query = new URLSearchParams();
  if (params.isSettled !== undefined) query.set('isSettled', String(params.isSettled));
  return apiFetch<Liability[]>(`/liabilities?${query.toString()}`);
}

export function createLiability(input: LiabilityInput) {
  return apiFetch<Liability>('/liabilities', { method: 'POST', body: JSON.stringify(input) });
}

export function updateLiability(id: string, input: Partial<LiabilityInput>) {
  return apiFetch<Liability>(`/liabilities/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteLiability(id: string) {
  return apiFetch<{ message: string }>(`/liabilities/${id}`, { method: 'DELETE' });
}
