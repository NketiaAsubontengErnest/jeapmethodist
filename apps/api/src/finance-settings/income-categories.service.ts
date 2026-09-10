import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpsertIncomeCategoryDto } from './dto/upsert-income-category.dto';
import { UpdateIncomeCategoryDto } from './dto/update-income-category.dto';

@Injectable()
export class IncomeCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.incomeCategory.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.incomeCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Income category not found');
    }
    return category;
  }

  async create(dto: UpsertIncomeCategoryDto) {
    const existing = await this.prisma.incomeCategory.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        'An income category with this name already exists',
      );
    }
    return this.prisma.incomeCategory.create({ data: dto });
  }

  async update(id: string, dto: UpdateIncomeCategoryDto) {
    await this.findOne(id);
    return this.prisma.incomeCategory.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const inUse = await this.prisma.financialTransaction.count({
      where: { incomeCategoryId: id },
    });
    if (inUse > 0) {
      throw new BadRequestException(
        `Cannot delete: ${inUse} transaction(s) use this category. Deactivate it instead.`,
      );
    }
    await this.prisma.incomeCategory.delete({ where: { id } });
    return { message: 'Income category deleted' };
  }
}
