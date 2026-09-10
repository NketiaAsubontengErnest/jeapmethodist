import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePrayerRequestDto } from './dto/create-prayer-request.dto';
import { UpdatePrayerRequestDto } from './dto/update-prayer-request.dto';

@Injectable()
export class PrayerRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePrayerRequestDto) {
    return this.prisma.prayerRequest.create({
      data: dto.isAnonymous ? { request: dto.request, isAnonymous: true } : dto,
    });
  }

  findAll() {
    return this.prisma.prayerRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdatePrayerRequestDto) {
    const existing = await this.prisma.prayerRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Prayer request not found');
    }
    return this.prisma.prayerRequest.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
