import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpsertMemberCategoryDto } from './dto/upsert-member-category.dto';
import { UpdateMemberCategoryDto } from './dto/update-member-category.dto';

@Injectable()
export class MemberCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.memberCategory.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.memberCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Member category not found');
    }
    return category;
  }

  async create(dto: UpsertMemberCategoryDto) {
    const existing = await this.prisma.memberCategory.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        'A member category with this name already exists',
      );
    }
    return this.prisma.memberCategory.create({ data: dto });
  }

  async update(id: string, dto: UpdateMemberCategoryDto) {
    await this.findOne(id);
    return this.prisma.memberCategory.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const inUse = await this.prisma.member.count({
      where: { memberCategoryId: id },
    });
    if (inUse > 0) {
      throw new BadRequestException(
        `Cannot delete: ${inUse} member(s) are assigned to this category. Deactivate it instead.`,
      );
    }
    await this.prisma.memberCategory.delete({ where: { id } });
    return { message: 'Member category deleted' };
  }
}
