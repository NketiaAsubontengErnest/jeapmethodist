import { apiFetch } from '@/lib/api-client';

export interface ChartItem {
  name: string;
  value: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Recharts reads arbitrary dataKey props off these objects
  [key: string]: any;
}

export interface MonthlyFinancialItem {
  period: string;
  income: number;
  expense: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Recharts reads arbitrary dataKey props off these objects
  [key: string]: any;
}

export interface DashboardEvent {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  location: string | null;
}

export interface DashboardAuditLog {
  id: string;
  action: string;
  module: string;
  createdAt: string;
  user: { firstName: string; lastName: string } | null;
}

export interface DashboardSermon {
  id: string;
  title: string;
  slug: string;
  speaker: string;
  date: string;
}

export interface DashboardStats {
  overview: {
    totalMembers: number;
    activeMembers: number;
    monthlyIncome: number;
    monthlyExpense: number;
    attendanceThisMonth: number;
    totalVisitors: number;
    totalMedia: number;
    totalAlbums: number;
    totalMinistries?: number;
  };
  charts: {
    memberGender: ChartItem[];
    memberCategories: ChartItem[];
    memberMarital: ChartItem[];
    monthlyFinancialTrend: MonthlyFinancialItem[];
    incomeCategories: ChartItem[];
    expenseCategories: ChartItem[];
    visitorStatus: ChartItem[];
    mediaTypes: ChartItem[];
  };
  upcomingEvents?: DashboardEvent[];
  recentAuditLogs?: DashboardAuditLog[];
  recentSermons?: DashboardSermon[];
}

export function fetchDashboardStats() {
  return apiFetch<DashboardStats>('/dashboard/stats');
}
