import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics(timeRange: string = '12m') {
    const now = new Date();
    let fromDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    if (timeRange === '30d') {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeRange === '90d') {
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (timeRange === 'ytd') {
      fromDate = new Date(now.getFullYear(), 0, 1);
    }

    const [
      transactions,
      attendanceSessions,
      memberCategories,
      membersByGender,
      membersByStatus,
      visitorsByStatus,
      mediaCountByType,
    ] = await Promise.all([
      this.prisma.financialTransaction.findMany({
        where: {
          approvalStatus: 'APPROVED',
          date: { gte: fromDate },
        },
        include: {
          incomeCategory: true,
          expenseCategory: true,
        },
      }),

      this.prisma.attendanceSession.findMany({
        where: { sessionDate: { gte: fromDate } },
        include: {
          programmeType: true,
          records: { select: { status: true } },
        },
      }),

      this.prisma.memberCategory.findMany({
        include: { _count: { select: { members: true } } },
      }),

      this.prisma.member.groupBy({
        by: ['gender'],
        _count: { id: true },
      }),

      this.prisma.membershipStatus.findMany({
        include: { _count: { select: { members: true } } },
      }),

      this.prisma.visitor.groupBy({
        by: ['followUpStatus'],
        _count: { id: true },
      }),

      this.prisma.media.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
    ]);

    // Calculate totals
    let totalIncome = 0;
    let totalExpense = 0;
    const incomeCategoryTotals = new Map<string, number>();
    const expenseCategoryTotals = new Map<string, number>();

    transactions.forEach((t) => {
      const amt = Number(t.amount);
      if (t.type === 'INCOME') {
        totalIncome += amt;
        const name = t.incomeCategory?.name || 'Uncategorized';
        incomeCategoryTotals.set(name, (incomeCategoryTotals.get(name) || 0) + amt);
      } else {
        totalExpense += amt;
        const name = t.expenseCategory?.name || 'Uncategorized';
        expenseCategoryTotals.set(name, (expenseCategoryTotals.get(name) || 0) + amt);
      }
    });

    // Attendance by Programme Type
    const attendanceByType = new Map<string, number>();
    let totalAttendanceRecords = 0;
    attendanceSessions.forEach((s) => {
      const typeName = s.programmeType?.name || 'General Service';
      const presentCount = s.records.filter((r) => r.status === 'PRESENT' || r.status === 'VISITOR').length;
      attendanceByType.set(typeName, (attendanceByType.get(typeName) || 0) + presentCount);
      totalAttendanceRecords += presentCount;
    });

    return {
      finance: {
        totalIncome: Math.round(totalIncome),
        totalExpense: Math.round(totalExpense),
        netBalance: Math.round(totalIncome - totalExpense),
        incomeByCategories: Array.from(incomeCategoryTotals.entries()).map(([name, value]) => ({
          name,
          value: Math.round(value),
        })),
        expenseByCategories: Array.from(expenseCategoryTotals.entries()).map(([name, value]) => ({
          name,
          value: Math.round(value),
        })),
      },
      attendance: {
        totalRecords: totalAttendanceRecords,
        totalSessions: attendanceSessions.length,
        byProgrammeType: Array.from(attendanceByType.entries()).map(([name, value]) => ({
          name,
          value,
        })),
      },
      demographics: {
        byGender: membersByGender.map((g) => ({
          name: g.gender === 'MALE' ? 'Male' : 'Female',
          value: g._count.id,
        })),
        byCategory: memberCategories.map((c) => ({
          name: c.name,
          value: c._count.members,
        })),
        byStatus: membersByStatus.map((s) => ({
          name: s.name,
          value: s._count.members,
        })),
      },
      visitors: {
        byStatus: visitorsByStatus.map((v) => ({
          name: v.followUpStatus.replace(/_/g, ' '),
          value: v._count.id,
        })),
      },
      media: {
        byType: mediaCountByType.map((m) => ({
          name: m.type === 'PHOTO' ? 'Photos' : m.type === 'VIDEO' ? 'Videos' : 'Live Videos',
          value: m._count.id,
        })),
      },
    };
  }
}
