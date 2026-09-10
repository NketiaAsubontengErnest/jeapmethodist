import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpsertExpenseCategoryDto } from './dto/upsert-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Injectable()
export class ExpenseCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.expenseCategory.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Expense category not found');
    }
    return category;
  }

  async create(dto: UpsertExpenseCategoryDto) {
    const existing = await this.prisma.expenseCategory.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        'An expense category with this name already exists',
      );
    }
    return this.prisma.expenseCategory.create({ data: dto });
  }

  async update(id: string, dto: UpdateExpenseCategoryDto) {
    await this.findOne(id);
    return this.prisma.expenseCategory.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const inUse = await this.prisma.financialTransaction.count({
      where: { expenseCategoryId: id },
    });
    if (inUse > 0) {
      throw new BadRequestException(
        `Cannot delete: ${inUse} transaction(s) use this category. Deactivate it instead.`,
      );
    }
    await this.prisma.expenseCategory.delete({ where: { id } });
    return { message: 'Expense category deleted' };
  }
}
