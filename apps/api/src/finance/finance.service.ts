import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApprovalStatus,
  FinancialTransactionType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

const transactionInclude = {
  incomeCategory: true,
  expenseCategory: true,
  financialAccount: true,
  fund: true,
  offeringSession: {
    select: {
      id: true,
      sessionDate: true,
      programmeType: { select: { name: true } },
    },
  },
  donorMember: { select: { id: true, firstName: true, lastName: true } },
  recordedByUser: { select: { id: true, firstName: true, lastName: true } },
  approvedByUser: { select: { id: true, firstName: true, lastName: true } },
  reconciledByUser: { select: { id: true, firstName: true, lastName: true } },
} as const;

export interface FindAllTransactionsParams {
  page: number;
  pageSize: number;
  type?: FinancialTransactionType;
  fromDate?: Date;
  toDate?: Date;
  incomeCategoryId?: string;
  expenseCategoryId?: string;
  fundId?: string;
  financialAccountId?: string;
  isReconciled?: boolean;
}

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  private validateCategory(dto: {
    type: FinancialTransactionType;
    incomeCategoryId?: string;
    expenseCategoryId?: string;
  }) {
    if (dto.type === FinancialTransactionType.INCOME && !dto.incomeCategoryId) {
      throw new BadRequestException(
        'incomeCategoryId is required for an INCOME transaction',
      );
    }
    if (
      dto.type === FinancialTransactionType.EXPENSE &&
      !dto.expenseCategoryId
    ) {
      throw new BadRequestException(
        'expenseCategoryId is required for an EXPENSE transaction',
      );
    }
  }

  async findAll(params: FindAllTransactionsParams) {
    const {
      page,
      pageSize,
      type,
      fromDate,
      toDate,
      incomeCategoryId,
      expenseCategoryId,
      fundId,
      financialAccountId,
      isReconciled,
    } = params;

    const where: Prisma.FinancialTransactionWhereInput = {
      ...(type ? { type } : {}),
      ...(incomeCategoryId ? { incomeCategoryId } : {}),
      ...(expenseCategoryId ? { expenseCategoryId } : {}),
      ...(fundId ? { fundId } : {}),
      ...(financialAccountId ? { financialAccountId } : {}),
      ...(isReconciled !== undefined ? { isReconciled } : {}),
      ...(fromDate || toDate
        ? {
            date: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.financialTransaction.findMany({
        where,
        include: transactionInclude,
        orderBy: { date: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.financialTransaction.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const transaction = await this.prisma.financialTransaction.findUnique({
      where: { id },
      include: transactionInclude,
    });
    if (!transaction) {
      throw new NotFoundException('Financial transaction not found');
    }
    return transaction;
  }

  create(dto: CreateTransactionDto, recordedByUserId: string) {
    this.validateCategory(dto);
    return this.prisma.financialTransaction.create({
      data: {
        ...dto,
        incomeCategoryId:
          dto.type === FinancialTransactionType.INCOME
            ? dto.incomeCategoryId
            : undefined,
        expenseCategoryId:
          dto.type === FinancialTransactionType.EXPENSE
            ? dto.expenseCategoryId
            : undefined,
        recordedByUserId,
      },
      include: transactionInclude,
    });
  }

  async update(id: string, dto: UpdateTransactionDto) {
    const existing = await this.findOne(id);
    const mergedType = dto.type ?? existing.type;
    if (dto.incomeCategoryId || dto.expenseCategoryId || dto.type) {
      this.validateCategory({
        type: mergedType,
        incomeCategoryId:
          dto.incomeCategoryId ?? existing.incomeCategoryId ?? undefined,
        expenseCategoryId:
          dto.expenseCategoryId ?? existing.expenseCategoryId ?? undefined,
      });
    }
    return this.prisma.financialTransaction.update({
      where: { id },
      data: dto,
      include: transactionInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.financialTransaction.delete({ where: { id } });
    return { message: 'Financial transaction deleted' };
  }

  async setApprovalStatus(
    id: string,
    status: ApprovalStatus,
    approvedByUserId: string,
  ) {
    await this.findOne(id);
    return this.prisma.financialTransaction.update({
      where: { id },
      data: {
        approvalStatus: status,
        approvedByUserId,
        approvedAt: status === ApprovalStatus.PENDING ? null : new Date(),
      },
      include: transactionInclude,
    });
  }

  async setReconciled(id: string, reconciled: boolean, userId: string) {
    await this.findOne(id);
    return this.prisma.financialTransaction.update({
      where: { id },
      data: {
        isReconciled: reconciled,
        reconciledAt: reconciled ? new Date() : null,
        reconciledByUserId: reconciled ? userId : null,
      },
      include: transactionInclude,
    });
  }

  /**
   * A lightweight Balance Sheet: Assets = the balance of every financial
   * account (income postings add, expense postings subtract, computed from
   * approved transactions up to `asOf`), Liabilities = outstanding (unsettled)
   * Liability records, Fund Balance = Assets - Liabilities. Not full
   * double-entry bookkeeping — appropriate for a single-church deployment
   * where FinancialAccount already represents "where the cash physically is."
   */
  async getBalanceSheet(asOf: Date) {
    const [accounts, transactions, liabilities] = await Promise.all([
      this.prisma.financialAccount.findMany({ where: { isActive: true } }),
      this.prisma.financialTransaction.findMany({
        where: {
          date: { lte: asOf },
          approvalStatus: ApprovalStatus.APPROVED,
        },
        select: { type: true, amount: true, financialAccountId: true },
      }),
      this.prisma.liability.findMany({ where: { isSettled: false } }),
    ]);

    const balanceByAccount = new Map<string, number>();
    let unallocatedCash = 0;
    for (const t of transactions) {
      const amount = Number(t.amount) * (t.type === FinancialTransactionType.INCOME ? 1 : -1);
      if (t.financialAccountId) {
        balanceByAccount.set(
          t.financialAccountId,
          (balanceByAccount.get(t.financialAccountId) ?? 0) + amount,
        );
      } else {
        unallocatedCash += amount;
      }
    }

    const assets = accounts.map((a) => ({
      id: a.id,
      name: a.name,
      accountType: a.accountType,
      balance: balanceByAccount.get(a.id) ?? 0,
    }));
    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0) + unallocatedCash;
    const totalLiabilities = liabilities.reduce((sum, l) => sum + Number(l.amount), 0);

    return {
      asOf: asOf.toISOString().slice(0, 10),
      currency: 'GHS',
      assets,
      unallocatedCash,
      totalAssets,
      liabilities: liabilities.map((l) => ({
        id: l.id,
        name: l.name,
        category: l.category,
        amount: Number(l.amount),
        dueDate: l.dueDate?.toISOString().slice(0, 10) ?? null,
      })),
      totalLiabilities,
      fundBalance: totalAssets - totalLiabilities,
    };
  }

  /** Combined income/expense/category/monthly-trend report over a date range. */
  async getSummary(params: { from: Date; to: Date }) {
    const { from, to } = params;

    const transactions = await this.prisma.financialTransaction.findMany({
      where: {
        date: { gte: from, lte: to },
        approvalStatus: ApprovalStatus.APPROVED,
      },
      include: {
        incomeCategory: { select: { name: true } },
        expenseCategory: { select: { name: true } },
      },
      orderBy: { date: 'asc' },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const incomeByCategory = new Map<string, number>();
    const expenseByCategory = new Map<string, number>();
    const monthlyTrend = new Map<string, { income: number; expense: number }>();

    for (const t of transactions) {
      const amount = Number(t.amount);
      const monthKey = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
      const bucket = monthlyTrend.get(monthKey) ?? { income: 0, expense: 0 };

      if (t.type === FinancialTransactionType.INCOME) {
        totalIncome += amount;
        const name = t.incomeCategory?.name ?? 'Uncategorized';
        incomeByCategory.set(name, (incomeByCategory.get(name) ?? 0) + amount);
        bucket.income += amount;
      } else {
        totalExpense += amount;
        const name = t.expenseCategory?.name ?? 'Uncategorized';
        expenseByCategory.set(
          name,
          (expenseByCategory.get(name) ?? 0) + amount,
        );
        bucket.expense += amount;
      }
      monthlyTrend.set(monthKey, bucket);
    }

    return {
      currency: 'GHS',
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      transactionCount: transactions.length,
      incomeByCategory: Array.from(incomeByCategory.entries()).map(
        ([category, total]) => ({ category, total }),
      ),
      expenseByCategory: Array.from(expenseByCategory.entries()).map(
        ([category, total]) => ({ category, total }),
      ),
      monthlyTrend: Array.from(monthlyTrend.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, { income, expense }]) => ({
          period,
          income,
          expense,
          net: income - expense,
        })),
    };
  }

  /** Year-over-year income/expense totals — "annual summary" (section 30). */
  async getAnnualSummary() {
    const transactions = await this.prisma.financialTransaction.findMany({
      where: { approvalStatus: ApprovalStatus.APPROVED },
      select: { type: true, amount: true, date: true },
    });

    const byYear = new Map<number, { income: number; expense: number }>();
    for (const t of transactions) {
      const year = t.date.getFullYear();
      const bucket = byYear.get(year) ?? { income: 0, expense: 0 };
      if (t.type === FinancialTransactionType.INCOME)
        bucket.income += Number(t.amount);
      else bucket.expense += Number(t.amount);
      byYear.set(year, bucket);
    }

    return Array.from(byYear.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, { income, expense }]) => ({
        year,
        income,
        expense,
        net: income - expense,
      }));
  }

  async exportCsv(params: {
    type?: FinancialTransactionType;
    fromDate?: Date;
    toDate?: Date;
  }) {
    const where: Prisma.FinancialTransactionWhereInput = {
      ...(params.type ? { type: params.type } : {}),
      ...(params.fromDate || params.toDate
        ? {
            date: {
              ...(params.fromDate ? { gte: params.fromDate } : {}),
              ...(params.toDate ? { lte: params.toDate } : {}),
            },
          }
        : {}),
    };

    const transactions = await this.prisma.financialTransaction.findMany({
      where,
      include: {
        incomeCategory: true,
        expenseCategory: true,
        recordedByUser: true,
      },
      orderBy: { date: 'asc' },
    });

    const header = [
      'Date',
      'Type',
      'Category',
      'Amount (GHS)',
      'Description',
      'Reference',
      'Status',
      'Recorded By',
    ];
    const rows = transactions.map((t) => [
      t.date.toISOString().slice(0, 10),
      t.type,
      t.incomeCategory?.name ?? t.expenseCategory?.name ?? '',
      Number(t.amount).toFixed(2),
      t.description ?? '',
      t.reference ?? '',
      t.approvalStatus,
      t.recordedByUser
        ? `${t.recordedByUser.firstName} ${t.recordedByUser.lastName}`
        : '',
    ]);

    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    return [header, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  }
}
