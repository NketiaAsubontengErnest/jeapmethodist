import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';
import { AddMinistryMemberDto } from './dto/add-ministry-member.dto';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class MinistriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  findPublic() {
    return this.prisma.ministry.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        meetingSchedule: true,
        meetingVenue: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findPublicBySlug(slug: string) {
    const ministry = await this.prisma.ministry.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        meetingSchedule: true,
        meetingVenue: true,
        isActive: true,
        leaderMember: { select: { firstName: true, lastName: true } },
        assistantLeaderMember: { select: { firstName: true, lastName: true } },
        _count: { select: { members: true } },
      },
    });

    if (!ministry || !ministry.isActive) {
      throw new NotFoundException('Ministry not found');
    }

    return ministry;
  }

  findAll() {
    return this.prisma.ministry.findMany({
      include: {
        leaderMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        assistantLeaderMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        _count: { select: { members: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const ministry = await this.prisma.ministry.findUnique({
      where: { id },
      include: {
        leaderMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            membershipNumber: true,
          },
        },
        assistantLeaderMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            membershipNumber: true,
          },
        },
        members: {
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                membershipNumber: true,
                phone: true,
                email: true,
                gender: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ministry) {
      throw new NotFoundException('Ministry not found');
    }

    return ministry;
  }

  async create(dto: CreateMinistryDto, actorUserId?: string) {
    const slug = slugify(dto.name);
    const existing = await this.prisma.ministry.findFirst({
      where: { OR: [{ name: dto.name }, { slug }] },
    });

    if (existing) {
      throw new ConflictException('A ministry with this name already exists');
    }

    const ministry = await this.prisma.ministry.create({
      data: {
        ...dto,
        slug,
      },
    });

    await this.auditService.record({
      userId: actorUserId,
      action: 'ministry.create',
      module: 'ministry',
      entityType: 'Ministry',
      entityId: ministry.id,
      newValue: { name: ministry.name },
    });

    return ministry;
  }

  async update(id: string, dto: UpdateMinistryDto, actorUserId?: string) {
    const existing = await this.findOne(id);

    let slug = existing.slug;
    if (dto.name && dto.name !== existing.name) {
      slug = slugify(dto.name);
      const duplicate = await this.prisma.ministry.findFirst({
        where: { OR: [{ name: dto.name }, { slug }], NOT: { id } },
      });
      if (duplicate) {
        throw new ConflictException('A ministry with this name already exists');
      }
    }

    const updated = await this.prisma.ministry.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.name ? { slug } : {}),
      },
    });

    await this.auditService.record({
      userId: actorUserId,
      action: 'ministry.update',
      module: 'ministry',
      entityType: 'Ministry',
      entityId: id,
      previousValue: { name: existing.name, isActive: existing.isActive },
      newValue: { name: updated.name, isActive: updated.isActive },
    });

    return updated;
  }

  async remove(id: string, actorUserId?: string) {
    const ministry = await this.findOne(id);
    await this.prisma.ministry.delete({ where: { id } });

    await this.auditService.record({
      userId: actorUserId,
      action: 'ministry.delete',
      module: 'ministry',
      entityType: 'Ministry',
      entityId: id,
      previousValue: { name: ministry.name },
    });

    return { message: 'Ministry deleted successfully' };
  }

  async addMember(
    ministryId: string,
    dto: AddMinistryMemberDto,
    actorUserId?: string,
  ) {
    await this.findOne(ministryId);

    const member = await this.prisma.member.findUnique({
      where: { id: dto.memberId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const existingRelation = await this.prisma.ministryMember.findUnique({
      where: {
        ministryId_memberId: {
          ministryId,
          memberId: dto.memberId,
        },
      },
    });

    if (existingRelation) {
      throw new ConflictException(
        'Member is already enrolled in this ministry',
      );
    }

    const record = await this.prisma.ministryMember.create({
      data: {
        ministryId,
        memberId: dto.memberId,
        roleInMinistry: dto.roleInMinistry || 'Member',
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            membershipNumber: true,
          },
        },
      },
    });

    await this.auditService.record({
      userId: actorUserId,
      action: 'ministry.member_add',
      module: 'ministry',
      entityType: 'MinistryMember',
      entityId: record.id,
      newValue: { ministryId, memberId: dto.memberId },
    });

    return record;
  }

  async removeMember(
    ministryId: string,
    memberId: string,
    actorUserId?: string,
  ) {
    const record = await this.prisma.ministryMember.findUnique({
      where: {
        ministryId_memberId: {
          ministryId,
          memberId,
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Member is not in this ministry');
    }

    await this.prisma.ministryMember.delete({
      where: { id: record.id },
    });

    await this.auditService.record({
      userId: actorUserId,
      action: 'ministry.member_remove',
      module: 'ministry',
      entityType: 'MinistryMember',
      entityId: record.id,
      previousValue: { ministryId, memberId },
    });

    return { message: 'Member removed from ministry' };
  }
}
