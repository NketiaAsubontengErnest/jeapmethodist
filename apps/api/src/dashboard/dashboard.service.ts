import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const [
      totalMembers,
      activeMembers,
      membersByGender,
      membersByCategory,
      membersByMarital,
      monthlyIncomeRes,
      monthlyExpenseRes,
      allTransactions,
      attendanceThisMonth,
      attendanceByProgramme,
      totalVisitors,
      visitorsByStatus,
      totalMedia,
      mediaByType,
      totalAlbums,
      upcomingEvents,
      recentAuditLogs,
      recentSermons,
      totalMinistries,
    ] = await Promise.all([
      // Member counts
      this.prisma.member.count(),
      this.prisma.member.count({ where: { isActive: true } }),
      this.prisma.member.groupBy({
        by: ['gender'],
        _count: { id: true },
      }),
      this.prisma.member.groupBy({
        by: ['memberCategoryId'],
        _count: { id: true },
      }),
      this.prisma.member.groupBy({
        by: ['maritalStatus'],
        _count: { id: true },
      }),

      // Financial totals for current month
      this.prisma.financialTransaction.aggregate({
        where: {
          type: 'INCOME',
          approvalStatus: 'APPROVED',
          date: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.financialTransaction.aggregate({
        where: {
          type: 'EXPENSE',
          approvalStatus: 'APPROVED',
          date: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),

      // Financial transactions over last 12 months
      this.prisma.financialTransaction.findMany({
        where: {
          approvalStatus: 'APPROVED',
          date: { gte: twelveMonthsAgo },
        },
        select: {
          type: true,
          amount: true,
          date: true,
          incomeCategory: { select: { name: true } },
          expenseCategory: { select: { name: true } },
        },
      }),

      // Attendance
      this.prisma.attendanceRecord.count({
        where: {
          session: { sessionDate: { gte: startOfMonth } },
          status: 'PRESENT',
        },
      }),
      this.prisma.attendanceRecord.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Visitors
      this.prisma.visitor.count(),
      this.prisma.visitor.groupBy({
        by: ['followUpStatus'],
        _count: { id: true },
      }),

      // Media (excluding identity logo and favicon)
      this.prisma.media.count({
        where: {
          NOT: [
            { category: 'identity' },
            { title: { in: ['logo_url', 'favicon_url'] } },
          ],
        },
      }),
      this.prisma.media.groupBy({
        by: ['type'],
        where: {
          NOT: [
            { category: 'identity' },
            { title: { in: ['logo_url', 'favicon_url'] } },
          ],
        },
        _count: { id: true },
      }),
      this.prisma.album.count(),
      this.prisma.event.findMany({
        orderBy: { startDate: 'asc' },
        take: 4,
        select: { id: true, title: true, slug: true, startDate: true, location: true },
      }),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
      this.prisma.sermon.findMany({
        orderBy: { date: 'desc' },
        take: 3,
        select: { id: true, title: true, slug: true, speaker: true, date: true },
      }),
      this.prisma.ministry.count(),
    ]);

    // Lookup Category names for member categories
    const categoryIds = membersByCategory.map((c) => c.memberCategoryId);
    const categoryRecords = await this.prisma.memberCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = new Map(categoryRecords.map((c) => [c.id, c.name]));

    // Format Member Demographics
    const memberGenderChart = membersByGender.map((g) => ({
      name: g.gender === 'MALE' ? 'Male' : 'Female',
      value: g._count.id,
    }));

    const memberCategoryChart = membersByCategory.map((c) => ({
      name: categoryMap.get(c.memberCategoryId) || 'General',
      value: c._count.id,
    }));

    const memberMaritalChart = membersByMarital
      .filter((m) => m.maritalStatus !== null)
      .map((m) => ({
        name: m.maritalStatus ? m.maritalStatus.charAt(0) + m.maritalStatus.slice(1).toLowerCase() : 'Unknown',
        value: m._count.id,
      }));

    // Process 12-Month Financial Monthly Trend & Category Summaries
    const monthMap = new Map<string, { income: number; expense: number }>();
    const incomeCatMap = new Map<string, number>();
    const expenseCatMap = new Map<string, number>();

    // Pre-populate 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      monthMap.set(key, { income: 0, expense: 0 });
    }

    allTransactions.forEach((t) => {
      const amt = Number(t.amount);
      const key = new Date(t.date).toLocaleString('en-US', { month: 'short', year: '2-digit' });
      const current = monthMap.get(key) || { income: 0, expense: 0 };

      if (t.type === 'INCOME') {
        current.income += amt;
        const catName = t.incomeCategory?.name || 'General Income';
        incomeCatMap.set(catName, (incomeCatMap.get(catName) || 0) + amt);
      } else {
        current.expense += amt;
        const catName = t.expenseCategory?.name || 'General Expense';
        expenseCatMap.set(catName, (expenseCatMap.get(catName) || 0) + amt);
      }
      monthMap.set(key, current);
    });

    const monthlyFinancialTrend = Array.from(monthMap.entries()).map(([period, data]) => ({
      period,
      income: Math.round(data.income),
      expense: Math.round(data.expense),
    }));

    const incomeCategoryChart = Array.from(incomeCatMap.entries()).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));

    const expenseCategoryChart = Array.from(expenseCatMap.entries()).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));

    // Format Visitors by status
    const visitorStatusChart = visitorsByStatus.map((v) => ({
      name: v.followUpStatus.replace(/_/g, ' '),
      value: v._count.id,
    }));

    // Format Media breakdown by type
    const mediaTypeChart = mediaByType.map((m) => ({
      name: m.type === 'PHOTO' ? 'Photos' : m.type === 'VIDEO' ? 'Videos' : 'Live Videos',
      value: m._count.id,
    }));

    return {
      overview: {
        totalMembers,
        activeMembers,
        monthlyIncome: Number(monthlyIncomeRes._sum.amount || 0),
        monthlyExpense: Number(monthlyExpenseRes._sum.amount || 0),
        attendanceThisMonth,
        totalVisitors,
        totalMedia,
        totalAlbums,
        totalMinistries,
      },
      charts: {
        memberGender: memberGenderChart,
        memberCategories: memberCategoryChart,
        memberMarital: memberMaritalChart,
        monthlyFinancialTrend,
        incomeCategories: incomeCategoryChart,
        expenseCategories: expenseCategoryChart,
        visitorStatus: visitorStatusChart,
        mediaTypes: mediaTypeChart,
      },
      upcomingEvents,
      recentAuditLogs,
      recentSermons,
    };
  }
}
