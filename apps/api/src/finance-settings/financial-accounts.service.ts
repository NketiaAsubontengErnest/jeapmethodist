import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpsertFinancialAccountDto } from './dto/upsert-financial-account.dto';
import { UpdateFinancialAccountDto } from './dto/update-financial-account.dto';

@Injectable()
export class FinancialAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.financialAccount.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const account = await this.prisma.financialAccount.findUnique({
      where: { id },
    });
    if (!account) {
      throw new NotFoundException('Financial account not found');
    }
    return account;
  }

  async create(dto: UpsertFinancialAccountDto) {
    const existing = await this.prisma.financialAccount.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        'A financial account with this name already exists',
      );
    }
    return this.prisma.financialAccount.create({ data: dto });
  }

  async update(id: string, dto: UpdateFinancialAccountDto) {
    await this.findOne(id);
    return this.prisma.financialAccount.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const inUse = await this.prisma.financialTransaction.count({
      where: { financialAccountId: id },
    });
    if (inUse > 0) {
      throw new BadRequestException(
        `Cannot delete: ${inUse} transaction(s) reference this account. Deactivate it instead.`,
      );
    }
    await this.prisma.financialAccount.delete({ where: { id } });
    return { message: 'Financial account deleted' };
  }
}
