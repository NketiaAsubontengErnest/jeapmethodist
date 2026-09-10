import { apiFetch, getAccessToken } from '@/lib/api-client';
import type { PaginatedResult } from './users';
import type { LookupOption } from './members';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export type TransactionType = 'INCOME' | 'EXPENSE';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TransactionListItem {
  id: string;
  type: TransactionType;
  date: string;
  amount: string;
  description: string | null;
  reference: string | null;
  approvalStatus: ApprovalStatus;
  incomeCategory: { id: string; name: string } | null;
  expenseCategory: { id: string; name: string } | null;
  financialAccount: { id: string; name: string } | null;
  offeringSession: { id: string; sessionDate: string; programmeType: { name: string } } | null;
  donorName: string | null;
  donorMemberId?: string | null;
  donorMember?: { id: string; firstName: string; lastName: string } | null;
  isAnonymous: boolean;
  recordedByUser: { id: string; firstName: string; lastName: string } | null;
  fund?: { id: string; name: string; type: string } | null;
  isReconciled: boolean;
  reconciledAt: string | null;
  reconciledByUser?: { id: string; firstName: string; lastName: string } | null;
}

export interface BalanceSheet {
  asOf: string;
  currency: string;
  assets: Array<{ id: string; name: string; accountType: string; balance: number }>;
  unallocatedCash: number;
  totalAssets: number;
  liabilities: Array<{ id: string; name: string; category: string | null; amount: number; dueDate: string | null }>;
  totalLiabilities: number;
  fundBalance: number;
}

export interface CreateTransactionInput {
  type: TransactionType;
  date: string;
  amount: number;
  description?: string;
  reference?: string;
  incomeCategoryId?: string;
  expenseCategoryId?: string;
  financialAccountId?: string;
  fundId?: string;
  donorName?: string;
  donorMemberId?: string;
  isAnonymous?: boolean;
  notes?: string;
}

export interface FinanceSummary {
  currency: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  incomeByCategory: Array<{ category: string; total: number }>;
  expenseByCategory: Array<{ category: string; total: number }>;
  monthlyTrend: Array<{ period: string; income: number; expense: number; net: number }>;
}

export interface AnnualSummaryRow {
  year: number;
  income: number;
  expense: number;
  net: number;
}

export function fetchIncomeCategories() {
  return apiFetch<LookupOption[]>('/income-categories');
}

export function fetchExpenseCategories() {
  return apiFetch<LookupOption[]>('/expense-categories');
}

export function fetchFinancialAccounts() {
  return apiFetch<Array<LookupOption & { accountType: string }>>('/financial-accounts');
}

export function fetchTransactions(
  params: {
    page?: number;
    pageSize?: number;
    type?: TransactionType;
    incomeCategoryId?: string;
    fundId?: string;
    financialAccountId?: string;
    isReconciled?: boolean;
  } = {},
) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  if (params.type) query.set('type', params.type);
  if (params.incomeCategoryId) query.set('incomeCategoryId', params.incomeCategoryId);
  if (params.fundId) query.set('fundId', params.fundId);
  if (params.financialAccountId) query.set('financialAccountId', params.financialAccountId);
  if (params.isReconciled !== undefined) query.set('isReconciled', String(params.isReconciled));
  return apiFetch<PaginatedResult<TransactionListItem>>(`/finance/transactions?${query.toString()}`);
}

export function createTransaction(input: CreateTransactionInput) {
  return apiFetch<TransactionListItem>('/finance/transactions', { method: 'POST', body: JSON.stringify(input) });
}

export function approveTransaction(id: string) {
  return apiFetch<TransactionListItem>(`/finance/transactions/${id}/approve`, { method: 'POST' });
}

export function rejectTransaction(id: string) {
  return apiFetch<TransactionListItem>(`/finance/transactions/${id}/reject`, { method: 'POST' });
}

export function deleteTransaction(id: string) {
  return apiFetch<{ message: string }>(`/finance/transactions/${id}`, { method: 'DELETE' });
}

export function fetchFinanceSummary(params: { from?: string; to?: string } = {}) {
  const query = new URLSearchParams();
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  return apiFetch<FinanceSummary>(`/finance/summary?${query.toString()}`);
}

export function fetchAnnualSummary() {
  return apiFetch<AnnualSummaryRow[]>('/finance/summary/annual');
}

export function fetchBalanceSheet(asOf?: string) {
  const query = new URLSearchParams();
  if (asOf) query.set('asOf', asOf);
  return apiFetch<BalanceSheet>(`/finance/balance-sheet?${query.toString()}`);
}

export function reconcileTransaction(id: string) {
  return apiFetch<TransactionListItem>(`/finance/transactions/${id}/reconcile`, { method: 'POST' });
}

export function unreconcileTransaction(id: string) {
  return apiFetch<TransactionListItem>(`/finance/transactions/${id}/unreconcile`, { method: 'POST' });
}

/** Downloads the CSV export directly in the browser (auth header attached manually since this isn't a JSON fetch). */
export async function downloadTransactionsCsv(params: { type?: TransactionType } = {}) {
  const query = new URLSearchParams();
  if (params.type) query.set('type', params.type);

  const response = await fetch(`${API_URL}/finance/transactions/export?${query.toString()}`, {
    credentials: 'include',
    headers: { Authorization: `Bearer ${getAccessToken() ?? ''}` },
  });
  if (!response.ok) {
    throw new Error('Failed to export transactions');
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'financial-transactions.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
