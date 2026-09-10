import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpsertMembershipStatusDto } from './dto/upsert-membership-status.dto';
import { UpdateMembershipStatusDto } from './dto/update-membership-status.dto';

@Injectable()
export class MembershipStatusesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.membershipStatus.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const status = await this.prisma.membershipStatus.findUnique({
      where: { id },
    });
    if (!status) {
      throw new NotFoundException('Membership status not found');
    }
    return status;
  }

  async create(dto: UpsertMembershipStatusDto) {
    const existing = await this.prisma.membershipStatus.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        'A membership status with this name already exists',
      );
    }
    return this.prisma.membershipStatus.create({ data: dto });
  }

  async update(id: string, dto: UpdateMembershipStatusDto) {
    await this.findOne(id);
    return this.prisma.membershipStatus.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    const inUse = await this.prisma.member.count({
      where: { membershipStatusId: id },
    });
    if (inUse > 0) {
      throw new BadRequestException(
        `Cannot delete: ${inUse} member(s) have this status. Deactivate it instead.`,
      );
    }
    await this.prisma.membershipStatus.delete({ where: { id } });
    return { message: 'Membership status deleted' };
  }
}
