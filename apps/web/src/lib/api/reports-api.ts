import { apiFetch } from '@/lib/api-client';

export interface ReportCategoryItem {
  name: string;
  value: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Recharts reads arbitrary dataKey props off these objects
  [key: string]: any;
}

export interface ReportsAnalytics {
  finance: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    incomeByCategories: ReportCategoryItem[];
    expenseByCategories: ReportCategoryItem[];
  };
  attendance: {
    totalRecords: number;
    totalSessions: number;
    byProgrammeType: ReportCategoryItem[];
  };
  demographics: {
    byGender: ReportCategoryItem[];
    byCategory: ReportCategoryItem[];
    byStatus: ReportCategoryItem[];
  };
  visitors: {
    byStatus: ReportCategoryItem[];
  };
  media: {
    byType: ReportCategoryItem[];
  };
}

export function fetchReportsAnalytics(range: string = '12m') {
  return apiFetch<ReportsAnalytics>(`/reports/analytics?range=${range}`);
}
