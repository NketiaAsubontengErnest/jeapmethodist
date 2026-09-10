import { Injectable, NotFoundException } from '@nestjs/common';
import { FinancialTransactionType, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UpsertOfferingSessionDto } from './dto/upsert-offering-session.dto';
import { UpdateOfferingSessionDto } from './dto/update-offering-session.dto';
import { AddOfferingLineDto } from './dto/add-offering-line.dto';

const sessionInclude = {
  programmeType: true,
  recordedByUser: { select: { id: true, firstName: true, lastName: true } },
  transactions: {
    include: { incomeCategory: true },
    orderBy: { createdAt: 'asc' as const },
  },
} as const;

export interface FindAllOfferingSessionsParams {
  page: number;
  pageSize: number;
  programmeTypeId?: string;
  fromDate?: Date;
  toDate?: Date;
}

@Injectable()
export class OfferingSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: FindAllOfferingSessionsParams) {
    const { page, pageSize, programmeTypeId, fromDate, toDate } = params;

    const where: Prisma.OfferingSessionWhereInput = {
      ...(programmeTypeId ? { programmeTypeId } : {}),
      ...(fromDate || toDate
        ? {
            sessionDate: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.offeringSession.findMany({
        where,
        include: sessionInclude,
        orderBy: { sessionDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.offeringSession.count({ where }),
    ]);

    return {
      items: items.map((session) => ({
        ...session,
        total: session.transactions.reduce(
          (sum, t) => sum + Number(t.amount),
          0,
        ),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const session = await this.prisma.offeringSession.findUnique({
      where: { id },
      include: sessionInclude,
    });
    if (!session) {
      throw new NotFoundException('Offering session not found');
    }
    return session;
  }

  create(dto: UpsertOfferingSessionDto, recordedByUserId: string) {
    return this.prisma.offeringSession.create({
      data: { ...dto, recordedByUserId },
      include: sessionInclude,
    });
  }

  async update(id: string, dto: UpdateOfferingSessionDto) {
    await this.findOne(id);
    return this.prisma.offeringSession.update({
      where: { id },
      data: dto,
      include: sessionInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // Transactions are preserved (offeringSessionId set to null) — a financial
    // record must never disappear just because its grouping header was removed.
    await this.prisma.offeringSession.delete({ where: { id } });
    return {
      message: 'Offering session deleted. Its recorded transactions were kept.',
    };
  }

  async addLine(
    sessionId: string,
    dto: AddOfferingLineDto,
    recordedByUserId: string,
  ) {
    const session = await this.findOne(sessionId);

    await this.prisma.financialTransaction.create({
      data: {
        type: FinancialTransactionType.INCOME,
        date: session.sessionDate,
        amount: dto.amount,
        incomeCategoryId: dto.incomeCategoryId,
        offeringSessionId: sessionId,
        notes: dto.notes,
        recordedByUserId,
      },
    });

    return this.findOne(sessionId);
  }

  async removeLine(sessionId: string, transactionId: string) {
    const transaction = await this.prisma.financialTransaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction || transaction.offeringSessionId !== sessionId) {
      throw new NotFoundException(
        'Transaction not found on this offering session',
      );
    }
    await this.prisma.financialTransaction.delete({
      where: { id: transactionId },
    });
    return this.findOne(sessionId);
  }
}
