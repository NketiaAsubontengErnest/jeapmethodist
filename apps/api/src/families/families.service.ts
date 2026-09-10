import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpsertFamilyDto } from './dto/upsert-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';
import { AddFamilyMemberDto } from './dto/add-family-member.dto';

const familyInclude = {
  members: {
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          profilePhotoUrl: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class FamiliesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { page: number; pageSize: number; search?: string }) {
    const { page, pageSize, search } = params;
    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.memberFamily.findMany({
        where,
        include: { _count: { select: { members: true } } },
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.memberFamily.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: string) {
    const family = await this.prisma.memberFamily.findUnique({
      where: { id },
      include: familyInclude,
    });
    if (!family) {
      throw new NotFoundException('Family not found');
    }
    return family;
  }

  create(dto: UpsertFamilyDto) {
    return this.prisma.memberFamily.create({
      data: dto,
      include: familyInclude,
    });
  }

  async update(id: string, dto: UpdateFamilyDto) {
    await this.findOne(id);
    return this.prisma.memberFamily.update({
      where: { id },
      data: dto,
      include: familyInclude,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.memberFamily.delete({ where: { id } });
    return { message: 'Family deleted' };
  }

  async addMember(familyId: string, dto: AddFamilyMemberDto) {
    await this.findOne(familyId);

    const existing = await this.prisma.familyMember.findUnique({
      where: { familyId_memberId: { familyId, memberId: dto.memberId } },
    });
    if (existing) {
      throw new ConflictException('This member already belongs to the family');
    }

    await this.prisma.familyMember.create({
      data: { familyId, memberId: dto.memberId, role: dto.role },
    });
    return this.findOne(familyId);
  }

  async removeMember(familyId: string, memberId: string) {
    await this.findOne(familyId);
    await this.prisma.familyMember.delete({
      where: { familyId_memberId: { familyId, memberId } },
    });
    return this.findOne(familyId);
  }
}
