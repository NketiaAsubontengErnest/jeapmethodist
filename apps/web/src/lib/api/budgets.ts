import { apiFetch } from '@/lib/api-client';

export interface Budget {
  id: string;
  year: number;
  fund: { id: string; name: string } | null;
  incomeCategory: { id: string; name: string } | null;
  expenseCategory: { id: string; name: string } | null;
  amount: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetInput {
  year: number;
  fundId?: string;
  incomeCategoryId?: string;
  expenseCategoryId?: string;
  amount: number;
  notes?: string;
}

export interface BudgetVsActualRow {
  id: string;
  year: number;
  fund: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
  categoryType: 'INCOME' | 'EXPENSE';
  budgeted: number;
  actual: number;
  variance: number;
}

export function fetchBudgets(params: { year?: number } = {}) {
  const query = new URLSearchParams();
  if (params.year) query.set('year', String(params.year));
  return apiFetch<Budget[]>(`/budgets?${query.toString()}`);
}

export function fetchBudgetVsActual(year: number) {
  return apiFetch<BudgetVsActualRow[]>(`/budgets/vs-actual?year=${year}`);
}

export function createBudget(input: BudgetInput) {
  return apiFetch<Budget>('/budgets', { method: 'POST', body: JSON.stringify(input) });
}

export function updateBudget(id: string, input: Partial<BudgetInput>) {
  return apiFetch<Budget>(`/budgets/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
}

export function deleteBudget(id: string) {
  return apiFetch<{ message: string }>(`/budgets/${id}`, { method: 'DELETE' });
}
