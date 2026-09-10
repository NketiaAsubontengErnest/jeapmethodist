import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FinancialTransactionType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

const budgetInclude = {
  fund: { select: { id: true, name: true } },
  incomeCategory: { select: { id: true, name: true } },
  expenseCategory: { select: { id: true, name: true } },
} as const;

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  private validate(dto: { incomeCategoryId?: string; expenseCategoryId?: string }) {
    if (!dto.incomeCategoryId && !dto.expenseCategoryId) {
      throw new BadRequestException('Set either incomeCategoryId or expenseCategoryId');
    }
    if (dto.incomeCategoryId && dto.expenseCategoryId) {
      throw new BadRequestException('Set only one of incomeCategoryId or expenseCategoryId, not both');
    }
  }

  findAll(params: { year?: number } = {}) {
    return this.prisma.budget.findMany({
      where: params.year ? { year: params.year } : {},
      include: budgetInclude,
      orderBy: [{ year: 'desc' }],
    });
  }

  async findOne(id: string) {
    const budget = await this.prisma.budget.findUnique({ where: { id }, include: budgetInclude });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    return budget;
  }

  create(dto: CreateBudgetDto) {
    this.validate(dto);
    return this.prisma.budget.create({ data: dto, include: budgetInclude });
  }

  async update(id: string, dto: UpdateBudgetDto) {
    const existing = await this.findOne(id);
    this.validate({
      incomeCategoryId: dto.incomeCategoryId ?? existing.incomeCategoryId ?? undefined,
      expenseCategoryId: dto.expenseCategoryId ?? existing.expenseCategoryId ?? undefined,
    });
    return this.prisma.budget.update({ where: { id }, data: dto, include: budgetInclude });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.budget.delete({ where: { id } });
    return { message: 'Budget deleted' };
  }

  /** Budget vs. actual for a given year — one row per budgeted category. */
  async getVsActual(year: number) {
    const budgets = await this.prisma.budget.findMany({ where: { year }, include: budgetInclude });

    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
    const transactions = await this.prisma.financialTransaction.findMany({
      where: { date: { gte: yearStart, lte: yearEnd } },
      select: { type: true, amount: true, incomeCategoryId: true, expenseCategoryId: true, fundId: true },
    });

    return budgets.map((b) => {
      const actual = transactions
        .filter((t) =>
          b.incomeCategoryId
            ? t.type === FinancialTransactionType.INCOME &&
              t.incomeCategoryId === b.incomeCategoryId &&
              (!b.fundId || t.fundId === b.fundId)
            : t.type === FinancialTransactionType.EXPENSE &&
              t.expenseCategoryId === b.expenseCategoryId &&
              (!b.fundId || t.fundId === b.fundId),
        )
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const budgeted = Number(b.amount);
      return {
        id: b.id,
        year: b.year,
        fund: b.fund,
        category: b.incomeCategory ?? b.expenseCategory,
        categoryType: b.incomeCategoryId ? ('INCOME' as const) : ('EXPENSE' as const),
        budgeted,
        actual,
        variance: b.incomeCategoryId ? actual - budgeted : budgeted - actual,
      };
    });
  }
}
