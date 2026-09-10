import { apiFetch } from '@/lib/api-client';

export type FundType = 'GENERAL' | 'RESTRICTED';

export interface Fund {
  id: string;
  name: string;
  type: FundType;
  description: string | null;
  isActive: boolean;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface FundInput {
  name: string;
  type?: FundType;
  description?: string;
  isActive?: boolean;
}

export function fetchFunds() {
  return apiFetch<Fund[]>('/funds');
}

export function createFund(input: FundInput) {
  return apiFetch<Fund>('/funds', { method: 'POST', body: JSON.stringify(input) });
}

export function updateFund(id: string, input: Partial<FundInput>) {
  return apiFetch<Fund>(`/funds/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteFund(id: string) {
  return apiFetch<{ message: string }>(`/funds/${id}`, { method: 'DELETE' });
}
