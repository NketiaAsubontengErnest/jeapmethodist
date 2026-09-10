import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateLiabilityDto } from './dto/create-liability.dto';
import { UpdateLiabilityDto } from './dto/update-liability.dto';

@Injectable()
export class LiabilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(params: { isSettled?: boolean } = {}) {
    const where: Prisma.LiabilityWhereInput =
      params.isSettled !== undefined ? { isSettled: params.isSettled } : {};
    return this.prisma.liability.findMany({ where, orderBy: [{ isSettled: 'asc' }, { dueDate: 'asc' }] });
  }

  async findOne(id: string) {
    const liability = await this.prisma.liability.findUnique({ where: { id } });
    if (!liability) {
      throw new NotFoundException('Liability not found');
    }
    return liability;
  }

  create(dto: CreateLiabilityDto) {
    return this.prisma.liability.create({ data: dto });
  }

  async update(id: string, dto: UpdateLiabilityDto) {
    const existing = await this.findOne(id);
    const settledDate =
      dto.isSettled === true && !existing.isSettled
        ? new Date()
        : dto.isSettled === false
          ? null
          : undefined;
    return this.prisma.liability.update({
      where: { id },
      data: { ...dto, ...(settledDate !== undefined ? { settledDate } : {}) },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.liability.delete({ where: { id } });
    return { message: 'Liability deleted' };
  }
}
