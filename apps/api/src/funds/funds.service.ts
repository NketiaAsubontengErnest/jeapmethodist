import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { FinancialTransactionType, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateFundDto } from './dto/create-fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';

@Injectable()
export class FundsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const funds = await this.prisma.fund.findMany({ orderBy: { name: 'asc' } });
    const totals = await this.prisma.financialTransaction.groupBy({
      by: ['fundId', 'type'],
      where: { fundId: { not: null } },
      _sum: { amount: true },
    });

    const balanceByFund = new Map<string, number>();
    for (const row of totals) {
      if (!row.fundId) continue;
      const amount = Number(row._sum.amount ?? 0) * (row.type === FinancialTransactionType.INCOME ? 1 : -1);
      balanceByFund.set(row.fundId, (balanceByFund.get(row.fundId) ?? 0) + amount);
    }

    return funds.map((f) => ({ ...f, balance: balanceByFund.get(f.id) ?? 0 }));
  }

  async findOne(id: string) {
    const fund = await this.prisma.fund.findUnique({ where: { id } });
    if (!fund) {
      throw new NotFoundException('Fund not found');
    }
    return fund;
  }

  async create(dto: CreateFundDto) {
    try {
      return await this.prisma.fund.create({ data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('A fund with this name already exists');
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateFundDto) {
    await this.findOne(id);
    return this.prisma.fund.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.fund.delete({ where: { id } });
    return { message: 'Fund deleted' };
  }
}
